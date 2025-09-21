const DAY_MS = 24 * 60 * 60 * 1000;

export function parseLocalDate(value) {
  if (!value || typeof value !== 'string') return null;
  const [yearStr, monthStr, dayStr] = value.split('-');
  const year = Number(yearStr);
  const month = Number(monthStr);
  const day = Number(dayStr);
  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) {
    return null;
  }
  const date = new Date(year, month - 1, day);
  if (
    Number.isNaN(date.getTime())
    || date.getFullYear() !== year
    || date.getMonth() !== month - 1
    || date.getDate() !== day
  ) {
    return null;
  }
  return date;
}

export function diffDaysInclusive(start, end) {
  const startDate = parseLocalDate(start);
  const endDate = parseLocalDate(end);
  if (!startDate || !endDate) return null;
  const diff = Math.floor((endDate - startDate) / DAY_MS) + 1;
  return diff;
}

export function daysBetweenInclusive(start, end) {
  const diff = diffDaysInclusive(start, end);
  if (diff === null || diff < 0) {
    return 0;
  }
  return diff;
}

export function buildDateArray(start, days) {
  const baseDate = parseLocalDate(start);
  if (!baseDate || days <= 0) return [];
  const out = [];
  for (let i = 0; i < days; i += 1) {
    const date = new Date(baseDate);
    date.setDate(baseDate.getDate() + i);
    out.push(date);
  }
  return out;
}

export function formatDateISO(date) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return '';
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

const HUMAN_FORMATTER = new Intl.DateTimeFormat('fr-BE', {
  year: 'numeric',
  month: 'short',
  day: '2-digit',
});

export function formatDateHuman(date) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return '';
  return HUMAN_FORMATTER.format(date);
}
