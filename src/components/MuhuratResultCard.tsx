import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import type { MuhuratCandidate, MuhuratScores } from '../types/muhurat';

interface Props {
  candidate: MuhuratCandidate;
  rank?: number;
}

const RATING_LABELS: Record<number, string> = {
  5: 'Exceptional',
  4: 'Very Good',
  3: 'Good',
  2: 'Acceptable',
  1: 'Marginal',
};

const RATING_COLORS: Record<number, string> = {
  5: '#2E7D32',
  4: '#558B2F',
  3: '#F57F17',
  2: '#E65100',
  1: '#C62828',
};

const INAUSPICIOUS_LABELS: Record<string, string> = {
  rahu_kaal: 'Rahu Kaal',
  yamaghanta: 'Yamaghanta',
  gulika: 'Gulika Kaal',
  durmuhurta: 'Durmuhurta',
  varjyam: 'Varjyam',
};

const SCORE_LABELS: { key: keyof MuhuratScores; label: string; max: number }[] = [
  { key: 'tithi', label: 'Tithi', max: 15 },
  { key: 'nakshatra', label: 'Nakshatra', max: 15 },
  { key: 'yoga', label: 'Yoga', max: 10 },
  { key: 'karana', label: 'Karana', max: 5 },
  { key: 'vara', label: 'Vara', max: 10 },
  { key: 'lagna', label: 'Lagna', max: 25 },
  { key: 'cleanPeriod', label: 'Clean Window', max: 10 },
  { key: 'bonus', label: 'Bonus Yogas', max: 10 },
];

function Stars({ rating }: { rating: number }) {
  return (
    <Text style={styles.stars}>
      {Array.from({ length: 5 }, (_, i) => (i < rating ? '★' : '☆')).join('')}
    </Text>
  );
}

function ScoreBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <View style={styles.scoreBarContainer}>
      <View style={styles.scoreBarTrack}>
        <View style={[styles.scoreBarFill, { width: `${pct}%` as any, backgroundColor: color }]} />
      </View>
      <Text style={styles.scoreBarValue}>{value}/{max}</Text>
    </View>
  );
}

