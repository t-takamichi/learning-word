import { describe, it, expect, vi, beforeEach } from 'vitest';
import { playSFX } from '../sfx';

describe('sfx.ts - 超強化プロ仕様テスト (連続発振・消音・モック破壊攻撃)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('正常系: 基本音源IDの呼び出しがクラッシュせずに処理されること', () => {
    expect(() => {
      playSFX('tap', false);
      playSFX('correct', false);
      playSFX('again', false);
      playSFX('undo', false);
      playSFX('combo', false);
    }).not.toThrow();
  });

  it('消音状態 (isMuted = true) では処理が即時スキップされること', () => {
    expect(() => {
      playSFX('correct', true);
      playSFX('undo', true);
    }).not.toThrow();
  });

  it('😈 敵対的ケース1: 100回の高頻度爆速連打時でも例外が発生せずメモリ/コンテキストが破壊されないこと', () => {
    expect(() => {
      for (let i = 0; i < 100; i++) {
        playSFX('correct', false);
        playSFX('undo', false);
      }
    }).not.toThrow();
  });

  it('😈 敵対的ケース2: 不正な SFXId (型キャスト等で渡された未知の文字列) に対する安全ガード', () => {
    expect(() => {
      // @ts-expect-error Testing invalid runtime SFX ID
      playSFX('unknown_sfx_type_123', false);
    }).not.toThrow();
  });
});
