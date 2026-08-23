import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { useTheme } from '../../src/context/ThemeContext';
import { useState, useCallback, useMemo } from 'react';
import { getLogs } from '../../src/database/logsRepository';
import { format, parseISO, isToday, isYesterday } from 'date-fns';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function HistoryScreen() {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  
  const [logs, setLogs] = useState<any[]>([]);
  const [filterDate, setFilterDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);

  useFocusEffect(
    useCallback(() => {
      getLogs().then(setLogs);
    }, [])
  );

  const groupedLogs = useMemo(() => {
    const groups: Record<string, any[]> = {};
    const filtered = filterDate 
      ? logs.filter(log => format(parseISO(log.completedAt), 'yyyy-MM-dd') === format(filterDate, 'yyyy-MM-dd'))
      : logs;

    filtered.forEach(log => {
      const dateKey = format(parseISO(log.completedAt), 'yyyy-MM-dd');
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(log);
    });
    return groups;
  }, [logs, filterDate]);

  const sortedDates = Object.keys(groupedLogs).sort((a, b) => b.localeCompare(a));

  const onChangeDate = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setFilterDate(selectedDate);
    }
  };

  const getDayLabel = (dateStr: string) => {
    const d = parseISO(dateStr);
    if (isToday(d)) return 'Today';
    if (isYesterday(d)) return 'Yesterday';
    return format(d, 'EEEE, MMM d, yyyy');
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.header}>Recent</Text>
        <View style={styles.filterRow}>
          {filterDate ? (
            <TouchableOpacity onPress={() => setFilterDate(null)} style={styles.clearFilterBtn}>
              <Text style={styles.clearFilterText}>Clear Filter</Text>
            </TouchableOpacity>
          ) : <View />}
          <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.filterBtn}>
            <Ionicons name="calendar-outline" size={24} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      {showDatePicker && (
        <DateTimePicker
          value={filterDate || new Date()}
          mode="date"
          display="default"
          onChange={onChangeDate}
        />
      )}
      
      <ScrollView style={styles.list} contentContainerStyle={styles.scrollContent}>
        {sortedDates.length === 0 && (
          <Text style={styles.empty}>No history recorded for this period.</Text>
        )}

        {sortedDates.map(dateKey => (
          <View key={dateKey}>
            <View style={styles.dateDivider}>
              <Text style={styles.dateDividerText}>{getDayLabel(dateKey)}</Text>
            </View>
            
            {groupedLogs[dateKey].map((log) => (
              <View key={log.id} style={styles.logCard}>
                <View style={styles.logLeft}>
                  <Text style={styles.name}>{log.medicationName}</Text>
                  <Text style={styles.time}>{format(parseISO(log.completedAt), 'h:mm a')}</Text>
                </View>
                <View style={styles.statusBadge}>
                  <Text style={[styles.status, log.action === 'taken' ? styles.taken : styles.skipped]}>
                    {log.action.toUpperCase()}
                  </Text>
                </View>
              </View>
            ))}
          </View>
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
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  clearFilterBtn: {
    padding: 8,
  },
  clearFilterText: {
    color: colors.primary,
    fontWeight: 'bold',
  },
  filterBtn: {
    padding: 4,
  },
  list: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  empty: {
    fontSize: 16,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 40,
  },
  dateDivider: {
    alignSelf: 'flex-start',
    marginVertical: 12,
    marginTop: 20,
  },
  dateDividerText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.textMuted,
  },
  logCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  logLeft: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  time: {
    fontSize: 14,
    color: colors.textMuted,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: colors.background,
  },
  status: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.textMuted,
  },
  taken: {
    color: colors.success,
  },
  skipped: {
    color: colors.danger,
  },
});
