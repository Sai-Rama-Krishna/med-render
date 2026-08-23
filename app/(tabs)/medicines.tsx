import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Image } from 'react-native';
import { useTheme } from '../../src/context/ThemeContext';
import { useState, useCallback } from 'react';
import { getMedications, deleteMedication } from '../../src/database/medicationsRepository';
import { MedicationWithDoses } from '../../src/types/medication';
import { useFocusEffect, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function MedicinesScreen() {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  
  const [medications, setMedications] = useState<MedicationWithDoses[]>([]);

  const fetchMedications = useCallback(async () => {
    try {
      const data = await getMedications();
      setMedications(data);
    } catch (e) {
      console.error(e);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchMedications();
    }, [fetchMedications])
  );

  const handleDelete = (id: string, name: string) => {
    Alert.alert(
      'Delete Medication',
      `Are you sure you want to delete ${name}? This will also delete all its history and upcoming schedules.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteMedication(id);
              fetchMedications();
            } catch (e) {
              console.error(e);
              Alert.alert('Error', 'Failed to delete medication');
            }
          }
        }
      ]
    );
  };

  const getFrequencyText = (med: MedicationWithDoses) => {
    if (med.frequency === 'daily') return 'Daily';
    if (med.frequency === 'interval') return `Every ${med.intervalDays} days`;
    if (med.frequency === 'weekly' && med.days) {
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      return med.days.map(d => days[d.weekday]).join(', ');
    }
    return '';
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {medications.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No medications saved.</Text>
          </View>
        )}

        {medications.map(med => (
          <View key={med.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.titleRow}>
                {med.imageUri ? (
                  <Image source={{ uri: med.imageUri }} style={styles.medIcon} />
                ) : (
                  <View style={[styles.medIcon, { backgroundColor: colors.border, justifyContent: 'center', alignItems: 'center' }]}>
                    <Ionicons name="medical" size={24} color={colors.textMuted} />
                  </View>
                )}
                <View>
                  <Text style={styles.medName}>{med.name}</Text>
                  <Text style={styles.frequency}>{getFrequencyText(med)}</Text>
                </View>
              </View>
              
              <View style={styles.actionRow}>
                <TouchableOpacity 
                  style={styles.actionBtn} 
                  onPress={() => router.push(`/add-medication?id=${med.id}`)}
                >
                  <Ionicons name="pencil" size={20} color={colors.primary} />
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.actionBtn} 
                  onPress={() => handleDelete(med.id, med.name)}
                >
                  <Ionicons name="trash" size={20} color={colors.danger} />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.dosesContainer}>
              <Text style={styles.dosesTitle}>Scheduled Times:</Text>
              <View style={styles.dosesList}>
                {med.doses.map((dose, i) => (
                  <View key={i} style={styles.doseBadge}>
                    <Text style={styles.doseTime}>{dose.time}</Text>
                    <Text style={styles.doseQty}>{dose.quantity} dose(s)</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        ))}
      </ScrollView>

      <TouchableOpacity 
        style={styles.fab} 
        onPress={() => router.push('/add-medication')}
      >
        <Text style={styles.fabText}>+ Add Medicine</Text>
      </TouchableOpacity>
    </View>
  );
}

const getStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  emptyState: {
    padding: 24,
    alignItems: 'center',
    marginTop: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: colors.textMuted,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  medIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  medName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  frequency: {
    fontSize: 14,
    color: colors.textMuted,
    marginTop: 2,
  },
  actionRow: {
    flexDirection: 'row',
  },
  actionBtn: {
    padding: 8,
    marginLeft: 8,
    backgroundColor: colors.background,
    borderRadius: 20,
  },
  dosesContainer: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 12,
  },
  dosesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textMuted,
    marginBottom: 8,
  },
  dosesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  doseBadge: {
    backgroundColor: colors.infoLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  doseTime: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.info,
  },
  doseQty: {
    fontSize: 12,
    color: colors.info,
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
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
  },
});
