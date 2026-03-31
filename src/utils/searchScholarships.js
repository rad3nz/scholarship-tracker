/**
 * Search scholarships by query across multiple fields
 * @param {Array} scholarships - Array of scholarship objects
 * @param {string} query - Search query string
 * @returns {Array} Filtered scholarships matching the query
 */
const parseQueryTokens = (query) => {
  const terms = query
    .toLowerCase()
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  const fieldTerms = {
    status: [],
    country: [],
    provider: [],
  };
  const generalTerms = [];

  terms.forEach((term) => {
    if (term.startsWith('status:')) {
      fieldTerms.status.push(term.slice(7));
      return;
    }
    if (term.startsWith('country:')) {
      fieldTerms.country.push(term.slice(8));
      return;
    }
    if (term.startsWith('provider:')) {
      fieldTerms.provider.push(term.slice(9));
      return;
    }
    generalTerms.push(term);
  });

  return { fieldTerms, generalTerms };
};

const textIncludes = (value, searchTerm) =>
  String(value || '').toLowerCase().includes(searchTerm);

export const searchScholarships = (scholarships, query) => {
  if (!query || !query.trim()) {
    return scholarships;
  }

  const { fieldTerms, generalTerms } = parseQueryTokens(query);

  return scholarships.filter((scholarship) => {
    const statusText = String(scholarship.status || '').toLowerCase();
    const countryText = String(scholarship.country || '').toLowerCase();
    const providerText = String(scholarship.provider || '').toLowerCase();

    const fieldMatch =
      (fieldTerms.status.length === 0 || fieldTerms.status.some((term) => statusText.includes(term))) &&
      (fieldTerms.country.length === 0 || fieldTerms.country.some((term) => countryText.includes(term))) &&
      (fieldTerms.provider.length === 0 || fieldTerms.provider.some((term) => providerText.includes(term)));

    if (!fieldMatch) {
      return false;
    }

    if (generalTerms.length === 0) {
      return true;
    }

    const searchableFields = [
      scholarship.name,
      scholarship.provider,
      scholarship.country,
      scholarship.status,
      scholarship.note,
      scholarship.degree,
    ];

    return generalTerms.every((term) =>
      searchableFields.some((value) => textIncludes(value, term))
    );
  });
};

/**
 * Get unique countries from scholarships
 * @param {Array} scholarships - Array of scholarship objects
 * @returns {Array} Sorted array of unique countries
 */
export const getUniqueCountries = (scholarships) => {
  const countries = new Set();
  scholarships.forEach((scholarship) => {
    if (scholarship.country) {
      countries.add(scholarship.country);
    }
  });
  return Array.from(countries).sort();
};

/**
 * Get available statuses from scholarships
 * @param {Array} scholarships - Array of scholarship objects
 * @returns {Array} Sorted array of unique statuses
 */
export const getUniqueStatuses = (scholarships) => {
  const statuses = new Set();
  scholarships.forEach((scholarship) => {
    if (scholarship.status) {
      statuses.add(scholarship.status);
    }
  });
  return Array.from(statuses).sort();
};
