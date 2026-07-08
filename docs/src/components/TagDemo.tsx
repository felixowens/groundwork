import { Tag } from '../../../src';

export function TagDemo() {
  return (
    <div className="gw-cluster">
      <Tag>Draft</Tag>
      <Tag variant="action">New</Tag>
      <Tag variant="success">Paid</Tag>
      <Tag variant="warning">Pending</Tag>
      <Tag variant="error">Overdue</Tag>
    </div>
  );
}
