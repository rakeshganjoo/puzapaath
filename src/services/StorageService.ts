/**
 * src/services/StorageService.ts — Unified storage abstraction.
 *
 * Bridges AsyncStorage (React Native / iOS) and localStorage (web/browser).
 * All services that persist data MUST go through here — never import
 * AsyncStorage or reference window.localStorage directly.
 *
 * Phase 2 will migrate ProfileService and SavedEventsService to use this.
 */

import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

function isWeb(): boolean {
  return Platform.OS === 'web';
}

export const StorageService = {
  async get(key: string): Promise<string | null> {
    if (isWeb()) {
      return window.localStorage.getItem(key);
    }
    return AsyncStorage.getItem(key);
  },

  async set(key: string, value: string): Promise<void> {
    if (isWeb()) {
      window.localStorage.setItem(key, value);
      return;
    }
    await AsyncStorage.setItem(key, value);
  },

  async remove(key: string): Promise<void> {
    if (isWeb()) {
      window.localStorage.removeItem(key);
      return;
    }
    await AsyncStorage.removeItem(key);
  },

  async clear(): Promise<void> {
    if (isWeb()) {
      window.localStorage.clear();
      return;
    }
    await AsyncStorage.clear();
  },

  /** Convenience: get and JSON-parse. Returns null on miss or parse error. */
  async getJSON<T>(key: string): Promise<T | null> {
    const raw = await StorageService.get(key);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  },

  /** Convenience: JSON-stringify and set. */
  async setJSON<T>(key: string, value: T): Promise<void> {
    await StorageService.set(key, JSON.stringify(value));
  },
};

// Named function exports — import these when you want tree-shakeable named imports
export const get    = (key: string)            => StorageService.get(key);
export const set    = (key: string, v: string) => StorageService.set(key, v);
export const remove = (key: string)            => StorageService.remove(key);
export const clear  = ()                       => StorageService.clear();
export const getJSON = <T>(key: string)              => StorageService.getJSON<T>(key);
export const setJSON = <T>(key: string, value: T)    => StorageService.setJSON<T>(key, value);
