export const BUILT_IN_TEMPLATES = [
  {
    id: 'lpdp-indonesia',
    name: 'LPDP Indonesia',
    description: 'Template for Indonesian Education Fund (LPDP) scholarship applications',
    category: 'Country-Specific',
    country: 'Indonesia',
    createdBy: 'system',
    version: '1.0',
    items: [
      {
        text: 'Surat pernyataan motivasi',
        note: 'Motivation letter explaining why you deserve the scholarship'
      },
      {
        text: 'CV/Resume',
        note: 'Updated curriculum vitae in Indonesian or English'
      },
      {
        text: 'Ijazah terakhir',
        note: 'Latest degree certificate (notarized copy)'
      },
      {
        text: 'Transkrip nilai',
        note: 'Academic transcript with GPA'
      },
      {
        text: 'Surat rekomendasi (2)',
        note: 'Two recommendation letters from academic or professional references'
      },
      {
        text: 'Sertifikat TOEFL/IELTS',
        note: 'English proficiency test certificate (minimum score required)'
      },
      {
        text: 'Fotokopi paspor',
        note: 'Valid passport copy'
      },
      {
        text: 'Surat keterangan tidak sedang menjalani hukuman',
        note: 'Letter of good conduct from local authority'
      },
      {
        text: 'Medical certificate',
        note: 'Health certificate from certified hospital'
      },
      {
        text: 'Sertifikat kesehatan (vaksin)',
        note: 'Vaccination certificate as required'
      }
    ]
  },
  {
    id: 'mext-japan',
    name: 'MEXT Japan',
    description: 'Template for Japanese Government (MEXT) scholarship applications',
    category: 'Country-Specific',
    country: 'Japan',
    createdBy: 'system',
    version: '1.0',
    items: [
      {
        text: 'Application form',
        note: 'Complete official MEXT application form'
      },
      {
        text: 'Passport copy',
        note: 'Valid passport photocopy'
      },
      {
        text: 'Academic transcript',
        note: 'Official transcripts from all universities attended'
      },
      {
        text: "Bachelor's degree certificate",
        note: 'Degree certificate or expected graduation certificate'
      },
      {
        text: 'English language certificate (TOEFL/IELTS)',
        note: 'TOEFL iBT 79+ or IELTS 6.0+ recommended'
      },
      {
        text: 'Research proposal (3-4 pages)',
        note: 'Detailed research plan for graduate studies'
      },
      {
        text: 'Health check certificate',
        note: 'Medical examination certificate using MEXT form'
      },
      {
        text: 'Recommendation letter (2)',
        note: 'Academic recommendation letters from professors'
      },
      {
        text: 'Motivation letter',
        note: 'Statement of purpose explaining study objectives'
      }
    ]
  },
  {
    id: 'chevening-uk',
    name: 'Chevening UK',
    description: 'Template for Chevening Scholarship (UK Government) applications',
    category: 'Country-Specific',
    country: 'United Kingdom',
    createdBy: 'system',
    version: '1.0',
    items: [
      {
        text: 'Online application form',
        note: 'Complete application through Chevening online system'
      },
      {
        text: 'Academic reference (2)',
        note: 'Two references from academic supervisors or professors'
      },
      {
        text: 'Professional reference (1)',
        note: 'One reference from work supervisor or employer'
      },
      {
        text: 'CV',
        note: 'Detailed curriculum vitae (max 2 pages)'
      },
      {
        text: 'Personal statement (2 essays)',
        note: 'Leadership and networking essays (500 words each)'
      },
      {
        text: 'Passport information',
        note: 'Valid passport details in application form'
      },
      {
        text: 'English language evidence',
        note: 'IELTS, TOEFL, or other approved test certificate'
      },
      {
        text: 'IELTS/TOEFL score',
        note: 'IELTS 6.5+ overall or equivalent required'
      }
    ]
  },
  {
    id: 'erasmus-europe',
    name: 'Erasmus+ Europe',
    description: 'Template for Erasmus Mundus Joint Masters scholarship applications',
    category: 'Regional',
    country: 'Europe',
    createdBy: 'system',
    version: '1.0',
    items: [
      {
        text: 'Application form',
        note: 'Program-specific online application form'
      },
      {
        text: 'CV',
        note: 'Europass CV format recommended'
      },
      {
        text: 'Motivation letter',
        note: 'Letter explaining interest in the program (1-2 pages)'
      },
      {
        text: 'Academic transcript',
        note: 'Official transcripts from all universities'
      },
      {
        text: 'Degree certificate',
        note: "Bachelor's degree certificate or proof of expected graduation"
      },
      {
        text: 'Language assessment',
        note: 'English proficiency certificate (TOEFL/IELTS/Cambridge)'
      },
      {
        text: 'Host institution acceptance letter',
        note: 'Pre-acceptance or conditional offer letter if required'
      }
    ]
  },
  {
    id: 'fulbright-usa',
    name: 'Fulbright USA',
    description: 'Template for Fulbright Foreign Student Program applications',
    category: 'Country-Specific',
    country: 'United States',
    createdBy: 'system',
    version: '1.0',
    items: [
      {
        text: 'Online application',
        note: 'Complete application through Fulbright online portal'
      },
      {
        text: 'Personal statement',
        note: 'Statement of purpose (3-5 pages)'
      },
      {
        text: 'Academic transcripts',
        note: 'Official transcripts from all institutions attended'
      },
      {
        text: 'Three recommendation letters',
        note: 'Letters from academic or professional references'
      },
      {
        text: 'Language proficiency scores',
        note: 'TOEFL iBT 80+ or IELTS 6.0+ required'
      },
      {
        text: 'CV/Resume',
        note: 'Comprehensive curriculum vitae'
      },
      {
        text: 'Degree certificate',
        note: "Bachelor's degree or equivalent"
      },
      {
        text: 'Passport copy',
        note: 'Valid passport photocopy'
      },
      {
        text: 'Study/research proposal',
        note: 'Detailed plan for graduate study or research'
      }
    ]
  },
  {
    id: 'daad-germany',
    name: 'DAAD Germany',
    description: 'Template for DAAD (German Academic Exchange Service) scholarship applications',
    category: 'Country-Specific',
    country: 'Germany',
    createdBy: 'system',
    version: '1.0',
    items: [
      {
        text: 'DAAD application form',
        note: 'Online application form specific to chosen program'
      },
      {
        text: 'CV (Europass format)',
        note: 'Curriculum vitae in Europass or tabular format'
      },
      {
        text: 'Motivation letter',
        note: 'Letter explaining reasons for study in Germany (1-2 pages)'
      },
      {
        text: 'Academic transcripts',
        note: 'Certified copies of all academic records'
      },
      {
        text: 'University degree certificates',
        note: 'All previous degree certificates'
      },
      {
        text: 'Letter of recommendation (2)',
        note: 'Academic references from professors'
      },
      {
        text: 'Language certificate',
        note: 'German (TestDaF, DSH) or English (TOEFL, IELTS) as required'
      },
      {
        text: 'University admission letter',
        note: 'Admission or conditional admission from German university'
      }
    ]
  },
  {
    id: 'australia-awards',
    name: 'Australia Awards',
    description: 'Template for Australia Awards Scholarships applications',
    category: 'Country-Specific',
    country: 'Australia',
    createdBy: 'system',
    version: '1.0',
    items: [
      {
        text: 'Online application form',
        note: 'Complete OASIS online application system'
      },
      {
        text: 'Academic transcripts',
        note: 'Official transcripts from all tertiary institutions'
      },
      {
        text: 'Degree certificates',
        note: 'Certified copies of all degree certificates'
      },
      {
        text: 'English language test results',
        note: 'IELTS Academic (minimum 6.5) or equivalent'
      },
      {
        text: 'Two referee reports',
        note: 'Academic or professional references through online system'
      },
      {
        text: 'Employment references',
        note: 'References from current and previous employers'
      },
      {
        text: 'Birth certificate',
        note: 'Official birth certificate copy'
      },
      {
        text: 'National ID or passport',
        note: 'Valid identification document'
      }
    ]
  },
  {
    id: 'commonwealth-uk',
    name: 'Commonwealth Scholarships',
    description: 'Template for Commonwealth Master\'s and PhD scholarship applications',
    category: 'Regional',
    country: 'United Kingdom',
    createdBy: 'system',
    version: '1.0',
    items: [
      {
        text: 'Application form',
        note: 'Online CSC application form'
      },
      {
        text: 'Research proposal',
        note: 'Detailed research proposal (PhD) or study objectives (Masters)'
      },
      {
        text: 'Supporting statement',
        note: 'Statement addressing impact and development objectives'
      },
      {
        text: 'Academic transcripts',
        note: 'Official transcripts from all universities'
      },
      {
        text: 'Degree certificates',
        note: 'All previous degree certificates'
      },
      {
        text: 'Two references',
        note: 'Academic or professional references'
      },
      {
        text: 'Proof of citizenship',
        note: 'Passport or national ID from eligible Commonwealth country'
      },
      {
        text: 'English language certificate',
        note: 'IELTS or TOEFL if not from English-speaking country'
      }
    ]
  },
  {
    id: 'swedish-institute',
    name: 'Swedish Institute Scholarships',
    description: 'Template for Swedish Institute Scholarships for Global Professionals',
    category: 'Country-Specific',
    country: 'Sweden',
    createdBy: 'system',
    version: '1.0',
    items: [
      {
        text: 'Online application',
        note: 'Application through Swedish Institute online portal'
      },
      {
        text: 'CV',
        note: 'Comprehensive curriculum vitae'
      },
      {
        text: 'Motivation letter',
        note: 'Letter explaining leadership and career goals'
      },
      {
        text: 'University admission',
        note: 'Proof of admission to Swedish university program'
      },
      {
        text: 'Academic transcripts',
        note: 'Official transcripts from previous degrees'
      },
      {
        text: 'Two reference letters',
        note: 'Professional or academic references'
      },
      {
        text: 'Passport copy',
        note: 'Valid passport from eligible country'
      },
      {
        text: 'English proficiency proof',
        note: 'TOEFL, IELTS, or equivalent certificate'
      }
    ]
  },
  {
    id: 'general-masters',
    name: 'General Master\'s Scholarship',
    description: 'General template for Master\'s degree scholarship applications',
    category: 'General',
    country: 'International',
    createdBy: 'system',
    version: '1.0',
    items: [
      {
        text: 'Application form',
        note: 'Complete scholarship application form'
      },
      {
        text: 'Personal statement / Motivation letter',
        note: 'Essay explaining your goals and motivations'
      },
      {
        text: 'CV / Resume',
        note: 'Detailed curriculum vitae'
      },
      {
        text: "Bachelor's degree certificate",
        note: 'Proof of completed undergraduate degree'
      },
      {
        text: 'Academic transcripts',
        note: 'Official transcripts from all universities attended'
      },
      {
        text: 'Recommendation letters (2-3)',
        note: 'Academic or professional references'
      },
      {
        text: 'English language proficiency test',
        note: 'TOEFL, IELTS, or other accepted test scores'
      },
      {
        text: 'Passport copy',
        note: 'Valid passport identification page'
      },
      {
        text: 'Research proposal (if applicable)',
        note: 'Research plan for thesis-based programs'
      }
    ]
  },
  {
    id: 'general-phd',
    name: 'General PhD Scholarship',
    description: 'General template for PhD scholarship applications',
    category: 'General',
    country: 'International',
    createdBy: 'system',
    version: '1.0',
    items: [
      {
        text: 'PhD application form',
        note: 'Complete doctoral program application'
      },
      {
        text: 'Research proposal',
        note: 'Detailed research proposal (5-10 pages)'
      },
      {
        text: 'CV / Academic resume',
        note: 'Comprehensive academic curriculum vitae'
      },
      {
        text: "Master's degree certificate",
        note: "Proof of completed Master's degree"
      },
      {
        text: "Master's thesis / dissertation",
        note: 'Copy of completed thesis or abstract'
      },
      {
        text: 'Academic transcripts (all degrees)',
        note: 'Official transcripts from undergraduate and graduate studies'
      },
      {
        text: 'Three academic references',
        note: 'Recommendation letters from professors or research supervisors'
      },
      {
        text: 'Publications list',
        note: 'List of academic publications and conference presentations'
      },
      {
        text: 'English proficiency certificate',
        note: 'TOEFL, IELTS, or equivalent test results'
      },
      {
        text: 'Writing sample',
        note: 'Sample of academic writing or published paper'
      },
      {
        text: 'Passport copy',
        note: 'Valid passport identification page'
      }
    ]
  }
];

