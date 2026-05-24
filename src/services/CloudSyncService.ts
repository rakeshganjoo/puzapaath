import { getJSON, setJSON } from './StorageService';
import { getActiveProfile, getProfiles, saveProfile, type UserProfile } from './ProfileService';
import { getAllEventsForAllProfiles, importEvents, type SavedEvent } from './SavedEventsService';
import {
  getAllSavedTeknisForSync,
  getAllSavedTekniTombstonesForSync,
  hydrateSavedTeknis,
  refreshSavedTekniProfileScope,
  upsertImportedSavedTeknis,
} from './SavedTekniService';
import type { SyncedSavedTekniRecord, SyncedSavedTekniTombstone } from '../types/tekni';
import { getCurrentUser, getValidIdToken } from './AuthService';

const SYNC_SETTINGS_KEY = 'janthari_sync_settings_v1';

export interface SyncSettings {
  enabled: boolean;
  endpoint: string;
  userId?: string; // optional auth identity
  authToken?: string;
  deviceId: string;
  lastSyncAt?: string;
}

export interface SyncResult {
  ok: boolean;
  pushedProfiles: number;
  pushedEvents: number;
  pushedTeknis: number;
  pushedTekniTombstones: number;
  pulledProfiles: number;
  pulledEvents: number;
  pulledTeknis: number;
  pulledTekniTombstones: number;
  message: string;
}

function randomId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

async function getOrCreateDeviceId(): Promise<string> {
  const existing = await getJSON<string>('janthari_device_id');
  if (existing) return existing;
  const next = randomId('dev');
  await setJSON('janthari_device_id', next);
  return next;
}

export async function getSyncSettings(): Promise<SyncSettings> {
  const saved = await getJSON<SyncSettings>(SYNC_SETTINGS_KEY);
  const deviceId = await getOrCreateDeviceId();
  if (saved) return { ...saved, deviceId };
  return {
    enabled: false,
    endpoint: 'https://api.janthari.com',
    deviceId,
  };
}

export async function setSyncSettings(next: Partial<SyncSettings>): Promise<SyncSettings> {
  const current = await getSyncSettings();
  const merged: SyncSettings = {
    ...current,
    ...next,
    deviceId: current.deviceId,
    endpoint: (next.endpoint ?? current.endpoint).replace(/\/$/, ''),
  };
  await setJSON(SYNC_SETTINGS_KEY, merged);
  return merged;
}

export async function setSyncEnabled(enabled: boolean): Promise<SyncSettings> {
  return setSyncSettings({ enabled });
}

export async function setSyncIdentity(userId?: string): Promise<SyncSettings> {
  return setSyncSettings({ userId: userId?.trim() || undefined });
}

export async function setSyncAuthToken(authToken?: string): Promise<SyncSettings> {
  return setSyncSettings({ authToken: authToken?.trim() || undefined });
}

export async function setSyncEndpoint(endpoint: string): Promise<SyncSettings> {
  return setSyncSettings({ endpoint });
}

export async function syncNow(): Promise<SyncResult> {
  const settings = await getSyncSettings();
  if (!settings.enabled) {
    return {
      ok: false,
      pushedProfiles: 0,
      pushedEvents: 0,
      pushedTeknis: 0,
      pushedTekniTombstones: 0,
      pulledProfiles: 0,
      pulledEvents: 0,
      pulledTeknis: 0,
      pulledTekniTombstones: 0,
      message: 'Cloud sync is disabled',
    };
  }

  const currentUser = await getCurrentUser();
  const idToken = await getValidIdToken();
  if (!currentUser || !idToken) {
    return {
      ok: false,
      pushedProfiles: 0,
      pushedEvents: 0,
      pushedTeknis: 0,
      pushedTekniTombstones: 0,
      pulledProfiles: 0,
      pulledEvents: 0,
      pulledTeknis: 0,
      pulledTekniTombstones: 0,
      message: 'Sign in with Google before running cloud sync',
    };
  }

  const activeProfile = await getActiveProfile();
  if (!activeProfile) {
    return {
      ok: false,
      pushedProfiles: 0,
      pushedEvents: 0,
      pushedTeknis: 0,
      pushedTekniTombstones: 0,
      pulledProfiles: 0,
      pulledEvents: 0,
      pulledTeknis: 0,
      pulledTekniTombstones: 0,
      message: 'Select a profile before running sync',
    };
  }

  const profiles = await getProfiles();
  const events = getAllEventsForAllProfiles();
  await hydrateSavedTeknis();
  await refreshSavedTekniProfileScope();
  const savedTeknis = getAllSavedTeknisForSync();
  const savedTekniTombstones = getAllSavedTekniTombstonesForSync();

  const payload = {
    deviceId: settings.deviceId,
    userId: currentUser.userId,
    lastSyncAt: settings.lastSyncAt,
    snapshot: {
      profiles,
      events,
      savedTeknis,
      savedTekniTombstones,
    },
  };

  const authHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${idToken}`,
  };

  const pushRes = await fetch(`${settings.endpoint}/v1/sync/push`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify(payload),
  });

  if (!pushRes.ok) {
    return {
      ok: false,
      pushedProfiles: 0,
      pushedEvents: 0,
      pushedTeknis: 0,
      pushedTekniTombstones: 0,
      pulledProfiles: 0,
      pulledEvents: 0,
      pulledTeknis: 0,
      pulledTekniTombstones: 0,
      message: `Push failed: HTTP ${pushRes.status}`,
    };
  }

  const pullRes = await fetch(
    `${settings.endpoint}/v1/sync/pull?deviceId=${encodeURIComponent(settings.deviceId)}&userId=${encodeURIComponent(currentUser.userId)}&since=${encodeURIComponent(settings.lastSyncAt ?? '')}`,
    { headers: { Authorization: `Bearer ${idToken}` } },
  );

  if (!pullRes.ok) {
    return {
      ok: false,
      pushedProfiles: profiles.length,
      pushedEvents: events.length,
      pushedTeknis: savedTeknis.length,
      pushedTekniTombstones: savedTekniTombstones.length,
      pulledProfiles: 0,
      pulledEvents: 0,
      pulledTeknis: 0,
      pulledTekniTombstones: 0,
      message: `Pull failed: HTTP ${pullRes.status}`,
    };
  }

  const data = (await pullRes.json()) as {
    ok: boolean;
    profiles?: UserProfile[];
    events?: SavedEvent[];
    savedTeknis?: SyncedSavedTekniRecord[];
    savedTekniTombstones?: SyncedSavedTekniTombstone[];
    serverTime?: string;
  };

  const pulledProfiles = data.profiles ?? [];
  const pulledEvents = data.events ?? [];
  const pulledTeknis = data.savedTeknis ?? [];
  const pulledTekniTombstones = data.savedTekniTombstones ?? [];

  for (const profile of pulledProfiles) {
    await saveProfile(profile);
  }

  importEvents(pulledEvents);
  upsertImportedSavedTeknis(pulledTeknis, pulledTekniTombstones);

  const updated = await setSyncSettings({
    lastSyncAt: data.serverTime ?? new Date().toISOString(),
  });

  return {
    ok: true,
    pushedProfiles: profiles.length,
    pushedEvents: events.length,
    pushedTeknis: savedTeknis.length,
    pushedTekniTombstones: savedTekniTombstones.length,
    pulledProfiles: pulledProfiles.length,
    pulledEvents: pulledEvents.length,
    pulledTeknis: pulledTeknis.length,
    pulledTekniTombstones: pulledTekniTombstones.length,
    message: `Synced at ${updated.lastSyncAt}`,
  };
}
