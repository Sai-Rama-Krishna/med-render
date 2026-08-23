import { SQLiteDatabase } from 'expo-sqlite';

export async function runMigrations(db: SQLiteDatabase) {
  // PRAGMA journal_mode = WAL; is set automatically by Expo SQLite in newer versions,
  // but we enforce foreign keys and define our schema.
  await db.execAsync(`
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS medications (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      imageUri TEXT,
      frequency TEXT NOT NULL,
      intervalDays INTEGER,
      startDate TEXT NOT NULL,
      endDate TEXT,
      active INTEGER DEFAULT 1,
      soundUri TEXT,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS medication_days (
      id TEXT PRIMARY KEY,
      medicationId TEXT NOT NULL,
      weekday INTEGER NOT NULL,
      FOREIGN KEY (medicationId) REFERENCES medications (id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS medication_doses (
      id TEXT PRIMARY KEY,
      medicationId TEXT NOT NULL,
      time TEXT NOT NULL,
      quantity TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      FOREIGN KEY (medicationId) REFERENCES medications (id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS medication_occurrences (
      id TEXT PRIMARY KEY,
      medicationId TEXT NOT NULL,
      doseId TEXT NOT NULL,
      scheduledAt TEXT NOT NULL,
      status TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      FOREIGN KEY (medicationId) REFERENCES medications (id) ON DELETE CASCADE,
      FOREIGN KEY (doseId) REFERENCES medication_doses (id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS medication_notifications (
      id TEXT PRIMARY KEY,
      occurrenceId TEXT NOT NULL,
      notificationId TEXT NOT NULL,
      scheduledAt TEXT NOT NULL,
      status TEXT NOT NULL,
      FOREIGN KEY (occurrenceId) REFERENCES medication_occurrences (id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS medication_logs (
      id TEXT PRIMARY KEY,
      occurrenceId TEXT,
      medicationId TEXT NOT NULL,
      doseId TEXT NOT NULL,
      action TEXT NOT NULL,
      scheduledAt TEXT NOT NULL,
      completedAt TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      FOREIGN KEY (medicationId) REFERENCES medications (id) ON DELETE CASCADE
    );
  `);
}
