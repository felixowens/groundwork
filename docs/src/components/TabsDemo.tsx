import { Tabs } from '../../../src';

export function TabsDemo() {
  return (
    <Tabs
      label="Server details"
      items={[
        {
          id: 'overview',
          label: 'Overview',
          content: (
            <div className="gw-stack--sm">
              <h3 className="gw-heading-s">Overview</h3>
              <p className="gw-body--sm">API Gateway has been healthy for 42 days. Uptime this quarter is 99.98%.</p>
            </div>
          ),
        },
        {
          id: 'config',
          label: 'Config',
          content: (
            <div className="gw-stack--sm">
              <h3 className="gw-heading-s">Config</h3>
              <p className="gw-body--sm">Running 2 vCPU / 4 GB in eu-west-2. Autoscaling between 2 and 8 instances.</p>
            </div>
          ),
        },
        {
          id: 'logs',
          label: 'Logs',
          content: (
            <div className="gw-stack--sm">
              <h3 className="gw-heading-s">Logs</h3>
              <p className="gw-body--sm">
                No errors in the last 24 hours. The most recent deploy was v3.2.1, two hours ago.
              </p>
            </div>
          ),
        },
      ]}
    />
  );
}
