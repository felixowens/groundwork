import { Field, Input, Select, Textarea } from '../../../src';

export function InputDemo() {
  return (
    <form className="gw-stack--lg">
      <Field id="national-insurance-number" label="National Insurance number" hint="For example, QQ 12 34 56 C">
        {({ inputProps }) => <Input {...inputProps} name="nationalInsuranceNumber" autoComplete="off" width="w20" />}
      </Field>

      <Field id="postcode" label="Postcode" hint="Use the short width when the expected answer is short.">
        {({ inputProps }) => <Input {...inputProps} name="postcode" autoComplete="postal-code" width="w10" />}
      </Field>
    </form>
  );
}

export function SelectDemo() {
  return (
    <form className="gw-stack--lg">
      <Field id="country" label="Country">
        {({ inputProps }) => (
          <Select {...inputProps} name="country" defaultValue="">
            <option value="">Select a country</option>
            <option value="england">England</option>
            <option value="scotland">Scotland</option>
            <option value="wales">Wales</option>
            <option value="northern-ireland">Northern Ireland</option>
          </Select>
        )}
      </Field>
    </form>
  );
}

export function TextareaDemo() {
  return (
    <form className="gw-stack--lg">
      <Field
        id="supporting-information"
        label="Supporting information"
        hint="Include anything we need to know before reviewing your request."
      >
        {({ inputProps }) => <Textarea {...inputProps} name="supportingInformation" rows={5} />}
      </Field>
    </form>
  );
}
