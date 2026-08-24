import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView, Linking, NativeModules } from 'react-native';
import { useTheme } from '../../src/context/ThemeContext';
import { useState } from 'react';
import { clearAllData } from '../../src/database/database';
import { Ionicons } from '@expo/vector-icons';

import notifee, { AndroidNotificationSetting, AndroidCategory } from '@notifee/react-native';
import { useEffect } from 'react';

const { CustomPermissions } = NativeModules;

export default function SettingsScreen() {
  const { colors, mode, setMode } = useTheme();
  const styles = getStyles(colors);
  
  const [alarmGranted, setAlarmGranted] = useState(true);
  const [batteryOptEnabled, setBatteryOptEnabled] = useState(false);
  const [overlayGranted, setOverlayGranted] = useState(false);
  const [channelSoundOk, setChannelSoundOk] = useState(false);

  useEffect(() => {
    async function checkPerms() {
      const settings = await notifee.getNotificationSettings();
      if (settings.android && settings.android.alarm === AndroidNotificationSetting.DISABLED) {
        setAlarmGranted(false);
      } else {
        setAlarmGranted(true);
      }
      
      try {
        const isBatOpt = await notifee.isBatteryOptimizationEnabled();
        setBatteryOptEnabled(isBatOpt);
        
        if (CustomPermissions && CustomPermissions.canDrawOverlays) {
          const hasOverlay = await CustomPermissions.canDrawOverlays();
          setOverlayGranted(hasOverlay);
        }
        
        // Check if v5 channel exists and is not blocked
        const channel = await notifee.getChannel('medication-alarms-v5');
        if (channel && channel.blocked === false && channel.importance === 4) {
          setChannelSoundOk(true);
        } else {
          setChannelSoundOk(false);
        }
      } catch (e) {
        console.log('Battery/Overlay check failed', e);
      }
    }
    checkPerms();
  }, []);

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
    <ScrollView style={styles.container}>
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
        <Text style={styles.sectionTitle}>Alarm Setup Checklist</Text>
        <Text style={styles.description}>
          For alarms to wake up your phone, ALL of the following must be configured correctly.
        </Text>
        
        <View style={{ marginBottom: 16 }}>
          <Text style={{ fontWeight: 'bold', marginBottom: 4 }}>1. Exact Alarms Permission</Text>
          <Text style={{ color: alarmGranted ? colors.success : colors.danger, marginBottom: 8 }}>
            Status: {alarmGranted ? '✅ Granted' : '❌ Error: Not Granted'}
          </Text>
          {!alarmGranted && (
            <TouchableOpacity style={[styles.button, { backgroundColor: colors.danger, marginBottom: 12 }]} onPress={async () => {
              try { await notifee.openAlarmPermissionSettings(); } catch(e) {}
            }}>
              <Text style={styles.buttonText}>Fix Alarm Permission</Text>
            </TouchableOpacity>
          )}

          <Text style={{ fontWeight: 'bold', marginBottom: 4 }}>2. Background Running (Battery)</Text>
          <Text style={{ color: !batteryOptEnabled ? colors.success : colors.danger, marginBottom: 8 }}>
            Status: {!batteryOptEnabled ? '✅ Unrestricted' : '❌ Error: Restricted by OS'}
          </Text>
          {batteryOptEnabled && (
            <TouchableOpacity style={[styles.button, { backgroundColor: colors.danger, marginBottom: 12 }]} onPress={async () => {
              try { await notifee.openBatteryOptimizationSettings(); } catch(e) {}
            }}>
              <Text style={styles.buttonText}>Allow Background Run</Text>
            </TouchableOpacity>
          )}

          <Text style={{ fontWeight: 'bold', marginBottom: 4 }}>3. Display Over Other Apps</Text>
          <Text style={{ color: overlayGranted ? colors.success : '#F59E0B', marginBottom: 8 }}>
            Status: {overlayGranted ? '✅ Granted' : '⚠️ Needs manual check in App Info'}
          </Text>
          {!overlayGranted && (
            <TouchableOpacity style={[styles.button, { backgroundColor: '#F59E0B', marginBottom: 12 }]} onPress={() => Linking.openSettings()}>
              <Text style={styles.buttonText}>Check Display Permission</Text>
            </TouchableOpacity>
          )}

          <Text style={{ fontWeight: 'bold', marginBottom: 4 }}>4. Notification Channel Sound</Text>
          <Text style={{ color: channelSoundOk ? colors.success : '#F59E0B', marginBottom: 8 }}>
            Status: {channelSoundOk ? '✅ Granted (High Priority)' : '⚠️ Needs manual check in Settings'}
          </Text>
          {!channelSoundOk && (
            <TouchableOpacity style={[styles.button, { backgroundColor: '#F59E0B', marginBottom: 12 }]} onPress={async () => await notifee.openNotificationSettings()}>
              <Text style={styles.buttonText}>Check Notification Sound</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity 
            style={[styles.button, { backgroundColor: '#3B82F6', marginBottom: 16 }]} 
            onPress={async () => {
              await notifee.displayNotification({
                title: 'Test Alarm',
                body: 'If you can hear this, your alarm sound is working perfectly!',
                android: {
                  channelId: 'medication-alarms-v5',
                  category: AndroidCategory.ALARM,
                  loopSound: true,
                  fullScreenAction: {
                    id: 'default'
                  }
                }
              });
            }}
          >
            <Ionicons name="volume-high-outline" size={18} color="#ffffff" style={{ marginRight: 8 }} />
            <Text style={styles.buttonText}>Test Alarm Sound Now</Text>
          </TouchableOpacity>

          <Text style={{ fontWeight: 'bold', marginBottom: 4 }}>5. Auto-Launch (Realme/Xiaomi only)</Text>
          <Text style={{ color: '#F59E0B', fontSize: 13, marginBottom: 8 }}>
            Status: ⚠️ If you have a Chinese phone, you MUST manually go to your phone Settings -> Apps -> Auto Launch and turn this ON.
          </Text>
        </View>
      </View>

      <View style={[styles.section, { marginTop: 24, marginBottom: 40 }]}>
        <Text style={[styles.sectionTitle, { color: colors.danger }]}>Danger Zone</Text>
        <Text style={styles.description}>
          Permanently delete all your medications, logs, and schedules from the app.
        </Text>
        <TouchableOpacity style={styles.dangerButton} onPress={handleClearData}>
          <Ionicons name="trash-outline" size={18} color="#ffffff" style={{ marginRight: 8 }} />
          <Text style={styles.buttonText}>Clear All Data</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
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
