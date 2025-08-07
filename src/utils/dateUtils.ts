export const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

export const getDaysInMonth = (year: number, month: number): number => {
  return new Date(year, month, 0).getDate();
};

export const getFirstDayOfMonth = (year: number, month: number): number => {
  return new Date(year, month - 1, 1).getDay();
};

export const getMonthName = (month: number): string => {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return months[month - 1];
};

export const calculateStreak = (logs: Array<{date: string, status: string}>): number => {
  const today = formatDate(new Date());
  const doneLogs = logs
    .filter(log => log.status === 'done')
    .sort((a, b) => b.date.localeCompare(a.date));

  if (doneLogs.length === 0) return 0;

  let streak = 0;
  let currentDate = new Date();
  
  // Start from today or yesterday if today is not done
  const latestLog = doneLogs[0];
  if (latestLog.date !== today) {
    currentDate.setDate(currentDate.getDate() - 1);
  }

  for (const log of doneLogs) {
    const logDate = formatDate(currentDate);
    if (log.date === logDate) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
};