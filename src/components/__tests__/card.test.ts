import { isValidElement } from 'react';
import { describe, expect, test } from 'vitest';
import { Card } from '../Card';

describe('Card', () => {
  test('renders a div by default', () => {
    const element = Card({ children: 'Content' });

    expect(isValidElement(element)).toBe(true);
    expect(element.type).toBe('div');
    expect(element.props.className).toBe('gw-card');
  });

  test('applies the raised elevation modifier', () => {
    const element = Card({ variant: 'raised', children: 'Content' });

    expect(element.type).toBe('div');
    expect(element.props.className).toBe('gw-card gw-card--raised');
  });

  test('renders an interactive anchor when given an href', () => {
    const element = Card({ href: '/reports/42', children: 'Content' });

    expect(element.type).toBe('a');
    expect(element.props.href).toBe('/reports/42');
    expect(element.props.className).toBe('gw-card gw-card--interactive');
  });

  test('hardens rel for links that open in a new tab', () => {
    const element = Card({ href: 'https://example.com', target: '_blank', children: 'Content' });

    expect(element.props.rel).toBe('noopener noreferrer');
  });
});
