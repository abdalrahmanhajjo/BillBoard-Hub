export type CsvColumn<T> = {
  header: string;
  value: (row: T) => string | number | undefined;
};

/**
 * Escapes a single CSV cell.
 *
 * A leading =, +, -, or @ is prefixed with an apostrophe: spreadsheet apps treat
 * those as formulas, so exported data could otherwise execute on open.
 */
function toCsvCell(value: string | number | undefined): string {
  const raw = value === undefined || value === null ? '' : String(value);
  const guarded = /^[=+\-@]/.test(raw) ? `'${raw}` : raw;
  return `"${guarded.replace(/"/g, '""')}"`;
}

export function buildCsv<T>(rows: T[], columns: Array<CsvColumn<T>>): string {
  const header = columns.map((column) => toCsvCell(column.header)).join(',');
  const body = rows.map((row) => columns.map((column) => toCsvCell(column.value(row))).join(','));

  return [header, ...body].join('\r\n');
}

/** Triggers a client-side download; no server round-trip involved. */
export function downloadCsv(filename: string, csv: string): void {
  // The BOM makes Excel read the file as UTF-8 rather than the local codepage.
  const blob = new Blob([`﻿${csv}`], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
