'use client';

import { useCallback, useEffect, useRef } from 'react';
import { getAudioEngine } from '@/lib/audio/audioEngine';
import { getScene } from '@/lib/scenes/sceneDefinitions';
import { useRoomStore } from '@/store/roomStore';

export function useAudio() {
  const {
    room,
    playback,
    setPlaying,
    setTransitioning,
    setHasStarted,
    setActiveSceneId,
    setProgress,
    musicVolume,
    ambientVolume,
  } = useRoomStore();

  const initializedRef = useRef(false);
  // Use a ref for the "do next track" logic so the onTrackEnd callback
  // always sees the latest version without stale closures.
  const doNextRef = useRef<(() => void) | null>(null);

  // ── Init ───────────────────────────────────────────────────────────────────
  const initEngine = useCallback(async () => {
    if (initializedRef.current) return;
    initializedRef.current = true;
    await getAudioEngine().init();
  }, []);

  // ── Play a specific track index ────────────────────────────────────────────
  const startTrack = useCallback(async (index: number, crossfade: boolean) => {
    const { room: r, musicVolume: vol } = useRoomStore.getState();
    if (!r) return;
    const track = r.tracks[index];
    if (!track) return;

    const engine = getAudioEngine();
    const scene = getScene(track.sceneId);
    setActiveSceneId(track.sceneId);
    engine.playAmbient(scene.ambientSoundId, 2000);

    try {
      if (crossfade) {
        await engine.crossfadeTo(track.previewUrl, 2200);
      } else {
        await engine.loadAndPlay(track.previewUrl, vol);
      }
      setPlaying(true);
      setProgress(0, 30);
    } catch (err) {
      console.warn('[useAudio] playback error, ambient continues:', err);
      setPlaying(true); // ambient is still running
    }
  }, [setActiveSceneId, setPlaying, setProgress]);

  // ── Advance to the next track ──────────────────────────────────────────────
  const doNext = useCallback(async () => {
    const state = useRoomStore.getState();
    if (!state.room || state.playback.isTransitioning) return;

    const nextIdx = (state.playback.currentTrackIndex + 1) % state.room.tracks.length;
    const engine = getAudioEngine();

    setTransitioning(true);
    engine.playClick();
    engine.playTuningStatic(700);

    // Update track index immediately so UI reacts
    state.setCurrentTrack(nextIdx);
    setProgress(0, 30);

    await startTrack(nextIdx, true);
    setTimeout(() => setTransitioning(false), 2500);
  }, [startTrack, setTransitioning, setProgress]);

  // Keep the ref in sync so onTrackEnd always has the latest doNext
  useEffect(() => { doNextRef.current = doNext; }, [doNext]);

  // ── Wire engine callbacks once on mount ────────────────────────────────────
  useEffect(() => {
    const engine = getAudioEngine();
    let advancing = false;

    engine.setOnProgress((seek, dur) => setProgress(seek, dur));

    engine.setOnTrackEnd(() => {
      if (advancing) return;
      advancing = true;
      setTimeout(() => {
        advancing = false;
        doNextRef.current?.();
      }, 900);
    });

    return () => {
      engine.setOnTrackEnd(null);
      engine.setOnProgress(null);
    };
  // setProgress is stable, intentionally omitted
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Public actions ─────────────────────────────────────────────────────────

  const play = useCallback(async () => {
    if (!room) return;
    await initEngine();
    const engine = getAudioEngine();
    await engine.resumeContext();
    engine.playClick();

    // Small mechanical delay
    await new Promise(r => setTimeout(r, 80));
    engine.playTuningStatic(400);
    setHasStarted(true);

    await startTrack(playback.currentTrackIndex, false);
  }, [room, playback.currentTrackIndex, initEngine, setHasStarted, startTrack]);

  const pause = useCallback(() => {
    getAudioEngine().playClick();
    getAudioEngine().pause();
    setPlaying(false);
  }, [setPlaying]);

  const resume = useCallback(async () => {
    await initEngine();
    const engine = getAudioEngine();
    await engine.resumeContext();
    engine.playClick();
    engine.resume();
    setPlaying(true);
  }, [initEngine, setPlaying]);

  const toggle = useCallback(async () => {
    if (!playback.hasStarted) await play();
    else if (playback.isPlaying) pause();
    else await resume();
  }, [playback.hasStarted, playback.isPlaying, play, pause, resume]);

  const nextTrack = useCallback(async () => {
    if (!playback.hasStarted) return;
    await doNext();
  }, [playback.hasStarted, doNext]);

  const seekTo = useCallback((s: number) => { getAudioEngine().seek(s); }, []);

  // ── Volume sync ────────────────────────────────────────────────────────────
  useEffect(() => { getAudioEngine().setMusicVolume(musicVolume); }, [musicVolume]);
  useEffect(() => { getAudioEngine().setAmbientVolume(ambientVolume); }, [ambientVolume]);

  return { play, pause, resume, toggle, nextTrack, seekTo, initEngine };
}
