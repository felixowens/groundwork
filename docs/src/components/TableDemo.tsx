import { Table, Tag } from '../../../src';

export function TableDemo() {
  return (
    <Table
      caption="Recent invoices"
      columns={[
        { key: 'ref', header: 'Reference', rowHeader: true },
        { key: 'client', header: 'Client' },
        { key: 'status', header: 'Status' },
        { key: 'amount', header: 'Amount', numeric: true },
      ]}
      rows={[
        {
          id: 'inv-001',
          cells: {
            ref: 'INV-001',
            client: 'Northwind Ltd',
            status: <Tag variant="success">Paid</Tag>,
            amount: '£240.00',
          },
        },
        {
          id: 'inv-002',
          cells: {
            ref: 'INV-002',
            client: 'Acme Co',
            status: <Tag variant="warning">Pending</Tag>,
            amount: '£1,180.50',
          },
        },
        {
          id: 'inv-003',
          cells: {
            ref: 'INV-003',
            client: 'Globex',
            status: <Tag variant="error">Overdue</Tag>,
            amount: '£96.00',
          },
        },
      ]}
    />
  );
}
