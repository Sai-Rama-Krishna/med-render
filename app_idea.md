# Build a React Native Expo Medication Reminder App — Version 1

Build a complete, production-quality **Medication Reminder mobile application** using **React Native + Expo + TypeScript**.

The primary user is an elderly parent who needs a very simple and reliable way to remember medicines.

The application must work **100% locally/offline in Version 1**.

Do not create a backend.

---

# 1. V1 Scope

Build ONLY the following functionality:

* Add medicines
* Optional medicine image
* Daily schedule
* Weekly schedule
* Every N days schedule
* Multiple medication times per day
* Multiple medicines at the same scheduled time
* Group medicines that are due at the same time
* Checkbox selection for each medicine
* Select All
* Swipe to mark selected medicines as Taken
* Snooze
* Local notification/alarm
* Custom notification sounds
* Sound preview
* Vibration
* Medication history
* Taken / skipped / missed status
* Edit medicine
* Pause/resume medicine
* Delete medicine
* Local SQLite storage

Do NOT implement:

* Backend
* Firebase
* AWS
* Authentication
* User accounts
* Cloud sync
* Caregivers
* WhatsApp
* Telegram
* AI
* X-rays
* Prescriptions
* Medical records
* Doctor management

Those are future versions.

---

# 2. Technology

Use:

* React Native
* Expo
* TypeScript
* Expo Router
* Expo Notifications
* Expo SQLite
* Expo Image Picker
* React Native Gesture Handler
* Reanimated if needed for the swipe interaction

Use the latest stable Expo-compatible APIs.

Keep dependencies minimal.

Do not add a backend.

---

# 3. Main Navigation

Use three main sections:

1. Home
2. History
3. Settings

The Home screen must have a prominent:

**+ Add Medicine**

button.

---

# 4. Home Screen

The home screen should show today's medications grouped by scheduled time.

Example:

## Today

Sunday, August 23

### 9:00 AM

3 medicines

💊 Blood Pressure Tablet — 1 tablet
💊 Vitamin D — 1 tablet
💊 Calcium — 1 tablet

Status:

**2 Taken · 1 Due**

---

### 2:00 PM

1 medicine

💊 Antibiotic — 1 tablet

---

### 9:00 PM

2 medicines

💊 Blood Pressure Tablet — 1 tablet
💊 Vitamin D — 1 tablet

---

Use clear status indicators:

* Upcoming
* Due
* Taken
* Snoozed
* Skipped
* Missed

Keep the UI extremely simple.

Use large text and large touch targets suitable for an elderly user.

---

# 5. Add Medicine Screen

Create a simple form.

## Medicine Name

Required.

Example:

Blood Pressure Tablet

---

## Medicine Image

Optional.

Allow the user to:

* Select an image from gallery
* Take a photo if supported

Store the image locally.

Do not upload the image anywhere.

---

# 6. Frequency

Allow:

### Daily

Example:

Every day.

### Weekly

Allow the user to select one or more weekdays.

Example:

Monday
Wednesday
Friday

### Every N Days

Allow:

1 day
2 days
3 days
4 days
...
30 days

Example:

Every 3 days.

---

# 7. Start and End Date

Allow:

Start date

Default to today.

End date

Optional.

Provide:

**No end date**

when the medication continues indefinitely.

---

# 8. Multiple Medication Times

A single medicine can have multiple doses per day.

Example:

Blood Pressure Tablet

9:00 AM
1 tablet

9:00 PM
1 tablet

Provide:

**+ Add another time**

Each dose should contain:

* Time
* Quantity

Quantity can initially be free text.

Examples:

1 tablet
2 tablets
5 ml
1 capsule

Do not build a complicated medical dosage system in V1.

---

# 9. Multiple Medicines at the Same Time

This is extremely important.

Different medicines can have the same scheduled time.

Example:

9:00 AM

* Blood Pressure Tablet
* Vitamin D
* Calcium
* Thyroid Tablet

These must be treated as separate medication doses internally.

But the reminder screen should group them into one reminder event.

---

# 10. Reminder Screen

When multiple medicines are due at the same time, show them together.

Example:

# Medicine Time

### 9:00 AM

Select the medicines that were taken.

☑ Blood Pressure Tablet
1 tablet

☑ Vitamin D
1 tablet

☐ Calcium
1 tablet

☑ Thyroid Tablet
1 tablet

Provide:

**Select All**

and:

**Clear All**

The user should be able to individually check/uncheck medicines.

---

# 11. Swipe To Take

At the bottom of the reminder screen provide a large swipe control:

**Swipe → Taken**

When the user swipes:

Only the selected medicines are marked as Taken.

Example:

Selected:

☑ Blood Pressure Tablet
☑ Vitamin D
☐ Calcium
☑ Thyroid Tablet

