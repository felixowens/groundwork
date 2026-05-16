import { expect, test } from '@playwright/test';

test('submit-information flow validates, reviews, and confirms', async ({ page }) => {
  await page.goto('/patterns/submit-information/');
  await page.waitForFunction(() => !document.querySelector('astro-island[ssr]'));

  await page.getByRole('button', { name: 'Continue' }).click();

  await expect(page.getByRole('heading', { name: 'There is a problem' })).toBeVisible();
  await expect(page.getByRole('alert')).toBeFocused();
  await expect(page.getByRole('link', { name: /Full name:/ })).toBeVisible();
  await expect(page.getByRole('link', { name: /Reason for contact:/ })).toBeVisible();
  await expect(page.getByRole('link', { name: /Notification types:/ })).toBeVisible();

  await page.getByRole('link', { name: /Full name:/ }).click();
  await expect(page.getByRole('textbox', { name: 'Full name' })).toBeFocused();

  await page.getByRole('link', { name: /Notification types:/ }).click();
  await expect(page.locator('fieldset#flow-notification-types')).toBeFocused();

  await page.getByRole('textbox', { name: 'Full name' }).fill('Harry Thompson');
  await page.getByRole('textbox', { name: 'Email address' }).fill('harry@example.com');
  await page.getByRole('radio', { name: /Technical support/ }).check();
  await page.getByRole('checkbox', { name: /Security alerts/ }).check();
  await page.getByRole('checkbox', { name: 'Billing updates' }).check();
  await page.getByRole('textbox', { name: 'Notes' }).fill('I need help configuring a deployment.');
  await page.getByRole('button', { name: 'Continue' }).click();

  await expect(page.getByRole('heading', { name: 'Check your answers' })).toBeVisible();
  await expect(page.getByText('Harry Thompson')).toBeVisible();
  await expect(page.getByText('Technical support')).toBeVisible();
  await expect(page.getByText('Security alerts, Billing updates')).toBeVisible();

  await page.getByRole('button', { name: 'Change full name' }).click();
  await expect(page.getByRole('textbox', { name: 'Full name' })).toHaveValue('Harry Thompson');
  await expect(page.getByRole('radio', { name: /Technical support/ })).toBeChecked();
  await expect(page.getByRole('checkbox', { name: /Security alerts/ })).toBeChecked();
  await expect(page.getByRole('checkbox', { name: 'Billing updates' })).toBeChecked();

  await page.getByRole('button', { name: 'Continue' }).click();
  await expect(page.getByRole('heading', { name: 'Check your answers' })).toBeVisible();

  await page.getByRole('button', { name: 'Back' }).click();
  await expect(page.getByRole('textbox', { name: 'Full name' })).toHaveValue('Harry Thompson');
  await expect(page.getByRole('radio', { name: /Technical support/ })).toBeChecked();
  await expect(page.getByRole('checkbox', { name: /Security alerts/ })).toBeChecked();

  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByRole('button', { name: 'Confirm and continue' }).click();

  await expect(page.getByText('Contact details saved')).toBeVisible();
});
