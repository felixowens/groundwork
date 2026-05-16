import { expect, test } from '@playwright/test';
import { docsPages } from '../docs-pages';

interface ProseGapViolation {
  route: string;
  proseIndex: number;
  previousTag: string;
  currentTag: string;
  expectedGap: number;
  actualGap: number;
}

for (const { path } of docsPages) {
  test(`${path} preserves .gw-prose adjacent-sibling spacing`, async ({ page }) => {
    await page.goto(path);
    await page.waitForFunction(() => !document.querySelector('astro-island[ssr]'));

    const violations = await page.evaluate<ProseGapViolation[]>(() => {
      const SPACE_2 = 8;
      const SPACE_4 = 16;
      const SPACE_8 = 32;
      const SPACE_10 = 40;

      function expectedGap(prevTag: string, nextTag: string): number {
        if (nextTag === 'h2') {
          return SPACE_10;
        }
        if (nextTag === 'h3') {
          return SPACE_8;
        }
        if (prevTag === 'h2' || prevTag === 'h3') {
          return SPACE_2;
        }
        return SPACE_4;
      }

      function visibleBox(element: Element): { top: number; bottom: number } | undefined {
        const styles = getComputedStyle(element);
        if (styles.display === 'none' || styles.visibility === 'hidden') {
          return;
        }

        const rect = element.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          return { top: rect.top, bottom: rect.bottom };
        }

        const descendantBoxes = Array.from(element.querySelectorAll('*')).flatMap(
          (descendant): Array<{ top: number; bottom: number }> => {
            const ds = getComputedStyle(descendant);
            if (ds.display === 'none' || ds.visibility === 'hidden') {
              return [];
            }
            const r = descendant.getBoundingClientRect();
            return r.width > 0 && r.height > 0 ? [{ top: r.top, bottom: r.bottom }] : [];
          },
        );

        if (descendantBoxes.length === 0) {
          return;
        }
        return {
          top: Math.min(...descendantBoxes.map((box) => box.top)),
          bottom: Math.max(...descendantBoxes.map((box) => box.bottom)),
        };
      }

      const results: ProseGapViolation[] = [];
      const proses = document.querySelectorAll('.gw-prose');

      proses.forEach((prose, proseIndex) => {
        const children = Array.from(prose.children)
          .map((element) => ({ element, box: visibleBox(element) }))
          .filter(
            (entry): entry is { element: Element; box: { top: number; bottom: number } } => entry.box !== undefined,
          );

        for (let index = 1; index < children.length; index += 1) {
          const previous = children[index - 1];
          const current = children[index];
          if (previous === undefined || current === undefined) {
            continue;
          }
          const previousTag = previous.element.tagName.toLowerCase();
          const currentTag = current.element.tagName.toLowerCase();
          const expected = expectedGap(previousTag, currentTag);
          const actual = current.box.top - previous.box.bottom;

          if (actual < expected - 1) {
            results.push({
              route: window.location.pathname,
              proseIndex,
              previousTag,
              currentTag,
              expectedGap: expected,
              actualGap: Math.round(actual),
            });
          }
        }
      });

      return results;
    });

    expect(violations, `prose gap violations on ${path}`).toEqual([]);
  });
}
