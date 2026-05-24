import { calculateMuhurat } from '../src/services/MuhuratService';

describe('MuhuratEngine.calculateMuhurat', () => {
  const baseParams = {
    eventId: 'marriage',
    dateFrom: '2026-04-01',
    dateTo: '2026-04-20',
    locationName: 'Srinagar',
    locationLat: 34.0837,
    locationLng: 74.7973,
    timeWindow: 'any' as const,
    numResults: 5,
  };

  test('returns deterministic results for same input', () => {
    const a = calculateMuhurat(baseParams);
    const b = calculateMuhurat(baseParams);
    expect(JSON.stringify(a)).toBe(JSON.stringify(b));
  });

  test('returns at most requested number of results', () => {
    const res = calculateMuhurat(baseParams);
    expect(res.length).toBeLessThanOrEqual(baseParams.numResults);
  });

  test('every result lies within requested date range', () => {
    const res = calculateMuhurat(baseParams);
    for (const r of res) {
      expect(r.date >= baseParams.dateFrom).toBe(true);
      expect(r.date <= baseParams.dateTo).toBe(true);
    }
  });

  test('candidate window does not overlap listed inauspicious periods', () => {
    const res = calculateMuhurat(baseParams);
    const toHour = (hhmm: string) => {
      const [h, m] = hhmm.split(':').map(Number);
      return h + m / 60;
    };

    for (const r of res) {
      const s = toHour(r.timeStart);
      const e = toHour(r.timeEnd);
      for (const p of r.inauspiciousPeriods) {
        const ps = toHour(p.start);
        const pe = toHour(p.end);
        const overlap = s < pe && ps < e;
        expect(overlap).toBe(false);
      }
    }
  });

  test('scores are in expected bounds', () => {
    const res = calculateMuhurat(baseParams);
    for (const r of res) {
      expect(r.scores.total).toBeGreaterThanOrEqual(20);
      expect(r.scores.total).toBeLessThanOrEqual(100);
      expect(r.rating).toBeGreaterThanOrEqual(1);
      expect(r.rating).toBeLessThanOrEqual(5);
    }
  });
});
