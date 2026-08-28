# GitHub Workflows

This directory contains GitHub Actions workflows for the google-apps-studio repository.

## Check Strong Workouts Data

**File:** `check-strong-data.yml`

### Purpose

This workflow checks for new `strong_workouts.csv` files at a specified path and merges them with the main strong workouts data file stored in the repository.

### Triggers

- **Manual trigger (`workflow_dispatch`)**: Can be triggered manually from the GitHub Actions UI
- **Called from other workflows (`workflow_call`)**: Can be invoked by other workflows

### Inputs

- `data_path` (optional): Path to check for new strong_workouts.csv files
  - Default: `./projects/fitness-ingestion/src/assets/private`
  - Can be a file path or directory path
  - If a directory, the workflow will search for any files matching the pattern `strong*workouts*.csv`

### How It Works

1. Checks out the repository
2. Sets up Node.js and pnpm
3. Installs dependencies
4. Runs the `check:strong-data` script which:
   - Searches for new strong_workouts.csv files at the specified path
   - Reads the existing main strong_workouts.csv file
   - Merges new data with existing data (avoiding duplicates)
   - Writes the merged data back to the main file
5. If changes are detected, commits and pushes them back to the repository

### Usage

#### Manual Trigger

1. Go to the Actions tab in GitHub
2. Select "Check Strong Workouts Data" workflow
3. Click "Run workflow"
4. Optionally specify a custom path to check
5. Click "Run workflow" button

#### From Another Workflow

```yaml
jobs:
  check-strong-data:
    uses: ./.github/workflows/check-strong-data.yml
    with:
      data_path: './path/to/check'
```

### Related Files

- **Script**: `projects/fitness-ingestion/scripts/check-strong-data.ts`
- **Main data file**: `projects/fitness-ingestion/src/assets/private/strong_workouts.csv`
- **Constants**: `projects/fitness-ingestion/src/scripts/constants.ts`

### Notes

- The script uses key columns (Date, Workout Name, Exercise Name, Set Order) to identify duplicate rows
- Only unique rows are added to prevent data duplication
- The workflow automatically commits and pushes changes if new data is found
- If no new data is found, the workflow completes without making changes
