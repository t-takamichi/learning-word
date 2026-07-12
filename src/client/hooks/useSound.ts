import { useState, useEffect, useCallback } from 'react';
import { playSFX, unlockAudioContext, isAudioContextRunning, SFXId } from '../lib/sfx';

const LOCAL_STORAGE_KEY = 'berry.sound.muted';

interface UseSoundResult {
  muted: boolean;
  setMuted: (muted: boolean) => void;
  play: (id: SFXId) => void;
  unlock: () => void;
  isUnlocked: () => boolean;
}

export const useSound = (): UseSoundResult => {
  const [muted, setMutedState] = useState<boolean>(false);

  // Initialize state from localStorage (client-side only to be SSR safe)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      // Default is unmuted (false) if not set.
      setMutedState(stored === 'true');
    }
  }, []);

  const setMuted = useCallback((nextMuted: boolean): void => {
    setMutedState(nextMuted);
    if (typeof window !== 'undefined') {
      localStorage.setItem(LOCAL_STORAGE_KEY, String(nextMuted));
    }
  }, []);

  // Must be invoked synchronously from a real user gesture (Chrome/Safari policy).
  const unlock = useCallback((): void => {
    unlockAudioContext();
  }, []);

  const isUnlocked = useCallback((): boolean => isAudioContextRunning(), []);

  const play = useCallback(
    (id: SFXId): void => {
      if (muted) return;

      // Play synthesized audio effect
      playSFX(id);

      // Trigger Haptics (Vibration API) if supported and enabled on host device
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        try {
          switch (id) {
            case 'correct':
              navigator.vibrate(15);
              break;
            case 'combo':
              navigator.vibrate([10, 30, 10]);
              break;
            case 'complete':
              navigator.vibrate([15, 40, 15, 40, 30]);
              break;
            default:
              break;
          }
        } catch (e: unknown) {
          // Fallback silently if browser restrictions block it
          console.warn('Vibration API failed:', e);
        }
      }
    },
    [muted]
  );

  return {
    muted,
    setMuted,
    play,
    unlock,
    isUnlocked,
  };
};
