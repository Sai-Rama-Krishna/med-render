import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useTheme } from '../../src/context/ThemeContext';
import { useState } from 'react';
import { clearAllData } from '../../src/database/database';
import { Ionicons } from '@expo/vector-icons';

export default function SettingsScreen() {
  const { colors, mode, setMode } = useTheme();
  const styles = getStyles(colors);
  
  const handleClearData = () => {
    Alert.alert(
      'Clear All Data',
      'Are you sure you want to delete all medications, history, and schedules? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Yes, Delete Everything', 
          style: 'destructive',
          onPress: async () => {
            try {
              await clearAllData();
              Alert.alert('Success', 'All data has been cleared.');
            } catch (e) {
              console.error(e);
              Alert.alert('Error', 'Failed to clear data.');
            }
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Settings</Text>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Display Theme</Text>
        <Text style={styles.description}>
          Choose your preferred app theme.
        </Text>
        <View style={styles.themeSelector}>
          {(['system', 'light', 'dark'] as const).map((themeOption) => (
            <TouchableOpacity
              key={themeOption}
              style={[
                styles.themeButton,
                mode === themeOption && styles.themeButtonActive
              ]}
              onPress={() => setMode(themeOption)}
            >
              <Text style={[
                styles.themeButtonText,
                mode === themeOption && styles.themeButtonTextActive
              ]}>
                {themeOption.charAt(0).toUpperCase() + themeOption.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={[styles.section, { marginTop: 24 }]}>
        <Text style={[styles.sectionTitle, { color: colors.danger }]}>Danger Zone</Text>
        <Text style={styles.description}>
          Permanently delete all your medications, logs, and schedules from the app.
        </Text>
        <TouchableOpacity style={styles.dangerButton} onPress={handleClearData}>
          <Ionicons name="trash-outline" size={18} color="#ffffff" style={{ marginRight: 8 }} />
          <Text style={styles.buttonText}>Clear All Data</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const getStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 16,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: colors.text,
  },
  section: {
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 12,
    elevation: 1,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: colors.textMuted,
    marginBottom: 16,
  },
  themeSelector: {
    flexDirection: 'row',
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: 4,
  },
  themeButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 6,
  },
  themeButtonActive: {
    backgroundColor: colors.card,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  themeButtonText: {
    color: colors.textMuted,
    fontWeight: '600',
  },
  themeButtonTextActive: {
    color: colors.text,
  },
  button: {
    backgroundColor: colors.primary,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 8,
  },
  dangerButton: {
    backgroundColor: colors.danger,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  successText: {
    marginTop: 8,
    color: colors.success,
    fontSize: 14,
  },
  audioPreviewContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.background,
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  audioFileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  audioFileName: {
    marginLeft: 8,
    fontSize: 14,
    color: colors.text,
    flex: 1,
  },
  playButton: {
    backgroundColor: colors.primary,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
