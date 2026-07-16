import { useCallback, useEffect, useRef, useState } from 'react';
import { getAudioContext } from '../lib/sfx';

export interface UseSpeechReturn {
  speak: (text: string, onend?: () => void, rate?: number) => void;
  cancel: () => void;
  isSpeaking: boolean;
  isSupported: boolean;
}

/**
 * decodeAudioData with a Promise wrapper that also works on older WebKit,
 * which only supports the callback signature.
 */
const decodeAudio = (ctx: AudioContext, data: ArrayBuffer): Promise<AudioBuffer> =>
  new Promise((resolve, reject) => {
    ctx.decodeAudioData(data, resolve, reject);
  });

/**
 * Plays server TTS (/api/tts) through the shared Web Audio AudioContext instead
 * of an HTMLAudioElement.
 *
 * Why Web Audio: on iOS the HTMLAudioElement path is unreliable (it is routed to
 * the ringer channel — muted by the silent switch — and its autoplay unlock does
 * not survive a programmatic play() from a non-gesture context such as autoplay).
 * The AudioContext is already unlocked on the first user gesture (see sfx.ts /
 * StudyPage) and ignores the silent switch, so reusing it makes TTS play on iPhone.
 */
export function useSpeech(): UseSpeechReturn {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);
  const onEndRef = useRef<(() => void) | undefined>(undefined);
  const abortRef = useRef<AbortController | null>(null);
  // Monotonic id used to invalidate in-flight fetches when a newer speak()/cancel()
  // supersedes them (e.g. rapidly advancing to the next word).
  const requestIdRef = useRef(0);

  const stopCurrentSource = useCallback((): void => {
    const source = sourceRef.current;
    if (source) {
      source.onended = null;
      try {
        source.stop();
      } catch {
        /* already stopped */
      }
      source.disconnect();
      sourceRef.current = null;
    }
  }, []);

  const cancel = useCallback((): void => {
    // Invalidate any in-flight fetch/decode so its callback is a no-op, and abort
    // the HTTP request so the server frees its Piper worker (onAbort).
    requestIdRef.current += 1;
    abortRef.current?.abort();
    abortRef.current = null;
    stopCurrentSource();
    setIsSpeaking(false);
  }, [stopCurrentSource]);

  const speak = useCallback(
    (text: string, onend?: () => void, rate?: number): void => {
      const ctx = getAudioContext();
      if (!ctx) {
        if (onend) onend();
        return;
      }

      // Supersede any current playback / in-flight request.
      stopCurrentSource();
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      const myId = (requestIdRef.current += 1);
      onEndRef.current = onend;
      setIsSpeaking(true);

      // Should already be running (unlocked on first gesture); best-effort resume.
      if (ctx.state === 'suspended') {
        ctx.resume().catch(() => {});
      }

      // Slow pronunciation is done server-side (Piper --length_scale) so the pitch
      // is preserved. Passing rate to the server instead of using playbackRate below
      // avoids the female voice sounding lower/male-ish when slowed down.
      const rateParam = rate !== undefined && rate !== 1.0 ? `&rate=${rate}` : '';
      fetch(`/api/tts?text=${encodeURIComponent(text)}${rateParam}`, { signal: controller.signal })
        .then((res) => {
          if (!res.ok) throw new Error(`TTS fetch failed: ${res.status}`);
          return res.arrayBuffer();
        })
        .then((buf) => decodeAudio(ctx, buf))
        .then((audioBuffer) => {
          // A newer speak()/cancel() ran while we were fetching/decoding.
          if (myId !== requestIdRef.current) return;

          const source = ctx.createBufferSource();
          source.buffer = audioBuffer;
          // Always play at 1.0: Web Audio playbackRate would shift pitch (making a
          // slowed female voice sound male). The slow-down is already baked into the
          // fetched audio by the server (Piper --length_scale), which keeps pitch.
          source.playbackRate.value = 1.0;
          source.connect(ctx.destination);
          source.onended = () => {
            if (myId !== requestIdRef.current) return;
            sourceRef.current = null;
            setIsSpeaking(false);
            if (onEndRef.current) onEndRef.current();
          };
          sourceRef.current = source;
          source.start(0);
        })
        .catch((err) => {
          // Superseded/cancelled request: aborted on purpose, ignore quietly.
          if (err instanceof DOMException && err.name === 'AbortError') return;
          if (myId !== requestIdRef.current) return;
          console.error('TTS playback failed:', err);
          setIsSpeaking(false);
          if (onend) onend();
        });
    },
    [stopCurrentSource]
  );

  // Stop playback if the consuming component unmounts.
  useEffect(() => {
    return () => {
      requestIdRef.current += 1;
      abortRef.current?.abort();
      abortRef.current = null;
      stopCurrentSource();
    };
  }, [stopCurrentSource]);

  return { speak, cancel, isSpeaking, isSupported: true };
}
