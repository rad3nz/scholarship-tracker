import React from 'react';

const TemplatePreview = ({ template }) => {
  if (!template) return null;

  return (
    <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
          {template.name}
        </h3>
        {template.description && (
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {template.description}
          </p>
        )}
        <div className="flex items-center gap-2 mt-2">
          {template.category && (
            <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
              {template.category}
            </span>
          )}
          {template.country && (
            <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
              {template.country}
            </span>
          )}
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {template.items?.length || 0} items
          </span>
        </div>
      </div>

      <div className="max-h-64 overflow-y-auto">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Checklist Items:
        </h4>
        <ul className="space-y-2">
          {template.items?.map((item, index) => (
            <li 
              key={index}
              className="bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 p-3"
            >
              <div className="flex items-start gap-2">
                <div className="mt-1">
                  <svg 
                    className="w-4 h-4 text-gray-400 dark:text-gray-500" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
                    />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {item.text}
                  </p>
                  {item.note && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {item.note}
                    </p>
                  )}
                  <div className="mt-2 flex items-center gap-2 flex-wrap">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                      item.conditional
                        ? 'bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200'
                        : 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
                    }`}>
                      {item.conditional ? 'Conditional' : 'Required'}
                    </span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200">
                      Copies: {item.copies_required || 1}
                    </span>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default TemplatePreview;
