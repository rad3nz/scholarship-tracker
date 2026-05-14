import React from 'react';
import { getNextStatus } from '../utils/stats';

const statusColors = {
  'Not Started': 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200',
  Preparing: 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200',
  Submitted: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200',
  Interview: 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200',
  Result: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200',
};

const documentStatusDots = {
  NotReady: 'bg-gray-400 dark:bg-gray-500',
  Draft: 'bg-yellow-500 dark:bg-yellow-600',
  Final: 'bg-blue-500 dark:bg-blue-400',
  Uploaded: 'bg-green-500 dark:bg-green-400',
};

const completeDocumentStatuses = new Set(['Final', 'Uploaded']);

const ScholarshipCard = ({
  scholarship,
  onEdit,
  onDelete,
  onViewChecklist,
  checklistItems,
  documents = [],
  onAdvanceStatus,
}) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const deadline = new Date(scholarship.deadline);
  const today = new Date();
  const daysUntilDeadline = Math.ceil((deadline - today) / (1000 * 60 * 60 * 24));

  const deadlineClass =
    daysUntilDeadline < 7
      ? 'text-red-600 dark:text-red-400 font-semibold'
      : daysUntilDeadline < 30
        ? 'text-yellow-600 dark:text-yellow-400 font-semibold'
        : 'text-gray-600 dark:text-gray-300';

  const completedItems = checklistItems?.filter((item) => item.checked).length || 0;
  const totalItems = checklistItems?.length || 0;
  const progress = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  const requiredDocumentIds = scholarship.requiredDocumentIds || [];
  const requiredDocumentStatuses = requiredDocumentIds.map((id) => {
    const doc = documents.find((d) => d.id === id);
    return {
      id,
      status: doc?.status || 'NotReady',
    };
  });

  const totalDocs = requiredDocumentIds.length;
  const readyDocs = requiredDocumentStatuses.filter((d) => completeDocumentStatuses.has(d.status)).length;
  const anyNotReady = requiredDocumentStatuses.some((d) => d.status === 'NotReady');
  const allDocsReady = totalDocs > 0 && readyDocs === totalDocs;

  const documentsBadgeClass = allDocsReady
    ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
    : anyNotReady
      ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
      : 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200';

  const documentsBadgeText = allDocsReady
    ? 'All documents ready'
    : `${readyDocs} of ${totalDocs} documents ready`;

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 p-5">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{scholarship.name}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">{scholarship.provider}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[scholarship.status]}`}>
            {scholarship.status}
          </span>
          {onAdvanceStatus && getNextStatus(scholarship.status) && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAdvanceStatus(scholarship.id, scholarship.status);
              }}
              className="px-2 py-1 rounded text-xs font-medium border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 dark:focus:ring-offset-gray-800"
              title={`Advance to ${getNextStatus(scholarship.status)}`}
              aria-label={`Advance ${scholarship.name} to ${getNextStatus(scholarship.status)}`}
            >
              → {getNextStatus(scholarship.status)}
            </button>
          )}
        </div>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center text-sm">
          <svg className="w-4 h-4 mr-2 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"
            />
          </svg>
          <span className="text-gray-600 dark:text-gray-300">
            {scholarship.degreeLevel} · {scholarship.country}
          </span>
        </div>
        <div className="flex items-center text-sm">
          <svg className="w-4 h-4 mr-2 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <span className={deadlineClass}>Deadline: {formatDate(scholarship.deadline)}</span>
          {daysUntilDeadline < 0 && <span className="ml-2 text-red-600 dark:text-red-400 text-xs">(Passed)</span>}
          {daysUntilDeadline >= 0 && daysUntilDeadline < 30 && (
            <span className="ml-2 text-gray-500 dark:text-gray-400 text-xs">({daysUntilDeadline} days)</span>
          )}
        </div>
        <div className="flex items-center text-sm">
          <svg className="w-4 h-4 mr-2 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
            />
          </svg>
          <span className="text-gray-600 dark:text-gray-300">{scholarship.applicationYear}</span>
        </div>
      </div>

      {totalDocs > 0 && (
        <div className="mb-4 pt-3 border-t border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600 dark:text-gray-300">Documents</span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${documentsBadgeClass}`}>
              {documentsBadgeText}
            </span>
          </div>
          <div className="flex flex-wrap gap-1">
            {requiredDocumentStatuses.map((doc) => (
              <span
                key={doc.id}
                className={`w-2.5 h-2.5 rounded-full ${
                  documentStatusDots[doc.status] || documentStatusDots.NotReady
                }`}
                title={doc.status}
              ></span>
            ))}
          </div>
        </div>
      )}

      {totalItems > 0 && (
        <div className="mb-4 pt-3 border-t border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600 dark:text-gray-300">
              {completedItems} of {totalItems} requirements completed
            </span>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-blue-600 dark:bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      )}

      <div className="flex gap-2 pt-3 border-t border-gray-100 dark:border-gray-700">
        <button
          onClick={() => onViewChecklist(scholarship.id)}
          className="flex-1 px-3 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 dark:focus:ring-offset-gray-800"
        >
          View Checklist
        </button>
        <button
          onClick={() => onEdit(scholarship)}
          className="flex-1 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 dark:focus:ring-offset-gray-800"
        >
          Edit
        </button>
        <button
          onClick={() => onDelete(scholarship.id)}
          className="flex-1 px-3 py-2 text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1 dark:focus:ring-offset-gray-800"
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export default ScholarshipCard;
