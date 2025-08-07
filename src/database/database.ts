import * as SQLite from 'expo-sqlite';
import { Habit, HabitLog } from '@/types';

export class Database {
  private db: SQLite.SQLiteDatabase;

  constructor() {
    this.db = SQLite.openDatabase('habit_tracker.db');
    this.initializeTables();
  }

private initializeTables() {
  this.db.transaction(tx => {
    tx.executeSql(`
      CREATE TABLE IF NOT EXISTS habits (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        color TEXT NOT NULL,
        createdAt TEXT NOT NULL
      );
    `);

    tx.executeSql(`
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
  });
}


  async createHabit(habit: Habit): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.transaction(tx => {
        tx.executeSql(
          'INSERT INTO habits (id, title, color, createdAt) VALUES (?, ?, ?, ?)',
          [habit.id, habit.title, habit.color, habit.createdAt],
          () => resolve(),
          (_, error) => {
            reject(error);
            return false;
          }
        );
      });
    });
  }

async getHabit(): Promise<Habit | null> {
  return new Promise((resolve, reject) => {
    this.db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM habits ORDER BY createdAt DESC LIMIT 1',
        [],
        (_, result) => {
          if (result.rows.length > 0) {
            resolve(result.rows.item(0) as Habit);
          } else {
            resolve(null);
          }
        },
        (_, error) => {
          reject(error);
          return false;
        }
      );
    });
  });
}


  async updateHabitTitle(id: string, title: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.transaction(tx => {
        tx.executeSql(
          'UPDATE habits SET title = ? WHERE id = ?',
          [title, id],
          () => resolve(),
          (_, error) => {
            reject(error);
            return false;
          }
        );
      });
    });
  }

  async upsertHabitLog(log: HabitLog): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.transaction(tx => {
        tx.executeSql(
          `INSERT INTO habit_logs (id, habitId, date, status, updatedAt)
           VALUES (?, ?, ?, ?, ?)
           ON CONFLICT(habitId, date) DO UPDATE SET
             status = excluded.status,
             updatedAt = excluded.updatedAt`,
          [log.id, log.habitId, log.date, log.status, log.updatedAt],
          () => resolve(),
          (_, error) => {
            reject(error);
            return false;
          }
        );
      });
    });
  }

  async getHabitLogs(habitId: string, startDate: string, endDate: string): Promise<HabitLog[]> {
    return new Promise((resolve, reject) => {
      this.db.transaction(tx => {
        tx.executeSql(
          `SELECT * FROM habit_logs
           WHERE habitId = ? AND date >= ? AND date <= ?
           ORDER BY date ASC`,
          [habitId, startDate, endDate],
          (_, result) => {
            const logs: HabitLog[] = [];
            for (let i = 0; i < result.rows.length; i++) {
              logs.push(result.rows.item(i) as HabitLog);
            }
            resolve(logs);
          },
          (_, error) => {
            reject(error);
            return false;
          }
        );
      });
    });
  }

  async getAllHabitLogs(habitId: string): Promise<HabitLog[]> {
    return new Promise((resolve, reject) => {
      this.db.transaction(tx => {
        tx.executeSql(
          `SELECT * FROM habit_logs
           WHERE habitId = ? AND status = 'done'
           ORDER BY date ASC`,
          [habitId],
          (_, result) => {
            const logs: HabitLog[] = [];
            for (let i = 0; i < result.rows.length; i++) {
              logs.push(result.rows.item(i) as HabitLog);
            }
            resolve(logs);
          },
          (_, error) => {
            reject(error);
            return false;
          }
        );
      });
    });
  }
}

export const database = new Database();
