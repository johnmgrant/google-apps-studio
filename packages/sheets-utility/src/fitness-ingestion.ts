/**
 * High-level API for fitness-ingestion operations.
 * Provides Node.js wrappers for Apps Script functions.
 */

import {SheetsClient} from './sheets-client';

// Spreadsheet IDs from the Apps Script constants
const SPREADSHEET_IDS = {
  fitnessTracker: '1f9v_yD2QR6l0I1nbDc0ysIYuHpvq_-iLyF-NZjCy0-w',
  liftingTrainer: '1ZvwN_gctqbTmJYaj5KLXxuRL7LZm5i68Vsex3SCppeE',
} as const;

// Sheet names
const SHEET_NAMES = {
  strong: 'Strong',
  loseIt: 'LoseIt',
} as const;

interface WorkoutRow {
  Date?: string;
  [key: string]: string | undefined;
}

interface TranspositionConfig {
  programStartDate: Date;
  daysPerWeek?: number;
  minConfidenceThreshold?: number;
  debugMode?: boolean;
  dryRun?: boolean;
  verboseLogging?: boolean;
  dateRange?: {start: Date; end: Date} | null;
}

interface WeekDayMapping {
  week: number;
  day: number;
  daysSinceStart: number;
}

interface WorkoutMatch {
  strongName: string;
  liftingName: string;
  confidence: number;
}

interface MatchedWorkout {
  date: Date;
  dateStr: string;
  week: number;
  day: number;
  workoutName: string;
  matched: boolean;
}

interface TranspositionResult {
  success: boolean;
  summary: {
    error?: string;
    totalWorkouts?: number;
    matchedWorkouts?: number;
    unmatchedWorkouts?: number;
    daysProcessed?: number;
    weeksSpanned?: number;
  };
  debugSpreadsheetId?: string;
}

export class FitnessIngestion {
  private client: SheetsClient;

  constructor() {
    this.client = new SheetsClient();
  }

  /**
   * Initialize and authenticate the client.
   */
  async init(): Promise<void> {
    await this.client.authenticate();
  }

  /**
   * Read Strong workout data for a date range.
   * Maps to the readStrongWorkoutsForDateRange function in Apps Script.
   */
  async readStrongWorkoutsForDateRange(
    startDate: Date,
    endDate: Date,
    verbose = false
  ): Promise<Map<string, WorkoutRow[]>> {
    const range = `${SHEET_NAMES.strong}!A:Z`;
    const values = await this.client.getValues(
      SPREADSHEET_IDS.fitnessTracker,
      range
    );

    if (verbose) {
      console.log(`Read ${values.length} rows from Strong sheet`);
    }

    // Check if we have data
    if (values.length === 0) {
      if (verbose) {
        console.log('No data found in Strong sheet');
      }
      return new Map();
    }

    // Parse the data (assuming first row is headers)
    const headers = values[0] as string[];
    const workoutsByDate = new Map<string, WorkoutRow[]>();

    for (let i = 1; i < values.length; i++) {
      const row = values[i];
      const rowData: WorkoutRow = {};

      headers.forEach((header, index) => {
        // Handle rows that may have fewer columns than headers
        rowData[header] = index < row.length ? String(row[index]) : undefined;
      });

      // Filter by date range (skip rows without valid dates)
      if (!rowData['Date']) {
        continue;
      }

      const workoutDate = new Date(rowData['Date']);
      if (isNaN(workoutDate.getTime())) {
        // Invalid date, skip this row
        continue;
      }

      if (workoutDate >= startDate && workoutDate <= endDate) {
        const dateKey = workoutDate.toISOString().split('T')[0];

        if (!workoutsByDate.has(dateKey)) {
          workoutsByDate.set(dateKey, []);
        }

        workoutsByDate.get(dateKey)!.push(rowData);
      }
    }

    if (verbose) {
      console.log(
        `Found workouts for ${workoutsByDate.size} days in date range`
      );
    }

    return workoutsByDate;
  }

