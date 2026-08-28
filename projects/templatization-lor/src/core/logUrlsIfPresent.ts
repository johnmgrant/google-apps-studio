/**
 * Log URLs if any are present.
 * @param label - Label for the log message (e.g., 'Docs', 'PDFs')
 * @param urls - Comma-separated string of URLs
 */
function logUrlsIfPresent(label: string, urls: string): void {
  if (urls.length) {
    Logger.log(`Generated ${label}: ${urls}`);
  }
}
