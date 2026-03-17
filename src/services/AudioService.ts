import { Audio } from 'expo-av';
import type { AVPlaybackStatus } from 'expo-av';
import AsyncStorage from '@react-native-async-storage/async-storage';

const NARRATION_LANG_KEY = '@narration_lang';

// --- Mantra audio map (Sanskrit TTS) ---
const MANTRA_AUDIO: Record<string, ReturnType<typeof require>> = {
  A1: require('../assets/audio/A1.m4a'),
  A2: require('../assets/audio/A2.m4a'),
  A3: require('../assets/audio/A3.m4a'),
  A3a: require('../assets/audio/A3a.m4a'),
  A4: require('../assets/audio/A4.m4a'),
  A5: require('../assets/audio/A5.m4a'),
  A6: require('../assets/audio/A6.m4a'),
  A7: require('../assets/audio/A7.m4a'),
  A8: require('../assets/audio/A8.m4a'),
  A8a1: require('../assets/audio/A8a1.m4a'),
  A8a2: require('../assets/audio/A8a2.m4a'),
  A8a3: require('../assets/audio/A8a3.m4a'),
  A8a4: require('../assets/audio/A8a4.m4a'),
  A8a5: require('../assets/audio/A8a5.m4a'),
  A8a6: require('../assets/audio/A8a6.m4a'),
  A8b1: require('../assets/audio/A8b1.m4a'),
  A8b2: require('../assets/audio/A8b2.m4a'),
  A8b3: require('../assets/audio/A8b3.m4a'),
  A8b4: require('../assets/audio/A8b4.m4a'),
  A8b5: require('../assets/audio/A8b5.m4a'),
  A8b6: require('../assets/audio/A8b6.m4a'),
  A9: require('../assets/audio/A9.m4a'),
  A11: require('../assets/audio/A11.m4a'),
  A12: require('../assets/audio/A12.m4a'),
  A13: require('../assets/audio/A13.m4a'),
  A14a: require('../assets/audio/A14a.m4a'),
  A14b: require('../assets/audio/A14b.m4a'),
  A14c: require('../assets/audio/A14c.m4a'),
  A14d: require('../assets/audio/A14d.m4a'),
  A14e: require('../assets/audio/A14e.m4a'),
  A15: require('../assets/audio/A15.m4a'),
  B0: require('../assets/audio/B0.m4a'),
  B1: require('../assets/audio/B1.m4a'),
  B2: require('../assets/audio/B2.m4a'),
  B3: require('../assets/audio/B3.m4a'),
  B4: require('../assets/audio/B4.m4a'),
  B5: require('../assets/audio/B5.m4a'),
  B6: require('../assets/audio/B6.m4a'),
  B7: require('../assets/audio/B7.m4a'),
  B8: require('../assets/audio/B8.m4a'),
  B9: require('../assets/audio/B9.m4a'),
  B9v1: require('../assets/audio/B9v1.m4a'),
  B9v2: require('../assets/audio/B9v2.m4a'),
  B9v3: require('../assets/audio/B9v3.m4a'),
  B9v4: require('../assets/audio/B9v4.m4a'),
  B9v5: require('../assets/audio/B9v5.m4a'),
  B9v6: require('../assets/audio/B9v6.m4a'),
  B10: require('../assets/audio/B10.m4a'),
  C1: require('../assets/audio/C1.m4a'),
  C2: require('../assets/audio/C2.m4a'),
};

// --- Narration audio maps ---
import type { NarrationLang } from '../data/narrations';

const NARRATION_AUDIO_EN: Record<string, ReturnType<typeof require>> = {
  A1: require('../assets/audio/narration/narr_A1.m4a'),
  A2: require('../assets/audio/narration/narr_A2.m4a'),
  A3: require('../assets/audio/narration/narr_A3.m4a'),
  A4: require('../assets/audio/narration/narr_A4.m4a'),
  A5: require('../assets/audio/narration/narr_A5.m4a'),
  A6: require('../assets/audio/narration/narr_A6.m4a'),
  A7: require('../assets/audio/narration/narr_A7.m4a'),
  A8: require('../assets/audio/narration/narr_A8.m4a'),
  A9: require('../assets/audio/narration/narr_A9.m4a'),
  A10: require('../assets/audio/narration/narr_A10.m4a'),
  A11: require('../assets/audio/narration/narr_A11.m4a'),
  A12: require('../assets/audio/narration/narr_A12.m4a'),
  A13: require('../assets/audio/narration/narr_A13.m4a'),
  A14: require('../assets/audio/narration/narr_A14.m4a'),
  A15: require('../assets/audio/narration/narr_A15.m4a'),
  B0: require('../assets/audio/narration/narr_B0.m4a'),
  B1: require('../assets/audio/narration/narr_B1.m4a'),
  B2: require('../assets/audio/narration/narr_B2.m4a'),
  B3: require('../assets/audio/narration/narr_B3.m4a'),
  B4: require('../assets/audio/narration/narr_B4.m4a'),
  B5: require('../assets/audio/narration/narr_B5.m4a'),
  B6: require('../assets/audio/narration/narr_B6.m4a'),
  B7: require('../assets/audio/narration/narr_B7.m4a'),
  B8: require('../assets/audio/narration/narr_B8.m4a'),
  B9: require('../assets/audio/narration/narr_B9.m4a'),
  B10: require('../assets/audio/narration/narr_B10.m4a'),
  C1: require('../assets/audio/narration/narr_C1.m4a'),
  C2: require('../assets/audio/narration/narr_C2.m4a'),
};