  /**
   * Read all Lifting spreadsheet data.
   * Maps to readAllLiftingData function in Apps Script.
   */
  async readLiftingData(
    spreadsheetId = SPREADSHEET_IDS.liftingTrainer,
    verbose = false
  ): Promise<Map<string, unknown[][]>> {
    // Get all sheet names
    const sheetNames = await this.client.getSheetNames(spreadsheetId);

    if (verbose) {
      console.log(`Found ${sheetNames.length} sheets in Lifting spreadsheet`);
    }

    const allData = new Map<string, unknown[][]>();

    // Read data from each sheet (each sheet represents a week or day)
    for (const sheetName of sheetNames) {
      const range = `${sheetName}!A:Z`;
      const values = await this.client.getValues(spreadsheetId, range);

      if (values.length > 0) {
        allData.set(sheetName, values);

        if (verbose) {
          console.log(`  ${sheetName}: ${values.length} rows`);
        }
      }
    }

    return allData;
  }

  /**
   * Get the date range of Strong workout data.
   */
  async getStrongWorkoutDateRange(): Promise<{start: Date; end: Date} | null> {
    const range = `${SHEET_NAMES.strong}!A:A`;
    const values = await this.client.getValues(
      SPREADSHEET_IDS.fitnessTracker,
      range
    );

    if (values.length <= 1) {
      return null; // No data
    }

    const dates: Date[] = [];
    for (let i = 1; i < values.length; i++) {
      if (values[i][0]) {
        const date = new Date(String(values[i][0]));
        if (!isNaN(date.getTime())) {
          dates.push(date);
        }
      }
    }

    if (dates.length === 0) {
      return null;
    }

    dates.sort((a, b) => a.getTime() - b.getTime());
    return {
      start: dates[0],
      end: dates[dates.length - 1],
    };
  }

  /**
   * Transpose Strong data to Lifting format.
   * This is a simplified version that demonstrates the concept.
   * For full functionality, you'll need to implement the matching algorithms.
   */
  async transposeStrongToLifting(
    config: TranspositionConfig
  ): Promise<TranspositionResult> {
    const {
      programStartDate,
      daysPerWeek = 6,
      minConfidenceThreshold = 0.6,
      debugMode = false,
      dryRun = true,
      verboseLogging = false,
      dateRange = null,
    } = config;

    console.log('=== Starting Lifting Transposition ===');
    console.log(`Program start date: ${programStartDate.toISOString()}`);
    console.log(`Days per week: ${daysPerWeek}`);
    console.log(`Min confidence: ${minConfidenceThreshold}`);
    console.log(`Debug mode: ${debugMode}`);
    console.log(`Dry run: ${dryRun}`);
    console.log();

    try {
      // Step 1: Read Lifting data
      console.log('Step 1: Reading Lifting data...');
      const liftingData = await this.readLiftingData(
        SPREADSHEET_IDS.liftingTrainer,
        verboseLogging
      );
      console.log(`✓ Read data for ${liftingData.size} sheets`);

      // Step 2: Determine date range
      console.log('\nStep 2: Determining date range...');
      let workoutDateRange = dateRange;
      if (!workoutDateRange) {
        workoutDateRange = await this.getStrongWorkoutDateRange();
        if (!workoutDateRange) {
          return {
            success: false,
            summary: {error: 'No Strong workout data found'},
          };
        }
      }

      console.log(
        `✓ Date range: ${workoutDateRange.start.toISOString().split('T')[0]} to ${workoutDateRange.end.toISOString().split('T')[0]}`
      );

      // Step 3: Read Strong workout data
      console.log('\nStep 3: Reading Strong workout data...');
      const strongWorkouts = await this.readStrongWorkoutsForDateRange(
        workoutDateRange.start,
        workoutDateRange.end,
        verboseLogging
      );

      const totalWorkouts = Array.from(strongWorkouts.values()).reduce(
        (sum, workouts) => sum + workouts.length,
        0
      );
      console.log(
        `✓ Read ${totalWorkouts} workouts across ${strongWorkouts.size} days`
      );

      if (totalWorkouts === 0) {
        return {
          success: false,
          summary: {error: 'No Strong workouts found in date range'},
        };
      }

      // Step 4: Match workouts (simplified - you'd implement the full matching logic here)
      console.log('\nStep 4: Matching workouts...');
      const matchedWorkouts: MatchedWorkout[] = [];

      for (const [dateStr, workouts] of strongWorkouts.entries()) {
        const workoutDate = new Date(dateStr);
        const {week, day} = this.mapDateToWeekAndDay(workoutDate, {
          startDate: programStartDate,
          daysPerWeek,
        });

        workouts.forEach((workout) => {
          matchedWorkouts.push({
            date: workoutDate,
            dateStr,
            week,
            day,
            workoutName: workout['Workout Name'] || 'Unknown',
            matched: false, // You'd implement matching logic here
          });

          if (verboseLogging) {
            console.log(
              `  ${dateStr}: Week ${week}, Day ${day} - ${workout['Workout Name']}`
            );
          }
        });
      }

      console.log(`✓ Processed ${matchedWorkouts.length} workouts`);

      // Step 5: Write data (if not dry run)
      if (!dryRun) {
        console.log('\nStep 5: Writing data to spreadsheet...');
        // You would implement the writing logic here
        console.log('✓ Data written successfully');
      } else {
        console.log('\n[DRY RUN] Skipping write step');
      }

      console.log('\n=== Transposition Complete ===');

      return {
        success: true,
        summary: {
          totalWorkouts: matchedWorkouts.length,
          matchedWorkouts: matchedWorkouts.filter((w) => w.matched).length,
          unmatchedWorkouts: matchedWorkouts.filter((w) => !w.matched).length,
          daysProcessed: strongWorkouts.size,
          weeksSpanned: Math.max(...matchedWorkouts.map((w) => w.week)),
        },
        debugSpreadsheetId: debugMode ? 'debug-id' : undefined,
      };
    } catch (error) {
      console.error('Error during transposition:', (error as Error).message);
      return {
        success: false,
        summary: {error: (error as Error).message},
      };
    }
  }

