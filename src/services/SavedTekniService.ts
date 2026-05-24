import { getJSON, setJSON } from './StorageService';
import { getActiveProfileId, subscribeActiveProfile } from './ProfileService';
import { encodeTakniCode } from './TakniEncoder';
import { computeTekni } from './TekniService';
import type {
  SaveTekniResult,
  SavedTekniRecord,
  SyncedSavedTekniRecord,
  SyncedSavedTekniTombstone,
  TakniBirthData,
  TekniData,
} from '../types/tekni';
import type { RootStackParamList } from '../navigation/types';

const STORAGE_KEY = 'janthari_saved_tekni_v1';
const TOMBSTONES_KEY = 'janthari_saved_tekni_tombstones_v1';
const MAX_TEKNIS_PER_PROFILE = 6;
const MAX_TOMBSTONES_PER_PROFILE = 300;

type TeknisByProfile = Record<string, SavedTekniRecord[]>;
type TombstonesByProfile = Record<string, SyncedSavedTekniTombstone[]>;

let cacheByProfile: TeknisByProfile = {};
let tombstonesByProfile: TombstonesByProfile = {};
let activeProfileId: string | null = null;
let hydrated = false;
let subscribed = false;

function ensureSubscription(): void {
  if (subscribed) return;
  subscribed = true;
  subscribeActiveProfile((profile) => {
    activeProfileId = profile?.id ?? null;
  });
}

function persistAll(): void {
  setJSON(STORAGE_KEY, cacheByProfile).catch(() => {});
  setJSON(TOMBSTONES_KEY, tombstonesByProfile).catch(() => {});
}

function writeThrough(next: TeknisByProfile, nextTombstones?: TombstonesByProfile): void {
  cacheByProfile = next;
  if (nextTombstones) tombstonesByProfile = nextTombstones;
  persistAll();
}

function currentItems(): SavedTekniRecord[] {
  if (!activeProfileId) return [];
  return cacheByProfile[activeProfileId] ?? [];
}

function normalizeName(name: string): string {
  return name.trim().replace(/\s+/g, ' ').toLowerCase();
}

