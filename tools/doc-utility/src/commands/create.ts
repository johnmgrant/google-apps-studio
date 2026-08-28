import {mkdir} from 'fs/promises';
import {dirname, join} from 'path';

import {ADR_TEMPLATE} from '../templates/adr.js';
import {API_TEMPLATE} from '../templates/api.js';
import {generateFooter} from '../templates/footer.js';
import {GUIDE_TEMPLATE} from '../templates/guide.js';
import {generateHeader} from '../templates/header.js';
import {createFrontmatter, stringifyFrontmatter} from '../utils/frontmatter.js';
import {slugify, titleCase, writeDocFile} from '../utils/metadata.js';

const TEMPLATES: Record<string, string> = {
  guide: GUIDE_TEMPLATE,
  adr: ADR_TEMPLATE,
  api: API_TEMPLATE,
};

const TEMPLATE_TAGS: Record<string, string[]> = {
  guide: ['guide'],
  adr: ['architecture', 'decision'],
  api: ['api', 'reference'],
};

interface CreateOptions {
  dir: string;
}

export async function createDoc(
  type: string,
  name: string,
  options: CreateOptions
): Promise<void> {
  if (!TEMPLATES[type]) {
    console.error(`❌ Unknown document type: ${type}`);
    console.error(`Available types: ${Object.keys(TEMPLATES).join(', ')}`);
    process.exit(1);
  }

  const slug = slugify(name);
  const title = titleCase(name);
  const filename = `${slug}.md`;

  // Determine subdirectory based on type
  const typeDir =
    type === 'guide' ? 'guides' : type === 'adr' ? 'architecture' : 'api';
  const targetDir = join(process.cwd(), options.dir, typeDir);
  const filepath = join(targetDir, filename);

  // Create frontmatter
  const frontmatter = createFrontmatter(title, 'draft', TEMPLATE_TAGS[type]);

  // Generate content
  const header = generateHeader(frontmatter);
  const body = TEMPLATES[type].trim();
  const footer = generateFooter(frontmatter);
  const content = stringifyFrontmatter(
    frontmatter,
    `${header}${body}${footer}`
  );

  // Ensure directory exists
  await mkdir(targetDir, {recursive: true});

  // Write file
  await writeDocFile(filepath, content);

  console.log(`✅ Created ${type} document: ${filepath}`);
  console.log(`📝 Edit the file to complete your documentation`);
}