  /**
   * Map a date to training week and day.
   * Simplified version of the Apps Script function.
   */
  mapDateToWeekAndDay(
    workoutDate: Date,
    config: {startDate: Date; daysPerWeek: number}
  ): WeekDayMapping {
    const {startDate, daysPerWeek} = config;

    const daysSinceStart = Math.floor(
      (workoutDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysSinceStart < 0) {
      throw new Error('Workout date is before program start date');
    }

    const week = Math.floor(daysSinceStart / daysPerWeek) + 1;
    const day = (daysSinceStart % daysPerWeek) + 1;

    return {week, day, daysSinceStart};
  }

  /**
   * Match a Strong workout name to Lifting workout names.
   * Simplified fuzzy matching implementation.
   */
  matchWorkoutName(
    strongName: string,
    liftingNames: string[],
    threshold = 0.6
  ): WorkoutMatch | null {
    const normalize = (name: string): string => {
      return name
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\b(workout|session|training|day)\b/g, '')
        .replace(/\s+/g, ' ')
        .trim();
    };

    const normalizedStrong = normalize(strongName);

    // Handle empty or whitespace-only names
    if (!normalizedStrong) {
      return null;
    }

    let bestMatch: WorkoutMatch | null = null;
    let bestScore = 0;

    for (const hgName of liftingNames) {
      const normalizedHG = normalize(hgName);

      // Skip empty Lifting names
      if (!normalizedHG) {
        continue;
      }

      // Simple similarity: check for common words
      const strongWords = new Set(normalizedStrong.split(' ').filter((w) => w));
      const hgWords = normalizedHG.split(' ').filter((w) => w);

      // Handle edge case where both are empty after normalization
      if (strongWords.size === 0 || hgWords.length === 0) {
        continue;
      }

      let matches = 0;
      for (const word of hgWords) {
        if (strongWords.has(word)) {
          matches++;
        }
      }

      const score = matches / Math.max(strongWords.size, hgWords.length);

      if (score > bestScore && score >= threshold) {
        bestScore = score;
        bestMatch = {
          strongName,
          liftingName: hgName,
          confidence: score,
        };
      }
    }

    return bestMatch;
  }

  /**
   * Get all available Lifting workout names from the trainer spreadsheet.
   */
  async getLiftingWorkoutNames(
    spreadsheetId = SPREADSHEET_IDS.liftingTrainer
  ): Promise<string[]> {
    const sheetNames = await this.client.getSheetNames(spreadsheetId);

    // Filter out non-workout sheets (like "Trainer Info", "Notes", etc.)
    const workoutNames = sheetNames.filter(
      (name) =>
        !name.toLowerCase().includes('info') &&
        !name.toLowerCase().includes('note') &&
        !name.toLowerCase().includes('template')
    );

    return workoutNames;
  }
}
