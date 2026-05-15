import { describe, expect, test } from 'vitest';
import { SummaryList, type SummaryListAction } from '../SummaryList';

describe('SummaryList', () => {
  test('renders nothing when there are no rows', () => {
    expect(SummaryList({ rows: [] })).toBeNull();
  });

  test('throws when an unexpected action kind reaches the runtime guard', () => {
    expect(() =>
      SummaryList({
        rows: [
          {
            id: 'name',
            key: 'Name',
            value: 'Ada Lovelace',
            actions: [
              {
                kind: 'menu',
                label: 'Change',
                visuallyHiddenText: 'name',
              } as unknown as SummaryListAction,
            ],
          },
        ],
      }),
    ).toThrow('Unexpected unreachable value: menu');
  });
});
