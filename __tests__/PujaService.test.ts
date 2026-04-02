/**
 * PujaService unit tests — lazy loading and cache behaviour.
 *
 * The service lazy-loads pujaData.json on first call and caches it.
 * All accessor functions delegate to that cache.
 */

import {
  getPujaData,
  getPujaParts,
  getPujaSteps,
  getSamagriList,
  clearPujaCache,
} from '../src/services/PujaService';

describe('PujaService', () => {
  beforeEach(() => {
    clearPujaCache();
  });

  test('getPujaData() returns a PujaData object with a parts property', () => {
    const data = getPujaData();
    expect(data).toBeDefined();
    expect(data.parts).toBeDefined();
  });

  test('getPujaParts() returns an array of puja parts', () => {
    const parts = getPujaParts();
    expect(Array.isArray(parts)).toBe(true);
    expect(parts.length).toBeGreaterThan(0);
  });

  test('each part has an id and a steps array', () => {
    const parts = getPujaParts();
    for (const part of parts) {
      expect(part).toHaveProperty('id');
      expect(Array.isArray(part.steps)).toBe(true);
    }
  });

  test('getPujaSteps() returns steps for a valid part id', () => {
    const parts = getPujaParts();
    const firstId = parts[0].id;
    const steps = getPujaSteps(firstId);
    expect(Array.isArray(steps)).toBe(true);
    expect(steps.length).toBeGreaterThan(0);
  });

  test('getPujaSteps() returns empty array for an unknown partId', () => {
    const steps = getPujaSteps('NONEXISTENT' as 'A' | 'B' | 'C');
    expect(steps).toEqual([]);
  });

  test('getSamagriList() returns an array', () => {
    const list = getSamagriList();
    expect(Array.isArray(list)).toBe(true);
  });

  test('getPujaData() returns the same cached instance on repeated calls', () => {
    const first = getPujaData();
    const second = getPujaData();
    expect(first).toBe(second); // strict reference equality — same object
  });

  test('clearPujaCache() + re-call returns content-equal data', () => {
    const first = getPujaData();
    clearPujaCache();
    const second = getPujaData();
    // Content identical regardless of reference (require() caches internally)
    expect(JSON.stringify(first)).toBe(JSON.stringify(second));
    expect(second.parts.length).toBeGreaterThan(0);
  });
});
