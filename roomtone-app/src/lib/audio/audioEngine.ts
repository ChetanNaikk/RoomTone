'use client';

import { Howl } from 'howler';
import type { AmbientSoundId } from '@/types/scene';

type AudioEngineState = 'idle' | 'playing' | 'paused' | 'transitioning';
type TrackEndCallback = () => void;
type ProgressCallback = (seek: number, duration: number) => void;

export class AudioEngine {
  private musicHowl: Howl | null = null;
  private state: AudioEngineState = 'idle';
  private _musicVolume = 0.55;
  private _ambientVolume = 0.08;

  private onTrackEnd: TrackEndCallback | null = null;
  private onProgress: ProgressCallback | null = null;
  private progressInterval: ReturnType<typeof setInterval> | null = null;

  private audioCtx: AudioContext | null = null;
  private ambientNodes: AudioNode[] = [];
  private ambientGain: GainNode | null = null;
  private currentAmbientId: AmbientSoundId | null = null;
  private clickBuffer: AudioBuffer | null = null;

  // ── Init ───────────────────────────────────────────────────────────────────

  async init(): Promise<void> {
    if (typeof window === 'undefined') return;
    // Guard: already initialized — don't create a second AudioContext
    if (this.audioCtx) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.audioCtx = new ((window as any).AudioContext || (window as any).webkitAudioContext)();
    this.ambientGain = this.audioCtx!.createGain();
    this.ambientGain.gain.value = 0;
    this.ambientGain.connect(this.audioCtx!.destination);
    await this.preloadClickSound();
  }

  private async preloadClickSound(): Promise<void> {
    if (!this.audioCtx) return;
    const frames = Math.floor(this.audioCtx.sampleRate * 0.04);
    const buf = this.audioCtx.createBuffer(1, frames, this.audioCtx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < frames; i++) {
      const t = i / this.audioCtx.sampleRate;
      d[i] = Math.exp(-t * 120) * (Math.random() * 2 - 1) * 0.55;
    }
    this.clickBuffer = buf;
  }

  async resumeContext(): Promise<void> {
    if (!this.audioCtx) return;
    // Handle both 'suspended' (desktop) and 'interrupted' (iOS Safari)
    if (this.audioCtx.state === 'suspended' || this.audioCtx.state === 'interrupted' as AudioContextState) {
      await this.audioCtx.resume();
    }
  }

  // ── Callbacks ──────────────────────────────────────────────────────────────

  setOnTrackEnd(cb: TrackEndCallback | null) { this.onTrackEnd = cb; }
  setOnProgress(cb: ProgressCallback | null) { this.onProgress = cb; }

  private startProgressPolling() {
    this.stopProgressPolling();
    this.progressInterval = setInterval(() => {
      if (!this.musicHowl || this.state !== 'playing') return;
      const seek = this.musicHowl.seek() as number;
      const dur = (this.musicHowl.duration() as number) || 30;
      this.onProgress?.(seek, dur);
    }, 250);
  }

  private stopProgressPolling() {
    if (this.progressInterval) { clearInterval(this.progressInterval); this.progressInterval = null; }
  }

  // ── UI Sounds ──────────────────────────────────────────────────────────────

  playClick() {
    if (!this.audioCtx || !this.clickBuffer) return;
    const src = this.audioCtx.createBufferSource();
    src.buffer = this.clickBuffer;
    const gain = this.audioCtx.createGain();
    gain.gain.value = 0.45;
    src.connect(gain);
    gain.connect(this.audioCtx.destination);
    src.start();
  }

