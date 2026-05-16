import { expect, test } from '@playwright/test';

test('check-answers demo groups answers and preserves them across edits', async ({ page }) => {
  await page.goto('/patterns/check-answers/');
  await page.waitForFunction(() => !document.querySelector('astro-island[ssr]'));

  const demo = page.locator('section[aria-labelledby="check-answers-demo-heading"]');

  await expect(demo.getByRole('heading', { name: 'Check your answers before submitting' })).toBeVisible();
  await expect(demo.getByRole('heading', { name: 'Personal details' })).toBeVisible();
  await expect(demo.getByRole('heading', { name: 'Application details' })).toBeVisible();
  await expect(demo.getByText('Harry Thompson')).toBeVisible();
  await expect(demo.getByText('harry@example.com')).toBeVisible();
  await expect(demo.getByText('Technical support')).toBeVisible();
  await expect(demo.getByText('Not provided')).toBeVisible();

  await demo.getByRole('button', { name: 'Change full name' }).click();

  const nameInput = demo.getByRole('textbox', { name: 'Full name' });
  await expect(nameInput).toHaveValue('Harry Thompson');

  await nameInput.fill('Ada Lovelace');
  await demo.getByRole('button', { name: 'Save and return' }).click();

  await expect(demo.getByRole('heading', { name: 'Personal details' })).toBeVisible();
  await expect(demo.getByText('Ada Lovelace')).toBeVisible();
  await expect(demo.getByText('Harry Thompson')).not.toBeVisible();

  await demo.getByRole('button', { name: 'Change full name' }).click();
  await expect(demo.getByRole('textbox', { name: 'Full name' })).toHaveValue('Ada Lovelace');
  await demo.getByRole('button', { name: 'Cancel' }).click();

  await expect(demo.getByText('Ada Lovelace')).toBeVisible();

  await demo.getByRole('button', { name: 'Accept and send' }).click();
  await expect(demo.getByText('Application submitted')).toBeVisible();
});
