import type { Room } from '@/types/room';

// ─────────────────────────────────────────────────────────────────────────────
// Demo room — real iTunes 30s previews, routed through /api/preview proxy
// ─────────────────────────────────────────────────────────────────────────────

// Raw Apple CDN URLs — proxy applied lazily at runtime (not at module load time)
// so SSR doesn't bake in raw URLs
const RAW_URLS = {
  track1: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/69/38/5e/69385ef6-6678-63b2-5c0b-0d7e5db81c8c/mzaf_2898287790486314171.plus.aac.p.m4a',
  track2: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/ab/9a/93/ab9a931d-93d3-71f8-8faf-73366409df82/mzaf_5843577385542178088.plus.aac.p.m4a',
  track3: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview116/v4/e3/6b/b4/e36bb4f2-a700-79f6-9f4b-0b895018b792/mzaf_3105351849404506325.plus.aac.p.m4a',
  track4: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/5d/e8/db/5de8db2a-16e9-9952-1e92-72c8bd66c466/mzaf_12453809584145821574.plus.aac.p.m4a',
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
      albumArt: 'https://is1-ssl.mzstatic.com/image/thumb/Music114/v4/55/56/b3/5556b3cc-b04c-f323-a1f9-84654c5c189a/artwork.jpg/300x300bb.jpg',
      previewUrl: RAW_URLS.track1,
      note: "This was playing the night we stayed up watching the rain hit the window. I still can't listen to it without feeling the warmth of that evening.",
      sceneId: 'sunny-day',
    },
    {
      id: '2',
      title: 'Experience',
      artist: 'Ludovico Einaudi',
      albumArt: 'https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/13/fd/7b/13fd7bfd-125a-4493-dc85-96aef9c25562/12UMGIM65023.rgb.jpg/300x300bb.jpg',
      previewUrl: RAW_URLS.track2,
      note: 'The first morning of a trip we were both nervous about. By the time we landed, everything felt possible.',
      sceneId: 'sunrise',
    },
    {
      id: '3',
      title: 'Gymnopédie No. 1',
      artist: 'Erik Satie',
      albumArt: 'https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/d9/6f/d5/d96fd59f-22a4-9c42-7ce4-1d0aafa841d2/752470763120_cover.jpg/300x300bb.jpg',
      previewUrl: RAW_URLS.track3,
      note: 'Sunday afternoons when time feels suspended. Coffee going cold. Neither of us wanting to move.',
      sceneId: 'snowfall',
    },
    {
      id: '4',
      title: 'River Flows in You',
      artist: 'Yiruma',
      albumArt: 'https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/5f/f4/9b/5ff49b8c-d0bb-3748-14f4-131edfb332ce/first_love_3000.jpg/300x300bb.jpg',
      previewUrl: RAW_URLS.track4,
      note: "The night before you left. I pressed play and we didn't say anything for a long time. Some songs carry more than words.",
      sceneId: 'blue-hour',
    },
  ],
};
