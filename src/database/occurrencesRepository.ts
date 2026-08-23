import { getDb } from './database';
import { MedicationOccurrence, OccurrenceStatus } from '../types/medication';

export async function addOccurrences(occurrences: Omit<MedicationOccurrence, 'createdAt'>[]) {
  const db = await getDb();
  const now = new Date().toISOString();
  
  for (const occ of occurrences) {
    try {
      const exists = await db.getFirstAsync(
        'SELECT id FROM medication_occurrences WHERE medicationId = $medicationId AND doseId = $doseId AND scheduledAt = $scheduledAt',
        {
          $medicationId: occ.medicationId,
          $doseId: occ.doseId,
          $scheduledAt: occ.scheduledAt
        }
      );
      
      if (!exists) {
        await db.runAsync(
          'INSERT INTO medication_occurrences (id, medicationId, doseId, scheduledAt, status, createdAt) VALUES ($id, $medicationId, $doseId, $scheduledAt, $status, $createdAt)',
          {
            $id: occ.id,
            $medicationId: occ.medicationId,
            $doseId: occ.doseId,
            $scheduledAt: occ.scheduledAt,
            $status: occ.status,
            $createdAt: now
          }
        );
      }
    } catch (e) {
      console.error("Error inserting occurrence:", e);
    }
  }
}

export async function updateOccurrenceStatus(id: string, status: OccurrenceStatus) {
  const db = await getDb();
  await db.runAsync('UPDATE medication_occurrences SET status = $status WHERE id = $id', { $status: status, $id: id });
}

export async function getOccurrencesForDate(dateIso: string) {
  const db = await getDb();
  
  // We need to match dates that start with the given date (e.g., '2023-10-25')
  const prefix = dateIso.split('T')[0];
  
  const query = `
    SELECT o.*, m.name as medicationName, m.imageUri, m.soundUri, d.time, d.quantity 
    FROM medication_occurrences o
    JOIN medications m ON o.medicationId = m.id
    JOIN medication_doses d ON o.doseId = d.id
    WHERE o.scheduledAt LIKE $prefix AND m.active = 1
    ORDER BY d.time ASC
  `;
  
  return await db.getAllAsync<any>(query, { $prefix: prefix + '%' });
}
