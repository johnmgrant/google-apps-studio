import * as yaml from 'yaml';

export interface DocFrontmatter {
  title: string;
  created: string;
  modified: string;
  status: 'draft' | 'review' | 'final';
  tags?: string[];
  [key: string]: unknown;
}

const FRONTMATTER_DELIMITER = '---';

export function parseFrontmatter(content: string): {
  frontmatter: DocFrontmatter | null;
  body: string;
  hasFrontmatter: boolean;
} {
  const lines = content.split('\n');

  if (lines[0]?.trim() !== FRONTMATTER_DELIMITER) {
    return {frontmatter: null, body: content, hasFrontmatter: false};
  }

  const endIndex = lines
    .slice(1)
    .findIndex((line) => line.trim() === FRONTMATTER_DELIMITER);

  if (endIndex === -1) {
    return {frontmatter: null, body: content, hasFrontmatter: false};
  }

  const frontmatterLines = lines.slice(1, endIndex + 1);
  const bodyLines = lines.slice(endIndex + 2);

  try {
    const frontmatter = yaml.parse(
      frontmatterLines.join('\n')
    ) as DocFrontmatter;
    return {
      frontmatter,
      body: bodyLines.join('\n'),
      hasFrontmatter: true,
    };
  } catch (error) {
    console.error('Failed to parse frontmatter:', error);
    return {frontmatter: null, body: content, hasFrontmatter: false};
  }
}

export function stringifyFrontmatter(
  frontmatter: DocFrontmatter,
  body: string
): string {
  const yamlContent = yaml.stringify(frontmatter, {
    lineWidth: 0,
    defaultStringType: 'PLAIN',
  });

  return `${FRONTMATTER_DELIMITER}\n${yamlContent}${FRONTMATTER_DELIMITER}\n\n${body}`;
}

export function updateModifiedDate(
  frontmatter: DocFrontmatter
): DocFrontmatter {
  return {
    ...frontmatter,
    modified: new Date().toISOString().split('T')[0],
  };
}

export function createFrontmatter(
  title: string,
  status: DocFrontmatter['status'] = 'draft',
  tags: string[] = []
): DocFrontmatter {
  const date = new Date().toISOString().split('T')[0];
  return {
    title,
    created: date,
    modified: date,
    status,
    tags: tags.length > 0 ? tags : undefined,
  };
}

export function validateFrontmatter(frontmatter: DocFrontmatter): string[] {
  const errors: string[] = [];

  if (!frontmatter.title) {
    errors.push('Missing required field: title');
  }

  if (!frontmatter.created) {
    errors.push('Missing required field: created');
  }

  if (!frontmatter.modified) {
    errors.push('Missing required field: modified');
  }

  if (!frontmatter.status) {
    errors.push('Missing required field: status');
  } else if (!['draft', 'review', 'final'].includes(frontmatter.status)) {
    errors.push(
      `Invalid status: ${frontmatter.status}. Must be draft, review, or final`
    );
  }

  return errors;
}
