import { Button, ErrorSummary, Field, Input, Select, Textarea, type ErrorSummaryItem } from '../../../src';

const emailError = {
  problem: 'The email address is missing a domain.',
  fix: 'Enter an email address in the correct format, like name@example.com.',
};

const errors: ErrorSummaryItem[] = [
  {
    id: 'email',
    label: 'Email address',
    error: emailError,
  },
];

export function FieldDemo() {
  return (
    <form className="gw-stack--lg">
      <Field id="full-name" label="Full name">
        {({ inputProps }) => <Input {...inputProps} name="fullName" autoComplete="name" />}
      </Field>

      <Field id="postcode" label="Postcode" hint="For example, SW1A 1AA">
        {({ inputProps }) => <Input {...inputProps} name="postcode" autoComplete="postal-code" width="w10" />}
      </Field>

      <Field id="account-type" label="Account type">
        {({ inputProps }) => (
          <Select {...inputProps} name="accountType">
            <option value="">Select an option</option>
            <option value="personal">Personal</option>
            <option value="business">Business</option>
          </Select>
        )}
      </Field>

      <Field id="notes" label="Notes" hint="Optional. Max 500 characters.">
        {({ inputProps }) => <Textarea {...inputProps} name="notes" rows={4} />}
      </Field>

      <Button>Continue</Button>
    </form>
  );
}

export function ErrorDemo() {
  return (
    <form className="gw-stack--lg">
      <ErrorSummary items={errors} />
      <Field id="email" label="Email address" error={emailError}>
        {({ inputProps }) => <Input {...inputProps} name="email" type="email" defaultValue="harry@" width="w30" />}
      </Field>
      <Button>Save email address</Button>
    </form>
  );
}
