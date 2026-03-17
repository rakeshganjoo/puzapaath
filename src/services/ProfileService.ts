import AsyncStorage from '@react-native-async-storage/async-storage';

export interface UserProfile {
  id: string;
  personName: string;
  gotra: string;
  lunarMonth: string;
  paksha: 'krishna' | 'shukla';
  tithi: string;
  day: string;
  createdAt: string;
  lastUsedAt: string;
}

const PROFILES_KEY = 'puzapaath_profiles';
const ACTIVE_PROFILE_KEY = 'puzapaath_active_profile';

export async function getProfiles(): Promise<UserProfile[]> {
  const json = await AsyncStorage.getItem(PROFILES_KEY);
  return json ? JSON.parse(json) : [];
}

export async function saveProfile(profile: UserProfile): Promise<void> {
  const profiles = await getProfiles();
  const idx = profiles.findIndex((p) => p.id === profile.id);
  if (idx >= 0) {
    profiles[idx] = { ...profile, lastUsedAt: new Date().toISOString() };
  } else {
    profiles.push({ ...profile, lastUsedAt: new Date().toISOString() });
  }
  await AsyncStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));
}

export async function deleteProfile(id: string): Promise<void> {
  const profiles = await getProfiles();
  await AsyncStorage.setItem(
    PROFILES_KEY,
    JSON.stringify(profiles.filter((p) => p.id !== id))
  );
  const activeId = await getActiveProfileId();
  if (activeId === id) {
    await AsyncStorage.removeItem(ACTIVE_PROFILE_KEY);
  }
}

export async function setActiveProfile(id: string): Promise<void> {
  await AsyncStorage.setItem(ACTIVE_PROFILE_KEY, id);
  // Update lastUsedAt
  const profiles = await getProfiles();
  const profile = profiles.find((p) => p.id === id);
  if (profile) {
    await saveProfile(profile);
  }
}

export async function getActiveProfileId(): Promise<string | null> {
  return AsyncStorage.getItem(ACTIVE_PROFILE_KEY);
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
