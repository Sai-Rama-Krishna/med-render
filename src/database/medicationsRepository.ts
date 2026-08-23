import { getDb } from './database';
import { Medication, MedicationDay, MedicationDose, MedicationWithDoses } from '../types/medication';

export async function addMedication(
  medication: Omit<Medication, 'createdAt' | 'updatedAt'>,
  doses: Omit<MedicationDose, 'createdAt' | 'medicationId'>[],
  days: number[] // 0-6 for weekly frequency
) {
  const db = await getDb();
  const now = new Date().toISOString();

  try {
    await db.runAsync(
      `INSERT INTO medications (id, name, imageUri, frequency, intervalDays, startDate, endDate, active, soundUri, createdAt, updatedAt)
       VALUES ($id, $name, $imageUri, $frequency, $intervalDays, $startDate, $endDate, $active, $soundUri, $createdAt, $updatedAt)`,
      {
        $id: medication.id,
        $name: medication.name,
        $imageUri: medication.imageUri || "",
        $frequency: medication.frequency,
        $intervalDays: medication.intervalDays || 0,
        $startDate: medication.startDate,
        $endDate: medication.endDate || "",
        $active: medication.active ? 1 : 0,
        $soundUri: medication.soundUri || "",
        $createdAt: now,
        $updatedAt: now
      }
    );
  } catch (e) {
    console.error("Error inserting medication:", e);
    throw e;
  }

  try {
    for (const dose of doses) {
      await db.runAsync(
        `INSERT INTO medication_doses (id, medicationId, time, quantity, createdAt) VALUES ($id, $medicationId, $time, $quantity, $createdAt)`,
        {
          $id: dose.id || Math.random().toString(36).substring(2, 9), 
          $medicationId: medication.id, 
          $time: dose.time || "00:00", 
          $quantity: dose.quantity || "1", 
          $createdAt: now
        }
      );
    }
  } catch (e) {
    console.error("Error inserting doses:", e);
    throw e;
  }

  try {
    if (medication.frequency === 'weekly' && days) {
      for (const day of days) {
        await db.runAsync(
          `INSERT INTO medication_days (id, medicationId, weekday) VALUES ($id, $medicationId, $weekday)`,
          {
            $id: Math.random().toString(36).substring(2, 9), 
            $medicationId: medication.id, 
            $weekday: day
          }
        );
      }
    }
  } catch (e) {
    console.error("Error inserting days:", e);
    throw e;
  }
}

export async function getMedications(): Promise<MedicationWithDoses[]> {
  const db = await getDb();
  
  const meds = await db.getAllAsync<any>('SELECT * FROM medications ORDER BY createdAt DESC');
  
  const result: MedicationWithDoses[] = [];
  
  for (const med of meds) {
    const doses = await db.getAllAsync<MedicationDose>('SELECT * FROM medication_doses WHERE medicationId = $id ORDER BY time ASC', { $id: med.id });
    const days = await db.getAllAsync<MedicationDay>('SELECT * FROM medication_days WHERE medicationId = $id', { $id: med.id });
    
    result.push({
      ...med,
      active: med.active === 1,
      doses,
      days
    });
  }
  
  return result;
}

export async function getMedicationById(id: string): Promise<MedicationWithDoses | null> {
  const db = await getDb();
  const med = await db.getFirstAsync<any>('SELECT * FROM medications WHERE id = $id', { $id: id });
  
  if (!med) return null;
  
  const doses = await db.getAllAsync<MedicationDose>('SELECT * FROM medication_doses WHERE medicationId = $id ORDER BY time ASC', { $id: id });
  const days = await db.getAllAsync<MedicationDay>('SELECT * FROM medication_days WHERE medicationId = $id', { $id: id });
  
  return {
    ...med,
    active: med.active === 1,
    doses,
    days
  };
}

export async function updateMedication(
  medication: Medication,
  doses: Omit<MedicationDose, 'createdAt' | 'medicationId'>[],
  days: number[]
) {
  const db = await getDb();
  const now = new Date().toISOString();
  
  await db.runAsync(
    `UPDATE medications SET 
      name = $name, imageUri = $imageUri, frequency = $frequency, intervalDays = $intervalDays, startDate = $startDate, endDate = $endDate, active = $active, soundUri = $soundUri, updatedAt = $updatedAt
     WHERE id = $id`,
     {
       $name: medication.name,
       $imageUri: medication.imageUri || "",
       $frequency: medication.frequency,
       $intervalDays: medication.intervalDays || 0,
       $startDate: medication.startDate,
       $endDate: medication.endDate || "",
       $active: medication.active ? 1 : 0,
       $soundUri: medication.soundUri || "",
       $updatedAt: now,
       $id: medication.id
     }
  );
  
  // Replace doses
  await db.runAsync('DELETE FROM medication_doses WHERE medicationId = $id', { $id: medication.id });
  for (const dose of doses) {
    await db.runAsync(
      `INSERT INTO medication_doses (id, medicationId, time, quantity, createdAt) VALUES ($id, $medicationId, $time, $quantity, $createdAt)`,
      {
        $id: dose.id || Math.random().toString(36).substring(2, 9),
        $medicationId: medication.id,
        $time: dose.time || "00:00",
        $quantity: dose.quantity || "1",
        $createdAt: now
      }
    );
  }
  
  // Replace days
  await db.runAsync('DELETE FROM medication_days WHERE medicationId = $id', { $id: medication.id });
  if (medication.frequency === 'weekly' && days) {
    for (const day of days) {
      await db.runAsync(
        `INSERT INTO medication_days (id, medicationId, weekday) VALUES ($id, $medicationId, $weekday)`,
        {
          $id: Math.random().toString(36).substring(2, 9),
          $medicationId: medication.id,
          $weekday: day
        }
      );
    }
  }
}

export async function deleteMedication(id: string) {
  const db = await getDb();
  await db.runAsync('DELETE FROM medications WHERE id = $id', { $id: id });
}

export async function pauseMedication(id: string) {
  const db = await getDb();
  const now = new Date().toISOString();
  await db.runAsync('UPDATE medications SET active = 0, updatedAt = $now WHERE id = $id', { $now: now, $id: id });
}

export async function resumeMedication(id: string) {
  const db = await getDb();
  const now = new Date().toISOString();
  await db.runAsync('UPDATE medications SET active = 1, updatedAt = $now WHERE id = $id', { $now: now, $id: id });
}
