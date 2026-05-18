import { Button, ErrorSummary, type ErrorSummaryItem, Field, Input, Select, Textarea } from '../../../src';
import { sampleEmailError, sampleEmailSummaryItem } from './field-demos';

const dateOfBirthError = {
  problem: 'Date of birth must be in the past.',
  fix: 'Enter a date earlier than today.',
};

const passwordError = {
  problem: 'The password must be at least 12 characters long.',
  fix: 'Add more characters until the password is at least 12 long.',
};

const countryError = {
  problem: 'Select the country you live in.',
  fix: 'Choose a country from the list.',
};

const notesError = {
  problem: 'The notes are longer than the 500-character limit.',
  fix: 'Shorten the notes by removing detail or splitting them across submissions.',
};

const fullNameError = {
  problem: 'Enter your full name.',
  fix: 'Include your first name and your last name.',
};

const referenceNumberError = {
  problem: 'The reference number is the wrong length.',
  fix: 'Enter the 8-character reference printed on your welcome letter.',
};

const heroItems: readonly ErrorSummaryItem[] = [
  { id: 'hero-full-name', label: 'Full name', error: fullNameError },
  { id: 'hero-date-of-birth', label: 'Date of birth', error: dateOfBirthError },
  { id: 'hero-password', label: 'Password', error: passwordError },
];

const multipleItems: readonly ErrorSummaryItem[] = [
  { id: 'multi-full-name', label: 'Full name', error: fullNameError },
  { id: 'multi-reference', label: 'Reference number', error: referenceNumberError },
  { id: 'multi-date-of-birth', label: 'Date of birth', error: dateOfBirthError },
  { id: 'multi-password', label: 'Password', error: passwordError },
  { id: 'multi-country', label: 'Country', error: countryError },
  { id: 'multi-notes', label: 'Notes', error: notesError },
];

export function ErrorSummaryHeroDemo() {
  return (
    <form className="gw-stack--lg">
      <ErrorSummary items={heroItems} />

      <Field id="hero-full-name" label="Full name" error={fullNameError}>
        {({ inputProps }) => <Input {...inputProps} name="fullName" autoComplete="name" />}
      </Field>

      <Field id="hero-date-of-birth" label="Date of birth" hint="For example, 27 3 1985" error={dateOfBirthError}>
        {({ inputProps }) => <Input {...inputProps} name="dateOfBirth" defaultValue="01 01 3025" width="w20" />}
      </Field>

      <Field id="hero-password" label="Password" hint="Must be at least 12 characters." error={passwordError}>
        {({ inputProps }) => <Input {...inputProps} name="password" type="password" defaultValue="short" width="w20" />}
      </Field>

      <Button>Save and continue</Button>
    </form>
  );
}

export function ErrorSummarySingleDemo() {
  return (
    <form className="gw-stack--lg">
      <ErrorSummary items={[sampleEmailSummaryItem]} />

      <Field id="email" label="Email address" error={sampleEmailError}>
        {({ inputProps }) => <Input {...inputProps} name="email" type="email" defaultValue="harry@" width="w30" />}
      </Field>

      <Button>Save email address</Button>
    </form>
  );
}

export function ErrorSummaryMultipleDemo() {
  return (
    <form className="gw-stack--lg">
      <ErrorSummary items={multipleItems} />

      <Field id="multi-full-name" label="Full name" error={fullNameError}>
        {({ inputProps }) => <Input {...inputProps} name="multiFullName" autoComplete="name" />}
      </Field>

      <Field id="multi-reference" label="Reference number" error={referenceNumberError}>
        {({ inputProps }) => <Input {...inputProps} name="reference" defaultValue="ABC" width="w20" />}
      </Field>

      <Field id="multi-date-of-birth" label="Date of birth" hint="For example, 27 3 1985" error={dateOfBirthError}>
        {({ inputProps }) => <Input {...inputProps} name="multiDateOfBirth" defaultValue="01 01 3025" width="w20" />}
      </Field>

      <Field id="multi-password" label="Password" hint="Must be at least 12 characters." error={passwordError}>
        {({ inputProps }) => (
          <Input {...inputProps} name="multiPassword" type="password" defaultValue="short" width="w20" />
        )}
      </Field>

      <Field id="multi-country" label="Country" error={countryError}>
        {({ inputProps }) => (
          <Select {...inputProps} name="multiCountry" defaultValue="">
            <option value="">Select a country</option>
            <option value="england">England</option>
            <option value="scotland">Scotland</option>
            <option value="wales">Wales</option>
            <option value="northern-ireland">Northern Ireland</option>
          </Select>
        )}
      </Field>

      <Field id="multi-notes" label="Notes" error={notesError}>
        {({ inputProps }) => <Textarea {...inputProps} name="multiNotes" rows={4} />}
      </Field>

      <Button>Save and continue</Button>
    </form>
  );
}
