declare global {
  var generateLorFromTemplate: (
    templateDocId: string,
    templateFields: TemplateFieldPropsRecord
  ) => void;
  var generateRayLorFromTemplate: () => void;
}
