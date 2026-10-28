'use client';

import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { searchItunes, itunesResultToTrack } from '@/lib/itunes';
import { getAllScenes } from '@/lib/scenes/sceneDefinitions';
import { saveRoom, makeSlug } from '@/lib/roomStorage';
import type { ItunesSearchResult } from '@/types/track';
import type { SceneId } from '@/types/scene';
import type { Room } from '@/types/room';

// ─────────────────────────────────────────────────────────────────────────────
// Create Room — 4-step wizard
// ─────────────────────────────────────────────────────────────────────────────

type WizardStep = 1 | 2 | 3 | 4;

interface PendingTrack {
  result: ItunesSearchResult;
  note: string;
  sceneId: SceneId;
}

const ALL_SCENES = getAllScenes();

const fade = {
  enter:  { opacity: 0, y: 18 },
  center: { opacity: 1, y: 0  },
  exit:   { opacity: 0, y: -14 },
};

// ── Step dots ─────────────────────────────────────────────────────────────────
function Steps({ current }: { current: WizardStep }) {
  return (
    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '48px' }}>
      {[1,2,3,4].map(n => (
        <div key={n} style={{
          height: '4px',
          borderRadius: '2px',
          width: n === current ? '28px' : '6px',
          background: n === current
            ? 'rgba(210,155,50,0.9)'
            : n < current ? 'rgba(210,155,50,0.35)' : 'rgba(255,255,255,0.08)',
          transition: 'all 0.4s ease',
        }} />
      ))}
    </div>
  );
}

// ── Shared input style helper ─────────────────────────────────────────────────
const inputStyle: React.CSSProperties = {
  width: '100%',
  background: 'rgba(255,255,255,0.04)',
  border: 'none',
  borderBottom: '1px solid rgba(210,155,50,0.35)',
  padding: '10px 0',
  color: 'rgba(242,232,217,0.9)',
  fontFamily: "'Cormorant Garamond', serif",
  fontSize: '22px',
  outline: 'none',
  letterSpacing: '0.02em',
};

const btnPrimary = (enabled: boolean): React.CSSProperties => ({
  background: enabled ? 'rgba(210,155,50,0.16)' : 'transparent',
  border: `1px solid rgba(210,155,50,${enabled ? '0.4' : '0.18'})`,
  borderRadius: '5px',
  padding: '12px 36px',
  color: `rgba(230,185,80,${enabled ? '0.95' : '0.3'})`,
  fontFamily: "'Inter', sans-serif",
  fontSize: '12px',
  letterSpacing: '0.12em',
  cursor: enabled ? 'pointer' : 'not-allowed',
  transition: 'all 0.25s ease',
});

// ── Step 1: Title ─────────────────────────────────────────────────────────────
function StepTitle({ onNext }: { onNext: (t: string) => void }) {
  const [val, setVal] = useState('');
  return (
    <div style={{ maxWidth: '500px', width: '100%' }}>
      <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(30px, 5vw, 44px)', fontWeight: 300, color: 'rgba(242,232,217,0.9)', marginBottom: '10px' }}>
        Name your room.
      </h1>
      <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '13px', color: 'rgba(180,155,110,0.55)', marginBottom: '40px', lineHeight: 1.65 }}>
        This is the first thing they'll read before pressing play.
      </p>
      <input
        autoFocus
        type="text"
        value={val}
        maxLength={80}
        placeholder="An evening I keep returning to..."
        onChange={e => setVal(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && val.trim() && onNext(val.trim())}
        style={{ ...inputStyle, marginBottom: '48px' }}
      />
      <button style={btnPrimary(!!val.trim())} onClick={() => val.trim() && onNext(val.trim())}>
        CONTINUE →
      </button>
    </div>
  );
}

