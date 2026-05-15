import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, test } from 'vitest';
import { ChoiceGroup, type ChoiceGroupOption } from '../ChoiceGroup';

const sampleOptions: readonly ChoiceGroupOption[] = [
  { value: 'email', label: 'Email' },
  { value: 'phone', label: 'Phone' },
  { value: 'post', label: 'Post', disabled: true, hint: 'Standard delivery takes 5 working days.' },
];

function renderRadioFixture(overrides: { selected?: string; defaultSelected?: string } = {}): string {
  return renderToStaticMarkup(
    <ChoiceGroup
      id="contact-preference"
      name="contactPreference"
      legend="How should we contact you?"
      hint="We will only contact you about your order."
      options={sampleOptions}
      mode="single"
      selected={overrides.selected}
      defaultSelected={overrides.defaultSelected}
      inputType="radio"
      groupClass="gw-radios"
      itemClass="gw-radio-item"
    />,
  );
}

describe('ChoiceGroup', () => {
  test('renders a fieldset with describeField-derived ARIA wiring and a legend', () => {
    const html = renderRadioFixture({ selected: 'email' });

    expect(html).toContain('<fieldset');
    expect(html).toContain('id="contact-preference"');
    expect(html).toContain('aria-describedby="contact-preference-hint"');
    expect(html).toContain('<legend class="gw-label">How should we contact you?</legend>');
    expect(html).toContain(
      '<span class="gw-hint" id="contact-preference-hint">We will only contact you about your order.</span>',
    );
  });

  test('in single mode, only the option matching `selected` is checked', () => {
    const html = renderRadioFixture({ selected: 'phone' });

    expect(html).toMatch(/<input[^>]*checked[^>]*value="phone"/);
    expect(html).not.toMatch(/<input[^>]*checked[^>]*value="email"/);
    expect(html).not.toMatch(/<input[^>]*checked[^>]*value="post"/);
  });

  test('in multi mode, every option in the `selected` array is checked', () => {
    const html = renderToStaticMarkup(
      <ChoiceGroup
        id="services-used"
        name="servicesUsed"
        legend="Which services do you use?"
        options={sampleOptions}
        mode="multi"
        selected={['email', 'post']}
        inputType="checkbox"
        groupClass="gw-checkboxes"
        itemClass="gw-checkbox-item"
      />,
    );

    expect(html).toMatch(/<input[^>]*checked[^>]*value="email"/);
    expect(html).toMatch(/<input[^>]*checked[^>]*value="post"/);
    expect(html).not.toMatch(/<input[^>]*checked[^>]*value="phone"/);
  });

  test('`defaultSelected` applies only when `selected` is undefined (uncontrolled)', () => {
    const uncontrolled = renderRadioFixture({ defaultSelected: 'email' });
    expect(uncontrolled).toMatch(/<input[^>]*checked[^>]*value="email"/);

    const controlled = renderRadioFixture({ selected: 'phone', defaultSelected: 'email' });
    expect(controlled).toMatch(/<input[^>]*checked[^>]*value="phone"/);
    expect(controlled).not.toMatch(/<input[^>]*checked[^>]*value="email"/);
  });

  test('an error sets gw-field--error, aria-invalid, and tabIndex=-1 on the fieldset', () => {
    const html = renderToStaticMarkup(
      <ChoiceGroup
        id="notification-types"
        name="notificationTypes"
        legend="Which notifications would you like?"
        error={{ problem: 'No notification type selected.', fix: 'Select at least one notification type.' }}
        options={sampleOptions}
        mode="multi"
        inputType="checkbox"
        groupClass="gw-checkboxes"
        itemClass="gw-checkbox-item"
      />,
    );

    expect(html).toContain('class="gw-field gw-fieldset gw-field--error"');
    expect(html).toContain('aria-invalid="true"');
    expect(html).toContain('tabindex="-1"');
    expect(html).toContain('aria-describedby="notification-types-error"');
    expect(html).toContain(
      '<span class="gw-error-message" id="notification-types-error">No notification type selected. Select at least one notification type.</span>',
    );
  });

  test('option IDs are derived from the group id and option value when no explicit id is given', () => {
    const html = renderRadioFixture();

    expect(html).toContain('id="contact-preference-email"');
    expect(html).toContain('id="contact-preference-phone"');
    expect(html).toContain('id="contact-preference-post"');
  });

  test('option-specific hints render with a derived id and the input points to it via aria-describedby', () => {
    const html = renderRadioFixture();

    expect(html).toContain('<span class="gw-choice__hint" id="contact-preference-post-hint">');
    expect(html).toMatch(/<input[^>]*aria-describedby="contact-preference-post-hint"[^>]*value="post"/);
  });

  test('disabled options propagate to the underlying input', () => {
    const html = renderRadioFixture();

    expect(html).toMatch(/<input[^>]*disabled[^>]*value="post"/);
  });
});
