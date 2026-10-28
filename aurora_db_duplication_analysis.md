# Aurora RDS Duplication Analysis for Dev Environment

This document provides a detailed investigation and guide on how to provision another database identical to the current RDS database in the Development environment. 

---

## 1. Feasibility and Summary
**Yes, this is 100% possible.** 

Depending on your exact goals, there are two primary methods to accomplish this:

| Approach | Level | Cost | Isolation | Best Use Case |
| :--- | :--- | :--- | :--- | :--- |
| **Option A: Logical Duplication** | Postgres Database Level | **$0 extra** | Schema/Logical only | Testing schema migrations, seeding test data, or isolated application scopes within the same cluster. |
| **Option B: Infrastructure Duplication** | AWS Resource Level | **Double AWS Costs** (Proxy + Aurora v2 ACUs) | Complete network, security, IAM, and compute isolation | Simulating DR, load testing, or setting up a secondary dev sandbox (`dev2`). |

Both approaches are detailed below along with best practices.

---

## 2. Best Practices Checklist

If you proceed with **Option B (Infrastructure Duplication)**:

1. **Avoid Resource Name Collisions**: 
   Resources like IAM Roles and Security Groups must have globally unique names in the AWS account. Avoid using the raw `local.name_prefix_lower` without appending a distinct suffix (e.g. `-secondary` or `-dev2`).
2. **Reuse Existing Base Network Resources**:
   Do **not** recreate the VPC, Subnets, or the DB Subnet Group (`aws_db_subnet_group.aurora_subnet_group`). Reusing them saves configuration and IP address space.
3. **Isolate Security Groups**:
   While you *can* reuse the existing DB security group, creating a separate one (e.g., `aws_security_group.aurora_sg_secondary`) ensures you can audit and modify access to the secondary database without affecting the primary.
4. **Ensure Separate Master Password Secrets**:
   Since `manage_master_user_password` is set to `true`, AWS RDS automatically creates and manages a Secret in Secrets Manager. Simply using a unique `cluster_identifier` ensures AWS generates a separate, isolated secret.
5. **Cost Awareness**:
   Aurora Serverless v2 charges per ACU (Aurora Capacity Unit) consumed. Additionally, **RDS Proxies** have a persistent hourly billing rate per vCPU of the underlying database instance. Be prepared for a cost increase if you provision duplicate resources.

---

## 3. Implementation Guide: Option A (Logical Duplication)
If your application simply needs a separate database workspace and doesn't require compute or network isolation, you can create a second database *within the same Aurora cluster*.

### How to do it:
1. Connect to the existing RDS database cluster using the Bastion host or PGAdmin/Query Editor.
2. Run the SQL command to create a new database:
   ```sql
   CREATE DATABASE iris_db_secondary;
   ```
