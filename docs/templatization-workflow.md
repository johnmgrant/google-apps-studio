# Daily Report Sheet Templatization Workflow

This document describes the automated workflow for creating daily report sheets from templates in the Fitness & Nutrition Tracker spreadsheet.

## Overview

The templatization workflow automatically creates daily report sheets based on a template sheet (`TEMPLATE - yyyy-mm-dd`). Each generated sheet is populated with:

- LoseIt daily nutrition data from Gmail
- Strong workout data (morning and evening sessions)
- Properly formatted named ranges for data tracking

## Implementation

The workflow is implemented in the `fitness-ingestion` project under `src/scripts/templatization/v2/`.

### Core Function: `createDailyReportSheet()`

**Location:** `src/scripts/templatization/v2/createDailyReportSheet.ts`

This is the main function that orchestrates the entire workflow:

1. **Date Formatting**
   - Sheet name: `YYYY-MM-DD` format (e.g., `2025-11-17`)

2. **Data Probing**
   - Checks for available LoseIt data via Gmail
   - Checks for Strong workout data (morning and evening sessions)
   - Only creates sheet if data is available

3. **Template Duplication**
   - Finds the template sheet: `TEMPLATE - yyyy-mm-dd`
   - Duplicates it using `copyTo()`
   - Renames to the target date

4. **Named Range Discovery**
   - Finds existing named ranges copied from the template
   - Matches ranges by prefix: `LoseIt_Daily_Report`, `Morning_Session`, `Evening_Session`
   - Handles both global and sheet-scoped named ranges

5. **Data Population**
   - **LoseIt Data**: Populates the `LoseIt_Daily_Report` named range
   - **Morning Session**: Populates the `Morning_Session` named range
   - **Evening Session**: Populates the `Evening_Session` named range

6. **Dynamic Range Expansion**
   - Automatically inserts additional rows if data exceeds the template range
   - Updates named ranges to include new rows
   - Maintains data integrity during expansion

7. **Validation**
   - Removes sheet if no data was successfully added
   - Returns the created sheet or null on failure

### Helper Functions

#### `createDailyReportSheetForDate()`

**Location:** `src/scripts/templatization/v2/createDailyReportSheetForDate.ts`

Creates a sheet for a specific date with default parameters.

**Parameters:**

- `month` (number, 1-12): Month number (default: 11)
- `day` (number): Day of month (default: 20)
- `year` (number): Full year (default: 2025)

**Example:**

```typescript
// Create sheet for December 1, 2025
createDailyReportSheetForDate(12, 1, 2025);
```

#### `createDailyReportSheetForDateRange()`

**Location:** `src/scripts/templatization/v2/createDailyReportSheetForDateRange.ts`

Creates sheets for a range of dates.

**Parameters:**

- `props` (DateUtils.DateRange): Object with `start` and `end` Date objects

**Example:**

```typescript
// Create sheets for November 29-30, 2025
createDailyReportSheetForDateRange({
  start: new Date(2025, 10, 29),
  end: new Date(2025, 10, 30),
});
```

#### `duplicateTemplateForMonth()`

**Location:** `src/scripts/templatization/v2/duplicateTemplateForMonth.ts`

Creates sheets for an entire month.

#### `setupMonthSheets()`

**Location:** `src/scripts/templatization/v2/setupMonthSheets.ts`

Helper for batch sheet creation.

## Usage

### Prerequisites

1. **Template Sheet**: A sheet named `TEMPLATE - yyyy-mm-dd` must exist in the spreadsheet
   - Contains all formatting, formulas, and named ranges
   - Should be hidden to prevent accidental edits

2. **Data Sources**:
   - LoseIt daily emails in Gmail
   - Strong workout CSV data

3. **Named Ranges**: The template must include these named ranges:
   - `LoseIt_Daily_Report` - For nutrition data (suggested: A50:C57)
   - `Morning_Session` - For morning workouts (suggested: A3:L3)
   - `Evening_Session` - For evening workouts (suggested: A26:L26)

