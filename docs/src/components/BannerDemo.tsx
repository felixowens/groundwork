import { Banner } from '../../../src';

export function BannerDemo() {
  return (
    <div className="gw-stack">
      <Banner title="System maintenance scheduled" />
      <Banner title="New terms of service">Review the updated terms before 1 July 2026.</Banner>
      <Banner variant="success" title="Address saved">
        Your delivery address has been updated.
      </Banner>
      <Banner variant="warning" title="Session expires in 5 minutes">
        Save your work to avoid losing changes.
      </Banner>
      <Banner variant="error" title="Payment failed">
        Your card was declined. Try a different payment method.
      </Banner>
      <Banner announcement="polite" title="Autosaved">
        Changes are announced politely when this banner appears dynamically.
      </Banner>
      <Banner announcement="assertive" variant="error" title="Connection lost">
        This urgent message is announced immediately when inserted dynamically.
      </Banner>
    </div>
  );
}
