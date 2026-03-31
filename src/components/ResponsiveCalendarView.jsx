import { useState, useMemo } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, startOfWeek, endOfWeek, subMonths, addMonths } from 'date-fns';
import { formatDateDisplay } from '../utils/calendarUtils';
import { groupScholarshipsByDate } from '../utils/filterScholarships';

const ResponsiveCalendarView = ({ scholarships, onViewChecklist, onEdit }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  
  const scholarshipGroups = useMemo(() => {
    return groupScholarshipsByDate(scholarships);
  }, [scholarships]);

  const navigatePrev = () => {
    setCurrentDate(subMonths(currentDate, 1));
    setSelectedDate(null);
  };

  const navigateNext = () => {
    setCurrentDate(addMonths(currentDate, 1));
    setSelectedDate(null);
  };

  const navigateToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(null);
  };

  const scholarshipsForDate = (date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return scholarshipGroups[dateStr] || [];
  };

  const getUrgencyColor = (date) => {
    const today = new Date();
    const daysDiff = Math.ceil((date - today) / (1000 * 60 * 60 * 24));
    
    if (daysDiff < 0) return 'bg-red-500';
    if (daysDiff <= 7) return 'bg-orange-500';
    if (daysDiff <= 30) return 'bg-yellow-500';
    if (daysDiff <= 60) return 'bg-yellow-700';
    return 'bg-green-500';
  };

  return (
    <div className="flex flex-col h-full md:h-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
        <button
          onClick={navigatePrev}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white text-center min-w-[120px]">
          {format(currentDate, 'MMMM yyyy')}
        </h3>
        
        <div className="flex items-center space-x-1">
          <button
            onClick={navigateToday}
            className="px-3 py-1 text-sm font-medium text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900 transition-colors"
          >
            Today
          </button>
          <button
            onClick={navigateNext}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Desktop Calendar Grid */}
      <div className="hidden md:block">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
          {/* Weekday Headers */}
          <div className="grid grid-cols-7 border-b border-gray-200 dark:border-gray-700">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="px-2 py-3 text-center">
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {day}
                </div>
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7">
            {calendarDays.map(day => {
              const dayScholarships = scholarshipsForDate(day);
              const isCurrentMonth = isSameMonth(day, currentDate);
              const isSelected = selectedDate && isSameDay(day, selectedDate);
              const isToday = isSameDay(day, new Date());
              
              return (
                <button
                  key={day.toISOString()}
                  onClick={() => setSelectedDate(day)}
                  className={`
                    relative flex flex-col items-center justify-center p-2 m-1 rounded-lg transition-all
                    border min-h-[60px]
                    ${isSelected 
                      ? 'bg-blue-50 dark:bg-blue-900 border-blue-500' 
                      : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }
                    ${!isCurrentMonth ? 'opacity-40' : ''}
                  `}
                >
                  <div className={`
                    text-sm font-medium
                    ${isToday ? 'text-blue-600 dark:text-blue-400' : 'text-gray-900 dark:text-white'}
                  `}>
                    {format(day, 'd')}
                  </div>
                  {dayScholarships.length > 0 && (
                    <div className="flex flex-wrap justify-center gap-0.5 mt-1">
                      {dayScholarships.slice(0, 3).map(scholarship => (
                        <div
                          key={scholarship.id}
                          className={`w-1.5 h-1.5 rounded-full ${getUrgencyColor(new Date(scholarship.deadline))}`}
                        />
                      ))}
                      {dayScholarships.length > 3 && (
                        <div className="w-1.5 h-1.5 rounded-full bg-gray-400">
                          <div className="w-full h-full bg-gray-400 rounded-full"></div>
                        </div>
                      )}
                    </div>
                  )}
                  {isToday && (
                    <div className="absolute bottom-1 w-1 h-1 bg-blue-600 dark:bg-blue-400 rounded-full"></div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Mobile List View */}
      <div className="md:hidden space-y-3">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
          {Object.entries(scholarshipGroups).length === 0 ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              <p>No scholarships with deadlines found</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {Object.entries(scholarshipGroups).map(([dateStr, scholarships]) => (
                <div key={dateStr} className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {formatDateDisplay(dateStr)}
                    </h4>
                    <div className="flex items-center">
                      <div className="flex items-center space-x-1 mr-2">
                        {scholarships.slice(0, 3).map(scholarship => (
                          <div
                            key={scholarship.id}
                            className={`w-2 h-2 rounded-full ${getUrgencyColor(new Date(scholarship.deadline))}`}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {scholarships.length}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {scholarships.map(scholarship => {
                      const deadlineDays = Math.ceil((new Date(scholarship.deadline) - new Date()) / (1000 * 60 * 60 * 24));
                      return (
                        <button
                          key={scholarship.id}
                          onClick={() => onViewChecklist(scholarship.id)}
                          className="w-full flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                        >
                          <div className="flex items-center space-x-3">
                            <div className={`w-3 h-3 rounded-full ${getUrgencyColor(new Date(scholarship.deadline))}`}></div>
                            <div className="text-left">
                              <div className="font-medium text-gray-900 dark:text-white">
                                {scholarship.name}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {scholarship.provider}
                              </div>
                            </div>
                          </div>
                          <div className="text-xs text-gray-400">
                            {deadlineDays === 0 ? 'Today' : deadlineDays < 0 ? `${Math.abs(deadlineDays)} days overdue` : `in ${deadlineDays} days`}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Selected Date Sidebar for Desktop */}
      {selectedDate && (
        <div className="hidden md:block mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-gray-900 dark:text-white">
              {format(selectedDate, 'MMMM d, yyyy')}
            </h4>
            <button
              onClick={() => setSelectedDate(null)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="space-y-2">
            {scholarshipsForDate(selectedDate).length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-sm">No scholarships due this day</p>
            ) : (
              scholarshipsForDate(selectedDate).map(scholarship => (
                <div key={scholarship.id} className="p-3 bg-white dark:bg-gray-700 rounded-lg shadow-sm">
                  <div className="font-medium text-gray-900 dark:text-white">{scholarship.name}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">{scholarship.provider}</div>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xs px-2 py-0.5 bg-gray-200 dark:bg-gray-600 rounded-full">
                      {scholarship.status}
                    </span>
                    <button
                      onClick={() => onViewChecklist(scholarship.id)}
                      className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      View
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ResponsiveCalendarView;