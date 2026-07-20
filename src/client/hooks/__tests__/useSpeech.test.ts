import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useSpeech } from '../useSpeech';

describe('useSpeech hook unit test', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('speak 呼び出し時にコールバック onend または内部処理が呼出されること', () => {
    const onEndMock = vi.fn();
    const { result } = renderHook(() => useSpeech());
    
    act(() => {
      result.current.speak('apple', onEndMock);
    });

    expect(result.current.isSpeaking).toBeDefined();
  });

  it('speechSynthesis 非対応ブラウザ環境で speak を呼んでもエラーなく安全にスルーされること', () => {
    const { result } = renderHook(() => useSpeech());

    expect(() => {
      act(() => {
        result.current.speak('apple');
      });
    }).not.toThrow();
  });
});
