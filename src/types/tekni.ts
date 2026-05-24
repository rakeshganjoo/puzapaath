/**
 * src/types/tekni.ts — Single Source of Truth for Tekni/Kundali domain types.
 *
 * Previously duplicated identically in:
 *   - src/services/TakniHTMLGenerator.ts
 *   - src/services/TakniPDFGenerator.ts
 *
 * Both files now import from here.
 */

import type { TakniBirthData } from '../services/TakniEncoder';

export type { TakniBirthData };

export interface GrahaPosition {
  name: string;
  rashi: string;
  rashiNum: number;
  degrees: number;
  nakshatra: string;
  pada: number;
  isRetro?: boolean;
}

export interface TekniData {
  birth: TakniBirthData;
  lagnaRashi: string;
  lagnaRashiNum: number;
  moonRashi: string;
  nakshatra: string;
  pada: number;
  nadi: string;
  gana: string;
  varna: string;
  yoni: string;
  grahas: GrahaPosition[];
  saptarshiYear: number;
}

export interface SavedTekniRecord {
  id: string;
  profileId: string;
  name: string;
  takniCode: string;
  birth: TakniBirthData;
  tekni?: TekniData;
  createdAt: number;
  updatedAt: number;
}

export interface SyncedSavedTekniRecord {
  id: string;
  profileId: string;
  name: string;
  takniCode: string;
  birth: TakniBirthData;
  createdAt: number;
  updatedAt: number;
}

export interface SyncedSavedTekniTombstone {
  id: string;
  profileId: string;
  deletedAt: number;
}

export type SaveTekniResult =
  | { ok: true; record: SavedTekniRecord }
  | { ok: false; reason: 'no-profile' | 'limit-reached' | 'duplicate-name' };
