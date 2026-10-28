// ─────────────────────────────────────────────────────────────────────────────
// Scene System — 11 scenes, each backed by a looping MP4 video
// ─────────────────────────────────────────────────────────────────────────────

export type SceneId =
  | 'sunny-day'
  | 'bright-day'
  | 'sunrise'
  | 'sunset'
  | 'blue-hour'
  | 'northern-lights'
  | 'rainy-day'
  | 'heavy-rain'
  | 'snowfall'
  | 'autumn'
  | 'cherry-blossoms';

export type WeatherType =
  | 'rain'
  | 'heavy-rain'
  | 'snow'
  | 'clear'
  | 'aurora'
  | 'none';

export type AmbientSoundId =
  | 'rain-light'
  | 'rain-heavy'
  | 'thunderstorm'
  | 'forest-birds'
  | 'ocean-waves'
  | 'city-night'
  | 'wind-gentle'
  | 'fireplace'
  | 'silence';

export type CurtainMovement = 'still' | 'gentle' | 'active';

export interface SkyGradient {
  top: string;
  mid: string;
  horizon: string;
}

export interface ParticleConfig {
  type: 'rain' | 'snow' | 'leaves' | 'petals' | 'dust' | 'none';
  density: number;         // 0–1
  speed: number;           // relative speed multiplier
  opacity: number;         // 0–1
  color?: string;
}

export interface TransitionBehavior {
  duration: number;        // milliseconds
  easing: string;          // CSS/GSAP easing name
}

export interface Scene {
  id: SceneId;
  name: string;
  videoSrc: string;          // path relative to /public  e.g. '/videos/sunny_day.mp4'
  weather: WeatherType;
  ambientSoundId: AmbientSoundId;
  transitionBehavior: TransitionBehavior;
}