  playTuningStatic(ms = 600) {
    if (!this.audioCtx) return;
    const sr = this.audioCtx.sampleRate;
    const frames = Math.floor(sr * ms / 1000);
    const buf = this.audioCtx.createBuffer(1, frames, sr);
    const d = buf.getChannelData(0);
    for (let i = 0; i < frames; i++) d[i] = (Math.random() * 2 - 1) * 0.14;
    const src = this.audioCtx.createBufferSource();
    src.buffer = buf;
    const bp = this.audioCtx.createBiquadFilter();
    bp.type = 'bandpass'; bp.frequency.value = 2400; bp.Q.value = 0.8;
    const gain = this.audioCtx.createGain();
    const now = this.audioCtx.currentTime;
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.28, now + 0.05);
    gain.gain.linearRampToValueAtTime(0, now + ms / 1000);
    src.connect(bp); bp.connect(gain); gain.connect(this.audioCtx.destination);
    src.start();
  }

  // ── Music Playback ─────────────────────────────────────────────────────────

  /**
   * Stop & destroy the current howl immediately (no async delay).
   */
  private _destroyCurrent() {
    if (!this.musicHowl) return;
    const h = this.musicHowl;
    this.musicHowl = null;
    this.stopProgressPolling();
    try { h.stop(); h.unload(); } catch { /* ok */ }
    this.state = 'idle';
  }

  loadAndPlay(url: string, volume?: number): Promise<void> {
    return new Promise((resolve, reject) => {
      // Destroy old howl synchronously before creating new one
      this._destroyCurrent();

      const vol = volume ?? this._musicVolume;
      const h = new Howl({
        src: [url],
        html5: true,
        volume: 0,
        format: ['m4a', 'mp3', 'aac', 'mp4'],
        onplay: () => {
          this.state = 'playing';
          h.fade(0, vol, 1800);
          this.startProgressPolling();
          resolve();
        },
        onend: () => {
          this.state = 'idle';
          this.stopProgressPolling();
          this.onTrackEnd?.();
        },
        onstop: () => { this.stopProgressPolling(); },
        onloaderror: (_id, err) => {
          console.warn('[AudioEngine] load error:', err);
          reject(new Error(String(err)));
        },
        onplayerror: (_id, _err) => {
          console.warn('[AudioEngine] play error — attempting unlock');
          // Try unlock once; don't reject since ambient still works
          // and the unlock handler will retry play silently
          h.once('unlock', () => {
            if (this.musicHowl === h) h.play();
          });
        },
      });
      this.musicHowl = h;
      h.play();
    });
  }

  crossfadeTo(url: string, duration = 2200): Promise<void> {
    return new Promise((resolve) => {
      const outgoing = this.musicHowl;
      const vol = this._musicVolume;

      this.stopProgressPolling();
      // Don't destroy outgoing yet — we still need it to fade out

      const incoming = new Howl({
        src: [url],
        html5: true,
        volume: 0,
        format: ['m4a', 'mp3', 'aac', 'mp4'],
        onplay: () => {
          incoming.fade(0, vol, duration);
          if (outgoing) {
            outgoing.fade(outgoing.volume(), 0, duration);
            setTimeout(() => { try { outgoing.stop(); outgoing.unload(); } catch { /**/ } }, duration + 200);
          }
          this.musicHowl = incoming;
          this.state = 'playing';
          this.startProgressPolling();
          incoming.on('end', () => {
            this.state = 'idle';
            this.stopProgressPolling();
            this.onTrackEnd?.();
          });
          resolve();
        },
        onloaderror: () => {
          console.warn('[AudioEngine] crossfade load error — keeping current track');
          // Don't null musicHowl — keep whatever was playing
          resolve();
        },
      });
      // Don't null out musicHowl here — keep outgoing alive for the fade
      incoming.play();
    });
  }

  pause() { this.musicHowl?.pause(); this.stopProgressPolling(); this.state = 'paused'; }
  resume() { this.musicHowl?.play(); this.startProgressPolling(); this.state = 'playing'; }
  seek(s: number) { this.musicHowl?.seek(s); }
  getDuration(): number { return (this.musicHowl?.duration() as number) || 30; }
  getSeek(): number { return (this.musicHowl?.seek() as number) || 0; }
  isPlaying() { return this.state === 'playing'; }

  setMusicVolume(v: number) {
    this._musicVolume = v;
    if (this.musicHowl && this.state === 'playing') this.musicHowl.volume(v);
  }

  stop() { this._destroyCurrent(); }

  // ── Ambient Synthesis ──────────────────────────────────────────────────────

  async playAmbient(id: AmbientSoundId, fadeDuration = 1500): Promise<void> {
    if (!this.audioCtx || !this.ambientGain) return;
    if (id === this.currentAmbientId) return;
    if (this.currentAmbientId) await this._fadeAmbientOut(fadeDuration / 2);
    this._stopAmbientNodes();
    this.currentAmbientId = id;
    if (id === 'silence') return;
    this._synthesizeAmbient(id);
    const now = this.audioCtx.currentTime;
    this.ambientGain.gain.setValueAtTime(0, now);
    this.ambientGain.gain.linearRampToValueAtTime(this._ambientVolume, now + fadeDuration / 1000);
  }

  private _synthesizeAmbient(id: AmbientSoundId) {
    if (!this.audioCtx || !this.ambientGain) return;
    const ctx = this.audioCtx;
    const dest = this.ambientGain;
    const nodes: AudioNode[] = [];

    const noise = (dur: number) => {
      const buf = ctx.createBuffer(2, Math.floor(ctx.sampleRate * dur), ctx.sampleRate);
      for (let c = 0; c < 2; c++) { const d = buf.getChannelData(c); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; }
      const s = ctx.createBufferSource(); s.buffer = buf; s.loop = true; return s;
    };
    const pink = (dur: number) => {
      const buf = ctx.createBuffer(2, Math.floor(ctx.sampleRate * dur), ctx.sampleRate);
      for (let c = 0; c < 2; c++) {
        const d = buf.getChannelData(c); let b0=0,b1=0,b2=0,b3=0,b4=0,b5=0,b6=0;
        for (let i = 0; i < d.length; i++) { const w = Math.random()*2-1; b0=0.99886*b0+w*0.0555179; b1=0.99332*b1+w*0.0750759; b2=0.96900*b2+w*0.1538520; b3=0.86650*b3+w*0.3104856; b4=0.55000*b4+w*0.5329522; b5=-0.7616*b5-w*0.0168980; d[i]=(b0+b1+b2+b3+b4+b5+b6+w*0.5362)*0.12; b6=w*0.115926; }
      }
      const s = ctx.createBufferSource(); s.buffer = buf; s.loop = true; return s;
    };
    const lp = (f: number) => { const n = ctx.createBiquadFilter(); n.type='lowpass'; n.frequency.value=f; return n; };
    const bp = (f: number, q = 0.5) => { const n = ctx.createBiquadFilter(); n.type='bandpass'; n.frequency.value=f; n.Q.value=q; return n; };

    switch (id) {
      case 'rain-light':   { const s=pink(3),f=lp(800);   s.connect(f);f.connect(dest);s.start();nodes.push(s,f);break; }
      case 'rain-heavy':   { const s=noise(2),f=bp(600);  s.connect(f);f.connect(dest);s.start();nodes.push(s,f);break; }
      case 'thunderstorm': { const s=noise(4),f=lp(400);  s.connect(f);f.connect(dest);s.start();nodes.push(s,f);break; }
      case 'forest-birds': { const s=pink(3),f=bp(1200,0.3);s.connect(f);f.connect(dest);s.start();nodes.push(s,f);break; }
      case 'wind-gentle':  { const s=noise(3),f=bp(380,0.2);s.connect(f);f.connect(dest);s.start();nodes.push(s,f);break; }
      case 'ocean-waves': {
        const dur=ctx.sampleRate*4; const buf=ctx.createBuffer(2,dur,ctx.sampleRate);
        for(let c=0;c<2;c++){const d=buf.getChannelData(c);for(let i=0;i<dur;i++){const lfo=0.5+0.5*Math.sin(2*Math.PI*0.15*(i/ctx.sampleRate));d[i]=(Math.random()*2-1)*lfo*0.3;}}
        const s=ctx.createBufferSource();s.buffer=buf;s.loop=true;const f=lp(600);s.connect(f);f.connect(dest);s.start();nodes.push(s,f);break;
      }
      case 'city-night': {
        const osc=ctx.createOscillator();osc.type='sawtooth';osc.frequency.value=55;
        const g=ctx.createGain();g.gain.value=0.025;const f=lp(200);
        osc.connect(f);f.connect(g);g.connect(dest);osc.start();nodes.push(osc,f,g);break;
      }
      case 'fireplace': {
        const n=Math.floor(ctx.sampleRate*3);const buf=ctx.createBuffer(2,n,ctx.sampleRate);
        for(let c=0;c<2;c++){const d=buf.getChannelData(c);let l=0;for(let i=0;i<n;i++){const w=Math.random()*2-1;l=(l+0.02*w)/1.02;d[i]=l*3.5;}}
        const s=ctx.createBufferSource();s.buffer=buf;s.loop=true;s.connect(dest);s.start();nodes.push(s);break;
      }
    }
    this.ambientNodes = nodes;
  }

  private _fadeAmbientOut(ms: number): Promise<void> {
    return new Promise(r => {
      if (!this.audioCtx || !this.ambientGain) { r(); return; }
      this.ambientGain.gain.linearRampToValueAtTime(0, this.audioCtx.currentTime + ms/1000);
      setTimeout(r, ms);
    });
  }

  private _stopAmbientNodes() {
    for (const n of this.ambientNodes) { try { (n as AudioBufferSourceNode).stop?.(); } catch { /**/ } }
    this.ambientNodes = [];
    this.currentAmbientId = null;
  }

  setAmbientVolume(v: number) {
    this._ambientVolume = v;
    if (this.ambientGain && this.audioCtx) this.ambientGain.gain.setTargetAtTime(v, this.audioCtx.currentTime, 0.3);
  }

  destroy() { this.stop(); this._stopAmbientNodes(); this.stopProgressPolling(); this.audioCtx?.close(); }
}

let _instance: AudioEngine | null = null;
export function getAudioEngine(): AudioEngine {
  if (!_instance) _instance = new AudioEngine();
  return _instance;
}
