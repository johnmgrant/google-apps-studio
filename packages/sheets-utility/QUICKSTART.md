# Quick Start Guide

Get up and running with the Google Sheets Utility in 5 minutes!

## Step 1: Enable the Google Sheets API

1. Open [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or select existing)
3. Navigate to **"APIs & Services" > "Library"**
4. Search for **"Google Sheets API"**
5. Click **"Enable"**

## Step 2: Get OAuth Credentials

1. In Google Cloud Console, go to **"APIs & Services" > "Credentials"**
2. Click **"Create Credentials" > "OAuth client ID"**
3. If needed, configure the OAuth consent screen:
   - User Type: **External**
   - App name: `Sheets Utility` (or your choice)
   - User support email: Your email
   - Developer contact: Your email
   - Add your email to **"Test users"** under the OAuth consent screen
4. Back in Credentials:
   - Application type: **Desktop app**
   - Name: `Sheets Utility CLI`
   - Click **"Create"**
5. Download the JSON file
6. Save it as `credentials.json` in `tools/sheets-utility/`

## Step 3: Install and Authenticate

```bash
# Navigate to the utility directory
cd tools/sheets-utility

# Install dependencies (if not already done)
npm install

# Run authentication
npm run auth
```

This will:

- Open your browser for Google sign-in
- Ask for permission to access your spreadsheets
- Save the access token to `token.json`

## Step 4: Try the Examples

### Read Strong Workout Data

```bash
npm run example:read
```

This will read workout data from your fitness tracker spreadsheet and display it in the console.

### Transpose Workouts (Dry Run)

```bash
npm run example:transpose
```

This runs a **dry run** (no actual changes) of the workout transposition process.

## Step 5: Customize for Your Needs

Edit the example scripts in `examples/` to:

- Change date ranges
- Adjust configuration settings
- Try different operations

## Common Issues

### "credentials.json not found"

- Make sure you downloaded the OAuth credentials from Google Cloud Console
- Save it as `credentials.json` in the `tools/sheets-utility` directory

### "Access blocked: This app's request is invalid"

- Add your email to the "Test users" list in the OAuth consent screen
- Make sure the Sheets API is enabled

### "Token has been expired or revoked"

- Delete `token.json` and run `npm run auth` again

## What's Next?

Check out the full [README.md](README.md) for:

- Detailed API documentation
- More examples
- Advanced configuration options
- Troubleshooting tips

## Getting Help

- Review the [Google Sheets API documentation](https://developers.google.com/sheets/api)
- Check the [googleapis Node.js client docs](https://github.com/googleapis/google-api-nodejs-client)
- Look at existing code in the fitness-ingestion Apps Script project
