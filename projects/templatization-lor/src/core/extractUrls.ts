/**
 * Extract URLs of a specific type from generation results.
 * @param results - Array of generation results
 * @param urlType - Type of URL to extract ('doc' or 'pdf')
 * @returns Comma-separated string of URLs
 */
function extractUrls(
  results: ReturnType<typeof generateLorFromTemplate>[],
  urlType: 'doc' | 'pdf'
): string {
  return results
    .filter((result) => result != null)
    .map((result) => Object.values(result)[0] as GenerationResult[string])
    .filter(
      (item) => item != null && typeof item === 'object' && urlType in item
    )
    .map((item) => item[urlType]?.url)
    .filter((url): url is string => url != null)
    .join(', ');
}
