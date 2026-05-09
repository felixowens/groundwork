import { expect, test } from '@playwright/test';

test('input docs exercise width classes and Field ARIA wiring', async ({ page }) => {
  await page.goto('/components/input/');

  const nationalInsuranceNumber = page.getByRole('textbox', { name: /National Insurance number/ });
  await expect(nationalInsuranceNumber).toHaveClass(/gw-input/);
  await expect(nationalInsuranceNumber).toHaveClass(/gw-input--w20/);
  await expect(nationalInsuranceNumber).toHaveAttribute('aria-labelledby', 'national-insurance-number-label');
  await expect(nationalInsuranceNumber).toHaveAttribute('aria-describedby', 'national-insurance-number-hint');
  await expect(nationalInsuranceNumber).toHaveAttribute('autocomplete', 'off');

  const postcode = page.getByRole('textbox', { name: /Postcode/ });
  await expect(postcode).toHaveClass(/gw-input--w10/);
  await expect(postcode).toHaveAttribute('autocomplete', 'postal-code');
});

test('select docs exercise default option and Field ARIA wiring', async ({ page }) => {
  await page.goto('/components/select/');

  const country = page.getByRole('combobox', { name: 'Country' });
  await expect(country).toHaveClass('gw-select');
  await expect(country).toHaveAttribute('aria-labelledby', 'country-label');
  await expect(country).toHaveValue('');
  await expect(country.locator('option').first()).toHaveText('Select a country');

  await country.selectOption('wales');
  await expect(country).toHaveValue('wales');
});

test('textarea docs exercise rows property and Field ARIA wiring', async ({ page }) => {
  await page.goto('/components/textarea/');

  const supportingInformation = page.getByRole('textbox', { name: /Supporting information/ });
  await expect(supportingInformation).toHaveClass('gw-textarea');
  await expect(supportingInformation).toHaveAttribute('aria-labelledby', 'supporting-information-label');
  await expect(supportingInformation).toHaveAttribute('aria-describedby', 'supporting-information-hint');
  await expect(supportingInformation).toHaveAttribute('rows', '5');

  await supportingInformation.fill('Please review the extra details before continuing.');
  await expect(supportingInformation).toHaveValue('Please review the extra details before continuing.');
});
