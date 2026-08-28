/**
 * Generate a customized LoR document from a template.
 *
 * @param {string}                   templateDocId  Google Docs template document ID
 * @param {TemplateFieldPropsRecord} templateFields Template Field props
 * @return {{id: string, url: string, name: string}}
 */
function generateLorFromTemplate(
  templateDocId: string,
  universityNameKey: keyof typeof SCHOOL_TEMPLATE_FIELDS
) {
  const templateFields = SCHOOL_TEMPLATE_FIELDS[universityNameKey];
  const templateFieldId = templateFields.id;

  // Create the fields map from provided parameters
  const fields: TemplateFieldsRecord = {
    '{{UniversityName}}': templateFields.universityName,
    '{{UniversitySchool}}': templateFields.universitySchool,
    '{{UniversityProgram}}': templateFields.universityProgram,
    '{{UniversityNameAcronym}}': templateFields.universityNameAcronym,
    '{{UniversityNameShort}}': templateFields.universityNameShort,
  };

  // Clone the template document, renaming TEMPLATE__ prefix
  const templateFile = DriveApp.getFileById(templateDocId);
  const originalName = templateFile.getName();
  const prefix = templateFieldId;

  let newName;
  if (originalName.indexOf('TEMPLATE__') === 0) {
    // Replace leading TEMPLATE__ with e.g. "CMU_"
    newName = `${prefix}_${originalName.substring('TEMPLATE__'.length)}`;
  } else {
    // Fallback if the template name doesn't start with TEMPLATE__
    newName = `${prefix}_${originalName}`;
  }

  // Move the cloned file to the target folder
  // Get the parent folder of the template document
  const templateParents = templateFile.getParents();
  if (!templateParents.hasNext()) {
    throw new Error('Template file has no parent folder.');
  }
  const templateParentFolder = templateParents.next();

  // Find the "LoR 2025" folder in the parent folder
  const lorFolders = templateParentFolder.getFoldersByName('LoR 2025');
  if (!lorFolders.hasNext()) {
    throw new Error('LoR 2025 folder not found in template parent directory.');
  }
  const targetFolder = lorFolders.next();

  // Check if a Google Doc with the new name already exists in the target folder
  let docInfo: {
    type: 'doc' | 'pdf';
    id: string;
    url?: string;
    name: string;
  };

  // Find the Google Doc file (not PDF) by name and MIME type
  const existingFiles = targetFolder.getFilesByName(newName);
  let existingFile: GoogleAppsScript.Drive.File | null = null;

  while (existingFiles.hasNext()) {
    const file = existingFiles.next();
    // Check if this is a Google Doc (not a PDF or other file type)
    if (file.getMimeType() === 'application/vnd.google-apps.document') {
      existingFile = file;
      break;
    }
  }

  if (!existingFile) {
    const clonedFile = templateFile.makeCopy(newName);
    clonedFile.moveTo(targetFolder);

    // Loop body of cloned document and replace template values
    const clonedDoc = DocumentApp.openById(clonedFile.getId());
    const clonedBody = clonedDoc.getBody();

    if (!clonedBody) {
      throw new Error('Cloned document body is null.');
    }

    for (const key in fields) {
      clonedBody.replaceText(key, fields[key as TemplateFields]);
    }

    clonedDoc.saveAndClose();

    // Return some info about the generated document
    docInfo = {
      type: 'doc',
      id: clonedFile.getId(),
      url: clonedDoc.getUrl(),
      name: clonedFile.getName(),
    };
    Logger.log(`Success: ${JSON.stringify(docInfo)}`);
    return {[templateFieldId]: {doc: docInfo}};
  }

  // Convert the existingFile to a pdf on additional runs.
  docInfo = {
    type: 'doc',
    id: existingFile.getId(),
    url: existingFile.getUrl(),
    name: newName,
  };

  const pdfInfo = convertDocToPdf(existingFile.getId(), targetFolder);

  return {
    [templateFieldId]: {
      doc: docInfo,
      pdf: pdfInfo,
    },
  };
}
