import { getUpcomingDeadlines } from './stats';

export const REMINDER_PREFS_KEY = 'scholarship_tracker.reminder_prefs';
export const REMINDER_DISMISSED_KEY = 'scholarship_tracker.reminder_dismissed';

export const DEFAULT_REMINDER_PREFERENCES = {
  enabled: true,
  quietMode: false,
  thresholds: [7, 3, 1, 0],
  pollHours: 6,
};

const normalizeThresholds = (thresholds) => {
  if (!Array.isArray(thresholds) || thresholds.length === 0) {
    return DEFAULT_REMINDER_PREFERENCES.thresholds;
  }

  const normalized = thresholds
    .map((value) => Number(value))
    .filter((value) => Number.isFinite(value) && value >= 0)
    .map((value) => Math.floor(value));

  if (normalized.length === 0) {
    return DEFAULT_REMINDER_PREFERENCES.thresholds;
  }

  return Array.from(new Set(normalized)).sort((a, b) => b - a);
};

export const loadReminderPreferences = () => {
  try {
    const raw = localStorage.getItem(REMINDER_PREFS_KEY);
    if (!raw) {
      return DEFAULT_REMINDER_PREFERENCES;
    }

    const parsed = JSON.parse(raw);
    return {
      enabled: parsed.enabled !== false,
      quietMode: Boolean(parsed.quietMode),
      thresholds: normalizeThresholds(parsed.thresholds),
      pollHours: Number(parsed.pollHours) > 0 ? Number(parsed.pollHours) : DEFAULT_REMINDER_PREFERENCES.pollHours,
    };
  } catch (error) {
    console.error('Failed to load reminder preferences:', error);
    return DEFAULT_REMINDER_PREFERENCES;
  }
};

export const saveReminderPreferences = (preferences) => {
  try {
    localStorage.setItem(REMINDER_PREFS_KEY, JSON.stringify({
      ...preferences,
      thresholds: normalizeThresholds(preferences.thresholds),
    }));
  } catch (error) {
    console.error('Failed to save reminder preferences:', error);
  }
};

export const loadDismissedReminders = () => {
  try {
    const raw = localStorage.getItem(REMINDER_DISMISSED_KEY);
    if (!raw) {
      return {};
    }
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch (error) {
    console.error('Failed to load dismissed reminders:', error);
    return {};
  }
};

export const saveDismissedReminders = (dismissed) => {
  try {
    localStorage.setItem(REMINDER_DISMISSED_KEY, JSON.stringify(dismissed || {}));
  } catch (error) {
    console.error('Failed to save dismissed reminders:', error);
  }
};

const getNowDate = (referenceDate = new Date()) => {
  const now = new Date(referenceDate);
  now.setHours(0, 0, 0, 0);
  return now;
};

export const createReminderKey = (scholarshipId, daysUntilDeadline) =>
  `${scholarshipId}:${daysUntilDeadline}`;

export const evaluateReminders = (
  scholarships,
  preferences,
  dismissedReminders,
  referenceDate = new Date()
) => {
  if (!preferences?.enabled || preferences?.quietMode) {
    return [];
  }

  const now = getNowDate(referenceDate);
  const activeThresholds = normalizeThresholds(preferences.thresholds);

  const deadlines = getUpcomingDeadlines(scholarships);

  return deadlines
    .filter((item) => activeThresholds.includes(item.daysUntilDeadline) || item.daysUntilDeadline < 0)
    .filter((item) => {
      const reminderKey = createReminderKey(item.id, item.daysUntilDeadline);
      const dismissedUntil = dismissedReminders?.[reminderKey];
      if (!dismissedUntil) {
        return true;
      }
      const dismissedDate = new Date(dismissedUntil);
      return Number.isNaN(dismissedDate.getTime()) || dismissedDate <= now;
    })
    .sort((a, b) => a.daysUntilDeadline - b.daysUntilDeadline)
    .map((item) => ({
      id: item.id,
      key: createReminderKey(item.id, item.daysUntilDeadline),
      name: item.name,
      provider: item.provider,
      deadline: item.deadline,
      daysUntilDeadline: item.daysUntilDeadline,
      urgency: item.urgency,
    }));
};

export const requestBrowserNotificationPermission = async () => {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }

  if (Notification.permission === 'granted') {
    return 'granted';
  }

  if (Notification.permission === 'denied') {
    return 'denied';
  }

  return Notification.requestPermission();
};

export const notifyBrowserReminder = (reminder) => {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false;
  }

  if (Notification.permission !== 'granted') {
    return false;
  }

  const days = reminder.daysUntilDeadline;
  const body = days < 0
    ? `${Math.abs(days)} day(s) overdue · ${reminder.provider || 'Unknown provider'}`
    : days === 0
      ? `Due today · ${reminder.provider || 'Unknown provider'}`
      : `Due in ${days} day(s) · ${reminder.provider || 'Unknown provider'}`;

  const notification = new Notification('Scholarship Deadline Reminder', {
    body: `${reminder.name}: ${body}`,
    tag: reminder.key,
    renotify: false,
  });

  setTimeout(() => notification.close(), 8000);
  return true;
};

export const snoozeReminderUntil = (hours = 24) => {
  const until = new Date();
  until.setHours(until.getHours() + hours);
  return until.toISOString();
};