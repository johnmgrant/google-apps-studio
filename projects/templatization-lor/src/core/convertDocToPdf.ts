// Convert a Google Doc to PDF
function convertDocToPdf(
  docFileId: string,
  targetFolder: GoogleAppsScript.Drive.Folder
) {
  const docFile = DriveApp.getFileById(docFileId);
  const fileName = docFile.getName().replace(/\.[^/.]+$/, ''); // Remove extension
  const pdfName = fileName + '.pdf';

  // Check if PDF already exists in the target folder
  const existingPDFs = targetFolder.getFilesByName(pdfName);
  if (existingPDFs.hasNext()) {
    const existingPDF = existingPDFs.next();
    Logger.log(`PDF already exists: ${pdfName}`);
    return {
      type: 'pdf',
      id: existingPDF.getId(),
      url: existingPDF.getUrl(),
      name: existingPDF.getName(),
    };
  }

  // Export the Doc as PDF
  const pdfBlob = docFile.getBlob().getAs('application/pdf').setName(pdfName);
  const pdfFile = targetFolder.createFile(pdfBlob);

  return {
    type: 'pdf',
    id: pdfFile.getId(),
    url: pdfFile.getUrl(),
    name: pdfFile.getName(),
  };
}
