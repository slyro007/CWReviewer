export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatDateTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatDateRange(start: string, end: string): string {
  return `${formatDate(start)} - ${formatDate(end)}`;
}

export function getDateRange(period: 'all' | 'month' | 'quarter' | 'year'): {
  start: string;
  end: string;
} {
  const end = new Date();
  const start = new Date();

  switch (period) {
    case 'month':
      start.setMonth(start.getMonth() - 1);
      break;
    case 'quarter':
      start.setMonth(start.getMonth() - 3);
      break;
    case 'year':
      start.setFullYear(start.getFullYear() - 1);
      break;
    case 'all':
    default:
      start.setFullYear(2000); // Far back date
      break;
  }

  return {
    start: start.toISOString().split('T')[0],
    end: end.toISOString().split('T')[0],
  };
}

export function groupByMonth(dates: string[]): Record<string, number> {
  const grouped: Record<string, number> = {};
  dates.forEach((date) => {
    const monthKey = new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
    });
    grouped[monthKey] = (grouped[monthKey] || 0) + 1;
  });
  return grouped;
}

export function calculateDaysBetween(start: string, end: string): number {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

