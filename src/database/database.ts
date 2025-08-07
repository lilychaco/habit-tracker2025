import * as SQLite from 'expo-sqlite';
import { Habit, HabitLog } from '@/types';

export class Database {
  private db: SQLite.SQLiteDatabase;

  constructor() {
    this.db = SQLite.openDatabaseSync('habit_tracker.db');
    this.initializeTables();
  }

private initializeTables() {
  this.db.execSync(`
    CREATE TABLE IF NOT EXISTS habits (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      color TEXT NOT NULL,
      createdAt TEXT NOT NULL
    );
  `);

  this.db.execSync(`
    CREATE TABLE IF NOT EXISTS habit_logs (
      id TEXT PRIMARY KEY,
      habitId TEXT NOT NULL,
      date TEXT NOT NULL,
      status TEXT NOT NULL CHECK (status IN ('done', 'none')),
      updatedAt TEXT NOT NULL,
      FOREIGN KEY (habitId) REFERENCES habits (id) ON DELETE CASCADE,
      UNIQUE(habitId, date)
    );
  `);
}


  createHabit(habit: Habit): void {
    this.db.runSync(
      'INSERT INTO habits (id, title, color, createdAt) VALUES (?, ?, ?, ?)',
      [habit.id, habit.title, habit.color, habit.createdAt]
    );
  }

getHabit(): Habit | null {
  const result = this.db.getFirstSync(
    'SELECT * FROM habits ORDER BY createdAt DESC LIMIT 1'
  );
  return result as Habit | null;
}


  updateHabitTitle(id: string, title: string): void {
    this.db.runSync(
      'UPDATE habits SET title = ? WHERE id = ?',
      [title, id]
    );
  }

  upsertHabitLog(log: HabitLog): void {
    this.db.runSync(
      `INSERT INTO habit_logs (id, habitId, date, status, updatedAt)
       VALUES (?, ?, ?, ?, ?)
       ON CONFLICT(habitId, date) DO UPDATE SET
         status = excluded.status,
         updatedAt = excluded.updatedAt`,
      [log.id, log.habitId, log.date, log.status, log.updatedAt]
    );
  }

  getHabitLogs(habitId: string, startDate: string, endDate: string): HabitLog[] {
    return this.db.getAllSync(
      `SELECT * FROM habit_logs
       WHERE habitId = ? AND date >= ? AND date <= ?
       ORDER BY date ASC`,
      [habitId, startDate, endDate]
    ) as HabitLog[];
  }

  getAllHabitLogs(habitId: string): HabitLog[] {
    return this.db.getAllSync(
      `SELECT * FROM habit_logs
       WHERE habitId = ? AND status = 'done'
       ORDER BY date ASC`,
      [habitId]
    ) as HabitLog[];
  }
}

export const database = new Database();
