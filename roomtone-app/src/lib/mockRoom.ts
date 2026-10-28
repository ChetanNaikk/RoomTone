import type { Room } from '@/types/room';

// ─────────────────────────────────────────────────────────────────────────────
// Demo room — real iTunes 30s previews, routed through /api/preview proxy
// ─────────────────────────────────────────────────────────────────────────────

// Raw Apple CDN URLs — proxy applied lazily at runtime (not at module load time)
// so SSR doesn't bake in raw URLs
const RAW_URLS = {
  track1: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview125/v4/bc/34/ab/bc34ab5a-f09d-0ce6-d8a7-3b7a5c9e5a4d/mzaf_9006715823453090670.plus.aac.ep.m4a',
  track2: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview115/v4/14/7b/c3/147bc3e5-6a28-2f64-43c5-0af3095de4a6/mzaf_2890578695484534919.plus.aac.ep.m4a',
  track3: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview115/v4/2e/2e/37/2e2e3714-e2e3-9c6a-2e12-ab16a1cb4be3/mzaf_6282652463764649022.plus.aac.ep.m4a',
  track4: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview115/v4/8b/0d/09/8b0d093b-1bfe-4c20-5c8a-c09bd51985c1/mzaf_5861591765432524018.plus.aac.ep.m4a',
};

export const DEMO_ROOM: Room = {
  slug: 'an-evening-with-you-ehf0o',
  title: 'An Evening I Keep Returning To',
  createdAt: new Date().toISOString(),
  tracks: [
    {
      id: '1',
      title: "Comptine d'un autre été",
      artist: 'Yann Tiersen',
      albumArt: 'https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/3e/04/c4/3e04c4e7-1863-34b2-5a28-a4c27b30f6fa/cover.jpg/300x300bb.jpg',
      previewUrl: RAW_URLS.track1,
      note: "This was playing the night we stayed up watching the rain hit the window. I still can't listen to it without feeling the warmth of that evening.",
      sceneId: 'sunny-day',
    },
    {
      id: '2',
      title: 'Experience',
      artist: 'Ludovico Einaudi',
      albumArt: 'https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/0d/42/3e/0d423e86-05b9-2d53-fdb3-03c88d2c2536/cover.jpg/300x300bb.jpg',
      previewUrl: RAW_URLS.track2,
      note: 'The first morning of a trip we were both nervous about. By the time we landed, everything felt possible.',
      sceneId: 'sunrise',
    },
    {
      id: '3',
      title: 'Gymnopédie No. 1',
      artist: 'Erik Satie',
      albumArt: 'https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/6a/4c/95/6a4c9598-4780-5e23-0e4e-8e5e7c31dd94/cover.jpg/300x300bb.jpg',
      previewUrl: RAW_URLS.track3,
      note: 'Sunday afternoons when time feels suspended. Coffee going cold. Neither of us wanting to move.',
      sceneId: 'snowfall',
    },
    {
      id: '4',
      title: 'River Flows in You',
      artist: 'Yiruma',
      albumArt: 'https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/f5/5a/89/f55a8982-4ddd-3c28-a3c0-2a0fcac6a6e8/cover.jpg/300x300bb.jpg',
      previewUrl: RAW_URLS.track4,
      note: "The night before you left. I pressed play and we didn't say anything for a long time. Some songs carry more than words.",
      sceneId: 'blue-hour',
    },
  ],
};
