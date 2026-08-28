#!/usr/bin/env node

/**
 * Example: Read Strong workout data from the spreadsheet.
 *
 * This example demonstrates how to:
 * 1. Initialize the FitnessIngestion client
 * 2. Read Strong workout data for a date range
 * 3. Display the results
 */

import {FitnessIngestion} from '../src/fitness-ingestion';

async function main(): Promise<void> {
  console.log('='.repeat(60));
  console.log('Reading Strong Workout Data');
  console.log('='.repeat(60));
  console.log();

  // Initialize the client
  const fitness = new FitnessIngestion();
  await fitness.init();

  console.log('✓ Authenticated successfully\n');

  // Define the date range to read
  // Adjust these dates as needed
  const startDate = new Date('2024-01-01');
  const endDate = new Date('2024-01-31');

  console.log(
    `Reading workouts from ${startDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]}...`
  );
  console.log();

  try {
    // Read the workout data
    const workouts = await fitness.readStrongWorkoutsForDateRange(
      startDate,
      endDate,
      true // verbose logging
    );

    console.log();
    console.log('='.repeat(60));
    console.log('Results');
    console.log('='.repeat(60));
    console.log();

    if (workouts.size === 0) {
      console.log('No workouts found in the specified date range.');
      return;
    }

    // Display summary
    const totalWorkouts = Array.from(workouts.values()).reduce(
      (sum, dayWorkouts) => sum + dayWorkouts.length,
      0
    );

    console.log(
      `Found ${totalWorkouts} workouts across ${workouts.size} days:`
    );
    console.log();

    // Display workouts grouped by date
    const sortedDates = Array.from(workouts.keys()).sort();

    for (const dateStr of sortedDates) {
      const dayWorkouts = workouts.get(dateStr);
      if (!dayWorkouts) continue;

      console.log(`📅 ${dateStr}: ${dayWorkouts.length} workout(s)`);

      dayWorkouts.forEach((workout, index) => {
        const workoutName = workout['Workout Name'] || 'Unnamed';
        const duration = workout['Duration'] || 'N/A';
        console.log(`   ${index + 1}. ${workoutName} (${duration})`);
      });

      console.log();
    }

    console.log('='.repeat(60));
    console.log('✅ Successfully read workout data!');
    console.log('='.repeat(60));
  } catch (error) {
    console.error('\n❌ Error reading workout data:', (error as Error).message);
    process.exit(1);
  }
}

// Run the example
main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
