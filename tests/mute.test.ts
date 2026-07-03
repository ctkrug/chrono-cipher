import { describe, expect, it } from 'vitest';
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

describe('createMuteState', () => {
  it('defaults to unmuted when nothing is stored', () => {
    expect(createMuteState(createMockStorage()).isMuted()).toBe(false);
  });

  it('restores a previously persisted muted flag', () => {
    const storage = createMockStorage();
    storage.setItem('chrono-cipher:muted', 'true');
    expect(createMuteState(storage).isMuted()).toBe(true);
  });

  it('toggle flips and persists the flag', () => {
    const storage = createMockStorage();
    const mute = createMuteState(storage);

    expect(mute.toggle()).toBe(true);
    expect(mute.isMuted()).toBe(true);
    expect(storage.getItem('chrono-cipher:muted')).toBe('true');

    expect(mute.toggle()).toBe(false);
    expect(storage.getItem('chrono-cipher:muted')).toBe('false');
  });
});
