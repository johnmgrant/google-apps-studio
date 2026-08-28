import type * as Options from '../options';
import {Grid} from '../spreadsheet';
import {Column, ProgramWeeksKey} from './spreadsheet';

/**
 * Pre-workout question rows.
 * This has been updated to document the structure using SpreadsheetModels concepts.
 *
 * Row structure in spreadsheet:
 * - Row 0: Hours of Sleep (B:C) + value (D), Soreness Going Into Lift (E:L) + value (M)
 * - Row 1: Mental State (B:C) + value (D), Ate Before Lift (E:L) + value (M)
 *
 * Each row follows the SpreadsheetModels.ICell structure with specific column mappings
 * defined in PreWorkoutRowColumns.
 */
export interface PreWorkoutRows {
  [0]: [
    Options.PerWorkoutQuestions.HoursOfSleep,
    Options.HoursOfSleep,
    Options.PerWorkoutQuestions.SorenessGoingIntoLift,
    Options.Soreness,
  ];
  [1]: [
    Options.PerWorkoutQuestions.MentalState,
    Options.OneThroughFive,
    Options.PerWorkoutQuestions.AteBeforeLift,
    Options.YesNo,
  ];
}

export type PreWorkoutRowType = {
  [Options.PerWorkoutQuestions.HoursOfSleep]: Options.HoursOfSleep;
  [Options.PerWorkoutQuestions.MentalState]: Options.OneThroughFive;
  [Options.PerWorkoutQuestions.SorenessGoingIntoLift]: Options.Soreness;
  [Options.PerWorkoutQuestions.AteBeforeLift]: Options.YesNo;
};

/**
 * Maps pre-workout question types to their column positions in the spreadsheet.
 *
 * Row structure in spreadsheet:
 * - B:C (merged) = Question label (e.g., "Hours of Sleep")
 * - D = Answer value (e.g., "6")
 * - E:L (merged) = Second question label (e.g., "Soreness going into lift")
 * - M = Second answer value (e.g., dropdown selection)
 */
export type PreWorkoutRowColumns<T extends PreWorkoutRows[0 | 1][number]> =
  T extends
    | Options.PerWorkoutQuestions.HoursOfSleep
    | Options.PerWorkoutQuestions.MentalState
    ? [Column.B, Column.C] // Question label (merged cells)
    : T extends Options.HoursOfSleep | Options.OneThroughFive
      ? [Column.D] // Answer for first question
      : T extends
            | Options.PerWorkoutQuestions.SorenessGoingIntoLift
            | Options.PerWorkoutQuestions.AteBeforeLift
        ? [
            Column.E,
            Column.F,
            Column.G,
            Column.H,
            Column.I,
            Column.J,
            Column.K,
            Column.L,
          ] // Second question label (merged cells)
        : T extends Options.Soreness | Options.YesNo
          ? [Column.M] // Answer for second question
          : never;

export interface PreWorkoutRowColumnRecord<T extends keyof PreWorkoutRowType> {
  columns: PreWorkoutRowColumns<T & PreWorkoutRows[0 | 1][number]>;
  content: [PreWorkoutRowType[T]];
}

export interface PreWorkoutStatus {
  hoursOfSleep: Options.HoursOfSleepValue;
  mentalState: Options.OneThroughFive | Options.OneThroughFiveValue;
  sorenessGoingIntoLift: Options.Soreness | Options.SorenessValue;
  ateBeforeLift: Options.YesNo | Options.YesNoKey;
}

export interface RepRange {
  min: number;
  spacer: '–';
  max: number;
}

/**
 * Represents a checkbox row (Warm Up or Cool Down).
 *
 * Spreadsheet structure:
 * - B = Label text (e.g., "Warm Up")
 * - C:L (merged) = Instructions text
 * - M = Checkbox (boolean/checkmark)
 */
type CheckboxColumnRowType<
  TLabel extends string = string,
  TInstructions extends string = string,
> = {
  label: TLabel;
  instructions: TInstructions;
  checkbox: boolean;
};

type CheckboxColumnRowTypeKeys = keyof CheckboxColumnRowType;

/**
 * Warm Up row - appears before exercises.
 */
type WarmUp = CheckboxColumnRowType<
  'Warm Up',
  'Cardio (Treadmill for 10-15 Minutes + Basic Stretches) check once done -->'
>;

/**
 * Cool Down row - appears after exercises.
 */
