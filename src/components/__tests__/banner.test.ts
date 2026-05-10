import { describe, expect, test } from 'vitest';
import { Banner, type BannerAnnouncement, type BannerVariant } from '../Banner';

describe('Banner', () => {
  test('throws when an unexpected variant reaches the runtime guard', () => {
    expect(() =>
      Banner({
        title: 'Service status',
        variant: 'info' as BannerVariant,
      }),
    ).toThrow('Unexpected unreachable value: info');
  });

  test('throws when an unexpected announcement reaches the runtime guard', () => {
    expect(() =>
      Banner({
        announcement: 'urgent' as BannerAnnouncement,
        title: 'Service status',
      }),
    ).toThrow('Unexpected unreachable value: urgent');
  });
});
