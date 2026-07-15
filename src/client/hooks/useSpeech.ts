import { useCallback, useEffect, useRef, useState } from 'react';

export interface UseSpeechReturn {
  speak: (text: string, onend?: () => void, rate?: number) => void;
  cancel: () => void;
  isSpeaking: boolean;
  isSupported: boolean;
}

let sharedAudio: HTMLAudioElement | null = null;

export const getSharedAudio = (): HTMLAudioElement => {
  if (typeof window === 'undefined') return {} as HTMLAudioElement;
  if (!sharedAudio) {
    sharedAudio = new Audio();
  }
  return sharedAudio;
};

/**
 * Unlocks the HTML5 Audio element for iOS Safari/Chrome.
 * Must be called synchronously within a real user interaction handler.
 */
export const unlockSpeechAudio = (): void => {
  if (typeof window === 'undefined') return;
  const audio = getSharedAudio();
  if (!audio) return;
  // If not initialized or currently holding a dummy source, trigger a quick play/pause.
  if (!audio.src || audio.src.startsWith('data:')) {
    audio.src = 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQQAAAAAAA==';
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          audio.pause();
        })
        .catch((err) => {
          console.warn('Failed to unlock speech audio:', err);
        });
    }
  }
};

export function useSpeech(): UseSpeechReturn {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const onEndRef = useRef<(() => void) | undefined>(undefined);

  // Initialize and attach listeners once to the shared Audio instance.
  useEffect(() => {
    const audio = getSharedAudio();

    const handleEnded = () => {
      setIsSpeaking(false);
      if (onEndRef.current) {
        onEndRef.current();
      }
    };

    const handleError = (e: ErrorEvent) => {
      console.error('Audio playback error:', e);
      setIsSpeaking(false);
      if (onEndRef.current) {
        onEndRef.current();
      }
    };

    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError as any);

    return () => {
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError as any);
      audio.pause();
    };
  }, []);

  const cancel = useCallback((): void => {
    const audio = getSharedAudio();
    audio.pause();
    // Safety: set dummy silent source to release resources and reset state without breaking unlock
    audio.src = 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQQAAAAAAA==';
    audio.load();
    setIsSpeaking(false);
  }, []);

  const speak = useCallback(
    (text: string, onend?: () => void, rate?: number): void => {
      const audio = getSharedAudio();

      // Stop any current audio immediately
      audio.pause();

      onEndRef.current = onend;
      setIsSpeaking(true);

      const url = `/api/tts?text=${encodeURIComponent(text)}`;
      audio.src = url;
      audio.load();

      // Apply playbackRate (safeguarded against load() reset on some browsers)
      const targetRate = rate ?? 1.0;
      audio.playbackRate = targetRate;
      
      const onCanPlay = () => {
        audio.playbackRate = targetRate;
        audio.removeEventListener('canplay', onCanPlay);
      };
      audio.addEventListener('canplay', onCanPlay);

      audio.play().catch((err) => {
        // AbortError occurs when a play request is interrupted by pause() (e.g. going to next word rapidly).
        // This is normal lifecycle behavior, so we ignore it and do not trigger old callbacks.
        if (err instanceof Error && err.name === 'AbortError') {
          return;
        }
        console.error('Audio play failed:', err);
        setIsSpeaking(false);
        if (onend) onend();
      });
    },
    []
  );

  return { speak, cancel, isSpeaking, isSupported: true };
}
