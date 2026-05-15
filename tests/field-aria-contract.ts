import { expect, type Page, test } from '@playwright/test';

export interface FieldAriaSingleControlConfig {
  shape: 'single-control';
  pageUrl: string;
  role: 'textbox' | 'combobox';
  accessibleName: string | RegExp;
  expectedId: string;
  expectedClass: string;
  expectsHint?: boolean;
  expectsError?: { containsText: string | RegExp };
}

export interface FieldAriaFieldsetConfig {
  shape: 'fieldset';
  pageUrl: string;
  fieldsetId: string;
  expectsHint?: boolean;
  expectsError?: { containsText: string | RegExp };
}

export type FieldAriaContractConfig = FieldAriaSingleControlConfig | FieldAriaFieldsetConfig;

export function testFieldAriaContract(name: string, config: FieldAriaContractConfig): void {
  test(name, async ({ page }) => {
    await page.goto(config.pageUrl);
    if (config.shape === 'single-control') {
      await assertSingleControl(page, config);
    } else {
      await assertFieldset(page, config);
    }
  });
}

async function assertSingleControl(page: Page, config: FieldAriaSingleControlConfig): Promise<void> {
  const control = page.getByRole(config.role, { name: config.accessibleName });
  await expect(control).toHaveClass(new RegExp(escapeRegex(config.expectedClass)));
  await expect(control).toHaveAttribute('aria-labelledby', `${config.expectedId}-label`);

  const describedBy = composeDescribedBy(config.expectedId, config);
  if (describedBy !== undefined) {
    await expect(control).toHaveAttribute('aria-describedby', describedBy);
  }

  if (config.expectsError !== undefined) {
    await expect(control).toHaveAttribute('aria-invalid', 'true');
    await expect(page.locator(`#${config.expectedId}-error`)).toContainText(config.expectsError.containsText);
  }
}

async function assertFieldset(page: Page, config: FieldAriaFieldsetConfig): Promise<void> {
  const fieldset = page.locator(`fieldset#${config.fieldsetId}`);
  await expect(fieldset).toHaveClass(/gw-fieldset/);

  const describedBy = composeDescribedBy(config.fieldsetId, config);
  if (describedBy !== undefined) {
    await expect(fieldset).toHaveAttribute('aria-describedby', describedBy);
  }

  if (config.expectsError !== undefined) {
    await expect(fieldset).toHaveClass(/gw-field--error/);
    await expect(fieldset).toHaveAttribute('aria-invalid', 'true');
    await expect(page.locator(`#${config.fieldsetId}-error`)).toContainText(config.expectsError.containsText);
  }
}

function composeDescribedBy(
  id: string,
  config: { expectsHint?: boolean; expectsError?: { containsText: string | RegExp } },
): string | undefined {
  const tokens: string[] = [];
  if (config.expectsHint === true) {
    tokens.push(`${id}-hint`);
  }
  if (config.expectsError !== undefined) {
    tokens.push(`${id}-error`);
  }
  return tokens.length === 0 ? undefined : tokens.join(' ');
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
