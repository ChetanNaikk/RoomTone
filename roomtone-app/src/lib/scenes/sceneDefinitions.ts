import type { Scene, SceneId } from '@/types/scene';

// ─────────────────────────────────────────────────────────────────────────────
// 11 Scene Definitions — each backed by a looping MP4 room video
// Video files live in /public/videos/
// ─────────────────────────────────────────────────────────────────────────────

export const SCENES: Record<SceneId, Scene> = {
  'sunny-day': {
    id: 'sunny-day',
    name: 'Sunny Day',
    videoSrc: '/videos/sunny_day.mp4',
    weather: 'clear',
    ambientSoundId: 'wind-gentle',
    transitionBehavior: { duration: 1500, easing: 'easeInOut' },
  },

  'bright-day': {
    id: 'bright-day',
    name: 'Bright Day',
    videoSrc: '/videos/bright_day.mp4',
    weather: 'clear',
    ambientSoundId: 'forest-birds',
    transitionBehavior: { duration: 1500, easing: 'easeInOut' },
  },

  'sunrise': {
    id: 'sunrise',
    name: 'Sunrise',
    videoSrc: '/videos/sunrise.mp4',
    weather: 'clear',
    ambientSoundId: 'forest-birds',
    transitionBehavior: { duration: 2000, easing: 'easeInOut' },
  },

  'sunset': {
    id: 'sunset',
    name: 'Sunset',
    videoSrc: '/videos/sunset_day.mp4',
    weather: 'clear',
    ambientSoundId: 'wind-gentle',
    transitionBehavior: { duration: 2000, easing: 'easeInOut' },
  },

  'blue-hour': {
    id: 'blue-hour',
    name: 'Blue Hour',
    videoSrc: '/videos/blue_hour.mp4',
    weather: 'clear',
    ambientSoundId: 'silence',
    transitionBehavior: { duration: 2500, easing: 'easeInOut' },
  },

  'northern-lights': {
    id: 'northern-lights',
    name: 'Northern Lights',
    videoSrc: '/videos/northern_lights.mp4',
    weather: 'aurora',
    ambientSoundId: 'silence',
    transitionBehavior: { duration: 3000, easing: 'easeInOut' },
  },

  'rainy-day': {
    id: 'rainy-day',
    name: 'Rainy Day',
    videoSrc: '/videos/rainy_day.mp4',
    weather: 'rain',
    ambientSoundId: 'rain-light',
    transitionBehavior: { duration: 1500, easing: 'easeInOut' },
  },

  'heavy-rain': {
    id: 'heavy-rain',
    name: 'Heavy Rain',
    videoSrc: '/videos/heavy_rain.mp4',
    weather: 'heavy-rain',
    ambientSoundId: 'rain-heavy',
    transitionBehavior: { duration: 1500, easing: 'easeInOut' },
  },

  'snowfall': {
    id: 'snowfall',
    name: 'Snowfall',
    videoSrc: '/videos/snowfall.mp4',
    weather: 'snow',
    ambientSoundId: 'wind-gentle',
    transitionBehavior: { duration: 2000, easing: 'easeInOut' },
  },

  'autumn': {
    id: 'autumn',
    name: 'Autumn',
    videoSrc: '/videos/autumn_day.mp4',
    weather: 'clear',
    ambientSoundId: 'wind-gentle',
    transitionBehavior: { duration: 2000, easing: 'easeInOut' },
  },

  'cherry-blossoms': {
    id: 'cherry-blossoms',
    name: 'Cherry Blossoms',
    videoSrc: '/videos/blossom_day.mp4',
    weather: 'clear',
    ambientSoundId: 'forest-birds',
    transitionBehavior: { duration: 2000, easing: 'easeInOut' },
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Scene Engine — Resolves scene data by ID
// ─────────────────────────────────────────────────────────────────────────────

export function getScene(id: SceneId): Scene {
  return SCENES[id] ?? SCENES['sunny-day'];
}

export function getAllScenes(): Scene[] {
  return Object.values(SCENES);
}

export const DEFAULT_SCENE_ID: SceneId = 'sunny-day';
export const DEFAULT_VIDEO_SRC = '/videos/default_day.mp4';