3. Create a new SSM parameter for the secondary database name, or modify the database name environment variable in the services you want to route to the new DB.
   - For example, in [ssm.tf](file:///d:/Projects/Orascoptic/oras-iri-iac/live/common/ssm.tf#L37), you could update the `"db_name"` mapping or create a parallel parameter.

---

## 4. Implementation Guide: Option B (Infrastructure Duplication)
To provision a fully isolated secondary Aurora PostgreSQL DB and RDS Proxy, you must duplicate and customize the blocks inside [rds.tf](file:///d:/Projects/Orascoptic/oras-iri-iac/live/common/rds.tf).

### Step 1: Create a new file for the secondary resources
Create a new file in `live/common` called `rds_secondary.tf`. This keeps the main `rds.tf` clean and makes it easy to tear down the secondary database later if needed.

### Step 2: Define the duplicate resources
Copy the required resource blocks from [rds.tf](file:///d:/Projects/Orascoptic/oras-iri-iac/live/common/rds.tf) and add a suffix (`_secondary` to Terraform resource labels and `-secondary` to AWS identifiers).

Below is the exact HCL configuration to include in `rds_secondary.tf`:

```hcl
# =============================================================================
# SECONDARY RDS Aurora PostgreSQL Infrastructure
# =============================================================================

# 1. Security Group for the Secondary Cluster
resource "aws_security_group" "aurora_sg_secondary" {
  name        = "${local.name_prefix_lower}-rds-sg-secondary"
  description = "Secondary Aurora PostgreSQL SG"
  vpc_id      = aws_vpc.main.id

  tags = merge(var.tags, { Name = "${local.name_prefix_lower}-rds-sg-secondary" })
}

# Ingress Rule from Secondary RDS Proxy
resource "aws_security_group_rule" "aurora_ingress_proxy_secondary" {
  type                     = "ingress"
  description              = "Allow PostgreSQL connections from Secondary RDS Proxy only"
  from_port                = var.db_access_port
  to_port                  = var.db_access_port
  protocol                 = var.common_protocol
  source_security_group_id = aws_security_group.rds_proxy_sg_secondary.id
  security_group_id        = aws_security_group.aurora_sg_secondary.id
}

# Ingress Rule from Bastion
resource "aws_security_group_rule" "aurora_ingress_bastion_secondary" {
  type                     = "ingress"
  description              = "Allow PostgreSQL connections from Bastion server"
  from_port                = var.db_access_port
  to_port                  = var.db_access_port
  protocol                 = var.common_protocol
  source_security_group_id = aws_security_group.bastion_sg.id
  security_group_id        = aws_security_group.aurora_sg_secondary.id
}

# 2. Secondary Aurora Cluster
resource "aws_rds_cluster" "aurora_cluster_secondary" {
  cluster_identifier = "${local.name_prefix_lower}-cluster-secondary"
  engine             = "aurora-postgresql"
  engine_version     = "16.8"

  master_username             = "iris_master"
  manage_master_user_password = true
  database_name               = "iris_db_secondary" # Custom naming convention for the DB name

  # Reuse existing Subnet Group
  db_subnet_group_name   = aws_db_subnet_group.aurora_subnet_group.name
  vpc_security_group_ids = [aws_security_group.aurora_sg_secondary.id]

  storage_encrypted   = true
  deletion_protection = false # Usually set to false for testing/secondary DBs to allow easy teardown
  apply_immediately   = var.rds_apply_immediately
  skip_final_snapshot = true

  iam_database_authentication_enabled = true
  enable_http_endpoint                = true

  backup_retention_period      = var.rds_backup_retention_period
  preferred_backup_window      = "03:04-03:34"
  preferred_maintenance_window = "wed:04:41-wed:05:11"

  db_cluster_parameter_group_name = "default.aurora-postgresql16"

  serverlessv2_scaling_configuration {
    max_capacity = var.aurora_max_capacity
    min_capacity = var.aurora_min_capacity
  }

  lifecycle {
    ignore_changes = [
      apply_immediately,
      engine_version,
      enable_global_write_forwarding,
      enable_local_write_forwarding,
      manage_master_user_password
    ]
  }

  tags = merge(var.tags, { Name = "${local.name_prefix_lower}-cluster-secondary" })
}

# 3. Secondary Writer Instance
resource "aws_rds_cluster_instance" "aurora_writer_secondary" {
  identifier                 = "${local.name_prefix_lower}-writer-secondary"
  cluster_identifier         = aws_rds_cluster.aurora_cluster_secondary.id
  instance_class             = "db.serverless"
  engine                     = aws_rds_cluster.aurora_cluster_secondary.engine
  engine_version             = aws_rds_cluster.aurora_cluster_secondary.engine_version
  publicly_accessible        = false
  auto_minor_version_upgrade = true
  apply_immediately          = var.rds_apply_immediately

  performance_insights_enabled = true

  tags = merge(var.tags, { Name = "${local.name_prefix_lower}-writer-secondary" })
}

# 4. Secondary RDS Proxy Security Group
resource "aws_security_group" "rds_proxy_sg_secondary" {
  name        = "${local.name_prefix_lower}-proxy-sg-secondary"
  description = "Secondary RDS Proxy SG"
  vpc_id      = aws_vpc.main.id

  tags = merge(var.tags, { Name = "${local.name_prefix_lower}-proxy-sg-secondary" })
}

# Secondary Proxy Ingress from Bastion
resource "aws_security_group_rule" "rds_proxy_ingress_bastion_secondary" {
  type                     = "ingress"
  description              = "Allow PostgreSQL connections from Bastion server"
  from_port                = var.db_access_port
  to_port                  = var.db_access_port
  protocol                 = var.common_protocol
  source_security_group_id = aws_security_group.bastion_sg.id
  security_group_id        = aws_security_group.rds_proxy_sg_secondary.id
}

# Secondary Proxy Egress to Aurora Secondary
resource "aws_security_group_rule" "rds_proxy_egress_aurora_secondary" {
  type                     = "egress"
  description              = "Allow PostgreSQL connections to secondary Aurora cluster only"
  from_port                = var.db_access_port
  to_port                  = var.db_access_port
  protocol                 = var.common_protocol
  source_security_group_id = aws_security_group.aurora_sg_secondary.id
  security_group_id        = aws_security_group.rds_proxy_sg_secondary.id
}

# Secondary Proxy Egress to Secrets Manager
resource "aws_security_group_rule" "rds_proxy_egress_https_secondary" {
  type              = "egress"
  description       = "Allow HTTPS to AWS Secrets Manager"
  from_port         = 443
  to_port           = 443
  protocol          = var.common_protocol
  cidr_blocks       = [var.vpc_cidr_range]
  security_group_id = aws_security_group.rds_proxy_sg_secondary.id
}

# 5. IAM Role and Policy for Secondary RDS Proxy
resource "aws_iam_role" "rds_proxy_role_secondary" {
  name = "${local.name_prefix_lower}-proxy-role-secondary"
  assume_role_policy = jsonencode({
    Version = "2012-10-17",
    Statement = [{
      Action    = "sts:AssumeRole",
      Effect    = "Allow",
      Principal = { Service = "rds.amazonaws.com" }
    }]
  })
  tags = var.tags
}

resource "aws_iam_role_policy" "rds_proxy_policy_secondary" {
  name = "${local.name_prefix_lower}-proxy-policy-secondary"
  role = aws_iam_role.rds_proxy_role_secondary.id

  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Sid      = "ReadMasterSecret",
        Effect   = "Allow",
        Action   = ["secretsmanager:GetSecretValue", "secretsmanager:DescribeSecret"],
        Resource = aws_rds_cluster.aurora_cluster_secondary.master_user_secret[0].secret_arn
      },
      {
        Sid    = "AllowIAMDatabaseConnect",
        Effect = "Allow",
        Action = "rds-db:connect",
        Resource = [
          "arn:aws:rds-db:${var.aws_region}:${var.account}:dbuser:${aws_rds_cluster.aurora_cluster_secondary.cluster_resource_id}/iris_app_user",
          "arn:aws:rds-db:${var.aws_region}:${var.account}:dbuser:${aws_rds_cluster.aurora_cluster_secondary.cluster_resource_id}/${var.student_service_db_user}"
        ]
      }
    ]
  })
}

# 6. Secondary RDS Proxy
resource "aws_db_proxy" "aurora_proxy_secondary" {
  name                   = "${local.name_prefix_lower}-proxy-secondary"
  engine_family          = "POSTGRESQL"
  role_arn               = aws_iam_role.rds_proxy_role_secondary.arn
  vpc_subnet_ids         = [for subnet in aws_subnet.private_subnet : subnet.id]
  vpc_security_group_ids = [aws_security_group.rds_proxy_sg_secondary.id]
  require_tls            = true
  idle_client_timeout    = 1800

  auth {
    auth_scheme               = "SECRETS"
    secret_arn                = aws_rds_cluster.aurora_cluster_secondary.master_user_secret[0].secret_arn
    iam_auth                  = "REQUIRED"
    client_password_auth_type = "POSTGRES_SCRAM_SHA_256"
  }

  lifecycle {
    ignore_changes = [auth]
  }

  depends_on = [aws_rds_cluster_instance.aurora_writer_secondary]
  tags       = merge(var.tags, { Name = "${local.name_prefix_lower}-proxy-secondary" })
}

# 7. Secondary Proxy Target Group & Attachment
resource "aws_db_proxy_target" "aurora_proxy_target_secondary" {
  db_proxy_name         = aws_db_proxy.aurora_proxy_secondary.name
  target_group_name     = "default"
  db_cluster_identifier = aws_rds_cluster.aurora_cluster_secondary.id
}

resource "aws_db_proxy_default_target_group" "default_secondary" {
  db_proxy_name = aws_db_proxy.aurora_proxy_secondary.name

  connection_pool_config {
    connection_borrow_timeout    = 120
    max_connections_percent      = 100
    max_idle_connections_percent = 50
  }
}
```

---

## 5. Integrating the Secondary DB with Your Services
Once the database is provisioned, you need to point your applications (ECS tasks, Lambdas, glue jobs) to it.

### 1. Update Secrets Manager Configurations
In [secrets_management.tf](file:///d:/Projects/Orascoptic/oras-iri-iac/live/common/secrets_management.tf#L12-L33), if you want to store the credentials of the secondary DB in Secrets Manager, you should define a secondary secret resource block:
```hcl
resource "aws_secretsmanager_secret" "database_credentials_secondary" {
  name = "${local.name_prefix_lower}-database-credentials-secondary"
  ...
}

resource "aws_secretsmanager_secret_version" "database_credentials_secondary" {
  secret_id = aws_secretsmanager_secret.database_credentials_secondary.id
  secret_string = jsonencode({
    username = "iris_master"
    password = "managed-by-rds"
    engine   = "postgres"
    host     = aws_db_proxy.aurora_proxy_secondary.endpoint # Points to secondary proxy endpoint
    port     = 5432
    dbname   = "iris_db_secondary"
  })
}
```

### 2. Update SSM Parameter Values
If you want to direct all default applications to the secondary DB, update the environment maps inside [ssm.tf](file:///d:/Projects/Orascoptic/oras-iri-iac/live/common/ssm.tf#L41) to reference `aws_db_proxy.aurora_proxy_secondary.endpoint` and `"iris_db_secondary"`:
```hcl
    # Database
    "db_name"        = "iris_db_secondary"
    "rds_proxy_host" = aws_db_proxy.aurora_proxy_secondary.endpoint
```
If you only want specific services to connect to the secondary DB, you should create separate SSM parameter entries for those specific services (e.g. `/oras/iri/dev/orders/db_host`) rather than updating the shared global map parameters.

### 3. Granting Lambdas IAM Access to the Secondary DB
Lambdas that authenticate to RDS using IAM authentication need access permissions. In roles defined across your lambda files (e.g., [student-service-lambda.tf](file:///d:/Projects/Orascoptic/oras-iri-iac/live/common/student-service-lambda.tf) or [user-service-lambda.tf](file:///d:/Projects/Orascoptic/oras-iri-iac/live/common/user-service-lambda.tf)), ensure the RDS IAM Policies allow connection to the secondary cluster resource ID:
```hcl
"arn:aws:rds-db:${var.aws_region}:${var.account}:dbuser:${aws_rds_cluster.aurora_cluster_secondary.cluster_resource_id}/iris_app_user"
```

---
