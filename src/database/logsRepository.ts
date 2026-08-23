import { getDb } from './database';
import * as Crypto from 'expo-crypto';

export async function addLog(
  occurrenceId: string | null,
  medicationId: string,
  doseId: string,
  action: 'taken' | 'skipped' | 'snoozed' | 'missed',
  scheduledAt: string
) {
  const db = await getDb();
  const now = new Date().toISOString();
  const id = Crypto.randomUUID();
  
  await db.runAsync(
    'INSERT INTO medication_logs (id, occurrenceId, medicationId, doseId, action, scheduledAt, completedAt, createdAt) VALUES ($id, $occurrenceId, $medicationId, $doseId, $action, $scheduledAt, $completedAt, $createdAt)',
    {
      $id: id,
      $occurrenceId: occurrenceId || "",
      $medicationId: medicationId,
      $doseId: doseId,
      $action: action,
      $scheduledAt: scheduledAt,
      $completedAt: now,
      $createdAt: now
    }
  );
}

export async function getLogs() {
  const db = await getDb();
  const query = `
    SELECT l.*, m.name as medicationName 
    FROM medication_logs l
    JOIN medications m ON l.medicationId = m.id
    ORDER BY l.completedAt DESC
  `;
  return await db.getAllAsync<any>(query);
}
