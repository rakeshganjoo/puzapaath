import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';
import pujaData from '../data/pujaData';
import MantraDisplay from '../components/MantraDisplay';
import {
  stopAll,
  playNarration,
  stopNarration,
  hasNarrationAudio,
  getNarrationLang,
  setNarrationLang,
  loadNarrationLang,
  hasMantraAudio,
  playMantraSequence,
  stopSequence,
  stopMantra,
  type PlaybackState,
} from '../services/AudioService';
import { getNarration, type NarrationLang } from '../data/narrations';
import type { ScriptType } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'StepDetail'>;

export default function StepDetailScreen({ route, navigation }: Props) {
  const { partId, stepIndex } = route.params;
  const part = pujaData.parts.find((p) => p.id === partId);
  const [script, setScript] = useState<ScriptType>('roman');
  const [expandedSub, setExpandedSub] = useState<string | null>(null);
  const [narrState, setNarrState] = useState<PlaybackState>('stopped');
  const [narrProgress, setNarrProgress] = useState(0);
  const [narrLang, setNarrLang] = useState<NarrationLang>(getNarrationLang());
  const [autoPlayIndex, setAutoPlayIndex] = useState(-1); // -1 = not playing
  const [autoPlayProgress, setAutoPlayProgress] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);

  if (!part) return <Text>Part not found</Text>;
  const step = part.steps[stepIndex];
  if (!step) return <Text>Step not found</Text>;

  const hasNext = stepIndex < part.steps.length - 1;
  const hasPrev = stepIndex > 0;
  const partIndex = pujaData.parts.findIndex((p) => p.id === partId);
  const nextPart = pujaData.parts[partIndex + 1];

  const narrationText = getNarration(step.id, narrLang);
  const hasNarr = hasNarrationAudio(step.id, narrLang);

  // Stop all audio when navigating away
  useEffect(() => {
    return () => {
      stopSequence();
      stopAll();
    };
  }, [partId, stepIndex]);

  // Load persisted narration language
  useEffect(() => {
    loadNarrationLang().then((lang) => setNarrLang(lang));
  }, []);

  // Auto-play narration when step loads
  useEffect(() => {
    if (hasNarr) {
      playNarration(step.id, (state, posMs, durMs) => {
        setNarrState(state);
        setNarrProgress(durMs > 0 ? posMs / durMs : 0);
      }, narrLang);
    }
  }, [step.id, hasNarr, narrLang]);

  const handleNarrationToggle = useCallback(async () => {
    if (narrState === 'playing') {
      await playNarration(step.id, undefined, narrLang); // toggles to pause
    } else {
      await playNarration(step.id, (state, posMs, durMs) => {
        setNarrState(state);
        setNarrProgress(durMs > 0 ? posMs / durMs : 0);
      }, narrLang);
    }
  }, [step.id, narrState, narrLang]);

  const handleLangSwitch = useCallback(async (lang: NarrationLang) => {
    await stopNarration();
    setNarrState('stopped');
    setNarrProgress(0);
    setNarrLang(lang);
    setNarrationLang(lang);
  }, []);

  // Determine if this step supports auto-play (has sub-steps with audio)
  const autoPlayIds = React.useMemo(() => {
    if (!step.subSteps || step.subSteps.length === 0) return [];
    const ids = step.subSteps.map((s) => s.id).filter((id) => hasMantraAudio(id));
    return ids.length >= 2 ? ids : [];
  }, [step]);

  const handleAutoPlay = useCallback(async () => {
    if (isAutoPlaying) {
      // Stop
      stopSequence();
      await stopMantra();
      setIsAutoPlaying(false);
      setAutoPlayIndex(-1);
      setAutoPlayProgress(0);
      return;
    }

    await stopNarration();
    setNarrState('stopped');
    setIsAutoPlaying(true);

    const pauseMs = step.id === 'B9' ? 2000 : 5000;

    await playMantraSequence(
      autoPlayIds,
      (index) => {
        if (index === -1) {
          // Sequence done
          setIsAutoPlaying(false);
          setAutoPlayIndex(-1);
          setAutoPlayProgress(0);
        } else {
          setAutoPlayIndex(index);
          setAutoPlayProgress(0);
          // Auto-expand the current sub-step
          if (step.subSteps) {
            setExpandedSub(step.subSteps[index]?.id ?? null);
          }
        }
      },
      (_index, _state, posMs, durMs) => {
        setAutoPlayProgress(durMs > 0 ? posMs / durMs : 0);
      },
      pauseMs,
    );
  }, [isAutoPlaying, autoPlayIds, step]);

  React.useLayoutEffect(() => {
    navigation.setOptions({
      title: `Step ${step.number} — ${step.title.roman}`,
    });
  }, [navigation, step]);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Step header */}
        <View style={styles.stepHeader}>
          <Text style={styles.stepNumber}>Step {step.number}</Text>
          {step.isOptional && <Text style={styles.optionalBadge}>Optional</Text>}
        </View>

        <Text style={styles.titleDev}>{step.title.devanagari}</Text>
        <Text style={styles.titleRoman}>{step.title.roman}</Text>
        <Text style={styles.titleEng}>{step.title.english}</Text>

        {/* ═══════════════════════════════════ */}
        {/* PART 1: Narration — auto-plays English audio */}
        {/* ═══════════════════════════════════ */}
        {narrationText && (
          <View style={styles.narrationCard}>
            <View style={styles.narrationHeader}>
              <Text style={styles.narrationTitle}>About This Step</Text>
              <View style={styles.narrControls}>
                {/* Language toggle */}
                <View style={styles.langToggle}>
                  <TouchableOpacity
                    style={[styles.langBtn, narrLang === 'en' && styles.langBtnActive]}
                    onPress={() => handleLangSwitch('en')}
                  >
                    <Text style={[styles.langBtnText, narrLang === 'en' && styles.langBtnTextActive]}>EN</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.langBtn, narrLang === 'hi' && styles.langBtnActive]}
                    onPress={() => handleLangSwitch('hi')}
                  >
                    <Text style={[styles.langBtnText, narrLang === 'hi' && styles.langBtnTextActive]}>हिं</Text>
                  </TouchableOpacity>
                </View>
                {hasNarr && (
                  <TouchableOpacity style={styles.narrPlayBtn} onPress={handleNarrationToggle}>
                    <Text style={styles.narrPlayIcon}>
                      {narrState === 'playing' ? '⏸' : '🔊'}
                  </Text>
                </TouchableOpacity>
              )}
              </View>
            </View>
            <Text style={styles.narrationText}>{narrationText}</Text>
            {hasNarr && (narrState === 'playing' || narrState === 'paused') && (
              <View style={styles.narrProgressContainer}>
                <View style={[styles.narrProgressBar, { width: `${narrProgress * 100}%` }]} />
              </View>
            )}
          </View>
        )}

        {/* Physical instructions */}
        <View style={styles.instructionBox}>
          <Text style={styles.instructionLabel}>What to do</Text>
          <Text style={styles.instructionText}>{step.instructions}</Text>
          {step.actionDescription && (
            <Text style={styles.actionText}>{step.actionDescription}</Text>
          )}
        </View>

        {/* ═══════════════════════════════════ */}
        {/* PART 2: Mantra — user-controlled with karaoke */}
        {/* ═══════════════════════════════════ */}
        {step.mantra && (
          <View style={styles.mantraSection}>
            <Text style={styles.mantraSectionTitle}>Mantra</Text>

            {/* Script toggle */}
            <View style={styles.scriptToggle}>
              {(['devanagari', 'roman', 'english'] as ScriptType[]).map((s) => (
                <TouchableOpacity
                  key={s}
                  style={[styles.scriptBtn, script === s && styles.scriptBtnActive]}
                  onPress={() => setScript(s)}
                >
                  <Text style={[styles.scriptBtnText, script === s && styles.scriptBtnTextActive]}>
                    {s === 'devanagari' ? 'देवनागरी' : s === 'roman' ? 'Roman' : 'English'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <MantraDisplay mantra={step.mantra} script={script} audioId={step.id} />
          </View>
        )}

        {/* Sub-steps */}
        {step.subSteps && step.subSteps.length > 0 && (
          <View style={styles.subStepsSection}>
            <View style={styles.subStepsHeader}>
              <Text style={styles.subStepsTitle}>
                Sub-Steps ({step.subSteps.length})
              </Text>
              {autoPlayIds.length > 0 && (
                <TouchableOpacity
                  style={[styles.autoPlayBtn, isAutoPlaying && styles.autoPlayBtnStop]}
                  onPress={handleAutoPlay}
                >
                  <Text style={styles.autoPlayBtnText}>
                    {isAutoPlaying ? 'Stop' : 'Auto Play All'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {isAutoPlaying && autoPlayIndex >= 0 && (
              <View style={styles.autoPlayStatus}>
                <Text style={styles.autoPlayStatusText}>
                  Playing {autoPlayIndex + 1} of {autoPlayIds.length}: {step.subSteps[autoPlayIndex]?.label}
                </Text>
                <View style={styles.autoPlayProgressContainer}>
                  <View style={[styles.autoPlayProgressBar, { width: `${autoPlayProgress * 100}%` }]} />
                </View>
              </View>
            )}

            {step.subSteps.map((sub, idx) => (
              <TouchableOpacity
                key={sub.id}
                style={[
                  styles.subStepCard,
                  isAutoPlaying && autoPlayIndex === idx && styles.subStepCardActive,
                ]}
                onPress={() =>
                  setExpandedSub(expandedSub === sub.id ? null : sub.id)
                }
              >
                <View style={styles.subStepHeader}>
                  <Text style={styles.subStepLabel}>{sub.label}</Text>
                  <Text style={styles.expandIcon}>
                    {expandedSub === sub.id ? '▼' : '▶'}
                  </Text>
                </View>
                {expandedSub === sub.id && (
                  <View style={styles.subStepExpanded}>
                    <Text style={styles.subInstructions}>{sub.instructions}</Text>
                    {sub.mantra && (
                      <MantraDisplay mantra={sub.mantra} script={script} size="small" audioId={sub.id} />
                    )}
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Duration */}
        {step.duration && (
          <Text style={styles.duration}>
            ⏱ ~{Math.ceil(step.duration / 60)} min
          </Text>
        )}

        <View style={{ height: 20 }} />
      </ScrollView>

      {/* Navigation */}
      <View style={styles.navRow}>
        {hasPrev ? (
          <TouchableOpacity
            style={styles.navBtn}
            onPress={() =>
              navigation.replace('StepDetail', { partId, stepIndex: stepIndex - 1 })
            }
          >
            <Text style={styles.navBtnText}>‹ Prev</Text>
          </TouchableOpacity>
        ) : (
          <View />
        )}
        <TouchableOpacity
          style={[styles.navBtn, { backgroundColor: '#6C5CE7' }]}
          onPress={() => navigation.goBack()}
        >
          <Text style={[styles.navBtnText, { color: '#fff' }]}>All Steps</Text>
        </TouchableOpacity>
        {hasNext ? (
          <TouchableOpacity
            style={[styles.navBtn, { backgroundColor: '#6C5CE7' }]}
            onPress={() =>
              navigation.replace('StepDetail', { partId, stepIndex: stepIndex + 1 })
            }
          >
            <Text style={[styles.navBtnText, { color: '#fff' }]}>Next ›</Text>
          </TouchableOpacity>
        ) : nextPart ? (
          <TouchableOpacity
            style={[styles.navBtn, { backgroundColor: '#6C5CE7' }]}
            onPress={() =>
              navigation.replace('PujaNavigator', { partId: nextPart.id })
            }
          >
            <Text style={[styles.navBtnText, { color: '#fff' }]}>Part {nextPart.id} ›</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.navBtn, { backgroundColor: '#6C5CE7' }]}
            onPress={() => navigation.navigate('Home')}
          >
            <Text style={[styles.navBtnText, { color: '#fff' }]}>Done</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F8' },
  content: { padding: 20 },
  stepHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  stepNumber: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6C5CE7',
    backgroundColor: '#F0EDFF',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  optionalBadge: {
    fontSize: 11,
    color: '#999',
    backgroundColor: '#F0F0F5',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
    marginLeft: 8,
  },
  titleDev: { fontSize: 24, fontWeight: '700', color: '#9A7B4F', marginTop: 4 },
  titleRoman: { fontSize: 17, color: '#555', marginTop: 4 },
  titleEng: { fontSize: 15, color: '#999', marginTop: 2, marginBottom: 16 },
  instructionBox: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#EAEAEF',
  },
  instructionLabel: { fontSize: 13, fontWeight: '600', color: '#6C5CE7', marginBottom: 6 },
  instructionText: { fontSize: 14, color: '#444', lineHeight: 22 },
  actionText: { fontSize: 13, color: '#6C5CE7', fontWeight: '500', marginTop: 8 },
  scriptToggle: { flexDirection: 'row', marginBottom: 16, borderRadius: 10, overflow: 'hidden' },
  scriptBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#EAEAEF',
  },
  scriptBtnActive: { backgroundColor: '#6C5CE7', borderColor: '#6C5CE7' },
  scriptBtnText: { fontSize: 13, color: '#888' },
  scriptBtnTextActive: { color: '#fff', fontWeight: '600' },
  subStepsSection: { marginTop: 20 },
  subStepsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  subStepsTitle: { fontSize: 16, fontWeight: '600', color: '#2D2D3A' },
  autoPlayBtn: {
    backgroundColor: '#6C5CE7',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  autoPlayBtnStop: {
    backgroundColor: '#E74C3C',
  },
  autoPlayBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#fff',
  },
  autoPlayStatus: {
    backgroundColor: '#F0EDFF',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
  },
  autoPlayStatusText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6C5CE7',
    marginBottom: 6,
  },
  autoPlayProgressContainer: {
    height: 3,
    backgroundColor: '#EAEAEF',
    borderRadius: 2,
  },
  autoPlayProgressBar: {
    height: 3,
    backgroundColor: '#6C5CE7',
    borderRadius: 2,
  },
  subStepCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#6C5CE7',
  },
  subStepCardActive: {
    backgroundColor: '#F0EDFF',
    borderLeftColor: '#9A7B4F',
    borderLeftWidth: 4,
  },
  subStepHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  subStepLabel: { fontSize: 14, fontWeight: '600', color: '#2D2D3A' },
  expandIcon: { fontSize: 12, color: '#999' },
  subStepExpanded: { marginTop: 10 },
  subInstructions: { fontSize: 13, color: '#666', marginBottom: 8 },
  duration: { fontSize: 12, color: '#999', textAlign: 'center', marginTop: 16 },
  navRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#EAEAEF',
    backgroundColor: '#fff',
  },
  navBtn: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#F0F0F5',
  },
  navBtnText: { fontSize: 14, fontWeight: '600', color: '#2D2D3A' },
  narrationCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#EAEAEF',
  },
  narrationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  narrationTitle: { fontSize: 14, fontWeight: '600', color: '#6C5CE7' },
  narrControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  langToggle: {
    flexDirection: 'row',
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#EAEAEF',
  },
  langBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: '#F5F5F8',
  },
  langBtnActive: {
    backgroundColor: '#6C5CE7',
  },
  langBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#888',
  },
  langBtnTextActive: {
    color: '#fff',
  },
  narrPlayBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F0F0F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  narrPlayIcon: { fontSize: 16 },
  narrationText: { fontSize: 14, color: '#555', lineHeight: 23 },
  narrProgressContainer: {
    height: 3,
    backgroundColor: '#EAEAEF',
    borderRadius: 2,
    marginTop: 10,
  },
  narrProgressBar: {
    height: 3,
    backgroundColor: '#6C5CE7',
    borderRadius: 2,
  },
  mantraSection: {
    marginTop: 4,
    marginBottom: 8,
  },
  mantraSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#9A7B4F',
    marginBottom: 10,
  },
});
