# Google Sheets Utility for Fitness Ingestion

A Node.js utility that provides programmatic access to the Google Sheets API, allowing you to run fitness-ingestion functions outside of the Google Apps Script environment.

## Features

- ✅ OAuth2 authentication with Google Sheets API
- ✅ Read Strong workout data from spreadsheets
- ✅ Access Lifting trainer spreadsheet data
- ✅ Run data transposition operations
- ✅ Support for batch operations
- ✅ Easy-to-use wrapper functions

## Prerequisites

1. **Node.js 20 or higher** - Already available if you're using this repository
2. **Google Cloud Project** - You need to set up a Google Cloud project with Sheets API enabled
3. **OAuth2 Credentials** - Download OAuth2 credentials from Google Cloud Console

## Setup Instructions

### Step 1: Enable Google Sheets API

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the **Google Sheets API**:
   - Navigate to "APIs & Services" > "Library"
   - Search for "Google Sheets API"
   - Click "Enable"

### Step 2: Create OAuth2 Credentials

1. In Google Cloud Console, go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth client ID"
3. If prompted, configure the OAuth consent screen:
   - Choose "External" user type
   - Fill in required fields (App name, User support email, Developer contact)
   - Add your email to "Test users"
4. Create OAuth client ID:
   - Application type: **Desktop app**
   - Name: "Sheets Utility" (or any name you prefer)
5. Download the credentials JSON file
6. Save it as `credentials.json` in the `packages/sheets-utility` directory

### Step 3: Install Dependencies

```bash
# From the root of the repository
pnpm install
```

### Step 4: Authenticate

Run the authentication script to generate your token:

```bash
cd packages/sheets-utility
pnpm run auth
```

This will:

1. Open your browser for Google sign-in
2. Ask you to authorize the application
3. Save the token to `token.json` (automatically excluded from git)

**Important**: Keep both `credentials.json` and `token.json` secure. They are already added to `.gitignore` and should never be committed to version control.

## Usage

### Basic Example: Reading Strong Workout Data

```javascript
import {SheetsClient} from './src/sheets-client.js';

// Initialize the client
const client = new SheetsClient();
await client.authenticate();

// Read data from a spreadsheet
const spreadsheetId = '1f9v_yD2QR6l0I1nbDc0ysIYuHpvq_-iLyF-NZjCy0-w';
const range = 'Strong!A1:Z1000';

const values = await client.getValues(spreadsheetId, range);
console.log('Data:', values);
```

### Running Fitness-Ingestion Operations

The utility provides wrapper functions that mirror the functionality of the Apps Script functions:

#### Example 1: Read Strong Workouts by Date

```bash
npm run example:read
```

Or programmatically:

```javascript
import {FitnessIngestion} from './src/fitness-ingestion.js';

const fitness = new FitnessIngestion();
await fitness.init();

// Get workouts for a date range
const workouts = await fitness.readStrongWorkoutsForDateRange(
  new Date('2024-01-01'),
  new Date('2024-01-31')
);

console.log(`Found ${workouts.size} workout days`);
```

#### Example 2: Transpose Strong Data to Lifting Format

```bash
npm run example:transpose
```

Or programmatically:

```javascript
import {FitnessIngestion} from './src/fitness-ingestion.js';

const fitness = new FitnessIngestion();
await fitness.init();

// Configure transposition
const config = {
  programStartDate: new Date('2024-01-01'),
  daysPerWeek: 6,
  minConfidenceThreshold: 0.6,
  debugMode: false,
  dryRun: true, // Set to false to actually write data
  verboseLogging: true,
};

// Run the transposition
const result = await fitness.transposeStrongToLifting(config);

if (result.success) {
  console.log('✓ Transposition completed successfully');
  console.log('Summary:', result.summary);
} else {
  console.log('✗ Transposition failed:', result.summary.error);
}
```

## API Reference

### SheetsClient

The base client for interacting with Google Sheets API.

#### Methods

- `authenticate()` - Authenticate with Google Sheets API
- `getValues(spreadsheetId, range)` - Read values from a range
- `updateValues(spreadsheetId, range, values)` - Write values to a range
- `batchGet(spreadsheetId, ranges)` - Read multiple ranges at once
- `batchUpdate(spreadsheetId, requests)` - Perform multiple updates at once
- `getSpreadsheet(spreadsheetId)` - Get spreadsheet metadata
- `createSpreadsheet(title, sheets)` - Create a new spreadsheet

### FitnessIngestion

High-level API for fitness-ingestion operations.

#### Methods

- `init()` - Initialize the client and authenticate
- `readStrongWorkoutsForDateRange(startDate, endDate)` - Read Strong workout data
- `readLiftingData(spreadsheetId)` - Read Lifting trainer spreadsheet data
- `transposeStrongToLifting(config)` - Run the full transposition process
- `matchWorkoutName(strongName, liftingNames, threshold)` - Match workout names
- `mapDateToWeekAndDay(date, programConfig)` - Calculate training week and day

## Configuration

### Spreadsheet IDs

The utility uses the same spreadsheet IDs as the Apps Script project:

- **Fitness & Nutrition Tracker**: `1f9v_yD2QR6l0I1nbDc0ysIYuHpvq_-iLyF-NZjCy0-w`
- **Lifting Trainer**: `1ZvwN_gctqbTmJYaj5KLXxuRL7LZm5i68Vsex3SCppeE`

You can override these by passing different IDs to the methods.

### Authentication Scopes

The utility requests the following OAuth scopes:

- `https://www.googleapis.com/auth/spreadsheets` - Full access to Google Sheets (read/write)

If you only need read access, you can modify `src/auth.js` to use:

- `https://www.googleapis.com/auth/spreadsheets.readonly` - Read-only access

## Troubleshooting

### "invalid_grant" error

This usually means your `token.json` has expired. Delete it and run `npm run auth` again.

### "Access blocked" error

Make sure:

1. Your email is added to the "Test users" list in the OAuth consent screen
2. The Google Cloud project has the Sheets API enabled
3. You're using the correct `credentials.json` file

### "Insufficient permissions" error

The token needs to be regenerated with the correct scopes. Delete `token.json` and authenticate again.

### Rate limiting

Google Sheets API has rate limits:

- 100 requests per 100 seconds per user
- 500 requests per 100 seconds per project

If you hit rate limits, consider:

- Using batch operations instead of individual requests
- Adding delays between requests
- Caching frequently accessed data

## Examples

The `examples/` directory contains sample scripts:

- `read-strong-data.js` - Read and display Strong workout data
- `transpose-workouts.js` - Run the workout transposition process
- `match-workouts.js` - Test workout name matching
- `date-to-week.js` - Test date-to-week calculations

## Security Notes

🔒 **Never commit sensitive files:**

- `credentials.json` - OAuth client credentials
- `token.json` - Access/refresh tokens
- `.env` files with API keys or secrets

These files are already in `.gitignore` but double-check before committing.

## License

Apache 2.0 - See [LICENSE](../../LICENSE) file in repository root. Copyright 2026 John Mitchell-Grant; all rights reserved except as expressly granted under the license.

## Support

For issues or questions:

1. Check the [Google Sheets API documentation](https://developers.google.com/sheets/api)
2. Review the [googleapis Node.js client documentation](https://github.com/googleapis/google-api-nodejs-client)
3. Check existing issues in the repository