// ── Step 2: Song search ───────────────────────────────────────────────────────
function StepSongs({
  selected, onSelect, onRemove, onNext,
}: {
  selected: PendingTrack[];
  onSelect: (r: ItunesSearchResult) => void;
  onRemove: (id: number) => void;
  onNext: () => void;
}) {
  const [q, setQ] = useState('');
  const [results, setResults] = useState<ItunesSearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  const search = useCallback(async () => {
    if (!q.trim()) return;
    setLoading(true);
    const res = await searchItunes(q, 10);
    setResults(res);
    setLoading(false);
  }, [q]);

  const isChosen = (id: number) => selected.some(s => s.result.trackId === id);

  return (
    <div style={{ maxWidth: '600px', width: '100%' }}>
      <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(28px, 4vw, 38px)', fontWeight: 300, color: 'rgba(242,232,217,0.9)', marginBottom: '6px' }}>
        Choose your songs.
      </h2>
      <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '12px', color: 'rgba(180,155,110,0.5)', marginBottom: '28px' }}>
        Pick 1–4 songs. Each becomes a moment.{' '}
        <span style={{ color: 'rgba(210,155,50,0.65)' }}>{selected.length}/4 selected</span>
      </p>

      {/* Search */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        <input
          type="text"
          value={q}
          onChange={e => setQ(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && search()}
          placeholder="Search any song or artist..."
          style={{
            flex: 1, background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(210,155,50,0.18)', borderRadius: '4px',
            padding: '9px 12px', color: 'rgba(242,232,217,0.9)',
            fontFamily: "'Inter', sans-serif", fontSize: '13px', outline: 'none',
          }}
        />
        <button onClick={search} style={btnPrimary(!!q.trim())}>
          {loading ? '…' : 'SEARCH'}
        </button>
      </div>

      {/* Results list */}
      <div style={{ maxHeight: '300px', overflowY: 'auto', marginBottom: '24px' }} className="no-scrollbar">
        <AnimatePresence>
          {results.map((r, i) => {
            const chosen = isChosen(r.trackId);
            const disabled = !chosen && selected.length >= 4;
            return (
              <motion.div
                key={r.trackId}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                onClick={() => {
                  if (chosen) onRemove(r.trackId);
                  else if (selected.length < 4) onSelect(r);
                }}
                style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  padding: '9px 10px', borderRadius: '5px', marginBottom: '3px',
                  background: chosen ? 'rgba(210,155,50,0.1)' : 'rgba(255,255,255,0.025)',
                  border: `1px solid ${chosen ? 'rgba(210,155,50,0.3)' : 'transparent'}`,
                  cursor: disabled ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease',
                  opacity: disabled ? 0.4 : 1,
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={r.artworkUrl100} alt="" style={{ width: '38px', height: '38px', borderRadius: '3px', objectFit: 'cover', flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: "'Inter', sans-serif", fontSize: '13px', color: 'rgba(242,232,217,0.85)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {r.trackName}
                  </div>
                  <div style={{ fontFamily: "'Inter', sans-serif", fontSize: '11px', color: 'rgba(180,140,60,0.55)', marginTop: '1px' }}>
                    {r.artistName}
                  </div>
                </div>
                {chosen && <span style={{ color: 'rgba(210,155,50,0.8)', fontSize: '14px', flexShrink: 0 }}>✓</span>}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Selected chips */}
      {selected.length > 0 && (
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '24px' }}>
          {selected.map(s => (
            <div key={s.result.trackId} style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              background: 'rgba(210,155,50,0.12)', border: '1px solid rgba(210,155,50,0.28)',
              borderRadius: '20px', padding: '4px 10px 4px 6px',
            }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={s.result.artworkUrl100} alt="" style={{ width: '20px', height: '20px', borderRadius: '2px' }} />
              <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '11px', color: 'rgba(210,185,100,0.8)', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {s.result.trackName}
              </span>
              <button onClick={() => onRemove(s.result.trackId)} style={{ background: 'none', border: 'none', color: 'rgba(210,155,50,0.5)', cursor: 'pointer', fontSize: '12px', padding: 0, lineHeight: 1 }}>×</button>
            </div>
          ))}
        </div>
      )}

      <button style={btnPrimary(selected.length >= 1)} onClick={() => selected.length >= 1 && onNext()}>
        ADD NOTES →
      </button>
    </div>
  );
}

// ── Step 3: Notes + scenes ────────────────────────────────────────────────────
function StepNotes({
  tracks, onUpdate, onNext,
}: {
  tracks: PendingTrack[];
  onUpdate: (i: number, note: string, sceneId: SceneId) => void;
  onNext: () => void;
}) {
  const allHaveNotes = tracks.every(t => t.note.trim().length > 0);

  return (
    <div style={{ maxWidth: '600px', width: '100%' }}>
      <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(28px, 4vw, 38px)', fontWeight: 300, color: 'rgba(242,232,217,0.9)', marginBottom: '6px' }}>
        Write the moments.
      </h2>
      <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '12px', color: 'rgba(180,155,110,0.5)', marginBottom: '28px', lineHeight: 1.6 }}>
        For each song, write what it means to you and choose the scene outside the window.
      </p>

      <div style={{ maxHeight: '420px', overflowY: 'auto', marginBottom: '28px' }} className="no-scrollbar">
        {tracks.map((t, i) => (
          <div key={t.result.trackId} style={{
            marginBottom: '20px',
            padding: '16px',
            background: 'rgba(255,255,255,0.025)',
            border: '1px solid rgba(210,155,50,0.12)',
            borderRadius: '6px',
          }}>
            {/* Song header */}
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '14px' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={t.result.artworkUrl100} alt="" style={{ width: '34px', height: '34px', borderRadius: '3px', flexShrink: 0 }} />
              <div>
                <div style={{ fontFamily: "'Inter', sans-serif", fontSize: '13px', color: 'rgba(242,232,217,0.8)' }}>{t.result.trackName}</div>
                <div style={{ fontFamily: "'Inter', sans-serif", fontSize: '11px', color: 'rgba(180,140,60,0.5)' }}>{t.result.artistName}</div>
              </div>
            </div>

            {/* Note textarea */}
            <textarea
              value={t.note}
              placeholder="Write what this song means to you... (max 250 characters)"
              maxLength={250}
              rows={2}
              onChange={e => onUpdate(i, e.target.value, t.sceneId)}
              style={{
                width: '100%', background: 'transparent',
                border: 'none', borderBottom: '1px solid rgba(210,155,50,0.2)',
                padding: '6px 0', color: 'rgba(242,232,217,0.85)',
                fontFamily: "'Caveat', cursive", fontSize: '16px',
                resize: 'none', outline: 'none', lineHeight: 1.55,
                marginBottom: '12px',
              }}
            />
            <div style={{ textAlign: 'right', fontFamily: "'Inter', sans-serif", fontSize: '10px', color: 'rgba(180,140,60,0.3)', marginBottom: '12px' }}>
              {t.note.length}/250
            </div>

            {/* Scene grid */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
              {ALL_SCENES.map(s => (
                <button
                  key={s.id}
                  onClick={() => onUpdate(i, t.note, s.id)}
                  style={{
                    padding: '3px 9px', borderRadius: '20px',
                    border: `1px solid ${t.sceneId === s.id ? 'rgba(210,155,50,0.55)' : 'rgba(255,255,255,0.07)'}`,
                    background: t.sceneId === s.id ? 'rgba(210,155,50,0.14)' : 'transparent',
                    color: t.sceneId === s.id ? 'rgba(230,185,80,0.9)' : 'rgba(180,155,110,0.45)',
                    fontFamily: "'Inter', sans-serif",
                    fontSize: '10px', letterSpacing: '0.04em',
                    cursor: 'pointer', transition: 'all 0.18s ease',
                  }}
                >
                  {s.name}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <button style={btnPrimary(allHaveNotes)} onClick={() => allHaveNotes && onNext()}>
        CREATE ROOM →
      </button>
    </div>
  );
}

// ── Step 4: Share ─────────────────────────────────────────────────────────────
function StepShare({ roomTitle, slug }: { roomTitle: string; slug: string }) {
  const url = typeof window !== 'undefined'
    ? `${window.location.origin}/room/${slug}`
    : `/room/${slug}`;
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2800);
    });
  };

  return (
    <div style={{ maxWidth: '480px', width: '100%', textAlign: 'center' }}>
      <motion.div
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', damping: 18, stiffness: 180 }}
        style={{
          width: '56px', height: '56px', borderRadius: '50%',
          background: 'rgba(210,155,50,0.12)', border: '1px solid rgba(210,155,50,0.35)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 28px', fontSize: '24px',
        }}
      >🎙</motion.div>

      <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 300, color: 'rgba(242,232,217,0.9)', marginBottom: '10px' }}>
        Your room is ready.
      </h2>
      <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '13px', color: 'rgba(180,155,110,0.5)', marginBottom: '36px', lineHeight: 1.65 }}>
        Share this link. When they open it, they'll step into{' '}
        <em style={{ color: 'rgba(220,180,80,0.65)' }}>{roomTitle}</em>.
      </p>

      {/* Clean short URL */}
      <div style={{
        background: 'rgba(255,255,255,0.035)', border: '1px solid rgba(210,155,50,0.2)',
        borderRadius: '5px', padding: '12px 14px',
        fontFamily: "'Inter', sans-serif", fontSize: '13px',
        color: 'rgba(180,155,110,0.8)', marginBottom: '14px',
        letterSpacing: '0.02em', wordBreak: 'break-all',
      }}>
        {url}
      </div>

      <button onClick={copy} style={{
        ...btnPrimary(true),
        width: '100%', marginBottom: '12px',
        background: copied ? 'rgba(80,170,80,0.14)' : 'rgba(210,155,50,0.14)',
        border: `1px solid ${copied ? 'rgba(80,170,80,0.38)' : 'rgba(210,155,50,0.38)'}`,
        color: copied ? 'rgba(120,210,120,0.9)' : 'rgba(230,185,80,0.9)',
      }}>
        {copied ? '✓ COPIED' : 'COPY LINK'}
      </button>

      <Link href={`/room/${slug}`} style={{
        display: 'block', fontFamily: "'Inter', sans-serif",
        fontSize: '11px', color: 'rgba(180,140,60,0.4)',
        textDecoration: 'none', letterSpacing: '0.08em',
      }}>
        enter your room →
      </Link>
    </div>
  );
}

