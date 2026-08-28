type SchoolModelRecord<Schools extends string> = {
  [SchoolAcronym in Schools]: {
    id: SchoolAcronym;
  } & {
    [TemplateField in FieldProps]: string; // All fields are strings; acronym may differ from key
  };
};

declare namespace AcademicModelsV2 {
  interface IWithAcronym {
    acronym: string;
  }

  interface Label extends IWithAcronym {
    full: string;
    short: string;
    aliases?: string[];
  }

  type CollegeCategory =
    | 'Design'
    | 'Science'
    | 'Computing'
    | 'Engineering'
    | 'Computer Science'
    | 'Computer Science & Engineering'
    | 'Human-Computer Interaction & Design';

  type DegreeMasterOfPrefix = 'Master of ';
  type DegreeMastersInPrefix = "Master's in ";
  interface DegreePhraseRecord {
    'of': `${DegreeMasterOfPrefix}${CollegeCategory}`;
    'in': `${DegreeMastersInPrefix}${CollegeCategory}`;
  }

  type OfPhrase = DegreePhraseRecord['of'];
  type InPhrase = DegreePhraseRecord['in'];

  type DegreePhrases = OfPhrase | InPhrase;

  type DegreeShort<
    TPhrases extends DegreePhrases,
    TCollegeCategory extends CollegeCategory =
      TPhrases extends `${DegreeMasterOfPrefix}${infer Category}`
        ? Category
        : TPhrases extends `${DegreeMastersInPrefix}${infer Category}`
          ? Category
          : never,
  > = TCollegeCategory extends 'Design'
    ? 'MDes'
    : TCollegeCategory extends 'Science'
      ? 'MS'
      : TCollegeCategory extends 'Computing'
        ? 'MComp'
        : TCollegeCategory extends 'Engineering'
          ? 'MEng'
          : TCollegeCategory extends 'Computer Science'
            ? 'MSCS'
            : TCollegeCategory extends 'Computer Science & Engineering'
              ? 'MSCSE'
              : TCollegeCategory extends 'Human-Computer Interaction & Design'
                ? 'MHCI+D'
                : never;

  type DegreeProgram<
    TDegree extends DegreePhrases,
    TProgram extends string,
  > = `${DegreeShort<TDegree>} in ${TProgram}`;

  /**
   * The college will always be the first part of the ID.
   * - A single Underscore (_) is used in place of space.
   * - A double Underscore (__) is used in place of hyphens (-).
   * - A Hyphen (-) indicates the end of the college acronym,
   * and the start of the appended college acronym to keep the key unique.
   * For example, `id` = 'UM__Ann_Arbor' becomes 'UM-Ann Arbor' for the college acronym.
   * If Ray or candidate applies to multiple colleges with the same acronym,
   * the appended college acronym helps to differentiate them.
   * For example, `id` = 'UM__Ann_Arbor-CJ' also becomes 'UM-Ann Arbor' for the college acronym.
   */
  interface ExtractCollegeAcronym<TId extends string> {
    // TODO: Consider strictly enforcing this structure with a more complex type. Parking lot for now.
    collegeAcronym: TId extends `${infer CollegeAcronym}__${string}`
      ? CollegeAcronym extends `${infer CAcronym}-${string}`
        ? CAcronym extends string
          ? CAcronym extends ''
            ? never
            : CAcronym
          : never
        : CollegeAcronym extends string
          ? CollegeAcronym extends ''
            ? never
            : CollegeAcronym
          : never
      : never;
  }

  // TODO: Need to continue refining this type to enforce structure more strictly. Parking lot for now.
  interface College<T extends string, TLabel extends AcademicModelsV2.Label> {
    id: T;
    name: TLabel;
    degree: {
      program: string;
      school: string;
    };
  }
}
