import { describe, expect, test } from 'vitest';
import { bemModifier } from '../bem-modifier';

describe('bemModifier', () => {
  test('returns just the base when modifier equals the default', () => {
    expect(bemModifier('gw-button', 'primary', 'primary')).toBe('gw-button');
  });

  test('returns base + modifier when modifier differs from the default', () => {
    expect(bemModifier('gw-button', 'secondary', 'primary')).toBe('gw-button gw-button--secondary');
  });

  test('always appends the modifier when no default is provided', () => {
    expect(bemModifier('gw-input', 'w10')).toBe('gw-input gw-input--w10');
  });

  test('handles hyphenated modifier values', () => {
    expect(bemModifier('gw-input', 'two-thirds', 'full')).toBe('gw-input gw-input--two-thirds');
  });
});
