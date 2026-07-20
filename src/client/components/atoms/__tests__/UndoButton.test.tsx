import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { UndoButton } from '../UndoButton';
import React from 'react';

describe('UndoButton component unit test', () => {
  it('disabled = true のとき disabled 属性が付与されクリックできないこと', () => {
    const handleUndo = vi.fn();
    render(<UndoButton disabled={true} onClick={handleUndo} />);

    const button = screen.getByRole('button', { name: 'ひとつ戻る' });
    expect(button.hasAttribute('disabled')).toBe(true);

    button.click();
    expect(handleUndo).not.toHaveBeenCalled();
  });

  it('disabled = false のときクリックで onClick コールバックが呼ばれること', () => {
    const handleUndo = vi.fn();
    render(<UndoButton disabled={false} onClick={handleUndo} />);

    const button = screen.getByRole('button', { name: 'ひとつ戻る' });
    expect(button.hasAttribute('disabled')).toBe(false);

    button.click();
    expect(handleUndo).toHaveBeenCalledTimes(1);
  });
});
