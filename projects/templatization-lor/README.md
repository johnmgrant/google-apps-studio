# Letter of Recommendation Templatization

Generate Letter of Recommendations from templates for requesting colleagues to each university.

## Overview

This Google Apps Script project automates the creation of customized Letters of Recommendation by replacing template fields with university-specific information. It clones template documents, replaces placeholders, and organizes the output in Google Drive.

## Usage

### Prerequisites

- A Google Docs template with placeholder fields (e.g., `{{UniversityName}}`, `{{UniversitySchool}}`, etc.)
- The template document ID from Google Docs
- Target folder ID in Google Drive where generated documents will be stored

### Template Fields

The following placeholder fields are supported in your template document:

- `{{UniversityName}}` - Full university name
- `{{UniversitySchool}}` - School or department name
- `{{UniversityProgram}}` - Specific program name
- `{{UniversityNameAcronym}}` - University acronym (e.g., "CMU")
- `{{UniversityNameShort}}` - Short university name (e.g., "Carnegie Mellon")

### Development

1. **Build the project:**

   ```bash
   pnpm build
   ```

2. **Deploy to Google Apps Script:**

   ```bash
   pnpm push
   ```

### Running the Script

The project includes a sample function `generateRayLorFromTemplate()` that demonstrates usage. To customize:

1. **Define your university data** in [src/constants.ts](src/constants.ts):

   ```typescript
   const SCHOOL_TEMPLATE_FIELDS = {
     'SCHOOL_CODE': {
       universityName: 'Full University Name',
       universitySchool: 'School/Department',
       universityProgram: 'Program Name',
       universityNameAcronym: 'ACRONYM',
       universityNameShort: 'Short Name',
     },
   };
   ```

2. **Create a generation function** in [src/scripts/DocTemplateLoR.ts](src/scripts/DocTemplateLoR.ts):

   ```typescript
   function generateMyLorFromTemplate() {
     const documentId = 'YOUR_TEMPLATE_DOC_ID';
     return generateLorFromTemplate(
       documentId,
       SCHOOL_TEMPLATE_FIELDS['SCHOOL_CODE']
     );
   }
   ```

3. **Execute the function** from the Google Apps Script editor

### Output

Generated documents will:

- Be named with the format: `{UniversityAcronym}_{OriginalName}` (e.g., `CMU_Letter_of_Recommendation.docx`)
- Have all template fields replaced with university-specific values
- Be moved to the configured target folder in Google Drive

### Configuration

Update the target folder ID in [src/scripts/DocTemplateLoR.ts](src/scripts/DocTemplateLoR.ts):

```typescript
const targetFolderId = 'YOUR_FOLDER_ID';
```
