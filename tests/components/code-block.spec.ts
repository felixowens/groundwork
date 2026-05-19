import { expect, test } from '@playwright/test';

const HERO_SNIPPET = `<Field id="email" label="Email address">
  {({ inputProps }) => <Input {...inputProps} type="email" />}
</Field>`;

const CAPTION_SNIPPET = `<section class="gw-section">
  <div class="gw-width gw-stack--lg">
    <h1>Page title</h1>
    <p>Page intro.</p>
  </div>
</section>`;

const LANGUAGE_SNIPPET = `.gw-button {
  padding: var(--space-3) var(--space-6);
  font-weight: 600;
  border-radius: var(--radius-sm);
}`;

test.describe('CodeBlock', () => {
  test.beforeEach(async ({ context, page }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await page.goto('/components/code-block/');
    await page.waitForFunction(() => !document.querySelector('astro-island[ssr]'));
  });

  test('writes the verbatim snippet to the clipboard — no [object Object], no toString coercion', async ({ page }) => {
    const heroFigure = page.locator('.gw-code-block-figure').first();
    await heroFigure.getByRole('button', { name: 'Copy' }).click();
    await expect(heroFigure.getByRole('button', { name: 'Copied' })).toBeVisible();

    const clipboardText = await page.evaluate(() => navigator.clipboard.readText());
    expect(clipboardText).toBe(HERO_SNIPPET);
    expect(clipboardText).not.toContain('[object Object]');
    expect(clipboardText).not.toContain('[object ');
  });

  test('preserves whitespace, newlines, and JSX angle brackets', async ({ page }) => {
    const heroFigure = page.locator('.gw-code-block-figure').first();
    await heroFigure.getByRole('button', { name: 'Copy' }).click();

    const clipboardText = await page.evaluate(() => navigator.clipboard.readText());

    expect(clipboardText.split('\n')).toHaveLength(3);
    expect(clipboardText).toContain('<Field');
    expect(clipboardText).toContain('</Field>');
    expect(clipboardText).toContain('  {({ inputProps })');
  });

  test('each demo copies its own snippet, not the previously-copied one', async ({ page }) => {
    const figures = page.locator('.gw-code-block-figure');

    await figures.nth(0).getByRole('button', { name: 'Copy' }).click();
    await expect(figures.nth(0).getByRole('button', { name: 'Copied' })).toBeVisible();
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(HERO_SNIPPET);

    await figures.nth(1).getByRole('button', { name: 'Copy' }).click();
    await expect(figures.nth(1).getByRole('button', { name: 'Copied' })).toBeVisible();
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(CAPTION_SNIPPET);

    await figures.nth(2).getByRole('button', { name: 'Copy' }).click();
    await expect(figures.nth(2).getByRole('button', { name: 'Copied' })).toBeVisible();
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(LANGUAGE_SNIPPET);
  });

  test('renders the caption as a figcaption above the code', async ({ page }) => {
    const captionFigure = page.locator('.gw-code-block-figure').nth(1);
    const caption = captionFigure.locator('figcaption');

    await expect(caption).toHaveText('Standard page wrapper');
    await expect(caption).toHaveClass(/gw-code-block-caption/);
  });

  test('applies a language- class to the inner <code> for syntax-highlighter hooks', async ({ page }) => {
    const figures = page.locator('.gw-code-block-figure');

    await expect(figures.nth(0).locator('code')).toHaveClass('language-tsx');
    await expect(figures.nth(1).locator('code')).toHaveClass('language-html');
    await expect(figures.nth(2).locator('code')).toHaveClass('language-css');
  });

  test('the <pre> is keyboard-focusable so users can scroll long lines', async ({ page }) => {
    const pre = page.locator('.gw-code-block').first();
    await expect(pre).toHaveAttribute('tabindex', '0');

    await pre.focus();
    await expect(pre).toBeFocused();
  });

  test('the Copied announcement stays long enough for a screen reader to finish reading it', async ({ page }) => {
    const heroFigure = page.locator('.gw-code-block-figure').first();
    const button = heroFigure.getByRole('button');
    const liveRegion = heroFigure.getByText('Code copied to clipboard.');

    await button.click();
    await expect(button).toHaveText('Copied');
    await expect(liveRegion).toBeAttached();

    // The live region must still hold the announcement ~2.5s in — that's
    // roughly the bottom of VoiceOver's read time at default speech rate.
    // If this fails, the revert is firing too early and the announcement
    // gets cut off.
    await page.waitForTimeout(2500);
    await expect(button).toHaveText('Copied');

    // And it must eventually clear, well within 5 seconds.
    await expect(button).toHaveText('Copy', { timeout: 5000 });
  });
});
