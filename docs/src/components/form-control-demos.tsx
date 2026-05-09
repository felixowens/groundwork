import { CheckboxGroup, Field, Input, RadioGroup, Select, Textarea } from '../../../src';

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

export function RadioGroupDemo() {
  return (
    <form className="gw-stack--lg">
      <RadioGroup
        id="contact-preference"
        name="contactPreference"
        legend="How should we contact you?"
        hint="Choose the method we should use for service updates."
        defaultValue="email"
        options={[
          { value: 'email', label: 'Email', hint: 'Use the email address on your account.' },
          { value: 'phone', label: 'Phone' },
          { value: 'post', label: 'Post', disabled: true, hint: 'Postal updates are not available yet.' },
        ]}
      />
    </form>
  );
}

export function CheckboxGroupDemo() {
  return (
    <form className="gw-stack--lg">
      <CheckboxGroup
        id="services-used"
        name="servicesUsed"
        legend="Which services do you use?"
        hint="Select all that apply."
        defaultValues={['web']}
        options={[
          { value: 'web', label: 'Web application' },
          { value: 'api', label: 'REST API' },
          { value: 'mobile', label: 'Mobile app', hint: 'Include iOS and Android apps.' },
        ]}
      />
      <CheckboxGroup
        id="notification-types"
        name="notificationTypes"
        legend="Notification types"
        error={{ problem: 'No notification type selected.', fix: 'Select at least one notification type.' }}
        options={[
          { value: 'security', label: 'Security alerts' },
          { value: 'billing', label: 'Billing updates' },
        ]}
      />
    </form>
  );
}
