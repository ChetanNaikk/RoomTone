import type { Track } from './track';

export interface Room {
  slug: string;
  title: string;
  createdAt: string;         // ISO date string
  tracks: Track[];           // 3–4 tracks
}

export interface RoomPlaybackState {
  isPlaying: boolean;
  currentTrackIndex: number;
  isTransitioning: boolean;
  hasStarted: boolean;       // first play pressed
}
