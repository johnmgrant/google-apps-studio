#!/usr/bin/env node

/**
 * Example: Transpose Strong workout data to Lifting format.
 *
 * This example demonstrates how to:
 * 1. Configure the transposition process
 * 2. Run the transposition
 * 3. Review the results
 */

import {FitnessIngestion} from '../src/fitness-ingestion';

async function main(): Promise<void> {
  console.log('='.repeat(60));
  console.log('Transpose Strong Workouts to Lifting Format');
  console.log('='.repeat(60));
  console.log();

  // Initialize the client
  const fitness = new FitnessIngestion();
  await fitness.init();

  console.log('✓ Authenticated successfully\n');

  // Configure the transposition
  // IMPORTANT: Adjust these settings for your needs
  const config = {
    // When did your training program start?
    programStartDate: new Date('2024-01-01'),

    // How many days per week do you train?
    daysPerWeek: 6,

    // Minimum confidence for workout name matching (0.0 - 1.0)
    // Lower = more lenient matching, Higher = stricter matching
    minConfidenceThreshold: 0.6,

    // Debug mode creates a separate test spreadsheet
    debugMode: false,

    // Dry run previews changes without actually writing to the spreadsheet
    // ALWAYS test with dryRun: true first!
    dryRun: true,

    // Enable detailed logging
    verboseLogging: true,

    // Optional: specify a date range to process
    // If not provided, all available Strong data will be processed
    // dateRange: {
    //   start: new Date('2024-01-01'),
    //   end: new Date('2024-01-31'),
    // },
  };

  console.log('Configuration:');
  console.log(
    `  Program Start Date: ${config.programStartDate.toISOString().split('T')[0]}`
  );
  console.log(`  Days per Week: ${config.daysPerWeek}`);
  console.log(`  Min Confidence: ${config.minConfidenceThreshold}`);
  console.log(`  Debug Mode: ${config.debugMode}`);
  console.log(`  Dry Run: ${config.dryRun}`);
  console.log();

  if (config.dryRun) {
    console.log(
      '⚠️  DRY RUN MODE - No changes will be written to the spreadsheet'
    );
    console.log();
  }

  try {
    // Run the transposition
    const result = await fitness.transposeStrongToLifting(config);

    console.log();
    console.log('='.repeat(60));
    console.log('Results');
    console.log('='.repeat(60));
    console.log();

    if (result.success) {
      console.log('✅ Transposition completed successfully!');
      console.log();
      console.log('Summary:');
      console.log(`  Total workouts: ${result.summary.totalWorkouts}`);
      console.log(`  Matched workouts: ${result.summary.matchedWorkouts}`);
      console.log(`  Unmatched workouts: ${result.summary.unmatchedWorkouts}`);
      console.log(`  Days processed: ${result.summary.daysProcessed}`);
      console.log(`  Weeks spanned: ${result.summary.weeksSpanned}`);

      if (result.debugSpreadsheetId) {
        console.log();
        console.log(`Debug spreadsheet ID: ${result.debugSpreadsheetId}`);
      }

      if (config.dryRun) {
        console.log();
        console.log('⚠️  This was a DRY RUN. No changes were written.');
        console.log('   To apply changes, set dryRun: false in the config.');
      }
    } else {
      console.log('❌ Transposition failed');
      console.log(`Error: ${result.summary.error}`);
    }

    console.log();
    console.log('='.repeat(60));
  } catch (error) {
    console.error('\n❌ Error during transposition:', (error as Error).message);
    if (error instanceof Error && !!error.stack) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

// Run the example
main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
