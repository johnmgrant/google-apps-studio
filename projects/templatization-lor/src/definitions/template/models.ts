type TPropsToTemplateFieldRecord = typeof PropsToTemplateFieldsRecord;
type FieldProps = keyof TPropsToTemplateFieldRecord;
type TemplateFields = TPropsToTemplateFieldRecord[FieldProps];
type TemplateFieldPropsRecord = {
  [Prop in FieldProps]: string;
};
type GetPropValueByTemplateField<T extends TemplateFields> =
  T extends '{{UniversityName}}'
    ? TemplateFieldPropsRecord['universityName']
    : T extends '{{UniversitySchool}}'
      ? TemplateFieldPropsRecord['universitySchool']
      : T extends '{{UniversityProgram}}'
        ? TemplateFieldPropsRecord['universityProgram']
        : T extends '{{UniversityNameAcronym}}'
          ? TemplateFieldPropsRecord['universityNameAcronym']
          : T extends '{{UniversityNameShort}}'
            ? TemplateFieldPropsRecord['universityNameShort']
            : never;
type TemplateFieldsRecord = {
  [Key in TemplateFields]: GetPropValueByTemplateField<Key>;
};