const NARRATION_AUDIO_HI: Record<string, ReturnType<typeof require>> = {
  A1: require('../assets/audio/narration_hi/narr_A1.m4a'),
  A2: require('../assets/audio/narration_hi/narr_A2.m4a'),
  A3: require('../assets/audio/narration_hi/narr_A3.m4a'),
  A4: require('../assets/audio/narration_hi/narr_A4.m4a'),
  A5: require('../assets/audio/narration_hi/narr_A5.m4a'),
  A6: require('../assets/audio/narration_hi/narr_A6.m4a'),
  A7: require('../assets/audio/narration_hi/narr_A7.m4a'),
  A8: require('../assets/audio/narration_hi/narr_A8.m4a'),
  A9: require('../assets/audio/narration_hi/narr_A9.m4a'),
  A10: require('../assets/audio/narration_hi/narr_A10.m4a'),
  A11: require('../assets/audio/narration_hi/narr_A11.m4a'),
  A12: require('../assets/audio/narration_hi/narr_A12.m4a'),
  A13: require('../assets/audio/narration_hi/narr_A13.m4a'),
  A14: require('../assets/audio/narration_hi/narr_A14.m4a'),
  A15: require('../assets/audio/narration_hi/narr_A15.m4a'),
  B0: require('../assets/audio/narration_hi/narr_B0.m4a'),
  B1: require('../assets/audio/narration_hi/narr_B1.m4a'),
  B2: require('../assets/audio/narration_hi/narr_B2.m4a'),
  B3: require('../assets/audio/narration_hi/narr_B3.m4a'),
  B4: require('../assets/audio/narration_hi/narr_B4.m4a'),
  B5: require('../assets/audio/narration_hi/narr_B5.m4a'),
  B6: require('../assets/audio/narration_hi/narr_B6.m4a'),
  B7: require('../assets/audio/narration_hi/narr_B7.m4a'),
  B8: require('../assets/audio/narration_hi/narr_B8.m4a'),
  B9: require('../assets/audio/narration_hi/narr_B9.m4a'),
  B10: require('../assets/audio/narration_hi/narr_B10.m4a'),
  C1: require('../assets/audio/narration_hi/narr_C1.m4a'),
  C2: require('../assets/audio/narration_hi/narr_C2.m4a'),
};

function getNarrationAudioMap(lang: NarrationLang): Record<string, ReturnType<typeof require>> {
  return lang === 'hi' ? NARRATION_AUDIO_HI : NARRATION_AUDIO_EN;
}

// --- Dual-channel state ---
let mantraSound: Audio.Sound | null = null;
let mantraId: string | null = null;
let mantraCallback: PlaybackCallback | null = null;
let mantraRate = 1.0;

let narrationSound: Audio.Sound | null = null;
let narrationId: string | null = null;
let narrationCallback: PlaybackCallback | null = null;

export type PlaybackState = 'stopped' | 'playing' | 'paused' | 'loading';
export type PlaybackCallback = (state: PlaybackState, positionMs: number, durationMs: number) => void;

// --- Internal handlers ---
function handleMantraStatus(status: AVPlaybackStatus) {
  if (!status.isLoaded) return;
  if (status.didJustFinish) {
    mantraCallback?.('stopped', 0, status.durationMillis ?? 0);
    return;
  }
  const state: PlaybackState = status.isPlaying ? 'playing' : 'paused';
  mantraCallback?.(state, status.positionMillis, status.durationMillis ?? 0);
}

function handleNarrationStatus(status: AVPlaybackStatus) {
  if (!status.isLoaded) return;
  if (status.didJustFinish) {
    narrationCallback?.('stopped', 0, status.durationMillis ?? 0);
    return;
  }
  const state: PlaybackState = status.isPlaying ? 'playing' : 'paused';
  narrationCallback?.(state, status.positionMillis, status.durationMillis ?? 0);
}

// --- Mantra playback ---
export async function playMantra(stepId: string, callback?: PlaybackCallback): Promise<void> {
  const asset = MANTRA_AUDIO[stepId];
  if (!asset) return;

  if (mantraId === stepId && mantraSound) {
    const status = await mantraSound.getStatusAsync();
    if (status.isLoaded && status.isPlaying) {
      await mantraSound.pauseAsync();
      return;
    }
    if (status.isLoaded && !status.isPlaying) {
      await mantraSound.playAsync();
      return;
    }
  }

  await stopMantra();
  mantraCallback = callback ?? null;
  callback?.('loading', 0, 0);

  const { sound } = await Audio.Sound.createAsync(asset, {
    shouldPlay: true,
    rate: mantraRate,
    shouldCorrectPitch: true,
  });
  mantraSound = sound;
  mantraId = stepId;
  sound.setOnPlaybackStatusUpdate(handleMantraStatus);
}

