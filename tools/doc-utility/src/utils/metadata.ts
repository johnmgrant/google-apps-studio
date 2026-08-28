import {readFile, writeFile} from 'fs/promises';
import {basename, extname} from 'path';

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function titleCase(text: string): string {
  return text
    .split(/[-_\s]+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

export function extractTitleFromFilename(filename: string): string {
  const nameWithoutExt = basename(filename, extname(filename));
  return titleCase(nameWithoutExt);
}

export async function readDocFile(filepath: string): Promise<string> {
  return readFile(filepath, 'utf-8');
}

export async function writeDocFile(
  filepath: string,
  content: string
): Promise<void> {
  await writeFile(filepath, content, 'utf-8');
}

export function isMarkdownFile(filename: string): boolean {
  return filename.endsWith('.md') || filename.endsWith('.markdown');
}
