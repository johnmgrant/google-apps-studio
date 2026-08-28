import {readdir, stat} from 'fs/promises';
import {join} from 'path';

import {
  createFrontmatter,
  parseFrontmatter,
  stringifyFrontmatter,
  validateFrontmatter,
} from '../utils/frontmatter.js';
import {
  extractTitleFromFilename,
  isMarkdownFile,
  readDocFile,
  writeDocFile,
} from '../utils/metadata.js';

interface ValidateOptions {
  fix?: boolean;
}

interface ValidationResult {
  valid: number;
  invalid: number;
  fixed: number;
}

export async function validateDocs(
  paths: string[],
  options: ValidateOptions = {}
): Promise<void> {
  const result: ValidationResult = {valid: 0, invalid: 0, fixed: 0};

  for (const path of paths) {
    await processPath(join(process.cwd(), path), options, result);
  }

  console.log('\n📊 Validation Results:');
  console.log(`✅ Valid: ${result.valid}`);
  console.log(`❌ Invalid: ${result.invalid}`);
  if (options.fix && result.fixed > 0) {
    console.log(`🔧 Fixed: ${result.fixed}`);
  }

  if (result.invalid > 0 && !options.fix) {
    console.log('\n💡 Run with --fix to attempt automatic fixes');
    process.exit(1);
  }
}

async function processPath(
  path: string,
  options: ValidateOptions,
  result: ValidationResult
): Promise<void> {
  const stats = await stat(path);

  if (stats.isDirectory()) {
    await processDirectory(path, options, result);
  } else if (stats.isFile() && isMarkdownFile(path)) {
    await processFile(path, options, result);
  }
}

async function processDirectory(
  dirPath: string,
  options: ValidateOptions,
  result: ValidationResult
): Promise<void> {
  const entries = await readdir(dirPath, {withFileTypes: true});

  for (const entry of entries) {
    const fullPath = join(dirPath, entry.name);

    if (entry.isDirectory()) {
      await processDirectory(fullPath, options, result);
    } else if (entry.isFile() && isMarkdownFile(entry.name)) {
      await processFile(fullPath, options, result);
    }
  }
}

async function processFile(
  filepath: string,
  options: ValidateOptions,
  result: ValidationResult
): Promise<void> {
  try {
    const content = await readDocFile(filepath);
    const {frontmatter, body, hasFrontmatter} = parseFrontmatter(content);

    if (!hasFrontmatter || !frontmatter) {
      console.log(`❌ ${filepath}: Missing frontmatter`);
      result.invalid++;

      if (options.fix) {
        const title = extractTitleFromFilename(filepath);
        const newFrontmatter = createFrontmatter(title);
        const newContent = stringifyFrontmatter(newFrontmatter, body);
        await writeDocFile(filepath, newContent);
        console.log(`   🔧 Added frontmatter`);
        result.fixed++;
      }
      return;
    }

    const errors = validateFrontmatter(frontmatter);

    if (errors.length > 0) {
      console.log(`❌ ${filepath}:`);
      errors.forEach((error) => console.log(`   - ${error}`));
      result.invalid++;

      if (options.fix) {
        // Attempt to fix missing fields
        const fixedFrontmatter = {...frontmatter};
        const date = new Date().toISOString().split('T')[0];

        if (!fixedFrontmatter.title) {
          fixedFrontmatter.title = extractTitleFromFilename(filepath);
        }
        if (!fixedFrontmatter.created) {
          fixedFrontmatter.created = date;
        }
        if (!fixedFrontmatter.modified) {
          fixedFrontmatter.modified = date;
        }
        if (!fixedFrontmatter.status) {
          fixedFrontmatter.status = 'draft';
        }

        const newContent = stringifyFrontmatter(fixedFrontmatter, body);
        await writeDocFile(filepath, newContent);
        console.log(`   🔧 Fixed frontmatter`);
        result.fixed++;
      }
    } else {
      console.log(`✅ ${filepath}`);
      result.valid++;
    }
  } catch (error) {
    console.error(`❌ Error validating ${filepath}:`, error);
    result.invalid++;
  }
}
