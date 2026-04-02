import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import MuhuratResultCard from '../components/MuhuratResultCard';
import type { MuhuratCandidate } from '../types/muhurat';

const DEMO_CANDIDATES: MuhuratCandidate[] = [
  {
    date: '2026-05-14',
    timeStart: '09:22',
    timeEnd: '11:45',
    durationMinutes: 143,
    eventType: {
      id: 'marriage',
      name: 'Marriage / Lagan',
      category: 'samskara',
      kpName: 'Khandur / Lagan',
      icon: '💍',
    },
    panchang: {
      tithi: 13,
      tithiName: 'Trayodashi',
      paksha: 'shukla',
      nakshatra: 16,
      nakshatraName: 'Vishakha',
      yoga: 4,
      yogaName: 'Saubhagya',
      karana: 5,
      karanaName: 'Gara',
      vara: 4,
      varaName: 'Thursday',
      sunrise: '05:38',
      sunset: '19:12',
      moonSign: 6,
      moonSignName: 'Libra',
      lunarMonth: 'Vaishakh',
    },
    lagna: {
      sign: 3,
      signName: 'Cancer',
      degree: 14.7,
      lordStrength: 'strong',
      maleficsInKendra: false,
      jupiterAspect: true,
      moonHouse: 5,
    },
    inauspiciousPeriods: [
      { type: 'rahu_kaal', start: '13:30', end: '15:00' },
      { type: 'yamaghanta', start: '06:15', end: '07:45' },
      { type: 'gulika', start: '11:50', end: '13:20' },
    ],
    bonusYogas: ['Sarvartha Siddhi Yoga', 'Amrita Siddhi Yoga'],
    scores: {
      tithi: 13,
      nakshatra: 14,
      yoga: 9,
      karana: 5,
      vara: 10,
      lagna: 23,
      cleanPeriod: 10,
      bonus: 8,
      tarabalam: 5,
      chandrabalam: 5,
      total: 92,
    },
    rating: 5,
    summary:
      'An exceptional Muhurat for Marriage. Thursday with Sarvartha Siddhi & Amrita Siddhi Yogas active. Cancer Lagna with Jupiter aspecting provides divine blessings. Vishakha Nakshatra in Shukla Paksha ensures lasting bonds. Highly recommended.',
    warnings: [],
    location: 'Srinagar, Kashmir',
  },
  {
    date: '2026-06-03',
    timeStart: '07:15',
    timeEnd: '09:48',
    durationMinutes: 153,
    eventType: {
      id: 'griha_pravesh',
      name: 'Griha Pravesh',
      category: 'samskara',
      kpName: 'Griha Pravesh',
      icon: '🏠',
    },
    panchang: {
      tithi: 7,
      tithiName: 'Saptami',
      paksha: 'shukla',
      nakshatra: 4,
      nakshatraName: 'Rohini',
      yoga: 11,
      yogaName: 'Shubha',
      karana: 3,
      karanaName: 'Kaulava',
      vara: 3,
      varaName: 'Wednesday',
      sunrise: '05:28',
      sunset: '19:24',
      moonSign: 1,
      moonSignName: 'Taurus',
      lunarMonth: 'Jyeshtha',
    },
    lagna: {
      sign: 3,
      signName: 'Cancer',
      degree: 22.3,
      lordStrength: 'strong',
      maleficsInKendra: false,
      jupiterAspect: true,
      moonHouse: 11,
    },
    inauspiciousPeriods: [
      { type: 'rahu_kaal', start: '12:00', end: '13:30' },
      { type: 'gulika', start: '09:55', end: '11:25' },
    ],
    bonusYogas: ['Sarvartha Siddhi Yoga'],
    scores: {
      tithi: 12,
      nakshatra: 15,
      yoga: 8,
      karana: 4,
      vara: 8,
      lagna: 22,
      cleanPeriod: 10,
      bonus: 6,
      total: 85,
    },
    rating: 4,
    summary:
      'Very good Muhurat for Griha Pravesh. Rohini Nakshatra — the most stable and prosperous — combined with Cancer Lagna ensures the home will be filled with comfort and nourishment. Moon in the 11th house brings gains.',
    warnings: ['Gulika Kaal starts at 09:55 — ensure ceremony begins before then.'],
    location: 'New Delhi, India',
  },
  {
    date: '2026-07-18',
    timeStart: '10:05',
    timeEnd: '12:30',
    durationMinutes: 145,
    eventType: {
      id: 'business',
      name: 'New Business Launch',
      category: 'material',
      icon: '🏢',
    },
    panchang: {
      tithi: 3,
      tithiName: 'Tritiya',
      paksha: 'shukla',
      nakshatra: 7,
      nakshatraName: 'Punarvasu',
      yoga: 1,
      yogaName: 'Priti',
      karana: 2,
      karanaName: 'Balava',
      vara: 4,
      varaName: 'Thursday',
      sunrise: '05:42',
      sunset: '19:18',
      moonSign: 2,
      moonSignName: 'Gemini',
      lunarMonth: 'Ashadh',
    },
    lagna: {
      sign: 5,
      signName: 'Virgo',
      degree: 8.9,
      lordStrength: 'moderate',
      maleficsInKendra: true,
      jupiterAspect: false,
      moonHouse: 10,
    },
    inauspiciousPeriods: [
      { type: 'rahu_kaal', start: '13:30', end: '15:00' },
      { type: 'yamaghanta', start: '05:42', end: '07:12' },
      { type: 'varjyam', start: '16:20', end: '17:56' },
    ],
    bonusYogas: [],
    scores: {
      tithi: 10,
      nakshatra: 11,
      yoga: 8,
      karana: 4,
      vara: 10,
      lagna: 14,
      cleanPeriod: 8,
      bonus: 0,
      total: 65,
    },
    rating: 3,
    summary:
      'A good Muhurat for business launch. Thursday supports commercial success. Punarvasu Nakshatra brings renewability. Virgo Lagna favors analytical ventures. However, Mars in Kendra adds some aggression — channel it into drive.',
    warnings: [
      'Mars present in Kendra — may cause initial friction with partners.',
      'No bonus Yogas active — consider the higher-ranked options if available.',
    ],
    location: 'Mumbai, India',
  },
];

export default function MuhuratDemoScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>🕉 Shubh Muhurat Results</Text>
        <Text style={styles.subtitle}>Top 3 auspicious windows found</Text>
      </View>
      {DEMO_CANDIDATES.map((c, i) => (
        <MuhuratResultCard key={i} candidate={c} rank={i + 1} />
      ))}
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F8' },
  content: { padding: 16 },
  header: { alignItems: 'center', marginBottom: 8, paddingVertical: 12 },
  title: { fontSize: 22, fontWeight: '700', color: '#2D2D3A' },
  subtitle: { fontSize: 14, color: '#999', marginTop: 4 },
});
