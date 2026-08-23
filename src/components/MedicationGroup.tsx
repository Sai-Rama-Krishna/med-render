import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MedicationCard } from './MedicationCard';
import { useTheme } from '../context/ThemeContext';
import { parse, format } from 'date-fns';

interface Props {
  time: string;
  occurrences: any[];
  onMedicationPress?: (occurrence: any) => void;
  onMedicationEdit?: (occurrence: any) => void;
}

export function MedicationGroup({ time, occurrences, onMedicationPress, onMedicationEdit }: Props) {
  const { colors } = useTheme();
  const styles = getStyles(colors);

  const takenCount = occurrences.filter(o => o.status === 'taken').length;
  const totalCount = occurrences.length;
  const dueCount = totalCount - takenCount;
  
  const formattedTime = format(parse(time, 'HH:mm', new Date()), 'h:mm a');

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.time}>{formattedTime}</Text>
        <Text style={styles.summary}>
          {takenCount} Taken · {dueCount} Due
        </Text>
      </View>
      {occurrences.map((occ) => (
        <MedicationCard
          key={occ.id}
          medicationName={occ.medicationName}
          quantity={occ.quantity}
          status={occ.status}
          imageUri={occ.imageUri}
          scheduledAt={occ.scheduledAt}
          time={occ.time}
          onPress={onMedicationPress ? () => onMedicationPress(occ) : undefined}
          onTakePress={onMedicationPress ? () => onMedicationPress(occ) : undefined}
          onEditPress={onMedicationEdit ? () => onMedicationEdit(occ) : undefined}
        />
      ))}
    </View>
  );
}

const getStyles = (colors: any) => StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 12,
  },
  time: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.primary,
  },
  summary: {
    fontSize: 16,
    color: colors.textMuted,
    fontWeight: 'bold',
  },
});
