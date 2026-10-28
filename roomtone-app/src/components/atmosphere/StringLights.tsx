'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';

// ─────────────────────────────────────────────────────────────────────────────
// StringLights — Warm fairy lights strung across the ceiling
// ─────────────────────────────────────────────────────────────────────────────

export default function StringLights() {
  const N = 34;

  const lights = useMemo(() =>
    Array.from({ length: N }, (_, i) => {
      const t = i / (N - 1);
      const sag = 4 * t * (1 - t) * 22; // catenary sag, peaks at center
      const palettes = [
        { color: '#FFB830', glow: '#FFC84080' },
        { color: '#FFCC50', glow: '#FFD06080' },
        { color: '#FFA828', glow: '#FFB83880' },
        { color: '#FFD870', glow: '#FFE08080' },
        { color: '#FFBE40', glow: '#FFCC5080' },
      ];
      const p = palettes[i % palettes.length];
      return {
        x: 0.5 + t * 99,   // 0.5% to 99.5%
        y: 7 + sag,
        color: p.color,
        glow: p.glow,
        duration: 1.8 + (i % 7) * 0.3,
        delay: (i * 0.18) % 4,
      };
    }),
  []);

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '55px',
        pointerEvents: 'none',
        zIndex: 22,
      }}
    >
      {/* Catenary wire */}
      <svg
        width="100%"
        height="55"
        viewBox="0 0 100 55"
        preserveAspectRatio="none"
        style={{ position: 'absolute', top: 0, left: 0 }}
      >
        <path
          d={`M 0.5 7 Q 50 ${7 + 22} 99.5 7`}
          stroke="rgba(50,32,12,0.28)"
          strokeWidth="0.28"
          fill="none"
        />
      </svg>

      {/* Bulbs */}
      {lights.map((light, i) => (
        <motion.div
          key={i}
          style={{
            position: 'absolute',
            left: `${light.x}%`,
            top: `${light.y}px`,
            transform: 'translateX(-50%)',
            width: '5px',
            height: '9px',
            borderRadius: '50% 50% 38% 38%',
            background: light.color,
            boxShadow: `0 0 8px 4px ${light.glow}, 0 0 20px 10px ${light.glow.replace('80', '28')}`,
          }}
          animate={{ opacity: [0.7, 1, 0.82, 1, 0.7] }}
          transition={{
            duration: light.duration,
            delay: light.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}