### Running the Workflow

From the Google Apps Script editor or via trigger:

```typescript
// Create today's sheet
createDailyReportSheet();

// Create specific date
createDailyReportSheet(new Date(2025, 11, 1));

// Create multiple sheets
createDailyReportSheetForDateRange({
  start: new Date(2025, 10, 29),
  end: new Date(2025, 11, 5),
});
```

### Available Functions in `mainTemplatization.ts`

Pre-configured functions for common use cases:

- `createDailyReportSheetFor1Dec2025()` - Creates sheet for Dec 1, 2025
- `createDailyReportSheetFor29To30Nov2025()` - Creates sheets for Nov 29-30, 2025

## Data Sources

### LoseIt Daily Data

Retrieved via `getLoseItDailyTableByDate(date)` which:

- Searches Gmail for LoseIt daily report emails
- Parses HTML tables from email body
- Returns formatted data arrays

### Strong Workout Data

Retrieved via `getStrongWorkoutsByDate(date, session)` which:

- Reads from `strong_workouts.csv`
- Filters by date and session (morning/evening)
- Returns formatted workout data

## Error Handling

The workflow includes comprehensive error handling:

1. **Missing Template**: Shows alert if template sheet not found
2. **No Data**: Throws error if no data available for the date
3. **Duplicate Sheet**: Skips creation if sheet already exists
4. **Empty Results**: Removes sheet if no data was successfully added

All errors are logged via `Logger.log()` and thrown via `internalThrowError()`.

## Design Evolution

This implementation represents version 2 (v2) of the templatization system. Key improvements over v1:

- **Data-driven creation**: Only creates sheets when data is available
- **Dynamic range expansion**: Automatically adjusts named ranges based on data size
- **Better error handling**: Comprehensive validation and rollback
- **Named range management**: Improved handling of sheet-scoped vs global named ranges

## Related Documentation

- [Gemini Chat Session 1](../ai-sessions/gemini-12-2-25/01-templatization.md) - Original design discussion
- [Fitness Ingestion README](../../projects/fitness-ingestion/README.md) - Main project documentation
- [Strong Data Workflow](../../.github/workflows/README.md) - CI/CD integration

## Technical Details

### Named Range Handling

The system handles both global and sheet-scoped named ranges:

```typescript
// Matches either format:
// - Global: "LoseIt_Daily_Report"
// - Sheet-scoped: "'2025-11-20'!LoseIt_Daily_Report"
const isMatchingName =
  rangeName === TABLE_PREFIXES[0] ||
  rangeName === `'${newSheetName}'!${TABLE_PREFIXES[0]}`;
```

### Range Expansion Algorithm

When data exceeds the template range:

1. Calculate rows needed: `rowsToAdd = numRows - currentRangeHeight`
2. Insert rows after last template row: `insertRowsAfter(startRow + currentRangeHeight - 1, rowsToAdd)`
3. Update named range: `setRange(expandedRange)`

This approach preserves:

- Template formatting
- Adjacent ranges
- Formula references

## Future Enhancements

Potential improvements for future versions:

1. **Automated Triggers**: Schedule automatic sheet creation
2. **Batch Processing**: Optimize for creating multiple sheets
3. **Data Validation**: Pre-validate data quality before sheet creation
4. **Template Versioning**: Support multiple template versions
5. **Rollback Capability**: Undo sheet creation if issues detected

## Troubleshooting

### Sheet Not Created

- Check if data exists for the date
- Verify template sheet exists and is accessible
- Check Logger output for specific errors

### Named Ranges Not Found

- Ensure template has all required named ranges
- Verify naming matches exactly (case-sensitive)
- Check if ranges are sheet-scoped vs global

### Data Not Appearing

- Verify data source availability (Gmail, CSV)
- Check date format consistency
- Review Logger output for parsing errors

### Range Expansion Issues

- Ensure sufficient quota for insertRowsAfter operations
- Check if protected ranges interfere
- Verify sheet permissions allow modifications