// ── Main wizard ───────────────────────────────────────────────────────────────
export default function CreatePage() {
  const [step, setStep]   = useState<WizardStep>(1);
  const [title, setTitle] = useState('');
  const [tracks, setTracks] = useState<PendingTrack[]>([]);
  const [slug, setSlug]   = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const addTrack = useCallback((r: ItunesSearchResult) => {
    setTracks(p => p.length < 4 ? [...p, { result: r, note: '', sceneId: 'sunny-day' }] : p);
  }, []);

  const removeTrack = useCallback((id: number) => {
    setTracks(p => p.filter(t => t.result.trackId !== id));
  }, []);

  const updateTrack = useCallback((i: number, note: string, sceneId: SceneId) => {
    setTracks(p => { const n = [...p]; n[i] = { ...n[i], note, sceneId }; return n; });
  }, []);

  const handleCreate = useCallback(async () => {
    const newSlug = makeSlug(title);
    setSaving(true);
    setSaveError(null);

    const room: Room = {
      slug: newSlug,
      title,
      createdAt: new Date().toISOString(),
      tracks: tracks.map(t => itunesResultToTrack(t.result, t.note, t.sceneId)),
    };

    // Always cache locally so the creator can revisit without network
    saveRoom(room);

    // Persist to Redis so shared links work without ?d= param
    try {
      const res = await fetch('/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(room),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
    } catch (err) {
      console.error('[handleCreate] Redis save failed:', err);
      setSaveError('Could not reach the server — your room was saved locally only.');
    }

    setSlug(newSlug);
    setSaving(false);
    setStep(4);
  }, [title, tracks]);

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'linear-gradient(135deg, #0D0804 0%, #140C06 50%, #0D0804 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      overflow: 'hidden',
    }}>
      {/* 720 × 1280 Frame Container */}
      <div style={{
        position: 'relative',
        height: '100vh',
        maxHeight: '1280px',
        aspectRatio: '720 / 1280',
        maxWidth: '100vw',
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px 32px 40px',
        background: 'rgba(18, 12, 7, 0.75)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderLeft: '1px solid rgba(255,200,100,0.08)',
        borderRight: '1px solid rgba(255,200,100,0.08)',
        boxShadow: '0 0 80px rgba(0,0,0,0.8)',
        overflowY: 'auto',
        zIndex: 2,
      }}>
        {/* Top left wordmark / home link */}
        <Link href="/" style={{ textDecoration: 'none' }}>
          <div style={{
            position: 'absolute', top: '24px', left: '28px',
            fontFamily: "'Cormorant Garamond', serif", fontSize: '17px',
            fontWeight: 300, color: 'rgba(180,140,60,0.6)',
            letterSpacing: '0.1em', cursor: 'pointer',
            zIndex: 20,
          }}>
            Roomtone
          </div>
        </Link>

        <Steps current={step} />

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            variants={fade}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.38, ease: 'easeInOut' }}
            style={{ width: '100%', display: 'flex', justifyContent: 'center' }}
          >
            {step === 1 && (
              <StepTitle onNext={t => { setTitle(t); setStep(2); }} />
            )}
            {step === 2 && (
              <StepSongs
                selected={tracks}
                onSelect={addTrack}
                onRemove={removeTrack}
                onNext={() => setStep(3)}
              />
            )}
            {step === 3 && (
              <StepNotes
                tracks={tracks}
                onUpdate={updateTrack}
                onNext={handleCreate}
              />
            )}
            {step === 4 && (
              saving
                ? (
                  <div style={{ textAlign: 'center', fontFamily: "'Inter', sans-serif", fontSize: '13px', color: 'rgba(180,155,110,0.55)' }}>
                    <motion.div
                      animate={{ opacity: [0.4, 1, 0.4] }}
                      transition={{ repeat: Infinity, duration: 1.4, ease: 'easeInOut' }}
                    >
                      Creating your room…
                    </motion.div>
                  </div>
                )
                : (
                  <>
                    <StepShare roomTitle={title} slug={slug} />
                    {saveError && (
                      <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '11px', color: 'rgba(210,80,80,0.65)', marginTop: '12px', textAlign: 'center' }}>
                        {saveError}
                      </p>
                    )}
                  </>
                )
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
