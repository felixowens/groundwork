import { expect, test } from '@playwright/test';
import { testFieldAriaContract } from '../field-aria-contract';

testFieldAriaContract('input (National Insurance number) wires Field-ARIA contract', {
  shape: 'single-control',
  pageUrl: '/components/input/',
  role: 'textbox',
  accessibleName: /National Insurance number/,
  expectedId: 'national-insurance-number',
  expectedClass: 'gw-input',
  expectsHint: true,
});

testFieldAriaContract('select (Country) wires Field-ARIA contract', {
  shape: 'single-control',
  pageUrl: '/components/select/',
  role: 'combobox',
  accessibleName: 'Country',
  expectedId: 'country',
  expectedClass: 'gw-select',
});

testFieldAriaContract('textarea (Supporting information) wires Field-ARIA contract', {
  shape: 'single-control',
  pageUrl: '/components/textarea/',
  role: 'textbox',
  accessibleName: /Supporting information/,
  expectedId: 'supporting-information',
  expectedClass: 'gw-textarea',
  expectsHint: true,
});

testFieldAriaContract('radio group (Contact preference) wires Field-ARIA contract', {
  shape: 'fieldset',
  pageUrl: '/components/radio-group/',
  fieldsetId: 'contact-preference',
  expectsHint: true,
});

testFieldAriaContract('checkbox group (Services used) wires Field-ARIA contract', {
  shape: 'fieldset',
  pageUrl: '/components/checkbox-group/',
  fieldsetId: 'services-used',
  expectsHint: true,
});

testFieldAriaContract('checkbox group (Notification types, errored) wires Field-ARIA contract', {
  shape: 'fieldset',
  pageUrl: '/components/checkbox-group/',
  fieldsetId: 'notification-types',
  expectsError: {
    containsText: 'No notification type selected. Select at least one notification type.',
  },
});

test('input docs exercise width and autocomplete attributes', async ({ page }) => {
  await page.goto('/components/input/');

  const nationalInsuranceNumber = page.getByRole('textbox', { name: /National Insurance number/ });
  await expect(nationalInsuranceNumber).toHaveClass(/gw-input--w20/);
  await expect(nationalInsuranceNumber).toHaveAttribute('autocomplete', 'off');

  const postcode = page.getByRole('textbox', { name: /Postcode/ });
  await expect(postcode).toHaveClass(/gw-input--w10/);
  await expect(postcode).toHaveAttribute('autocomplete', 'postal-code');
});

test('select docs exercise default option and selection', async ({ page }) => {
  await page.goto('/components/select/');

  const country = page.getByRole('combobox', { name: 'Country' });
  await expect(country).toHaveValue('');
  await expect(country.locator('option').first()).toHaveText('Select a country');

  await country.selectOption('wales');
  await expect(country).toHaveValue('wales');
});

test('textarea docs exercise rows attribute and accept input', async ({ page }) => {
  await page.goto('/components/textarea/');

  const supportingInformation = page.getByRole('textbox', { name: /Supporting information/ });
  await expect(supportingInformation).toHaveAttribute('rows', '5');

  await supportingInformation.fill('Please review the extra details before continuing.');
  await expect(supportingInformation).toHaveValue('Please review the extra details before continuing.');
});

test('radio group docs exercise option selection, keyboard nav, and per-option hint', async ({ page }) => {
  await page.goto('/components/radio-group/');

  const email = page.getByRole('radio', { name: /Email/ });
  const phone = page.getByRole('radio', { name: 'Phone' });
  const post = page.getByRole('radio', { name: /Post/ });

  await expect(email).toBeChecked();
  await expect(email.locator('xpath=..')).toHaveClass(/gw-radio-item/);
  await email.focus();
  await expect(email.locator('xpath=..')).toHaveCSS('outline-style', 'solid');
  await page.keyboard.press('ArrowDown');
  await expect(phone).toBeFocused();
  await expect(phone).toBeChecked();
  await expect(email).not.toBeChecked();
  await expect(post).toBeDisabled();
  await expect(post.locator('xpath=..')).toHaveCSS('cursor', 'not-allowed');
  await expect(post).not.toBeChecked();
  await expect(post).toHaveAttribute('aria-describedby', 'contact-preference-post-hint');
});

test('checkbox group docs exercise option toggling and per-option hint', async ({ page }) => {
  await page.goto('/components/checkbox-group/');

  const web = page.getByRole('checkbox', { name: 'Web application' });
  const api = page.getByRole('checkbox', { name: 'REST API' });
  const mobile = page.getByRole('checkbox', { name: /Mobile app/ });

  await expect(web).toBeChecked();
  await expect(web.locator('xpath=..')).toHaveClass(/gw-checkbox-item/);
  await web.focus();
  await expect(web.locator('xpath=..')).toHaveCSS('outline-style', 'solid');
  await page.keyboard.press('Space');
  await expect(web).not.toBeChecked();
  await api.check();
  await expect(api).toBeChecked();
  await expect(mobile).toHaveAttribute('aria-describedby', 'services-used-mobile-hint');
});

test('grouped controls support controlled values', async ({ page }) => {
  await page.goto('/test-fixtures/grouped-controls-controlled/');
  await page.waitForFunction(() => !document.querySelector('astro-island[ssr]'));

  const email = page.getByRole('radio', { name: 'Email' });
  const phone = page.getByRole('radio', { name: 'Phone' });
  await expect(email).toBeChecked();
  await phone.check();
  await expect(phone).toBeChecked();
  await expect(email).not.toBeChecked();

  const web = page.getByRole('checkbox', { name: 'Web application' });
  const api = page.getByRole('checkbox', { name: 'REST API' });
  await expect(web).toBeChecked();
  await api.check();
  await expect(api).toBeChecked();
  await expect(web).toBeChecked();
  await web.uncheck();
  await expect(web).not.toBeChecked();
});
