# Implement Full-Screen "Phone Call" Style Alarm

This plan outlines the steps to finalize the true "Phone Call" / Alarm Clock experience where the screen wakes up and plays a continuous sound until the user interacts.

## Proposed Changes

### 1. `src/services/notificationService.ts`
- **[MODIFY]** Update the `notifee.createTriggerNotification` configuration to include `loopSound: true` under the `android` settings. This will make the Android system play the alarm sound continuously (for up to 1 minute or until interacted with) rather than just chiming once.

### 2. `app/_layout.tsx`
- **[MODIFY]** Implement `notifee.getInitialNotification()` inside a `useEffect` to detect if the app was launched directly by the full-screen intent from a completely closed state.
- **[MODIFY]** Implement `notifee.onForegroundEvent` to detect if the notification fired while the app was in the background but still alive.
- **Action:** When either of these listeners fires, parse the `time` from the notification payload, route the user directly to the `/reminder/[time]` screen, and cancel the notification so the looping sound stops once they are actively looking at the screen.

### 3. `app/reminder/[time].tsx`
- **[MODIFY]** Update the screen to handle cancelling the active Notifee notification ID once the screen mounts or an action is taken, ensuring the native looping sound terminates perfectly.

## Open Questions

> [!IMPORTANT]
> The Android OS requires an `alarm.wav` file to be present in your `assets/` folder for the `withAndroidAlarmSound` plugin to work. Do you already have an `alarm.wav` in your `assets` directory, or should I generate a dummy one for you to replace later?

## Verification Plan

- Run the Expo app on an Android emulator or device.
- Add a test medication for 1 minute in the future.
- Lock the phone screen.
- Verify that exactly at the scheduled time, the phone screen wakes up automatically, bypasses the lock screen, plays a continuous looping alarm sound, and immediately shows the "Medicine Time" screen.
