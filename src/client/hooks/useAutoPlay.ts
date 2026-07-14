import { useCallback, useEffect, useRef, useState } from 'react';
import type { UseSpeechReturn } from './useSpeech';

interface UseAutoPlayOptions {
  readonly words: readonly { readonly english: string; readonly example_en?: string | null }[];
  readonly currentIndex: number;
  readonly isAnswerVisible: boolean;
  readonly showAnswer: () => void;
  readonly goNext: () => void;
  readonly speech: UseSpeechReturn;
  readonly frontDelay?: number;  // Time (seconds) after voice finishes until flipping
  readonly backDelay?: number;   // Time (seconds) after flipping until moving to the next card
}

interface UseAutoPlayReturn {
  readonly isAutoPlay: boolean;
  readonly toggleAutoPlay: () => void;
}

export function useAutoPlay({
  words,
  currentIndex,
  isAnswerVisible,
  showAnswer,
  goNext,
  speech,
  frontDelay = 3,
  backDelay = 4,
}: UseAutoPlayOptions): UseAutoPlayReturn {
  const [isAutoPlay, setIsAutoPlay] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isAutoPlayRef = useRef(false);
  const lastSpokenIndexRef = useRef<number | null>(null);

  // Reset lastSpokenIndexRef when answer is hidden (returned to front side)
  useEffect(() => {
    if (!isAnswerVisible) {
      lastSpokenIndexRef.current = null;
    }
  }, [isAnswerVisible]);

  const clearTimer = useCallback((): void => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const stop = useCallback((): void => {
    isAutoPlayRef.current = false;
    setIsAutoPlay(false);
    clearTimer();
    speech.cancel();
  }, [clearTimer, speech]);

  // Auto-Play ON: Initial speak() is triggered by user interaction (toggleAutoPlay) (iOS R1 measure)
  const toggleAutoPlay = useCallback((): void => {
    if (isAutoPlay) {
      stop();
      return;
    }

    const word = words[currentIndex];
    if (!word) return;

    isAutoPlayRef.current = true;
    setIsAutoPlay(true);

    speech.speak(word.english, () => {
      if (!isAutoPlayRef.current) return;
      timerRef.current = setTimeout(() => {
        if (!isAutoPlayRef.current) return;
        showAnswer();
      }, frontDelay * 1000);
    });
  }, [isAutoPlay, words, currentIndex, speech, frontDelay, showAnswer, stop]);

  // After flipping, speak translation/example slowly, then wait backDelay seconds and transition to next card
  useEffect(() => {
    if (!isAutoPlay || !isAnswerVisible) return;

    const word = words[currentIndex];
    if (!word) return;

    // Prevent duplicate speech
    if (lastSpokenIndexRef.current === currentIndex) return;
    lastSpokenIndexRef.current = currentIndex;

    const textToSpeak = word.example_en 
      ? `${word.english}. ${word.example_en}`
      : word.english;

    speech.speak(
      textToSpeak,
      () => {
        if (!isAutoPlayRef.current) return;
        timerRef.current = setTimeout(() => {
          if (!isAutoPlayRef.current) return;
          goNext();
        }, backDelay * 1000);
      },
      0.8 // slow down
    );

    return () => {
      clearTimer();
      speech.cancel();
    };
  }, [isAutoPlay, isAnswerVisible, currentIndex, words, speech, backDelay, goNext, clearTimer]);

  // After transition (currentIndex change), trigger speech for the next word
  useEffect(() => {
    if (!isAutoPlay || isAnswerVisible) return;

    const word = words[currentIndex];
    if (!word) {
      stop();
      return;
    }

    speech.speak(word.english, () => {
      if (!isAutoPlayRef.current) return;
      timerRef.current = setTimeout(() => {
        if (!isAutoPlayRef.current) return;
        showAnswer();
      }, frontDelay * 1000);
    });
  }, [isAutoPlay, currentIndex, isAnswerVisible, words, speech, frontDelay, showAnswer, stop]);

  // General cleanup
  useEffect(() => {
    return () => {
      isAutoPlayRef.current = false;
      clearTimer();
    };
  }, [clearTimer]);

  return { isAutoPlay, toggleAutoPlay };
}
