import React, { useState, useMemo, useCallback } from 'react';
import {
  getCalendarDays,
  getMonthName,
  getPreviousMonth,
  getNextMonth,
  getToday,
  getShortDayName,
  isToday,
} from '../utils/calendarUtils';
import { groupScholarshipsByDate } from '../utils/filterScholarships';
import { hasActiveDeadline } from '../utils/stats';
import CalendarDay from './CalendarDay';
import CalendarDetail from './CalendarDetail';
import CalendarLegend from './CalendarLegend';

/**
 * CalendarView component - Main calendar view for displaying scholarship deadlines
 * @param {Array} scholarships - Array of scholarship objects
 * @param {Function} onViewChecklist - Handler to view scholarship checklist
 * @param {Function} onEdit - Handler to edit scholarship
 */
const CalendarView = ({ scholarships, onViewChecklist, onEdit }) => {
  const [currentDate, setCurrentDate] = useState(getToday());
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedScholarships, setSelectedScholarships] = useState([]);

  const today = getToday();

  // Group scholarships by date for quick lookup
  const scholarshipsByDate = useMemo(
    () => groupScholarshipsByDate(scholarships),
    [scholarships]
  );

  // Generate calendar days for current month
  const calendarDays = useMemo(
    () => getCalendarDays(currentDate.year, currentDate.month),
    [currentDate.year, currentDate.month]
  );

  const handlePreviousMonth = useCallback(() => {
    setCurrentDate((prev) => getPreviousMonth(prev.year, prev.month));
  }, []);

  const handleNextMonth = useCallback(() => {
    setCurrentDate((prev) => getNextMonth(prev.year, prev.month));
  }, []);

  const handleToday = useCallback(() => {
    setCurrentDate(getToday());
  }, []);

  const handleDayClick = useCallback((dayInfo, dayScholarships) => {
    setSelectedDate(dayInfo);
    setSelectedScholarships(dayScholarships);
  }, []);

  const handleCloseDetail = useCallback(() => {
    setSelectedDate(null);
    setSelectedScholarships([]);
  }, []);

  const handleViewChecklist = useCallback(
    (scholarshipId) => {
      handleCloseDetail();
      onViewChecklist(scholarshipId);
    },
    [onViewChecklist, handleCloseDetail]
  );

  const handleEdit = useCallback(
    (scholarship) => {
      handleCloseDetail();
      onEdit(scholarship);
    },
    [onEdit, handleCloseDetail]
  );

  return (
    <div className="space-y-6">
      {/* Header with navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Calendar
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePreviousMonth}
              className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              aria-label="Previous month"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <button
              onClick={handleToday}
              className="px-3 py-1.5 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
            >
              Today
            </button>
            <button
              onClick={handleNextMonth}
              className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              aria-label="Next month"
            >
              <svg
                className="w-5 h-5"
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
            </button>
          </div>
        </div>
        <div className="text-lg font-medium text-gray-700 dark:text-gray-300">
          {getMonthName(currentDate.month)} {currentDate.year}
        </div>
      </div>

      {/* Legend */}
      <CalendarLegend scholarships={scholarships} />

      {/* Calendar Grid */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
        {/* Day headers */}
        <div className="grid grid-cols-7 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
          {[0, 1, 2, 3, 4, 5, 6].map((day) => (
            <div
              key={day}
              className="px-2 py-3 text-center text-sm font-medium text-gray-600 dark:text-gray-400"
            >
              {getShortDayName(day)}
            </div>
          ))}
        </div>

        {/* Calendar days */}
        <div className="grid grid-cols-7">
          {calendarDays.map((day, index) => {
            const dateKey = `${day.year}-${String(day.month + 1).padStart(2, '0')}-${String(day.day).padStart(2, '0')}`;
            const dayScholarships = scholarshipsByDate[dateKey] || [];
            const isTodayDate = day.isCurrentMonth && isToday(day.year, day.month, day.day);

            return (
              <CalendarDay
                key={index}
                day={day}
                scholarships={dayScholarships}
                onClick={handleDayClick}
                isToday={isTodayDate}
              />
            );
          })}
        </div>
      </div>

      {/* Stats summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {scholarships.length}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Total Scholarships
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <div className="text-2xl font-bold text-red-600 dark:text-red-400">
            {scholarships.filter((s) => {
              if (!hasActiveDeadline(s)) return false;
              const deadline = new Date(s.deadline);
              deadline.setHours(0, 0, 0, 0);
              return deadline < new Date(today.year, today.month, today.day);
            }).length}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Overdue
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
            {scholarships.filter((s) => {
              if (!hasActiveDeadline(s)) return false;
              const days = Math.ceil(
                (new Date(s.deadline) - new Date(today.year, today.month, today.day)) /
                  (1000 * 60 * 60 * 24)
              );
              return days >= 0 && days <= 7;
            }).length}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Due This Week
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {scholarships.filter((s) => {
              if (!hasActiveDeadline(s)) return false;
              const deadline = new Date(s.deadline);
              deadline.setHours(0, 0, 0, 0);
              return deadline >= new Date(today.year, today.month, today.day);
            }).length}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Upcoming
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      <CalendarDetail
        scholarships={selectedScholarships}
        selectedDate={selectedDate}
        onClose={handleCloseDetail}
        onViewChecklist={handleViewChecklist}
        onEdit={handleEdit}
      />
    </div>
  );
};

export default CalendarView;