function makeId(): string {
  return `tekni_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function toTekniParams(birth: TakniBirthData): RootStackParamList['TekniLoading'] {
  return {
    name: birth.name,
    fatherName: birth.fatherName,
    motherName: birth.motherName,
    gotra: birth.gotra,
    ishtdevi: birth.ishtdevi,
    gender: birth.gender,
    year: birth.year,
    month: birth.month,
    day: birth.day,
    hour: birth.hour,
    minute: birth.minute,
    placeName: birth.placeName,
    latitude: birth.latitude,
    longitude: birth.longitude,
  };
}

export async function hydrateSavedTeknis(): Promise<void> {
  ensureSubscription();
  activeProfileId = await getActiveProfileId();
  if (hydrated) return;
  cacheByProfile = (await getJSON<TeknisByProfile>(STORAGE_KEY)) ?? {};
  tombstonesByProfile = (await getJSON<TombstonesByProfile>(TOMBSTONES_KEY)) ?? {};
  hydrated = true;
}

export async function refreshSavedTekniProfileScope(): Promise<void> {
  ensureSubscription();
  activeProfileId = await getActiveProfileId();
}

export function getSavedTeknis(): SavedTekniRecord[] {
  return [...currentItems()].sort((a, b) => b.updatedAt - a.updatedAt);
}

export function getSavedTekni(id: string): SavedTekniRecord | null {
  return currentItems().find((item) => item.id === id) ?? null;
}

export function getAllSavedTeknisForSync(): SyncedSavedTekniRecord[] {
  return Object.values(cacheByProfile)
    .flat()
    .map(({ tekni: _tekni, ...record }) => record);
}

export function getAllSavedTekniTombstonesForSync(): SyncedSavedTekniTombstone[] {
  return Object.values(tombstonesByProfile).flat();
}

function getLatestTombstone(profileId: string, id: string): SyncedSavedTekniTombstone | undefined {
  const list = tombstonesByProfile[profileId] ?? [];
  return list.find((item) => item.id === id);
}

function upsertTombstone(
  nextTombstones: TombstonesByProfile,
  tombstone: SyncedSavedTekniTombstone,
): TombstonesByProfile {
  const current = nextTombstones[tombstone.profileId] ?? [];
  const idx = current.findIndex((item) => item.id === tombstone.id);
  const merged = [...current];
  if (idx >= 0) {
    if (merged[idx].deletedAt < tombstone.deletedAt) merged[idx] = tombstone;
  } else {
    merged.push(tombstone);
  }
  nextTombstones[tombstone.profileId] = merged
    .sort((a, b) => b.deletedAt - a.deletedAt)
    .slice(0, MAX_TOMBSTONES_PER_PROFILE);
  return nextTombstones;
}

function removeTombstone(nextTombstones: TombstonesByProfile, profileId: string, id: string): TombstonesByProfile {
  const current = nextTombstones[profileId] ?? [];
  nextTombstones[profileId] = current.filter((item) => item.id !== id);
  return nextTombstones;
}

export function saveTekniRecord(name: string, birth: TakniBirthData, tekni: TekniData): SaveTekniResult {
  if (!activeProfileId) return { ok: false, reason: 'no-profile' };

  const trimmedName = name.trim();
  const items = currentItems();
  if (items.length >= MAX_TEKNIS_PER_PROFILE) {
    return { ok: false, reason: 'limit-reached' };
  }
  if (items.some((item) => normalizeName(item.name) === normalizeName(trimmedName))) {
    return { ok: false, reason: 'duplicate-name' };
  }

  const now = Date.now();
  const record: SavedTekniRecord = {
    id: makeId(),
    profileId: activeProfileId,
    name: trimmedName,
    takniCode: encodeTakniCode(birth),
    birth,
    tekni,
    createdAt: now,
    updatedAt: now,
  };

  writeThrough({
    ...cacheByProfile,
    [activeProfileId]: [...items, record],
  }, removeTombstone({ ...tombstonesByProfile }, activeProfileId, record.id));

  return { ok: true, record };
}

export function updateSavedTekni(
  id: string,
  updates: Partial<Pick<SavedTekniRecord, 'name' | 'birth' | 'tekni'>>,
): SaveTekniResult {
  if (!activeProfileId) return { ok: false, reason: 'no-profile' };
  const items = currentItems();
  const index = items.findIndex((item) => item.id === id);
  if (index < 0) return { ok: false, reason: 'no-profile' };

  const current = items[index];
  const nextName = (updates.name ?? current.name).trim();
  if (items.some((item, idx) => idx !== index && normalizeName(item.name) === normalizeName(nextName))) {
    return { ok: false, reason: 'duplicate-name' };
  }

  const nextBirth = updates.birth ?? current.birth;
  const nextTekni = updates.tekni ?? current.tekni;
  const nextRecord: SavedTekniRecord = {
    ...current,
    name: nextName,
    birth: nextBirth,
    tekni: nextTekni,
    takniCode: encodeTakniCode(nextBirth),
    updatedAt: Date.now(),
  };

  const nextItems = [...items];
  nextItems[index] = nextRecord;
  writeThrough({
    ...cacheByProfile,
    [activeProfileId]: nextItems,
  }, removeTombstone({ ...tombstonesByProfile }, activeProfileId, nextRecord.id));

  return { ok: true, record: nextRecord };
}

export function deleteSavedTekni(id: string): boolean {
  if (!activeProfileId) return false;
  const items = currentItems();
  const existing = items.find((item) => item.id === id);
  if (!existing) return false;
  const nextItems = items.filter((item) => item.id !== id);
  const tombstone: SyncedSavedTekniTombstone = {
    id,
    profileId: existing.profileId,
    deletedAt: Date.now(),
  };
  const nextTombstones = upsertTombstone({ ...tombstonesByProfile }, tombstone);
  writeThrough({
    ...cacheByProfile,
    [activeProfileId]: nextItems,
  }, nextTombstones);
  return true;
}

export function upsertImportedSavedTeknis(
  records: SyncedSavedTekniRecord[],
  tombstones: SyncedSavedTekniTombstone[] = [],
): { inserted: number; updated: number } {
  if (records.length === 0 && tombstones.length === 0) return { inserted: 0, updated: 0 };
  let inserted = 0;
  let updated = 0;
  const nextByProfile: TeknisByProfile = { ...cacheByProfile };
  let nextTombstones: TombstonesByProfile = { ...tombstonesByProfile };

  // Apply deletes first so stale records cannot resurrect newer deletions.
  for (const tombstone of tombstones) {
    const profileId = tombstone.profileId;
    if (!profileId) continue;

    const current = nextByProfile[profileId] ?? [];
    const existing = current.find((item) => item.id === tombstone.id);
    if (existing && existing.updatedAt <= tombstone.deletedAt) {
      nextByProfile[profileId] = current.filter((item) => item.id !== tombstone.id);
    }
    nextTombstones = upsertTombstone(nextTombstones, tombstone);
  }

  for (const incoming of records) {
    const profileId = incoming.profileId;
    if (!profileId) continue;

    const localTombstone = getLatestTombstone(profileId, incoming.id);
    if (localTombstone && localTombstone.deletedAt >= incoming.updatedAt) {
      continue;
    }

    const current = nextByProfile[profileId] ?? [];
    const byId = new Map(current.map((item) => [item.id, item]));
    const existing = byId.get(incoming.id);

    if (existing) {
      if (existing.updatedAt > incoming.updatedAt) {
        continue;
      }
      byId.set(incoming.id, {
        ...incoming,
        tekni: existing.takniCode === incoming.takniCode ? existing.tekni : undefined,
      });
      updated += 1;
    } else {
      byId.set(incoming.id, {
        ...incoming,
      });
      inserted += 1;
    }

    // Newer remote record supersedes delete marker.
    nextTombstones = removeTombstone(nextTombstones, profileId, incoming.id);

    nextByProfile[profileId] = Array.from(byId.values())
      .sort((a, b) => b.updatedAt - a.updatedAt)
      .slice(0, MAX_TEKNIS_PER_PROFILE);
  }

  writeThrough(nextByProfile, nextTombstones);
  return { inserted, updated };
}

export function ensureTekniComputed(record: SavedTekniRecord): SavedTekniRecord {
  if (record.tekni) return record;
  const tekni = computeTekni(toTekniParams(record.birth));
  const refreshed: SavedTekniRecord = {
    ...record,
    tekni,
    updatedAt: Date.now(),
  };

  const profileItems = cacheByProfile[record.profileId] ?? [];
  const nextItems = profileItems.map((item) => (item.id === record.id ? refreshed : item));
  writeThrough({
    ...cacheByProfile,
    [record.profileId]: nextItems,
  });
  return refreshed;
}

export function canSaveMoreTeknis(): boolean {
  return currentItems().length < MAX_TEKNIS_PER_PROFILE;
}

export function getSavedTekniCount(): number {
  return currentItems().length;
}

export { MAX_TEKNIS_PER_PROFILE };