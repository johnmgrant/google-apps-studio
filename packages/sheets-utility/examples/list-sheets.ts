#!/usr/bin/env node

/**
 * Example: List all sheets in the fitness spreadsheets.
 *
 * This is a simple example to verify your authentication is working
 * and to see what sheets are available in your spreadsheets.
 */

import {SheetsClient} from '../src/sheets-client';

const SPREADSHEET_IDS = {
  fitnessTracker: '1f9v_yD2QR6l0I1nbDc0ysIYuHpvq_-iLyF-NZjCy0-w',
  liftingTrainer: '1ZvwN_gctqbTmJYaj5KLXxuRL7LZm5i68Vsex3SCppeE',
} as const;

async function main(): Promise<void> {
  console.log('='.repeat(60));
  console.log('List Sheets in Fitness Spreadsheets');
  console.log('='.repeat(60));
  console.log();

  // Initialize the client
  const client = new SheetsClient();
  await client.authenticate();

  console.log('✓ Authenticated successfully\n');

  try {
    // List sheets in Fitness Tracker
    console.log('📊 Fitness & Nutrition Tracker');
    console.log('-'.repeat(60));
    const fitnessSpreadsheet = await client.getSpreadsheet(
      SPREADSHEET_IDS.fitnessTracker
    );
    console.log(`Title: ${fitnessSpreadsheet.properties?.title}`);
    console.log(`URL: ${fitnessSpreadsheet.spreadsheetUrl}`);
    console.log(`\nSheets (${fitnessSpreadsheet.sheets?.length || 0}):`);
    fitnessSpreadsheet.sheets?.forEach((sheet, index) => {
      const title = sheet.properties?.title;
      const rowCount = sheet.properties?.gridProperties?.rowCount || 'N/A';
      const colCount = sheet.properties?.gridProperties?.columnCount || 'N/A';
      console.log(
        `  ${index + 1}. ${title} (${rowCount} rows × ${colCount} cols)`
      );
    });

    console.log();
    console.log();

    // List sheets in Lifting Trainer
    console.log('🏋️  Lifting Trainer Spreadsheet');
    console.log('-'.repeat(60));
    const liftingSpreadsheet = await client.getSpreadsheet(
      SPREADSHEET_IDS.liftingTrainer
    );
    console.log(`Title: ${liftingSpreadsheet.properties?.title}`);
    console.log(`URL: ${liftingSpreadsheet.spreadsheetUrl}`);
    console.log(`\nSheets (${liftingSpreadsheet.sheets?.length || 0}):`);
    liftingSpreadsheet.sheets?.forEach((sheet, index) => {
      const title = sheet.properties?.title;
      const rowCount = sheet.properties?.gridProperties?.rowCount || 'N/A';
      const colCount = sheet.properties?.gridProperties?.columnCount || 'N/A';
      console.log(
        `  ${index + 1}. ${title} (${rowCount} rows × ${colCount} cols)`
      );
    });

    console.log();
    console.log('='.repeat(60));
    console.log('✅ Successfully retrieved spreadsheet information!');
    console.log('='.repeat(60));
  } catch (error) {
    console.error(
      '\n❌ Error accessing spreadsheets:',
      (error as Error).message
    );
    console.error('\nPossible issues:');
    console.error('1. You may not have access to these spreadsheets');
    console.error('2. The spreadsheet IDs might be incorrect');
    console.error('3. Your OAuth token might need to be refreshed');
    console.error('\nTry running: npm run auth\n');
    process.exit(1);
  }
}

// Run the example
main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
