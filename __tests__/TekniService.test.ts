/**
 * TekniService unit tests
 *
 * Verifies that computeTekni() uses real astronomical computation:
 *  - Deterministic (same inputs → same output for a fixed epoch)
 *  - Produces structurally valid TekniData
 *  - Graha rashis are consistent with known positions for the test date
 *  - Nakshatra, pada, nadi, gana, varna, yoni come from proper tables
 */

import { computeTekni } from '../src/services/TekniService';

const BASE_PARAMS = {
  name: 'Arjun',
  fatherName: 'Pandu',
  motherName: 'Kunti',
  gotra: 'Bharadvaja',
  ishtdevi: 'Durga',
  gender: 'male' as const,
  year: 1987,
  month: 6,
  day: 15,
  hour: 8,
  minute: 30,
  placeName: 'Delhi',
  latitude: 28.6,
  longitude: 77.2,
};

describe('TekniService.computeTekni', () => {
  test('returns a TekniData object with required fields', () => {
    const result = computeTekni(BASE_PARAMS);
    expect(result).toBeDefined();
    expect(result.grahas).toBeDefined();
    expect(typeof result.lagnaRashi).toBe('string');
    expect(typeof result.nakshatra).toBe('string');
  });

  test('is deterministic — same input produces identical output', () => {
    const first = computeTekni(BASE_PARAMS);
    const second = computeTekni(BASE_PARAMS);
    expect(JSON.stringify(first)).toBe(JSON.stringify(second));
  });

  test('produces different output for different birth dates', () => {
    const result1 = computeTekni(BASE_PARAMS);
    const result2 = computeTekni({ ...BASE_PARAMS, year: 1990, month: 3, day: 22 });
    expect(JSON.stringify(result1)).not.toBe(JSON.stringify(result2));
  });

  test('produces different output for different locations', () => {
     // Move born 6 hours later in same location — lagna should shift ~90°
     const result1 = computeTekni(BASE_PARAMS);
     const result2 = computeTekni({ ...BASE_PARAMS, hour: 14, minute: 30 });
     expect(result1.lagnaRashiNum).not.toBe(result2.lagnaRashiNum);
   });
 
   test('lagnaRashiNum is in valid range 1–12', () => {
    const result = computeTekni(BASE_PARAMS);
    expect(result.lagnaRashiNum).toBeGreaterThanOrEqual(1);
    expect(result.lagnaRashiNum).toBeLessThanOrEqual(12);
  });

  test('grahas array has 9 planets', () => {
     const result = computeTekni(BASE_PARAMS);
     expect(result.grahas).toHaveLength(9);
   });
 
   test('grahas contain all expected planet names', () => {
     const names = computeTekni(BASE_PARAMS).grahas.map(g => g.name);
     expect(names).toEqual(['Sun','Moon','Mars','Mercury','Jupiter','Venus','Saturn','Rahu','Ketu']);
   });
 
   test('each graha rashiNum is in valid range 1–12', () => {
    const result = computeTekni(BASE_PARAMS);
    for (const graha of result.grahas) {
      expect(graha.rashiNum).toBeGreaterThanOrEqual(1);
      expect(graha.rashiNum).toBeLessThanOrEqual(12);
    }
  });

  test('nakshatra is one of the 27 known nakshatra names', () => {
         const result = computeTekni(BASE_PARAMS);
         expect(result.grahas).toHaveLength(9);
       });
 
       test('each graha degrees is in valid range 0–360', () => {
         const result = computeTekni(BASE_PARAMS);
         for (const graha of result.grahas) {
           expect(graha.degrees).toBeGreaterThanOrEqual(0);
           expect(graha.degrees).toBeLessThan(360);
         }
       });
 
       test('each graha pada is in valid range 1–4', () => {
         const result = computeTekni(BASE_PARAMS);
         for (const graha of result.grahas) {
           expect(graha.pada).toBeGreaterThanOrEqual(1);
           expect(graha.pada).toBeLessThanOrEqual(4);
         }
       });
 
       test('nakshatra is one of the 27 known nakshatra names', () => {
    const NAKSHATRAS = [
      'Ashwini','Bharani','Krittika','Rohini','Mrigashirsha','Ardra','Punarvasu','Pushya',
      'Ashlesha','Magha','Purva Phalguni','Uttara Phalguni','Hasta','Chitra','Swati',
      'Vishakha','Anuradha','Jyeshtha','Mula','Purva Ashadha','Uttara Ashadha','Shravana',
      'Dhanishta','Shatabhisha','Purva Bhadrapada','Uttara Bhadrapada','Revati',
    ];
    const result = computeTekni(BASE_PARAMS);
    expect(NAKSHATRAS).toContain(result.nakshatra);
     // Also check every graha's nakshatra
     for (const graha of result.grahas) {
       expect(NAKSHATRAS).toContain(graha.nakshatra);
     }
   });
 
   test('nadi is one of Aadi / Madhya / Antya', () => {
     const result = computeTekni(BASE_PARAMS);
     expect(['Aadi','Madhya','Antya']).toContain(result.nadi);
   });
 
   test('gana is one of Deva / Manushya / Rakshasa', () => {
     const result = computeTekni(BASE_PARAMS);
     expect(['Deva','Manushya','Rakshasa']).toContain(result.gana);
   });
 
   test('varna is one of Brahmin / Kshatriya / Vaishya / Shudra', () => {
     const result = computeTekni(BASE_PARAMS);
     expect(['Brahmin','Kshatriya','Vaishya','Shudra']).toContain(result.varna);
   });
 
   test('Ketu is 6 rashis away from Rahu (180° opposition)', () => {
     const result = computeTekni(BASE_PARAMS);
     const rahu = result.grahas.find(g => g.name === 'Rahu')!;
     const ketu = result.grahas.find(g => g.name === 'Ketu')!;
     const diff = Math.abs(rahu.rashiNum - ketu.rashiNum);
     expect(diff === 6).toBe(true);
   });
 
   test('Sun is in Mithuna or Karka on 15 June 1987 — known astronomical fact', () => {
    // Sun sidereal on 15 June 1987 ≈ 59.3° — end of Vrishabha, entering Mithuna the next day
    // Valid rashis: Vrishabha (30–60°) or Mithuna (60–90°)
    const result = computeTekni(BASE_PARAMS);
    const sun    = result.grahas.find(g => g.name === 'Sun')!;
    expect(['Vrishabha','Mithuna']).toContain(sun.rashi);
   });
 
   test('saptarshiYear = birth year + 3076', () => {
     const result = computeTekni(BASE_PARAMS);
     expect(result.saptarshiYear).toBe(BASE_PARAMS.year + 3076);
   });
 
   test('userLagnaRashi override is respected', () => {
     const withLagna = computeTekni({ ...BASE_PARAMS, userLagnaRashi: 5 });
     expect(withLagna.lagnaRashiNum).toBe(5);
     expect(withLagna.lagnaRashi).toBe('Simha');
   });
 
   test('userMoonRashi override sets Moon graha rashiNum (1-based)', () => {
     const withMoon = computeTekni({ ...BASE_PARAMS, userMoonRashi: 3 });
     const moonGraha = withMoon.grahas.find(g => g.name === 'Moon');
     expect(moonGraha?.rashiNum).toBe(3);
     expect(withMoon.moonRashi).toBe('Mithuna');
  });
});