After swipe:

Blood Pressure Tablet → Taken

Vitamin D → Taken

Thyroid Tablet → Taken

Calcium → Remains Due

DO NOT mark all medicines as Taken automatically.

This distinction is critical.

---

# 12. Individual Medication Records

Every medication dose must have its own scheduled occurrence.

Example:

9:00 AM:

Blood Pressure Tablet
Scheduled: 9:00 AM
Taken: 9:06 AM

Vitamin D
Scheduled: 9:00 AM
Taken: 9:06 AM

Calcium
Scheduled: 9:00 AM
Status: Due

Do not store only a single "9 AM reminder completed" record.

Each medication dose must be independently tracked.

---

# 13. Snooze

Provide:

* Snooze 5 minutes
* Snooze 10 minutes
* Snooze 30 minutes

Use local notifications for snoozing.

Do not use:

setTimeout()
setInterval()

as the actual reminder mechanism.

When snoozed:

1. Save the snooze event.
2. Schedule a new local notification.
3. When it fires, open/show the reminder flow again.
4. Allow the user to select medicines again.
5. Allow another snooze or Taken.

---

# 14. Skip

Provide:

**Skip**

If the user selects specific medicines and chooses Skip, mark only those selected medicines as skipped.

Show a confirmation:

"Skip selected medicines?"

Buttons:

Cancel
Skip

---

# 15. Notification System

Use Expo Notifications.

Notifications must work when:

* App is open
* App is in background
* App is closed
* Phone is locked

Do not rely on JavaScript timers.

Create a dedicated service:

`notificationService.ts`

Functions should include:

* requestNotificationPermissions()
* configureNotifications()
* scheduleMedicationNotification()
* cancelMedicationNotification()
* cancelMedicationNotifications()
* scheduleSnoozeNotification()
* rescheduleMedication()
* rescheduleAllMedications()

Keep notification logic outside UI components.

---

# 16. Notification Sound

The app must support custom built-in reminder sounds.

Include several bundled sounds, for example:

* Classic Alarm
* Bell
* Loud Alert
* Gentle Reminder
* Morning Alarm

The exact audio files can be placeholders initially if required, but the architecture must support bundled local audio files.

The user must be able to select a sound.

Provide:

**▶ Preview**

so the user can hear the selected sound.

The selected sound should be used for medication notifications where the platform supports custom notification sounds.

Do NOT claim that the application can force the notification volume above the phone's system volume.

The app should instead use:

* Custom sound
* Appropriate notification importance
* Vibration
* Strong notification behavior supported by the operating system

---

# 17. Notification Settings

Create Settings → Reminder Settings.

Options:

### Reminder Sound

Select sound.

### Vibration

On / Off

### Sound Preview

Preview selected sound.

### Default Snooze

5 minutes
10 minutes
30 minutes

### Reminder Behavior

Normal
Strong

Implement only behavior supported by Android/iOS.

Do not use unsupported OS hacks.

---

# 18. Android Notification Behavior

Configure an appropriate Android notification channel.

Use a high-importance channel for medication reminders where supported.

Configure:

* Sound
* Vibration
* Importance
* Notification title
* Notification body

Use the appropriate Expo APIs for the current Expo SDK.

Do not assume that changing notification properties after a channel has been created will always modify the existing Android channel. Handle channel creation/versioning correctly.

---

# 19. iOS Notification Behavior

Request notification permissions.

Support:

* Sound
* Badge if useful
* Notification interaction

Respect Apple's notification restrictions.

Do not pretend that the application can forcibly take over the lock screen or bypass iOS system controls.

The goal is the strongest reliable reminder behavior that Expo/iOS officially supports.

---

# 20. Alarm Reminder Screen

When the user opens a medication notification, navigate to the reminder screen.

The screen should display:

* Medicine group
* Scheduled time
* Medicine image if available
* Medicine name
* Quantity
* Checkbox
* Select All
* Clear All
* Snooze buttons
* Skip
* Swipe → Taken

The screen should be visually strong but simple.

Example:

---

🔔

# Medicine Time

### 9:00 AM

☑ BP Tablet
1 tablet

☑ Vitamin D
1 tablet

☐ Calcium
1 tablet

[ Select All ]

[ Snooze 5 min ]

[ Snooze 30 min ]

**← Swipe to Taken →**

[ Skip ]

---

---

# 21. Medication History

Create a History screen.

Show:

Date
Medicine
Scheduled time
Status
Actual taken time

Example:

## August 23

9:00 AM

BP Tablet
Taken at 9:06 AM

Vitamin D
Taken at 9:06 AM

Calcium
Skipped

---

# 22. Medication Details

When the user taps a medicine, show:

* Image
* Name
* Frequency
* Schedule
* Quantity
* Start date
* End date
* Reminder sound
* Active/paused state

