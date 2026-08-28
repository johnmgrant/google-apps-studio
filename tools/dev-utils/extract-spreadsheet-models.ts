#!/usr/bin/env ts-node

import fs from 'fs';
import path from 'path';
import prettier from 'prettier';

// Usage: ts-node extract-spreadsheet-models.ts <spreadsheet-model-file> <output-dir>
const [, , modelFile, outputDir] = process.argv;

if (!modelFile || !outputDir) {
  console.error(
    'Usage: ts-node extract-spreadsheet-models.ts <spreadsheet-model-file> <output-dir>'
  );
  process.exit(1);
}

// Read the spreadsheet model file (assumed to be JSON)
const modelJson = fs.readFileSync(modelFile, 'utf8');
const model = JSON.parse(modelJson) as {
  spreadsheetId: string;
  sheets: Record<
    string,
    {
      range: string;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      values: any[][];
      formulas: string[][];
      notes: string[][];
      numberFormats: string[][];
      backgrounds: string[][];
    }
  >;
};

const keys = Object.keys(model);
if (!keys.includes('sheets')) {
  console.error(
    'Invalid model file: missing "sheets" property: ' + keys.join(', ')
  );
  process.exit(1);
}

// Ensure output directory exists
fs.mkdirSync(outputDir, {recursive: true});

Object.entries(model.sheets).forEach(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async ([sheetName, sheet]: [string, any]) => {
    const safeSheetName = sheetName.replace(/[\\/:*?"<>|]/g, '_');
    const outPath = path.join(outputDir, `${safeSheetName}.json`);
    const formattedJson = await prettier.format(JSON.stringify(sheet), {
      parser: 'json',
    });
    fs.writeFileSync(outPath, formattedJson, 'utf8');
    console.log(`Extracted sheet: ${sheetName} -> ${outPath}`);
  }
);
