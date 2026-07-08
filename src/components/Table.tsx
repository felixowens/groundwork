import type { HTMLAttributes, ReactNode, Ref } from 'react';
import type { WithoutStyleOverrides } from './types';

/**
 * A single column definition for a Groundwork Table.
 *
 * @public
 */
export interface TableColumn {
  /**
   * Stable key that matches the property used for this column in each row's
   * `cells` record.
   */
  key: string;
  /**
   * Column header text, rendered in the table head as a `<th scope="col">`.
   */
  header: ReactNode;
  /**
   * Right-align this column and render its figures with tabular spacing. Use
   * for amounts, counts, and other numbers that read best aligned on the right.
   */
  numeric?: boolean;
  /**
   * Render this column's body cells as row headers (`<th scope="row">`) so
   * screen readers associate each row with its label. Typically only the first
   * column of a table uses this.
   */
  rowHeader?: boolean;
}

/**
 * A single row of data for a Groundwork Table.
 *
 * @public
 */
export interface TableRow {
  /**
   * Stable identity for the row, used as its React key.
   */
  id: string;
  /**
   * Cell content keyed by column {@link TableColumn.key}. Columns without a
   * matching entry render an empty cell.
   */
  cells: Readonly<Record<string, ReactNode>>;
}

/**
 * Props for the Groundwork Table component.
 *
 * @public
 */
export type TableProps = WithoutStyleOverrides<Omit<HTMLAttributes<HTMLTableElement>, 'children'>> & {
  /**
   * Visible caption naming the table. Required — it is the table's accessible
   * name and tells every reader what the data represents.
   */
  caption: ReactNode;
  columns: readonly TableColumn[];
  rows: readonly TableRow[];
  ref?: Ref<HTMLTableElement>;
};

function cellClassName(column: TableColumn): string | undefined {
  return column.numeric ? 'gw-table__numeric' : undefined;
}

/**
 * Renders tabular data as an accessible `<table>` with a required caption,
 * column headers, and optional numeric alignment and row headers.
 *
 * Columns are defined once and reused for every row, so header/cell alignment
 * and scope wiring stay consistent instead of being repeated by hand.
 *
 * @example
 * ```tsx
 * <Table
 *   caption="Invoices"
 *   columns={[
 *     { key: 'ref', header: 'Reference', rowHeader: true },
 *     { key: 'status', header: 'Status' },
 *     { key: 'amount', header: 'Amount', numeric: true },
 *   ]}
 *   rows={[
 *     { id: 'inv-001', cells: { ref: 'INV-001', status: <Tag variant="success">Paid</Tag>, amount: '£240.00' } },
 *   ]}
 * />
 * ```
 *
 * @public
 */
export function Table({ caption, columns, rows, ref, ...props }: TableProps) {
  return (
    <table ref={ref} {...props} className="gw-table" style={undefined}>
      <caption className="gw-table__caption">{caption}</caption>
      <thead>
        <tr>
          {columns.map((column) => (
            <th className={cellClassName(column)} key={column.key} scope="col">
              {column.header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.id}>
            {columns.map((column) => {
              const content = row.cells[column.key];

              if (column.rowHeader) {
                return (
                  <th
                    className={column.numeric ? 'gw-table__row-header gw-table__numeric' : 'gw-table__row-header'}
                    key={column.key}
                    scope="row"
                  >
                    {content}
                  </th>
                );
              }

              return (
                <td className={cellClassName(column)} key={column.key}>
                  {content}
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
