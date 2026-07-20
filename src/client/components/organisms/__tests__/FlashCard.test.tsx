import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { FlashCard } from '../FlashCard';

describe('FlashCard Component - 片方訳語 (日本語のみ / ベトナム語のみ) 表示崩れ・堅牢性テスト', () => {
  const mockOnAnswer = vi.fn();

  it('日本語訳が空文字 ("") でベトナム語訳のみの単語でもクラッシュせず正常に表示されること', () => {
    const singleLangWord = {
      id: 1,
      english: 'apple',
      vietnamese: 'Quả táo',
      japanese: '', // 日本語訳なし
      example_en: 'An apple a day',
      example_vi: 'Mỗi ngày một quả táo',
      example_ja: '',
    };

    render(<FlashCard word={singleLangWord} onAnswer={mockOnAnswer} />);

    // 表面 (英語) の存在確認
    const englishElements = screen.getAllByText('apple');
    expect(englishElements.length).toBeGreaterThan(0);

    // フリップして裏面表示
    const flipButton = screen.getByRole('button', { name: 'こたえを見る' });
    fireEvent.click(flipButton);

    // ベトナム語訳が表示され、エラーが発生しないこと
    const viTranslation = screen.getByText('Quả táo');
    expect(viTranslation).toBeDefined();
  });

  it('ベトナム語訳が空文字 ("") で日本語訳のみの単語でもクラッシュせず正常に表示されること', () => {
    const singleLangWord = {
      id: 2,
      english: 'banana',
      vietnamese: '', // ベトナム語訳なし
      japanese: 'バナナ',
      example_en: 'Yellow banana',
      example_vi: '',
      example_ja: '黄色いバナナ',
    };

    render(<FlashCard word={singleLangWord} onAnswer={mockOnAnswer} />);

    // フリップして裏面表示
    const flipButton = screen.getByRole('button', { name: 'こたえを見る' });
    fireEvent.click(flipButton);

    // 日本語訳が表示され、エラーが発生しないこと
    const jaTranslation = screen.getByText('バナナ');
    expect(jaTranslation).toBeDefined();
  });
});
