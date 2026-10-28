import type { ItunesSearchResult, Track } from '@/types/track';
import type { SceneId } from '@/types/scene';
import { DEFAULT_SCENE_ID } from '@/lib/scenes/sceneDefinitions';

// ─────────────────────────────────────────────────────────────────────────────
// iTunes helpers — all calls go through /api/search to avoid CORS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Search for tracks via the server-side iTunes proxy.
 * Returns only tracks that have a preview URL.
 */
export async function searchItunes(query: string, limit = 15): Promise<ItunesSearchResult[]> {
  if (!query.trim()) return [];

  try {
    const url = `/api/search?q=${encodeURIComponent(query)}&limit=${limit}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Search proxy returned ${res.status}`);
    const data = await res.json();
    return (data.results ?? []) as ItunesSearchResult[];
  } catch (err) {
    console.error('[searchItunes]', err);
    return [];
  }
}

/**
 * Build a proxied preview URL so audio plays without CORS issues.
 * Falls back to the original URL when running on the server.
 */
export function proxyPreviewUrl(originalUrl: string): string {
  if (!originalUrl) return '';
  // On the server (SSR), return original — proxy is client-side only
  if (typeof window === 'undefined') return originalUrl;
  return `/api/preview?url=${encodeURIComponent(originalUrl)}`;
}

/**
 * Convert an iTunes search result into a Roomtone Track.
 * Preview URL is automatically proxied.
 */
export function itunesResultToTrack(
  result: ItunesSearchResult,
  note = '',
  sceneId: SceneId = DEFAULT_SCENE_ID
): Track {
  return {
    id: String(result.trackId),
    title: result.trackName,
    artist: result.artistName,
    albumArt: result.artworkUrl100, // already 300x300 from the proxy
    previewUrl: proxyPreviewUrl(result.previewUrl),
    note,
    sceneId,
    duration: result.trackTimeMillis
      ? Math.round(result.trackTimeMillis / 1000)
      : undefined,
  };
}
