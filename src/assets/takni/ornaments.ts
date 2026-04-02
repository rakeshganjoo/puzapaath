/**
 * Traditional Hindu/Vedic ornament SVG paths for the Takni PDF template.
 *
 * These are used once to build the template, then embedded into every PDF.
 * All paths are designed for a maroon (#800020) stroke on parchment (#F5E6C8).
 */

// ── Corner Lotus (Padma) ────────────────────────────────────────────────
// A stylized 8-petal lotus, ~40×40pt. Rotated at each corner.
export const LOTUS_PATH =
  'M20 4 C22 10 28 14 34 14 C28 18 26 24 26 30 C22 26 18 24 14 26 ' +
  'C14 20 12 14 6 14 C12 10 16 6 20 4 Z ' +
  'M20 8 C22 12 26 14 30 14 C26 18 24 22 24 26 C22 24 18 22 16 24 ' +
  'C16 20 14 16 10 14 C14 12 16 10 20 8 Z';

// ── Kalash (Sacred Pot) ─────────────────────────────────────────────────
// Traditional kalash with coconut and mango leaves, ~30×45pt
export const KALASH_PATH =
  'M10 40 L10 30 Q10 25 15 22 L13 18 Q15 10 20 8 L18 5 Q20 2 22 5 ' +
  'L20 8 Q25 10 27 18 L25 22 Q30 25 30 30 L30 40 Z ' +
  'M15 8 Q12 3 10 5 M25 8 Q28 3 30 5 ' +  // Mango leaves
  'M20 5 Q20 0 20 -2';                       // Top

// ── Om Symbol ───────────────────────────────────────────────────────────
// ॐ is rendered as text in Devanagari fonts, not as a path

// ── Swastika ────────────────────────────────────────────────────────────
// Traditional right-facing swastika (sacred Hindu auspicious symbol), ~20×20pt
export const SWASTIKA_PATH =
  'M6 10 L14 10 M10 6 L10 14 ' +    // Cross
  'M14 10 L14 6 M6 10 L6 14 ' +      // Right-angle arms
  'M10 6 L6 6 M10 14 L14 14';

// ── Trishul (Trident) ──────────────────────────────────────────────────
// Simplified trident for section dividers, ~15×25pt
export const TRISHUL_PATH =
  'M7.5 25 L7.5 10 ' +               // Shaft
  'M7.5 10 L7.5 3 ' +                // Center prong
  'M7.5 10 L3 3 ' +                  // Left prong
  'M7.5 10 L12 3 ' +                 // Right prong
  'M4 8 Q7.5 12 11 8';              // Curve connecting prongs

// ── Diya (Lamp) ─────────────────────────────────────────────────────────
export const DIYA_PATH =
  'M5 18 Q5 15 8 13 L8 10 Q10 7 12 10 L12 13 Q15 15 15 18 Z ' +
  'M10 10 L10 5 Q10 3 10 2';          // Flame

// ── Shankh (Conch Shell) ────────────────────────────────────────────────
export const SHANKH_PATH =
  'M8 18 Q5 15 5 10 Q5 5 10 3 Q15 1 18 5 Q20 8 18 12 ' +
  'Q16 15 14 18 L8 18 Z ';

// ── Decorative Line Patterns ────────────────────────────────────────────

/** Double line with dot pattern for horizontal dividers */
export const DIVIDER_PATTERN = {
  topLine: { y: 0, thickness: 1.5 },
  dots: { y: 4, radius: 1, spacing: 8 },
  bottomLine: { y: 8, thickness: 0.5 },
};

/** Repeating wave/scroll pattern for borders */
export const BORDER_WAVE_SEGMENT =
  'M0 5 Q5 0 10 5 Q15 10 20 5';

