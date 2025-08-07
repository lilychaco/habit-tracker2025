export interface Habit {
  id: string;
  title: string;
  color: string;
  createdAt: string;
}

export interface HabitLog {
  id: string;
  habitId: string;
  date: string; // ISO-8601 date string
  status: 'done' | 'none';
  updatedAt: string;
}

export interface HabitStats {
  totalDone: number;
  currentStreak: number;
}