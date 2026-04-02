/**
 * src/types/common.ts — Shared generic types used across multiple domains.
 */

/** A resolved lunar date (tithi + paksha + month). */
export interface LunarDate {
  lunarMonth: string;
  lunarMonthNum: number;
  paksha: 'shukla' | 'krishna';
  tithi: number;
  tithiName: string;
  nakshatra: string;
  nakshatraNum: number;
  yoga: string;
  yogaNum: number;
  saptarshiYear: number;
}

/** A city entry in the shared cities list. */
export interface CityLocation {
  label: string;
  lat: number;
  lng: number;
  tz: string;
}

/** Generic keyed storage item wrapper. */
export interface StorageItem<T = unknown> {
  key: string;
  value: T;
  updatedAt: number;
}

// Note: Birth data types are defined in src/services/TakniEncoder.ts (TakniBirthData)
// and re-exported from src/types/tekni.ts.
