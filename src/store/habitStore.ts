import { create } from 'zustand';
import { Habit, HabitLog, HabitStats } from '@/types';
import { database } from '@/database/database';
import { formatDate, calculateStreak } from '@/utils/dateUtils';

interface HabitStore {
  habit: Habit | null;
  logs: HabitLog[];
  currentMonth: number;
  currentYear: number;
  stats: HabitStats;
  reminderTime: string;
  
  // Actions
  loadHabit: () => Promise<void>;
  createHabit: (title: string, color: string) => Promise<void>;
  updateHabitTitle: (title: string) => Promise<void>;
  toggleDay: (date: string) => Promise<void>;
  navigateMonth: (direction: 'prev' | 'next') => void;
  loadLogsForMonth: () => Promise<void>;
  calculateStats: () => Promise<void>;
  setReminderTime: (time: string) => void;
}

export const useHabitStore = create<HabitStore>((set, get) => ({
  habit: null,
  logs: [],
  currentMonth: new Date().getMonth() + 1,
  currentYear: new Date().getFullYear(),
  stats: { totalDone: 0, currentStreak: 0 },
  reminderTime: '09:00',

  loadHabit: async () => {
    try {
      const habit = await database.getHabit();
      set({ habit });
      if (habit) {
        await get().loadLogsForMonth();
        await get().calculateStats();
      }
    } catch (error) {
      console.error('Failed to load habit:', error);
    }
  },

  createHabit: async (title: string, color: string) => {
    try {
      const habit: Habit = {
        id: `habit_${Date.now()}`,
        title,
        color,
        createdAt: new Date().toISOString(),
      };
      
      await database.createHabit(habit);
      set({ habit });
      await get().loadLogsForMonth();
    } catch (error) {
      console.error('Failed to create habit:', error);
    }
  },

  updateHabitTitle: async (title: string) => {
    const { habit } = get();
    if (!habit) return;
    
    try {
      await database.updateHabitTitle(habit.id, title);
      set({ habit: { ...habit, title } });
    } catch (error) {
      console.error('Failed to update habit title:', error);
    }
  },

  toggleDay: async (date: string) => {
    const { habit, logs } = get();
    if (!habit) return;

    try {
      const existingLog = logs.find(log => log.date === date);
      const newStatus = existingLog?.status === 'done' ? 'none' : 'done';
      
      const log: HabitLog = {
        id: existingLog?.id || `log_${Date.now()}_${Math.random()}`,
        habitId: habit.id,
        date,
        status: newStatus,
        updatedAt: new Date().toISOString(),
      };

      await database.upsertHabitLog(log);
      
      // Update logs in state
      const updatedLogs = existingLog
        ? logs.map(l => l.date === date ? log : l)
        : [...logs, log];
      
      set({ logs: updatedLogs });
      await get().calculateStats();
    } catch (error) {
      console.error('Failed to toggle day:', error);
    }
  },

  navigateMonth: (direction: 'prev' | 'next') => {
    const { currentMonth, currentYear } = get();
    
    let newMonth = currentMonth;
    let newYear = currentYear;
    
    if (direction === 'next') {
      newMonth = currentMonth === 12 ? 1 : currentMonth + 1;
      newYear = currentMonth === 12 ? currentYear + 1 : currentYear;
    } else {
      newMonth = currentMonth === 1 ? 12 : currentMonth - 1;
      newYear = currentMonth === 1 ? currentYear - 1 : currentYear;
    }
    
    set({ currentMonth: newMonth, currentYear: newYear });
    get().loadLogsForMonth();
  },

  loadLogsForMonth: async () => {
    const { habit, currentYear, currentMonth } = get();
    if (!habit) return;

    try {
      const startDate = `${currentYear}-${String(currentMonth).padStart(2, '0')}-01`;
      const endDate = `${currentYear}-${String(currentMonth).padStart(2, '0')}-31`;
      
      const logs = await database.getHabitLogs(habit.id, startDate, endDate);
      set({ logs });
    } catch (error) {
      console.error('Failed to load logs for month:', error);
    }
  },

  calculateStats: async () => {
    const { habit } = get();
    if (!habit) return;

    try {
      const allLogs = await database.getAllHabitLogs(habit.id);
      const totalDone = allLogs.length;
      const currentStreak = calculateStreak(allLogs);
      
      set({ stats: { totalDone, currentStreak } });
    } catch (error) {
      console.error('Failed to calculate stats:', error);
    }
  },

  setReminderTime: (time: string) => {
    set({ reminderTime: time });
  },
}));