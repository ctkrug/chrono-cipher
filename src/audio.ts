import type { MuteState } from './mute';

type AudioContextCtor = typeof AudioContext;

function resolveAudioContextCtor(): AudioContextCtor | null {
  if (typeof window === 'undefined') return null;
  const ctor =
    window.AudioContext ?? (window as unknown as { webkitAudioContext?: AudioContextCtor }).webkitAudioContext;
  return ctor ?? null;
}

export interface SfxPlayer {
  playKeyStrike(): void;
  playCorrect(): void;
  playWrong(): void;
  playStampThud(): void;
}

/**
 * Synthesized WebAudio SFX player: every sound is generated from oscillators
 * and noise, no audio files. The AudioContext is created lazily on first use
 * (autoplay policy) and every call is a silent no-op when AudioContext isn't
 * available (tests, unsupported browsers) or the player is muted.
 */
export function createSfxPlayer(mute: MuteState): SfxPlayer {
  let context: AudioContext | null = null;

  function ensureContext(): AudioContext | null {
    if (context) return context;
    const Ctor = resolveAudioContextCtor();
    if (!Ctor) return null;
    context = new Ctor();
    return context;
  }

  function envelope(gain: GainNode, ctx: AudioContext, peak: number, duration: number): void {
    const now = ctx.currentTime;
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(peak, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
  }

  function playTone(startFrequency: number, endFrequency: number, type: OscillatorType, duration: number, peak: number): void {
    if (mute.isMuted()) return;
    const ctx = ensureContext();
    if (!ctx) return;

    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(startFrequency, ctx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(Math.max(endFrequency, 1), ctx.currentTime + duration);
    envelope(gain, ctx, peak, duration);

    oscillator.connect(gain);
    gain.connect(ctx.destination);
    oscillator.start();
    oscillator.stop(ctx.currentTime + duration);
  }

  function playNoiseBurst(duration: number, peak: number, filterFrequency: number): void {
    if (mute.isMuted()) return;
    const ctx = ensureContext();
    if (!ctx) return;

    const bufferSize = Math.max(1, Math.floor(ctx.sampleRate * duration));
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = filterFrequency;

    const gain = ctx.createGain();
    envelope(gain, ctx, peak, duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    noise.start();
  }

  return {
    playKeyStrike: () => playNoiseBurst(0.05, 0.15, 2200),
    playCorrect: () => playTone(520, 880, 'sine', 0.12, 0.2),
    playWrong: () => playTone(160, 90, 'sawtooth', 0.14, 0.18),
    playStampThud: () => {
      playTone(120, 45, 'square', 0.18, 0.22);
      playNoiseBurst(0.08, 0.12, 400);
    },
  };
}