type CoolDown = CheckboxColumnRowType<
  'Cool Down',
  'Cardio (Treadmill for 20-30 Minutes + Basic Stretches) check once done -->'
>;

type CheckboxRowColumns<T extends keyof WarmUp | keyof CoolDown> =
  T extends 'label'
    ? [Column.B]
    : T extends 'instructions'
      ? [
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
        ]
      : T extends 'checkbox'
        ? [Column.M]
        : never;

export type CheckboxRowColumnRecord<
  T extends WarmUp | CoolDown,
  K extends CheckboxColumnRowTypeKeys = T extends CheckboxColumnRowType
    ? keyof T
    : never,
> = {
  [key in K]: {
    columns: CheckboxRowColumns<key>;
    content: [T[key]];
  };
};

/**
 * Exercise table header row labels.
 * Each enum value corresponds to a column in the spreadsheet.
 */
export enum WorkoutHeaderRow {
  Exercise = 'Exercise', // Column B
  Muscle = 'Muscle', // Column C
  Weight = 'Weight', // Column D
  Set1 = 'Set 1', // Column E
  Set2 = 'Set 2', // Column F
  Set3 = 'Set 3', // Column G
  Set4 = 'Set 4', // Column H (optional, not always used)
  Range = 'Range', // Column I:K (merged, shows "8 - 12" format)
  Setting = 'Setting', // Column L
  TutorialURL = 'Tutorial', // Column M (labeled "Tutorial" in sheet, contains URLs)
}

type WorkoutHeaderRowType = typeof WorkoutHeaderRow;
type WorkoutHeaderRowKeys = keyof WorkoutHeaderRowType;

export type WorkoutHeaderRowColumns<THeader extends WorkoutHeaderRowKeys> =
  THeader extends 'Exercise'
    ? [Column.B]
    : THeader extends 'Muscle'
      ? [Column.C]
      : THeader extends 'Weight'
        ? [Column.D]
        : THeader extends 'Set1'
          ? [Column.E]
          : THeader extends 'Set2'
            ? [Column.F]
            : THeader extends 'Set3'
              ? [Column.G]
              : THeader extends 'Set4'
                ? [Column.H]
                : THeader extends 'Range'
                  ? [Column.I, Column.J, Column.K]
                  : THeader extends 'Setting'
                    ? [Column.L]
                    : THeader extends 'TutorialURL'
                      ? [Column.M]
                      : never;

export type WorkoutHeaderRowColumnRecord = {
  [key in WorkoutHeaderRowKeys]: {
    columns: WorkoutHeaderRowColumns<key>;
    value: [WorkoutHeaderRowType[key]];
  };
};
/**
 * Represents a single exercise in the workout.
 *
 * Column mapping:
 * - B: name (exercise name)
 * - C: muscleGroup (target muscle)
 * - D: weight (weight used in lbs/kg)
 * - E: set1 (reps for set 1)
 * - F: set2 (reps for set 2)
 * - G: set3 (reps for set 3)
 * - H: set4 (reps for set 4, optional - sometimes blank)
 * - I,J,K: rep range (e.g., "8", "–", "12")
 * - L: setting (optional, e.g., "25 lbs" for machine settings)
 * - M: tutorialUrl (YouTube link)
 */
export interface Exercise {
  name: string;
  muscleGroup: string;
  weight: number;
  set1: number | null;
  set2: number | null;
  set3: number | null;
  set4: number | null;
  repRangeMin: RepRange['min'];
  repRangeSpacer: RepRange['spacer'];
  repRangeMax: RepRange['max'];
  setting: string | null; // Optional machine/equipment setting (e.g., "25 lbs", "66 lbs")
  tutorialUrl: string | null; // Optional YouTube tutorial link
}

/**
 * Raw row data for an exercise (array form matching spreadsheet columns B:M).
 */
export type ExerciseRow = [
  Exercise['name'], // B
  Exercise['muscleGroup'], // C
  Exercise['weight'], // D
  Exercise['set1'], // E
  Exercise['set2'], // F
  Exercise['set3'], // G
  Exercise['set4'], // H (may be undefined/null)
  Exercise['repRangeMin'], // I
  Exercise['repRangeSpacer'], // J (the "–" character)
  Exercise['repRangeMax'], // K
  Exercise['setting'], // L (may be undefined)
  Exercise['tutorialUrl'], // M (may be undefined)
];

export type ExercisesRecord = {
  [0]: ExerciseRow;
  [1]: ExerciseRow;
  [2]: ExerciseRow;
  [3]: ExerciseRow;
  [4]: ExerciseRow;
  [5]: ExerciseRow;
  [6]: ExerciseRow;
};

