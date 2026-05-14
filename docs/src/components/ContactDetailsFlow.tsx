import { type FormEvent, useEffect, useRef, useState } from 'react';
import {
  Banner,
  Button,
  CheckboxGroup,
  ErrorSummary,
  type ErrorSummaryItem,
  Field,
  type FieldError,
  Input,
  RadioGroup,
  Textarea,
} from '../../../src';
import { assertNever } from '../../../src/lib/assert-never';

type FlowStep = 'form' | 'review' | 'confirmation';
type ContactReason = 'account' | 'billing' | 'technical';
type NotificationType = 'security' | 'billing' | 'product';

interface ContactDetails {
  fullName: string;
  email: string;
  contactReason: ContactReason | null;
  notificationTypes: NotificationType[];
  notes: string;
}

interface ReviewedContactDetails extends Omit<ContactDetails, 'contactReason'> {
  contactReason: ContactReason;
}

type ContactDetailsErrors = Partial<Record<keyof ContactDetails, FieldError>>;

const initialDetails: ContactDetails = {
  fullName: '',
  email: '',
  contactReason: null,
  notificationTypes: [],
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

  if (details.contactReason === null) {
    errors.contactReason = {
      problem: 'The contact reason has not been selected.',
      fix: 'Select the reason you are contacting us.',
    };
  }

  if (details.notificationTypes.length === 0) {
    errors.notificationTypes = {
      problem: 'No notification type has been selected.',
      fix: 'Select at least one notification type.',
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

  if (errors.notificationTypes !== undefined) {
    items.push({ id: 'flow-notification-types', label: 'Notification types', error: errors.notificationTypes });
  }

  return items;
}

function parseContactReason(value: string): ContactDetails['contactReason'] {
  switch (value) {
    case '':
      return null;
    case 'account':
    case 'billing':
    case 'technical':
      return value;
    default:
      throw new Error(`Unknown contact reason: ${value}`);
  }
}

function parseNotificationType(value: string): NotificationType {
  switch (value) {
    case 'security':
    case 'billing':
    case 'product':
      return value;
    default:
      throw new Error(`Unknown notification type: ${value}`);
  }
}

function contactReasonLabel(value: ContactReason): string {
  switch (value) {
    case 'account':
      return 'Account question';
    case 'billing':
      return 'Billing question';
    case 'technical':
      return 'Technical support';
    default:
      return assertNever(value);
  }
}

function notificationTypeLabel(value: NotificationType): string {
  switch (value) {
    case 'security':
      return 'Security alerts';
    case 'billing':
      return 'Billing updates';
    case 'product':
      return 'Product announcements';
    default:
      return assertNever(value);
  }
}

export function ContactDetailsFlow() {
  const [step, setStep] = useState<FlowStep>('form');
  const [details, setDetails] = useState<ContactDetails>(initialDetails);
  const [reviewDetails, setReviewDetails] = useState<ReviewedContactDetails | undefined>();
  const [errors, setErrors] = useState<ContactDetailsErrors>({});
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const errorSummaryRef = useRef<HTMLDivElement>(null);

  const errorItems = errorSummaryItems(errors);

  useEffect(() => {
    if (step === 'form' && hasSubmitted && errorItems.length > 0) {
      errorSummaryRef.current?.focus();
    }
  }, [errorItems.length, hasSubmitted, step]);

  function updateDetail<Field extends keyof ContactDetails>(field: Field, value: ContactDetails[Field]) {
    setDetails((current) => ({ ...current, [field]: value }));
  }

  function updateNotificationType(value: string, checked: boolean) {
    const notificationType = parseNotificationType(value);

    setDetails((current) => ({
      ...current,
      notificationTypes: checked
        ? [...current.notificationTypes, notificationType]
        : current.notificationTypes.filter((currentType) => currentType !== notificationType),
    }));
  }

  function submitDetails(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors = validateContactDetails(details);
    setHasSubmitted(true);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      setReviewDetails(undefined);
      setStep('form');
      return;
    }

    if (details.contactReason === null) {
      throw new Error('Contact reason should be selected before review.');
    }

    setReviewDetails({ ...details, contactReason: details.contactReason });
    setStep('review');
  }

  function submitReview(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStep('confirmation');
  }

  function resetFlow() {
    setDetails(initialDetails);
    setReviewDetails(undefined);
    setErrors({});
    setHasSubmitted(false);
    setStep('form');
  }

  if (step === 'confirmation') {
    return (
      <section className="gw-stack--lg">
        <Banner announcement="polite" variant="success" title="Contact details saved">
          We will use these details if we need to follow up.
        </Banner>
        <div className="gw-card gw-stack">
          <h2 className="gw-heading-m">What happens next</h2>
          <p className="gw-body--sm">
            This demo ends here. In a real service, the next step would send the request or return to the account area.
          </p>
          <Button variant="secondary" onClick={resetFlow}>
            Start again
          </Button>
        </div>
      </section>
    );
  }

  if (step === 'review') {
    if (reviewDetails === undefined) {
      throw new Error('Review details should be available on the review step.');
    }

    return (
      <form className="gw-stack--lg" onSubmit={submitReview}>
        <div className="gw-prose">
          <h2 className="gw-heading-m">Check your answers</h2>
          <p>Confirm your contact details before continuing.</p>
        </div>

        <dl className="gw-summary-list">
          <div className="gw-summary-list__row">
            <dt className="gw-summary-list__key">Full name</dt>
            <dd className="gw-summary-list__value">{reviewDetails.fullName}</dd>
            <dd className="gw-summary-list__action">
              <button className="gw-link" type="button" onClick={() => setStep('form')}>
                Change
              </button>
            </dd>
          </div>
          <div className="gw-summary-list__row">
            <dt className="gw-summary-list__key">Email address</dt>
            <dd className="gw-summary-list__value">{reviewDetails.email}</dd>
            <dd className="gw-summary-list__action">
              <button className="gw-link" type="button" onClick={() => setStep('form')}>
                Change
              </button>
            </dd>
          </div>
          <div className="gw-summary-list__row">
            <dt className="gw-summary-list__key">Reason</dt>
            <dd className="gw-summary-list__value">{contactReasonLabel(reviewDetails.contactReason)}</dd>
            <dd className="gw-summary-list__action">
              <button className="gw-link" type="button" onClick={() => setStep('form')}>
                Change
              </button>
            </dd>
          </div>
          <div className="gw-summary-list__row">
            <dt className="gw-summary-list__key">Notifications</dt>
            <dd className="gw-summary-list__value">
              {reviewDetails.notificationTypes.map(notificationTypeLabel).join(', ')}
            </dd>
            <dd className="gw-summary-list__action">
              <button className="gw-link" type="button" onClick={() => setStep('form')}>
                Change
              </button>
            </dd>
          </div>
          <div className="gw-summary-list__row">
            <dt className="gw-summary-list__key">Notes</dt>
            <dd className="gw-summary-list__value">
              {reviewDetails.notes.trim() === '' ? 'Not provided' : reviewDetails.notes}
            </dd>
            <dd className="gw-summary-list__action">
              <button className="gw-link" type="button" onClick={() => setStep('form')}>
                Change
              </button>
            </dd>
          </div>
        </dl>

        <div className="gw-button-group">
          <Button type="submit">Confirm and continue</Button>
          <Button type="button" variant="secondary" onClick={() => setStep('form')}>
            Back
          </Button>
        </div>
      </form>
    );
  }

  return (
    <form className="gw-stack--lg" id="contact-details-flow" onSubmit={submitDetails} noValidate={true}>
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

      <Field
        id="flow-email"
        label="Email address"
        hint="We'll only use this for follow-up about this request."
        error={errors.email}
      >
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

      <RadioGroup
        id="flow-contact-reason"
        name="contactReason"
        legend="Reason for contact"
        error={errors.contactReason}
        value={details.contactReason ?? undefined}
        onChange={(event) => updateDetail('contactReason', parseContactReason(event.currentTarget.value))}
        options={[
          { value: 'account', label: 'Account question' },
          { value: 'billing', label: 'Billing question' },
          {
            value: 'technical',
            label: 'Technical support',
            hint: 'Use this for deployment, access, or configuration problems.',
          },
        ]}
      />

      <CheckboxGroup
        id="flow-notification-types"
        name="notificationTypes"
        legend="Notification types"
        hint="Select all updates you want to receive."
        error={errors.notificationTypes}
        values={details.notificationTypes}
        onChange={(event) => updateNotificationType(event.currentTarget.value, event.currentTarget.checked)}
        options={[
          { value: 'security', label: 'Security alerts', hint: 'Important account and access changes.' },
          { value: 'billing', label: 'Billing updates' },
          { value: 'product', label: 'Product announcements' },
        ]}
      />

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