const normalizeTemplateItem = (item) => {
  const conditional = Boolean(item?.conditional);
  let required;

  if (item?.required === undefined) {
    required = !conditional;
  } else {
    required = Boolean(item.required);
  }

  if (conditional) {
    required = false;
  }

  if (!required && !conditional) {
    required = true;
  }

  const parsedCopies = Number(item?.copies_required);
  const copies_required = Number.isFinite(parsedCopies) && parsedCopies >= 1
    ? Math.floor(parsedCopies)
    : 1;

  return {
    ...item,
    note: typeof item?.note === 'string' ? item.note : '',
    required,
    conditional,
    copies_required,
  };
};

const normalizeTemplate = (template) => ({
  ...template,
  items: (template.items || []).map(normalizeTemplateItem),
});

export const getBuiltInTemplates = () => {
  return BUILT_IN_TEMPLATES.map(normalizeTemplate);
};

export const getTemplateById = (id) => {
  const template = BUILT_IN_TEMPLATES.find((entry) => entry.id === id);
  return template ? normalizeTemplate(template) : null;
};

export const getTemplatesByCategory = (category) => {
  return BUILT_IN_TEMPLATES
    .filter((template) => template.category === category)
    .map(normalizeTemplate);
};

export const getTemplatesByCountry = (country) => {
  return BUILT_IN_TEMPLATES
    .filter((template) => template.country.toLowerCase() === country.toLowerCase())
    .map(normalizeTemplate);
};

export const searchTemplates = (searchTerm) => {
  const term = searchTerm.toLowerCase();
  return BUILT_IN_TEMPLATES
    .filter((template) =>
      template.name.toLowerCase().includes(term) ||
      template.description.toLowerCase().includes(term) ||
      template.country.toLowerCase().includes(term)
    )
    .map(normalizeTemplate);
};
