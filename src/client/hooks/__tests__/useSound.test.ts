import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useSound } from '../useSound';

describe('useSound hook unit test', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('初期状態では muted が false であり localStorage から復元されること', () => {
    localStorage.setItem('berry.sound.muted', 'true');
    const { result } = renderHook(() => useSound());
    expect(result.current.muted).toBe(true);
  });

  it('setMuted 呼び出しで muted が変更され localStorage に永続化されること', () => {
    const { result } = renderHook(() => useSound());
    expect(result.current.muted).toBe(false);

    act(() => {
      result.current.setMuted(true);
    });

    expect(result.current.muted).toBe(true);
    expect(localStorage.getItem('berry.sound.muted')).toBe('true');

    act(() => {
      result.current.setMuted(false);
    });

    expect(result.current.muted).toBe(false);
    expect(localStorage.getItem('berry.sound.muted')).toBe('false');
  });

  it('unlock 呼び出しで isUnlocked が関数として正常に返ること', () => {
    const { result } = renderHook(() => useSound());
    expect(typeof result.current.isUnlocked).toBe('function');
    
    act(() => {
      result.current.unlock();
    });

    expect(typeof result.current.isUnlocked()).toBe('boolean');
  });

  it('消音状態 (muted = true) で play を呼んでもクラッシュしないこと', () => {
    const { result } = renderHook(() => useSound());
    act(() => {
      result.current.setMuted(true);
    });

    expect(() => {
      result.current.play('correct');
      result.current.play('undo');
    }).not.toThrow();
  });
});
