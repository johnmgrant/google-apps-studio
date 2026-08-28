/**
 * Generate LORs for multiple schools and log the results.
 * @param schools - Array of school identifiers. Defaults to all keys in SCHOOL_TEMPLATE_FIELDS.
 */
function generateLoRs(schools?: (keyof typeof SCHOOL_TEMPLATE_FIELDS)[]) {
  const schoolList = schools || [
    'GT-CS',
    'GT-HCI-CoC',
    'GT-HCI-Design',
    'Cornell',
  ]; // Object.keys(SCHOOL_TEMPLATE_FIELDS);

  const results = schoolList.map((school) =>
    generateLorFromTemplate(
      templateId,
      school as keyof typeof SCHOOL_TEMPLATE_FIELDS
    )
  );

  const docUrls = extractUrls(results, 'doc');
  const pdfUrls = extractUrls(results, 'pdf');

  Logger.log(JSON.stringify(results, null, 2));
  logUrlsIfPresent('Docs', docUrls);
  logUrlsIfPresent('PDFs', pdfUrls);
}
