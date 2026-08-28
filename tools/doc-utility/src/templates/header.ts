import {DocFrontmatter} from '../utils/frontmatter.js';

export function generateHeader(frontmatter: DocFrontmatter): string {
  const statusBadge = getStatusBadge(frontmatter.status);
  const tagsBadges =
    frontmatter.tags?.map((tag) => `\`${tag}\``).join(' ') || '';

  let header = `# ${frontmatter.title}\n\n`;

  if (statusBadge || tagsBadges) {
    header += `${statusBadge}${statusBadge && tagsBadges ? ' ' : ''}${tagsBadges}\n\n`;
  }

  return header;
}

function getStatusBadge(status: DocFrontmatter['status']): string {
  const badges = {
    draft: '🚧 **Draft**',
    review: '👀 **In Review**',
    final: '✅ **Final**',
  };
  return badges[status] || '';
}
