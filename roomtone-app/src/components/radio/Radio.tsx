'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import NoteDisplay from './NoteDisplay';
import type { Track } from '@/types/track';

interface RadioProps {
  currentTrack: Track | null;
  isPlaying: boolean;
  isTransitioning: boolean;
  hasStarted: boolean;
  onTogglePlay: () => void;
  onNext: () => void;
  trackIndex: number;
  totalTracks: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Radio — Vintage 1960s-style wooden radio, the emotional centerpiece
// Includes speaker grill, frequency display, knobs, buttons, power LED
// ─────────────────────────────────────────────────────────────────────────────

function SpeakerGrill() {
  return (
    <div
      style={{
        width: '100%',
        height: '75px',
        background: 'linear-gradient(180deg, #2A1A0A 0%, #1A0D04 100%)',
        borderRadius: '4px',
        border: '1px solid rgba(180,100,30,0.3)',
        boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.7)',
        display: 'grid',
        gridTemplateColumns: 'repeat(18, 1fr)',
        gridTemplateRows: 'repeat(7, 1fr)',
        gap: '2px',
        padding: '6px',
        overflow: 'hidden',
      }}
    >
      {Array.from({ length: 126 }).map((_, i) => (
        <div
          key={i}
          style={{
            borderRadius: '50%',
            background: 'radial-gradient(circle, #3A2510 0%, #1A0D04 100%)',
            boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.8)',
            aspectRatio: '1',
          }}
        />
      ))}
    </div>
  );
}

function Knob({ label, rotationDeg, onClick }: { label: string; rotationDeg: number; onClick?: () => void }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
      <motion.div
        onClick={onClick}
        animate={{ rotate: rotationDeg }}
        transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
        style={{
          width: '36px',
          height: '36px',
          borderRadius: '50%',
          background: 'conic-gradient(from 0deg, #3A2510, #6A4020, #8B5E30, #6A4020, #3A2510)',
          boxShadow: '0 2px 8px rgba(0,0,0,0.6), inset 0 1px 0 rgba(180,120,60,0.2), 0 0 0 2px #2A1808',
          cursor: 'pointer',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
      >
        {/* Knob indicator line */}
        <div
          style={{
            position: 'absolute',
            top: '4px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '2px',
            height: '10px',
            background: 'rgba(220,180,80,0.8)',
            borderRadius: '1px',
            boxShadow: '0 0 4px rgba(220,180,80,0.5)',
          }}
        />
        {/* Knob grip ridges */}
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              width: '1px',
              height: '3px',
              background: 'rgba(255,200,100,0.15)',
              top: '1px',
              left: '50%',
              transformOrigin: '0 17px',
              transform: `translateX(-50%) rotate(${i * 45}deg)`,
            }}
          />
        ))}
      </motion.div>
      <span
        style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: '8px',
          color: 'rgba(180,140,60,0.6)',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
        }}
      >
        {label}
      </span>
    </div>
  );
}

function PowerLED({ isOn }: { isOn: boolean }) {
  return (
    <motion.div
      style={{
        width: '10px',
        height: '10px',
        borderRadius: '50%',
        background: isOn ? '#FF8C20' : '#3A2010',
        border: '1px solid rgba(120,60,20,0.5)',
      }}
      animate={
        isOn
          ? {
              boxShadow: [
                '0 0 4px 1px rgba(255,140,40,0.4)',
                '0 0 8px 3px rgba(255,140,40,0.7)',
                '0 0 4px 1px rgba(255,140,40,0.4)',
              ],
              opacity: [0.7, 1, 0.7],
            }
          : { boxShadow: 'none', opacity: 0.3 }
      }
      transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
    />
  );
}

function FrequencyNeedle({ position }: { position: number }) {
  // position 0–1 maps to needle sweep
  const x = 12 + position * 96;
  return (
    <motion.line
      x1={x}
      y1="4"
      x2={x}
      y2="22"
      stroke="rgba(255,140,40,0.9)"
      strokeWidth="1.5"
      strokeLinecap="round"
      animate={{ x1: x, x2: x }}
      transition={{ duration: 0.8, ease: 'easeInOut' }}
    />
  );
}

