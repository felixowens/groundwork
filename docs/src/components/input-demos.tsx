import { Field, Input, type InputWidth } from '../../../src';

export function InputHeroDemo() {
  return (
    <Field id="postcode" label="Postcode" hint="For example, SW1A 1AA">
      {({ inputProps }) => <Input {...inputProps} name="postcode" autoComplete="postal-code" width="w10" />}
    </Field>
  );
}

interface WidthExample {
  readonly id: string;
  readonly width: InputWidth;
  readonly label: string;
  readonly hint: string;
  readonly autoComplete?: string;
  readonly maxLength?: number;
}

const widthExamples: readonly WidthExample[] = [
  {
    id: 'year-of-birth',
    width: 'w5',
    label: 'Year of birth',
    hint: 'width=w5 — 4 digits, e.g. 1985',
    autoComplete: 'bday-year',
    maxLength: 4,
  },
  {
    id: 'card-last-4',
    width: 'w10',
    label: 'Last 4 digits of card',
    hint: 'width=w10 — 4 digits printed on the front of the card',
    autoComplete: 'off',
    maxLength: 4,
  },
  {
    id: 'national-insurance-number',
    width: 'w20',
    label: 'National Insurance number',
    hint: 'width=w20 — 9 characters, e.g. QQ123456C',
    autoComplete: 'off',
  },
  {
    id: 'telephone-number',
    width: 'w30',
    label: 'Telephone number',
    hint: 'width=w30 — up to 15 digits',
    autoComplete: 'tel',
  },
  {
    id: 'email-address-width',
    width: 'two-thirds',
    label: 'Email address',
    hint: 'width=two-thirds — variable length up to a moderate maximum',
    autoComplete: 'email',
  },
  {
    id: 'address-line-1',
    width: 'full',
    label: 'Address line 1',
    hint: 'width=full — variable length up to a long maximum',
    autoComplete: 'address-line1',
  },
];

export function InputWidthsDemo() {
  return (
    <form className="gw-stack--lg">
      {widthExamples.map((example) => (
        <Field key={example.width} id={example.id} label={example.label} hint={example.hint}>
          {({ inputProps }) => (
            <Input
              {...inputProps}
              name={example.id}
              width={example.width}
              {...(example.autoComplete === undefined ? {} : { autoComplete: example.autoComplete })}
              {...(example.maxLength === undefined ? {} : { maxLength: example.maxLength })}
            />
          )}
        </Field>
      ))}
    </form>
  );
}

export function InputTypeDemo() {
  return (
    <form className="gw-stack--lg">
      <Field id="type-email" label="Work email" hint="type=email · autoComplete=email">
        {({ inputProps }) => <Input {...inputProps} name="workEmail" type="email" autoComplete="email" width="w30" />}
      </Field>

      <Field id="type-tel" label="Daytime phone number" hint="type=tel · autoComplete=tel">
        {({ inputProps }) => <Input {...inputProps} name="daytimePhone" type="tel" autoComplete="tel" width="w20" />}
      </Field>

      <Field id="type-number" label="How many people are travelling?" hint="type=number">
        {({ inputProps }) => <Input {...inputProps} name="travellers" type="number" min={1} max={9} width="w5" />}
      </Field>

      <Field id="type-password" label="New password" hint="type=password · autoComplete=new-password">
        {({ inputProps }) => (
          <Input {...inputProps} name="password" type="password" autoComplete="new-password" width="w20" />
        )}
      </Field>
    </form>
  );
}

export function InputDisabledDemo() {
  return (
    <Field
      id="disabled-account-number"
      label="Account number"
      hint="Your account number can't be changed here. Contact support to update it."
    >
      {({ inputProps }) => (
        <Input {...inputProps} name="accountNumber" width="w20" defaultValue="GB29 NWBK" disabled={true} />
      )}
    </Field>
  );
}
