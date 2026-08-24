import { Platform } from 'react-native';
import notifee, { 
  TimestampTrigger, 
  TriggerType, 
  AndroidImportance, 
  AndroidVisibility,
  AndroidCategory
} from '@notifee/react-native';

export async function requestNotificationPermissions() {
  try {
    const settings = await notifee.requestPermission({
      sound: true,
      announcement: true,
      alert: true,
    });
    return settings.authorizationStatus >= 1;
  } catch (e) {
    console.log("Permission request failed", e);
    return false;
  }
}

export async function configureNotifications() {
  if (Platform.OS === 'android') {
    try {
      await notifee.createChannel({
        id: 'medication-alarms-v5',
        name: 'Medication Alarms',
        importance: AndroidImportance.HIGH,
        vibration: true,
        vibrationPattern: [300, 500, 300, 500],
        lightColor: '#FF231F7C',
        sound: 'default',
        bypassDnd: true, // Wake device even on Do Not Disturb
      });
    } catch (e) {
      console.log("Failed to create channel", e);
    }
  }
}

export async function scheduleMedicationNotification(
  title: string,
  body: string,
  date: Date,
  data: any,
  soundUri?: string | null
) {
  try {
    const trigger: TimestampTrigger = {
      type: TriggerType.TIMESTAMP,
      timestamp: date.getTime(),
      alarmManager: true, 
    };

    const id = `med-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    await notifee.createTriggerNotification({
      id,
      title,
      body,
      data,
      android: {
        channelId: 'medication-alarms-v5',
        importance: AndroidImportance.HIGH,
        visibility: AndroidVisibility.PUBLIC,
        category: AndroidCategory.ALARM,
        loopSound: true,
        sound: 'default',
        // Full screen action wakes the device when locked
        fullScreenAction: {
          id: 'default',
        },
      },
    }, trigger);

    return id;
  } catch (e) {
    console.error("Failed to schedule notification", e);
    return null;
  }
}

export async function cancelMedicationNotification(notificationId: string) {
  try {
    if (notificationId) {
      await notifee.cancelNotification(notificationId);
    }
  } catch (e) {
    console.log("Failed to cancel notification", e);
  }
}

export async function cancelAllMedicationNotifications() {
  try {
    await notifee.cancelAllNotifications();
  } catch (e) {
    console.log("Failed to cancel all notifications", e);
  }
}
