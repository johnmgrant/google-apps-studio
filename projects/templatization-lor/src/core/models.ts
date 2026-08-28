type GenerationResult = Record<
  string,
  {
    doc?: {type: string; id: string; url?: string; name: string};
    pdf?: {type: string; id: string; url?: string; name: string};
  }
>;
