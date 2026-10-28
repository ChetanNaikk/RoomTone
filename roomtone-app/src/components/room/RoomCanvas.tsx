'use client';

import { useMemo, useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRoomStore } from '@/store/roomStore';
import { useAudio } from '@/hooks/useAudio';
import { getScene } from '@/lib/scenes/sceneDefinitions';
import { DEFAULT_VIDEO_SRC } from '@/lib/scenes/sceneDefinitions';
import { getAudioEngine } from '@/lib/audio/audioEngine';
import type { Room } from '@/types/room';
import type { Track } from '@/types/track';

interface RoomCanvasProps { room: Room; }

// ─────────────────────────────────────────────────────────────────────────────
// Typewriter — renders note text with typewriter effect on the paper cloth
// ─────────────────────────────────────────────────────────────────────────────
function Typewriter({ text, speed = 40 }: { text: string; speed?: number }) {
  const [displayed, setDisplayed] = useState('');
  const [cursor, setCursor] = useState(true);
  const idxRef  = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    idxRef.current = 0;
    setDisplayed('');
    setCursor(true);
    const type = () => {
      if (idxRef.current < text.length) {
        const ch = text[idxRef.current++];
        setDisplayed(p => p + ch);
        const ms = '.?!'.includes(ch) ? 340 : ch === ',' ? 180 : ch === ' ' ? 60 : speed + Math.random() * 22;
        timerRef.current = setTimeout(type, ms);
      } else {
        timerRef.current = setTimeout(() => setCursor(false), 4000);
      }
    };
    const d = setTimeout(type, 600);
    return () => { clearTimeout(d); if (timerRef.current) clearTimeout(timerRef.current); };
  }, [text, speed]);

  return (
    <div style={{
      fontFamily: "'Caveat', 'Dancing Script', cursive",
      fontSize: 'clamp(20px, 6cqw, 38px)',
      color: '#2C1A08',
      lineHeight: 1.5,
      textAlign: 'center',
      letterSpacing: '0.02em',
      textShadow: '0 0 18px rgba(190,120,40,0.55), 0 1px 3px rgba(255,255,255,0.35)',
      whiteSpace: 'pre-wrap',
      wordBreak: 'break-word',
    }}>
      {displayed}
      {cursor && (
        <motion.span
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.55, repeat: Infinity, repeatType: 'reverse' }}
          style={{ color: '#8B5E3C', marginLeft: '2px' }}
        >|</motion.span>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// WaveformBars — animated equalizer for idle state
// ─────────────────────────────────────────────────────────────────────────────
function WaveformBars({ isPlaying }: { isPlaying: boolean }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '3px', justifyContent: 'center' }}>
      {Array.from({ length: 18 }, (_, i) => {
        const dist = Math.abs(i - 8);
        const isMid = dist < 5;
        const h = isMid ? 16 - dist * 2 : 8;
        return (
          <motion.div
            key={i}
            animate={isPlaying
              ? { scaleY: [0.3, 1 + (isMid ? 1.2 - dist * 0.15 : 0.3), 0.4, 1 + (isMid ? 0.8 : 0.2), 0.3], opacity: 1 }
              : { scaleY: 0.3, opacity: 0.5 }
            }
            transition={isPlaying
              ? { duration: 0.9 + dist * 0.08, repeat: Infinity, repeatType: 'mirror', delay: i * 0.045, ease: 'easeInOut' }
              : { duration: 0.4 }
            }
            style={{
              width: '3px',
              height: `${h}px`,
              borderRadius: '2px',
              background: 'linear-gradient(180deg,#C8813A 0%,#8B5E3C 100%)',
              opacity: 0.75,
              transformOrigin: 'bottom',
            }}
          />
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// RadioBtn — transparent hit-target overlaid on an illustrated button
// ─────────────────────────────────────────────────────────────────────────────
function RadioBtn({ onClick, id }: { onClick?: () => void; id?: string }) {
  return (
    <motion.button
      id={id}
      onClick={onClick}
      style={{
        flex: 1, height: '100%',
        backgroundColor: 'rgba(255,176,74,0)',
        border: 'none',
        outline: 'none',
        cursor: onClick ? 'pointer' : 'default',
        borderRadius: '4px',
        WebkitTapHighlightColor: 'transparent',
      }}
      whileHover={onClick ? { backgroundColor: 'rgba(255,176,74,0.10)' } : {}}
      whileTap={onClick ? { scale: 0.88 } : {}}
    />
  );
}



// ─────────────────────────────────────────────────────────────────────────────
// useVideoCrossfade — dual-video crossfade hook
// Manages two <video> elements (A/B), swaps which one plays the new src
// and fades between them in `fadeDuration` ms.
// ─────────────────────────────────────────────────────────────────────────────
function useVideoCrossfade(src: string, fadeDuration = 2500) {
  const refA = useRef<HTMLVideoElement>(null);
  const refB = useRef<HTMLVideoElement>(null);
  const [activeSlot, setActiveSlot] = useState<'A' | 'B'>('A');
  const [opacityA, setOpacityA] = useState(1);
  const [opacityB, setOpacityB] = useState(0);
  const prevSrc = useRef(src);

  useEffect(() => {
    if (src === prevSrc.current) return;
    prevSrc.current = src;

    const incoming = activeSlot === 'A' ? refB : refA;
    const el = incoming.current;
    if (!el) return;

    el.src = src;
    el.load();

    const onCanPlay = () => {
      el.play().catch(() => {});
      // crossfade: fade in incoming, fade out outgoing
      if (activeSlot === 'A') {
        setOpacityB(1);
        setOpacityA(0);
        setActiveSlot('B');
      } else {
        setOpacityA(1);
        setOpacityB(0);
        setActiveSlot('A');
      }
    };

    el.addEventListener('canplay', onCanPlay, { once: true });
    return () => el.removeEventListener('canplay', onCanPlay);
  }, [src, activeSlot]);

  // Play initial video on mount
  useEffect(() => {
    const el = refA.current;
    if (!el) return;
    el.src = src;
    el.load();
    el.play().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sharedVideoStyle: React.CSSProperties = {
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    objectFit: 'fill',
    userSelect: 'none',
    pointerEvents: 'none',
    transition: `opacity ${fadeDuration}ms ease-in-out`,
  };

  return {
    videoA: (
      <video
        ref={refA}
        autoPlay loop muted playsInline
        style={{ ...sharedVideoStyle, opacity: opacityA, zIndex: opacityA >= opacityB ? 1 : 0 }}
      />
    ),
    videoB: (
      <video
        ref={refB}
        autoPlay loop muted playsInline
        style={{ ...sharedVideoStyle, opacity: opacityB, zIndex: opacityB > opacityA ? 1 : 0 }}
      />
    ),
  };
}

// ═════════════════════════════════════════════════════════════════════════════
//  PRECISE PIXEL-MEASURED ZONES (at card scale 350×467px)
//  ───────────────────────────────────────────────────────────────────────────
//  SPEAKER CLOTH:    top 45.3% → 58.6%  |  left 21% / right 21%
//  FM/AM DIAL:       top 58.6% → 66.3%  |  left 21% / right 21%
//  LEFT VOL KNOB:    cx=32.3%  cy=66.0%  (8% × 9%)
//  RIGHT TUNE KNOB:  cx=72.3%  cy=66.0%  (8% × 9%)
//  5 BUTTONS:        top 68.5% → 72.4%  |  left 26.5% / right 26.5%
// ═════════════════════════════════════════════════════════════════════════════
export default function RoomCanvas({ room }: RoomCanvasProps) {
  const { playback, activeSceneId, musicVolume, setMusicVolume } = useRoomStore();
  const { toggle, play, nextTrack, prevTrack } = useAudio();

  // Volume knob — 5 discrete notches: 0=mute (0°), 1=25% (22.5°), 2=50% (45°), 3=75% (67.5°), 4=100% (90°)
  // Starts at 50% volume (45° tilt)
  const volToNotch = (v: number) => Math.round(v * 4) as 0|1|2|3|4;
  const notchToVol = (n: number) => n / 4;
  const notchToDeg = (n: number) => n * 22.5;

  const [volNotch, setVolNotch] = useState<0|1|2|3|4>(() => volToNotch(musicVolume));
  const [tuneDeg, setTuneDeg] = useState(0);

  // Swipe to change track (Instagram Stories / Spotify Canvas style)
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const touchStartTime = useRef<number>(0);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [swipeIndicator, setSwipeIndicator] = useState<'next' | 'prev' | null>(null);

  const idx   = playback.currentTrackIndex;
  const track: Track | null = room.tracks[idx] ?? null;

  // Auto-rotate tune knob whenever track changes (direction-aware)
  const prevIdx = useRef(idx);
  const prevDirection = useRef<1 | -1>(1); // +1 = forward, -1 = backward
  useEffect(() => {
    if (prevIdx.current !== idx) {
      setTuneDeg(p => p + 72 * prevDirection.current);
      prevIdx.current = idx;
    }
  }, [idx]);

  const handleNext = useCallback(() => {
    prevDirection.current = 1;
    if (!playback.hasStarted) play();
    else nextTrack();
  }, [nextTrack, playback.hasStarted, play]);

  const handlePrev = useCallback(() => {
    prevDirection.current = -1;
    if (!playback.hasStarted) play();
    else prevTrack();
  }, [prevTrack, playback.hasStarted, play]);

  const handleVolClick = useCallback(() => {
    const newNotch = ((volNotch + 1) % 5) as 0|1|2|3|4;
    setVolNotch(newNotch);
    setMusicVolume(notchToVol(newNotch));
    getAudioEngine().playClick();
  }, [volNotch, setMusicVolume]);

  // Touch gesture listeners for horizontal swipe
  const onTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    touchStartTime.current = Date.now();
    setIsDragging(true);
  }, []);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const dx = e.touches[0].clientX - touchStartX.current;
    const dy = e.touches[0].clientY - touchStartY.current;

    // Follow horizontal movement if predominantly horizontal
    if (Math.abs(dx) > Math.abs(dy)) {
      const damped = Math.sign(dx) * Math.min(36, Math.abs(dx) * 0.35);
      setSwipeOffset(damped);
      if (dx < -30) setSwipeIndicator('next');
      else if (dx > 30) setSwipeIndicator('prev');
      else setSwipeIndicator(null);
    }
  }, []);

  const onTouchEnd = useCallback((e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) {
      setSwipeOffset(0);
      setIsDragging(false);
      setSwipeIndicator(null);
      return;
    }

    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const dy = e.changedTouches[0].clientY - touchStartY.current;
    const dt = Date.now() - touchStartTime.current;

    touchStartX.current = null;
    touchStartY.current = null;
    setSwipeOffset(0);
    setIsDragging(false);
    setSwipeIndicator(null);

    const isFlick = dt < 300 && Math.abs(dx) > 30;
    const isSwipe = Math.abs(dx) > 45;

    if ((isFlick || isSwipe) && Math.abs(dx) > Math.abs(dy) * 1.2) {
      if (dx < 0) {
        handleNext();
      } else {
        handlePrev();
      }
    }
  }, [handleNext, handlePrev]);

  const onTouchCancel = useCallback(() => {
    touchStartX.current = null;
    touchStartY.current = null;
    setSwipeOffset(0);
    setIsDragging(false);
    setSwipeIndicator(null);
  }, []);

  // Desktop keyboard navigation (ArrowLeft/Right to tune, Space to play/pause)
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      } else if (e.key === ' ') {
        e.preventDefault();
        toggle();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleNext, handlePrev, toggle]);

  const sceneId  = activeSceneId ?? track?.sceneId ?? 'sunny-day';
  const scene    = useMemo(() => getScene(sceneId as Parameters<typeof getScene>[0]), [sceneId]);
  const videoSrc = scene?.videoSrc ?? DEFAULT_VIDEO_SRC;

  const needlePos  = room.tracks.length > 0 ? (idx + 1) / (room.tracks.length + 1) : 0.40;

  const hasNote  = Boolean(track?.note);
  const showNote = hasNote && playback.isPlaying && playback.hasStarted;
  // Only show title/artist AFTER the user has pressed play at least once
  const showTitle = playback.hasStarted && !showNote;
  const songTitle  = track ? track.title  : '';
  const songArtist = track ? track.artist : '';
  const noteText   = track?.note ?? '';

  // Dual-video crossfade for card background (smooth 1s crossfade immediately on track switch)
  const { videoA: cardVideoA, videoB: cardVideoB } = useVideoCrossfade(videoSrc, 1000);
  // Separate crossfade for the blurred backdrop
  const { videoA: bgVideoA, videoB: bgVideoB } = useVideoCrossfade(videoSrc, 1000);

  return (
    <div style={{
      position: 'fixed', inset: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      overflow: 'hidden',
      background: '#0D0804',
      userSelect: 'none',
      WebkitUserSelect: 'none',
    }}>
      {/* ── Ambient blurred backdrop fills the full viewport smoothly ── */}
      <div style={{
        position: 'absolute', inset: 0,
        overflow: 'hidden',
        filter: 'blur(32px) brightness(0.48) saturate(1.15)',
        transform: 'scale(1.12)',
        zIndex: 0,
        pointerEvents: 'none',
      }}>
        {bgVideoA}
        {bgVideoB}
      </div>

      {/* Atmospheric radial vignette blending seamlessly into device borders */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse at center, rgba(13,8,4,0.08) 25%, rgba(13,8,4,0.55) 100%)',
        zIndex: 1,
        pointerEvents: 'none',
      }} />

      {/* ══════════════════════════════════════════════════════════════════
          PORTRAIT CARD — Full-Bleed Adaptive Mobile + Desktop 3:4
          Width & height scale smoothly on mobile so the vintage radio
          fills tall phone screens (iPhone 19.5:9) comfortably without
          black letterboxing, while keeping all knobs & buttons visible.
          ══════════════════════════════════════════════════════════════════ */}
      <div
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onTouchCancel={onTouchCancel}
        style={{
          position: 'relative',
          width: 'min(calc(100dvh * 1086 / 1448), 122vw)',
          height: 'min(100dvh, calc(122vw * 1448 / 1086))',
          aspectRatio: '1086 / 1448',
          maxHeight: '100dvh',
          flexShrink: 0,
          containerType: 'inline-size',
          zIndex: 2,
          overflow: 'hidden',
          touchAction: 'pan-y',
          transform: `translateX(${swipeOffset}px)`,
          transition: isDragging ? 'none' : 'transform 0.35s cubic-bezier(0.22, 1, 0.36, 1)',
        }}
      >
        {/* ── Looping video background (crossfades on scene change) ── */}
        {cardVideoA}
        {cardVideoB}

        <style>{`@import url('https://fonts.googleapis.com/css2?family=Caveat:wght@500;700&family=Nunito:wght@500;700&display=swap');`}</style>

        {/* ── Swipe direction HUD badge ── */}
        <AnimatePresence>
          {swipeIndicator && (
            <motion.div
              initial={{ opacity: 0, scale: 0.88 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.88 }}
              transition={{ duration: 0.15 }}
              style={{
                position: 'absolute',
                top: '55%',
                [swipeIndicator === 'next' ? 'right' : 'left']: '4%',
                transform: 'translateY(-50%)',
                padding: '7px 14px',
                borderRadius: '20px',
                background: 'rgba(20, 12, 6, 0.80)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 176, 74, 0.45)',
                boxShadow: '0 0 16px rgba(255, 176, 74, 0.25)',
                color: '#FFB04A',
                fontFamily: "'Nunito', sans-serif",
                fontSize: '12px',
                fontWeight: 700,
                letterSpacing: '0.08em',
                pointerEvents: 'none',
                zIndex: 30,
              }}
            >
              {swipeIndicator === 'next' ? 'NEXT →' : '← PREV'}
            </motion.div>
          )}
        </AnimatePresence>

        <header style={{
          position: 'absolute', top: '4.5%',
          left: 'max(5%, 44px)', right: 'max(5%, 44px)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          zIndex: 20,
        }}>
          {/* Room Title displayed on top left */}
          {room.title && (
            <div style={{
              fontFamily: "'Nunito', sans-serif",
              fontSize: 'clamp(14px, 3.6cqw, 20px)',
              fontWeight: 600,
              fontStyle: 'normal',
              color: 'rgba(255, 242, 218, 0.92)',
              textShadow: '0 2px 10px rgba(0,0,0,0.8), 0 0 10px rgba(210,150,50,0.3)',
              maxWidth: '55%',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              letterSpacing: '0.01em',
            }}>
              {room.title}
            </div>
          )}

          <a
            href="/create"
            style={{
              display: 'flex', alignItems: 'center', gap: '7px',
              padding: '9px 16px',
              borderRadius: '24px',
              background: 'rgba(10,6,2,0.40)',
              backdropFilter: 'blur(18px)',
              WebkitBackdropFilter: 'blur(18px)',
              border: '1px solid rgba(255,200,100,0.22)',
              color: '#FFE8B0',
              fontFamily: "'Nunito', sans-serif",
              fontSize: '13px',
              fontWeight: 700,
              letterSpacing: '0.02em',
              textDecoration: 'none',
              whiteSpace: 'nowrap',
              transition: 'background 0.2s, border-color 0.2s',
              boxShadow: '0 2px 12px rgba(0,0,0,0.25)',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14M5 12h14"/>
            </svg>
            Create Your Own Room
          </a>
        </header>

        {/* ────────────────────────────────────────────────────────────
            SPEAKER CLOTH OVERLAY
            VIDEO-MEASURED: top=45.3% (Y=580) → bot=59.0% (Y=755)
                            left=14% → right=14%
            Shows nothing until user presses play.
            ──────────────────────────────────────────────────────────── */}
        <div style={{
          position: 'absolute',
          top: '45.3%', left: '14%', right: '14%',
          height: '13.7%',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          gap: '6px',
          zIndex: 10,
          padding: '1% 4%',
          overflow: 'hidden',
        }}>
          <AnimatePresence mode="wait">
            {showNote ? (
              <motion.div key="note"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                transition={{ duration: 0.6 }}
                style={{ width: '100%', display: 'flex', justifyContent: 'center' }}
              >
                <Typewriter text={noteText} />
              </motion.div>
            ) : showTitle ? (
              <motion.div key="title"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                transition={{ duration: 0.6 }}
                style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}
              >
                <div style={{
                  fontFamily: "'Nunito', 'Quicksand', sans-serif",
                  fontSize: 'clamp(18px, 5.5cqw, 36px)',
                  fontWeight: 700,
                  color: '#251409',
                  textAlign: 'center',
                  letterSpacing: '0.005em',
                  lineHeight: 1.18,
                  textShadow: [
                    '0 0 22px rgba(210,140,50,0.70)',
                    '0 0 8px  rgba(255,200,100,0.45)',
                    '0 2px 6px rgba(255,255,255,0.30)',
                    '0 1px 2px rgba(0,0,0,0.12)',
                  ].join(', '),
                }}>{songTitle}</div>

                <div style={{
                  fontFamily: "'Nunito', sans-serif",
                  fontSize: 'clamp(12px, 3.2cqw, 20px)',
                  fontWeight: 500,
                  color: '#3C2010',
                  opacity: 0.88,
                  textShadow: '0 0 14px rgba(200,130,40,0.50), 0 1px 4px rgba(255,255,255,0.25)',
                }}>{songArtist}</div>

                <div style={{ marginTop: '3px' }}>
                  <WaveformBars isPlaying={playback.isPlaying && playback.hasStarted} />
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>


        {/*
          VOLUME KNOB (left) — 5-notch system, rotates 0° (mute) to 90° (100%)
          Starts at 50% volume (45° tilt)
          Each click advances one notch and updates musicVolume
        */}
        <motion.div
          animate={{ rotate: notchToDeg(volNotch) }}
          transition={{ duration: 0.35, ease: [0.22, 0.61, 0.36, 1] }}
          onClick={handleVolClick}
          style={{
            position: 'absolute',
            top:  'calc(69.0% - 5.0%)',
            left: 'calc(25.3% - 4.5%)',
            width: '7.0%', height: '7.0%',
            borderRadius: '50%',
            background: 'transparent',
            cursor: 'pointer', zIndex: 11,
          }}
        >
          <div style={{
            position: 'absolute', top: '10%', left: '50%',
            transform: 'translateX(-50%)',
            width: '3px', height: '15%',
            background: volNotch === 0 ? 'rgba(255,176,74,0.3)' : '#FFB04A',
            borderRadius: '2px',
            boxShadow: volNotch === 0
              ? 'none'
              : '0 0 7px rgba(255,176,74,1), 0 0 14px rgba(255,140,20,0.6)',
            transition: 'background 0.3s, box-shadow 0.3s',
          }} />
        </motion.div>

        {/*
          TUNE KNOB (right) — moved down 3% from video-measured cy=66.5%
          VIDEO-MEASURED: cx=77.5%, now cy=69.5%
        */}
        <motion.div
          animate={{ rotate: tuneDeg }}
          transition={{ duration: 0.55, ease: [0.22, 0.61, 0.36, 1] }}
          onClick={handleNext}
          style={{
            position: 'absolute',
            top:  'calc(69.2% - 5.0%)',
            left: 'calc(79.6% - 4.5%)',
            width: '7.0%', height: '7.0%',
            borderRadius: '50%',
            background: 'transparent',
            cursor: 'pointer', zIndex: 11,
          }}
        >
          <div style={{
            position: 'absolute', top: '10%', left: '50%',
            transform: 'translateX(-50%)',
            width: '3px', height: '15%',
            background: '#FFB04A',
            borderRadius: '2px',
            boxShadow: '0 0 7px rgba(255,176,74,1), 0 0 14px rgba(255,140,20,0.6)',
          }} />
        </motion.div>

        {/*
          5 PLAYBACK BUTTONS
          VIDEO-MEASURED: Y=895-922 (69.9%-72.0%), X=25%-75%
        */}
        <div style={{
          position: 'absolute',
          top: '70.0%', left: '35%', right: '32%',
          height: '2.5%',
          display: 'flex', gap: '1px',
          zIndex: 11,
          background: 'transparent',
        }}>
          <RadioBtn />
          <RadioBtn id="radio-prev-btn" onClick={handlePrev} />
          <RadioBtn id="radio-play-btn" onClick={toggle} />
          <RadioBtn id="radio-next-btn" onClick={handleNext} />
          <RadioBtn />
        </div>

      </div>
    </div>
  );
}
