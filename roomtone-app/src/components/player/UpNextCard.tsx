'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import type { Track } from '@/types/track';

interface UpNextCardProps {
  nextTrack: Track | null;
  onPlayNext: () => void;
}

export default function UpNextCard({ nextTrack, onPlayNext }: UpNextCardProps) {
  const [artFailed, setArtFailed] = useState(false);

  const title = nextTrack?.title ?? 'Kiss the Rain';
  const artist = nextTrack?.artist ?? 'Yiruma';
  const artSrc = nextTrack?.albumArt ?? 'https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/0d/42/3e/0d423e86-05b9-2d53-fdb3-03c88d2c2536/cover.jpg/300x300bb.jpg';

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.3 }}
      style={{
        width: 'min(860px, 92vw)',
        height: '96px',
        borderRadius: '24px',
        background: 'rgba(55, 35, 18, 0.65)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        boxShadow: '0 8px 30px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        zIndex: 50,
        boxSizing: 'border-box',
        flexShrink: 0,
      }}
    >
      {/* Left side: Album Art + Song Info */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', minWidth: 0 }}>
        {/* Album Artwork */}
        <div style={{
          width: '64px', height: '64px',
          borderRadius: '14px',
          overflow: 'hidden',
          flexShrink: 0,
          boxShadow: '0 4px 12px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,242,218,0.15)',
          background: '#3B2A20',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {artFailed || !artSrc ? (
            <span style={{ fontSize: '24px', color: '#FFF2DA', opacity: 0.4 }}>♪</span>
          ) : (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={artSrc}
              alt={title}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              onError={() => setArtFailed(true)}
            />
          )}
        </div>

        {/* Text Section */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', minWidth: 0 }}>
          <span style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: '11px',
            fontWeight: 500,
            color: '#FFF2DA',
            opacity: 0.7,
            letterSpacing: '0.04em',
          }}>
            Up Next
          </span>
          <span style={{
            fontFamily: "'Quicksand', 'Nunito', sans-serif",
            fontSize: 'clamp(18px, 2vw, 24px)',
            fontWeight: 600,
            color: '#FFF2DA',
            lineHeight: 1.15,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}>
            {title}
          </span>
          <span style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: '14px',
            fontWeight: 400,
            color: '#FFF2DA',
            opacity: 0.7,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}>
            {artist}
          </span>
        </div>
      </div>

      {/* Right Side: Circular Golden Play Button + Queue Button */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexShrink: 0 }}>
        {/* Queue Button */}
        <button style={{
          background: 'none',
          border: 'none',
          color: '#FFF2DA',
          opacity: 0.7,
          fontSize: '20px',
          cursor: 'pointer',
          padding: '6px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'opacity 0.2s ease',
        }}
          onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
          onMouseLeave={e => (e.currentTarget.style.opacity = '0.7')}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="8" y1="6" x2="21" y2="6"/>
            <line x1="8" y1="12" x2="21" y2="12"/>
            <line x1="8" y1="18" x2="21" y2="18"/>
            <line x1="3" y1="6" x2="3.01" y2="6"/>
            <line x1="3" y1="12" x2="3.01" y2="12"/>
            <line x1="3" y1="18" x2="3.01" y2="18"/>
          </svg>
        </button>

        {/* Circular Golden Play Button (54px) */}
        <motion.button
          onClick={onPlayNext}
          style={{
            width: '54px', height: '54px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #FFB04A 0%, #D89C57 100%)',
            border: '1px solid rgba(255, 242, 218, 0.4)',
            boxShadow: '0 6px 18px rgba(216,156,87,0.4), inset 0 1px 0 rgba(255,255,255,0.4)',
            color: '#2F1E14',
            cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" style={{ marginLeft: '2px' }}>
            <path d="M8 5v14l11-7z"/>
          </svg>
        </motion.button>
      </div>
    </motion.div>
  );
}
