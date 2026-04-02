/**
 * src/contexts/UIContext.tsx — Theme and global UI state.
 *
 * Usage:
 *   const { colors, spacing, typography } = useTheme();
 *
 * Wrap your root navigator / App.tsx with <UIProvider>.
 */

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { theme, type Theme } from '../styles/theme';
import { get, set } from '../services/StorageService';
import { DEFAULT_LOCALE, SUPPORTED_LOCALES, translate, type AppLocale } from '../i18n/translations';

const LOCALE_STORAGE_KEY = '@ui_locale';

interface UIContextValue {
  theme: Theme;
  /** Convenience aliases so callers can destructure directly. */
  colors: Theme['colors'];
  spacing: Theme['spacing'];
  typography: Theme['typography'];
  radii: Theme['radii'];
  shadows: Theme['shadows'];
  locale: AppLocale;
  setLocale: (next: AppLocale) => void;
  t: (key: string, fallback?: string) => string;
  supportedLocales: { code: AppLocale; label: string }[];
}

const UIContext = createContext<UIContextValue | null>(null);

export function UIProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<AppLocale>(DEFAULT_LOCALE);

  useEffect(() => {
    get(LOCALE_STORAGE_KEY).then((stored) => {
      if (stored === 'en' || stored === 'hi' || stored === 'ks') {
        setLocaleState(stored);
      }
    });
  }, []);

  const setLocale = (next: AppLocale) => {
    setLocaleState(next);
    set(LOCALE_STORAGE_KEY, next).catch(() => {});
  };

  const t = useMemo(() => {
    return (key: string, fallback?: string) => translate(locale, key, fallback);
  }, [locale]);

  const value: UIContextValue = {
    theme,
    colors: theme.colors,
    spacing: theme.spacing,
    typography: theme.typography,
    radii: theme.radii,
    shadows: theme.shadows,
    locale,
    setLocale,
    t,
    supportedLocales: SUPPORTED_LOCALES,
  };

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
}

export function useTheme(): UIContextValue {
  const ctx = useContext(UIContext);
  if (!ctx) {
    throw new Error('useTheme() must be used inside <UIProvider>');
  }
  return ctx;
}