export default function Radio({
  currentTrack,
  isPlaying,
  isTransitioning,
  hasStarted,
  onTogglePlay,
  onNext,
  trackIndex,
  totalTracks,
}: RadioProps) {
  const [knobRotation, setKnobRotation] = useState(0);
  const [volumeRotation, setVolumeRotation] = useState(120);
  const needlePosition = currentTrack ? (trackIndex + 1) / (totalTracks + 1) : 0.15;

  const handleNext = useCallback(() => {
    setKnobRotation((prev) => prev + 90);
    onNext();
  }, [onNext]);

  return (
    <div
      style={{
        width: '340px',
        flexShrink: 0,
        position: 'relative',
      }}
    >
      {/* Radio body */}
      <div
        className="wood-grain"
        style={{
          background: 'linear-gradient(135deg, #5C3A1E 0%, #7A4E2D 20%, #6B4226 50%, #8B5E3C 70%, #5C3A1E 100%)',
          borderRadius: '8px 8px 4px 4px',
          padding: '12px',
          boxShadow: `
            0 8px 40px rgba(0,0,0,0.7),
            0 2px 0 rgba(180,120,60,0.3),
            inset 0 1px 0 rgba(200,150,80,0.3),
            inset 0 -1px 0 rgba(0,0,0,0.4)
          `,
          border: '1px solid rgba(120,70,30,0.5)',
        }}
      >
        {/* Top chrome strip */}
        <div
          style={{
            height: '3px',
            background: 'linear-gradient(90deg, #8B6030 0%, #D4A060 40%, #E8C080 50%, #D4A060 60%, #8B6030 100%)',
            borderRadius: '2px 2px 0 0',
            marginBottom: '10px',
          }}
        />

        {/* Speaker grill */}
        <SpeakerGrill />

        <div style={{ height: '10px' }} />

        {/* Frequency display */}
        <div
          style={{
            background: 'linear-gradient(135deg, #0A0804 0%, #140E06 100%)',
            borderRadius: '3px',
            border: '1px solid rgba(180,100,30,0.4)',
            padding: '6px 8px',
            marginBottom: '8px',
            boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.8)',
          }}
        >
          {/* Frequency scale */}
          <div style={{ position: 'relative', marginBottom: '4px' }}>
            <svg width="100%" height="28" viewBox="0 0 120 28" style={{ overflow: 'visible' }}>
              {/* Scale lines */}
              {Array.from({ length: 11 }).map((_, i) => (
                <g key={i}>
                  <line
                    x1={12 + i * 9.6}
                    y1={i % 5 === 0 ? 8 : 12}
                    x2={12 + i * 9.6}
                    y2={22}
                    stroke="rgba(180,120,40,0.4)"
                    strokeWidth="0.8"
                  />
                  {i % 5 === 0 && (
                    <text
                      x={12 + i * 9.6}
                      y={6}
                      textAnchor="middle"
                      fill="rgba(180,120,40,0.5)"
                      fontSize="5"
                      fontFamily="Inter, sans-serif"
                    >
                      {550 + i * 110}
                    </text>
                  )}
                </g>
              ))}
              <FrequencyNeedle position={needlePosition} />
            </svg>
          </div>

          {/* Note display area */}
          <div style={{ height: '52px' }}>
            <NoteDisplay note={currentTrack?.note ?? ''} isPlaying={isPlaying && hasStarted} />
          </div>
        </div>

        {/* Controls row */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '8px',
          }}
        >
          {/* Volume knob */}
          <Knob label="VOL" rotationDeg={volumeRotation} />

          {/* Tuning knob (clicking triggers next) */}
          <Knob label="TUNE" rotationDeg={knobRotation} onClick={hasStarted && !isTransitioning ? handleNext : undefined} />

          {/* Push buttons */}
          <div style={{ display: 'flex', gap: '5px', flex: 1, justifyContent: 'center' }}>
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                style={{
                  width: '6px',
                  height: '14px',
                  background: i === trackIndex
                    ? 'linear-gradient(180deg, #C4882A, #8B5E20)'
                    : 'linear-gradient(180deg, #3A2510, #2A1808)',
                  borderRadius: '2px 2px 4px 4px',
                  boxShadow: i === trackIndex
                    ? '0 2px 6px rgba(200,140,40,0.4), inset 0 1px 0 rgba(255,200,80,0.3)'
                    : '0 2px 4px rgba(0,0,0,0.5), inset 0 1px 0 rgba(100,60,20,0.2)',
                  border: '1px solid rgba(80,40,10,0.5)',
                  transition: 'all 0.3s ease',
                }}
              />
            ))}
          </div>

          {/* Power LED + label */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
            <PowerLED isOn={isPlaying} />
            <span style={{ fontSize: '7px', color: 'rgba(180,140,60,0.5)', fontFamily: 'Inter, sans-serif', letterSpacing: '0.1em' }}>
              PWR
            </span>
          </div>
        </div>

        {/* Bottom chrome strip */}
        <div
          style={{
            height: '2px',
            background: 'linear-gradient(90deg, #8B6030, #D4A060, #8B6030)',
            borderRadius: '0 0 2px 2px',
            marginTop: '10px',
          }}
        />
      </div>

      {/* Album art — floats above radio */}
      <AnimatePresence mode="wait">
        {currentTrack && (
          <motion.div
            key={currentTrack.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            style={{
              position: 'absolute',
              top: '-72px',
              right: '-20px',
              width: '80px',
              height: '80px',
              borderRadius: '4px',
              overflow: 'hidden',
              boxShadow: '0 4px 20px rgba(0,0,0,0.6), 0 0 0 2px rgba(180,120,60,0.3)',
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={currentTrack.albumArt}
              alt={currentTrack.title}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Track info below radio */}
      <AnimatePresence mode="wait">
        {currentTrack && hasStarted && (
          <motion.div
            key={currentTrack.id}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            style={{
              position: 'absolute',
              bottom: '-44px',
              left: '0',
              right: '0',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontSize: '14px',
                fontWeight: 400,
                color: 'rgba(242,232,217,0.8)',
                letterSpacing: '0.02em',
              }}
            >
              {currentTrack.title}
            </div>
            <div
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: '10px',
                color: 'rgba(242,232,217,0.4)',
                letterSpacing: '0.06em',
                marginTop: '2px',
              }}
            >
              {currentTrack.artist}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Play button — the central interaction */}
      <motion.button
        id="radio-play-btn"
        onClick={onTogglePlay}
        disabled={isTransitioning}
        style={{
          position: 'absolute',
          bottom: '-88px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '52px',
          height: '52px',
          borderRadius: '50%',
          background: isPlaying
            ? 'rgba(80,50,20,0.8)'
            : 'linear-gradient(135deg, #C4882A 0%, #D4923A 50%, #B87820 100%)',
          border: '1px solid rgba(200,150,60,0.4)',
          boxShadow: isPlaying
            ? '0 2px 12px rgba(0,0,0,0.5)'
            : '0 4px 20px rgba(200,140,40,0.4), 0 2px 8px rgba(0,0,0,0.4)',
          cursor: isTransitioning ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.4s ease',
        }}
        whileHover={!isTransitioning ? { scale: 1.08 } : {}}
        whileTap={!isTransitioning ? { scale: 0.94 } : {}}
      >
        {isTransitioning ? (
          <motion.div
            style={{
              width: '18px',
              height: '18px',
              border: '2px solid rgba(220,180,80,0.3)',
              borderTop: '2px solid rgba(220,180,80,0.8)',
              borderRadius: '50%',
            }}
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          />
        ) : isPlaying ? (
          // Pause icon
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <rect x="3" y="2" width="4" height="14" rx="1" fill="rgba(220,180,80,0.8)" />
            <rect x="11" y="2" width="4" height="14" rx="1" fill="rgba(220,180,80,0.8)" />
          </svg>
        ) : (
          // Play icon
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M5 2L15 9L5 16V2Z" fill="rgba(220,180,80,0.9)" />
          </svg>
        )}
      </motion.button>

      {/* Next button */}
      {hasStarted && (
        <motion.button
          id="radio-next-btn"
          onClick={handleNext}
          disabled={isTransitioning}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          style={{
            position: 'absolute',
            bottom: '-90px',
            left: 'calc(50% + 40px)',
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            background: 'rgba(60,35,15,0.6)',
            border: '1px solid rgba(180,120,40,0.2)',
            cursor: isTransitioning ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backdropFilter: 'blur(4px)',
          }}
          whileHover={!isTransitioning ? { scale: 1.1, background: 'rgba(80,50,20,0.8)' } : {}}
          whileTap={!isTransitioning ? { scale: 0.92 } : {}}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M2 2L9 7L2 12V2Z" fill="rgba(200,160,60,0.7)" />
            <rect x="10" y="2" width="2.5" height="10" rx="1" fill="rgba(200,160,60,0.7)" />
          </svg>
        </motion.button>
      )}

      {/* Track counter */}
      {hasStarted && (
        <div
          style={{
            position: 'absolute',
            bottom: '-92px',
            left: 'calc(50% - 80px)',
            fontFamily: "'Inter', sans-serif",
            fontSize: '10px',
            color: 'rgba(180,140,60,0.5)',
            letterSpacing: '0.08em',
            paddingTop: '10px',
          }}
        >
          {trackIndex + 1} / {totalTracks}
        </div>
      )}
    </div>
  );
}
