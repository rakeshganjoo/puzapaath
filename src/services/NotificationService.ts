import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { getJSON, setJSON } from './StorageService';
import { getProfiles } from './ProfileService';
import { getAllEventsForAllProfiles, hydrateAsync as hydrateSavedEvents } from './SavedEventsService';
import { buildDailyReminderText, DEFAULT_WATCHED_TITHIS } from './NotificationPlanner';

const SETTINGS_KEY = 'janthari_notification_settings_v1';
const SCHEDULE_HORIZON_DAYS = 45;

export type NotificationSettings = {
  enabled: boolean;
  hour: number;
  minute: number;
  watchedTithis: number[];
};

const DEFAULT_SETTINGS: NotificationSettings = {
  enabled: false,
  hour: 8,
  minute: 0,
  watchedTithis: DEFAULT_WATCHED_TITHIS,
};

let initialized = false;

export function isNotificationSupported(): boolean {
  return Platform.OS !== 'web';
}

export async function getNotificationSettings(): Promise<NotificationSettings> {
  const saved = await getJSON<NotificationSettings>(SETTINGS_KEY);
  if (!saved) return { ...DEFAULT_SETTINGS };

  const watched = Array.isArray(saved.watchedTithis)
    ? saved.watchedTithis.filter((n) => Number.isInteger(n) && n >= 1 && n <= 15)
    : [];

  return {
    enabled: !!saved.enabled,
    hour: Number.isFinite(saved.hour) ? Math.max(0, Math.min(23, saved.hour)) : DEFAULT_SETTINGS.hour,
    minute: Number.isFinite(saved.minute) ? Math.max(0, Math.min(59, saved.minute)) : DEFAULT_SETTINGS.minute,
    watchedTithis: watched.length > 0 ? watched : DEFAULT_SETTINGS.watchedTithis,
  };
}

export async function initializeNotificationsOnLaunch(): Promise<void> {
  if (!isNotificationSupported() || initialized) return;
  initialized = true;

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });

  const settings = await getNotificationSettings();
  if (settings.enabled) {
    await rescheduleDailyNotifications(settings);
  }
}

async function ensurePermissions(): Promise<boolean> {
  const isGranted = (value: unknown): boolean => {
    const permission = value as { granted?: boolean; status?: string };
    return permission.granted === true || permission.status === 'granted';
  };

  const current = await Notifications.getPermissionsAsync();
  if (isGranted(current)) return true;

  const requested = await Notifications.requestPermissionsAsync();
  return isGranted(requested);
}

async function ensureAndroidChannel(): Promise<void> {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync('daily-reminders', {
    name: 'Daily Reminders',
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#6C5CE7',
  });
}

function buildTriggerDate(base: Date, hour: number, minute: number): Date {
  const d = new Date(base);
  d.setHours(hour, minute, 0, 0);
  return d;
}

export async function rescheduleDailyNotifications(settingsOverride?: NotificationSettings): Promise<number> {
  if (!isNotificationSupported()) return 0;

  const settings = settingsOverride ?? await getNotificationSettings();
  await Notifications.cancelAllScheduledNotificationsAsync();

  if (!settings.enabled) return 0;

  const hasPermission = await ensurePermissions();
  if (!hasPermission) return 0;

  await ensureAndroidChannel();
  await hydrateSavedEvents();

  const profiles = await getProfiles();
  const events = getAllEventsForAllProfiles();

  let scheduledCount = 0;
  const now = new Date();

  for (let offset = 0; offset < SCHEDULE_HORIZON_DAYS; offset += 1) {
    const day = new Date(now);
    day.setDate(now.getDate() + offset);

    const triggerDate = buildTriggerDate(day, settings.hour, settings.minute);
    if (triggerDate.getTime() <= now.getTime() + 60_000) {
      continue;
    }

    const body = buildDailyReminderText(day, profiles, events, settings.watchedTithis);
    if (!body) continue;

    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Janthari Reminder',
        body,
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: triggerDate,
        channelId: Platform.OS === 'android' ? 'daily-reminders' : undefined,
      },
    });
    scheduledCount += 1;
  }

  return scheduledCount;
}

export async function updateNotificationSettings(
  updates: Partial<NotificationSettings>,
): Promise<{ settings: NotificationSettings; scheduledCount: number }> {
  const current = await getNotificationSettings();
  const merged: NotificationSettings = {
    ...current,
    ...updates,
    watchedTithis: updates.watchedTithis ?? current.watchedTithis,
  };

  await setJSON(SETTINGS_KEY, merged);
  const scheduledCount = await rescheduleDailyNotifications(merged);

  return {
    settings: merged,
    scheduledCount,
  };
}

export async function sendTestNotification(): Promise<boolean> {
  if (!isNotificationSupported()) return false;
  const hasPermission = await ensurePermissions();
  if (!hasPermission) return false;

  await ensureAndroidChannel();

  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Janthari Test Reminder',
      body: 'Notifications are enabled. You will get reminder alerts on important days.',
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: 2,
      channelId: Platform.OS === 'android' ? 'daily-reminders' : undefined,
    },
  });
  return true;
}
