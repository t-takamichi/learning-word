import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { UserProfileCard } from '../UserProfileCard';
import React from 'react';

describe('UserProfileCard component unit test', () => {
  it('ユーザー名とアバター画像が描画されクリックで onClick が呼出されること', () => {
    const handleClick = vi.fn();
    render(
      <UserProfileCard
        name="Sakura"
        avatarSrc="/assets/avatars/avatar_bunny.jpg"
        onClick={handleClick}
      />
    );

    expect(screen.getByText('Sakura')).toBeDefined();
    
    const card = screen.getByRole('button');
    card.click();

    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
