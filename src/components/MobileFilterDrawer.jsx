import { useState, useEffect } from 'react';

const DEADLINE_PRESETS = [
  { value: 'thisWeek', label: 'This Week' },
  { value: 'thisMonth', label: 'This Month' },
  { value: 'thisQuarter', label: 'This Quarter' },
];

const MobileFilterDrawer = ({ 
  isOpen, 
  onClose, 
  scholarships, 
  onFilterChange, 
  currentFilters,
  quickPresets = [],
  onApplyPreset,
  className = ''
}) => {
  const [tempFilters, setTempFilters] = useState({
    status: [],
    country: [],
    deadlineRange: null,
    ...currentFilters
  });

  useEffect(() => {
    if (isOpen) {
      setTempFilters(currentFilters);
    }
  }, [isOpen, currentFilters]);

  const availableCountries = [...new Set(scholarships.map(s => s.country).filter(Boolean))].sort();

  const handleStatusToggle = (status) => {
    setTempFilters(prev => ({
      ...prev,
      status: prev.status.includes(status)
        ? prev.status.filter(s => s !== status)
        : [...prev.status, status]
    }));
  };

  const handleCountryToggle = (country) => {
    setTempFilters(prev => ({
      ...prev,
      country: prev.country.includes(country)
        ? prev.country.filter(c => c !== country)
        : [...prev.country, country]
    }));
  };

  const handleApply = () => {
    onFilterChange(tempFilters);
    onClose();
  };

  const handleDeadlinePresetChange = (preset) => {
    setTempFilters((prev) => {
      if (prev.deadlineRange?.type === preset) {
        return {
          ...prev,
          deadlineRange: null,
        };
      }
      return {
        ...prev,
        deadlineRange: { type: preset },
      };
    });
  };

  const handleReset = () => {
    const resetFilters = {
      status: [],
      country: [],
      deadlineRange: null,
    };
    setTempFilters(resetFilters);
    onFilterChange(resetFilters);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      <div 
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />
      <div className={`absolute bottom-0 left-0 right-0 bg-white dark:bg-gray-800 rounded-t-2xl max-h-[80vh] overflow-hidden ${className}`}>
        {/* Handle bar */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-12 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Filters</h3>
          <button
            onClick={handleReset}
            className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
          >
            Reset All
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[60vh]"><div className="p-4 space-y-6">
            {quickPresets.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Quick Presets</h4>
                <div className="flex flex-wrap gap-2">
                  {quickPresets.map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => {
                        if (onApplyPreset) {
                          onApplyPreset(preset);
                        }
                        onClose();
                      }}
                      className="px-3 py-1.5 text-xs rounded-full border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Status Filter */}
            <div>
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Status</h4>
              <div className="space-y-2">
                {['Not Started', 'Preparing', 'Submitted', 'Interview', 'Result'].map(status => (
                  <label key={status} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                    <input
                      type="checkbox"
                      checked={tempFilters.status.includes(status)}
                      onChange={() => handleStatusToggle(status)}
                      className="w-5 h-5 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-gray-900 dark:text-gray-100">{status}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Country Filter */}
            {availableCountries.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Country</h4>
                <div className="max-h-40 overflow-y-auto space-y-2">
                  {availableCountries.map(country => (
                    <label key={country} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                      <input
                        type="checkbox"
                        checked={tempFilters.country.includes(country)}
                        onChange={() => handleCountryToggle(country)}
                        className="w-5 h-5 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-gray-900 dark:text-gray-100">{country}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            <div>
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Deadline</h4>
              <div className="flex flex-wrap gap-2">
                {DEADLINE_PRESETS.map((preset) => {
                  const selected = tempFilters.deadlineRange?.type === preset.value;
                  return (
                    <button
                      key={preset.value}
                      onClick={() => handleDeadlinePresetChange(preset.value)}
                      className={`px-3 py-1.5 text-xs rounded-full border ${
                        selected
                          ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700'
                          : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200'
                      }`}
                    >
                      {preset.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div></div>

        {/* Footer Buttons */}
        <div className="flex gap-3 p-4 pb-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            className="flex-1 px-4 py-3 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
};

export default MobileFilterDrawer;