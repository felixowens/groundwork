import { useState } from 'react';
import { CheckboxGroup, RadioGroup } from '../../../src';

export function GroupedControlsControlledFixture() {
  const [contactPreference, setContactPreference] = useState('email');
  const [servicesUsed, setServicesUsed] = useState<readonly string[]>(['web']);

  function updateServicesUsed(value: string, checked: boolean) {
    setServicesUsed((current) =>
      checked ? [...current, value] : current.filter((currentValue) => currentValue !== value),
    );
  }

  return (
    <form className="gw-stack--lg">
      <RadioGroup
        id="controlled-contact-preference"
        name="controlledContactPreference"
        legend="Controlled contact preference"
        value={contactPreference}
        onChange={(event) => setContactPreference(event.currentTarget.value)}
        options={[
          { value: 'email', label: 'Email' },
          { value: 'phone', label: 'Phone' },
          { value: 'post', label: 'Post' },
        ]}
      />

      <CheckboxGroup
        id="controlled-services-used"
        name="controlledServicesUsed"
        legend="Controlled services used"
        values={servicesUsed}
        onChange={(event) => updateServicesUsed(event.currentTarget.value, event.currentTarget.checked)}
        options={[
          { value: 'web', label: 'Web application' },
          { value: 'api', label: 'REST API' },
          { value: 'mobile', label: 'Mobile app' },
        ]}
      />
    </form>
  );
}