export async function stopMantra(): Promise<void> {
  if (mantraSound) {
    try {
      await mantraSound.stopAsync();
      await mantraSound.unloadAsync();
    } catch { /* ignore */ }
    mantraSound = null;
    mantraId = null;
    mantraCallback?.('stopped', 0, 0);
    mantraCallback = null;
  }
}

export async function setMantraSpeed(rate: number): Promise<void> {
  mantraRate = rate;
  if (mantraSound) {
    try {
      await mantraSound.setRateAsync(rate, true);
    } catch { /* ignore */ }
  }
}

export function getMantraSpeed(): number {
  return mantraRate;
}

// --- Narration playback ---
let currentNarrationLang: NarrationLang = 'hi';

export function setNarrationLang(lang: NarrationLang): void {
  currentNarrationLang = lang;
  AsyncStorage.setItem(NARRATION_LANG_KEY, lang).catch(() => {});
}

export function getNarrationLang(): NarrationLang {
  return currentNarrationLang;
}

export async function loadNarrationLang(): Promise<NarrationLang> {
  const saved = await AsyncStorage.getItem(NARRATION_LANG_KEY);
  if (saved === 'en' || saved === 'hi') {
    currentNarrationLang = saved;
  }
  return currentNarrationLang;
}

export async function playNarration(stepId: string, callback?: PlaybackCallback, lang?: NarrationLang): Promise<void> {
  const effectiveLang = lang ?? currentNarrationLang;
  const audioMap = getNarrationAudioMap(effectiveLang);
  const asset = audioMap[stepId];
  if (!asset) return;

  if (narrationId === stepId && narrationSound) {
    const status = await narrationSound.getStatusAsync();
    if (status.isLoaded && status.isPlaying) {
      await narrationSound.pauseAsync();
      return;
    }
    if (status.isLoaded && !status.isPlaying) {
      await narrationSound.playAsync();
      return;
    }
  }

  await stopNarration();
  narrationCallback = callback ?? null;
  callback?.('loading', 0, 0);

  const { sound } = await Audio.Sound.createAsync(asset, { shouldPlay: true });
  narrationSound = sound;
  narrationId = stepId;
  sound.setOnPlaybackStatusUpdate(handleNarrationStatus);
}

export async function stopNarration(): Promise<void> {
  if (narrationSound) {
    try {
      await narrationSound.stopAsync();
      await narrationSound.unloadAsync();
    } catch { /* ignore */ }
    narrationSound = null;
    narrationId = null;
    narrationCallback?.('stopped', 0, 0);
    narrationCallback = null;
  }
}

// --- Query helpers ---
export function hasMantraAudio(stepId: string): boolean {
  return stepId in MANTRA_AUDIO;
}

export function hasNarrationAudio(stepId: string, lang?: NarrationLang): boolean {
  const audioMap = getNarrationAudioMap(lang ?? currentNarrationLang);
  return stepId in audioMap;
}

// --- Stop all ---
export async function stopAll(): Promise<void> {
  await stopMantra();
  await stopNarration();
}

// --- Sequential mantra playback for auto-play sub-steps ---
let sequenceAbort = false;

export function stopSequence(): void {
  sequenceAbort = true;
}

/**
 * Play a sequence of mantra audio IDs one after another.
 * Calls onStep(index) before each step starts.
 * pauseMs is the delay between steps (default 3000ms).
 * Returns when all steps are done or aborted.
 */
export async function playMantraSequence(
  ids: string[],
  onStep: (index: number) => void,
  onStepProgress?: (index: number, state: PlaybackState, posMs: number, durMs: number) => void,
  pauseMs = 3000,
): Promise<void> {
  sequenceAbort = false;

  for (let i = 0; i < ids.length; i++) {
    if (sequenceAbort) break;
    onStep(i);

    const id = ids[i];
    if (!MANTRA_AUDIO[id]) continue;

    // Play and wait for completion
    await new Promise<void>((resolve) => {
      playMantra(id, (state, posMs, durMs) => {
        onStepProgress?.(i, state, posMs, durMs);
        if (state === 'stopped') resolve();
      });
    });

    if (sequenceAbort) break;

    // Pause between steps (skip after last)
    if (i < ids.length - 1 && pauseMs > 0) {
      await new Promise<void>((resolve) => {
        const timer = setTimeout(resolve, pauseMs);
        const check = setInterval(() => {
          if (sequenceAbort) { clearTimeout(timer); clearInterval(check); resolve(); }
        }, 200);
        setTimeout(() => clearInterval(check), pauseMs + 100);
      });
    }
  }

  // Signal end
  onStep(-1);
}

// --- Backward compat aliases ---
export const playAudio = playMantra;
export const stopAudio = stopMantra;
export const hasAudio = hasMantraAudio;

export function getCurrentId(): string | null {
  return mantraId;
}
