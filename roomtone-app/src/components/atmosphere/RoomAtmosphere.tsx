'use client';

import { useRef } from 'react';
import { motion } from 'framer-motion';

// ─────────────────────────────────────────────────────────────────────────────
// AnimatedCurtains — sheer white curtains that sway gently
// ─────────────────────────────────────────────────────────────────────────────
export function AnimatedCurtains({ swayIntensity = 1 }: { swayIntensity?: number }) {
  const amt = swayIntensity;

  const Curtain = ({ side }: { side: 'left' | 'right' }) => (
    <motion.div
      style={{
        position: 'absolute',
        top: 0,
        ...(side === 'left' ? { left: 0, transformOrigin: 'top left' } : { right: 0, transformOrigin: 'top right' }),
        width: '22%',
        height: '100%',
        zIndex: 6,
        pointerEvents: 'none',
      }}
      animate={{ skewX: [0, amt * 0.7, 0, -amt * 0.5, 0.2, 0] }}
      transition={{
        duration: 8 + (side === 'right' ? 1.5 : 0),
        repeat: Infinity,
        ease: 'easeInOut',
        delay: side === 'right' ? 1.2 : 0,
      }}
    >
      {/* Main curtain fabric — fades to transparent toward window */}
      <div style={{
        position: 'absolute', inset: 0,
        background: side === 'left'
          ? 'linear-gradient(to right, rgba(248,244,228,0.96) 0%, rgba(245,240,220,0.88) 35%, rgba(240,235,210,0.55) 65%, rgba(235,228,205,0.18) 85%, transparent 100%)'
          : 'linear-gradient(to left, rgba(248,244,228,0.96) 0%, rgba(245,240,220,0.88) 35%, rgba(240,235,210,0.55) 65%, rgba(235,228,205,0.18) 85%, transparent 100%)',
      }}>
        {/* Fabric gathering folds */}
        {[20, 42, 63, 82].map(p => (
          <div key={p} style={{
            position: 'absolute', top: 0, bottom: 0,
            left: `${p}%`, width: '1px',
            background: 'rgba(185,160,115,0.2)',
          }} />
        ))}
      </div>

      {/* Tie-back hold at 44% */}
      <div style={{
        position: 'absolute', top: '44%',
        ...(side === 'left' ? { right: '10%' } : { left: '10%' }),
        width: '14px', height: '18px',
        background: 'radial-gradient(circle at 38% 35%, #E8D080, #B89040)',
        borderRadius: '50%',
        boxShadow: '0 2px 8px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,230,130,0.4)',
      }} />

      {/* Below tie-back: billowing drape */}
      <motion.div
        style={{
          position: 'absolute', top: '44%', bottom: 0,
          left: side === 'left' ? '-5%' : undefined,
          right: side === 'right' ? '-5%' : undefined,
          width: '115%',
          background: side === 'left'
            ? 'linear-gradient(120deg, rgba(248,244,228,0.82) 0%, rgba(240,234,215,0.4) 55%, rgba(235,228,205,0.12) 100%)'
            : 'linear-gradient(-120deg, rgba(248,244,228,0.82) 0%, rgba(240,234,215,0.4) 55%, rgba(235,228,205,0.12) 100%)',
          clipPath: side === 'left'
            ? 'polygon(0 0, 92% 12%, 105% 100%, 0 88%)'
            : 'polygon(8% 12%, 100% 0, 100% 88%, -5% 100%)',
        }}
        animate={{ skewX: [0, amt * -0.4, 0, amt * 0.3, 0] }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: side === 'right' ? 0.7 : 0.3,
        }}
      />
    </motion.div>
  );

  return (
    <>
      <Curtain side="left" />
      <Curtain side="right" />
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CoffeeSteam — steam wisps rising from coffee mug on the table
// ─────────────────────────────────────────────────────────────────────────────
export function CoffeeSteam({ x = 50, y = 50 }: { x?: number; y?: number }) {
  const wisps = [
    { delay: 0, xDrift: -6 },
    { delay: 0.7, xDrift: 5 },
    { delay: 1.3, xDrift: -3 },
  ];

  return (
    <div style={{
      position: 'absolute',
      left: `${x}%`, top: `${y}%`,
      width: '18px',
      pointerEvents: 'none', zIndex: 12,
    }}>
      {wisps.map((w, i) => (
        <motion.div
          key={i}
          style={{
            position: 'absolute',
            left: '50%',
            bottom: 0,
            width: '3px',
            height: '28px',
            borderRadius: '50%',
            background: 'linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.18) 40%, rgba(255,255,255,0.08) 80%, rgba(255,255,255,0) 100%)',
            transformOrigin: 'bottom center',
          }}
          animate={{
            y: [-28, -58, -82],
            x: [0, w.xDrift, w.xDrift * 1.5],
            opacity: [0, 0.6, 0],
            scaleX: [0.8, 1.6, 2.2],
          }}
          transition={{
            duration: 2.8,
            repeat: Infinity,
            delay: w.delay,
            ease: 'easeOut',
          }}
        />
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// StringLights — twinkling warm bulbs along the shelf
// ─────────────────────────────────────────────────────────────────────────────
export function StringLights({ count = 12 }: { count?: number }) {
  const bulbs = Array.from({ length: count }, (_, i) => ({
    x: (i + 0.5) * (100 / count),
    sag: Math.sin((i / (count - 1)) * Math.PI) * 12,
    delay: i * 0.15,
    brightness: 0.6 + Math.random() * 0.4,
  }));

  return (
    <svg
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 8 }}
      preserveAspectRatio="none"
    >
      {/* String line */}
      <path
        d={`M 0,0 ${bulbs.map(b => `L ${b.x},${b.sag}`).join(' ')} L 100,0`}
        fill="none"
        stroke="rgba(80,50,20,0.55)"
        strokeWidth="0.8"
        vectorEffect="non-scaling-stroke"
      />
      {/* Bulbs */}
      {bulbs.map((b, i) => (
        <motion.ellipse
          key={i}
          cx={`${b.x}%`}
          cy={`${b.sag + 3}%`}
          rx="1.4%"
          ry="2%"
          animate={{
            opacity: [b.brightness * 0.7, b.brightness, b.brightness * 0.6, b.brightness * 0.95],
            filter: [
              `drop-shadow(0 0 2px rgba(255,180,60,0.6))`,
              `drop-shadow(0 0 5px rgba(255,190,70,0.95))`,
              `drop-shadow(0 0 2px rgba(255,180,60,0.55))`,
              `drop-shadow(0 0 4px rgba(255,190,70,0.88))`,
            ],
          }}
          transition={{
            duration: 3.5 + i * 0.2,
            repeat: Infinity,
            delay: b.delay,
            ease: 'easeInOut',
          }}
          fill="rgba(255,195,70,0.9)"
        />
      ))}
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// LampGlow — warm pulsing light from floor lamp
// ─────────────────────────────────────────────────────────────────────────────
export function LampGlow({ isDark }: { isDark: boolean }) {
  if (!isDark) return null;
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.8 }}
      style={{
        position: 'absolute', inset: 0,
        pointerEvents: 'none', zIndex: 7,
        background: 'radial-gradient(ellipse 45% 55% at 18% 72%, rgba(255,175,55,0.22) 0%, rgba(255,145,30,0.08) 40%, transparent 75%)',
      }}
    >
      <motion.div
        style={{ position: 'absolute', inset: 0 }}
        animate={{
          background: [
            'radial-gradient(ellipse 45% 55% at 18% 72%, rgba(255,175,55,0.22) 0%, rgba(255,145,30,0.08) 40%, transparent 75%)',
            'radial-gradient(ellipse 45% 55% at 18% 72%, rgba(255,185,65,0.28) 0%, rgba(255,155,35,0.10) 40%, transparent 75%)',
            'radial-gradient(ellipse 45% 55% at 18% 72%, rgba(255,175,55,0.20) 0%, rgba(255,145,30,0.07) 40%, transparent 75%)',
          ],
        }}
        transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
      />
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// DustParticles — tiny floating dust motes in lamp light
// ─────────────────────────────────────────────────────────────────────────────
export function DustParticles({ count = 18, isDark }: { count?: number; isDark: boolean }) {
  const particles = useRef(
    Array.from({ length: count }, (_, i) => ({
      id: i,
      x: 5 + Math.random() * 35,   // cluster near lamp on left
      y: 45 + Math.random() * 40,
      size: 1 + Math.random() * 1.5,
      duration: 12 + Math.random() * 16,
      delay: Math.random() * -20,
      xDrift: (Math.random() - 0.5) * 8,
      yDrift: -(3 + Math.random() * 6),
    }))
  );

  if (!isDark) return null;

  return (
    <>
      {particles.current.map(p => (
        <motion.div
          key={p.id}
          style={{
            position: 'absolute',
            left: `${p.x}%`, top: `${p.y}%`,
            width: `${p.size}px`, height: `${p.size}px`,
            borderRadius: '50%',
            background: 'rgba(255,210,120,0.55)',
            pointerEvents: 'none', zIndex: 9,
          }}
          animate={{
            x: [0, p.xDrift, p.xDrift * 0.5, 0],
            y: [0, p.yDrift, p.yDrift * 1.8, p.yDrift * 2.5],
            opacity: [0, 0.6, 0.4, 0],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: 'easeInOut',
          }}
        />
      ))}
    </>
  );
}
