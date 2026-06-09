/**
 * Regression test for Adhik Maas (intercalary lunar month) detection.
 *
 * In 2026 there is an Adhik Ashadh:
 *   - Adhik Ashadh runs ~Jun 15 – Jul 14, 2026
 *   - Nija  Ashadh runs ~Jul 15 – Aug 12, 2026
 *
 * For someone born on 2018-07-07 17:05 IST (Ashadh / Krishna / Navami),
 * the next-occurrence search must return the NIJA Ashadh date (Jul 9, 2026),
 * NOT the Adhik Ashadh date (Jun 9, 2026). Tithi anniversaries are observed
 * in the Nija month per standard panchang convention.
 */

import {
  gregorianToLunar,
  gregorianToLunarWithTime,
  getMonthCalendar,
} from '../src/services/HinduCalendar';

describe('Adhik Maas detection (2026)', () => {
  test('User birth: 2018-07-07 17:05 IST → Ashadh / Krishna / Navami', () => {
    const r = gregorianToLunarWithTime(2018, 7, 7, 17, 5, 5.5);
    expect(r).not.toBeNull();
    expect(r!.lunarMonth).toBe('Ashadh');
    expect(r!.paksha).toBe('krishna');
    expect(r!.tithiNum).toBe(9);
  });

  test('2026-06-09 falls inside Adhik Ashadh', () => {
    const days = getMonthCalendar(2026, 6);
    const jun9 = days.find((d) => d.day === 9);
    expect(jun9).toBeDefined();
    expect(jun9!.lunarMonth).toBe('Ashadh');
    expect(jun9!.paksha).toBe('krishna');
    expect(jun9!.tithiNum).toBe(9);
    expect(jun9!.isAdhikMaas).toBe(true);
  });

  test('2026-07-09 falls inside Nija Ashadh (NOT Adhik)', () => {
    const days = getMonthCalendar(2026, 7);
    const jul9 = days.find((d) => d.day === 9);
    expect(jul9).toBeDefined();
    expect(jul9!.lunarMonth).toBe('Ashadh');
    expect(jul9!.paksha).toBe('krishna');
    expect(jul9!.tithiNum).toBe(9);
    expect(jul9!.isAdhikMaas).toBeFalsy();
  });

  test('A non-adhik year (2025) carries no Adhik Maas flag in May/June', () => {
    const may = getMonthCalendar(2025, 5);
    const jun = getMonthCalendar(2025, 6);
    expect(may.every((d) => !d.isAdhikMaas)).toBe(true);
    expect(jun.every((d) => !d.isAdhikMaas)).toBe(true);
  });

  test('Adhik Maas spans roughly one full lunation in 2026', () => {
    const allDays = [
      ...getMonthCalendar(2026, 5),
      ...getMonthCalendar(2026, 6),
      ...getMonthCalendar(2026, 7),
    ];
    const adhik = allDays.filter((d) => d.isAdhikMaas);
    // One lunation is ~29.5 days
    expect(adhik.length).toBeGreaterThanOrEqual(28);
    expect(adhik.length).toBeLessThanOrEqual(31);
  });

  test('User regression: born 2018-07-07 17:05 IST → next anniversary in 2026 falls in Nija Ashadh (Jul 9), not Adhik (Jun 9)', () => {
    // Find a Nija "Ashadh krishna 9" within Jun-Jul 2026.
    const days = [
      ...getMonthCalendar(2026, 6),
      ...getMonthCalendar(2026, 7),
    ];
    const matches = days.filter(
      (d) =>
        d.lunarMonth === 'Ashadh' &&
        d.paksha === 'krishna' &&
        d.tithiNum === 9,
    );
    // Two matches expected (Adhik + Nija).
    expect(matches.length).toBe(2);
    const nija = matches.find((d) => !d.isAdhikMaas);
    const adhik = matches.find((d) => d.isAdhikMaas);
    expect(adhik).toBeDefined();
    expect(nija).toBeDefined();
    // Adhik occurrence is the EARLIER one (must be skipped).
    expect(adhik!.date.getTime()).toBeLessThan(nija!.date.getTime());
    // Nija occurrence must be Jul 9, 2026.
    expect(nija!.date.getMonth()).toBe(6); // 0-indexed July
    expect(nija!.date.getDate()).toBe(9);
    // Adhik occurrence is Jun 9, 2026.
    expect(adhik!.date.getMonth()).toBe(5); // June
    expect(adhik!.date.getDate()).toBe(9);
  });
});
