# Roomtone — Implementation Plan

> "Share a moment, not just music."

A cinematic, emotional storytelling experience — not a music player. A 2.5D layered room where memories live.

---

## Overview

Roomtone is a two-sided product:
1. **Creator Flow** — Build a room with 3–4 songs, each linked to a scene, note, and ambient sound
2. **Recipient Flow** — Open a shared URL, enter the room, press Play, and feel

The tech stack is pre-specified. This plan covers architecture, file structure, visual design system, and phased build order.

---

## Open Questions

> [!IMPORTANT]
> **Music Source** — The spec mentions Spotify, Apple Music, iTunes, Deezer preview URLs. For a zero-backend demo, **iTunes Search API** is CORS-friendly and returns 30-second preview URLs with no auth. Recommend starting with iTunes API as primary source. Agree?

> [!IMPORTANT]
> **Authentication** — The spec includes Supabase Auth, but the recipient flow explicitly says "No login." Should creator login be required to save/publish a room? Or should we start with a public-write, link-based system (no login needed to create)?

> [!IMPORTANT]
> **Backend First or Frontend First?** — The frontend experience is the entire emotional payload. Recommend building the full frontend with mock data first, then wiring the FastAPI backend. Does that work?

> [!WARNING]
> **External Services** — Full deployment (Vercel, Railway, Supabase, AWS S3) requires API keys and accounts. This plan will build the complete codebase locally and provide `.env.example` files. You'll need to provision these services separately.

---

## Architecture Decision: Phased Build

### Phase 1 — Frontend Foundation (Complete Experience)
The recipient room experience + Creator flow — fully functional with mock data and iTunes API previews. This is the entire emotional product.

### Phase 2 — Backend (FastAPI + PostgreSQL)
Room persistence, shareable URLs, Supabase Auth for creators.

### Phase 3 — Polish
S3 for custom uploads, deployment configs, progressive enhancements.

---

## Proposed Changes

### Frontend — Next.js 15 App

---

#### [NEW] `package.json`
Core dependencies:
- `next@15`, `react@19`, `typescript`
- `tailwindcss@4`, `framer-motion`, `gsap`
- `howler` + `@types/howler`
- `zustand`, `@tanstack/react-query`
- `clsx`, `tailwind-merge`

---

#### [NEW] Design System (`src/styles/`)
- `globals.css` — CSS custom properties for the Roomtone color palette (warm walnut, cream, fog blue, golden orange), font imports (Cormorant Garamond, Inter, Caveat from Google Fonts)
- Tailwind config extending theme with Roomtone tokens

---

#### [NEW] Scene Engine (`src/lib/scenes/`)
The architectural centrepiece. A scene is a self-contained descriptor:
```typescript
interface Scene {
  id: SceneId
  name: string
  weather: WeatherType
  skyGradient: [string, string, string]   // top → mid → horizon
  lightingColor: string                    // room tint
  lightingIntensity: number
  ambientSoundId: AmbientSoundId
  particleConfig: ParticleConfig
  transitionBehavior: TransitionBehavior
  windowReflectionTint: string
  curtainMovement: 'still' | 'gentle' | 'active'
}
```

15 scenes defined: Rain, Heavy Rain, Thunderstorm, Sunrise, Golden Sunset, Blue Hour, Night City, Snow, Forest, Ocean, Mountains, Autumn, Cherry Blossoms, Northern Lights, Cloudy Afternoon.

Each song references a `SceneId`. The Scene Engine resolves everything else.

---

#### [NEW] Room Layer Components (`src/components/`)

