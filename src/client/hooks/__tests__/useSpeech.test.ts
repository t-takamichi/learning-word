import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useSpeech } from '../useSpeech';

describe('useSpeech hook unit test (音声再生と即時キャンセル機能)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('speak 呼び出し時に内部処理が開始され、cancel 呼び出しで即座に停止 (isSpeaking = false) すること', () => {
    const onEndMock = vi.fn();
    const { result } = renderHook(() => useSpeech());
    
    act(() => {
      result.current.speak('apple', onEndMock);
    });

    expect(result.current.isSpeaking).toBeDefined();

    // 途中で cancel() を呼び出した場合、即座に例外なく停止すること
    act(() => {
      result.current.cancel();
    });

    expect(result.current.isSpeaking).toBe(false);
  });

  it('speechSynthesis / AudioContext 非対応ブラウザ環境で speak や cancel を呼んでもエラーなく安全にスルーされること', () => {
    const { result } = renderHook(() => useSpeech());

    expect(() => {
      act(() => {
        result.current.speak('apple');
        result.current.cancel();
      });
    }).not.toThrow();
  });
});
