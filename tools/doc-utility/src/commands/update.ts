import {readdir, stat} from 'fs/promises';
import {join} from 'path';

import {
  parseFrontmatter,
  stringifyFrontmatter,
  updateModifiedDate,
} from '../utils/frontmatter.js';
import {isMarkdownFile, readDocFile, writeDocFile} from '../utils/metadata.js';

export async function updateDocs(paths: string[]): Promise<void> {
  let updatedCount = 0;
  let skippedCount = 0;

  for (const path of paths) {
    const result = await processPath(join(process.cwd(), path));
    updatedCount += result.updated;
    skippedCount += result.skipped;
  }

  console.log(`\n✅ Updated ${updatedCount} document(s)`);
  if (skippedCount > 0) {
    console.log(
      `⏭️  Skipped ${skippedCount} file(s) (no frontmatter or not modified)`
    );
  }
}

async function processPath(
  path: string
): Promise<{updated: number; skipped: number}> {
  const stats = await stat(path);

  if (stats.isDirectory()) {
    return processDirectory(path);
  } else if (stats.isFile() && isMarkdownFile(path)) {
    return processFile(path);
  }

  return {updated: 0, skipped: 1};
}

async function processDirectory(
  dirPath: string
): Promise<{updated: number; skipped: number}> {
  let totalUpdated = 0;
  let totalSkipped = 0;

  const entries = await readdir(dirPath, {withFileTypes: true});

  for (const entry of entries) {
    const fullPath = join(dirPath, entry.name);

    if (entry.isDirectory()) {
      const result = await processDirectory(fullPath);
      totalUpdated += result.updated;
      totalSkipped += result.skipped;
    } else if (entry.isFile() && isMarkdownFile(entry.name)) {
      const result = await processFile(fullPath);
      totalUpdated += result.updated;
      totalSkipped += result.skipped;
    }
  }

  return {updated: totalUpdated, skipped: totalSkipped};
}

async function processFile(
  filepath: string
): Promise<{updated: number; skipped: number}> {
  try {
    const content = await readDocFile(filepath);
    const {frontmatter, body, hasFrontmatter} = parseFrontmatter(content);

    if (!hasFrontmatter || !frontmatter) {
      return {updated: 0, skipped: 1};
    }

    const updatedFrontmatter = updateModifiedDate(frontmatter);
    const newContent = stringifyFrontmatter(updatedFrontmatter, body);

    // Only write if content actually changed
    if (newContent !== content) {
      await writeDocFile(filepath, newContent);
      console.log(`📝 Updated: ${filepath}`);
      return {updated: 1, skipped: 0};
    }

    return {updated: 0, skipped: 1};
  } catch (error) {
    console.error(`❌ Error processing ${filepath}:`, error);
    return {updated: 0, skipped: 1};
  }
}
