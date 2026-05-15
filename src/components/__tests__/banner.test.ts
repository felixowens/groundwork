import { describe, expect, test } from 'vitest';
import { Banner, type BannerAnnouncement } from '../Banner';

describe('Banner', () => {
  test('throws when an unexpected announcement reaches the runtime guard', () => {
    expect(() =>
      Banner({
        announcement: 'urgent' as BannerAnnouncement,
        title: 'Service status',
      }),
    ).toThrow('Unexpected unreachable value: urgent');
  });
});