Actions:

Edit
Pause
Resume
Delete

Show confirmation before deleting.

---

# 23. Pause Medicine

A medication can be temporarily paused.

When paused:

* Do not trigger reminders.
* Keep historical records.
* Keep the medication in the database.
* Allow Resume later.

When resumed:

* Recalculate future notifications.
* Schedule them again.

---

# 24. Editing Medication

When the user edits:

* Time
* Frequency
* Start date
* End date
* Days
* Image
* Quantity

The application must:

1. Cancel old future notifications.
2. Update SQLite.
3. Recalculate the schedule.
4. Schedule new notifications.
5. Save new notification IDs.

Never leave obsolete notifications active.

---

# 25. Deleting Medication

When deleting:

1. Ask for confirmation.
2. Cancel future notifications.
3. Delete/disable future schedule records.
4. Preserve historical records where appropriate.

Do not accidentally delete medication history unless explicitly designed to do so.

---

# 26. Database

Use Expo SQLite.

Create a schema that separates medicines, doses, scheduled occurrences, notifications, and logs.

Suggested tables:

## medications

* id
* name
* imageUri
* frequency
* intervalDays
* startDate
* endDate
* active
* createdAt
* updatedAt

## medication_days

* id
* medicationId
* weekday

Use this for weekly schedules.

## medication_doses

* id
* medicationId
* time
* quantity
* createdAt

## medication_occurrences

Each actual scheduled dose should have its own occurrence.

Fields:

* id
* medicationId
* doseId
* scheduledAt
* status
* createdAt

Status:

upcoming
due
taken
skipped
missed
snoozed

## medication_notifications

* id
* occurrenceId
* notificationId
* scheduledAt
* status

## medication_logs

* id
* occurrenceId
* medicationId
* doseId
* action
* scheduledAt
* completedAt
* createdAt

Actions:

taken
skipped
snoozed

This structure is intentional because future versions may need synchronization with caregivers.

---

# 27. Future Compatibility

Do not build cloud synchronization in V1.

However, design the database so that future versions can synchronize medication events.

Every important entity should have a stable unique ID.

Use UUIDs or another collision-resistant local ID strategy.

Do not rely only on SQLite auto-increment IDs if future cloud synchronization will be required.

Future versions may add:

* Caregivers
* Multiple caregiver accounts
* Push notifications
* Missed-medication alerts
* Phone last-seen/heartbeat
* Battery status where available
* Telegram
* WhatsApp
* Firebase Functions
* AWS Lambda
* Medical records
* Prescriptions
* X-rays
* AI

Do not implement these now.

---

# 28. Date and Time

Medication reminders are time-sensitive.

Use the device's local timezone.

Correctly handle:

* Daily schedules
* Weekly schedules
* Every N days
* Multiple doses
* Start dates
* End dates
* Multiple medicines at the same time

Do not blindly convert medication times to UTC and then schedule them without considering local timezone behavior.

If the device timezone changes, provide a reliable way to recalculate future notifications.

---

# 29. App Restart

After restarting the application:

* Read medications from SQLite.
* Recalculate/check future schedules.
* Verify notification registrations where possible.
* Recreate missing future notifications if necessary.

Do not assume the JavaScript process is always running.

---

# 30. Device Restart

Design notification scheduling so the application can recover as reliably as the underlying platform allows after device restart.

Do not depend on in-memory state.

All important medication schedule information must be persisted in SQLite.

---

# 31. Permissions

On first use:

Explain why notifications are needed.

Request notification permission.

Only request image/media permission when the user chooses to add a medicine image.

If notification permission is denied:

Show a clear message:

"Medication reminders need notification permission."

Provide an appropriate way to open system settings where supported.

---

# 32. Elderly-Friendly Design

This is a major requirement.

The application is intended for a parent.

Therefore:

* Large fonts
* Large buttons
* Large checkbox areas
* High contrast
* Minimal text
* Simple navigation
* Clear labels
* Clear status
* Avoid tiny icons
* Avoid complicated menus
* Avoid unnecessary animations
* Use confirmation for destructive actions

The primary action must always be obvious.

The user should not need technical knowledge.

---

# 33. Accessibility

Support:

* Dynamic font sizes where practical
* Screen reader labels
* Accessible button labels
* Sufficient touch target sizes
* Clear focus behavior
* Meaningful accessibility labels

The checkbox should be accessible as:

"Blood Pressure Tablet, 1 tablet, not selected"

and when selected:

"Blood Pressure Tablet, 1 tablet, selected"

---

# 34. Error Handling

Handle:

* Notification permission denied
* Notification scheduling failure
* Invalid medication time
* Invalid date range
* Database failure
* Image selection failure
* Image permission denied
* Notification cancellation failure

Never silently fail.

