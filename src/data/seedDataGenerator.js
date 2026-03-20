import { BUILT_IN_TEMPLATES } from './templates.js';

// Export a function to get seed data with templates included
export const getSeedData = () => {
  return {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    description: 'Default seed data for Scholarship Tracker app - includes built-in templates',
    data: {
      scholarships: [
        {
          id: 1,
          name: "Merit Scholarship",
          provider: "State University",
          degreeLevel: "Bachelor",
          country: "United States",
          applicationYear: 2025,
          deadline: "2025-03-15T00:00:00Z",
          status: "Not Started",
          note: "",
          requiredDocumentIds: [1, 2],
          createdAt: "2025-01-01T00:00:00Z",
          updatedAt: "2025-01-01T00:00:00Z"
        },
        {
          id: 2,
          name: "Research Grant",
          provider: "National Science Foundation",
          degreeLevel: "Graduate",
          country: "United States",
          applicationYear: 2025,
          deadline: "2025-04-30T00:00:00Z",
          status: "Preparing",
          note: "",
          requiredDocumentIds: [3],
          createdAt: "2025-01-02T00:00:00Z",
          updatedAt: "2025-01-10T00:00:00Z"
        }
      ],
      checklistItems: [
        {
          id: 1,
          scholarshipId: 1,
          text: "Complete application form",
          checked: true,
          note: "Submitted online",
          order: 0,
          createdAt: "2025-01-05T00:00:00Z",
          updatedAt: "2025-01-10T00:00:00Z"
        },
        {
          id: 2,
          scholarshipId: 1,
          text: "Gather transcripts",
          checked: false,
          note: "Need official copies",
          order: 1,
          createdAt: "2025-01-05T00:00:00Z",
          updatedAt: "2025-01-05T00:00:00Z"
        },
        {
          id: 3,
          scholarshipId: 2,
          text: "Write research proposal",
          checked: false,
          note: "",
          order: 0,
          createdAt: "2025-01-06T00:00:00Z",
          updatedAt: "2025-01-06T00:00:00Z"
        }
      ],
      documents: [
        {
          id: 1,
          name: "Academic Transcript",
          type: "Academic Transcript",
          status: "Draft",
          fileLink: "",
          notes: "Need to get official copy",
          lastUpdated: "2025-01-10T00:00:00Z",
          createdAt: "2025-01-05T00:00:00Z",
          updatedAt: "2025-01-10T00:00:00Z"
        },
        {
          id: 2,
          name: "Resume",
          type: "Resume",
          status: "Final",
          fileLink: "",
          notes: "Updated with latest experience",
          lastUpdated: "2025-01-12T00:00:00Z",
          createdAt: "2025-01-05T00:00:00Z",
          updatedAt: "2025-01-12T00:00:00Z"
        },
        {
          id: 3,
          name: "Research Proposal",
          type: "Research Proposal",
          status: "NotReady",
          fileLink: "",
          notes: "Need to write first draft",
          lastUpdated: "2025-01-06T00:00:00Z",
          createdAt: "2025-01-06T00:00:00Z",
          updatedAt: "2025-01-06T00:00:00Z"
        }
      ],
      templates: BUILT_IN_TEMPLATES.map(template => ({
        id: template.id,
        name: template.name,
        description: template.description,
        category: template.category,
        country: template.country,
        items: template.items,
        createdBy: template.createdBy,
        version: template.version
      }))
    }
  };
};