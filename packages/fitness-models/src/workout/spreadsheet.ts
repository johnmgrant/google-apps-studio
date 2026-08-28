import {CellRange, IterableRangeUtility} from '../spreadsheet';

export enum Column {
  B = 'B',
  C = 'C',
  D = 'D',
  E = 'E',
  F = 'F',
  G = 'G',
  H = 'H',
  I = 'I',
  J = 'J',
  K = 'K',
  L = 'L',
  M = 'M',
}

type ColumnType = typeof Column;
export type ColumnKey = keyof ColumnType;

export type WorkoutWeekHeader<WeekNumber extends number> = `Week ${WeekNumber}`;

/**
 * Week header spans B:M (merged cells in spreadsheet).
 * This represents the entire row where the week number appears.
 */
export type WorkoutWeekHeaderRowColumnRecord<WeekNumber extends number> = {
  /** Column B through M (merged in spreadsheet) */
  columns: [
    Column.B,
    Column.C,
    Column.D,
    Column.E,
    Column.F,
    Column.G,
    Column.H,
    Column.I,
    Column.J,
    Column.K,
    Column.L,
    Column.M,
  ];
  content: [WorkoutWeekHeader<WeekNumber>];
};

export type FirstWeekRow = 2;
export type WeekOffsetRows = 15;
export type ProgramWeeks = 24;
export type ProgramWeeksIndex = IterableRangeUtility<24>;
export type ProgramWeeksKey = Exclude<IterableRangeUtility<25>, 0>;

export type WorkoutWeekEntry<TStart extends number, TEnd extends number> = {
  rowStart: TStart;
  rowEnd: TEnd;
  columnStart: Column.B;
  columnEnd: Column.M;
};

export type WeekStartRow<WeekNumber extends number> = WeekNumber extends 1
  ? WorkoutWeekEntry<FirstWeekRow, 16>
  : WeekNumber extends 2
    ? WorkoutWeekEntry<17, 31>
    : WeekNumber extends 3
      ? WorkoutWeekEntry<32, 46>
      : WeekNumber extends 4
        ? WorkoutWeekEntry<47, 61>
        : WeekNumber extends 5
          ? WorkoutWeekEntry<62, 76>
          : WeekNumber extends 6
            ? WorkoutWeekEntry<77, 91>
            : WeekNumber extends 7
              ? WorkoutWeekEntry<92, 106>
              : WeekNumber extends 8
                ? WorkoutWeekEntry<107, 121>
                : WeekNumber extends 9
                  ? WorkoutWeekEntry<122, 136>
                  : WeekNumber extends 10
                    ? WorkoutWeekEntry<137, 151>
                    : WeekNumber extends 11
                      ? WorkoutWeekEntry<152, 166>
                      : WeekNumber extends 12
                        ? WorkoutWeekEntry<167, 181>
                        : WeekNumber extends 13
                          ? WorkoutWeekEntry<182, 196>
                          : WeekNumber extends 14
                            ? WorkoutWeekEntry<197, 211>
                            : WeekNumber extends 15
                              ? WorkoutWeekEntry<212, 226>
                              : WeekNumber extends 16
                                ? WorkoutWeekEntry<227, 241>
                                : WeekNumber extends 17
                                  ? WorkoutWeekEntry<242, 256>
                                  : WeekNumber extends 18
                                    ? WorkoutWeekEntry<257, 271>
                                    : WeekNumber extends 19
                                      ? WorkoutWeekEntry<272, 286>
                                      : WeekNumber extends 20
                                        ? WorkoutWeekEntry<287, 301>
                                        : WeekNumber extends 21
                                          ? WorkoutWeekEntry<302, 316>
                                          : WeekNumber extends 22
                                            ? WorkoutWeekEntry<317, 331>
                                            : WeekNumber extends 23
                                              ? WorkoutWeekEntry<332, 346>
                                              : WeekNumber extends 24
                                                ? WorkoutWeekEntry<347, 361>
                                                : number;
export type WorkoutWeeks = {
  [week in ProgramWeeksKey]: WeekStartRow<week>;
};

export type WeekMainHeaderCellRange<WeekNumber extends ProgramWeeksKey> =
  CellRange<
    WorkoutWeeks[WeekNumber]['columnStart'],
    WorkoutWeeks[WeekNumber]['rowStart'],
    WorkoutWeeks[WeekNumber]['columnEnd'],
    WorkoutWeeks[WeekNumber]['rowEnd']
  >;
