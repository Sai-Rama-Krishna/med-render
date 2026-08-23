import { MedicationWithDoses } from '../types/medication';
import { addOccurrences } from '../database/occurrencesRepository';
import { addDays, parseISO, startOfDay, isBefore, getDay, addMonths } from 'date-fns';
import * as Crypto from 'expo-crypto';
import { scheduleMedicationNotification } from './notificationService';

export async function scheduleOccurrencesForMedication(med: MedicationWithDoses, daysToSchedule: number = 30) {
  if (!med.active) return;
  
  const occurrencesToCreate = [];
  let currentDate = startOfDay(new Date());
  
  if (isBefore(currentDate, parseISO(med.startDate))) {
    currentDate = startOfDay(parseISO(med.startDate));
  }
  
  const endDate = med.endDate ? startOfDay(parseISO(med.endDate)) : addMonths(currentDate, 6);
  const targetEndDate = addDays(new Date(), daysToSchedule);
  const finalEndDate = isBefore(endDate, targetEndDate) ? endDate : targetEndDate;
  
  while (!isBefore(finalEndDate, currentDate)) {
    let shouldScheduleToday = false;
    
    if (med.frequency === 'daily') {
      shouldScheduleToday = true;
    } else if (med.frequency === 'weekly' && med.days) {
      const currentDayOfWeek = getDay(currentDate);
      if (med.days.some(d => d.weekday === currentDayOfWeek)) {
        shouldScheduleToday = true;
      }
    } else if (med.frequency === 'interval' && med.intervalDays) {
      const start = startOfDay(parseISO(med.startDate));
      const diffTime = currentDate.getTime() - start.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays % med.intervalDays === 0) {
        shouldScheduleToday = true;
      }
    }
    
    if (shouldScheduleToday) {
      for (const dose of med.doses) {
        const [hours, minutes] = dose.time.split(':');
        const scheduledTime = new Date(currentDate);
        scheduledTime.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);
        
        const occurrenceId = Crypto.randomUUID();
        
        occurrencesToCreate.push({
          id: occurrenceId,
          medicationId: med.id,
          doseId: dose.id,
          scheduledAt: scheduledTime.toISOString(),
          status: 'upcoming' as const
        });
        
        if (scheduledTime.getTime() > Date.now()) {
          await scheduleMedicationNotification(
            `Time for ${med.name}`,
            `Please take ${dose.quantity} dose(s) now.`,
            scheduledTime,
            { occurrenceId, medicationId: med.id }
          );
        }
      }
    }
    
    currentDate = addDays(currentDate, 1);
  }
  
  if (occurrencesToCreate.length > 0) {
    await addOccurrences(occurrencesToCreate);
  }
}
