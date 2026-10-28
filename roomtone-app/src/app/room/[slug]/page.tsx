'use client';

import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useRoomStore } from '@/store/roomStore';
import RoomCanvas from '@/components/room/RoomCanvas';
import { DEMO_ROOM } from '@/lib/mockRoom';
import { loadRoom, saveRoom, decodeRoomFromUrl } from '@/lib/roomStorage';
import { proxyPreviewUrl } from '@/lib/itunes';
import { getAudioEngine } from '@/lib/audio/audioEngine';
import type { Room } from '@/types/room';

export default function RoomPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const { room, setRoom, setPlaying, setCurrentTrack, setTransitioning, setHasStarted,
          setActiveSceneId, setProgress } = useRoomStore();

  useEffect(() => {
    if (!slug) return;

    // Stop any audio from a previous room
    getAudioEngine().stop();

    // Reset all playback state so we get a clean "press play" experience
    setPlaying(false);
    setCurrentTrack(0);
    setTransitioning(false);
    setHasStarted(false);
    setActiveSceneId('sunny-day');
    setProgress(0, 30);

    async function loadRoomData() {
      // 1. Try localStorage first (creator's own browser, or previously cached)
      const cached = loadRoom(slug);
      if (cached) { setRoom(cached); return; }

      // 2. Backward-compat: try URL-embedded data (?d=<encoded>) from old share links
      const searchParams = new URLSearchParams(window.location.search);
      const encoded = searchParams.get('d');
      if (encoded) {
        const decoded = decodeRoomFromUrl(encoded);
        if (decoded) {
          saveRoom(decoded); // cache in localStorage for future visits
          setRoom(decoded);
          return;
        }
      }

      // 3. Fetch from Redis via API (primary path for shared links)
      try {
        const res = await fetch(`/api/rooms/${slug}`);
        if (res.ok) {
          const apiRoom = (await res.json()) as Room;
          // Re-proxy previewUrls for this browser session
          const proxied: Room = {
            ...apiRoom,
            tracks: apiRoom.tracks.map(t => ({
              ...t,
              previewUrl: proxyPreviewUrl(t.previewUrl),
            })),
          };
          saveRoom(proxied); // cache locally for future visits
          setRoom(proxied);
          return;
        }
      } catch (err) {
        console.warn('[RoomPage] API fetch failed:', err);
      }

      // 4. Fall back to demo room
      const demo: typeof DEMO_ROOM = {
        ...DEMO_ROOM,
        slug,
        tracks: DEMO_ROOM.tracks.map(t => ({
          ...t,
          previewUrl: proxyPreviewUrl(t.previewUrl),
        })),
      };
      setRoom(demo);
    }

    loadRoomData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  if (!room) {
    return (
      <div style={{
        width: '100vw', height: '100vh',
        background: '#0D0804',
      }} />
    );
  }

  return <RoomCanvas room={room} />;
}