export default function MuhuratResultCard({ candidate, rank }: Props) {
  const {
    date,
    timeStart,
    timeEnd,
    durationMinutes,
    eventType,
    panchang,
    lagna,
    inauspiciousPeriods,
    bonusYogas,
    scores,
    rating,
    summary,
    warnings,
    location,
  } = candidate;

  const ratingColor = RATING_COLORS[rating] || '#999';
  const dateObj = new Date(date + 'T00:00:00');
  const dateDisplay = dateObj.toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const starStr = Array.from({ length: 5 }, (_, i) => (i < rating ? '★' : '☆')).join('');
    const lines = [
      `🕉 Shubh Muhurat — ${eventType.name}${eventType.kpName ? ` (${eventType.kpName})` : ''}`,
      `📅 ${dateDisplay}`,
      `🕐 ${timeStart} – ${timeEnd} (${durationMinutes} min)`,
      `📍 ${location}`,
      `⭐ ${starStr} ${RATING_LABELS[rating]} (${scores.total}/100)`,
      '',
      '🪷 Panchang:',
      `  Tithi: ${panchang.tithiName} (${panchang.paksha === 'shukla' ? 'Shukla' : 'Krishna'} Paksha)`,
      `  Nakshatra: ${panchang.nakshatraName} (Moon in ${panchang.moonSignName})`,
      `  Yoga: ${panchang.yogaName}`,
      `  Karana: ${panchang.karanaName}`,
      `  Vara: ${panchang.varaName}`,
      '',
      `🌅 Lagna: ${lagna.signName} (${lagna.degree.toFixed(1)}°)`,
    ];
    if (bonusYogas.length > 0) lines.push(`✨ ${bonusYogas.join(', ')}`);
    lines.push('', summary, '', '\u2014 \u091C\u0902\u0925\u094D\u0930\u0940 (Janthari)');
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(lines.join('\n'));
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {}
  };

  return (
    <View style={styles.card}>
      {/* ── Header ribbon ── */}
      <View style={[styles.header, { borderLeftColor: ratingColor }]}>
        <View style={styles.headerLeft}>
          {rank != null && (
            <View style={[styles.rankBadge, { backgroundColor: ratingColor }]}>
              <Text style={styles.rankText}>#{rank}</Text>
            </View>
          )}
          <View style={{ flex: 1 }}>
            <Text style={styles.eventName}>{eventType.icon} {eventType.name}</Text>
            {eventType.kpName && (
              <Text style={styles.kpName}>{eventType.kpName}</Text>
            )}
          </View>
          <View style={styles.ratingBox}>
            <Stars rating={rating} />
            <Text style={[styles.ratingLabel, { color: ratingColor }]}>
              {RATING_LABELS[rating]}
            </Text>
          </View>
        </View>
      </View>

      {/* ── Score circle ── */}
      <View style={styles.scoreCircleRow}>
        <View style={[styles.scoreCircle, { borderColor: ratingColor }]}>
          <Text style={[styles.scoreNum, { color: ratingColor }]}>{scores.total}</Text>
          <Text style={styles.scoreOf}>/100</Text>
        </View>
        <View style={styles.dateTimeBlock}>
          <Text style={styles.dateText}>{dateDisplay}</Text>
          <Text style={styles.timeRange}>
            🕐 {timeStart} – {timeEnd}  ({durationMinutes} min window)
          </Text>
          <Text style={styles.locText}>📍 {location}</Text>
        </View>
      </View>

      {/* ── Panchang 5 Limbs — Circle ── */}
      <View style={styles.sectionBox}>
        <Text style={styles.sectionTitle}>🪷 Panchang — Five Limbs</Text>
        <PanchangWheel panchang={panchang} scores={scores} />
        <Text style={styles.lunarMonth}>
          {panchang.lunarMonth} • {panchang.paksha === 'shukla' ? 'Shukla' : 'Krishna'} Paksha • {panchang.tithiName}
        </Text>
      </View>

      {/* ── Lagna Analysis ── */}
      <View style={styles.sectionBox}>
        <Text style={styles.sectionTitle}>🌅 Lagna (Ascendant)</Text>
        <View style={styles.lagnaRow}>
          <View style={styles.lagnaBig}>
            <Text style={styles.lagnaSign}>{lagna.signName}</Text>
            <Text style={styles.lagnaDeg}>{lagna.degree.toFixed(1)}°</Text>
          </View>
          <View style={styles.lagnaDetails}>
            <LagnaCheck label="Lord Strength" value={lagna.lordStrength} good={lagna.lordStrength === 'strong'} />
            <LagnaCheck label="Jupiter Aspect" value={lagna.jupiterAspect ? 'Yes ✓' : 'No'} good={lagna.jupiterAspect} />
            <LagnaCheck label="Malefics in Kendra" value={lagna.maleficsInKendra ? 'Present ✗' : 'Clear ✓'} good={!lagna.maleficsInKendra} />
            <LagnaCheck label="Moon House" value={`${ordinal(lagna.moonHouse)} from Lagna`} good={![6, 8, 12].includes(lagna.moonHouse)} />
          </View>
        </View>
      </View>

      {/* ── Bonus Yogas ── */}
      {bonusYogas.length > 0 && (
        <View style={styles.sectionBox}>
          <Text style={styles.sectionTitle}>✨ Special Yogas</Text>
          <View style={styles.yogaBadges}>
            {bonusYogas.map((y, i) => (
              <View key={i} style={styles.yogaBadge}>
                <Text style={styles.yogaBadgeText}>{y}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* ── Inauspicious Periods (for awareness) ── */}
      {inauspiciousPeriods.length > 0 && (
        <View style={styles.sectionBox}>
          <Text style={styles.sectionTitle}>⚠️ Inauspicious Periods (Avoided)</Text>
          <View style={styles.periodsRow}>
            {inauspiciousPeriods.map((p, i) => (
              <View key={i} style={styles.periodChip}>
                <Text style={styles.periodLabel}>{INAUSPICIOUS_LABELS[p.type] || p.type}</Text>
                <Text style={styles.periodTime}>{p.start} – {p.end}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* ── Score Breakdown ── */}
      <View style={styles.sectionBox}>
        <Text style={styles.sectionTitle}>📊 Score Breakdown</Text>
        {SCORE_LABELS.map(({ key, label, max }) => (
          <View key={key} style={styles.scoreRow}>
            <Text style={styles.scoreLabel}>{label}</Text>
            <ScoreBar value={scores[key] as number} max={max} color={ratingColor} />
          </View>
        ))}
        {scores.tarabalam != null && (
          <View style={styles.scoreRow}>
            <Text style={styles.scoreLabel}>Tarabalam</Text>
            <Text style={[styles.personalScore, { color: scores.tarabalam >= 0 ? '#2E7D32' : '#C62828' }]}>
              {scores.tarabalam > 0 ? '+' : ''}{scores.tarabalam}
            </Text>
          </View>
        )}
        {scores.chandrabalam != null && (
          <View style={styles.scoreRow}>
            <Text style={styles.scoreLabel}>Chandrabalam</Text>
            <Text style={[styles.personalScore, { color: scores.chandrabalam >= 0 ? '#2E7D32' : '#C62828' }]}>
              {scores.chandrabalam > 0 ? '+' : ''}{scores.chandrabalam}
            </Text>
          </View>
        )}
      </View>

      {/* ── Summary ── */}
      <View style={[styles.summaryBox, { borderLeftColor: ratingColor }]}>
        <Text style={styles.summaryText}>{summary}</Text>
      </View>

      {/* ── Warnings ── */}
      {warnings.length > 0 && (
        <View style={styles.warningBox}>
          {warnings.map((w, i) => (
            <Text key={i} style={styles.warningText}>⚠ {w}</Text>
          ))}
        </View>
      )}

      {/* ── Copy / Share ── */}
      <Pressable style={[styles.copyBtn, copied && styles.copyBtnActive]} onPress={handleCopy}>
        <Text style={[styles.copyBtnText, copied && styles.copyBtnTextActive]}>
          {copied ? '✓ Copied to Clipboard!' : '📋 Copy Muhurat Details'}
        </Text>
      </Pressable>
    </View>
  );
}

/* ─── Sub-components ─── */

const QUALITY_THEMES = {
  good: { bg: '#E8F5E9', border: '#66BB6A', color: '#2E7D32', tag: 'Favorable' },
  moderate: { bg: '#FFF8E1', border: '#FFB74D', color: '#E65100', tag: 'Neutral' },
  poor: { bg: '#FFEBEE', border: '#EF5350', color: '#C62828', tag: 'Unfavorable' },
} as const;

function getQuality(score: number, maxScore: number) {
  const ratio = score / maxScore;
  return ratio > 0.6 ? 'good' : ratio > 0.35 ? 'moderate' : 'poor';
}

function PanchangWheel({ panchang, scores }: { panchang: MuhuratCandidate['panchang']; scores: MuhuratCandidate['scores'] }) {
  const WHEEL_SIZE = 220;
  const CENTER = WHEEL_SIZE / 2;
  const RADIUS = 82;
  const limbs: { label: string; value: string; sub?: string; score: number; maxScore: number }[] = [
    { label: 'Tithi', value: panchang.tithiName, sub: panchang.paksha === 'shukla' ? 'Shukla' : 'Krishna', score: scores.tithi, maxScore: 15 },
    { label: 'Nakshatra', value: panchang.nakshatraName, sub: panchang.moonSignName, score: scores.nakshatra, maxScore: 15 },
    { label: 'Yoga', value: panchang.yogaName, score: scores.yoga, maxScore: 10 },
    { label: 'Karana', value: panchang.karanaName, score: scores.karana, maxScore: 5 },
    { label: 'Vara', value: panchang.varaName, sub: `\u2600 ${panchang.sunrise}`, score: scores.vara, maxScore: 10 },
  ];
  // Positions: top, top-right, bottom-right, bottom-left, top-left (like a star/circle)
  const angles = [-90, -18, 54, 126, 198]; // degrees, starting from top going clockwise
  const NODE_SIZE = 70;

  return (
    <View style={{ alignItems: 'center', marginVertical: 8 }}>
      <View style={{ width: WHEEL_SIZE, height: WHEEL_SIZE }}>
        {/* Center label */}
        <View style={{
          position: 'absolute', left: CENTER - 30, top: CENTER - 20,
          width: 60, height: 40, justifyContent: 'center', alignItems: 'center',
        }}>
          <Text style={{ fontSize: 24 }}>🪷</Text>
          <Text style={{ fontSize: 8, color: '#9A7B4F', fontWeight: '600' }}>PANCHANG</Text>
        </View>
        {/* Lines from center to each node */}
        {angles.map((deg, i) => {
          const rad = (deg * Math.PI) / 180;
          const x2 = CENTER + RADIUS * Math.cos(rad);
          const y2 = CENTER + RADIUS * Math.sin(rad);
          const len = Math.sqrt((x2 - CENTER) ** 2 + (y2 - CENTER) ** 2);
          const angle = Math.atan2(y2 - CENTER, x2 - CENTER) * (180 / Math.PI);
          return (
            <View key={`line-${i}`} style={{
              position: 'absolute',
              left: CENTER,
              top: CENTER,
              width: len - NODE_SIZE / 2 + 5,
              height: 1.5,
              backgroundColor: '#E0DDD5',
              transformOrigin: '0 0',
              transform: [{ rotate: `${angle}deg` }],
            }} />
          );
        })}
        {/* Nodes */}
        {limbs.map((limb, i) => {
          const rad = (angles[i] * Math.PI) / 180;
          const x = CENTER + RADIUS * Math.cos(rad) - NODE_SIZE / 2;
          const y = CENTER + RADIUS * Math.sin(rad) - NODE_SIZE / 2;
          const q = getQuality(limb.score, limb.maxScore);
          const theme = QUALITY_THEMES[q];
          return (
            <View key={i} style={{
              position: 'absolute', left: x, top: y,
              width: NODE_SIZE, height: NODE_SIZE,
              borderRadius: NODE_SIZE / 2,
              backgroundColor: theme.bg,
              borderWidth: 2, borderColor: theme.border,
              justifyContent: 'center', alignItems: 'center',
              shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.06, shadowRadius: 3, elevation: 2,
            }}>
              <Text style={{ fontSize: 8, fontWeight: '700', color: theme.color, textTransform: 'uppercase', letterSpacing: 0.3 }}>{limb.label}</Text>
              <Text style={{ fontSize: 11, fontWeight: '700', color: '#2D2D3A', textAlign: 'center' }} numberOfLines={1}>{limb.value}</Text>
              {limb.sub && <Text style={{ fontSize: 7, color: '#999' }} numberOfLines={1}>{limb.sub}</Text>}
              <View style={{ backgroundColor: theme.color, borderRadius: 6, paddingHorizontal: 5, paddingVertical: 1, marginTop: 1 }}>
                <Text style={{ fontSize: 7, fontWeight: '700', color: '#fff' }}>{theme.tag.toUpperCase()}</Text>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}

function LagnaCheck({ label, value, good }: { label: string; value: string; good: boolean }) {
  return (
    <View style={styles.lagnaCheckRow}>
      <Text style={styles.lagnaCheckLabel}>{label}</Text>
      <Text style={[styles.lagnaCheckValue, { color: good ? '#2E7D32' : '#C62828' }]}>{value}</Text>
    </View>
  );
}

function ordinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

/* ─── Styles ─── */

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFEF8',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E8DCC8',
    overflow: 'hidden',
    marginVertical: 12,
    // subtle shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },

  // Header
  header: {
    backgroundColor: '#FFF9F0',
    borderLeftWidth: 5,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E8DCC8',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rankBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rankText: { color: '#fff', fontWeight: '800', fontSize: 13 },
  eventName: { fontSize: 17, fontWeight: '700', color: '#2D2D3A' },
  kpName: { fontSize: 13, color: '#9A7B4F', fontStyle: 'italic', marginTop: 2 },
  ratingBox: { alignItems: 'flex-end' },
  stars: { fontSize: 18, color: '#F5A623', letterSpacing: 2 },
  ratingLabel: { fontSize: 11, fontWeight: '700', marginTop: 2, textTransform: 'uppercase' },

  // Score circle + date/time
  scoreCircleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 16,
  },
  scoreCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  scoreNum: { fontSize: 24, fontWeight: '800' },
  scoreOf: { fontSize: 10, color: '#999', marginTop: -2 },
  dateTimeBlock: { flex: 1 },
  dateText: { fontSize: 15, fontWeight: '600', color: '#2D2D3A' },
  timeRange: { fontSize: 13, color: '#666', marginTop: 4 },
  locText: { fontSize: 12, color: '#999', marginTop: 2 },

  // Section wrapper
  sectionBox: {
    marginHorizontal: 16,
    marginBottom: 14,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#F0EDE6',
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2D2D3A',
    marginBottom: 10,
    letterSpacing: 0.3,
  },

  // (Panchang styles are inline in PanchangWheel component)
  lunarMonth: {
    fontSize: 12,
    color: '#9A7B4F',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 10,
  },

  // Lagna
  lagnaRow: { flexDirection: 'row', gap: 14 },
  lagnaBig: {
    backgroundColor: '#F0EDFF',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 90,
  },
  lagnaSign: { fontSize: 18, fontWeight: '700', color: '#6C5CE7' },
  lagnaDeg: { fontSize: 12, color: '#6C5CE7', marginTop: 2 },
  lagnaDetails: { flex: 1, justifyContent: 'center', gap: 6 },
  lagnaCheckRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  lagnaCheckLabel: { fontSize: 12, color: '#666' },
  lagnaCheckValue: { fontSize: 12, fontWeight: '600' },

  // Bonus Yogas
  yogaBadges: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  yogaBadge: {
    backgroundColor: '#FFF8E1',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#F5A623',
  },
  yogaBadgeText: { fontSize: 12, fontWeight: '600', color: '#E65100' },

  // Inauspicious periods
  periodsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  periodChip: {
    backgroundColor: '#FFF0F0',
    borderRadius: 8,
    padding: 8,
    borderWidth: 1,
    borderColor: '#FFCDD2',
  },
  periodLabel: { fontSize: 10, fontWeight: '600', color: '#C62828' },
  periodTime: { fontSize: 11, color: '#666', marginTop: 2 },

  // Score breakdown
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  scoreLabel: { width: 90, fontSize: 11, color: '#666' },
  scoreBarContainer: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6 },
  scoreBarTrack: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#F0EDE6',
    overflow: 'hidden',
  },
  scoreBarFill: { height: 6, borderRadius: 3 },
  scoreBarValue: { fontSize: 10, color: '#999', width: 32, textAlign: 'right' },
  personalScore: { fontSize: 12, fontWeight: '700' },

  // Summary
  summaryBox: {
    marginHorizontal: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    paddingLeft: 12,
    paddingVertical: 10,
  },
  summaryText: { fontSize: 13, color: '#2D2D3A', lineHeight: 20, fontStyle: 'italic' },

  // Warnings
  warningBox: {
    marginHorizontal: 16,
    marginBottom: 12,
    backgroundColor: '#FFF8E1',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#FFE082',
  },
  warningText: { fontSize: 12, color: '#E65100', lineHeight: 18 },

  // Copy button
  copyBtn: {
    margin: 16,
    backgroundColor: '#F0EDFF',
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D0C9F0',
  },
  copyBtnActive: { backgroundColor: '#E8F5E9', borderColor: '#66BB6A' },
  copyBtnText: { fontSize: 13, fontWeight: '600', color: '#6C5CE7' },
  copyBtnTextActive: { color: '#2E7D32' },
});
