import { buildDailyReminderText, parseTithiNum } from '../src/services/NotificationPlanner';
import type { UserProfile } from '../src/services/ProfileService';
import type { SavedEvent } from '../src/services/SavedEventsService';
import { gregorianToLunar } from '../src/services/HinduCalendar';

describe('NotificationPlanner', () => {
  test('parseTithiNum extracts number from profile label', () => {
    expect(parseTithiNum('Ashtami (8)')).toBe(8);
    expect(parseTithiNum('Amavasya (15)')).toBe(15);
    expect(parseTithiNum('Unknown')).toBeNull();
  });

  test('buildDailyReminderText includes tithi and birthday highlights', () => {
    const date = new Date('2026-05-26T09:00:00.000Z');
    const lunar = gregorianToLunar('2026-05-26');
    expect(lunar).toBeTruthy();

    const month = lunar!.lunarMonth;
    const paksha = lunar!.paksha;
    const tithiNum = lunar!.tithiNum;

    const profiles: UserProfile[] = [
      {
        id: 'p1',
        personName: 'Mom',
        gotra: 'Kashyap',
        englishBirthday: '1970-05-26',
        lunarMonth: month,
        paksha,
        tithi: `Sample (${tithiNum})`,
        day: 'Somvar',
        createdAt: new Date().toISOString(),
        lastUsedAt: new Date().toISOString(),
      },
    ];

    const events: SavedEvent[] = [
      {
        id: 'e1',
        profileId: 'p1',
        name: 'Family Puja',
        type: 'custom',
        lunarMonth: month,
        paksha,
        tithiNum,
        createdAt: Date.now(),
      },
    ];

    const text = buildDailyReminderText(date, profiles, events, [tithiNum]);
    expect(text).toBeTruthy();
    expect(text).toContain('Today is');
    expect(text).toContain("Mom's Kashmiri birthday");
    expect(text).toContain("Mom's English birthday");
  });
});