export enum PostWorkoutQuestions {
  HowDoYouFeel = 'How do you feel after the workout?',
  StrengthIntensity = 'Strength/intensity compared to previous workouts?',
  PainDuringLift = 'Did you experience any pain during lift?',
  UnexpectedFatigue = 'Feel any unexpected fatigue or dizziness?',
}

export interface PostWorkoutRows {
  [0]: [
    PostWorkoutQuestions.HowDoYouFeel,
    Options.LowHigh,
    PostWorkoutQuestions.PainDuringLift,
    Options.YesNo,
  ];
  [1]: [
    PostWorkoutQuestions.StrengthIntensity,
    Options.OneThroughFive,
    PostWorkoutQuestions.UnexpectedFatigue,
    Options.YesNo,
  ];
}

export type PostWorkoutRowType = {
  [PostWorkoutQuestions.HowDoYouFeel]: Options.LowHigh;
  [PostWorkoutQuestions.StrengthIntensity]: Options.OneThroughFive;
  [PostWorkoutQuestions.PainDuringLift]: Options.YesNo;
  [PostWorkoutQuestions.UnexpectedFatigue]: Options.YesNo;
};

/**
 * Maps post-workout question types to their column positions in the spreadsheet.
 *
 * Row structure in spreadsheet:
 * - B:C (merged) = Question label (e.g., "How do you feel after the workout?")
 * - D = Answer value (e.g., "5" for rating 1-5)
 * - E:L (merged) = Second question label (e.g., "Did you experience any pain during lift?")
 * - M = Second answer value (e.g., "Yes" or "No")
 */
export type PostWorkoutRowColumns<T extends PostWorkoutRows[0 | 1][number]> =
  T extends
    PostWorkoutQuestions.HowDoYouFeel | PostWorkoutQuestions.StrengthIntensity
    ? [Column.B, Column.C] // Question label (merged cells)
    : T extends Options.OneThroughFive | Options.LowHigh
      ? [Column.D] // Answer for first question
      : T extends
            | PostWorkoutQuestions.PainDuringLift
            | PostWorkoutQuestions.UnexpectedFatigue
        ? [
            Column.E,
            Column.F,
            Column.G,
            Column.H,
            Column.I,
            Column.J,
            Column.K,
            Column.L,
          ] // Second question label (merged cells)
        : T extends Options.YesNo
          ? [Column.M] // Answer for second question
          : never;

export interface PostWorkoutRowColumnRecord<
  T extends keyof PostWorkoutRowType,
> {
  columns: PostWorkoutRowColumns<T & PostWorkoutRows[0 | 1][number]>;
  content: [PostWorkoutRowType[T]];
}

export interface PostWorkoutFeedback {
  howDoYouFeel: Options.OneThroughFive | Options.OneThroughFiveValue;
  strengthIntensity: Options.LowHigh | Options.LowHighKey;
  painDuringLift: Options.YesNo | Options.YesNoKey;
  unexpectedFatigue: Options.YesNo | Options.YesNoKey;
}

export interface CardioBlock {
  description: string;
}

export interface WorkoutDay {
  week: number;
  day: number;
  preWorkout: PreWorkoutStatus;
  warmUpCardio: CardioBlock;
  exercises: Exercise[];
  coolDownCardio: CardioBlock;
  postWorkout: PostWorkoutFeedback;
  notesForTrainer: string;
}

export interface NotesRowLabel {
  columns: [Column.B];
  content: ['Notes For Trainer:'];
}

export interface NotesRowContent {
  columns: [
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
  content: [string];
}

export interface NotesRow {
  label: NotesRowLabel;
  content: NotesRowContent;
}

export interface WorkoutWeekDayEntry<
  WeekNumber extends ProgramWeeksKey,
  DayNumber extends number = 1,
> {
  grid: Grid<
    | WorkoutHeaderRowColumnRecord
    | PreWorkoutRowColumnRecord<keyof PreWorkoutRowType>
    | CheckboxRowColumnRecord<WarmUp>
    | WorkoutHeaderRowColumnRecord
    | ExercisesRecord
    | CheckboxRowColumnRecord<CoolDown>
    | PostWorkoutRowColumnRecord<keyof PostWorkoutRowType>
    | NotesRow,
    15,
    13
  >;
  week: WeekNumber;
  day: DayNumber;
}
