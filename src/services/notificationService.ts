import notifee, { TimestampTrigger, TriggerType, RepeatFrequency, AndroidImportance } from '@notifee/react-native';

// ─── Channel IDs ───────────────────────────────────────────────────────────────
const CHANNEL_REMINDERS = 'melodify-reminders';
const CHANNEL_FESTIVE = 'festive-greetings';
const CHANNEL_COLLAB = 'collab-updates';
const CHANNEL_SLEEP = 'sleep';

// Shared large icon (app logo) for all notifications
const APP_ICON = 'ic_launcher';

export const setupNotifications = async () => {
  // Request permissions (required for iOS and Android 13+)
  await notifee.requestPermission();

  // Create channel (required for Android)
  const channelId = await notifee.createChannel({
    id: CHANNEL_REMINDERS,
    name: 'Melodify Reminders',
    importance: AndroidImportance.DEFAULT,
  });

  // Clear existing triggers to avoid duplicates
  await notifee.cancelAllNotifications();

  // ── 3× Daily Reminders ─────────────────────────────────────────────────────
  // Morning: 9:00 AM
  await scheduleNotification('Good Morning! 🌅', 'Start your day with some fresh beats on Melodify.', 9, 0, channelId);
  // Afternoon: 2:00 PM
  await scheduleNotification('Afternoon Vibe ☕', 'Take a break and listen to your favorite tracks.', 14, 0, channelId);
  // Night: 9:00 PM
  await scheduleNotification('Winding Down? 🌙', 'Relax with some soothing melodies before bed.', 21, 0, channelId);

  // ── Festival Notifications ─────────────────────────────────────────────────
  const cy = new Date().getFullYear();
  await scheduleFestivalNotification('Merry Christmas! 🎄', 'Warm wishes and happy holidays from Melodify.', new Date(cy, 11, 25, 9, 0, 0), channelId);
  await scheduleFestivalNotification('Happy New Year! 🎉', `Wishing you a musical ${cy + 1}!`, new Date(cy + 1, 0, 1, 9, 0, 0), channelId);
};

const scheduleFestivalNotification = async (title: string, body: string, date: Date, channelId: string) => {
  if (date <= new Date()) return; // Already passed

  const trigger: TimestampTrigger = {
    type: TriggerType.TIMESTAMP,
    timestamp: date.getTime(),
  };

  await notifee.createTriggerNotification(
    {
      id: `fest_${date.getTime()}`,
      title,
      body,
      android: {
        channelId,
        smallIcon: APP_ICON,
        largeIcon: APP_ICON,
        color: '#ec4899',
        pressAction: { id: 'default' },
      },
    },
    trigger,
  );
};

const scheduleNotification = async (title: string, body: string, hour: number, minute: number, channelId: string) => {
  const now = new Date();
  const date = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hour, minute, 0);

  // If the time has already passed today, schedule for tomorrow
  if (date <= now) {
    date.setDate(date.getDate() + 1);
  }

  const trigger: TimestampTrigger = {
    type: TriggerType.TIMESTAMP,
    timestamp: date.getTime(),
    repeatFrequency: RepeatFrequency.DAILY,
  };

  await notifee.createTriggerNotification(
    {
      title,
      body,
      android: {
        channelId,
        smallIcon: APP_ICON,
        largeIcon: APP_ICON,      // App icon shown prominently in notification
        color: '#ec4899',
        pressAction: { id: 'default' },
      },
    },
    trigger,
  );
};

export const scheduleInactivityReminder = async () => {
  try {
    const channelId = CHANNEL_REMINDERS;
    await notifee.cancelNotification('inactivity_reminder');

    const date = new Date(Date.now());
    date.setDate(date.getDate() + 3);
    date.setHours(20, 0, 0, 0);

    const trigger: TimestampTrigger = {
      type: TriggerType.TIMESTAMP,
      timestamp: date.getTime(),
    };

    await notifee.createTriggerNotification(
      {
        id: 'inactivity_reminder',
        title: 'We miss your vibe! 🎵',
        body: 'Come back and listen to your favorite tracks on Melodify.',
        android: {
          channelId,
          smallIcon: APP_ICON,
          largeIcon: APP_ICON,
          pressAction: { id: 'default' },
        },
      },
      trigger,
    );
  } catch (e) {
    console.error('Failed to schedule inactivity reminder', e);
  }
};

export const triggerFestiveNotification = async (greetingMessage: string) => {
  try {
    const channelId = await notifee.createChannel({
      id: CHANNEL_FESTIVE,
      name: 'Festive Greetings',
      importance: AndroidImportance.HIGH,
    });

    await notifee.displayNotification({
      title: '🎉 Something Special Today!',
      body: greetingMessage,
      android: {
        channelId,
        smallIcon: APP_ICON,
        largeIcon: APP_ICON,
        pressAction: { id: 'default' },
      },
    });
  } catch (e) {
    console.log('Failed to show festive notification', e);
  }
};

export const triggerCollabNotification = async (songTitle: string, playlistName: string) => {
  try {
    const channelId = await notifee.createChannel({
      id: CHANNEL_COLLAB,
      name: 'Collaboration Updates',
      importance: AndroidImportance.HIGH,
    });
    await notifee.displayNotification({
      title: `🎵 New song added to "${playlistName}"`,
      body: `"${songTitle}" was just added to your collab playlist!`,
      android: {
        channelId,
        smallIcon: APP_ICON,
        largeIcon: APP_ICON,
        pressAction: { id: 'default' },
      },
    });
  } catch (e) {
    console.log('Failed to show collab notification', e);
  }
};

// ─── Sleep Timer Warning Notification ──────────────────────────────────────────
export const triggerSleepWarningNotification = async () => {
  try {
    const channelId = await notifee.createChannel({
      id: CHANNEL_SLEEP,
      name: 'Sleep Timer',
      importance: AndroidImportance.HIGH,
    });
    await notifee.displayNotification({
      title: '😴 Sleep Timer Ending Soon',
      body: 'Playback will pause in 10 seconds. Tap to cancel.',
      android: {
        channelId,
        smallIcon: APP_ICON,
        largeIcon: APP_ICON,
        pressAction: { id: 'default' },
      },
    });
  } catch (e) {
    console.warn('Timer warning notification failed', e);
  }
};
