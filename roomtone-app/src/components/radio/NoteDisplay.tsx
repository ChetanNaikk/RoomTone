'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface NoteDisplayProps {
  note: string;
  isPlaying: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// NoteDisplay — Typewriter note on aged parchment paper.
// Reference: dark typewriter-ink text, large, centered, cream background.
// ─────────────────────────────────────────────────────────────────────────────

export default function NoteDisplay({ note, isPlaying }: NoteDisplayProps) {
  const [displayedText, setDisplayedText] = useState('');
  const [showCursor, setShowCursor] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const indexRef = useRef(0);

  useEffect(() => {
    if (!note || !isPlaying) {
      setDisplayedText('');
      setShowCursor(false);
      indexRef.current = 0;
      return;
    }

    setDisplayedText('');
    indexRef.current = 0;
    setShowCursor(true);

    const startDelay = setTimeout(() => {
      const type = () => {
        if (indexRef.current < note.length) {
          const char = note[indexRef.current];
          setDisplayedText((prev) => prev + char);
          indexRef.current++;
          const delay = ['.', '!', '?'].includes(char) ? 260
            : char === ',' ? 160
            : char === ' ' ? 52
            : 38 + Math.random() * 18;
          timeoutRef.current = setTimeout(type, delay);
        } else {
          setTimeout(() => setShowCursor(false), 3500);
        }
      };
      type();
    }, 800);

    return () => {
      clearTimeout(startDelay);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [note, isPlaying]);

  return (
    <div style={{
      width: '100%',
      height: '100%',
      // Aged parchment background — matches reference image exactly
      background: 'radial-gradient(ellipse at 48% 46%, #FFF8E6 0%, #F5EBD2 55%, #E6DABE 100%)',
      borderRadius: '3px',
      border: '1px solid rgba(120,88,45,0.35)',
      boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.12)',
      padding: '10px 12px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
      position: 'relative',
    }}>
      {/* Paper edge vignette */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'radial-gradient(ellipse 90% 85% at 50% 50%, transparent 55%, rgba(150,115,65,0.15) 100%)',
      }} />

      <AnimatePresence mode="wait">
        {!isPlaying ? (
          <motion.div
            key="idle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.3 } }}
            style={{
              fontFamily: "'Courier New', Courier, monospace",
              fontSize: '9px',
              color: 'rgba(80,55,25,0.4)',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              textAlign: 'center',
            }}
          >
            press play to begin...
          </motion.div>
        ) : (
          <motion.div
            key="note"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              fontFamily: "'Courier New', Courier, monospace",
              fontSize: 'clamp(10px, 1.5vw, 13px)',
              color: 'rgba(38,22,5,0.87)',
              lineHeight: 1.7,
              letterSpacing: '0.01em',
              wordBreak: 'break-word',
              textAlign: 'center',
              textShadow: '0.3px 0.3px 0 rgba(20,10,0,0.12)',
            }}
          >
            {displayedText}
            {showCursor && (
              <motion.span
                animate={{ opacity: [1, 0] }}
                transition={{ duration: 0.55, repeat: Infinity, repeatType: 'reverse' }}
                style={{ color: 'rgba(60,35,8,0.65)', marginLeft: '1px' }}
              >|</motion.span>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
