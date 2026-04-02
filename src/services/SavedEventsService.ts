/**
 * SavedEventsService — Persist personal birthdays / anniversaries / custom events.
 *
 * Events are stored by their LUNAR date (month + paksha + tithi) so they
 * automatically fall on the correct Gregorian date every year.
 *
 * Storage: localStorage (web) — persists across sessions in the same browser.
 */

export type EventType = 'birthday' | 'anniversary' | 'custom';

export interface SavedEvent {
  id: string;
  profileId: string;
  name: string;           // "Mummi jis birthday 🎂"
  type: EventType;
  lunarMonth: string;     // "Shravan"
  paksha: 'shukla' | 'krishna';
  tithiNum: number;       // 1-15
  emoji?: string;         // 🎂 🎉 ❤️ 🙏
  notes?: string;
  createdAt: number;      // timestamp
}

const STORAGE_KEY = 'janthari_saved_events_v2';
const LEGACY_STORAGE_KEY = 'janthari_saved_events_v1';
import { getJSON, setJSON } from './StorageService';
import { getActiveProfileId, subscribeActiveProfile } from './ProfileService';

type EventsByProfile = Record<string, SavedEvent[]>;

// In-memory cache — populated by hydrateAsync() on app startup.
// Sync reads fall back to [] until hydrated (acceptable for first render).
let _cacheByProfile: EventsByProfile = {};
let _activeProfileId: string | null = null;
let _hydrated = false;
let _subscribed = false;

function getActiveEvents(): SavedEvent[] {
  if (!_activeProfileId) return [];
  return _cacheByProfile[_activeProfileId] ?? [];
}

function writeThrough(eventsByProfile: EventsByProfile): void {
  _cacheByProfile = eventsByProfile;
  // Fire-and-forget async write — callers don't need to await
  setJSON(STORAGE_KEY, eventsByProfile).catch(() => {/* storage errors are non-fatal */});
}

function ensureSubscription(): void {
  if (_subscribed) return;
  _subscribed = true;
  subscribeActiveProfile((profile) => {
    _activeProfileId = profile?.id ?? null;
  });
}

/**
 * Call this once on app startup (e.g., in CalendarContext useEffect) to populate
 * the sync cache from persistent storage.  All sync reads after this point
 * will reflect the persisted state.
 */
export async function hydrateAsync(): Promise<void> {
  ensureSubscription();
  _activeProfileId = await getActiveProfileId();
  if (_hydrated) return;

  const saved = await getJSON<EventsByProfile>(STORAGE_KEY);
  if (saved) {
    _cacheByProfile = saved;
    _hydrated = true;
    return;
  }

  const legacy = (await getJSON<SavedEvent[]>(LEGACY_STORAGE_KEY)) ?? [];
  if (legacy.length > 0 && _activeProfileId) {
    _cacheByProfile = {
      [_activeProfileId]: legacy.map((event) => ({ ...event, profileId: _activeProfileId! })),
    };
    writeThrough(_cacheByProfile);
  } else {
    _cacheByProfile = {};
  }
  _hydrated = true;
}

export async function refreshProfileScope(): Promise<void> {
  ensureSubscription();
  _activeProfileId = await getActiveProfileId();
}

function load(): SavedEvent[] {
  return getActiveEvents();
}

function save(events: SavedEvent[]): void {
  if (!_activeProfileId) return;
  writeThrough({
    ..._cacheByProfile,
    [_activeProfileId]: events,
  });
}

export function getAllEvents(): SavedEvent[] {
  return load();
}

export function getAllEventsForAllProfiles(): SavedEvent[] {
  return Object.values(_cacheByProfile).flat();
}

export function addEvent(event: Omit<SavedEvent, 'id' | 'createdAt' | 'profileId'>): SavedEvent {
  if (!_activeProfileId) {
    throw new Error('Select a profile before saving personal events');
  }
  const events = load();
  const newEvent: SavedEvent = {
    ...event,
    profileId: _activeProfileId,
    id: `evt_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    createdAt: Date.now(),
  };
  events.push(newEvent);
  save(events);
  return newEvent;
}

export function updateEvent(id: string, updates: Partial<Omit<SavedEvent, 'id' | 'createdAt'>>): boolean {
  const events = load();
  const idx = events.findIndex(e => e.id === id);
  if (idx < 0) return false;
  events[idx] = { ...events[idx], ...updates };
  save(events);
  return true;
}

export function deleteEvent(id: string): boolean {
  const events = load();
  const next = events.filter(e => e.id !== id);
  if (next.length === events.length) return false;
  save(next);
  return true;
}

/** Return events matching the given lunar date */
export function getEventsForDay(lunarMonth: string, paksha: 'shukla' | 'krishna', tithiNum: number): SavedEvent[] {
  return load().filter(
    e => e.lunarMonth === lunarMonth && e.paksha === paksha && e.tithiNum === tithiNum,
  );
}

/** Return all events whose lunar month matches this month's days */
export function getEventsForMonth(lunarMonths: string[]): SavedEvent[] {
  const months = new Set(lunarMonths);
  return load().filter(e => months.has(e.lunarMonth));
}

/**
 * Import events from cloud while preserving canonical IDs.
 * Existing IDs are updated, missing IDs are appended.
 */
export function importEvents(events: SavedEvent[]): { inserted: number; updated: number } {
  if (events.length === 0) return { inserted: 0, updated: 0 };
  let inserted = 0;
  let updated = 0;

  const nextByProfile: EventsByProfile = { ..._cacheByProfile };

  for (const incoming of events) {
    const targetProfileId = incoming.profileId || _activeProfileId;
    if (!targetProfileId) continue;

    const current = nextByProfile[targetProfileId] ?? [];
    const byId = new Map(current.map((e) => [e.id, e]));

    if (byId.has(incoming.id)) {
      byId.set(incoming.id, { ...byId.get(incoming.id)!, ...incoming, profileId: targetProfileId });
      updated += 1;
    } else {
      byId.set(incoming.id, { ...incoming, profileId: targetProfileId });
      inserted += 1;
    }

    nextByProfile[targetProfileId] = Array.from(byId.values());
  }

  writeThrough(nextByProfile);
  return { inserted, updated };
}

export const TYPE_EMOJI: Record<EventType, string> = {
  birthday: '🎂',
  anniversary: '❤️',
  custom: '⭐',
};

export const LUNAR_MONTHS_LIST = [
  'Chaitra', 'Vaishakh', 'Jyeshtha', 'Ashadh',
  'Shravan', 'Bhadrapad', 'Ashwin', 'Kartik',
  'Margshirsh', 'Paush', 'Magh', 'Phalgun',
];
