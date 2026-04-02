/**
 * src/services/PujaService.ts — Lazy-loaded puja data access.
 *
 * Previously: pujaData was imported at module-level in every screen that needed it
 * (SamagriScreen, StepDetailScreen, PujaNavigatorScreen, PujaHomeScreen).
 * This meant 602 lines of JSON were parsed and held in memory at app startup.
 *
 * Now: call getPujaData() which lazy-loads on first call, then caches.
 * All puja screens should import from here instead of data/pujaData directly.
 */

import type { PujaData } from '../types';

let _cache: PujaData | null = null;

/**
 * Lazy-load and cache puja data. Safe to call many times — only loads once.
 */
export function getPujaData(): PujaData {
  if (!_cache) {
    // Dynamic require — only parsed when first called (not at import time)
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    _cache = require('../data/pujaData').default as PujaData;
  }
  return _cache;
}

export function getPujaParts() {
  return getPujaData().parts;
}

export function getPujaSteps(partId: 'A' | 'B' | 'C') {
  const data = getPujaData();
  const part = data.parts.find((p) => p.id === partId);
  return part?.steps ?? [];
}

export function getPujaStep(partId: 'A' | 'B' | 'C', stepIndex: number) {
  return getPujaSteps(partId)[stepIndex] ?? null;
}

export function getSamagriList() {
  return getPujaData().samagri ?? [];
}

/** Clear cache (useful in tests or after a bundle update). */
export function clearPujaCache() {
  _cache = null;
}
