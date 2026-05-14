import React, { useState, useCallback, useRef, useEffect } from 'react';

const STATUS_OPTIONS = [
  'Not Started',
  'Preparing',
  'Submitted',
  'Interview',
  'Result',
];

const DEADLINE_PRESETS = [
  { value: 'thisWeek', label: 'This Week' },
  { value: 'thisMonth', label: 'This Month' },
  { value: 'thisQuarter', label: 'This Quarter' },
];

/**
 * FilterPanel component for filtering scholarships
 * @param {Array} scholarships - All scholarships for extracting filter options
 * @param {Object} filters - Current filter state
 * @param {Function} onFilterChange - Callback when filters change
 * @param {number} filteredCount - Number of scholarships matching filters
 * @param {number} totalCount - Total number of scholarships
 */
const FilterPanel = ({
  scholarships,
  filters,
  onFilterChange,
  filteredCount,
  totalCount,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const countryDropdownRef = useRef(null);
  const statusDropdownRef = useRef(null);

  // Get unique countries from scholarships
  const countries = [...new Set(scholarships.map((s) => s.country).filter(Boolean))].sort();

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        countryDropdownRef.current &&
        !countryDropdownRef.current.contains(event.target)
      ) {
        setShowCountryDropdown(false);
      }
      if (
        statusDropdownRef.current &&
        !statusDropdownRef.current.contains(event.target)
      ) {
        setShowStatusDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleStatusToggle = useCallback(
    (status) => {
      const currentStatuses = filters.status || [];
      let newStatuses;
      if (currentStatuses.includes(status)) {
        newStatuses = currentStatuses.filter((s) => s !== status);
      } else {
        newStatuses = [...currentStatuses, status];
      }
      onFilterChange({ ...filters, status: newStatuses });
    },
    [filters, onFilterChange]
  );

  const handleCountryToggle = useCallback(
    (country) => {
      const currentCountries = filters.country || [];
      let newCountries;
      if (currentCountries.includes(country)) {
        newCountries = currentCountries.filter((c) => c !== country);
      } else {
        newCountries = [...currentCountries, country];
      }
      onFilterChange({ ...filters, country: newCountries });
    },
    [filters, onFilterChange]
  );

  const handleDeadlinePresetChange = useCallback(
    (preset) => {
      const currentDeadline = filters.deadlineRange || {};
      if (currentDeadline.type === preset) {
        // Toggle off if clicking the same preset
        onFilterChange({ ...filters, deadlineRange: null });
      } else {
        onFilterChange({
          ...filters,
          deadlineRange: { type: preset },
        });
      }
    },
    [filters, onFilterChange]
  );

  const handleCustomDateChange = useCallback(
    (field, value) => {
      const currentDeadline = filters.deadlineRange || {};
      onFilterChange({
        ...filters,
        deadlineRange: {
          ...currentDeadline,
          type: 'custom',
          [field]: value,
        },
      });
    },
    [filters, onFilterChange]
  );

  const handleActiveOnlyToggle = useCallback(() => {
    onFilterChange({ ...filters, activeDeadlineOnly: !filters.activeDeadlineOnly });
  }, [filters, onFilterChange]);

  const handleClearAll = useCallback(() => {
    onFilterChange({});
  }, [onFilterChange]);

  const activeFilterCount =
    (filters.status?.length || 0) +
    (filters.country?.length || 0) +
    (filters.deadlineRange?.type ? 1 : 0) +
    (filters.activeDeadlineOnly ? 1 : 0);

  const selectedStatusCount = filters.status?.length || 0;
  const selectedCountryCount = filters.country?.length || 0;

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm mb-6">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-2 text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <svg
                className={`w-5 h-5 transition-transform ${
                  isExpanded ? 'rotate-90' : ''
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
              <span className="font-medium">Filters</span>
            </button>
            {activeFilterCount > 0 && (
              <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full">
                {activeFilterCount} active
              </span>
            )}
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {filteredCount} of {totalCount} scholarships
            </span>
          </div>
          {activeFilterCount > 0 && (
            <button
              onClick={handleClearAll}
              className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors"
            >
              Clear all filters
            </button>
          )}
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="p-4 space-y-4">
          {/* Active Deadlines Only Toggle */}
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={Boolean(filters.activeDeadlineOnly)}
              onChange={handleActiveOnlyToggle}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-600 dark:border-gray-500"
            />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Active deadlines only
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              (hide Submitted, Interview, Result)
            </span>
          </label>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Status
            </label>
            <div className="relative" ref={statusDropdownRef}>
              <button
                onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                className="w-full sm:w-auto px-4 py-2 text-left border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors flex items-center justify-between gap-2 min-w-[200px]"
              >
                <span>
                  {selectedStatusCount === 0
                    ? 'All statuses'
                    : `${selectedStatusCount} status${selectedStatusCount > 1 ? 'es' : ''} selected`}
                </span>
                <svg
                  className={`w-4 h-4 transition-transform ${
                    showStatusDropdown ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {showStatusDropdown && (
                <div className="absolute z-10 mt-1 w-full sm:w-48 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {STATUS_OPTIONS.map((status) => {
                    const isSelected = filters.status?.includes(status);
                    return (
                      <label
                        key={status}
                        className="flex items-center px-4 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleStatusToggle(status)}
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500"
                        />
                        <span className="ml-2 text-sm text-gray-700 dark:text-gray-200">
                          {status}
                        </span>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Selected Status Badges */}
            {filters.status && filters.status.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {filters.status.map((status) => (
                  <span
                    key={status}
                    className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full"
                  >
                    {status}
                    <button
                      onClick={() => handleStatusToggle(status)}
                      className="hover:text-blue-900 dark:hover:text-blue-100"
                    >
                      <svg
                        className="w-3 h-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Country Filter */}
          {countries.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Country
              </label>
              <div className="relative" ref={countryDropdownRef}>
                <button
                  onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                  className="w-full sm:w-auto px-4 py-2 text-left border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors flex items-center justify-between gap-2 min-w-[200px]"
                >
                  <span>
                    {selectedCountryCount === 0
                      ? 'All countries'
                      : `${selectedCountryCount} country${selectedCountryCount > 1 ? 'ies' : ''} selected`}
                  </span>
                  <svg
                    className={`w-4 h-4 transition-transform ${
                      showCountryDropdown ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {showCountryDropdown && (
                  <div className="absolute z-10 mt-1 w-full sm:w-64 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {countries.map((country) => {
                      const isSelected = filters.country?.includes(country);
                      return (
                        <label
                          key={country}
                          className="flex items-center px-4 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleCountryToggle(country)}
                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500"
                          />
                          <span className="ml-2 text-sm text-gray-700 dark:text-gray-200 truncate">
                            {country}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Selected Country Badges */}
              {filters.country && filters.country.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2 max-h-24 overflow-y-auto">
                  {filters.country.map((country) => (
                    <span
                      key={country}
                      className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-full"
                    >
                      {country}
                      <button
                        onClick={() => handleCountryToggle(country)}
                        className="hover:text-green-900 dark:hover:text-green-100"
                      >
                        <svg
                          className="w-3 h-3"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Deadline Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Deadline Range
            </label>
            <div className="flex flex-wrap gap-2 mb-3">
              {DEADLINE_PRESETS.map((preset) => {
                const isSelected = filters.deadlineRange?.type === preset.value;
                return (
                  <button
                    key={preset.value}
                    onClick={() => handleDeadlinePresetChange(preset.value)}
                    className={`px-3 py-1.5 text-sm font-medium rounded-lg border transition-colors ${
                      isSelected
                        ? 'bg-blue-100 dark:bg-blue-900 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300'
                        : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600'
                    }`}
                  >
                    {preset.label}
                  </button>
                );
              })}
            </div>

            {/* Custom Date Range */}
            <div className="flex flex-wrap gap-3 items-end">
              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                  From
                </label>
                <input
                  type="date"
                  value={filters.deadlineRange?.start || ''}
                  onChange={(e) => handleCustomDateChange('start', e.target.value)}
                  className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                  To
                </label>
                <input
                  type="date"
                  value={filters.deadlineRange?.end || ''}
                  onChange={(e) => handleCustomDateChange('end', e.target.value)}
                  className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Selected Deadline Badge */}
            {filters.deadlineRange?.type && (
              <div className="flex flex-wrap gap-2 mt-2">
                <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded-full">
                  {DEADLINE_PRESETS.find((p) => p.value === filters.deadlineRange?.type)
                    ?.label || 'Custom Range'}
                  <button
                    onClick={() =>
                      handleDeadlinePresetChange(filters.deadlineRange.type)
                    }
                    className="hover:text-purple-900 dark:hover:text-purple-100"
                  >
                    <svg
                      className="w-3 h-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterPanel;
