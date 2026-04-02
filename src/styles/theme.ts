/**
 * src/styles/theme.ts — Single Source of Truth for all UI tokens.
 *
 * Every color, spacing value, and font size in the app should reference
 * these tokens via the useTheme() hook from UIContext.
 * Never hard-code colors or spacing in individual StyleSheets.
 */

export const colors = {
  // Brand
  primary:        '#8B0000',  // maroon — primary action
  primaryLight:   '#C0392B',
  primaryDark:    '#5C0000',
  accent:         '#FFD700',  // gold
  accentLight:    '#FFF3CD',

  // Backgrounds
  bgApp:          '#FFF8F0',  // parchment
  bgCard:         '#FFFFFF',
  bgSurface:      '#FEF9E7',
  bgDark:         '#1A1A1A',

  // Text
  textPrimary:    '#1A1A1A',
  textSecondary:  '#555555',
  textMuted:      '#888888',
  textInverse:    '#FFFFFF',
  textAccent:     '#8B0000',

  // Status
  success:        '#27AE60',
  successLight:   '#EAFAF1',
  warning:        '#E67E22',
  warningLight:   '#FEF9E7',
  error:          '#C0392B',
  errorLight:     '#FDEDEC',
  info:           '#2980B9',
  infoLight:      '#EBF5FB',

  // Calendar
  calShukla:      '#FFF5E6',  // light orange for shukla paksha
  calKrishna:     '#E8EAF6',  // light blue/purple for krishna paksha
  calFestival:    '#FCE4EC',
  calToday:       '#8B0000',
  calTodayText:   '#FFFFFF',
  calSelected:    '#FFCDD2',

  // Borders / Dividers
  border:         '#E0E0E0',
  borderLight:    '#F0F0F0',
  borderDark:     '#BDBDBD',

  // Misc
  overlay:        'rgba(0,0,0,0.4)',
  transparent:    'transparent',
};

export const spacing = {
  xs:   4,
  sm:   8,
  md:   12,
  lg:   16,
  xl:   24,
  xxl:  32,
  xxxl: 48,
};

export const typography = {
  // Font sizes
  xs:   11,
  sm:   13,
  md:   15,
  lg:   17,
  xl:   20,
  xxl:  24,
  xxxl: 30,
  title: 36,

  // Font families (system fonts; replace with custom if needed)
  regular:    undefined,  // system default
  bold:       undefined,
  devanagari: undefined,  // system default handles Devanagari
} as const;

export const radii = {
  sm:   4,
  md:   8,
  lg:   12,
  xl:   16,
  pill: 999,
};

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
};

export const theme = { colors, spacing, typography, radii, shadows };

export type Theme = typeof theme;
