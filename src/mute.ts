type MuteStorage = Pick<Storage, 'getItem' | 'setItem'>;

const MUTE_KEY = 'chrono-cipher:muted';

export interface MuteState {
  isMuted(): boolean;
  toggle(): boolean;
}

/** Wraps a persisted mute flag so the audio module and mute button share one source of truth. */
export function createMuteState(storage: MuteStorage): MuteState {
  let muted = storage.getItem(MUTE_KEY) === 'true';

  return {
    isMuted: () => muted,
    toggle: () => {
      muted = !muted;
      storage.setItem(MUTE_KEY, String(muted));
      return muted;
    },
  };
}
