import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { AvatarIcon } from '../AvatarIcon';
import React from 'react';

describe('AvatarIcon component unit test', () => {
  it('正しい src と alt 属性で img 要素が描画されること', () => {
    render(<AvatarIcon src="/assets/avatars/avatar_strawberry.jpg" alt="Ichigo" size={80} />);

    const img = screen.getByRole('img', { name: 'Ichigo' });
    expect(img).toBeDefined();
    expect(img.getAttribute('src')).toBe('/assets/avatars/avatar_strawberry.jpg');
  });

  it('クリックイベントが正しくハンドラへ渡されること', () => {
    let clicked = false;
    render(
      <AvatarIcon 
        src="/assets/avatars/avatar_apple.jpg" 
        alt="Apple" 
        onClick={() => { clicked = true; }} 
      />
    );

    const img = screen.getByRole('img', { name: 'Apple' });
    img.click();
    expect(clicked).toBe(true);
  });
});
