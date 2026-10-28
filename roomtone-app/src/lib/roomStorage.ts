import type { Room } from '@/types/room';
import { proxyPreviewUrl } from '@/lib/itunes';

// ─────────────────────────────────────────────────────────────────────────────
// roomStorage — localStorage-based room persistence
// Rooms are stored with raw previewUrls and proxied on load.
// ─────────────────────────────────────────────────────────────────────────────

const PREFIX = 'rt_room_';

/** Re-proxy all previewUrls on load — handles old saves + cross-origin shares */
function reproxy(room: Room): Room {
  if (typeof window === 'undefined') return room;
  return {
    ...room,
    tracks: room.tracks.map(t => ({
      ...t,
      previewUrl: proxyPreviewUrl(t.previewUrl),
    })),
  };
}

export function saveRoom(room: Room): void {
  if (typeof window === 'undefined') return;
  try {
    // Save raw URLs (no proxy prefix) so the data is portable
    const toSave: Room = {
      ...room,
      tracks: room.tracks.map(t => {
        // Strip any existing proxy prefix before saving
        const raw = t.previewUrl.startsWith('/api/preview?url=')
          ? decodeURIComponent(t.previewUrl.replace('/api/preview?url=', ''))
          : t.previewUrl;
        return { ...t, previewUrl: raw };
      }),
    };
    localStorage.setItem(PREFIX + room.slug, JSON.stringify(toSave));
  } catch (err) {
    console.error('[roomStorage] save failed:', err);
  }
}

export function loadRoom(slug: string): Room | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(PREFIX + slug);
    if (!raw) return null;
    return reproxy(JSON.parse(raw) as Room);
  } catch {
    return null;
  }
}

export function listRooms(): Room[] {
  if (typeof window === 'undefined') return [];
  const rooms: Room[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith(PREFIX)) {
      try {
        rooms.push(reproxy(JSON.parse(localStorage.getItem(key)!) as Room));
      } catch { /* skip corrupt entries */ }
    }
  }
  return rooms.sort((a, b) => (b.createdAt > a.createdAt ? 1 : -1));
}

export function deleteRoom(slug: string): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(PREFIX + slug);
}

/** Generate a URL-safe slug from a room title */
export function makeSlug(title: string): string {
  const base = title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .slice(0, 38);
  const rand = Math.random().toString(36).slice(2, 7);
  return `${base}-${rand}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// URL-embedding helpers — encode a Room into a query-param string so the full
// room data travels in the share link (no server DB required on Vercel).
// ─────────────────────────────────────────────────────────────────────────────

/** Encode a Room to a compact URL-safe string (raw previewUrls, no proxy). */
export function encodeRoomForUrl(room: Room): string {
  const toEncode: Room = {
    ...room,
    tracks: room.tracks.map(t => {
      // Strip proxy prefix before encoding so URLs are portable
      const raw = t.previewUrl.startsWith('/api/preview?url=')
        ? decodeURIComponent(t.previewUrl.replace('/api/preview?url=', ''))
        : t.previewUrl;
      return { ...t, previewUrl: raw };
    }),
  };
  return encodeURIComponent(JSON.stringify(toEncode));
}

/** Decode a Room from an encoded URL param. Returns null on any parse error. */
export function decodeRoomFromUrl(encoded: string): Room | null {
  try {
    const room = JSON.parse(decodeURIComponent(encoded)) as Room;
    return reproxy(room);
  } catch {
    return null;
  }
}
