# Fitness Models Package

TypeScript data models and type definitions for fitness and workout tracking data.

## Features

- 🏋️ **Workout Data Models**: Strongly typed definitions for workout routines, exercises, sets, and reps.
- 📐 **Schema Validation**: Built-in Zod schemas for runtime validation of parsed workout data.
- 📊 **Spreadsheet Contracts**: Export/import contracts for parsing and exporting fitness spreadsheet structures.

## Installation & Build

```bash
pnpm --filter @johnmgrant/fitness-models run build
```

## Usage

```typescript
import {WorkoutData} from '@johnmgrant/fitness-models';
```
