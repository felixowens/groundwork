import { Button } from '../../../src';

export function ButtonHeroDemo() {
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

export function ButtonPrimaryDemo() {
  return <Button>Save and continue</Button>;
}

export function ButtonSecondaryDemo() {
  return (
    <div className="gw-button-group">
      <Button>Save and continue</Button>
      <Button variant="secondary">Save as draft</Button>
    </div>
  );
}

export function ButtonDestructiveDemo() {
  return (
    <div className="gw-button-group">
      <Button variant="destructive">Delete account</Button>
      <Button variant="ghost">Cancel</Button>
    </div>
  );
}

export function ButtonGhostDemo() {
  return (
    <div className="gw-button-group">
      <Button>Continue</Button>
      <Button variant="ghost">Back</Button>
    </div>
  );
}

export function ButtonDisabledDemo() {
  return <Button disabled={true}>Processing…</Button>;
}
