import { Stack, router } from 'expo-router';
import notifee, { EventType } from '@notifee/react-native';
import { useEffect, useState } from 'react';
import { initDb, getDb } from '../src/database/database';
import { View, ActivityIndicator } from 'react-native';
import { requestNotificationPermissions, configureNotifications } from '../src/services/notificationService';
import { startOfDay } from 'date-fns';

import { StatusBar } from 'expo-status-bar';
import { ThemeProvider, useTheme } from '../src/context/ThemeContext';

// Register background event handler early
notifee.onBackgroundEvent(async ({ type, detail }) => {
  console.log('Notifee background event:', type, detail);
});

function AppContent() {
  const [dbReady, setDbReady] = useState(false);
  const { isDark, colors } = useTheme();

  useEffect(() => {
    async function setupApp() {
      try {
        await initDb();
        await configureNotifications();
        await requestNotificationPermissions();
      } catch (error) {
        console.error("App setup error:", error);
      } finally {
        setDbReady(true);
      }
    }
    setupApp();
  }, []);

  useEffect(() => {
    if (!dbReady) return;

    const interval = setInterval(async () => {
      try {
        const db = await getDb();
        const now = new Date();
        const isoNow = now.toISOString();
        
        const dueOccurrences = await db.getAllAsync<any>(
          `SELECT id, scheduledAt, medicationId FROM medication_occurrences 
           WHERE status = 'upcoming' AND scheduledAt <= $now`,
          { $now: isoNow }
        );

        if (dueOccurrences.length > 0) {
          for (const occ of dueOccurrences) {
            await db.runAsync(
              `UPDATE medication_occurrences SET status = 'due' WHERE id = $id`,
              { $id: occ.id }
            );
          }
          
          const scheduledDate = new Date(dueOccurrences[0].scheduledAt);
          const hours = scheduledDate.getHours().toString().padStart(2, '0');
          const minutes = scheduledDate.getMinutes().toString().padStart(2, '0');
          const timeString = `${hours}:${minutes}`;
          
          router.push(`/reminder/${timeString}`);
        }
      } catch (error) {
        console.error("Foreground poller error:", error);
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [dbReady]);

  if (!dbReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack screenOptions={{
        headerStyle: { backgroundColor: colors.card },
        headerTintColor: colors.text,
        contentStyle: { backgroundColor: colors.background }
      }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="add-medication" options={{ presentation: 'modal', title: 'Add Medication' }} />
        <Stack.Screen name="medication/[id]" options={{ title: 'Medication Details' }} />
        <Stack.Screen name="reminder/[time]" options={{ presentation: 'fullScreenModal', headerShown: false }} />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
