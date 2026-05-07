import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Button, ErrorSummary, Field, Input, Select, Textarea, type ErrorSummaryItem, type FieldError } from '../../../src';

type FlowStep = 'form' | 'review' | 'confirmation';

type ContactDetails = {
  fullName: string;
  email: string;
  contactReason: string;
  notes: string;
};

type ContactDetailsErrors = Partial<Record<keyof ContactDetails, FieldError>>;

const initialDetails: ContactDetails = {
  fullName: '',
  email: '',
  contactReason: '',
  notes: '',
};

function validateContactDetails(details: ContactDetails): ContactDetailsErrors {
  const errors: ContactDetailsErrors = {};

  if (details.fullName.trim() === '') {
    errors.fullName = {
      problem: 'The full name is missing.',
      fix: 'Enter your full name.',
    };
  }

  if (!details.email.includes('@')) {
    errors.email = {
      problem: 'The email address is incomplete.',
      fix: 'Enter an email address in the correct format, like name@example.com.',
    };
  }

  if (details.contactReason === '') {
    errors.contactReason = {
      problem: 'The contact reason has not been selected.',
      fix: 'Select the reason you are contacting us.',
    };
  }

  return errors;
}

function errorSummaryItems(errors: ContactDetailsErrors): ErrorSummaryItem[] {
  const items: ErrorSummaryItem[] = [];

  if (errors.fullName !== undefined) {
    items.push({ id: 'flow-full-name', label: 'Full name', error: errors.fullName });
  }

  if (errors.email !== undefined) {
    items.push({ id: 'flow-email', label: 'Email address', error: errors.email });
  }

  if (errors.contactReason !== undefined) {
    items.push({ id: 'flow-contact-reason', label: 'Reason for contact', error: errors.contactReason });
  }

  return items;
}

function contactReasonLabel(value: string): string {
  switch (value) {
    case 'account':
      return 'Account question';
    case 'billing':
      return 'Billing question';
    case 'technical':
      return 'Technical support';
    default:
      return 'Not selected';
  }
}

export function ContactDetailsFlow() {
  const [step, setStep] = useState<FlowStep>('form');
  const [details, setDetails] = useState<ContactDetails>(initialDetails);
  const [errors, setErrors] = useState<ContactDetailsErrors>({});
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const errorSummaryRef = useRef<HTMLDivElement>(null);

  const errorItems = errorSummaryItems(errors);

  useEffect(() => {
    if (step === 'form' && hasSubmitted && errorItems.length > 0) {
      errorSummaryRef.current?.focus();
    }
  }, [errorItems.length, hasSubmitted, step]);

  function updateDetail(field: keyof ContactDetails, value: string) {
    setDetails((current) => ({ ...current, [field]: value }));
  }

  function submitDetails(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors = validateContactDetails(details);
    setHasSubmitted(true);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      setStep('form');
      return;
    }

    setStep('review');
  }

  function submitReview(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStep('confirmation');
  }

  function resetFlow() {
    setDetails(initialDetails);
    setErrors({});
    setHasSubmitted(false);
    setStep('form');
  }

  if (step === 'confirmation') {
    return (
      <section className="gw-stack--lg" aria-live="polite">
        <div className="gw-banner gw-banner--success">
          <p className="gw-banner__title">Contact details saved</p>
          <p className="gw-banner__body">We will use these details if we need to follow up.</p>
        </div>
        <div className="gw-card gw-stack">
          <h2 className="gw-heading-m">What happens next</h2>
          <p className="gw-body--sm">This demo ends here. In a real service, the next step would send the request or return to the account area.</p>
          <Button variant="secondary" onClick={resetFlow}>Start again</Button>
        </div>
      </section>
    );
  }

  if (step === 'review') {
    return (
      <form className="gw-stack--lg" onSubmit={submitReview}>
        <div className="gw-prose">
          <h2 className="gw-heading-m">Check your answers</h2>
          <p>Confirm your contact details before continuing.</p>
        </div>

        <dl className="gw-summary-list">
          <div className="gw-summary-list__row">
            <dt className="gw-summary-list__key">Full name</dt>
            <dd className="gw-summary-list__value">{details.fullName}</dd>
            <dd className="gw-summary-list__action"><a className="gw-link" href="#contact-details-flow" onClick={() => setStep('form')}>Change</a></dd>
          </div>
          <div className="gw-summary-list__row">
            <dt className="gw-summary-list__key">Email address</dt>
            <dd className="gw-summary-list__value">{details.email}</dd>
            <dd className="gw-summary-list__action"><a className="gw-link" href="#contact-details-flow" onClick={() => setStep('form')}>Change</a></dd>
          </div>
          <div className="gw-summary-list__row">
            <dt className="gw-summary-list__key">Reason</dt>
            <dd className="gw-summary-list__value">{contactReasonLabel(details.contactReason)}</dd>
            <dd className="gw-summary-list__action"><a className="gw-link" href="#contact-details-flow" onClick={() => setStep('form')}>Change</a></dd>
          </div>
          <div className="gw-summary-list__row">
            <dt className="gw-summary-list__key">Notes</dt>
            <dd className="gw-summary-list__value">{details.notes.trim() === '' ? 'Not provided' : details.notes}</dd>
            <dd className="gw-summary-list__action"><a className="gw-link" href="#contact-details-flow" onClick={() => setStep('form')}>Change</a></dd>
          </div>
        </dl>

        <div className="gw-button-group">
          <Button type="submit">Confirm and continue</Button>
          <Button type="button" variant="secondary" onClick={() => setStep('form')}>Back</Button>
        </div>
      </form>
    );
  }

  return (
    <form className="gw-stack--lg" id="contact-details-flow" onSubmit={submitDetails} noValidate>
      <ErrorSummary ref={errorSummaryRef} items={errorItems} />

      <Field id="flow-full-name" label="Full name" error={errors.fullName}>
        {({ inputProps }) => (
          <Input
            {...inputProps}
            name="fullName"
            autoComplete="name"
            value={details.fullName}
            onChange={(event) => updateDetail('fullName', event.currentTarget.value)}
          />
        )}
      </Field>

      <Field id="flow-email" label="Email address" hint="We'll only use this for follow-up about this request." error={errors.email}>
        {({ inputProps }) => (
          <Input
            {...inputProps}
            name="email"
            type="email"
            autoComplete="email"
            width="w30"
            value={details.email}
            onChange={(event) => updateDetail('email', event.currentTarget.value)}
          />
        )}
      </Field>

      <Field id="flow-contact-reason" label="Reason for contact" error={errors.contactReason}>
        {({ inputProps }) => (
          <Select
            {...inputProps}
            name="contactReason"
            value={details.contactReason}
            onChange={(event) => updateDetail('contactReason', event.currentTarget.value)}
          >
            <option value="">Select a reason</option>
            <option value="account">Account question</option>
            <option value="billing">Billing question</option>
            <option value="technical">Technical support</option>
          </Select>
        )}
      </Field>

      <Field id="flow-notes" label="Notes" hint="Optional. Include anything that helps us understand the request.">
        {({ inputProps }) => (
          <Textarea
            {...inputProps}
            name="notes"
            rows={4}
            value={details.notes}
            onChange={(event) => updateDetail('notes', event.currentTarget.value)}
          />
        )}
      </Field>

      <Button type="submit">Continue</Button>
    </form>
  );
}