// ── North Indian Kundali Chart Layout ──────────────────────────────────
// Diamond chart house positions (relative to a 200×200 bounding box)
// Each house is a polygon. House 1 is always top-center.
export const KUNDALI_HOUSES: { house: number; points: string; center: [number, number] }[] = [
  { house: 1,  points: '100,0 150,50 100,100 50,50',     center: [100, 50] },   // Top diamond
  { house: 2,  points: '150,50 200,0 200,100 150,50',    center: [175, 50] },    // Top-right
  { house: 3,  points: '150,50 200,100 150,100',          center: [170, 85] },    // Right-upper
  { house: 4,  points: '150,100 200,100 200,200 150,150', center: [175, 140] },   // Right-lower
  { house: 5,  points: '150,150 200,200 100,200 100,100', center: [140, 160] },   // Bottom-right
  { house: 6,  points: '100,100 100,200 50,150',          center: [85, 160] },     // Bottom-center-right
  { house: 7,  points: '100,200 50,150 0,200',            center: [50, 185] },     // Bottom diamond — wrong

  // Let me redo this properly for North Indian chart
  // The chart is a square with diagonal lines creating 12 triangular/trapezoidal houses
];

// ── Corrected North Indian Diamond Chart ────────────────────────────────
// Standard layout: outer square 200×200, inner diamond touching midpoints
//
//  (0,0)─────────(100,0)─────────(200,0)
//    │  \   12   /  |  \    1   /  │
//    │   \      /   |   \      /   │
//    │    (50,50)───┼──(150,50)    │
//    │ 11 /    \    |   /    \  2  │
//    │   /      \   |  /      \    │
//  (0,100)──────(100,100)──────(200,100)
//    │   \      /   |  \      /    │
//    │ 10 \    /    |   \    / 3   │
//    │    (50,150)──┼──(150,150)   │
//    │   /      \   |  /      \    │
//    │  /   9    \  | /    4   \   │
//  (0,200)─────(100,200)─────(200,200)
//                 ↑ 7 center     5,6,8

export const KUNDALI_CHART = {
  size: 200,
  // Outer square lines
  outerLines: [
    [[0,0],[200,0]], [[200,0],[200,200]], [[200,200],[0,200]], [[0,200],[0,0]],    // Square edges
    [[0,0],[100,100]], [[200,0],[100,100]],   // Top diagonals to center
    [[0,200],[100,100]], [[200,200],[100,100]], // Bottom diagonals to center
    [[100,0],[100,200]], [[0,100],[200,100]],  // Cross lines
  ] as [number, number][][],

  // House regions: polygon vertices and label center
  houses: [
    { house: 1,  poly: [[100,0],[150,50],[100,100],[50,50]],         cx: 100, cy: 40 },
    { house: 2,  poly: [[100,0],[200,0],[150,50]],                    cx: 150, cy: 18 },
    { house: 3,  poly: [[200,0],[200,100],[150,50]],                  cx: 182, cy: 50 },
    { house: 4,  poly: [[150,50],[200,100],[100,100]],                cx: 150, cy: 82 },
    { house: 5,  poly: [[100,100],[200,100],[200,200],[150,150]],     cx: 155, cy: 150 },
    { house: 6,  poly: [[200,200],[150,150],[100,200]],               cx: 150, cy: 182 },
    { house: 7,  poly: [[100,200],[150,150],[100,100],[50,150]],      cx: 100, cy: 160 },
    { house: 8,  poly: [[100,200],[50,150],[0,200]],                  cx: 50, cy: 182 },
    { house: 9,  poly: [[0,200],[50,150],[100,100],[0,100]],          cx: 45, cy: 150 },
    { house: 10, poly: [[0,100],[100,100],[50,50]],                   cx: 50, cy: 82 },
    { house: 11, poly: [[0,0],[50,50],[0,100]],                       cx: 18, cy: 50 },
    { house: 12, poly: [[0,0],[100,0],[50,50]],                       cx: 50, cy: 18 },
  ],
};

// ── Planet Abbreviations (Traditional) ──────────────────────────────────
export const GRAHA_ABBR: Record<string, string> = {
  Sun:     'Su',
  Moon:    'Mo',
  Mars:    'Ma',
  Mercury: 'Me',
  Jupiter: 'Ju',
  Venus:   'Ve',
  Saturn:  'Sa',
  Rahu:    'Ra',
  Ketu:    'Ke',
  Lagna:   'Asc',
};

// ── Devanagari Planet Names ─────────────────────────────────────────────
export const GRAHA_DEVANAGARI: Record<string, string> = {
  Sun:     'सू',
  Moon:    'चं',
  Mars:    'मं',
  Mercury: 'बु',
  Jupiter: 'गु',
  Venus:   'शु',
  Saturn:  'श',
  Rahu:    'रा',
  Ketu:    'के',
};
