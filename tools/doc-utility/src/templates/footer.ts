import {DocFrontmatter} from '../utils/frontmatter.js';

export interface FooterOptions {
  relatedDocs?: string[];
  feedbackUrl?: string;
}

export function generateFooter(
  frontmatter: DocFrontmatter,
  options: FooterOptions = {}
): string {
  const parts: string[] = ['\n---\n'];

  // Last modified
  parts.push(`_Last modified: ${frontmatter.modified}_\n`);

  // Related documents
  if (options.relatedDocs && options.relatedDocs.length > 0) {
    parts.push('\n**Related Documentation:**\n');
    options.relatedDocs.forEach((doc) => {
      parts.push(`- [${doc}](${doc})\n`);
    });
  }

  // Feedback link
  if (options.feedbackUrl) {
    parts.push(`\n[📝 Provide Feedback](${options.feedbackUrl})\n`);
  }

  return parts.join('');
}
