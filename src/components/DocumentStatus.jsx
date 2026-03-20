import React from 'react';

const DocumentStatus = ({ documents }) => {
  const getStatusCounts = () => {
    const counts = {
      NotReady: 0,
      Draft: 0,
      Final: 0,
      Uploaded: 0
    };
    
    documents.forEach(doc => {
      if (counts.hasOwnProperty(doc.status)) {
        counts[doc.status]++;
      }
    });
    
    return counts;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'NotReady':
        return 'bg-gray-500';
      case 'Draft':
        return 'bg-yellow-500';
      case 'Final':
        return 'bg-blue-500';
      case 'Uploaded':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusLabel = (status) => {
    const labels = {
      NotReady: 'Not Ready',
      Draft: 'Draft',
      Final: 'Final',
      Uploaded: 'Uploaded'
    };
    return labels[status] || status;
  };

  const calculateProgress = () => {
    if (documents.length === 0) return 0;
    const completeCount = documents.filter(doc => doc.status === 'Final' || doc.status === 'Uploaded').length;
    return Math.round((completeCount / documents.length) * 100);
  };

  const statusCounts = getStatusCounts();
  const progress = calculateProgress();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Document Overview</h2>
        <span className="text-2xl font-bold text-gray-900 dark:text-white">
          {documents.length}
        </span>
      </div>

      <div className="space-y-3 mb-6">
        {Object.entries(statusCounts).map(([status, count]) => {
          if (count === 0) return null;
          
          const percentage = documents.length > 0 ? Math.round((count / documents.length) * 100) : 0;
          
          return (
            <div key={status} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${getStatusColor(status)}`} />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                  {getStatusLabel(status)}
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${getStatusColor(status)}`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-white min-w-8 text-right">
                  {count}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Overall Progress</span>
          <span className="text-sm font-bold text-gray-900 dark:text-white">{progress}%</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
          <div
            className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4 text-center">
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
          <p className="text-xs text-gray-500 dark:text-gray-400">Total Documents</p>
          <p className="text-lg font-bold text-gray-900 dark:text-white">{documents.length}</p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
          <p className="text-xs text-gray-500 dark:text-gray-400">Ready to Use</p>
          <p className="text-lg font-bold text-green-600 dark:text-green-400">
            {statusCounts.Final + statusCounts.Uploaded}
          </p>
        </div>
      </div>
    </div>
  );
};

export default DocumentStatus;