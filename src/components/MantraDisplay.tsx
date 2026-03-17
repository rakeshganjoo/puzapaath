import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import type { MantraText, ScriptType } from '../types';
import {
  playMantra,
  stopMantra,
  hasMantraAudio,
  setMantraSpeed,
  getMantraSpeed,
  type PlaybackState,
} from '../services/AudioService';

interface Props {
  mantra: MantraText;
  script: ScriptType;
  size?: 'normal' | 'small';
  audioId?: string;
}

const SPEED_OPTIONS = [0.5, 0.75, 1.0];

export default function MantraDisplay({ mantra, script, size = 'normal', audioId }: Props) {
  const isSmall = size === 'small';
  const canPlay = audioId ? hasMantraAudio(audioId) : false;
  const [playState, setPlayState] = useState<PlaybackState>('stopped');
  const [progress, setProgress] = useState(0);
  const [speed, setSpeed] = useState(getMantraSpeed());

  // Split text into words for karaoke highlighting
  const words = useMemo(() => {
    const text = mantra[script] || mantra.roman;
    return text.split(/\s+/).filter(Boolean);
  }, [mantra, script]);

  const activeWordIndex = useMemo(() => {
    if (playState !== 'playing' || words.length === 0) return -1;
    return Math.min(Math.floor(progress * words.length), words.length - 1);
  }, [progress, words, playState]);

  useEffect(() => {
    return () => { stopMantra(); };
  }, []);

  const handlePlay = useCallback(async () => {
    if (!audioId) return;
    if (playState === 'playing') {
      await playMantra(audioId);
      return;
    }
    await playMantra(audioId, (state, posMs, durMs) => {
      setPlayState(state);
      setProgress(durMs > 0 ? posMs / durMs : 0);
    });
  }, [audioId, playState]);

  const handleSpeed = useCallback(async () => {
    const idx = SPEED_OPTIONS.indexOf(speed);
    const next = SPEED_OPTIONS[(idx + 1) % SPEED_OPTIONS.length];
    setSpeed(next);
    await setMantraSpeed(next);
  }, [speed]);

  const playIcon = playState === 'playing' ? '⏸' : playState === 'loading' ? '⏳' : '▶️';

  return (
    <View style={[styles.container, isSmall && styles.containerSmall]}>
      {/* Audio controls row */}
      {canPlay && (
        <View style={styles.audioRow}>
          <View style={styles.controlsRow}>
            <TouchableOpacity style={styles.playBtn} onPress={handlePlay}>
              <Text style={styles.playIcon}>{playIcon}</Text>
              <Text style={styles.playLabel}>
                {playState === 'playing' ? 'Pause' : playState === 'loading' ? 'Loading...' : 'Play Mantra'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.speedBtn} onPress={handleSpeed}>
              <Text style={styles.speedText}>{speed}x</Text>
            </TouchableOpacity>
          </View>
          {(playState === 'playing' || playState === 'paused') && (
            <View style={styles.progressBarContainer}>
              <View style={[styles.progressBar, { width: `${progress * 100}%` }]} />
            </View>
          )}
        </View>
      )}

      {/* Karaoke word-by-word display */}
      {playState === 'playing' || playState === 'paused' ? (
        <View style={styles.karaokeContainer}>
          <Text style={[styles.karaokeWrap, isSmall && styles.primarySmall]}>
            {words.map((word, i) => (
              <Text
                key={i}
                style={[
                  styles.karaokeWord,
                  i === activeWordIndex && styles.karaokeActive,
                  i < activeWordIndex && styles.karaokePast,
                ]}
              >
                {word}{' '}
              </Text>
            ))}
          </Text>
        </View>
      ) : (
        <>
          {/* Static display when not playing */}
          <Text style={[styles.primary, isSmall && styles.primarySmall]}>
            {mantra[script]}
          </Text>
        </>
      )}

      {/* Show other scripts underneath */}
      {script !== 'devanagari' && (
        <Text style={[styles.secondary, isSmall && styles.secondarySmall]}>
          {mantra.devanagari}
        </Text>
      )}
      {script !== 'roman' && (
        <Text style={[styles.transliteration, isSmall && styles.secondarySmall]}>
          {mantra.roman}
        </Text>
      )}
      {script !== 'english' && (
        <Text style={[styles.translation, isSmall && styles.translationSmall]}>
          {mantra.english}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#EAEAEF',
  },
  containerSmall: { padding: 12 },
  primary: {
    fontSize: 36,
    fontWeight: '600',
    color: '#9A7B4F',
    lineHeight: 56,
    textAlign: 'center',
  },
  primarySmall: { fontSize: 22, lineHeight: 34 },
  secondary: {
    fontSize: 22,
    color: '#B08D5B',
    lineHeight: 34,
    textAlign: 'center',
    marginTop: 12,
    opacity: 0.8,
  },
  secondarySmall: { fontSize: 16, lineHeight: 24, marginTop: 6 },
  transliteration: {
    fontSize: 14,
    color: '#888',
    lineHeight: 24,
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
  },
  translation: {
    fontSize: 13,
    color: '#888',
    lineHeight: 22,
    textAlign: 'center',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#EAEAEF',
  },
  translationSmall: { fontSize: 12, lineHeight: 18, marginTop: 6, paddingTop: 6 },
  audioRow: {
    marginBottom: 12,
    alignItems: 'center',
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  playBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6C5CE7',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 24,
  },
  playIcon: { fontSize: 16, marginRight: 8 },
  playLabel: { fontSize: 13, fontWeight: '600', color: '#fff' },
  speedBtn: {
    backgroundColor: '#F0F0F5',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#EAEAEF',
  },
  speedText: { fontSize: 13, fontWeight: '700', color: '#6C5CE7' },
  progressBarContainer: {
    height: 3,
    backgroundColor: '#EAEAEF',
    borderRadius: 2,
    marginTop: 8,
    width: '80%',
  },
  progressBar: {
    height: 3,
    backgroundColor: '#6C5CE7',
    borderRadius: 2,
  },
  karaokeContainer: {
    paddingVertical: 12,
  },
  karaokeWrap: {
    textAlign: 'center',
    lineHeight: 58,
    fontSize: 36,
  },
  karaokeWord: {
    fontSize: 36,
    color: '#CCC',
    fontWeight: '400',
  },
  karaokeActive: {
    color: '#9A7B4F',
    fontWeight: '800',
    fontSize: 40,
    backgroundColor: '#F8F4ED',
  },
  karaokePast: {
    color: '#888',
    fontWeight: '500',
  },
});
