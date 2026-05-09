import { Button } from '../../../src';

export function ButtonDemo() {
  return (
    <div className="gw-button-group">
      <Button>Save and continue</Button>
      <Button variant="secondary">Save as draft</Button>
      <Button variant="ghost">Cancel</Button>
      <Button variant="destructive">Delete account</Button>
      <Button disabled={true}>Processing…</Button>
    </div>
  );
}
