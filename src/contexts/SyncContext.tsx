import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  getSyncSettings,
  setSyncAuthToken,
  setSyncEnabled,
  setSyncEndpoint,
  setSyncIdentity,
  syncNow,
  type SyncResult,
  type SyncSettings,
} from '../services/CloudSyncService';

interface SyncContextValue {
  settings: SyncSettings | null;
  loading: boolean;
  syncing: boolean;
  lastResult: SyncResult | null;
  refresh: () => Promise<void>;
  enableSync: (enabled: boolean) => Promise<void>;
  updateEndpoint: (endpoint: string) => Promise<void>;
  updateIdentity: (userId?: string) => Promise<void>;
  updateAuthToken: (authToken?: string) => Promise<void>;
  runSync: () => Promise<SyncResult>;
}

const SyncContext = createContext<SyncContextValue | null>(null);

export function SyncProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<SyncSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [lastResult, setLastResult] = useState<SyncResult | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    const s = await getSyncSettings();
    setSettings(s);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const enableSync = useCallback(async (enabled: boolean) => {
    const s = await setSyncEnabled(enabled);
    setSettings(s);
  }, []);

  const updateEndpoint = useCallback(async (endpoint: string) => {
    const s = await setSyncEndpoint(endpoint);
    setSettings(s);
  }, []);

  const updateIdentity = useCallback(async (userId?: string) => {
    const s = await setSyncIdentity(userId);
    setSettings(s);
  }, []);

  const updateAuthToken = useCallback(async (authToken?: string) => {
    const s = await setSyncAuthToken(authToken);
    setSettings(s);
  }, []);

  const runSync = useCallback(async (): Promise<SyncResult> => {
    setSyncing(true);
    const result = await syncNow();
    setLastResult(result);
    setSettings(await getSyncSettings());
    setSyncing(false);
    return result;
  }, []);

  const value = useMemo<SyncContextValue>(() => ({
    settings,
    loading,
    syncing,
    lastResult,
    refresh,
    enableSync,
    updateEndpoint,
    updateIdentity,
    updateAuthToken,
    runSync,
  }), [settings, loading, syncing, lastResult, refresh, enableSync, updateEndpoint, updateIdentity, updateAuthToken, runSync]);

  return <SyncContext.Provider value={value}>{children}</SyncContext.Provider>;
}

export function useSync(): SyncContextValue {
  const ctx = useContext(SyncContext);
  if (!ctx) throw new Error('useSync() must be used inside <SyncProvider>');
  return ctx;
}
