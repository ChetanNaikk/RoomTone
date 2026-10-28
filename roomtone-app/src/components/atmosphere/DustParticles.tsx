'use client';

import { useEffect, useRef } from 'react';

// ─────────────────────────────────────────────────────────────────────────────
// DustParticles — Floating dust motes rendered on canvas
// Soft, slow-moving particles that catch the light
// ─────────────────────────────────────────────────────────────────────────────

interface Mote {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  phase: number;
  phaseSpeed: number;
}

export default function DustParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const motesRef = useRef<Mote[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const initMotes = () => {
      const w = canvas.width;
      const h = canvas.height;
      motesRef.current = Array.from({ length: 35 }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.15,
        vy: -0.05 - Math.random() * 0.12,
        size: 1 + Math.random() * 2.5,
        opacity: 0.1 + Math.random() * 0.35,
        phase: Math.random() * Math.PI * 2,
        phaseSpeed: 0.005 + Math.random() * 0.015,
      }));
    };

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      initMotes();
    };

    resize();
    window.addEventListener('resize', resize);

    let time = 0;
    const render = () => {
      time += 0.01;
      const w = canvas.width;
      const h = canvas.height;

      ctx.clearRect(0, 0, w, h);

      motesRef.current.forEach((m) => {
        m.phase += m.phaseSpeed;
        m.x += m.vx + Math.sin(m.phase) * 0.3;
        m.y += m.vy;

        if (m.y < -5) { m.y = h + 5; m.x = Math.random() * w; }
        if (m.x < -5) m.x = w + 5;
        if (m.x > w + 5) m.x = -5;

        const pulseOpacity = m.opacity * (0.5 + 0.5 * Math.sin(m.phase * 0.7));

        ctx.save();
        ctx.globalAlpha = pulseOpacity;

        // Soft glow gradient for each mote
        const g = ctx.createRadialGradient(m.x, m.y, 0, m.x, m.y, m.size * 2);
        g.addColorStop(0, 'rgba(255, 230, 180, 0.8)');
        g.addColorStop(1, 'transparent');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(m.x, m.y, m.size * 2, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      });

      animRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 15 }}
    />
  );
}
