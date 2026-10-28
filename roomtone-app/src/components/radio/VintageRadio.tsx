'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Track } from '@/types/track';

interface VintageRadioProps {
  currentTrack: Track | null;
  isPlaying: boolean;
  isTransitioning: boolean;
  hasStarted: boolean;
  onTogglePlay: () => void;
  onNext: () => void;
  onPrev?: () => void;
  trackIndex: number;
  totalTracks: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// NoteArea — Typewriter note animation inside display panel
// ─────────────────────────────────────────────────────────────────────────────
function NoteArea({ note, isPlaying, hasStarted }: {
  note: string; isPlaying: boolean; hasStarted: boolean;
}) {
  const [text, setText] = useState('');
  const [cursor, setCursor] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const idxRef = useRef(0);

  useEffect(() => {
    setText(''); idxRef.current = 0; setCursor(false);
    if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; }
    if (!note || !isPlaying || !hasStarted) return;

    const startDelay = setTimeout(() => {
      setCursor(true);
      const type = () => {
        if (idxRef.current < note.length) {
          const ch = note[idxRef.current++];
          setText(p => p + ch);
          const d = '.?!,'.includes(ch) ? 240 : ch === ' ' ? 54 : 40 + Math.random() * 20;
          timerRef.current = setTimeout(type, d);
        } else {
          timerRef.current = setTimeout(() => setCursor(false), 4000);
        }
      };
      type();
    }, 600);

    return () => {
      clearTimeout(startDelay);
      if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; }
    };
  }, [note, isPlaying, hasStarted]);

  if (!hasStarted) {
    return (
      <div style={{
        fontFamily: "'Quicksand', sans-serif",
        fontSize: 'clamp(14px, 1.8vw, 18px)',
        fontWeight: 500,
        color: 'rgba(255, 242, 218, 0.65)',
        textAlign: 'center', letterSpacing: '0.06em',
      }}>
        Press Play to Listen ✨
      </div>
    );
  }

  return (
    <div style={{
      fontFamily: "'Caveat', cursive",
      fontSize: 'clamp(16px, 2.2vw, 24px)',
      color: '#FFF2DA',
      textAlign: 'center',
      textShadow: '0 0 16px rgba(255, 242, 218, 0.5)',
      lineHeight: 1.45,
      letterSpacing: '0.02em',
      padding: '0 4%',
    }}>
      {text}
      {cursor && (
        <motion.span
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.8, repeat: Infinity, repeatType: 'reverse' }}
          style={{ display: 'inline-block', marginLeft: '2px', color: '#FFB04A' }}
        >|</motion.span>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// EqualizerBars — Tiny cream animated equalizer bars
// ─────────────────────────────────────────────────────────────────────────────
function EqualizerBars({ isPlaying }: { isPlaying: boolean }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
      {Array.from({ length: 16 }, (_, i) => (
        <motion.div
          key={i}
          animate={isPlaying ? { scaleY: [0.2, 1, 0.35, 0.85, 0.15, 0.7] } : { scaleY: 0.2 }}
          transition={isPlaying ? {
            duration: 1.1 + (i % 5) * 0.12,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: i * 0.05,
          } : { duration: 0.3 }}
          style={{
            width: '3px',
            height: '18px',
            background: '#FFF2DA',
            borderRadius: '2px',
            transformOrigin: 'bottom',
            opacity: 0.9,
            boxShadow: isPlaying ? '0 0 6px rgba(255,242,218,0.5)' : 'none',
          }}
        />
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MetallicKnob — 72px bronze knob with radial gradients & realistic lighting
// ─────────────────────────────────────────────────────────────────────────────
function MetallicKnob({ label, deg, onClick }: {
  label: string; deg: number; onClick?: () => void;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', userSelect: 'none' }}>
      <motion.div
        onClick={onClick}
        animate={{ rotate: deg }}
        transition={{ duration: 0.7, ease: [0.22, 0.61, 0.36, 1] }}
        style={{
          width: '72px', height: '72px',
          borderRadius: '50%',
          background: `
            radial-gradient(circle at 35% 25%, rgba(255,220,130,0.65) 0%, transparent 45%),
            radial-gradient(circle at 70% 75%, rgba(40,20,5,0.6) 0%, transparent 40%),
            conic-gradient(from 0deg,
              #4C321F 0deg, #8D6541 45deg, #D89C57 90deg,
              #8D6541 135deg, #4C321F 180deg, #8D6541 225deg,
              #D89C57 270deg, #8D6541 315deg, #4C321F 360deg
            )
          `,
          boxShadow: `
            0 12px 28px rgba(0,0,0,0.65),
            0 4px 10px rgba(0,0,0,0.4),
            inset 0 2px 2px rgba(255,242,218,0.35),
            inset 0 -2px 4px rgba(0,0,0,0.5),
            0 0 0 3px rgba(47,30,20,0.85)
          `,
          cursor: onClick ? 'pointer' : 'default',
          position: 'relative',
          flexShrink: 0,
        }}
        whileHover={onClick ? { scale: 1.07 } : {}}
        whileTap={onClick ? { scale: 0.93 } : {}}
      >
        {/* Inner cap */}
        <div style={{
          position: 'absolute', inset: '14px',
          borderRadius: '50%',
          background: 'radial-gradient(circle at 35% 30%, rgba(216,156,87,0.4) 0%, rgba(59,42,32,0.85) 75%)',
          border: '1px solid rgba(216,156,87,0.35)',
        }} />
        {/* Position notch */}
        <div style={{
          position: 'absolute', top: '7px', left: '50%', transform: 'translateX(-50%)',
          width: '5px', height: '14px',
          background: 'linear-gradient(180deg, #FFF2DA 0%, #FFB04A 100%)',
          borderRadius: '3px',
          boxShadow: '0 0 6px rgba(255,176,74,0.8)',
        }} />
      </motion.div>
      <span style={{
        fontFamily: "'Inter', sans-serif",
        fontSize: '11px',
        fontWeight: 600,
        letterSpacing: '0.14em',
        color: '#D89C57',
        textTransform: 'uppercase',
      }}>{label}</span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MechanicalButton — 52x44px vintage button
// ─────────────────────────────────────────────────────────────────────────────
function MechanicalButton({ icon, onClick, isPrimary, id }: {
  icon: React.ReactNode; onClick?: () => void; isPrimary?: boolean; id?: string;
}) {
  return (
    <motion.button
      id={id}
      onClick={onClick}
      style={{
        width: '52px', height: '44px',
        background: isPrimary
          ? 'linear-gradient(180deg, #D89C57 0%, #8D6541 100%)'
          : 'linear-gradient(180deg, #6E4A2C 0%, #4C321F 100%)',
        border: `1px solid ${isPrimary ? '#FFB04A' : '#8D6541'}`,
        borderRadius: '10px',
        cursor: onClick ? 'pointer' : 'default',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: isPrimary
          ? '0 6px 16px rgba(216,156,87,0.45), inset 0 2px 0 rgba(255,242,218,0.4), inset 0 -2px 4px rgba(0,0,0,0.4)'
          : '0 4px 10px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,242,218,0.2), inset 0 -2px 4px rgba(0,0,0,0.5)',
        color: isPrimary ? '#FFF2DA' : '#D89C57',
        transition: 'all 0.2s ease',
      }}
      whileHover={onClick ? { scale: 1.08, y: -2 } : {}}
      whileTap={onClick ? { scale: 0.92, y: 2 } : {}}
    >
      {icon}
    </motion.button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// VintageRadio — Master Radio Component (Specs: ~640x580, rounded 32px, dark walnut)
// ─────────────────────────────────────────────────────────────────────────────
export default function VintageRadio({
  currentTrack, isPlaying, isTransitioning, hasStarted,
  onTogglePlay, onNext, onPrev, trackIndex, totalTracks,
}: VintageRadioProps) {
  const [volDeg, setVolDeg] = useState(135);
  const [tuneDeg, setTuneDeg] = useState(0);
  const [isFav, setIsFav] = useState(false);

  const needlePos = totalTracks > 0 ? (trackIndex + 1) / (totalTracks + 1) : 0.35;

  const handleNext = useCallback(() => { setTuneDeg(p => p + 90); onNext(); }, [onNext]);
  const handlePrev = useCallback(() => { setTuneDeg(p => p - 90); onPrev?.(); }, [onPrev]);

  return (
    <div style={{
      position: 'relative',
      width: '100%',
      height: 'auto',
      margin: '0 auto',
      // Dark Walnut Wood Body
      background: `
        radial-gradient(ellipse at 40% 15%, rgba(141,101,65,0.45) 0%, transparent 60%),
        linear-gradient(165deg, #4C321F 0%, #3B2A20 30%, #2F1E14 60%, #3B2A20 85%, #4C321F 100%)
      `,
      borderRadius: '28px',
      border: '2px solid rgba(141,101,65,0.45)',
      boxShadow: `
        0 40px 80px rgba(0,0,0,0.85),
        0 16px 36px rgba(0,0,0,0.65),
        0 6px 14px rgba(0,0,0,0.5),
        inset 0 2px 2px rgba(255,242,218,0.2),
        inset 0 -6px 20px rgba(0,0,0,0.8)
      `,
      padding: '20px 24px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      gap: '12px',
      boxSizing: 'border-box',
      flexShrink: 0,
      /* Subtle perspective tilt: looks placed on flat surface */
      transform: 'perspective(900px) rotateX(2deg)',
      transformOrigin: 'bottom center',
    }}>

      {/* ─ Cabinet Feet ─ */}
      <div style={{
        position: 'absolute', bottom: '-7px', left: '10%',
        width: '40px', height: '8px',
        background: 'linear-gradient(180deg, #2F1E14 0%, #0F0A06 100%)',
        borderRadius: '0 0 5px 5px',
        boxShadow: '0 5px 14px rgba(0,0,0,1)',
      }} />
      <div style={{
        position: 'absolute', bottom: '-7px', left: '50%', transform: 'translateX(-50%)',
        width: '40px', height: '8px',
        background: 'linear-gradient(180deg, #2F1E14 0%, #0F0A06 100%)',
        borderRadius: '0 0 5px 5px',
        boxShadow: '0 5px 14px rgba(0,0,0,1)',
      }} />
      <div style={{
        position: 'absolute', bottom: '-7px', right: '10%',
        width: '40px', height: '8px',
        background: 'linear-gradient(180deg, #2F1E14 0%, #0F0A06 100%)',
        borderRadius: '0 0 5px 5px',
        boxShadow: '0 5px 14px rgba(0,0,0,1)',
      }} />

      {/* ─ Deep contact shadow ellipse under feet ─ */}
      <div style={{
        position: 'absolute',
        bottom: '-24px', left: '-2%', right: '-2%',
        height: '22px',
        background: 'radial-gradient(ellipse 88% 55% at 50% 30%, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.5) 55%, transparent 80%)',
        zIndex: -1,
        pointerEvents: 'none',
        filter: 'blur(2px)',
      }} />

      {/* Wood grain overlay */}
      <div style={{
        position: 'absolute', inset: 0, borderRadius: '32px', pointerEvents: 'none', zIndex: 0,
        backgroundImage: `
          repeating-linear-gradient(88deg, transparent 0px, transparent 4px, rgba(0,0,0,0.03) 4px, rgba(0,0,0,0.03) 5px),
          repeating-linear-gradient(2deg, transparent 0px, transparent 12px, rgba(255,242,218,0.02) 12px, rgba(255,242,218,0.02) 13px)
        `,
      }} />

      {/* ── 1. DISPLAY PANEL ── (Dark Brown Fabric #3B2A20, Inset inside radio) */}
      <div style={{
        position: 'relative',
        zIndex: 2,
        background: `
          radial-gradient(ellipse at 50% 50%, rgba(216,156,87,0.08) 0%, transparent 75%),
          repeating-linear-gradient(0deg, transparent 0px, transparent 3px, rgba(0,0,0,0.06) 3px, rgba(0,0,0,0.06) 4px),
          repeating-linear-gradient(90deg, transparent 0px, transparent 3px, rgba(0,0,0,0.05) 3px, rgba(0,0,0,0.05) 4px),
          #3B2A20
        `,
        borderRadius: '20px',
        border: '2px solid rgba(76,50,31,0.8)',
        boxShadow: 'inset 0 6px 20px rgba(0,0,0,0.65), inset 0 -2px 8px rgba(0,0,0,0.4), 0 0 0 1px rgba(141,101,65,0.25)',
        padding: '24px 28px',
        minHeight: '190px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px',
        boxSizing: 'border-box',
      }}>

        {/* Song Title (River Flows in You / Current Track) */}
        <div style={{ textAlign: 'center' }}>
          <div style={{
            fontFamily: "'Quicksand', 'Nunito', sans-serif",
            fontSize: 'clamp(22px, 2.6vw, 32px)',
            fontWeight: 700,
            color: '#FFF2DA',
            letterSpacing: '0.01em',
            textShadow: '0 2px 10px rgba(255,242,218,0.3)',
          }}>
            {hasStarted && currentTrack ? currentTrack.title : 'River Flows in You'}
          </div>
          <div style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: '16px',
            fontWeight: 500,
            color: '#FFF2DA',
            opacity: 0.7,
            marginTop: '2px',
          }}>
            {hasStarted && currentTrack ? currentTrack.artist : 'Yiruma'}
          </div>
        </div>

        {/* Note Typewriter Display */}
        <div style={{ width: '100%' }}>
          <NoteArea
            note={currentTrack?.note ?? "This was playing the night we stayed up watching the rain hit the window. I still can't listen to it without feeling the warmth."}
            isPlaying={isPlaying}
            hasStarted={hasStarted}
          />
        </div>

        {/* Bottom row of display: Equalizer + Favorite heart icon */}
        <div style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: '8px',
        }}>
          {/* Animated Waveform */}
          <EqualizerBars isPlaying={isPlaying && hasStarted} />

          {/* Favorite icon (Bottom-right inside display) */}
          <button
            onClick={() => setIsFav(!isFav)}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '22px',
              color: isFav ? '#FFB04A' : 'rgba(255,242,218,0.7)',
              cursor: 'pointer',
              transition: 'transform 0.2s ease, color 0.2s ease',
            }}
          >
            {isFav ? '♥' : '♡'}
          </button>
        </div>
      </div>

      {/* ── 2. RADIO FREQUENCY STRIP ── (Classic FM 88-108 / AM 530-1700) */}
      <div style={{
        position: 'relative',
        zIndex: 2,
        background: 'linear-gradient(180deg, #1E140C 0%, #2F1E14 100%)',
        borderRadius: '14px',
        border: '1px solid rgba(141,101,65,0.4)',
        padding: '12px 24px',
        boxShadow: 'inset 0 4px 12px rgba(0,0,0,0.7)',
      }}>
        {/* FM Row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
          <span style={{ fontFamily: 'Inter', fontSize: '11px', color: '#D89C57', fontWeight: 700, minWidth: '24px' }}>FM</span>
          {[88, 92, 96, 100, 104, 108].map(f => (
            <span key={f} style={{ fontFamily: 'Inter', fontSize: '11px', color: f === 96 ? '#FFB04A' : 'rgba(255,242,218,0.5)', fontWeight: f === 96 ? 700 : 400 }}>{f}</span>
          ))}
          <span style={{ fontFamily: 'Inter', fontSize: '10px', color: 'rgba(216,156,87,0.5)', minWidth: '28px', textAlign: 'right' }}>MHz</span>
        </div>

        {/* Needle Track Line */}
        <div style={{ position: 'relative', height: '16px', margin: '4px 0' }}>
          <div style={{ position: 'absolute', top: '50%', left: '28px', right: '32px', height: '1px', background: 'rgba(216,156,87,0.3)', transform: 'translateY(-50%)' }}>
            {[0, 20, 40, 60, 80, 100].map(p => (
              <div key={p} style={{ position: 'absolute', left: `${p}%`, top: '-4px', width: '1px', height: '9px', background: 'rgba(216,156,87,0.4)' }} />
            ))}
          </div>
          {/* Animated Orange Frequency Needle */}
          <motion.div
            animate={{ left: `calc(28px + ${needlePos} * (100% - 60px))` }}
            transition={{ duration: 1.1, ease: [0.22, 0.61, 0.36, 1] }}
            style={{
              position: 'absolute', top: 0, bottom: 0, width: '3px', zIndex: 3,
              background: 'linear-gradient(180deg, #FFB04A 0%, #FF8C20 100%)',
              boxShadow: '0 0 10px #FFB04A, 0 0 4px #FF8C20',
              borderRadius: '2px',
            }}
          />
        </div>

        {/* AM Row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontFamily: 'Inter', fontSize: '11px', color: '#D89C57', fontWeight: 700, minWidth: '24px' }}>AM</span>
          {[530, 700, 900, 1200, 1500, 1700].map(f => (
            <span key={f} style={{ fontFamily: 'Inter', fontSize: '10px', color: 'rgba(255,242,218,0.4)' }}>{f}</span>
          ))}
          <span style={{ fontFamily: 'Inter', fontSize: '10px', color: 'rgba(216,156,87,0.4)', minWidth: '28px', textAlign: 'right' }}>kHz</span>
        </div>
      </div>

      {/* ── 3. KNOBS & BUTTONS ROW ── */}
      <div style={{
        position: 'relative', zIndex: 2,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: '16px',
        padding: '0 8px',
      }}>
        {/* Left Knob: Volume */}
        <MetallicKnob label="Volume" deg={volDeg} onClick={() => setVolDeg(p => (p + 25) % 360)} />

        {/* 5 Control Buttons: Shuffle, Previous, Pause/Play, Next, Repeat */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
          {/* Shuffle 🔀 */}
          <MechanicalButton
            icon={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="16 3 21 3 21 8"/>
                <line x1="4" y1="20" x2="21" y2="3"/>
                <polyline points="21 16 21 21 16 21"/>
                <line x1="15" y1="15" x2="21" y2="21"/>
                <line x1="4" y1="4" x2="9" y2="9"/>
              </svg>
            }
          />

          {/* Previous ⏮ */}
          <MechanicalButton
            id="radio-prev-btn"
            onClick={hasStarted && !isTransitioning ? handlePrev : undefined}
            icon={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/>
              </svg>
            }
          />

          {/* Pause / Play ⏯ (Primary highlight) */}
          <MechanicalButton
            id="radio-play-btn"
            onClick={onTogglePlay}
            isPrimary
            icon={
              isTransitioning ? (
                <motion.div
                  style={{ width: '16px', height: '16px', border: '2px solid rgba(255,242,218,0.0)', borderTop: '2px solid #FFF2DA', borderRadius: '50%' }}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 0.7, repeat: Infinity, ease: 'linear' }}
                />
              ) : isPlaying ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="6" y="4" width="4" height="16" rx="1.5"/>
                  <rect x="14" y="4" width="4" height="16" rx="1.5"/>
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z"/>
                </svg>
              )
            }
          />

          {/* Next ⏭ */}
          <MechanicalButton
            id="radio-next-btn"
            onClick={hasStarted && !isTransitioning ? handleNext : undefined}
            icon={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/>
              </svg>
            }
          />

          {/* Repeat 🔁 */}
          <MechanicalButton
            icon={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="17 1 21 5 17 9"/>
                <path d="M3 11V9a4 4 0 0 1 4-4h14"/>
                <polyline points="7 23 3 19 7 15"/>
                <path d="M21 13v2a4 4 0 0 1-4 4H3"/>
              </svg>
            }
          />
        </div>

        {/* Right Knob: Tune */}
        <MetallicKnob label="Tune" deg={tuneDeg} onClick={hasStarted && !isTransitioning ? handleNext : undefined} />
      </div>

    </div>
  );
}
