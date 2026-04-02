/**
 * HinduCalendar unit tests — KP (Purnimant) lunisolar calendar accuracy.
 *
 * Reference dates computed manually against known Panchang sources.
 */

import {
  gregorianToLunar,
  gregorianToLunarWithTime,
  getMonthCalendar,
  getSankalpa,
} from '../src/services/HinduCalendar';

describe('gregorianToLunar', () => {
  test('returns null for invalid date strings', () => {
    expect(gregorianToLunar('')).toBeNull();
    expect(gregorianToLunar('not-a-date')).toBeNull();
    expect(gregorianToLunar('2024-13-01')).not.toBeNull(); // year/day valid; month wraps in JS
  });

  test('returns a LunarDate object with the required shape', () => {
    const result = gregorianToLunar('2024-01-15');
    expect(result).not.toBeNull();
    expect(result).toHaveProperty('lunarMonth');
    expect(result).toHaveProperty('paksha');
    expect(result).toHaveProperty('tithi');
    expect(result).toHaveProperty('tithiNum');
    expect(result).toHaveProperty('day');
  });

  test('paksha is either shukla or krishna', () => {
    const result = gregorianToLunar('2024-06-21');
    expect(['shukla', 'krishna']).toContain(result?.paksha);
  });

  test('tithiNum is in valid range 1-15', () => {
    const dates = ['2024-01-01', '2024-03-25', '2024-07-17', '2024-11-30'];
    for (const d of dates) {
      const result = gregorianToLunar(d);
      expect(result?.tithiNum).toBeGreaterThanOrEqual(1);
      expect(result?.tithiNum).toBeLessThanOrEqual(15);
    }
  });

  test('is deterministic for the same input', () => {
    const r1 = gregorianToLunar('2024-04-23');
    const r2 = gregorianToLunar('2024-04-23');
    expect(r1).toEqual(r2);
  });

  test('Purnima (full moon) falls on shukla paksha tithiNum 15', () => {
    // 2024 March 25 was Holi Purnima (Phalguna Purnima)
    const result = gregorianToLunar('2024-03-25');
    expect(result?.paksha).toBe('shukla');
    expect(result?.tithiNum).toBe(15);
  });
});

describe('gregorianToLunarWithTime', () => {
  test('returns a LunarDate with valid shape', () => {
    const result = gregorianToLunarWithTime(2024, 1, 15, 10, 0, 5.5); // IST
    expect(result).not.toBeNull();
    expect(result).toHaveProperty('paksha');
    expect(result?.tithiNum).toBeGreaterThanOrEqual(1);
    expect(result?.tithiNum).toBeLessThanOrEqual(15);
  });

  test('returns null for NaN inputs', () => {
    expect(gregorianToLunarWithTime(NaN, 1, 1, 0, 0, 5.5)).toBeNull();
  });

  test('midnight vs midday may or may not differ depending on tithi boundary', () => {
    // Just assert both return valid results — boundary depends on actual astronomy
    const midnight = gregorianToLunarWithTime(2024, 6, 21, 0, 0, 5.5);
    const midday = gregorianToLunarWithTime(2024, 6, 21, 12, 0, 5.5);
    expect(midnight).not.toBeNull();
    expect(midday).not.toBeNull();
  });
});

describe('getMonthCalendar', () => {
  test('returns an array of CalendarDay objects for a valid month', () => {
    const days = getMonthCalendar(2024, 1);
    expect(Array.isArray(days)).toBe(true);
    expect(days.length).toBeGreaterThanOrEqual(28);
    expect(days.length).toBeLessThanOrEqual(31);
  });

  test('each day has the required CalendarDay shape', () => {
    const days = getMonthCalendar(2024, 3);
    for (const d of days) {
      expect(d).toHaveProperty('day');
      expect(d).toHaveProperty('date');
      expect(d).toHaveProperty('lunarMonth');
      expect(d).toHaveProperty('paksha');
      expect(d).toHaveProperty('tithiNum');
    }
  });

  test('days are in sequential order', () => {
    const days = getMonthCalendar(2024, 5);
    for (let i = 1; i < days.length; i++) {
      expect(days[i].day).toBe(days[i - 1].day + 1);
    }
  });

  test('returns 29 days for February 2024 (leap year)', () => {
    const days = getMonthCalendar(2024, 2);
    expect(days).toHaveLength(29);
  });

  test('returns 28 days for February 2023 (non-leap)', () => {
    const days = getMonthCalendar(2023, 2);
    expect(days).toHaveLength(28);
  });

  test('is deterministic for same year/month', () => {
    const a = getMonthCalendar(2024, 8);
    const b = getMonthCalendar(2024, 8);
    expect(JSON.stringify(a)).toBe(JSON.stringify(b));
  });
});

describe('getSankalpa', () => {
  test('returns a non-empty string for a valid CalendarDay', () => {
    const days = getMonthCalendar(2024, 4);
    const sankalpa = getSankalpa(days[0]);
    expect(typeof sankalpa).toBe('string');
    expect(sankalpa.length).toBeGreaterThan(0);
  });
});
