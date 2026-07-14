import { useCallback, useEffect, useRef, useState } from 'react';

export interface UseSpeechReturn {
  speak: (text: string, onend?: () => void, rate?: number) => void;
  cancel: () => void;
  isSpeaking: boolean;
  isSupported: boolean;
}

export function useSpeech(): UseSpeechReturn {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const onEndRef = useRef<(() => void) | undefined>(undefined);

  // Initialize a single Audio instance and attach listeners once.
  useEffect(() => {
    const audio = new Audio();
    audioRef.current = audio;

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
      audio.src = '';
      audioRef.current = null;
    };
  }, []);

  const cancel = useCallback((): void => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.removeAttribute('src');
      audioRef.current.load();
      setIsSpeaking(false);
    }
  }, []);

  const speak = useCallback(
    (text: string, onend?: () => void, rate?: number): void => {
      const audio = audioRef.current;
      if (!audio) {
        if (onend) onend();
        return;
      }

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
