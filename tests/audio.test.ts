import { afterEach, describe, expect, it, vi } from 'vitest';
import { createSfxPlayer } from '../src/audio';
import { createMuteState } from '../src/mute';

function createMockStorage() {
  const data = new Map<string, string>();
  return {
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => {
      data.set(key, value);
    },
  };
}

describe('createSfxPlayer', () => {
  it('is a silent no-op without a global AudioContext (this test environment)', () => {
    const player = createSfxPlayer(createMuteState(createMockStorage()));
    expect(() => player.playKeyStrike()).not.toThrow();
    expect(() => player.playCorrect()).not.toThrow();
    expect(() => player.playWrong()).not.toThrow();
    expect(() => player.playStampThud()).not.toThrow();
  });

  it('is a silent no-op while muted', () => {
    const mute = createMuteState(createMockStorage());
    mute.toggle();
    const player = createSfxPlayer(mute);
    expect(() => player.playCorrect()).not.toThrow();
  });
});

describe('createSfxPlayer with a mock AudioContext', () => {
  afterEach(() => {
    delete (globalThis as { window?: unknown }).window;
  });

  function installMockAudioContext() {
    const oscillators: ReturnType<typeof createOscillator>[] = [];
    const bufferSources: ReturnType<typeof createBufferSource>[] = [];
    const contextsCreated = { count: 0 };

    function createGain() {
      return {
        gain: {
          setValueAtTime: vi.fn(),
          linearRampToValueAtTime: vi.fn(),
          exponentialRampToValueAtTime: vi.fn(),
        },
        connect: vi.fn(),
      };
    }

    function createOscillator() {
      return {
        type: 'sine' as OscillatorType,
        frequency: { setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() },
        connect: vi.fn(),
        start: vi.fn(),
        stop: vi.fn(),
      };
    }

    function createBufferSource() {
      return { buffer: null as unknown, connect: vi.fn(), start: vi.fn() };
    }

    class MockAudioContext {
      currentTime = 0;
      sampleRate = 44_100;
      destination = {};

      constructor() {
        contextsCreated.count += 1;
      }

      createOscillator() {
        const osc = createOscillator();
        oscillators.push(osc);
        return osc;
      }

      createGain() {
        return createGain();
      }

      createBuffer(_channels: number, length: number) {
        return { getChannelData: () => new Float32Array(length) };
      }

      createBufferSource() {
        const source = createBufferSource();
        bufferSources.push(source);
        return source;
      }

      createBiquadFilter() {
        return { type: 'bandpass' as BiquadFilterType, frequency: { value: 0 }, connect: vi.fn() };
      }
    }

    (globalThis as { window?: unknown }).window = { AudioContext: MockAudioContext };
    return { oscillators, bufferSources, contextsCreated };
  }

  it('starts an oscillator for every tone-based sound', () => {
    const { oscillators } = installMockAudioContext();
    const player = createSfxPlayer(createMuteState(createMockStorage()));

    player.playCorrect();
    player.playWrong();
    player.playStampThud();

    expect(oscillators.length).toBeGreaterThanOrEqual(2);
    for (const osc of oscillators) {
      expect(osc.start).toHaveBeenCalledOnce();
      expect(osc.stop).toHaveBeenCalledOnce();
    }
  });

  it('starts a noise buffer source for every noise-based sound', () => {
    const { bufferSources } = installMockAudioContext();
    const player = createSfxPlayer(createMuteState(createMockStorage()));

    player.playKeyStrike();
    player.playStampThud();

    expect(bufferSources.length).toBe(2);
    for (const source of bufferSources) {
      expect(source.start).toHaveBeenCalledOnce();
    }
  });

  it('reuses the same AudioContext instance across multiple sounds', () => {
    const { oscillators, contextsCreated } = installMockAudioContext();
    const player = createSfxPlayer(createMuteState(createMockStorage()));

    player.playCorrect();
    player.playCorrect();
    player.playCorrect();

    expect(contextsCreated.count).toBe(1);
    expect(oscillators.length).toBe(3);
  });
});
