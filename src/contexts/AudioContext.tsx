/**
 * src/contexts/AudioContext.tsx — React Context wrapper for audio playback.
 *
 * Replaces module-level mutable state in AudioService.ts with proper React state
 * that is visible to DevTools, testable, and SSR-safe.
 *
 * Phase 1: This context is created alongside the existing AudioService.
 *          Screens can optionally start using useAudio().
 * Phase 2: AudioService internals will be migrated to dispatch into this context.
 *
 * Usage:
 *   const { mantraState, playMantra, stopMantra, narrationLang, setNarrationLang } = useAudio();
 *
 * Wrap root with <AudioProvider>.
 */

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import * as AudioService from '../services/AudioService';
import type { PlaybackState } from '../services/AudioService';

export type { PlaybackState };

export type NarrationLang = 'hi' | 'en';

interface PlaybackInfo {
  state: PlaybackState;
  currentId: string | null;
  positionMs: number;
  durationMs: number;
}

const INITIAL_PLAYBACK: PlaybackInfo = {
  state: 'stopped',
  currentId: null,
  positionMs: 0,
  durationMs: 0,
};

interface AudioContextValue {
  mantra: PlaybackInfo;
  narration: PlaybackInfo;
  narrationLang: NarrationLang;
  mantraSpeed: number;

  playMantra: (stepId: string) => Promise<void>;
  stopMantra: () => Promise<void>;
  setMantraSpeed: (rate: number) => Promise<void>;

  playNarration: (stepId: string, lang?: NarrationLang) => Promise<void>;
  stopNarration: () => Promise<void>;
  setNarrationLang: (lang: NarrationLang) => void;

  stopAll: () => Promise<void>;
  hasMantraAudio: (stepId: string) => boolean;
  hasNarrationAudio: (stepId: string, lang?: NarrationLang) => boolean;
}

const AudioContext = createContext<AudioContextValue | null>(null);

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const [mantra, setMantra] = useState<PlaybackInfo>(INITIAL_PLAYBACK);
  const [narration, setNarration] = useState<PlaybackInfo>(INITIAL_PLAYBACK);
  const [narrationLang, setNarrationLangState] = useState<NarrationLang>('hi');
  const [mantraSpeed, setMantraSpeedState] = useState(1.0);
  const initialized = useRef(false);

  // Load persisted narration language on mount.
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    AudioService.loadNarrationLang().then((lang) => {
      setNarrationLangState(lang as NarrationLang);
    });
  }, []);

  const playMantra = useCallback(async (stepId: string) => {
    setMantra({ state: 'loading', currentId: stepId, positionMs: 0, durationMs: 0 });
    await AudioService.playMantra(stepId, (state, positionMs, durationMs) => {
      setMantra({ state, currentId: stepId, positionMs, durationMs });
    });
  }, []);

  const stopMantra = useCallback(async () => {
    await AudioService.stopMantra();
    setMantra(INITIAL_PLAYBACK);
  }, []);

  const setMantraSpeedFn = useCallback(async (rate: number) => {
    await AudioService.setMantraSpeed(rate);
    setMantraSpeedState(rate);
  }, []);

  const playNarration = useCallback(async (stepId: string, lang?: NarrationLang) => {
    const effectiveLang = lang ?? narrationLang;
    setNarration({ state: 'loading', currentId: stepId, positionMs: 0, durationMs: 0 });
    await AudioService.playNarration(
      stepId,
      (state, positionMs, durationMs) => {
        setNarration({ state, currentId: stepId, positionMs, durationMs });
      },
      effectiveLang,
    );
  }, [narrationLang]);

  const stopNarration = useCallback(async () => {
    await AudioService.stopNarration();
    setNarration(INITIAL_PLAYBACK);
  }, []);

  const setNarrationLang = useCallback((lang: NarrationLang) => {
    AudioService.setNarrationLang(lang);
    setNarrationLangState(lang);
  }, []);

  const stopAll = useCallback(async () => {
    await AudioService.stopAll();
    setMantra(INITIAL_PLAYBACK);
    setNarration(INITIAL_PLAYBACK);
  }, []);

  const value: AudioContextValue = {
    mantra,
    narration,
    narrationLang,
    mantraSpeed,
    playMantra,
    stopMantra,
    setMantraSpeed: setMantraSpeedFn,
    playNarration,
    stopNarration,
    setNarrationLang,
    stopAll,
    hasMantraAudio: AudioService.hasMantraAudio,
    hasNarrationAudio: AudioService.hasNarrationAudio,
  };

  return <AudioContext.Provider value={value}>{children}</AudioContext.Provider>;
}

export function useAudio(): AudioContextValue {
  const ctx = useContext(AudioContext);
  if (!ctx) {
    throw new Error('useAudio() must be used inside <AudioProvider>');
  }
  return ctx;
}
