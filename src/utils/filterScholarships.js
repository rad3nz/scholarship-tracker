import { getUrgencyLevel, hasActiveDeadline } from './stats';

/**
 * Filter scholarships by multiple criteria
 * @param {Array} scholarships - Array of scholarship objects
 * @param {Object} filters - Filter object containing status, country, deadlineRange
 * @param {Array} [filters.status] - Array of statuses to filter by (multi-select, OR logic within status)
 * @param {Array} [filters.country] - Array of countries to filter by (multi-select, OR logic within country)
 * @param {Object} [filters.deadlineRange] - Deadline range filter
 * @param {string} [filters.deadlineRange.type] - Type of range: 'thisWeek', 'thisMonth', 'thisQuarter', 'custom'
 * @param {string} [filters.deadlineRange.start] - Start date for custom range (ISO string)
 * @param {string} [filters.deadlineRange.end] - End date for custom range (ISO string)
 * @returns {Array} Filtered scholarships matching all criteria
 */
export const filterScholarships = (scholarships, filters = {}) => {
  let filtered = [...scholarships];

  // Filter to active-deadline scholarships only
  if (filters.activeDeadlineOnly) {
    filtered = filtered.filter(hasActiveDeadline);
  }

  // Filter by status (OR logic within status - show scholarships matching any selected status)
  if (filters.status && filters.status.length > 0) {
    filtered = filtered.filter((scholarship) =>
      filters.status.includes(scholarship.status)
    );
  }

  // Filter by country (OR logic within country - show scholarships matching any selected country)
  if (filters.country && filters.country.length > 0) {
    filtered = filtered.filter((scholarship) =>
      filters.country.includes(scholarship.country)
    );
  }

  // Filter by deadline range
  if (filters.deadlineRange) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const rangeType = filters.deadlineRange.type;
    let startDate, endDate;

    switch (rangeType) {
      case 'thisWeek': {
        // This week: from today to end of current week (Sunday)
        startDate = new Date(today);
        const dayOfWeek = today.getDay();
        const daysUntilSunday = 7 - dayOfWeek;
        endDate = new Date(today);
        endDate.setDate(today.getDate() + daysUntilSunday);
        endDate.setHours(23, 59, 59, 999);
        break;
      }
      case 'thisMonth': {
        // This month: from today to end of current month
        startDate = new Date(today);
        endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        endDate.setHours(23, 59, 59, 999);
        break;
      }
      case 'thisQuarter': {
        // This quarter: from today to end of current quarter
        startDate = new Date(today);
        const currentQuarter = Math.floor(today.getMonth() / 3);
        endDate = new Date(today.getFullYear(), (currentQuarter + 1) * 3, 0);
        endDate.setHours(23, 59, 59, 999);
        break;
      }
      case 'custom': {
        // Custom range from filters
        startDate = filters.deadlineRange.start
          ? new Date(filters.deadlineRange.start)
          : new Date(today);
        startDate.setHours(0, 0, 0, 0);
        endDate = filters.deadlineRange.end
          ? new Date(filters.deadlineRange.end)
          : new Date(today);
        endDate.setHours(23, 59, 59, 999);
        break;
      }
      default:
        // No deadline filter
        return filtered;
    }

    if (startDate && endDate) {
      filtered = filtered.filter((scholarship) => {
        const deadline = new Date(scholarship.deadline);
        deadline.setHours(0, 0, 0, 0);
        return deadline >= startDate && deadline <= endDate;
      });
    }
  }

  return filtered;
};

/**
 * Get count of scholarships by urgency level
 * @param {Array} scholarships - Array of scholarship objects
 * @returns {Object} Object with urgency levels as keys and counts as values
 */
export const getScholarshipsByUrgency = (scholarships) => {
  const byUrgency = {
    overdue: 0,
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  scholarships.forEach((scholarship) => {
    const deadline = new Date(scholarship.deadline);
    deadline.setHours(0, 0, 0, 0);
    const daysUntilDeadline = Math.ceil((deadline - today) / (1000 * 60 * 60 * 24));
    const urgency = getUrgencyLevel(daysUntilDeadline);
    byUrgency[urgency]++;
  });

  return byUrgency;
};

/**
 * Group scholarships by deadline date
 * @param {Array} scholarships - Array of scholarship objects
 * @returns {Object} Object with date strings as keys and arrays of scholarships as values
 */
export const groupScholarshipsByDate = (scholarships) => {
  const grouped = {};

  scholarships.forEach((scholarship) => {
    if (scholarship.deadline) {
      const dateKey = new Date(scholarship.deadline).toISOString().split('T')[0];
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(scholarship);
    }
  });

  return grouped;
};

/**
 * Check if any filters are active
 * @param {Object} filters - Filter object
 * @returns {boolean} True if any filters are active
 */
export const hasActiveFilters = (filters) => {
  if (!filters) return false;

  const hasStatusFilter = filters.status && filters.status.length > 0;
  const hasCountryFilter = filters.country && filters.country.length > 0;
  const hasDeadlineFilter = filters.deadlineRange && filters.deadlineRange.type;
  const hasActiveOnly = Boolean(filters.activeDeadlineOnly);

  return hasStatusFilter || hasCountryFilter || hasDeadlineFilter || hasActiveOnly;
};

/**
 * Get count of active filters
 * @param {Object} filters - Filter object
 * @returns {number} Number of active filter types
 */
export const getActiveFilterCount = (filters) => {
  if (!filters) return 0;

  let count = 0;
  if (filters.status && filters.status.length > 0) count++;
  if (filters.country && filters.country.length > 0) count++;
  if (filters.deadlineRange && filters.deadlineRange.type) count++;
  if (filters.activeDeadlineOnly) count++;

  return count;
};