```
room/
  RoomCanvas.tsx         — Full-screen 2.5D stage, manages layer z-index
  RoomScene.tsx          — Orchestrates all layers + scene transitions

window/
  WindowFrame.tsx        — Wooden frame, glass pane, reflections
  WeatherCanvas.tsx      — Canvas-based animated sky + weather
  GlassReflection.tsx    — Dynamic overlay shifting with scene

weather/
  RainEffect.tsx         — CSS/Canvas animated raindrops
  SnowEffect.tsx         — Snowflake particles
  CloudLayer.tsx         — Drifting cloud SVGs
  LightningEffect.tsx    — Thunderstorm flash
  LeafEffect.tsx         — Autumn/Forest leaves
  PetalEffect.tsx        — Cherry blossom petals
  AuroraEffect.tsx       — Northern Lights shimmering

radio/
  Radio.tsx              — Complete vintage radio component
  RadioKnob.tsx          — Rotating interactive knob
  FrequencyDial.tsx      — Needle + scale display
  PowerIndicator.tsx     — Glowing orange LED
  NoteDisplay.tsx        — Typewriter handwritten note on radio display

lamp/
  Lamp.tsx               — Table lamp with flickering glow animation
  LampGlow.tsx           — Radial light overlay on room

curtains/
  Curtains.tsx           — Swaying curtain panels (Framer Motion)

atmosphere/
  DustParticles.tsx      — Floating dust motes (canvas)
  CoffeeSteam.tsx        — Rising steam animation (SVG path)
  BookShelf.tsx          — Static books with subtle parallax

audio/
  AudioEngine.ts         — Howler.js wrapper: music + ambient crossfade
  useAudio.ts            — Hook exposing play/pause/next/scene controls

controls/
  PlayButton.tsx         — Minimal play/pause integrated into radio
  NextButton.tsx         — Next memory button
```

---

#### [NEW] Scene Transition System (`src/lib/transitions/`)
`SceneTransition.ts` — GSAP timeline that coordinates:
1. Music crossfade (Howler fade out → fade in)
2. Weather effect swap (opacity crossfade)
3. Sky gradient morph
4. Room lighting tint morph
5. Ambient sound crossfade
6. Note display update (typewriter)
7. Knob rotation animation

Duration: 2.5s total, staggered so nothing feels simultaneous.

---

#### [NEW] Creator Flow (`src/app/create/`)
- `page.tsx` — Multi-step creator wizard (no router, single page state machine)
- Steps: Room title → Song search → Note + Scene → Generate URL
- Uses iTunes Search API for song lookup
- Generates room JSON, stores in Zustand, POSTs to backend

---

#### [NEW] Recipient Flow (`src/app/room/[slug]/`)
- `page.tsx` — Immediate room entry, no loading screen
- Fetches room data (or uses mock), hydrates Scene Engine

---

#### [NEW] State Management (`src/store/`)
- `roomStore.ts` — Zustand store: current room, current track index, playback state, scene state, transition status

---

#### [NEW] Types (`src/types/`)
- `room.ts`, `scene.ts`, `track.ts`, `audio.ts`

---

### Backend — FastAPI

---

#### [NEW] `backend/`
```
main.py
routers/
  rooms.py        — POST /rooms, GET /rooms/{slug}
  music.py        — GET /music/search?q=
models/
  room.py         — SQLAlchemy Room + Track models
schemas/
  room.py         — Pydantic request/response
database.py       — SQLAlchemy + Alembic setup
alembic/          — Migrations
requirements.txt
.env.example
```

Endpoints:
- `POST /api/rooms` — Save room, return slug
- `GET /api/rooms/{slug}` — Fetch room by slug
- `GET /api/music/search?q={query}` — Proxy to iTunes API

---

### Configuration

#### [NEW] `frontend/.env.example`
```
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_ITUNES_API_URL=https://itunes.apple.com
```

#### [NEW] `backend/.env.example`
```
DATABASE_URL=postgresql://user:pass@localhost:5432/roomtone
SECRET_KEY=your-secret-key
```

---

## Verification Plan

### During Build
- Dev server: `npm run dev` — verify room renders
- Scene transitions tested with keyboard shortcuts
- Audio engine tested with real iTunes preview URLs

### Manual Verification
1. Open `http://localhost:3000/room/demo` — enter room immediately
2. Press Play — power LED glows, static, music fades in
3. Press Next — knob rotates, sky changes, lighting shifts, note types out
4. Open `http://localhost:3000/create` — complete creator wizard
5. Generate room URL — verify shareable link works

---

## Build Order

1. `create-next-app` scaffold + Tailwind + dependencies
2. Global CSS design system (colors, fonts, tokens)
3. Scene Engine (type definitions + 15 scene configs)
4. RoomCanvas (2.5D layered stage)
5. WeatherCanvas (animated sky + weather per scene)
6. Radio component (full visual + knobs + display)
7. AudioEngine (Howler.js)
8. Scene transitions (GSAP timeline)
9. All atmosphere components (lamp, curtains, dust, steam)
10. NoteDisplay (typewriter)
11. Creator wizard
12. FastAPI backend
13. Wire frontend → backend
