/**
 * TekniLoadingScreen — Animated "PanditJi is computing your Kundali" screen.
 * Shows progress steps with a timer, then navigates to TekniResult.
 */

import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import type { TekniData, GrahaPosition } from '../services/TakniHTMLGenerator';
import { computeTekni } from '../services/TekniService';

type Props = NativeStackScreenProps<RootStackParamList, 'TekniLoading'>;

const STEPS = [
  { label: 'Preparing the sacred workspace...', dev: 'पवित्र कार्यस्थान तैयार हो रहा है...', duration: 800 },
  { label: 'Computing Lagna (Ascendant)...', dev: 'लग्न की गणना हो रही है...', duration: 1000 },
  { label: 'Calculating planetary positions...', dev: 'ग्रह स्थिति निर्धारित हो रही है...', duration: 1200 },
  { label: 'Placing grahas in houses...', dev: 'ग्रह भावों में स्थापित हो रहे हैं...', duration: 1000 },
  { label: 'Determining Nakshatra & Pada...', dev: 'नक्षत्र और पाद निर्धारित हो रहा है...', duration: 800 },
  { label: 'Computing Ashtakoot matching...', dev: 'अष्टकूट गुण मिलान हो रहा है...', duration: 900 },
  { label: 'Drawing the Kundali chart...', dev: 'कुण्डली चक्र बनाया जा रहा है...', duration: 700 },
  { label: 'Preparing your Takni...', dev: 'आपकी टेकनी तैयार हो रही है...', duration: 600 },
];


export default function TekniLoadingScreen({ navigation, route }: Props) {
  const [currentStep, setCurrentStep] = useState(0);
  const spinAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Spinning animation
  useEffect(() => {
    Animated.loop(
      Animated.timing(spinAnim, {
        toValue: 1,
        duration: 3000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
    Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
  }, []);

  // Step progression
  useEffect(() => {
    if (currentStep >= STEPS.length) {
      // All steps done — compute and navigate
            const tekni = computeTekni(route.params);
      navigation.replace('TekniResult', { tekniJson: JSON.stringify(tekni) });
      return;
    }
    const timer = setTimeout(() => setCurrentStep(s => s + 1), STEPS[currentStep].duration);
    return () => clearTimeout(timer);
  }, [currentStep]);

  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const step = STEPS[Math.min(currentStep, STEPS.length - 1)];
  const progress = Math.min(currentStep / STEPS.length, 1);

  return (
    <Animated.View style={[st.container, { opacity: fadeAnim }]}>
      {/* Spinning Om symbol */}
      <Animated.Text style={[st.omSpin, { transform: [{ rotate: spin }] }]}>ॐ</Animated.Text>

      <Text style={st.title}>PanditJi is preparing your Takni</Text>
      <Text style={st.titleDev}>पण्डितजी आपकी टेकनी तैयार कर रहे हैं</Text>

      {/* Progress bar */}
      <View style={st.progressBg}>
        <View style={[st.progressFill, { width: `${Math.round(progress * 100)}%` as any }]} />
      </View>

      {/* Step text */}
      <Text style={st.stepLabel}>{step.label}</Text>
      <Text style={st.stepDev}>{step.dev}</Text>

      {/* Completed steps */}
      <View style={st.stepsContainer}>
        {STEPS.slice(0, currentStep).map((s, i) => (
          <View key={i} style={st.completedStep}>
            <Text style={st.checkmark}>✓</Text>
            <Text style={st.completedText}>{s.label}</Text>
          </View>
        ))}
      </View>

      <Text style={st.patience}>
        🙏 कृपया प्रतीक्षा करें... Please wait while the sacred calculations are performed.
      </Text>
    </Animated.View>
  );
}

const st = StyleSheet.create({
  container: {
    flex: 1, backgroundColor: '#F5E6C8',
    alignItems: 'center', justifyContent: 'center',
    padding: 30,
  },
  omSpin: { fontSize: 64, color: '#8C1A1F', marginBottom: 20 },
  title: { fontSize: 18, fontWeight: '700', color: '#3D2B1F', textAlign: 'center' },
  titleDev: { fontSize: 14, color: '#6B4F38', marginTop: 4, marginBottom: 20, textAlign: 'center' },
  progressBg: {
    width: '80%', height: 6, backgroundColor: '#E0D5C5',
    borderRadius: 3, overflow: 'hidden', marginBottom: 16,
  },
  progressFill: { height: '100%', backgroundColor: '#8C1A1F', borderRadius: 3 },
  stepLabel: { fontSize: 14, fontWeight: '600', color: '#3D2B1F', textAlign: 'center' },
  stepDev: { fontSize: 12, color: '#6B4F38', marginTop: 2, marginBottom: 16, textAlign: 'center' },
  stepsContainer: { alignItems: 'flex-start', width: '80%', marginBottom: 20 },
  completedStep: { flexDirection: 'row', alignItems: 'center', marginBottom: 3 },
  checkmark: { color: '#2E7D32', fontSize: 14, marginRight: 6, fontWeight: '700' },
  completedText: { color: '#6B4F38', fontSize: 11 },
  patience: { fontSize: 11, color: '#999', textAlign: 'center', marginTop: 10, lineHeight: 16 },
});
