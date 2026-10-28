'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

// ─────────────────────────────────────────────────────────────────────────────
// Home — The entry point to Roomtone
// ─────────────────────────────────────────────────────────────────────────────

export default function Home() {
  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      background: '#0D0804',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
      position: 'relative',
    }}>
      {/* Background — blurred room illustration */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/room-bg.png"
        alt=""
        aria-hidden="true"
        style={{
          position: 'absolute', inset: 0,
          width: '100%', height: '100%',
          objectFit: 'cover',
          filter: 'blur(28px) brightness(0.28) saturate(0.6)',
          transform: 'scale(1.08)',
          userSelect: 'none', pointerEvents: 'none',
        }}
      />

      {/* Vignette */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse 70% 70% at 50% 50%, transparent 30%, rgba(5,3,1,0.7) 100%)',
        pointerEvents: 'none',
      }} />

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, ease: [0.22, 0.61, 0.36, 1] }}
        style={{
          position: 'relative',
          zIndex: 2,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          gap: '0',
        }}
      >
        {/* Wordmark */}
        <motion.p
          initial={{ opacity: 0, letterSpacing: '0.4em' }}
          animate={{ opacity: 1, letterSpacing: '0.25em' }}
          transition={{ duration: 1.6, delay: 0.2 }}
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: '11px',
            fontWeight: 500,
            color: 'rgba(200,150,60,0.55)',
            letterSpacing: '0.25em',
            textTransform: 'uppercase',
            marginBottom: '20px',
          }}
        >Roomtone</motion.p>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.4 }}
          style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: 'clamp(38px, 6vw, 72px)',
            fontWeight: 300,
            color: 'rgba(242,232,217,0.92)',
            lineHeight: 1.15,
            letterSpacing: '0.01em',
            margin: '0 0 16px',
            maxWidth: '640px',
          }}
        >
          Share a moment,<br />not just music.
        </motion.h1>

        {/* Subline */}
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 0.55, y: 0 }}
          transition={{ duration: 1, delay: 0.65 }}
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: 'clamp(13px, 1.5vw, 16px)',
            fontWeight: 300,
            color: 'rgba(200,175,130,1)',
            lineHeight: 1.7,
            marginBottom: '52px',
            maxWidth: '400px',
          }}
        >
          Build a cozy room with music and memories.<br />
          Send the link. Let them sit inside it.
        </motion.p>

        {/* CTA buttons */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.9 }}
          style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', justifyContent: 'center' }}
        >
          {/* Primary CTA */}
          <Link href="/create" style={{ textDecoration: 'none' }}>
            <motion.div
              whileHover={{ scale: 1.04, background: 'rgba(200,140,40,0.28)' }}
              whileTap={{ scale: 0.97 }}
              style={{
                background: 'rgba(200,140,40,0.18)',
                border: '1px solid rgba(200,140,40,0.45)',
                borderRadius: '6px',
                padding: '14px 40px',
                color: 'rgba(230,185,80,0.95)',
                fontFamily: "'Inter', sans-serif",
                fontSize: '13px',
                fontWeight: 500,
                letterSpacing: '0.12em',
                cursor: 'pointer',
                transition: 'background 0.25s ease',
              }}
            >
              CREATE A ROOM
            </motion.div>
          </Link>

          {/* Secondary — view demo */}
          <Link href="/room/an-evening-with-you-ehf0o" style={{ textDecoration: 'none' }}>
            <motion.div
              whileHover={{ scale: 1.04, background: 'rgba(255,255,255,0.06)' }}
              whileTap={{ scale: 0.97 }}
              style={{
                background: 'transparent',
                border: '1px solid rgba(255,242,218,0.12)',
                borderRadius: '6px',
                padding: '14px 32px',
                color: 'rgba(200,175,130,0.6)',
                fontFamily: "'Inter', sans-serif",
                fontSize: '13px',
                fontWeight: 400,
                letterSpacing: '0.10em',
                cursor: 'pointer',
                transition: 'background 0.25s ease',
              }}
            >
              VIEW A DEMO ROOM
            </motion.div>
          </Link>
        </motion.div>
      </motion.div>

      {/* Footer hint */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.25 }}
        transition={{ duration: 1, delay: 1.6 }}
        style={{
          position: 'absolute',
          bottom: '28px',
          fontFamily: "'Inter', sans-serif",
          fontSize: '10px',
          color: 'rgba(200,175,130,1)',
          letterSpacing: '0.1em',
          textAlign: 'center',
        }}
      >
        no account needed · share with a link · 4 songs max
      </motion.p>
    </div>
  );
}
