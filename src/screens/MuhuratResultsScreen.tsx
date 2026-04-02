import React, { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, Pressable } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import MuhuratResultCard from '../components/MuhuratResultCard';
import { calculateMuhurat } from '../services/MuhuratService';
import { getMuhuratEvent } from '../data/muhuratEvents';
import type { MuhuratCandidate } from '../types/muhurat';

type Props = NativeStackScreenProps<RootStackParamList, 'MuhuratResults'>;

export default function MuhuratResultsScreen({ route }: Props) {
  const p = route.params;
  const event = useMemo(() => getMuhuratEvent(p.eventId), [p.eventId]);
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState<MuhuratCandidate[]>([]);
  const scrollRef = useRef<ScrollView>(null);
  const cardPositions = useRef<Record<number, number>>({});

  const scrollToCard = useCallback((index: number) => {
    const y = cardPositions.current[index];
    if (y != null && scrollRef.current) {
      scrollRef.current.scrollTo({ y: y - 16, animated: true });
    }
  }, []);

  const scrollToTop = useCallback(() => {
    scrollRef.current?.scrollTo({ y: 0, animated: true });
  }, []);

  useEffect(() => {
    const candidates = calculateMuhurat({
      eventId: p.eventId,
      dateFrom: p.dateFrom,
      dateTo: p.dateTo,
      locationName: p.locationName,
      locationLat: p.locationLat,
      locationLng: p.locationLng,
      preferredDays: p.preferredDays,
      timeWindow: p.timeWindow,
      numResults: p.numResults,
      person1Name: p.person1Name,
      person1DOB: p.person1DOB,
      person2Name: p.person2Name,
      person2DOB: p.person2DOB,
    });
    setResults(candidates);
    setLoading(false);
  }, [p]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingIcon}>🔮</Text>
        <ActivityIndicator size="large" color="#6C5CE7" style={{ marginTop: 16 }} />
        <Text style={styles.loadingTitle}>Calculating Shubh Muhurat...</Text>
        <Text style={styles.loadingSteps}>Analyzing Panchang five limbs</Text>
        <Text style={styles.loadingSteps}>Evaluating Lagna positions</Text>
        <Text style={styles.loadingSteps}>Checking inauspicious periods</Text>
        <Text style={styles.loadingSteps}>Computing Sarvartha Siddhi Yoga</Text>
        {p.person1DOB && (
          <Text style={styles.loadingSteps}>Personalizing with birth chart</Text>
        )}
      </View>
    );
  }

  const dateFrom = new Date(p.dateFrom + 'T00:00:00');
  const dateTo = new Date(p.dateTo + 'T00:00:00');
  const dayCount = Math.round((dateTo.getTime() - dateFrom.getTime()) / 86400000);
  const RC: Record<number, string> = { 5: '#2E7D32', 4: '#558B2F', 3: '#F57F17', 2: '#E65100', 1: '#C62828' };

  return (
    <ScrollView ref={scrollRef} style={styles.container} contentContainerStyle={styles.content}>
      {/* Summary header */}
      <View style={styles.summaryHeader}>
        <Text style={styles.summaryIcon}>{event?.icon || '🕉️'}</Text>
        <Text style={styles.summaryTitle}>
          {results.length > 0
            ? `${results.length} Shubh Muhurat${results.length > 1 ? 's' : ''} Found`
            : 'No Muhurat Found'}
        </Text>
        <Text style={styles.summaryMeta}>
          {event?.name} • {p.locationName}
        </Text>
        <Text style={styles.summaryRange}>
          {dateFrom.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })} – {dateTo.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })} ({dayCount} days scanned)
        </Text>
        {p.person1Name && (
          <Text style={styles.summaryPerson}>
            Personalized for {p.person1Name}
            {p.person2Name ? ` & ${p.person2Name}` : ''}
          </Text>
        )}
      </View>

      {/* Quick date links */}
      {results.length > 0 && (
        <View style={styles.quickLinks}>
          {results.map((c, i) => {
            const d = new Date(c.date + 'T00:00:00');
            const rColor = RC[c.rating] || '#999';
            return (
              <Pressable key={i} style={[styles.quickLink, { borderLeftColor: rColor }]} onPress={() => scrollToCard(i)}>
                <View style={[styles.qlRankBadge, { backgroundColor: rColor }]}>
                  <Text style={styles.qlRankText}>#{i + 1}</Text>
                </View>
                <View style={styles.qlInfo}>
                  <Text style={styles.qlDate}>
                    {d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
                  </Text>
                  <Text style={styles.qlTime}>{c.timeStart} – {c.timeEnd}</Text>
                </View>
                <Text style={[styles.qlScore, { color: rColor }]}>{c.scores.total}/100</Text>
                <Text style={styles.qlArrow}>↓</Text>
              </Pressable>
            );
          })}
        </View>
      )}

      {/* Results */}
      {results.length === 0 ? (
        <View style={styles.noResultBox}>
          <Text style={styles.noResultIcon}>😔</Text>
          <Text style={styles.noResultText}>
            No sufficiently auspicious Muhurat was found in the selected date range. Try expanding the range or relaxing day-of-week preferences.
          </Text>
        </View>
      ) : (
        results.map((c, i) => (
          <View key={i} onLayout={(e) => { cardPositions.current[i] = e.nativeEvent.layout.y; }}>
            <MuhuratResultCard candidate={c} rank={i + 1} />
            <Pressable style={styles.backToTop} onPress={scrollToTop}>
              <Text style={styles.backToTopText}>↑ Back to Top</Text>
            </Pressable>
          </View>
        ))
      )}

      {/* How this was calculated */}
      <View style={styles.methodBox}>
        <Text style={styles.methodTitle}>📐 How is this calculated?</Text>
        <Text style={styles.methodText}>
          Each candidate is scored on a 100-point scale across 8 factors:{'\n\n'}
          • <Text style={styles.bold}>Tithi</Text> (Lunar Day) — Nanda, Bhadra, Jaya, Purna classifications{'\n'}
          • <Text style={styles.bold}>Nakshatra</Text> (Lunar Mansion) — Event-specific suitability from 27 constellations{'\n'}
          • <Text style={styles.bold}>Yoga</Text> (Luni-Solar Combination) — Auspicious vs inauspicious cosmic yogas{'\n'}
          • <Text style={styles.bold}>Karana</Text> (Half-Tithi) — Ensures no Vishti (Bhadra) contamination{'\n'}
          • <Text style={styles.bold}>Vara</Text> (Day of Week) — Planetary rulership alignment{'\n'}
          • <Text style={styles.bold}>Lagna</Text> (Ascendant) — Rising sign, lord strength, Jupiter's aspect, malefic checks{'\n'}
          • <Text style={styles.bold}>Clean Window</Text> — Free of Rahu Kaal, Yamaghanta, Gulika, Durmuhurta, Varjyam{'\n'}
          • <Text style={styles.bold}>Bonus Yogas</Text> — Sarvartha Siddhi, Amrita Siddhi, Guru Pushya, Abhijit Muhurat
        </Text>
        {p.person1DOB && (
          <Text style={[styles.methodText, { marginTop: 8 }]}>
            Personalization note: Tarabalam and Chandrabalam are included only when complete birth inputs required for those checks are available.
          </Text>
        )}
      </View>

      {/* Footer wisdom */}
      <View style={styles.wisdomBox}>
        <Text style={styles.wisdomText}>
          "शुभस्य शीघ्रम्" — Auspicious things should be done quickly.
        </Text>
        <Text style={styles.wisdomSub}>
          Once you have identified the Saath, share it with your family pandit for final confirmation and begin preparations with confidence.
        </Text>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F8' },
  content: { padding: 16 },

  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F8',
    padding: 32,
  },
  loadingIcon: { fontSize: 48 },
  loadingTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2D2D3A',
    marginTop: 16,
  },
  loadingSteps: {
    fontSize: 13,
    color: '#999',
    marginTop: 6,
  },

  // Summary header
  summaryHeader: {
    alignItems: 'center',
    backgroundColor: '#FFF9F0',
    borderRadius: 16,
    padding: 20,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E8DCC8',
  },
  summaryIcon: { fontSize: 36 },
  summaryTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2D2D3A',
    marginTop: 8,
  },
  summaryMeta: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  summaryRange: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  summaryPerson: {
    fontSize: 12,
    color: '#6C5CE7',
    fontWeight: '600',
    marginTop: 6,
  },

  // Quick links
  quickLinks: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#EAEAEF',
    gap: 8,
  },
  quickLink: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
    borderRadius: 10,
    padding: 10,
    borderLeftWidth: 4,
    gap: 10,
  },
  qlRankBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qlRankText: { color: '#fff', fontWeight: '800', fontSize: 11 },
  qlInfo: { flex: 1 },
  qlDate: { fontSize: 14, fontWeight: '600', color: '#2D2D3A' },
  qlTime: { fontSize: 11, color: '#999', marginTop: 2 },
  qlScore: { fontSize: 14, fontWeight: '700' },
  qlArrow: { fontSize: 16, color: '#BBB', marginLeft: 4 },

  // Back to top
  backToTop: {
    alignSelf: 'center' as const,
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 20,
    backgroundColor: '#F0EDFF',
    marginTop: 4,
    marginBottom: 8,
  },
  backToTopText: { fontSize: 12, fontWeight: '600' as const, color: '#6C5CE7' },

  // Method box
  methodBox: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#EAEAEF',
  },
  methodTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2D2D3A',
    marginBottom: 8,
  },
  methodText: {
    fontSize: 12,
    color: '#666',
    lineHeight: 19,
  },
  bold: { fontWeight: '600', color: '#2D2D3A' },

  // No results
  noResultBox: {
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#fff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#EAEAEF',
    marginVertical: 16,
  },
  noResultIcon: { fontSize: 40 },
  noResultText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 20,
  },

  // Wisdom
  wisdomBox: {
    backgroundColor: '#F9F7F2',
    borderRadius: 14,
    padding: 18,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#E8DCC8',
    alignItems: 'center',
  },
  wisdomText: {
    fontSize: 14,
    color: '#9A7B4F',
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 22,
  },
  wisdomSub: {
    fontSize: 12,
    color: '#BBB',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 18,
  },
});
