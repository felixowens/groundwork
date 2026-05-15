import { SummaryList } from '../../../src';

export function SummaryListDemo() {
  return (
    <div className="gw-stack--lg">
      <div className="gw-stack">
        <h3 className="gw-heading-s">With row actions</h3>
        <SummaryList
          rows={[
            {
              id: 'name',
              key: 'Name',
              value: 'Sarah Philips',
              actions: [{ kind: 'link', href: '#name', label: 'Change', visuallyHiddenText: 'name' }],
            },
            {
              id: 'date-of-birth',
              key: 'Date of birth',
              value: '5 January 1978',
              actions: [{ kind: 'link', href: '#date-of-birth', label: 'Change', visuallyHiddenText: 'date of birth' }],
            },
            {
              id: 'address',
              key: 'Address',
              value: (
                <>
                  72 Guild Street
                  <br />
                  London
                  <br />
                  SE23 6FH
                </>
              ),
              actions: [{ kind: 'link', href: '#address', label: 'Change', visuallyHiddenText: 'address' }],
            },
            {
              id: 'contact-details',
              key: 'Contact details',
              value: (
                <div className="gw-stack--sm">
                  <p>07700 900457</p>
                  <p>sarah.phillips@example.com</p>
                </div>
              ),
              actions: [
                { kind: 'link', href: '#contact-details-add', label: 'Add', visuallyHiddenText: 'contact details' },
                {
                  kind: 'link',
                  href: '#contact-details-change',
                  label: 'Change',
                  visuallyHiddenText: 'contact details',
                },
              ],
            },
          ]}
        />
      </div>

      <div className="gw-stack">
        <h3 className="gw-heading-s">Without row actions</h3>
        <SummaryList
          rows={[
            {
              id: 'reference',
              key: 'Reference',
              value: 'HDJ2123F',
            },
            {
              id: 'status',
              key: 'Status',
              value: 'Awaiting review',
              actions: [{ kind: 'button', label: 'Refresh', visuallyHiddenText: 'status' }],
            },
            {
              id: 'missing-contact-information',
              key: 'Contact information',
              value: (
                <a className="gw-link" href="#missing-contact-information">
                  Enter contact information
                </a>
              ),
            },
          ]}
        />
      </div>
    </div>
  );
}
