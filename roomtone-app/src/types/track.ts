import type { SceneId } from './scene';

export interface Track {
  id: string;
  title: string;
  artist: string;
  albumArt: string;          // URL to album artwork
  previewUrl: string;        // 30-second preview URL (iTunes)
  note: string;              // Personal note, max 250 chars
  sceneId: SceneId;
  duration?: number;         // seconds, optional
}

export interface ItunesSearchResult {
  trackId: number;
  trackName: string;
  artistName: string;
  artworkUrl100: string;
  artworkUrl60?: string;
  previewUrl: string;
  collectionName?: string;
  trackTimeMillis?: number;
}
