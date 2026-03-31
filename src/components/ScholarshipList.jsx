import React, { useState, useMemo, useCallback } from 'react';
import ScholarshipCard from './ScholarshipCard';
import SearchBar from './SearchBar';
import FilterPanel from './FilterPanel';
import MobileFilterDrawer from './MobileFilterDrawer';
import { searchScholarships } from '../utils/searchScholarships';
import { filterScholarships, hasActiveFilters } from '../utils/filterScholarships';

const RECENT_SEARCHES_KEY = 'scholarship_tracker.recent_searches';
const SAVED_PRESETS_KEY = 'scholarship_tracker.saved_filter_presets';

const QUICK_PRESETS = [
  {
    id: 'overdue-preparing',
    label: 'Overdue Preparing',
    query: 'status:preparing',
    filters: {},
  },
  {
    id: 'this-month-submitted',
    label: 'This Month Submitted',
    query: 'status:submitted',
    filters: { deadlineRange: { type: 'thisMonth' } },
  },
  {
    id: 'critical-week',
    label: 'Critical This Week',
    query: '',
    filters: { deadlineRange: { type: 'thisWeek' } },
  },
];

const loadFromStorage = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return parsed ?? fallback;
  } catch (error) {
    console.error('Failed loading stored search settings:', error);
    return fallback;
  }
};

const ScholarshipList = ({
  scholarships,
  onEdit,
  onDelete,
  onAddNew,
  onViewChecklist,
  checklistItemsByScholarship,
  documents = [],
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({});
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [recentSearches, setRecentSearches] = useState(() => loadFromStorage(RECENT_SEARCHES_KEY, []));
  const [savedPresets, setSavedPresets] = useState(() => loadFromStorage(SAVED_PRESETS_KEY, []));
  const [presetName, setPresetName] = useState('');

  // Apply search and filters
  const filteredScholarships = useMemo(() => {
    let result = scholarships;

    // Apply search first
    result = searchScholarships(result, searchQuery);

    // Apply filters
    result = filterScholarships(result, filters);

    return result;
  }, [scholarships, searchQuery, filters]);

  const handleDelete = useCallback((id) => {
    if (window.confirm('Are you sure you want to delete this scholarship?')) {
      onDelete(id);
    }
  }, [onDelete]);

  const persistRecentSearch = useCallback((query) => {
    const trimmed = String(query || '').trim();
    if (!trimmed) return;

    setRecentSearches((prev) => {
      const next = [trimmed, ...prev.filter((item) => item !== trimmed)].slice(0, 5);
      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const handleSearchChange = useCallback((query) => {
    setSearchQuery(query);
    persistRecentSearch(query);
  }, [persistRecentSearch]);

  const applyPreset = useCallback((preset) => {
    setSearchQuery(preset.query || '');
    setFilters(preset.filters || {});
  }, []);

  const saveCurrentPreset = useCallback(() => {
    const name = presetName.trim();
    if (!name) return;

    const preset = {
      id: `${Date.now()}`,
      label: name,
      query: searchQuery,
      filters,
    };

    setSavedPresets((prev) => {
      const next = [preset, ...prev].slice(0, 10);
      localStorage.setItem(SAVED_PRESETS_KEY, JSON.stringify(next));
      return next;
    });
    setPresetName('');
  }, [presetName, searchQuery, filters]);

  const deleteSavedPreset = useCallback((id) => {
    setSavedPresets((prev) => {
      const next = prev.filter((preset) => preset.id !== id);
      localStorage.setItem(SAVED_PRESETS_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const clearAll = useCallback(() => {
    setSearchQuery('');
    setFilters({});
  }, []);

  if (scholarships.length === 0) {
    return (
      <div className="text-center py-16">
        <svg className="mx-auto h-16 w-16 text-gray-400 dark:text-gray-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No scholarships yet</h3>
        <p className="text-gray-500 dark:text-gray-400 mb-6">Get started by adding your first scholarship application.</p>
        <button
          onClick={onAddNew}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-900 focus:ring-blue-500"
        >
          <svg className="ml-2 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add First Scholarship
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Your Scholarships
        </h2>
        <button
          onClick={onAddNew}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-900 focus:ring-blue-500 transition-colors"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Scholarship
        </button>
      </div>

      {/* Search Bar */}
      <div className="mb-4">
        <SearchBar query={searchQuery} onSearch={handleSearchChange} />
      </div>

      <div className="mb-4 space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          {QUICK_PRESETS.map((preset) => (
            <button
              key={preset.id}
              onClick={() => applyPreset(preset)}
              className="px-3 py-1.5 text-xs font-medium rounded-full border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              {preset.label}
            </button>
          ))}
          <button
            onClick={() => setIsMobileFilterOpen(true)}
            className="md:hidden px-3 py-1.5 text-xs font-medium rounded-full border border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
          >
            Open Filters
          </button>
        </div>

        {(recentSearches.length > 0 || savedPresets.length > 0) && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3">
              <p className="text-xs font-semibold text-gray-600 dark:text-gray-300 mb-2">Recent Searches</p>
              <div className="flex flex-wrap gap-2">
                {recentSearches.map((query) => (
                  <button
                    key={query}
                    onClick={() => setSearchQuery(query)}
                    className="px-2 py-1 text-xs rounded border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    {query}
                  </button>
                ))}
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3">
              <p className="text-xs font-semibold text-gray-600 dark:text-gray-300 mb-2">Saved Presets</p>
              <div className="space-y-2 max-h-24 overflow-y-auto">
                {savedPresets.map((preset) => (
                  <div key={preset.id} className="flex items-center justify-between gap-2">
                    <button
                      onClick={() => applyPreset(preset)}
                      className="text-xs text-left text-blue-600 dark:text-blue-400 hover:underline truncate"
                    >
                      {preset.label}
                    </button>
                    <button
                      onClick={() => deleteSavedPreset(preset.id)}
                      className="text-xs text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
              <div className="mt-3 flex items-center gap-2">
                <input
                  type="text"
                  value={presetName}
                  onChange={(e) => setPresetName(e.target.value)}
                  placeholder="Save current as..."
                  className="flex-1 px-2 py-1.5 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                <button
                  onClick={saveCurrentPreset}
                  className="px-2.5 py-1.5 text-xs rounded bg-blue-600 text-white hover:bg-blue-700"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="hidden md:block">
        <FilterPanel
          scholarships={scholarships}
          filters={filters}
          onFilterChange={setFilters}
          filteredCount={filteredScholarships.length}
          totalCount={scholarships.length}
        />
      </div>

      <MobileFilterDrawer
        isOpen={isMobileFilterOpen}
        onClose={() => setIsMobileFilterOpen(false)}
        scholarships={scholarships}
        onFilterChange={setFilters}
        currentFilters={filters}
        quickPresets={QUICK_PRESETS}
        onApplyPreset={applyPreset}
      />

      {/* Results count */}
      {searchQuery || hasActiveFilters(filters) ? (
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Showing {filteredScholarships.length} of {scholarships.length} scholarships
        </p>
      ) : null}

      {/* No results message */}
      {filteredScholarships.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
          <svg className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No scholarships match your filters</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">Try adjusting your search or filter criteria.</p>
          <button
            onClick={clearAll}
            className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
          >
            Clear all filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredScholarships.map((scholarship) => (
            <ScholarshipCard
              key={scholarship.id}
              scholarship={scholarship}
              onEdit={onEdit}
              onDelete={() => handleDelete(scholarship.id)}
              onViewChecklist={onViewChecklist}
              checklistItems={checklistItemsByScholarship?.[scholarship.id] || []}
              documents={documents}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ScholarshipList;
