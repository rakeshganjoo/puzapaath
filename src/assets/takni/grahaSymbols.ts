/**
 * Standard astrological symbols for Vedic/Western astrology.
 * Unicode glyphs — usable in SVG, HTML, and PDF contexts.
 *
 * These are the official Unicode astronomical/astrological symbols.
 */

// ── Graha (Planet) Symbols ──────────────────────────────────────────────

export const GRAHA_SYMBOLS: Record<string, { symbol: string; unicode: string; hindi: string }> = {
  Sun:     { symbol: '☉', unicode: 'U+2609', hindi: 'सूर्य' },
  Moon:    { symbol: '☽', unicode: 'U+263D', hindi: 'चन्द्र' },
  Mars:    { symbol: '♂', unicode: 'U+2642', hindi: 'मंगल' },
  Mercury: { symbol: '☿', unicode: 'U+263F', hindi: 'बुध' },
  Jupiter: { symbol: '♃', unicode: 'U+2643', hindi: 'गुरु' },
  Venus:   { symbol: '♀', unicode: 'U+2640', hindi: 'शुक्र' },
  Saturn:  { symbol: '♄', unicode: 'U+2644', hindi: 'शनि' },
  Rahu:    { symbol: '☊', unicode: 'U+260A', hindi: 'राहु' },
  Ketu:    { symbol: '☋', unicode: 'U+260B', hindi: 'केतु' },
};

// ── Rashi (Zodiac) Symbols ──────────────────────────────────────────────

export const RASHI_SYMBOLS: Record<string, { symbol: string; unicode: string; hindi: string }> = {
  Mesha:     { symbol: '♈', unicode: 'U+2648', hindi: 'मेष' },
  Vrishabha: { symbol: '♉', unicode: 'U+2649', hindi: 'वृषभ' },
  Mithuna:   { symbol: '♊', unicode: 'U+264A', hindi: 'मिथुन' },
  Karka:     { symbol: '♋', unicode: 'U+264B', hindi: 'कर्क' },
  Simha:     { symbol: '♌', unicode: 'U+264C', hindi: 'सिंह' },
  Kanya:     { symbol: '♍', unicode: 'U+264D', hindi: 'कन्या' },
  Tula:      { symbol: '♎', unicode: 'U+264E', hindi: 'तुला' },
  Vrischika: { symbol: '♏', unicode: 'U+264F', hindi: 'वृश्चिक' },
  Dhanu:     { symbol: '♐', unicode: 'U+2650', hindi: 'धनु' },
  Makara:    { symbol: '♑', unicode: 'U+2651', hindi: 'मकर' },
  Kumbha:    { symbol: '♒', unicode: 'U+2652', hindi: 'कुम्भ' },
  Meena:     { symbol: '♓', unicode: 'U+2653', hindi: 'मीन' },
};

// ── Special Symbols ─────────────────────────────────────────────────────

export const ASTRO_SPECIAL = {
  retrograde: '℞',    // U+211E — used when planet is retrograde
  conjunction: '☌',    // U+260C
  opposition: '☍',     // U+260D
  ascendant: '⬆',      // or 'Asc'
  om: 'ॐ',             // U+0950
};
