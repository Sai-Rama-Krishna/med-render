import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Vibration } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useState, useEffect, useMemo } from 'react';
import { useMedications } from '../../src/hooks/useMedications';
import { MedicationCheckbox } from '../../src/components/MedicationCheckbox';
import { SwipeToTaken } from '../../src/components/SwipeToTaken';
import { useTheme } from '../../src/context/ThemeContext';
import { updateOccurrenceStatus } from '../../src/database/occurrencesRepository';
import { addLog } from '../../src/database/logsRepository';
import { scheduleMedicationNotification } from '../../src/services/notificationService';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ReminderScreen() {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  
  const { time } = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const todayIso = useMemo(() => new Date().toISOString(), []);
  const { occurrences, refetch } = useMedications(todayIso);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Vibrate intensely when the alarm screen opens
  useEffect(() => {
    // Vibrate pattern: 1s on, 1s off, 1s on, 1s off, 1s on
    Vibration.vibrate([1000, 1000, 1000, 1000, 1000]);
    
    return () => {
      Vibration.cancel();
    };
  }, []);

  // Filter occurrences for this specific time that are not yet taken
  const dueOccurrences = occurrences.filter(
    (o) => o.time === time && (o.status === 'upcoming' || o.status === 'due' || o.status === 'snoozed')
  );

  useEffect(() => {
    // Select all by default
    const allIds = new Set(dueOccurrences.map(o => o.id));
    setSelectedIds(allIds);
  }, [dueOccurrences.length]);

  const toggleSelection = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
  };

  const selectAll = () => setSelectedIds(new Set(dueOccurrences.map(o => o.id)));
  const clearAll = () => setSelectedIds(new Set());

  const handleSwipeTaken = async () => {
    if (selectedIds.size === 0) return;
    
    for (const occ of dueOccurrences) {
      if (selectedIds.has(occ.id)) {
        await updateOccurrenceStatus(occ.id, 'taken');
        await addLog(occ.id, occ.medicationId, occ.doseId, 'taken', occ.scheduledAt);
      }
    }
    Alert.alert('Success', 'Selected medications marked as taken!', [
      { text: 'OK', onPress: () => router.back() }
    ]);
  };

  const handleSkip = async () => {
    if (selectedIds.size === 0) return;
    
    Alert.alert('Skip', 'Skip selected medications?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Skip', style: 'destructive', onPress: async () => {
        for (const occ of dueOccurrences) {
          if (selectedIds.has(occ.id)) {
            await updateOccurrenceStatus(occ.id, 'skipped');
            await addLog(occ.id, occ.medicationId, occ.doseId, 'skipped', occ.scheduledAt);
          }
        }
        router.back();
      }}
    ]);
  };

  const handleSnooze = async (minutes: number) => {
    if (selectedIds.size === 0) return;
    
    for (const occ of dueOccurrences) {
      if (selectedIds.has(occ.id)) {
        await updateOccurrenceStatus(occ.id, 'snoozed');
        await addLog(occ.id, occ.medicationId, occ.doseId, 'snoozed', occ.scheduledAt);
        const snoozeDate = new Date(Date.now() + minutes * 60000);
        await scheduleMedicationNotification(
          'Snoozed Medication',
          `${occ.medicationName} is due`,
          snoozeDate,
          { time: occ.time } // Custom payload
        );
      }
    }
    Alert.alert('Snoozed', `Reminding again in ${minutes} minutes.`, [
      { text: 'OK', onPress: () => router.back() }
    ]);
  };

  return (
    <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, 24) }]}>
      <Text style={styles.header}>🔔 Medicine Time</Text>
      <Text style={styles.time}>{time}</Text>

      <View style={styles.controls}>
        <TouchableOpacity onPress={selectAll}><Text style={styles.controlText}>Select All</Text></TouchableOpacity>
        <TouchableOpacity onPress={clearAll}><Text style={styles.controlText}>Clear All</Text></TouchableOpacity>
      </View>

      <ScrollView style={styles.list}>
        {dueOccurrences.map(occ => (
          <MedicationCheckbox
            key={occ.id}
            medicationName={occ.medicationName}
            quantity={occ.quantity}
            imageUri={occ.imageUri}
            selected={selectedIds.has(occ.id)}
            onToggle={() => toggleSelection(occ.id)}
          />
        ))}
      </ScrollView>

      <View style={styles.snoozeContainer}>
        <TouchableOpacity style={styles.snoozeButton} onPress={() => handleSnooze(5)}>
          <Text style={styles.snoozeText}>Snooze 5m</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.snoozeButton} onPress={() => handleSnooze(30)}>
          <Text style={styles.snoozeText}>Snooze 30m</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.actions}>
        <SwipeToTaken onSwiped={handleSwipeTaken} />
        <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
          <Text style={styles.skipText}>Skip Selected</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const getStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 24,
    paddingTop: 60,
  },
  header: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
  },
  time: {
    fontSize: 48,
    fontWeight: 'bold',
    color: colors.primary,
    textAlign: 'center',
    marginVertical: 16,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  controlText: {
    fontSize: 18,
    color: colors.primary,
    fontWeight: 'bold',
  },
  list: {
    flex: 1,
  },
  snoozeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 16,
  },
  snoozeButton: {
    backgroundColor: colors.card,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  snoozeText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  actions: {
    marginTop: 20,
    alignItems: 'center',
  },
  skipButton: {
    marginTop: 16,
    padding: 12,
  },
  skipText: {
    fontSize: 18,
    color: colors.danger,
    fontWeight: 'bold',
  },
});
