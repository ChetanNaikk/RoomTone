'use client';

import { create } from 'zustand';
import type { Room, RoomPlaybackState } from '@/types/room';
import type { SceneId } from '@/types/scene';

interface RoomStore {
  // Room data
  room: Room | null;
  setRoom: (room: Room) => void;

  // Playback state
  playback: RoomPlaybackState;
  setPlaying: (playing: boolean) => void;
  setCurrentTrack: (index: number) => void;
  setTransitioning: (transitioning: boolean) => void;
  setHasStarted: (started: boolean) => void;

  // Playback progress (seek / duration for the 30s preview)
  progress: { seek: number; duration: number };
  setProgress: (seek: number, duration: number) => void;

  // Scene override
  activeSceneId: SceneId | null;
  setActiveSceneId: (id: SceneId) => void;

  // Current displayed note
  displayedNote: string;
  setDisplayedNote: (note: string) => void;

  // Actions
  nextTrack: () => void;
  prevTrack: () => void;

  // Volume
  musicVolume: number;
  ambientVolume: number;
  setMusicVolume: (v: number) => void;
  setAmbientVolume: (v: number) => void;
}

export const useRoomStore = create<RoomStore>((set, get) => ({
  room: null,
  setRoom: (room) => set({ room }),

  playback: {
    isPlaying: false,
    currentTrackIndex: 0,
    isTransitioning: false,
    hasStarted: false,
  },

  setPlaying: (isPlaying) =>
    set((s) => ({ playback: { ...s.playback, isPlaying } })),

  setCurrentTrack: (currentTrackIndex) =>
    set((s) => ({ playback: { ...s.playback, currentTrackIndex } })),

  setTransitioning: (isTransitioning) =>
    set((s) => ({ playback: { ...s.playback, isTransitioning } })),

  setHasStarted: (hasStarted) =>
    set((s) => ({ playback: { ...s.playback, hasStarted } })),

  progress: { seek: 0, duration: 30 },
  setProgress: (seek, duration) => set({ progress: { seek, duration } }),

  activeSceneId: null,
  setActiveSceneId: (id) => set({ activeSceneId: id }),

  displayedNote: '',
  setDisplayedNote: (displayedNote) => set({ displayedNote }),

  nextTrack: () => {
    const { room, playback } = get();
    if (!room) return;
    const next = (playback.currentTrackIndex + 1) % room.tracks.length;
    set((s) => ({ playback: { ...s.playback, currentTrackIndex: next } }));
  },

  prevTrack: () => {
    const { room, playback } = get();
    if (!room) return;
    const prev =
      playback.currentTrackIndex === 0
        ? room.tracks.length - 1
        : playback.currentTrackIndex - 1;
    set((s) => ({ playback: { ...s.playback, currentTrackIndex: prev } }));
  },

  musicVolume: 0.55,
  ambientVolume: 0.08,
  setMusicVolume: (musicVolume) => set({ musicVolume }),
  setAmbientVolume: (ambientVolume) => set({ ambientVolume }),
}));
