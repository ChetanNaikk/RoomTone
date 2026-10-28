'use client';

import { motion } from 'framer-motion';

// ─────────────────────────────────────────────────────────────────────────────
// CoffeeSteam — Rising steam animation using SVG paths
// ─────────────────────────────────────────────────────────────────────────────

function SteamWisp({ delay, xOffset }: { delay: number; xOffset: number }) {
  return (
    <motion.path
      d={`M ${10 + xOffset} 30 Q ${5 + xOffset} 20 ${12 + xOffset} 12 Q ${18 + xOffset} 4 ${10 + xOffset} 0`}
      stroke="rgba(220,200,180,0.4)"
      strokeWidth="1.5"
      strokeLinecap="round"
      fill="none"
      initial={{ pathLength: 0, opacity: 0, y: 0 }}
      animate={{
        pathLength: [0, 1, 1],
        opacity: [0, 0.5, 0],
        y: [0, -8, -18],
        scaleX: [1, 1.2, 0.8],
      }}
      transition={{
        duration: 2.4,
        delay,
        repeat: Infinity,
        ease: 'easeOut',
      }}
    />
  );
}

export default function CoffeeSteam() {
  return (
    <div className="absolute" style={{ top: '-30px', left: '50%', transform: 'translateX(-50%)' }}>
      <svg width="30" height="30" viewBox="0 0 30 30" overflow="visible">
        <SteamWisp delay={0}   xOffset={0} />
        <SteamWisp delay={0.8} xOffset={8} />
        <SteamWisp delay={1.6} xOffset={-4} />
      </svg>
    </div>
  );
}
