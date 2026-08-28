/*********************************************************************
 * Yes/No options and type.
 * The spreadsheet uses dropdown values "Yes" and "No".
 *********************************************************************/
export enum YesNo {
  Yes = 'Yes',
  No = 'No',
}

type YesNoType = typeof YesNo;
export type YesNoKey = keyof YesNoType;

/*********************************************************************
 * End of Yes/No answer type.
 *********************************************************************/
/*********************************************************************
 * Pre-workout question options and types.
 *********************************************************************/
export enum PerWorkoutQuestions {
  HoursOfSleep = 'Hours of Sleep',
  MentalState = 'Mental State (1-5)',
  SorenessGoingIntoLift = 'Soreness Going Into Lift',
  AteBeforeLift = 'Did You Eat Before Lift?',
}

type PerWorkoutQuestionsType = typeof PerWorkoutQuestions;
export type PerWorkoutQuestionKey = keyof PerWorkoutQuestionsType;
export type PerWorkoutQuestionValue =
  PerWorkoutQuestionsType[PerWorkoutQuestionKey];

/*********************************************************************
 * End of Pre-workout question options and types.
 *********************************************************************/
/*********************************************************************
 * Hours of sleep options and types from the spreadsheet dropdown.
 * Values match the exact text displayed in the dropdown.
 *********************************************************************/
export enum HoursOfSleep {
  Four = '4.0',
  Five = '5.0',
  FiveFive = '5.5',
  Six = '6.0',
  SixFive = '6.5',
  Seven = '7', // Note this is an inconsistency in the spreadsheet dropdown
  SevenFive = '7.5',
  Eight = '8.0',
  EightFive = '8.5',
  Nine = '9.0',
}

type HoursOfSleepEnumType = typeof HoursOfSleep;
export type HoursOfSleepEnumKey = keyof HoursOfSleepEnumType;
export type HoursOfSleepEnumKeyRecord = {
  [key in HoursOfSleepEnumKey]: key extends 'Four'
    ? {value: 4.0; label: '4.0'}
    : key extends 'Five'
      ? {value: 5.0; label: '5.0'}
      : key extends 'FiveFive'
        ? {value: 5.5; label: '5.5'}
        : key extends 'Six'
          ? {value: 6.0; label: '6.0'}
          : key extends 'SixFive'
            ? {value: 6.5; label: '6.5'}
            : key extends 'Seven'
              ? {value: 7.0; label: '7.0'} // Note this is an inconsistency in the spreadsheet dropdown
              : key extends 'SevenFive'
                ? {value: 7.5; label: '7.5'}
                : key extends 'Eight'
                  ? {value: 8.0; label: '8.0'}
                  : key extends 'EightFive'
                    ? {value: 8.5; label: '8.5'}
                    : key extends 'Nine'
                      ? {value: 9.0; label: '9.0'}
                      : never;
};

export type HoursOfSleepKey =
  HoursOfSleepEnumKeyRecord[HoursOfSleepEnumKey]['value'];
export type HoursOfSleepValue =
  HoursOfSleepEnumKeyRecord[HoursOfSleepEnumKey]['label'];

/**
 * Converts HoursOfSleep enum key to its numeric representation.
 * This is useful for calculations or comparisons.
 */
export type HoursOfSleepToNumber<T extends HoursOfSleepEnumKey> =
  HoursOfSleepEnumKeyRecord[T]['value'];

/**
 * Converts HoursOfSleep enum key to its string representation.
 * This is the exact text used in the spreadsheet dropdown.
 */
export type HoursOfSleepToString<T extends HoursOfSleepEnumKey> =
  HoursOfSleepEnumKeyRecord[T]['label'];

/**
 * Record mapping the cell values for hours of sleep back to their enum keys.
 */
export type HoursOfSleepValueRecord = {
  [
    key in HoursOfSleepValue
  ]: key extends HoursOfSleepEnumKeyRecord['Four']['label']
    ? 'Four'
    : key extends HoursOfSleepEnumKeyRecord['Five']['label']
      ? 'Five'
      : key extends HoursOfSleepEnumKeyRecord['FiveFive']['label']
        ? 'FiveFive'
        : key extends HoursOfSleepEnumKeyRecord['Six']['label']
          ? 'Six'
          : key extends HoursOfSleepEnumKeyRecord['SixFive']['label']
            ? 'SixFive'
            : key extends HoursOfSleepEnumKeyRecord['Seven']['label']
              ? 'Seven'
              : key extends HoursOfSleepEnumKeyRecord['SevenFive']['label']
                ? 'SevenFive'
                : key extends HoursOfSleepEnumKeyRecord['Eight']['label']
                  ? 'Eight'
                  : key extends HoursOfSleepEnumKeyRecord['EightFive']['label']
                    ? 'EightFive'
                    : key extends HoursOfSleepEnumKeyRecord['Nine']['label']
                      ? 'Nine'
                      : never;
};

/*********************************************************************
 * End of hours of sleep options.
 *********************************************************************/
/*********************************************************************
 * One through five options from the spreadsheet dropdown.
 * Values match the exact text displayed in the dropdown.
 *********************************************************************/
export enum OneThroughFive {
  One = '1',
  Two = '2',
  Three = '3',
  Four = '4',
  Five = '5',
}

type OneThroughFiveType = typeof OneThroughFive;
export type OneThroughFiveKey = keyof OneThroughFiveType;
export type OneThroughFiveValue = '1' | '2' | '3' | '4' | '5';

/*********************************************************************
 * End of one through five options.
 *********************************************************************/
/*********************************************************************
 * Low/Medium/High rating options for intensity and feelings.
 * Used for "Strength/intensity" question.
 *********************************************************************/
export enum LowHigh {
  Low = 'Low',
  Medium = 'Medium',
  High = 'High',
}

type LowHighEnumType = typeof LowHigh;
export type LowHighKey = keyof LowHighEnumType;
export type LowHighEnumValue = 'Low' | 'Medium' | 'High';

/*********************************************************************
 * End of low/medium/high options.
 *********************************************************************/
/*********************************************************************
 * Soreness recovery status options from the spreadsheet dropdown.
 * Values match the exact text displayed in the dropdown.
 *********************************************************************/
export enum Soreness {
  FullyRecovered = 'Fully Recovered',
  SomewhatRecovered = 'Somewhat Recovered',
  DidNotRecover = 'Did Not Recover',
}

type SorenessType = typeof Soreness;
export type SorenessKey = keyof SorenessType;
export type SorenessValue =
  'Fully Recovered' | 'Somewhat Recovered' | 'Did Not Recover';

/*********************************************************************
 * End of soreness recovery status options.
 *********************************************************************/
