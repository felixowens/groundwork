import { Button, type ErrorSummaryItem, Field, Input, Select, Textarea } from '../../../src';

export const sampleEmailError = {
  problem: 'The email address is missing a domain.',
  fix: 'Enter an email address in the correct format, like name@example.com.',
};

export const sampleEmailSummaryItem: ErrorSummaryItem = {
  id: 'email',
  label: 'Email address',
  error: sampleEmailError,
};

export function FieldHeroDemo() {
  return (
    <form className="gw-stack--lg">
      <Field id="hero-full-name" label="Full name">
        {({ inputProps }) => <Input {...inputProps} name="fullName" autoComplete="name" />}
      </Field>

      <Field id="hero-postcode" label="Postcode" hint="For example, SW1A 1AA">
        {({ inputProps }) => <Input {...inputProps} name="postcode" autoComplete="postal-code" width="w10" />}
      </Field>

      <Button>Continue</Button>
    </form>
  );
}

export function FieldHintDemo() {
  return (
    <Field
      id="hint-reference"
      label="Reference number"
      hint="It is 8 digits long and starts with two letters. You can find it on your welcome letter."
    >
      {({ inputProps }) => <Input {...inputProps} name="reference" width="w20" />}
    </Field>
  );
}

export function FieldErrorDemo() {
  return (
    <Field id="error-email" label="Email address" error={sampleEmailError}>
      {({ inputProps }) => <Input {...inputProps} name="email" type="email" defaultValue="harry@" width="w30" />}
    </Field>
  );
}

export function FieldCompositionDemo() {
  return (
    <form className="gw-stack--lg">
      <Field id="composition-postcode" label="Postcode" hint="The same Field wraps an Input.">
        {({ inputProps }) => <Input {...inputProps} name="postcode" autoComplete="postal-code" width="w10" />}
      </Field>

      <Field id="composition-notes" label="Notes" hint="The same Field wraps a Textarea.">
        {({ inputProps }) => <Textarea {...inputProps} name="notes" rows={4} />}
      </Field>

      <Field id="composition-account-type" label="Account type" hint="The same Field wraps a Select.">
        {({ inputProps }) => (
          <Select {...inputProps} name="accountType" defaultValue="">
            <option value="">Select an option</option>
            <option value="personal">Personal</option>
            <option value="business">Business</option>
          </Select>
        )}
      </Field>
    </form>
  );
}
