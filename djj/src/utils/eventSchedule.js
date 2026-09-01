import { formatDate, formatTimeLabel } from './formatters.js';

export function getPrimarySchedule(event) {
  const schedules = Array.isArray(event?.schedules) ? [...event.schedules] : [];
  if (schedules.length === 0) return null;

  schedules.sort((a, b) => {
    const dateA = new Date(a.startDate || 0).getTime();
    const dateB = new Date(b.startDate || 0).getTime();
    if (dateA !== dateB) return dateA - dateB;
    return String(a.startTime || '').localeCompare(String(b.startTime || ''));
  });

  return schedules[0];
}

export function formatEventDate(schedule, fallback = 'Date TBA') {
  if (!schedule?.startDate) return fallback;
  const start = formatDate(schedule.startDate);
  if (!start) return fallback;
  if (schedule.endDate && String(schedule.endDate) !== String(schedule.startDate)) {
    const end = formatDate(schedule.endDate);
    if (end && end !== start) return `${start} – ${end}`;
  }
  return start;
}

export function formatEventTimeRange(schedule, fallback = 'Time TBA') {
  if (!schedule?.startTime) return fallback;
  const start = formatTimeLabel(schedule.startTime);
  const end = schedule.endTime ? formatTimeLabel(schedule.endTime) : '';
  const range = end ? `${start} – ${end}` : start;
  if (schedule.gateOpenTime) {
    return `${range} (Gates ${formatTimeLabel(schedule.gateOpenTime)})`;
  }
  return range;
}

export function formatEventDateTimeLine(event, fallback = 'Schedule TBA') {
  const schedule = getPrimarySchedule(event);
  if (!schedule) return fallback;
  const date = formatEventDate(schedule, '');
  const time = formatEventTimeRange(schedule, '');
  if (date && time) return `${date} · ${time}`;
  return date || time || fallback;
}
