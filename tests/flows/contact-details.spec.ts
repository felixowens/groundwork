import { expect, test } from '@playwright/test';

test('contact details flow validates, reviews, and confirms', async ({ page }) => {
  await page.goto('/flows/contact-details/');
  await page.waitForFunction(() => !document.querySelector('astro-island[ssr]'));

  await page.getByRole('button', { name: 'Continue' }).click();

  await expect(page.getByRole('heading', { name: 'There is a problem' })).toBeVisible();
  await expect(page.getByRole('alert')).toBeFocused();
  await expect(page.getByRole('link', { name: /Full name:/ })).toBeVisible();

  await page.getByRole('link', { name: /Full name:/ }).click();
  await expect(page.getByRole('textbox', { name: 'Full name' })).toBeFocused();

  await page.getByRole('textbox', { name: 'Full name' }).fill('Harry Thompson');
  await page.getByRole('textbox', { name: 'Email address' }).fill('harry@example.com');
  await page.getByRole('combobox', { name: 'Reason for contact' }).selectOption('technical');
  await page.getByRole('textbox', { name: 'Notes' }).fill('I need help configuring a deployment.');
  await page.getByRole('button', { name: 'Continue' }).click();

  await expect(page.getByRole('heading', { name: 'Check your answers' })).toBeVisible();
  await expect(page.getByText('Harry Thompson')).toBeVisible();
  await expect(page.getByText('Technical support')).toBeVisible();

  await page.getByRole('link', { name: 'Change' }).first().click();
  await expect(page.getByRole('textbox', { name: 'Full name' })).toHaveValue('Harry Thompson');

  await page.getByRole('button', { name: 'Continue' }).click();
  await expect(page.getByRole('heading', { name: 'Check your answers' })).toBeVisible();

  await page.getByRole('button', { name: 'Back' }).click();
  await expect(page.getByRole('textbox', { name: 'Full name' })).toHaveValue('Harry Thompson');

  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByRole('button', { name: 'Confirm and continue' }).click();

  await expect(page.getByText('Contact details saved')).toBeVisible();
});
