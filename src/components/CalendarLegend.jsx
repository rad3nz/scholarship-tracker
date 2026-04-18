import React from "react";
import { getScholarshipsByUrgency } from "../utils/filterScholarships";
import { getCalendarUrgencyColor } from "../utils/calendarUtils";

/**
 * CalendarLegend component - Shows color coding explanation for urgency levels
 * @param {Array} scholarships - All scholarships to count by urgency
 */
const CalendarLegend = ({ scholarships }) => {
  const byUrgency = getScholarshipsByUrgency(scholarships);

  const urgencyItems = [
    {
      key: "overdue",
      label: "Overdue",
      color: getCalendarUrgencyColor("overdue"),
      bgColor: "bg-red-100 dark:bg-red-900/30",
    },
    {
      key: "critical",
      label: "Critical (≤7 days)",
      color: getCalendarUrgencyColor("critical"),
      bgColor: "bg-orange-100 dark:bg-orange-900/30",
    },
    {
      key: "high",
      label: "High (≤30 days)",
      color: getCalendarUrgencyColor("high"),
      bgColor: "bg-yellow-100 dark:bg-yellow-900/30",
    },
    {
      key: "medium",
      label: "Medium (≤60 days)",
      color: getCalendarUrgencyColor("medium"),
      bgColor: "bg-amber-100 dark:bg-amber-900/30",
    },
    {
      key: "low",
      label: "Low (>60 days)",
      color: getCalendarUrgencyColor("low"),
      bgColor: "bg-green-100 dark:bg-green-900/30",
    },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
        Urgency Legend
      </h4>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {urgencyItems.map((item) => (
          <div
            key={item.key}
            className={`flex items-center gap-2 p-2 rounded-lg ${item.bgColor}`}
          >
            <div
              className="w-3 h-3 rounded-full shrink-0 ring-1 ring-white dark:ring-gray-900"
              style={{ backgroundColor: item.color }}
            />
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium text-gray-800 dark:text-gray-200 truncate">
                {item.label}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                {byUrgency[item.key]} scholarship
                {byUrgency[item.key] !== 1 ? "s" : ""}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CalendarLegend;
