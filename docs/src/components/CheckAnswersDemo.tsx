import { type FormEvent, useState } from 'react';
import { Banner, Button, Field, type FieldRenderProps, Input, Select, SummaryList, Textarea } from '../../../src';

type AnswerKey = 'fullName' | 'email' | 'reason' | 'notes';

interface Answers {
  fullName: string;
  email: string;
  reason: string;
  notes: string;
}

type Screen = { kind: 'review' } | { kind: 'edit'; field: AnswerKey } | { kind: 'done' };

const REASON_OPTIONS: ReadonlyArray<{ value: string; label: string }> = [
  { value: 'technical-support', label: 'Technical support' },
  { value: 'billing', label: 'Billing question' },
  { value: 'general', label: 'General feedback' },
];

const FIELD_LABEL: Record<AnswerKey, string> = {
  fullName: 'Full name',
  email: 'Email address',
  reason: 'Reason for contact',
  notes: 'Additional notes',
};

const initialAnswers: Answers = {
  fullName: 'Harry Thompson',
  email: 'harry@example.com',
  reason: 'technical-support',
  notes: '',
};

const PERSONAL_FIELDS: ReadonlyArray<AnswerKey> = ['fullName', 'email'];
const APPLICATION_FIELDS: ReadonlyArray<AnswerKey> = ['reason', 'notes'];

function displayValue(field: AnswerKey, value: string): string {
  if (field === 'reason') {
    return REASON_OPTIONS.find((option) => option.value === value)?.label ?? value;
  }
  if (field === 'notes' && value.trim() === '') {
    return 'Not provided';
  }
  return value;
}

function rowsFor(fields: ReadonlyArray<AnswerKey>, answers: Answers, onEdit: (field: AnswerKey) => void) {
  return fields.map((field) => ({
    id: field,
    key: FIELD_LABEL[field],
    value: displayValue(field, answers[field]),
    actions: [
      {
        kind: 'button' as const,
        label: 'Change',
        visuallyHiddenText: FIELD_LABEL[field].toLowerCase(),
        onClick: () => onEdit(field),
      },
    ],
  }));
}

export function CheckAnswersDemo() {
  const [answers, setAnswers] = useState<Answers>(initialAnswers);
  const [screen, setScreen] = useState<Screen>({ kind: 'review' });

  if (screen.kind === 'done') {
    return (
      <Banner variant="success" title="Application submitted" announcement="polite">
        Your application has been recorded.
      </Banner>
    );
  }

  if (screen.kind === 'edit') {
    return (
      <EditScreen
        field={screen.field}
        value={answers[screen.field]}
        onSave={(value) => {
          setAnswers({ ...answers, [screen.field]: value });
          setScreen({ kind: 'review' });
        }}
        onCancel={() => setScreen({ kind: 'review' })}
      />
    );
  }

  function startEditing(field: AnswerKey) {
    setScreen({ kind: 'edit', field });
  }

  return (
    <div className="gw-stack">
      <h3 className="gw-heading-s">Check your answers before submitting</h3>

      <section className="gw-stack--sm" aria-labelledby="check-answers-section-personal">
        <h4 className="gw-heading-s" id="check-answers-section-personal">
          Personal details
        </h4>
        <SummaryList rows={rowsFor(PERSONAL_FIELDS, answers, startEditing)} />
      </section>

      <section className="gw-stack--sm" aria-labelledby="check-answers-section-application">
        <h4 className="gw-heading-s" id="check-answers-section-application">
          Application details
        </h4>
        <SummaryList rows={rowsFor(APPLICATION_FIELDS, answers, startEditing)} />
      </section>

      <div className="gw-button-group">
        <Button onClick={() => setScreen({ kind: 'done' })}>Accept and send</Button>
      </div>
    </div>
  );
}

interface EditScreenProps {
  field: AnswerKey;
  value: string;
  onSave: (value: string) => void;
  onCancel: () => void;
}

function EditScreen({ field, value, onSave, onCancel }: EditScreenProps) {
  const [draft, setDraft] = useState(value);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    onSave(draft);
  }

  return (
    <form className="gw-stack" onSubmit={handleSubmit} noValidate={true}>
      <Field id={`check-answers-edit-${field}`} label={FIELD_LABEL[field]}>
        {({ inputProps }) => renderControl(field, draft, setDraft, inputProps)}
      </Field>
      <div className="gw-button-group">
        <Button type="submit">Save and return</Button>
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

function renderControl(
  field: AnswerKey,
  draft: string,
  setDraft: (value: string) => void,
  inputProps: FieldRenderProps['inputProps'],
) {
  if (field === 'reason') {
    return (
      <Select {...inputProps} value={draft} onChange={(event) => setDraft(event.target.value)}>
        {REASON_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </Select>
    );
  }

  if (field === 'notes') {
    return <Textarea {...inputProps} value={draft} onChange={(event) => setDraft(event.target.value)} rows={4} />;
  }

  return (
    <Input
      {...inputProps}
      value={draft}
      onChange={(event) => setDraft(event.target.value)}
      type={field === 'email' ? 'email' : 'text'}
      autoComplete={field === 'email' ? 'email' : 'name'}
    />
  );
}
