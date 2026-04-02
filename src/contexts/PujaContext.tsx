/**
 * src/contexts/PujaContext.tsx — Puja session state management.
 *
 * Puja session state and active-profile wiring for puja screens.
 *
 * Usage:
 *   const { activeProfile, currentPartId, currentStepIndex, scriptType } = usePuja();
 */

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import type { UserProfile } from '../services/ProfileService';
import { getActiveProfile } from '../services/ProfileService';

type PujaPartId = 'A' | 'B' | 'C';
type ScriptType = 'devanagari' | 'roman' | 'english';

interface PujaState {
  activeProfile: UserProfile | null;
  currentPartId: PujaPartId;
  currentStepIndex: number;
  scriptType: ScriptType;
  progress: {
    completed: number;
    total: number;
  };
}

interface PujaContextValue extends PujaState {
  setProfile: (profile: UserProfile | null) => void;
  setPartId: (partId: PujaPartId) => void;
  setStepIndex: (index: number) => void;
  setScriptType: (script: ScriptType) => void;
  incrementStep: () => void;
  decrementStep: () => void;
  resetProgress: () => void;
  refreshProfile: () => Promise<void>;
}

const DEFAULT_STATE: PujaState = {
  activeProfile: null,
  currentPartId: 'A',
  currentStepIndex: 0,
  scriptType: 'devanagari',
  progress: { completed: 0, total: 0 },
};

const PujaContext = createContext<PujaContextValue | null>(null);

export function PujaProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<PujaState>(DEFAULT_STATE);

  // Phase 3: Load active profile from persistent storage on mount
  useEffect(() => {
    getActiveProfile().then((profile) => {
      if (profile) setState((s) => ({ ...s, activeProfile: profile }));
    });
  }, []);

  const refreshProfile = useCallback(async () => {
    const profile = await getActiveProfile();
    setState((s) => ({ ...s, activeProfile: profile }));
  }, []);

  const setProfile = useCallback((profile: UserProfile | null) => {
    setState((s) => ({ ...s, activeProfile: profile }));
  }, []);

  const setPartId = useCallback((partId: PujaPartId) => {
    setState((s) => ({ ...s, currentPartId: partId, currentStepIndex: 0 }));
  }, []);

  const setStepIndex = useCallback((index: number) => {
    setState((s) => ({ ...s, currentStepIndex: index }));
  }, []);

  const setScriptType = useCallback((script: ScriptType) => {
    setState((s) => ({ ...s, scriptType: script }));
  }, []);

  const incrementStep = useCallback(() => {
    setState((s) => ({
      ...s,
      currentStepIndex: s.currentStepIndex + 1,
      progress: {
        ...s.progress,
        completed: Math.min(s.progress.completed + 1, s.progress.total),
      },
    }));
  }, []);

  const decrementStep = useCallback(() => {
    setState((s) => ({
      ...s,
      currentStepIndex: Math.max(0, s.currentStepIndex - 1),
    }));
  }, []);

  const resetProgress = useCallback(() => {
    setState((s) => ({
      ...s,
      currentStepIndex: 0,
      progress: { ...s.progress, completed: 0 },
    }));
  }, []);

  const value: PujaContextValue = {
    ...state,
    setProfile,
    setPartId,
    setStepIndex,
    setScriptType,
    incrementStep,
    decrementStep,
    resetProgress,
    refreshProfile,
  };

  return <PujaContext.Provider value={value}>{children}</PujaContext.Provider>;
}

export function usePuja(): PujaContextValue {
  const ctx = useContext(PujaContext);
  if (!ctx) {
    throw new Error('usePuja() must be used inside <PujaProvider>');
  }
  return ctx;
}
