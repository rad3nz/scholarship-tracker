export const INACTIVE_DEADLINE_STATUSES = ['Submitted', 'Interview', 'Result'];

export const hasActiveDeadline = (scholarship) =>
  !INACTIVE_DEADLINE_STATUSES.includes(scholarship?.status);

export const SCHOLARSHIP_STATUS_ORDER = [
  'Not Started',
  'Preparing',
  'Submitted',
  'Interview',
  'Result',
];

export const getNextStatus = (currentStatus) => {
  const index = SCHOLARSHIP_STATUS_ORDER.indexOf(currentStatus);
  if (index === -1 || index === SCHOLARSHIP_STATUS_ORDER.length - 1) {
    return null;
  }
  return SCHOLARSHIP_STATUS_ORDER[index + 1];
};

export const calculateScholarshipProgress = (scholarshipId, checklistItems) => {
  const items = checklistItems[scholarshipId] || [];
  const total = items.length;
  const completed = items.filter(item => item.checked).length;
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
  
  return {
    completed,
    total,
    percentage
  };
};

export const getUpcomingDeadlines = (scholarships) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  return scholarships
    .filter(hasActiveDeadline)
    .map(scholarship => {
      const deadline = new Date(scholarship.deadline);
      deadline.setHours(0, 0, 0, 0);
      const daysUntilDeadline = Math.ceil((deadline - today) / (1000 * 60 * 60 * 24));
      
      return {
        ...scholarship,
        daysUntilDeadline,
        urgency: getUrgencyLevel(daysUntilDeadline)
      };
    })
    .sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
};

export const getOverallStats = (scholarships, checklistData, documents = []) => {
  const totalScholarships = scholarships.length;
  
  const byStatus = {
    'Not Started': 0,
    'Preparing': 0,
    'Submitted': 0,
    'Interview': 0,
    'Result': 0
  };
  
  scholarships.forEach(scholarship => {
    if (byStatus.hasOwnProperty(scholarship.status)) {
      byStatus[scholarship.status]++;
    }
  });
  
  let totalCompletion = 0;
  let scholarshipsWithChecklists = 0;
  
  scholarships.forEach(scholarship => {
    const items = checklistData[scholarship.id] || [];
    if (items.length > 0) {
      const progress = calculateScholarshipProgress(scholarship.id, checklistData);
      totalCompletion += progress.percentage;
      scholarshipsWithChecklists++;
    }
  });
  
  const avgCompletion = scholarshipsWithChecklists > 0 
    ? Math.round(totalCompletion / scholarshipsWithChecklists) 
    : 0;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const overdueCount = scholarships.filter(scholarship => {
    if (!hasActiveDeadline(scholarship)) return false;
    const deadline = new Date(scholarship.deadline);
    deadline.setHours(0, 0, 0, 0);
    return deadline < today;
  }).length;
  
  const documentStats = {
    total: documents.length,
    ready: documents.filter(doc => doc.status === 'Final' || doc.status === 'Uploaded').length,
    draft: documents.filter(doc => doc.status === 'Draft').length,
    notReady: documents.filter(doc => doc.status === 'NotReady').length
  };
  
  return {
    totalScholarships,
    byStatus,
    avgCompletion,
    overdueCount,
    documentStats
  };
};

export const getUrgencyLevel = (daysUntilDeadline) => {
  if (daysUntilDeadline < 0) {
    return 'overdue';
  } else if (daysUntilDeadline <= 7) {
    return 'critical';
  } else if (daysUntilDeadline <= 30) {
    return 'high';
  } else if (daysUntilDeadline <= 60) {
    return 'medium';
  } else {
    return 'low';
  }
};

export const getUrgencyColor = (urgency) => {
  const colors = {
    overdue: '#dc2626',
    critical: '#ef4444',
    high: '#f97316',
    medium: '#eab308',
    low: '#22c55e'
  };
  return colors[urgency] || colors.low;
};

export const getUrgencyBgColor = (urgency) => {
  const colors = {
    overdue: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 border-red-200 dark:border-red-800',
    critical: 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800',
    high: 'bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800',
    medium: 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800',
    low: 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800'
  };
  return colors[urgency] || colors.low;
};