Show a simple user-friendly error message.

Log technical details for development/debugging.

---

# 35. Project Structure

Use a clean structure similar to:

app/
_layout.tsx
index.tsx
history.tsx
settings.tsx
add-medication.tsx
medication/
[id].tsx
reminder/
[id].tsx

src/
components/
MedicationCard.tsx
MedicationGroup.tsx
MedicationCheckbox.tsx
SelectAllButton.tsx
SwipeToTaken.tsx
SnoozeButtons.tsx

database/
database.ts
migrations.ts
medicationsRepository.ts
occurrencesRepository.ts
logsRepository.ts

services/
notificationService.ts
medicationScheduler.ts
imageService.ts

hooks/
useMedications.ts
useMedicationReminder.ts

types/
medication.ts
notification.ts

utils/
dateUtils.ts
scheduleUtils.ts

constants/
sounds.ts
colors.ts

Keep UI components separate from database and scheduling logic.

---

# 36. Scheduling Architecture

Use this conceptual architecture:

User creates medicine
↓
Save medicine
↓
Create doses
↓
Generate occurrences
↓
Schedule local notifications
↓
Save notification IDs
↓
Notification fires
↓
User opens reminder
↓
Show all medicines due at that time
↓
User selects medicines
↓
Snooze / Skip / Swipe Taken
↓
Update individual occurrence records
↓
Update history
↓
Schedule/cancel notifications as required

---

# 37. Important Grouping Rule

Do not group medicines permanently in the database.

Group them dynamically when their scheduled occurrences fall within the same reminder time/event.

For example:

9:00 AM:

Medicine A
Medicine B
Medicine C

should appear as one reminder group.

But internally they remain:

Occurrence A
Occurrence B
Occurrence C

This allows one medicine to be taken while another remains due.

---

# 38. Missed Medication Logic

If a scheduled medication has not been marked Taken or Skipped after an appropriate period, mark it as:

**Missed**

Do not immediately mark it missed at the exact scheduled time.

Create a configurable grace period.

For V1, use a reasonable default such as 60 minutes.

Example:

Scheduled:
9:00 AM

At:
9:00 AM → Due

At:
10:00 AM → Missed if still unresolved

Keep this logic configurable in code so it can be changed later.

---

# 39. Snooze Logic

If a medication is snoozed:

Do not mark it Taken.

The occurrence remains unresolved.

Example:

9:00 AM
Due

9:05 AM
Snoozed

9:35 AM
Reminder again

10:00 AM
Missed if still unresolved

When the user eventually marks it Taken:

Record:

Scheduled:
9:00 AM

Taken:
9:42 AM

This distinction is important for future medication adherence statistics.

---

# 40. Testing Requirements

Before considering V1 complete, test:

### Medication CRUD

* Create
* Read
* Edit
* Pause
* Resume
* Delete

### Frequencies

* Daily
* Weekly
* Every N days

### Doses

* One dose
* Multiple doses
* Multiple medicines at same time

### Reminder

* Notification
* Sound
* Vibration
* Reminder screen

### Selection

* Select one
* Select multiple
* Select all
* Clear all

### Actions

* Taken
* Skip
* Snooze

### History

* Correct scheduled time
* Correct actual taken time
* Correct status

### App lifecycle

* App open
* Background
* App closed
* Phone locked
* App restarted

### Editing

* Change time
* Change frequency
* Change date
* Delete medicine
* Pause/resume

---

# 41. Important Implementation Rule

Do not build a fake demo.

This must be a real working application.

Do not use:

* Fake notification timers
* Mock database arrays
* Hardcoded medicines
* Fake history
* Fake alarm screens

Use real Expo Notifications and real SQLite.

If a platform limitation prevents a requested behavior, implement the closest officially supported behavior and clearly isolate the limitation.

---

# 42. Build Order

Implement in this order:

### Phase 1

Project setup and navigation.

### Phase 2

SQLite database and migrations.

### Phase 3

Medication CRUD.

### Phase 4

Medication scheduling engine.

### Phase 5

Local notification service.

### Phase 6

Home screen and medication grouping.

### Phase 7

Reminder screen.

### Phase 8

Checkbox selection and Select All.

### Phase 9

Swipe → Taken.

### Phase 10

Snooze and Skip.

### Phase 11

History.

### Phase 12

Settings and notification sound selection.

### Phase 13

Edge cases and lifecycle recovery.

### Phase 14

Testing and cleanup.

Do not move to the next phase while the previous phase contains broken core functionality.

---

# Final Requirement

The final V1 should feel like a **simple personal medicine alarm**, not a hospital application.

The most important user flow is:

**Add medicine → Set time → Receive alarm → See all medicines due → Select medicines → Swipe Taken → Save individual records.**

Everything else is secondary.

Build the application around this flow first.
