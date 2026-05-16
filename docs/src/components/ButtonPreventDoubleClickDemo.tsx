import { useState } from 'react';
import { Button } from '../../../src';

export function ButtonPreventDoubleClickDemo() {
  const [count, setCount] = useState(0);

  return (
    <div className="gw-stack">
      <div className="gw-button-group">
        <Button preventDoubleClick={true} onClick={() => setCount((current) => current + 1)}>
          Send invitation
        </Button>
      </div>
      <p className="gw-body--sm">
        Sent {count} {count === 1 ? 'invitation' : 'invitations'}.
      </p>
    </div>
  );
}
