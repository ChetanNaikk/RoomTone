'use client';

import { motion } from 'framer-motion';

interface LampProps {
  intensity: number; // 0–1, driven by scene
}

// ─────────────────────────────────────────────────────────────────────────────
// Lamp — Warm table lamp with flickering glow
// ─────────────────────────────────────────────────────────────────────────────

export default function Lamp({ intensity }: LampProps) {
  const glowAlpha = 0.4 + intensity * 0.5;

  return (
    <div className="relative" style={{ width: '60px', height: '120px', flexShrink: 0 }}>
      {/* Ambient glow behind lamp (radial light cone) */}
      <motion.div
        className="absolute"
        style={{
          bottom: '60px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '180px',
          height: '200px',
          background: `radial-gradient(ellipse at 50% 0%, rgba(255, 200, 80, ${glowAlpha}) 0%, transparent 70%)`,
          pointerEvents: 'none',
          zIndex: -1,
        }}
        animate={{ opacity: [1, 0.88, 0.95, 0.82, 1] }}
        transition={{ duration: 4.5, repeat: Infinity, times: [0, 0.3, 0.5, 0.7, 1] }}
      />

      {/* Lamp shade */}
      <div
        className="absolute"
        style={{
          top: '0px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '50px',
          height: '36px',
          background: 'linear-gradient(180deg, #C8A060 0%, #E8C080 30%, #D4A050 70%, #B88040 100%)',
          clipPath: 'polygon(10% 0%, 90% 0%, 100% 100%, 0% 100%)',
          boxShadow: 'inset 0 -4px 8px rgba(255,200,80,0.3)',
        }}
      />

      {/* Shade inner glow */}
      <motion.div
        className="absolute"
        style={{
          top: '4px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '42px',
          height: '28px',
          background: `rgba(255, 200, 80, ${glowAlpha})`,
          clipPath: 'polygon(12% 0%, 88% 0%, 98% 100%, 2% 100%)',
          filter: 'blur(4px)',
        }}
        animate={{ opacity: [0.7, 1, 0.85, 1, 0.9, 0.7] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Lamp stem */}
      <div
        className="absolute"
        style={{
          top: '36px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '6px',
          height: '50px',
          background: 'linear-gradient(90deg, #8B6020, #C49040, #8B6020)',
          borderRadius: '2px',
        }}
      />

      {/* Lamp base */}
      <div
        className="absolute"
        style={{
          bottom: '0px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '40px',
          height: '14px',
          background: 'linear-gradient(180deg, #B87830, #8B5C20)',
          borderRadius: '50% 50% 4px 4px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
        }}
      />

      {/* Base shadow on table */}
      <div
        className="absolute"
        style={{
          bottom: '-4px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '50px',
          height: '6px',
          background: 'rgba(0,0,0,0.2)',
          borderRadius: '50%',
          filter: 'blur(3px)',
        }}
      />
    </div>
  );
}
