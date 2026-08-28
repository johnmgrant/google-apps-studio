# Model Export

This project contains a small Google Apps Script library for exporting the
structure of a Google Spreadsheet as a JSON “model.” It is designed to help
extract data from a trainer’s spreadsheet—including values, formulas and
notes—for later processing by other services or machine‑learning tools.

## Overview

The primary entry point is `exportSpreadsheetModel(spreadsheetId)`. When given
the ID of a spreadsheet, this function iterates through every sheet and
collects the following details:

- **Range** – the A1 notation of the data range.
- **Values** – a 2D array of cell values.
- **Formulas** – a 2D array of formulas. Cells without formulas are empty strings.
- **Notes** – a 2D array of notes. Cells without notes are empty strings.
- **Number formats** – the number format applied to each cell.
- **Backgrounds** – the background colour of each cell.

The implementation is inspired by Dan Thareja’s approach for exporting
formulas and notes from a spreadsheet【314050528843249†L26-L37】 and extends it
to include additional metadata.

## Usage

1. **Build the project:**

   ```bash
   pnpm install
   pnpm build
   ```

2. **Deploy the script:**

   Use the [clasp](https://github.com/google/clasp) tool to push your build to
   Google Apps Script:

   ```bash
   pnpm push
   ```

3. **Run the exporter:**

   After deployment, you can call the function in the Apps Script editor or via
   an execution API. For example, to export your trainer’s spreadsheet:

   ```javascript
   // Replace with your actual spreadsheet ID
   const spreadsheetId = '1ZvwN_gctqbTmJYaj5KLXxuRL7LZm5i68Vsex3SCppeE';
   const model = exportSpreadsheetModel(spreadsheetId);
   Logger.log(JSON.stringify(model));
   ```

The returned `model` object will contain a top‑level `spreadsheetId` property
and a `sheets` property where each sheet name maps to its exported data.

## Notes

- If you need to export additional properties (e.g. font colours, font sizes,
  merges), you can call other `Range` methods such as
  `getFontColors()`, `getFontSizes()` and `getMergeRanges()` on the
  `dataRange` within `exportSpreadsheetModel`.
- The included OAuth scopes allow read‑only access to spreadsheets and limited
  Drive access to create files if you extend the script to write the JSON to
  Drive.
