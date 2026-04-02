import React, { useState, useMemo } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  StyleSheet, Platform,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { getMuhuratEvent, needsSecondPerson } from '../data/muhuratEvents';
import { CITIES } from '../data/cities';

type Props = NativeStackScreenProps<RootStackParamList, 'MuhuratInput'>;

type DateMode = 'nearest' | 'this_year' | 'next_3_months' | 'custom';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function formatDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export default function MuhuratInputScreen({ navigation, route }: Props) {
  const { eventId } = route.params;
  const event = useMemo(() => getMuhuratEvent(eventId), [eventId]);
  const showPerson2 = useMemo(() => needsSecondPerson(eventId), [eventId]);

  // Date mode
  const [dateMode, setDateMode] = useState<DateMode>('next_3_months');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');

  // Location
  const [selectedCity, setSelectedCity] = useState(0); // index into CITIES
  const [showAllCities, setShowAllCities] = useState(false);

  // Preferred days
  const [preferredDays, setPreferredDays] = useState<number[]>([]);

  // Time preference
  const [timeWindow, setTimeWindow] = useState<'morning' | 'afternoon' | 'any'>('any');

  // Person 1
  const [name1, setName1] = useState('');
  const [dob1Y, setDob1Y] = useState('');
  const [dob1M, setDob1M] = useState('');
  const [dob1D, setDob1D] = useState('');
  const [tob1H, setTob1H] = useState('');
  const [tob1Min, setTob1Min] = useState('');
  const [pob1, setPob1] = useState('');

  // Person 2 (marriage/engagement)
  const [name2, setName2] = useState('');
  const [dob2Y, setDob2Y] = useState('');
  const [dob2M, setDob2M] = useState('');
  const [dob2D, setDob2D] = useState('');
  const [tob2H, setTob2H] = useState('');
  const [tob2Min, setTob2Min] = useState('');
  const [pob2, setPob2] = useState('');

  const makeDob = (y: string, m: string, d: string) => {
    if (!y || !m || !d) return undefined;
    return `${y.padStart(4, '0')}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  };
  const makeTob = (h: string, min: string) => {
    if (!h || !min) return undefined;
    return `${h.padStart(2, '0')}:${min.padStart(2, '0')}`;
  };

  const dob1 = makeDob(dob1Y, dob1M, dob1D) || '';
  const tob1 = makeTob(tob1H, tob1Min) || '';
  const dob2 = makeDob(dob2Y, dob2M, dob2D) || '';
  const tob2 = makeTob(tob2H, tob2Min) || '';

  // Number of results
  const [numResults, setNumResults] = useState(3);

  if (!event) return <Text>Event not found</Text>;

  // Compute date range based on mode
  const getDateRange = (): { from: string; to: string } => {
    const today = new Date();
    switch (dateMode) {
      case 'nearest': {
        const to = new Date(today);
        to.setDate(to.getDate() + 30);
        return { from: formatDate(today), to: formatDate(to) };
      }
      case 'next_3_months': {
        const to = new Date(today);
        to.setMonth(to.getMonth() + 3);
        return { from: formatDate(today), to: formatDate(to) };
      }
      case 'this_year': {
        const to = new Date(today.getFullYear(), 11, 31);
        return { from: formatDate(today), to: formatDate(to) };
      }
      case 'custom':
        return {
          from: customFrom || formatDate(today),
          to: customTo || formatDate(new Date(today.getFullYear(), today.getMonth() + 3, today.getDate())),
        };
    }
  };

  const toggleDay = (d: number) => {
    setPreferredDays(prev =>
      prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d],
    );
  };

  const handleCalculate = () => {
    const city = CITIES[selectedCity];
    const dateRange = getDateRange();

    navigation.navigate('MuhuratResults', {
      eventId,
      dateFrom: dateRange.from,
      dateTo: dateRange.to,
      locationName: city.label,
      locationLat: city.lat,
      locationLng: city.lng,
      preferredDays: preferredDays.length > 0 ? preferredDays : undefined,
      timeWindow,
      numResults,
      person1Name: name1 || undefined,
      person1DOB: dob1 || undefined,
      person1TOB: tob1 || undefined,
      person1POB: pob1 || undefined,
      person2Name: showPerson2 ? (name2 || undefined) : undefined,
      person2DOB: showPerson2 ? (dob2 || undefined) : undefined,
      person2TOB: showPerson2 ? (tob2 || undefined) : undefined,
      person2POB: showPerson2 ? (pob2 || undefined) : undefined,
    });
  };

  const visibleCities = showAllCities ? CITIES : CITIES.slice(0, 6);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Event header */}
      <View style={styles.eventHeader}>
        <Text style={styles.eventIcon}>{event.icon}</Text>
        <View style={{ flex: 1 }}>
          <Text style={styles.eventName}>{event.name}</Text>
          {event.kpName && <Text style={styles.eventKP}>{event.kpName}</Text>}
        </View>
      </View>

      {/* ── Section 1: When ── */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📅  When do you need the Saath?</Text>
        <View style={styles.chipRow}>
          {([
            { mode: 'nearest' as DateMode, label: 'Nearest (30 days)' },
            { mode: 'next_3_months' as DateMode, label: 'Next 3 Months' },
            { mode: 'this_year' as DateMode, label: 'This Year' },
            { mode: 'custom' as DateMode, label: 'Custom Range' },
          ]).map(({ mode, label }) => (
            <TouchableOpacity
              key={mode}
              style={[styles.chip, dateMode === mode && styles.chipActive]}
              onPress={() => setDateMode(mode)}
            >
              <Text style={[styles.chipText, dateMode === mode && styles.chipTextActive]}>
                {label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {dateMode === 'custom' && (
          <View style={{ gap: 10, marginTop: 10 }}>
            <Text style={styles.fieldLabel}>From</Text>
            <DateFields prefix="cf" y={customFrom.slice(0, 4)} m={customFrom.slice(5, 7)} d={customFrom.slice(8, 10)}
              onY={v => setCustomFrom(v + customFrom.slice(4))}
              onM={v => setCustomFrom(customFrom.slice(0, 5) + v + customFrom.slice(7))}
              onD={v => setCustomFrom(customFrom.slice(0, 8) + v)} />
            <Text style={styles.fieldLabel}>To</Text>
            <DateFields prefix="ct" y={customTo.slice(0, 4)} m={customTo.slice(5, 7)} d={customTo.slice(8, 10)}
              onY={v => setCustomTo(v + customTo.slice(4))}
              onM={v => setCustomTo(customTo.slice(0, 5) + v + customTo.slice(7))}
              onD={v => setCustomTo(customTo.slice(0, 8) + v)} />
          </View>
        )}
      </View>

      {/* ── Section 2: Where ── */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📍  Where will the event take place?</Text>
        <View style={styles.cityGrid}>
          {visibleCities.map((city, idx) => (
            <TouchableOpacity
              key={idx}
              style={[styles.cityChip, selectedCity === idx && styles.cityChipActive]}
              onPress={() => setSelectedCity(idx)}
            >
              <Text style={[styles.cityText, selectedCity === idx && styles.cityTextActive]}>
                {city.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        {!showAllCities && (
          <TouchableOpacity onPress={() => setShowAllCities(true)}>
            <Text style={styles.showMore}>Show more cities ›</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* ── Section 3: Preferred Days ── */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🗓  Preferred Day of Week?</Text>
        <Text style={styles.sectionHint}>Optional — select days that work for you</Text>
        <View style={styles.chipRow}>
          {WEEKDAYS.map((wd, i) => (
            <TouchableOpacity
              key={i}
              style={[styles.dayChip, preferredDays.includes(i) && styles.dayChipActive]}
              onPress={() => toggleDay(i)}
            >
              <Text style={[styles.dayChipText, preferredDays.includes(i) && styles.dayChipTextActive]}>
                {wd}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* ── Section 4: Time Window ── */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🕐  Preferred Time?</Text>
        <View style={styles.chipRow}>
          {([
            { val: 'morning' as const, label: '☀️ Morning (6 AM – 12 PM)' },
            { val: 'afternoon' as const, label: '🌤 Afternoon (12 – 6 PM)' },
            { val: 'any' as const, label: '🔄 Any Time' },
          ]).map(({ val, label }) => (
            <TouchableOpacity
              key={val}
              style={[styles.chip, timeWindow === val && styles.chipActive]}
              onPress={() => setTimeWindow(val)}
            >
              <Text style={[styles.chipText, timeWindow === val && styles.chipTextActive]}>
                {label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* ── Section 5: Birth Details ── */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          🌟  Birth Details {showPerson2 ? '(Person 1)' : '(Optional)'}
        </Text>
        <Text style={styles.sectionHint}>
          Providing birth details enables personalized Tarabalam & Chandrabalam analysis
        </Text>
        <TextInput
          style={styles.input}
          placeholder="Full Name"
          placeholderTextColor="#CCC"
          value={name1}
          onChangeText={setName1}
        />
        <Text style={styles.fieldLabel}>Date of Birth</Text>
        <DateFields prefix="p1" y={dob1Y} m={dob1M} d={dob1D}
          onY={setDob1Y} onM={setDob1M} onD={setDob1D} />
        <Text style={[styles.fieldLabel, { marginTop: 6 }]}>Time of Birth (24h)</Text>
        <TimeFields prefix="p1" h={tob1H} min={tob1Min}
          onH={setTob1H} onMin={setTob1Min} />
        <TextInput
          style={[styles.input, { marginTop: 6 }]}
          placeholder="Place of Birth (City)"
          placeholderTextColor="#CCC"
          value={pob1}
          onChangeText={setPob1}
        />
      </View>

      {/* Person 2 (marriage/engagement) */}
      {showPerson2 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💑  Birth Details (Person 2)</Text>
          <Text style={styles.sectionHint}>
            For {event.name}, both charts are analyzed for compatibility
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Full Name"
            placeholderTextColor="#CCC"
            value={name2}
            onChangeText={setName2}
          />
          <Text style={styles.fieldLabel}>Date of Birth</Text>
          <DateFields prefix="p2" y={dob2Y} m={dob2M} d={dob2D}
            onY={setDob2Y} onM={setDob2M} onD={setDob2D} />
          <Text style={[styles.fieldLabel, { marginTop: 6 }]}>Time of Birth (24h)</Text>
          <TimeFields prefix="p2" h={tob2H} min={tob2Min}
            onH={setTob2H} onMin={setTob2Min} />
          <TextInput
            style={[styles.input, { marginTop: 6 }]}
            placeholder="Place of Birth (City)"
            placeholderTextColor="#CCC"
            value={pob2}
            onChangeText={setPob2}
          />
        </View>
      )}

      {/* ── Section 6: How many results ── */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📊  How many options?</Text>
        <View style={styles.chipRow}>
          {[1, 3, 5].map(n => (
            <TouchableOpacity
              key={n}
              style={[styles.chip, numResults === n && styles.chipActive]}
              onPress={() => setNumResults(n)}
            >
              <Text style={[styles.chipText, numResults === n && styles.chipTextActive]}>
                Top {n}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* ── Calculate Button ── */}
      <TouchableOpacity style={styles.calcBtn} onPress={handleCalculate} activeOpacity={0.8}>
        <Text style={styles.calcBtnText}>🔮  Find Shubh Muhurat</Text>
      </TouchableOpacity>

      {/* Disclaimer */}
      <Text style={styles.disclaimer}>
        Results are based on Vedic Panchang analysis. Always consult a qualified Jyotishi for final confirmation.
      </Text>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

/* ─── Structured Date & Time sub-components ─── */

function DateFields({ prefix, y, m, d, onY, onM, onD }: {
  prefix: string; y: string; m: string; d: string;
  onY: (v: string) => void; onM: (v: string) => void; onD: (v: string) => void;
}) {
  return (
    <View style={dfStyles.row}>
      <View style={dfStyles.cell}>
        <TextInput style={dfStyles.inp} placeholder="YYYY" placeholderTextColor="#CCC"
          value={y} onChangeText={v => onY(v.replace(/[^0-9]/g, ''))} maxLength={4} keyboardType="number-pad" />
      </View>
      <Text style={dfStyles.sep}>/</Text>
      <View style={dfStyles.cellSm}>
        <TextInput style={dfStyles.inp} placeholder="MM" placeholderTextColor="#CCC"
          value={m} onChangeText={v => onM(v.replace(/[^0-9]/g, ''))} maxLength={2} keyboardType="number-pad" />
      </View>
      <Text style={dfStyles.sep}>/</Text>
      <View style={dfStyles.cellSm}>
        <TextInput style={dfStyles.inp} placeholder="DD" placeholderTextColor="#CCC"
          value={d} onChangeText={v => onD(v.replace(/[^0-9]/g, ''))} maxLength={2} keyboardType="number-pad" />
      </View>
    </View>
  );
}

function TimeFields({ prefix, h, min, onH, onMin }: {
  prefix: string; h: string; min: string;
  onH: (v: string) => void; onMin: (v: string) => void;
}) {
  return (
    <View style={dfStyles.row}>
      <View style={dfStyles.cellSm}>
        <TextInput style={dfStyles.inp} placeholder="HH" placeholderTextColor="#CCC"
          value={h} onChangeText={v => onH(v.replace(/[^0-9]/g, ''))} maxLength={2} keyboardType="number-pad" />
      </View>
      <Text style={dfStyles.sep}>:</Text>
      <View style={dfStyles.cellSm}>
        <TextInput style={dfStyles.inp} placeholder="MM" placeholderTextColor="#CCC"
          value={min} onChangeText={v => onMin(v.replace(/[^0-9]/g, ''))} maxLength={2} keyboardType="number-pad" />
      </View>
    </View>
  );
}

const dfStyles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  cell: { flex: 2 },
  cellSm: { flex: 1 },
  sep: { fontSize: 18, fontWeight: '600', color: '#999' },
  inp: {
    backgroundColor: '#F9F8FF',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    fontSize: 15,
    color: '#2D2D3A',
    borderWidth: 1,
    borderColor: '#EAEAEF',
    textAlign: 'center',
  },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F8' },
  content: { padding: 16 },

  // Event header
  eventHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF9F0',
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E8DCC8',
    gap: 14,
  },
  eventIcon: { fontSize: 36 },
  eventName: { fontSize: 18, fontWeight: '700', color: '#2D2D3A' },
  eventKP: { fontSize: 13, color: '#9A7B4F', fontStyle: 'italic', marginTop: 2 },

  // Sections
  section: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#EAEAEF',
  },
  sectionTitle: { fontSize: 15, fontWeight: '600', color: '#2D2D3A', marginBottom: 10 },
  sectionHint: { fontSize: 12, color: '#999', marginBottom: 10, lineHeight: 17 },

  // Chip row
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: '#F5F5F8',
    borderWidth: 1,
    borderColor: '#EAEAEF',
  },
  chipActive: { backgroundColor: '#6C5CE7', borderColor: '#6C5CE7' },
  chipText: { fontSize: 13, color: '#666' },
  chipTextActive: { color: '#fff', fontWeight: '600' },

  // Day chips
  dayChip: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F8',
    borderWidth: 1,
    borderColor: '#EAEAEF',
  },
  dayChipActive: { backgroundColor: '#6C5CE7', borderColor: '#6C5CE7' },
  dayChipText: { fontSize: 12, fontWeight: '600', color: '#666' },
  dayChipTextActive: { color: '#fff' },

  // City grid
  cityGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  cityChip: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: '#F5F5F8',
    borderWidth: 1,
    borderColor: '#EAEAEF',
  },
  cityChipActive: { backgroundColor: '#6C5CE7', borderColor: '#6C5CE7' },
  cityText: { fontSize: 12, color: '#666' },
  cityTextActive: { color: '#fff', fontWeight: '600' },
  showMore: { fontSize: 13, color: '#6C5CE7', fontWeight: '600', marginTop: 8 },

  // Custom date
  fieldLabel: { fontSize: 11, color: '#999', marginBottom: 4 },

  // Input
  input: {
    backgroundColor: '#F9F8FF',
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    color: '#2D2D3A',
    borderWidth: 1,
    borderColor: '#EAEAEF',
    marginBottom: 10,
  },

  // Calculate button
  calcBtn: {
    backgroundColor: '#6C5CE7',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#6C5CE7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  calcBtnText: { fontSize: 17, fontWeight: '700', color: '#fff' },

  // Disclaimer
  disclaimer: {
    fontSize: 11,
    color: '#BBB',
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 16,
  },
});
