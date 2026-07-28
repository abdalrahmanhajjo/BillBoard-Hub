import { describe, expect, it } from 'vitest';
import { buildCsv } from '@/client/features/dashboard/utils/csv-export';

type Row = { name: string; total?: number };

const columns = [
  { header: 'Name', value: (row: Row) => row.name },
  { header: 'Total', value: (row: Row) => row.total },
];

describe('buildCsv', () => {
  it('quotes every cell and emits CRLF rows', () => {
    const csv = buildCsv<Row>([{ name: 'Spring', total: 10 }], columns);

    expect(csv).toBe('"Name","Total"\r\n"Spring","10"');
  });

  it('escapes embedded quotes by doubling them', () => {
    const csv = buildCsv<Row>([{ name: 'He said "hi"', total: 1 }], columns);

    expect(csv).toContain('"He said ""hi"""');
  });

  it('keeps commas and newlines inside a single field', () => {
    const csv = buildCsv<Row>([{ name: 'A, B\nC', total: 1 }], columns);

    expect(csv).toContain('"A, B\nC"');
  });

  it('renders a missing value as an empty field', () => {
    const csv = buildCsv<Row>([{ name: 'No total' }], columns);

    expect(csv).toBe('"Name","Total"\r\n"No total",""');
  });

  // Spreadsheet apps execute cells beginning with these characters, so an
  // exported value must never be interpreted as a formula.
  it.each(['=1+1', '+1', '-1', '@SUM(A1)'])('neutralises the formula prefix in %s', (payload) => {
    const csv = buildCsv<Row>([{ name: payload, total: 0 }], columns);

    expect(csv).toContain(`"'${payload}"`);
  });
});
