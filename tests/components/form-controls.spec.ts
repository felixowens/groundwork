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

test('radio group docs exercise fieldset structure and option selection', async ({ page }) => {
  await page.goto('/components/radio-group/');

  const group = page.locator('fieldset#contact-preference');
  await expect(group).toHaveClass(/gw-fieldset/);
  await expect(group).toHaveAttribute('aria-describedby', 'contact-preference-hint');

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

test('checkbox group docs exercise fieldset structure, selections, and error wiring', async ({ page }) => {
  await page.goto('/components/checkbox-group/');

  const group = page.locator('fieldset#services-used');
  await expect(group).toHaveClass(/gw-fieldset/);
  await expect(group).toHaveAttribute('aria-describedby', 'services-used-hint');

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

  const erroredGroup = page.locator('fieldset#notification-types');
  await expect(erroredGroup).toHaveClass(/gw-field--error/);
  await expect(erroredGroup).toHaveAttribute('aria-invalid', 'true');
  await expect(erroredGroup).toHaveAttribute('aria-describedby', 'notification-types-error');
  await expect(page.locator('#notification-types-error')).toContainText(
    'No notification type selected. Select at least one notification type.',
  );
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
