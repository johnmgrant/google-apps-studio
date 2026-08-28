/**
 * Mapping of school acronyms to their respective template fields
 * TODO: Sync with {@link file://../../universities.json}
 * TODO: Investigate dynamic import of JSON files in GAS environment
 * TODO: Investigate ZOD schema validation in GAS environment
 */
const SCHOOL_TEMPLATE_FIELDS = {
  'UW-Madison': {
    'id': 'UW-Madison',
    'universityName': 'University of Wisconsin-Madison',
    'universitySchool': 'Computer Science',
    'universityProgram': 'Master of Computer Science',
    'universityNameAcronym': 'UW-Madison',
    'universityNameShort': 'UW-Madison',
  },
  'CMU': {
    'id': 'CMU',
    'universityName': 'Carnegie Mellon University',
    'universitySchool': 'Computer Science',
    'universityProgram': 'Masters of Software Engineering',
    'universityNameAcronym': 'CMU',
    'universityNameShort': 'Carnegie Mellon',
  },
  'UCSD': {
    'id': 'UCSD',
    'universityName': 'University of California San Diego',
    'universitySchool': 'Computer Science',
    'universityProgram': 'Master of Computer Science',
    'universityNameAcronym': 'UCSD',
    'universityNameShort': 'UC San Diego',
  },
  'UCB': {
    'id': 'UCB',
    'universityName': 'University of California Berkeley',
    'universitySchool': 'Electrical Engineering & Computer Sciences',
    'universityProgram': 'Master of Engineering (MEng)',
    'universityNameAcronym': 'UCB',
    'universityNameShort': 'UC Berkeley',
  },
  'UMD': {
    'id': 'UMD',
    'universityName': 'University of Maryland',
    'universitySchool': 'College of Information',
    'universityProgram':
      'Master of Science in Human-Computer Interaction (HCIM)',
    'universityNameAcronym': 'UMD',
    'universityNameShort': 'UMD',
  },
  'UM_AnnArbor': {
    'id': 'UM_AnnArbor',
    'universityName': 'University of Michigan - Ann Arbor',
    'universitySchool': 'Computer Science and Engineering',
    'universityProgram': "Master's in CSE",
    // https://arc.net/l/quote/vudfvato
    'universityNameAcronym': 'U-M',
    'universityNameShort': 'UM-Ann Arbor',
  },
  'UMich': {
    'id': 'UMich',
    'universityName': 'University of Michigan - Ann Arbor',
    'universitySchool': 'Computer Science and Engineering',
    'universityProgram': "Master's in CSE",
    'universityNameAcronym': 'UMich Ann Arbor',
    'universityNameShort': 'UMich Ann Arbor',
  },
  'CMU-HCI': {
    'id': 'CMU-HCI',
    'universityName': 'Carnegie Mellon University',
    'universitySchool': 'Human-Computer Interaction Institute',
    'universityProgram': 'Master of Human-Computer Interaction',
    'universityNameAcronym': 'CMU',
    'universityNameShort': 'Carnegie Mellon',
  },
  'UW': {
    'id': 'UW',
    'universityName': 'University of Washington - Seattle',
    'universitySchool': 'Human Centered Design & Engineering',
    'universityProgram': 'MHCI+D',
    'universityNameAcronym': 'UW',
    'universityNameShort': 'UW Seattle',
  },
  'GT-CS': {
    'id': 'GT-CS',
    'universityName': 'Georgia Institute of Technology',
    'universitySchool': 'College of Computing',
    'universityProgram': 'Master of Science in Computer Science',
    'universityNameAcronym': 'GT',
    'universityNameShort': 'Georgia Tech',
  },
  'GT-HCI-CoC': {
    'id': 'GT-HCI-CoC',
    'universityName': 'Georgia Institute of Technology',
    'universitySchool': 'College of Computing',
    'universityProgram': 'Master of Science in Human-Computer Interaction',
    'universityNameAcronym': 'GT',
    'universityNameShort': 'Georgia Tech',
  },
  'GT-HCI-Design': {
    'id': 'GT-HCI-Design',
    'universityName': 'Georgia Institute of Technology',
    'universitySchool': 'College of Design',
    'universityProgram': 'Master of Science in Human-Computer Interaction',
    'universityNameAcronym': 'GT',
    'universityNameShort': 'Georgia Tech',
  },
  'Cornell': {
    'id': 'Cornell',
    'universityName': 'Cornell University',
    'universitySchool':
      'Cornell Bowers College of Computing and Information Science',
    'universityProgram': 'Master of Engineering in Computer Science',
    'universityNameAcronym': 'Cornell',
    'universityNameShort': 'Cornell',
  },
} satisfies SchoolModelRecord<
  | 'UW-Madison'
  | 'CMU'
  | 'UCSD'
  | 'UCB'
  | 'UMD'
  | 'UM_AnnArbor'
  | 'UMich'
  | 'CMU-HCI'
  | 'UW'
  | 'GT-CS'
  | 'GT-HCI-CoC'
  | 'GT-HCI-Design'
  | 'Cornell'
>;
