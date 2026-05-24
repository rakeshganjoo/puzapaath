import type { UserProfile } from './ProfileService';
import type { SavedEvent } from './SavedEventsService';
import { gregorianToLunar } from './HinduCalendar';

export const DEFAULT_WATCHED_TITHIS = [8, 11, 15];

export function toLocalISODate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function parseTithiNum(tithiLabel: string): number | null {
  const match = tithiLabel.match(/\((\d{1,2})\)/);
  if (!match) return null;
  const value = Number(match[1]);
  if (!Number.isFinite(value) || value < 1 || value > 15) return null;
  return value;
}

function tithiLabel(tithiNum: number, paksha: 'shukla' | 'krishna'): string {
  if (tithiNum === 15) {
    return paksha === 'krishna' ? 'Amavasya' : 'Purnima';
  }
  if (tithiNum === 8) return 'Ashtami';
  if (tithiNum === 11) return 'Ekadashi';
  return `Tithi ${tithiNum}`;
}

function englishBirthdayMatches(profile: UserProfile, date: Date): boolean {
  if (!profile.englishBirthday || !/^\d{4}-\d{2}-\d{2}$/.test(profile.englishBirthday)) return false;
  const [, month, day] = profile.englishBirthday.split('-');
  return Number(month) === date.getMonth() + 1 && Number(day) === date.getDate();
}

function lunarBirthdayMatches(
  profile: UserProfile,
  lunarMonth: string,
  paksha: 'shukla' | 'krishna',
  tithiNum: number,
): boolean {
  const profileTithi = parseTithiNum(profile.tithi);
  if (!profileTithi) return false;
  return profile.lunarMonth === lunarMonth && profile.paksha === paksha && profileTithi === tithiNum;
}

function lunarEventMatches(
  event: SavedEvent,
  lunarMonth: string,
  paksha: 'shukla' | 'krishna',
  tithiNum: number,
): boolean {
  return event.lunarMonth === lunarMonth && event.paksha === paksha && event.tithiNum === tithiNum;
}

export function buildDailyReminderText(
  date: Date,
  profiles: UserProfile[],
  events: SavedEvent[],
  watchedTithis: number[] = DEFAULT_WATCHED_TITHIS,
): string | null {
  const lunar = gregorianToLunar(toLocalISODate(date));
  if (!lunar) return null;

  const highlights: string[] = [];

  if (watchedTithis.includes(lunar.tithiNum)) {
    highlights.push(`Today is ${tithiLabel(lunar.tithiNum, lunar.paksha)}.`);
  }

  for (const profile of profiles) {
    if (lunarBirthdayMatches(profile, lunar.lunarMonth, lunar.paksha, lunar.tithiNum)) {
      highlights.push(`Today is ${profile.personName}'s Kashmiri birthday.`);
    }
    if (englishBirthdayMatches(profile, date)) {
      highlights.push(`Today is ${profile.personName}'s English birthday.`);
    }
  }

  for (const event of events) {
    if (lunarEventMatches(event, lunar.lunarMonth, lunar.paksha, lunar.tithiNum)) {
      highlights.push(`Reminder: ${event.name}.`);
    }
  }

  if (highlights.length === 0) return null;

  const visible = highlights.slice(0, 3);
  const remaining = highlights.length - visible.length;
  if (remaining > 0) visible.push(`+${remaining} more.`);
  return visible.join(' ');
}
