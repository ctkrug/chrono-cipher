import { describe, expect, it } from 'vitest';
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
