export const COLUMN_KEYS = [
  'A',
  'B',
  'C',
  'D',
  'E',
  'F',
  'G',
  'H',
  'I',
  'J',
  'K',
  'L',
  'M',
  'N',
  'O',
  'P',
  'Q',
  'R',
  'S',
  'T',
  'U',
  'V',
  'W',
  'X',
  'Y',
  'Z',
] as const;

export type ColumnKey = (typeof COLUMN_KEYS)[number];
export type Column = ColumnKey | `${ColumnKey}${ColumnKey}`;
export type ColumnRange<
  TStart extends Column,
  TEnd extends Column,
> = `${TStart}:${TEnd}`;

export type RowRange<
  TRowStart extends number,
  TRowEnd extends number,
> = `${TRowStart}:${TRowEnd}`;

export type CellCoordinate<
  TColumn extends Column,
  TRow extends number,
> = `${TColumn}${TRow}`;

export type CellRange<
  TColumnStart extends Column,
  TRowStart extends number,
  TColumnEnd extends Column,
  TRowEnd extends number,
> = `${TColumnStart}${TRowStart}:${TColumnEnd}${TRowEnd}`;

/**
 * Helper type to create a union of numbers from 0 to N-1.
 * Used for type-safe row indexing in RowsCells.
 */
export type IterableRangeUtility<
  N extends number,
  Acc extends number[] = [],
> = Acc['length'] extends N
  ? Acc[number]
  : IterableRangeUtility<N, [...Acc, Acc['length']]>;

export type CellValue = string | number | boolean | null;
export interface ICell<TColumn extends Column | Column[], TRow extends number> {
  value: CellValue;
  column: TColumn;
  row: TRow;
  formula?: string;
  note?: string;
  numberFormat?: string;
  background?: string;
}

export type Cell<
  TColumn extends Column = Column,
  TRow extends number = number,
> = ICell<TColumn, TRow>[];

export type MergeCell<TColumn extends Column[], TRow extends number> = ICell<
  TColumn,
  TRow
>;

export type ColumnsCells<TColumns extends Column> = {
  [column in TColumns]: ICell<column, number>;
};
export type RowsCells<
  TRows extends number,
  RRows extends IterableRangeUtility<TRows>,
> = {
  [row in RRows]: ICell<Column, row>;
};

export type SheetModel = {
  range: string;
  values: CellValue[][];
  formulas: string[][];
  notes: string[][];
  numberFormats: string[][];
  backgrounds: string[][];
};
export type ExportedSpreadsheet = {
  spreadsheetId: string;
  sheets: Record<string, SheetModel>;
};

export interface Grid<T, Rows extends number, Columns extends number> {
  data: T[][];
  rows: Rows;
  columns: Columns;
}
