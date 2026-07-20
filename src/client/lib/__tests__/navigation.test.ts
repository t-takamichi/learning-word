import { describe, it, expect } from 'vitest';
import { navigateTo } from '../navigation';

describe('navigation.ts unit test', () => {
  it('navigateTo 呼び出し時に location.href が変更されること', () => {
    navigateTo('/levels');
    expect(window.location.href).toContain('/levels');
  });
});
