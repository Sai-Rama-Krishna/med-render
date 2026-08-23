import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Platform } from 'react-native';
import { useMedications } from '../../src/hooks/useMedications';
import { MedicationGroup } from '../../src/components/MedicationGroup';
import { useTheme } from '../../src/context/ThemeContext';
import { router } from 'expo-router';
import { format, parse } from 'date-fns';
import { useState, useMemo, useCallback } from 'react';
import { updateOccurrenceStatus } from '../../src/database/occurrencesRepository';
import { addLog } from '../../src/database/logsRepository';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';

export default function HomeScreen() {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  const todayIso = useMemo(() => selectedDate.toISOString(), [selectedDate]);
  const { occurrences, loading, refetch } = useMedications(todayIso);

  const handleMedicationPress = useCallback(async (occurrence: any) => {
    let dateObj;
    if (occurrence.scheduledAt) {
      dateObj = new Date(occurrence.scheduledAt);
    } else if (occurrence.time) {
      dateObj = parse(occurrence.time, 'HH:mm', new Date());
    }

    if (occurrence.status === 'taken') {
      Alert.alert(
        'Undo Mark as Taken?',
        `Do you want to mark ${occurrence.medicationName} as due again?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Yes, Mark as Due', 
            style: 'destructive',
            onPress: async () => {
              try {
                await updateOccurrenceStatus(occurrence.id, 'upcoming');
                refetch();
              } catch (e) {
                console.error("Error reverting status:", e);
                Alert.alert('Error', 'Failed to update status');
              }
            } 
          }
        ]
      );
      return;
    }
    
    // If it's in the future (more than 5 mins from now), don't allow taking it
    if (dateObj && dateObj.getTime() > Date.now() + 5 * 60000) {
      Alert.alert('Not Yet', 'This medication is scheduled for later. Please wait until it is due.');
      return;
    }
    
    Alert.alert(
      'Mark as Taken?',
      `Did you take ${occurrence.medicationName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Yes, Take it', 
          onPress: async () => {
            try {
              await updateOccurrenceStatus(occurrence.id, 'taken');
              await addLog(
                occurrence.id, 
                occurrence.medicationId, 
                occurrence.doseId, 
                'taken', 
                occurrence.scheduledAt || new Date().toISOString()
              );
              refetch();
            } catch (e) {
              console.error("Error marking as taken:", e);
              Alert.alert('Error', 'Failed to mark as taken');
            }
          } 
        }
      ]
    );
  }, [refetch]);

  const grouped = occurrences.reduce((acc, curr) => {
    if (!acc[curr.time]) {
      acc[curr.time] = [];
    }
    acc[curr.time].push(curr);
    return acc;
  }, {} as Record<string, any[]>);

  const sortedTimes = Object.keys(grouped).sort();

  const onChangeDate = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setSelectedDate(selectedDate);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.dateSelector}>
          <Text style={styles.date}>{format(selectedDate, 'EEEE, MMM d')}</Text>
          <Ionicons name="calendar" size={24} color={colors.primary} style={{ marginLeft: 8 }} />
        </TouchableOpacity>
      </View>
      
      {showDatePicker && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display="default"
          onChange={onChangeDate}
        />
      )}

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {sortedTimes.length === 0 && !loading && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>
              {format(selectedDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd') 
                ? "No medications scheduled for today." 
                : "No medications scheduled for this date."}
            </Text>
          </View>
        )}

        {sortedTimes.map(time => (
          <MedicationGroup 
            key={time} 
            time={time} 
            occurrences={grouped[time]} 
            onMedicationPress={handleMedicationPress}
          />
        ))}
      </ScrollView>
      
    </View>
  );
}

const getStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    marginBottom: 24,
  },
  greeting: {
    fontSize: 16,
    color: colors.textMuted,
    marginBottom: 4,
  },
  appName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: 4,
  },
  dateSelector: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  date: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  dateHeader: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 24,
    color: colors.text,
  },
  emptyState: {
    padding: 24,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 18,
    color: colors.textMuted,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    left: 24,
    right: 24,
    backgroundColor: colors.primary,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  fabText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
});
