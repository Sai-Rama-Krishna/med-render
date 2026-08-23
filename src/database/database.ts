import * as SQLite from 'expo-sqlite';
import { runMigrations } from './migrations';

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

export function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (!dbPromise) {
    dbPromise = SQLite.openDatabaseAsync('medreminder.db');
  }
  return dbPromise;
}

export async function initDb() {
  try {
    const db = await getDb();
    await runMigrations(db);
    console.log('Database initialized successfully.');
  } catch (error) {
    console.error('Failed to initialize database:', error);
  }
}
export async function clearAllData() {
  const db = await getDb();
  await db.execAsync(`
    DELETE FROM medication_logs;
    DELETE FROM medication_occurrences;
    DELETE FROM medication_doses;
    DELETE FROM medication_days;
    DELETE FROM medications;
  `);
}
