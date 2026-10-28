'use client';

import { motion } from 'framer-motion';
import type { CurtainMovement } from '@/types/scene';

interface CurtainsProps {
  movement: CurtainMovement;
}

// ─────────────────────────────────────────────────────────────────────────────
// Curtains — Draped fabric panels that sway with scene weather
// ─────────────────────────────────────────────────────────────────────────────

function CurtainPanel({ side, movement }: { side: 'left' | 'right'; movement: CurtainMovement }) {
  const swayVariants = {
    still: {
      skewX: [0, 0] as number[],
      transition: { duration: 8, repeat: Infinity, repeatType: 'mirror' as const },
    },
    gentle: {
      skewX: [0, 0.8, 0, -0.6, 0] as number[],
      transition: { duration: 8, repeat: Infinity, repeatType: 'loop' as const, ease: [0.4, 0, 0.6, 1] as [number, number, number, number] },
    },
    active: {
      skewX: [0, 1.5, -1.2, 1.0, -0.8, 0] as number[],
      transition: { duration: 5, repeat: Infinity, repeatType: 'loop' as const, ease: [0.4, 0, 0.6, 1] as [number, number, number, number] },
    },
  };

  const isLeft = side === 'left';

  return (
    <motion.div
      className="absolute top-0 bottom-0"
      style={{
        [isLeft ? 'left' : 'right']: 0,
        width: '18%',
        transformOrigin: isLeft ? 'top left' : 'top right',
        zIndex: 30,
      }}
      animate={swayVariants[movement]}
    >
      {/* Main fabric */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: isLeft
            ? `linear-gradient(to right,
                #4A3728 0%,
                #6B5040 20%,
                #7A5C48 35%,
                #5C4435 60%,
                #8B6B55 75%,
                #5C4435 100%
              )`
            : `linear-gradient(to left,
                #4A3728 0%,
                #6B5040 20%,
                #7A5C48 35%,
                #5C4435 60%,
                #8B6B55 75%,
                #5C4435 100%
              )`,
          backgroundSize: '100% 100%',
        }}
      >
        {/* Fabric fold lines */}
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              top: 0,
              bottom: 0,
              [isLeft ? 'left' : 'right']: `${15 + i * 18}%`,
              width: '1px',
              background: isLeft
                ? 'rgba(0,0,0,0.15)'
                : 'rgba(0,0,0,0.15)',
            }}
          />
        ))}

        {/* Bottom drape curve */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '80px',
            background: isLeft
              ? 'linear-gradient(to bottom right, transparent, rgba(0,0,0,0.2))'
              : 'linear-gradient(to bottom left, transparent, rgba(0,0,0,0.2))',
          }}
        />

        {/* Top gathering */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '40px',
            background: 'rgba(0,0,0,0.2)',
          }}
        />

        {/* Light edge highlight */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            [isLeft ? 'right' : 'left']: 0,
            width: '3px',
            background: 'rgba(255,220,180,0.08)',
          }}
        />
      </div>
    </motion.div>
  );
}

export default function Curtains({ movement }: CurtainsProps) {
  return (
    <>
      <CurtainPanel side="left" movement={movement} />
      <CurtainPanel side="right" movement={movement} />
    </>
  );
}
