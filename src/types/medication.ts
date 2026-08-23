export type Frequency = 'daily' | 'weekly' | 'interval';

export interface Medication {
  id: string;
  name: string;
  imageUri?: string | null;
  frequency: Frequency;
  intervalDays?: number | null;
  startDate: string; // ISO 8601
  endDate?: string | null; // ISO 8601
  active: boolean;
  soundUri?: string | null;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}

export interface MedicationDay {
  id: string;
  medicationId: string;
  weekday: number; // 0-6 (Sunday-Saturday)
}

export interface MedicationDose {
  id: string;
  medicationId: string;
  time: string; // HH:mm format
  quantity: string;
  createdAt: string;
}

export type OccurrenceStatus = 'upcoming' | 'due' | 'taken' | 'skipped' | 'missed' | 'snoozed';

export interface MedicationOccurrence {
  id: string;
  medicationId: string;
  doseId: string;
  scheduledAt: string; // ISO 8601
  status: OccurrenceStatus;
  createdAt: string;
}

export interface MedicationNotification {
  id: string;
  occurrenceId: string;
  notificationId: string;
  scheduledAt: string;
  status: 'pending' | 'triggered' | 'cancelled';
}

export interface MedicationLog {
  id: string;
  occurrenceId: string | null;
  medicationId: string;
  doseId: string;
  action: 'taken' | 'skipped' | 'snoozed' | 'missed';
  scheduledAt: string; // ISO 8601
  completedAt: string; // ISO 8601
  createdAt: string;
}

// Composite type for UI
export interface MedicationWithDoses extends Medication {
  doses: MedicationDose[];
  days?: MedicationDay[];
}
