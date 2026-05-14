import React, { useMemo } from 'react';
import { getUrgencyLevel, hasActiveDeadline } from '../utils/stats';
import { getDaysUntilDeadline, getCalendarUrgencyColor } from '../utils/calendarUtils';

/**
 * CalendarDay component - Individual day cell in the calendar
 * @param {Object} day - Day object with year, month, day, isCurrentMonth, isPadding
 * @param {Array} scholarships - Scholarships due on this day
 * @param {Function} onClick - Click handler for the day
 * @param {boolean} isToday - Whether this day is today
 */
const CalendarDay = ({ day, scholarships, onClick, isToday }) => {
  const hasScholarships = scholarships && scholarships.length > 0;

  // Get urgency color for scholarships
  const urgencyColor = useMemo(() => {
    if (!hasScholarships) return null;
    const activeScholarships = scholarships.filter(hasActiveDeadline);
    if (activeScholarships.length === 0) {
      return getCalendarUrgencyColor('low');
    }
    const urgencies = activeScholarships.map((s) => {
      const days = getDaysUntilDeadline(s.deadline);
      return getUrgencyLevel(days);
    });
    const mostUrgent = urgencies.reduce((a, b) => {
      const levels = { overdue: 0, critical: 1, high: 2, medium: 3, low: 4 };
      return levels[a] < levels[b] ? a : b;
    }, 'low');
    return getCalendarUrgencyColor(mostUrgent);
  }, [scholarships, hasScholarships]);

  const dayClass = `
    relative min-h-[80px] p-1 border border-gray-100 dark:border-gray-700 transition-colors
    ${day.isPadding ? 'bg-gray-50 dark:bg-gray-800/50' : 'bg-white dark:bg-gray-800'}
    ${!day.isCurrentMonth ? 'text-gray-400 dark:text-gray-500' : 'text-gray-900 dark:text-white'}
    ${isToday ? 'ring-2 ring-blue-500 dark:ring-blue-400 ring-inset z-10' : ''}
    ${hasScholarships ? 'cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20' : ''}
  `;

  return (
    <div className={dayClass} onClick={() => hasScholarships && onClick(day, scholarships)}>
      {/* Day number */}
      <div
        className={`
          text-sm font-medium mb-1
          ${isToday ? 'text-blue-600 dark:text-blue-400' : ''}
          ${day.isPadding ? 'text-gray-400 dark:text-gray-500' : ''}
        `}
      >
        {day.day}
      </div>

      {/* Scholarship indicators */}
      {hasScholarships && (
        <div className="space-y-1">
          {/* Show up to 2 scholarships, rest as count */}
          {scholarships.slice(0, 2).map((scholarship, index) => {
            const isActive = hasActiveDeadline(scholarship);
            const slipStyle = isActive
              ? {
                  backgroundColor: `${urgencyColor}20`,
                  color: urgencyColor,
                  borderLeft: `2px solid ${urgencyColor}`,
                }
              : {
                  backgroundColor: 'rgba(156, 163, 175, 0.15)',
                  color: '#6b7280',
                  borderLeft: '2px solid #9ca3af',
                  textDecoration: 'line-through',
                  opacity: 0.7,
                };
            return (
              <div
                key={scholarship.id}
                className="text-xs truncate px-1 py-0.5 rounded"
                style={slipStyle}
                title={`${scholarship.name}${isActive ? '' : ` (${scholarship.status})`}`}
              >
                {scholarship.name.length > 12
                  ? scholarship.name.substring(0, 12) + '...'
                  : scholarship.name}
              </div>
            );
          })}
          {scholarships.length > 2 && (
            <div
              className="text-xs font-medium text-center rounded"
              style={{
                backgroundColor: `${urgencyColor}20`,
                color: urgencyColor,
              }}
            >
              +{scholarships.length - 2} more
            </div>
          )}
        </div>
      )}

      {/* Scholarship count indicator */}
      {hasScholarships && scholarships.length > 0 && (() => {
        const activeCount = scholarships.filter(hasActiveDeadline).length;
        const badgeColor = activeCount === 0 ? '#9ca3af' : urgencyColor;
        return (
          <div
            className="absolute bottom-1 right-1 w-5 h-5 flex items-center justify-center rounded-full text-xs font-medium"
            style={{
              backgroundColor: badgeColor,
              color: 'white',
            }}
            title={
              activeCount === scholarships.length
                ? `${scholarships.length} scholarship${scholarships.length === 1 ? '' : 's'}`
                : `${activeCount} active of ${scholarships.length} total`
            }
          >
            {scholarships.length}
          </div>
        );
      })()}
    </div>
  );
};

export default CalendarDay;
