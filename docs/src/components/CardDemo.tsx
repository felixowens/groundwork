import { Card } from '../../../src';

export function CardDemo() {
  return (
    <div className="gw-stack--lg">
      <div className="gw-stack">
        <h3 className="gw-heading-s">Elevation</h3>
        <div className="gw-grid">
          <Card>
            <div className="gw-stack--sm">
              <p className="gw-caption">Users</p>
              <p className="gw-heading-l">2,847</p>
              <p className="gw-body--sm">Active this week</p>
            </div>
          </Card>
          <Card variant="raised">
            <div className="gw-stack--sm">
              <p className="gw-caption">Revenue</p>
              <p className="gw-heading-l">£48,291</p>
              <p className="gw-body--sm">+12.4% on last week</p>
            </div>
          </Card>
        </div>
      </div>

      <div className="gw-stack">
        <h3 className="gw-heading-s">Interactive (whole-card link)</h3>
        <div className="gw-grid">
          <Card href="#march-report">
            <div className="gw-stack--sm">
              <p className="gw-caption">Report</p>
              <p className="gw-heading-s">March breakdown</p>
              <p className="gw-body--sm">Open the full report</p>
            </div>
          </Card>
          <Card href="#deploy" variant="raised">
            <div className="gw-stack--sm">
              <p className="gw-caption">Deploy</p>
              <p className="gw-heading-s">v3.2.1</p>
              <p className="gw-body--sm">Released 2 hours ago</p>
            </div>
          </Card>
        </div>
      </div>

      <div className="gw-stack">
        <h3 className="gw-heading-s">Nested elevation</h3>
        <Card variant="raised">
          <div className="gw-stack">
            <p className="gw-caption">Card on a raised surface</p>
            <div className="gw-grid">
              <Card>
                <div className="gw-stack--sm">
                  <p className="gw-heading-s">Nested card</p>
                  <p className="gw-body--sm">Uses --surface-overlay automatically</p>
                </div>
              </Card>
              <Card>
                <div className="gw-stack--sm">
                  <p className="gw-heading-s">Also nested</p>
                  <p className="gw-body--sm">Keeps contrast against the parent</p>
                </div>
              </Card>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
