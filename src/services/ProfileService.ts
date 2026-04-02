import { get, set, remove, getJSON, setJSON } from './StorageService';

export interface UserProfile {
  id: string;
  personName: string;
  gotra: string;
  englishBirthday?: string; // ISO date string YYYY-MM-DD
  lunarMonth: string;
  paksha: 'krishna' | 'shukla';
  tithi: string;
  day: string;
  createdAt: string;
  lastUsedAt: string;
}

const PROFILES_KEY = 'puzapaath_profiles';
const ACTIVE_PROFILE_KEY = 'puzapaath_active_profile';
const activeProfileListeners = new Set<(profile: UserProfile | null) => void>();

async function notifyActiveProfileListeners(profileOverride?: UserProfile | null): Promise<void> {
  const profile = profileOverride !== undefined ? profileOverride : await getActiveProfile();
  for (const listener of activeProfileListeners) {
    listener(profile);
  }
}

export async function getProfiles(): Promise<UserProfile[]> {
  return (await getJSON<UserProfile[]>(PROFILES_KEY)) ?? [];
}

export async function saveProfile(profile: UserProfile): Promise<void> {
  const profiles = await getProfiles();
  const idx = profiles.findIndex((p) => p.id === profile.id);
  if (idx >= 0) {
    profiles[idx] = { ...profile, lastUsedAt: new Date().toISOString() };
  } else {
    profiles.push({ ...profile, lastUsedAt: new Date().toISOString() });
  }
  await setJSON(PROFILES_KEY, profiles);
}

export async function deleteProfile(id: string): Promise<void> {
  const profiles = await getProfiles();
  await setJSON(PROFILES_KEY, profiles.filter((p) => p.id !== id));
  const activeId = await getActiveProfileId();
  if (activeId === id) {
    await remove(ACTIVE_PROFILE_KEY);
    await notifyActiveProfileListeners(null);
  }
}

export async function setActiveProfile(id: string): Promise<void> {
  await set(ACTIVE_PROFILE_KEY, id);
  // Update lastUsedAt
  const profiles = await getProfiles();
  const profile = profiles.find((p) => p.id === id);
  if (profile) {
    await saveProfile(profile);
  }
  await notifyActiveProfileListeners(profile ?? null);
}

export async function getActiveProfileId(): Promise<string | null> {
  return get(ACTIVE_PROFILE_KEY);
}

export async function getActiveProfile(): Promise<UserProfile | null> {
  const id = await getActiveProfileId();
  if (!id) return null;
  const profiles = await getProfiles();
  return profiles.find((p) => p.id === id) ?? null;
}

export function generateProfileId(): string {
  return `profile_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export function subscribeActiveProfile(listener: (profile: UserProfile | null) => void): () => void {
  activeProfileListeners.add(listener);
  getActiveProfile().then((profile) => listener(profile));
  return () => {
    activeProfileListeners.delete(listener);
  };
}
