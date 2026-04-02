import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { gregorianToLunar, gregorianToLunarWithTime, getMonthCalendar } from '../services/HinduCalendar';

type Props = NativeStackScreenProps<RootStackParamList, 'TithiCalculator'>;

const MONTH_NAMES = [
  '', 'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const TIMEZONES = [
  { label: 'India (IST)', offset: 5.5 },
  { label: 'Singapore (SGT)', offset: 8 },
  { label: 'Dubai (GST)', offset: 4 },
  { label: 'London (GMT)', offset: 0 },
  { label: 'New York (EST)', offset: -5 },
  { label: 'San Francisco (PST)', offset: -8 },
];

function daysInMonth(y: number, m: number): number {
  return new Date(y, m, 0).getDate();
}

/** Find nearest occurrence of this tithi (searches current year and ±1 year) */
function findThisYearOccurrence(
  targetMonth: string,
  targetPaksha: 'shukla' | 'krishna',
  targetTithiNum: number,
) {
  const today = new Date();
  const curYear = today.getFullYear();
  // Search previous year, current year, and next year to find nearest occurrence
  const candidates: Date[] = [];
  for (let yr = curYear - 1; yr <= curYear + 1; yr++) {
    for (let m = 1; m <= 12; m++) {
      const days = getMonthCalendar(yr, m);
      for (const d of days) {
        if (
          d.lunarMonth === targetMonth &&
          d.paksha === targetPaksha &&
          d.tithiNum === targetTithiNum
        ) {
          candidates.push(d.date);
        }
      }
    }
  }
  if (candidates.length === 0) return null;
  // Return the nearest past or future occurrence to today
  candidates.sort((a, b) => Math.abs(a.getTime() - today.getTime()) - Math.abs(b.getTime() - today.getTime()));
  return candidates[0];
}

export default function TithiCalculatorScreen({ navigation }: Props) {
  const [yearStr, setYearStr] = useState('');
  const [monthNum, setMonthNum] = useState(0);
  const [dayStr, setDayStr] = useState('');
  const [hourStr, setHourStr] = useState('');
  const [minuteStr, setMinuteStr] = useState('');
  const [tzIndex, setTzIndex] = useState(0); // default IST
  const [useTime, setUseTime] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<ReturnType<typeof gregorianToLunar>>(null);
  const [gregDisplay, setGregDisplay] = useState('');
  const [timeNote, setTimeNote] = useState('');
  const dayRef = useRef<TextInput>(null);

  const year = parseInt(yearStr, 10);
  const day = parseInt(dayStr, 10);
  const maxDay = (year > 0 && monthNum > 0) ? daysInMonth(year, monthNum) : 31;

  const validate = useCallback((): string | null => {
    if (!yearStr || isNaN(year) || year < 1 || year > 2100) return 'Enter a valid year (1–2100)';
    if (monthNum < 1 || monthNum > 12) return 'Select a month';
    if (!dayStr || isNaN(day) || day < 1 || day > maxDay)
      return `Enter a valid day (1–${maxDay})`;
    return null;
  }, [yearStr, year, monthNum, dayStr, day, maxDay]);

  const calculate = () => {
    const err = validate();
    if (err) { setError(err); setResult(null); return; }
    setError('');

    const h = parseInt(hourStr, 10);
    const min = parseInt(minuteStr, 10);
    const hasTime = useTime && !isNaN(h) && !isNaN(min) && hourStr !== '' && minuteStr !== '';

    let r: ReturnType<typeof gregorianToLunar>;
    if (hasTime) {
      const tz = TIMEZONES[tzIndex];
      r = gregorianToLunarWithTime(year, monthNum, day, h, min, tz.offset);
      const ap = h >= 12 ? 'PM' : 'AM';
      const hr12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
      setTimeNote(`At ${hr12}:${String(min).padStart(2, '0')} ${ap} ${tz.label}`);
    } else {
      const dateStr = `${year}-${String(monthNum).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      r = gregorianToLunar(dateStr);
      setTimeNote('At Kashmir sunrise (default)');
    }
    setResult(r);
    setGregDisplay(`${MONTH_NAMES[monthNum]} ${day}, ${year}`);
  };

  const fillToday = () => {
    const d = new Date();
    setYearStr(String(d.getFullYear()));
    setMonthNum(d.getMonth() + 1);
    setDayStr(String(d.getDate()));
    setHourStr(String(d.getHours()));
    setMinuteStr(String(d.getMinutes()).padStart(2, '0'));
    setUseTime(true);
    // Auto-detect timezone offset
    const localOffset = -d.getTimezoneOffset() / 60;
    const closestTz = TIMEZONES.reduce((best, tz, i) =>
      Math.abs(tz.offset - localOffset) < Math.abs(TIMEZONES[best].offset - localOffset) ? i : best, 0);
    setTzIndex(closestTz);
    setError('');
    const r = gregorianToLunarWithTime(
      d.getFullYear(), d.getMonth() + 1, d.getDate(),
      d.getHours(), d.getMinutes(), TIMEZONES[closestTz].offset,
    );
    setResult(r);
    setGregDisplay(`${MONTH_NAMES[d.getMonth() + 1]} ${d.getDate()}, ${d.getFullYear()}`);
    const ap = d.getHours() >= 12 ? 'PM' : 'AM';
    const hr12 = d.getHours() === 0 ? 12 : d.getHours() > 12 ? d.getHours() - 12 : d.getHours();
    setTimeNote(`At ${hr12}:${String(d.getMinutes()).padStart(2, '0')} ${ap} ${TIMEZONES[closestTz].label}`);
  };

  const isValid = !validate();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.heading}>Tithi Calculator</Text>
      <Text style={styles.subheading}>
        Enter year, day & select month to find KP lunar date — month, paksha & tithi.
      </Text>

      {/* Year + Day on same row */}
      <View style={styles.yearDayRow}>
        <View style={styles.yearDayCol}>
          <Text style={styles.fieldLabel}>Year</Text>
          <TextInput
            style={styles.yearInput}
            value={yearStr}
            onChangeText={(t) => { setYearStr(t.replace(/\D/g, '').slice(0, 4)); setError(''); }}
            placeholder="e.g. 1947"
            placeholderTextColor="#BBB"
            keyboardType="number-pad"
            maxLength={4}
            returnKeyType="next"
          />
        </View>
        <View style={styles.yearDayCol}>
          <Text style={styles.fieldLabel}>Day{monthNum > 0 && year > 0 ? ` (1–${maxDay})` : ''}</Text>
          <TextInput
            ref={dayRef}
            style={styles.dayInput}
            value={dayStr}
            onChangeText={(t) => { setDayStr(t.replace(/\D/g, '').slice(0, 2)); setError(''); }}
            placeholder="e.g. 15"
            placeholderTextColor="#BBB"
            keyboardType="number-pad"
            maxLength={2}
            onSubmitEditing={calculate}
          />
        </View>
      </View>

      {/* Month selector */}
      <Text style={styles.fieldLabel}>Month</Text>
      <View style={styles.monthGrid}>
        {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
          <TouchableOpacity
            key={m}
            style={[styles.monthBtn, monthNum === m && styles.monthBtnActive]}
            onPress={() => { setMonthNum(m); setError(''); }}
          >
            <Text style={[styles.monthBtnText, monthNum === m && styles.monthBtnTextActive]}>
              {MONTH_NAMES[m].slice(0, 3)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Time toggle + inputs */}
      <TouchableOpacity
        style={styles.timeToggle}
        onPress={() => setUseTime(!useTime)}
      >
        <Text style={styles.timeToggleText}>
          {useTime ? '⏱ Time specified' : '⏱ Add time for exact tithi (optional)'}
        </Text>
        <Text style={styles.timeToggleArrow}>{useTime ? '▼' : '▶'}</Text>
      </TouchableOpacity>

      {useTime && (
        <View style={styles.timeSection}>
          <View style={styles.yearDayRow}>
            <View style={styles.yearDayCol}>
              <Text style={styles.fieldLabel}>Hour (0-23)</Text>
              <TextInput
                style={styles.dayInput}
                value={hourStr}
                onChangeText={(t) => setHourStr(t.replace(/\D/g, '').slice(0, 2))}
                placeholder="HH"
                placeholderTextColor="#BBB"
                keyboardType="number-pad"
                maxLength={2}
              />
            </View>
            <View style={styles.yearDayCol}>
              <Text style={styles.fieldLabel}>Minute (0-59)</Text>
              <TextInput
                style={styles.dayInput}
                value={minuteStr}
                onChangeText={(t) => setMinuteStr(t.replace(/\D/g, '').slice(0, 2))}
                placeholder="MM"
                placeholderTextColor="#BBB"
                keyboardType="number-pad"
                maxLength={2}
              />
            </View>
          </View>
          <Text style={styles.fieldLabel}>Timezone</Text>
          <View style={styles.monthGrid}>
            {TIMEZONES.map((tz, i) => (
              <TouchableOpacity
                key={i}
                style={[styles.monthBtn, tzIndex === i && styles.monthBtnActive]}
                onPress={() => setTzIndex(i)}
              >
                <Text style={[styles.monthBtnText, tzIndex === i && styles.monthBtnTextActive, { fontSize: 11 }]}>
                  {tz.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.timeHint}>
            Tithi changes throughout the day. Specifying exact birth/event time gives the precise tithi at that moment.
          </Text>
        </View>
      )}

      {/* Action row */}
      <View style={styles.actionRow}>
        <TouchableOpacity style={styles.todayBtn} onPress={fillToday}>
          <Text style={styles.todayBtnText}>Use Today</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.calcBtn, !isValid && styles.calcBtnDisabled]}
          onPress={calculate}
        >
          <Text style={styles.calcBtnText}>Calculate Tithi</Text>
        </TouchableOpacity>
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      {result && (
        <View style={styles.resultCard}>
          <Text style={styles.resultLabel}>Gregorian Date</Text>
          <Text style={styles.resultValue}>{gregDisplay}</Text>
          {timeNote ? <Text style={styles.timeNoteText}>{timeNote}</Text> : null}

          <View style={styles.divider} />

          <Text style={styles.resultLabel}>Lunar Month (Maas)</Text>
          <Text style={styles.resultValue}>{result.lunarMonth}</Text>

          <Text style={styles.resultLabel}>Paksha (Lunar Phase)</Text>
          <Text style={styles.resultValue}>
            {result.paksha === 'shukla' ? 'Shukla Paksha (Zoonpash — Bright Half)' : 'Krishna Paksha (Gatpash — Dark Half)'}
          </Text>

          <Text style={styles.resultLabel}>Tithi (Lunar Day)</Text>
          <Text style={styles.resultValue}>{result.tithi}</Text>

          <Text style={styles.resultLabel}>Day (Vaar)</Text>
          <Text style={styles.resultValue}>{result.day}</Text>

          <View style={styles.divider} />

          <Text style={styles.summaryText}>
            {result.lunarMonth} · {result.paksha === 'shukla' ? 'Shukla Paksha' : 'Krishna Paksha'} · {result.tithi}
          </Text>

          {(() => {
            const occ = findThisYearOccurrence(result.lunarMonth, result.paksha, result.tithiNum);
            if (!occ) return null;
            const occYear = occ.getFullYear();
            const occMonth = MONTH_NAMES[occ.getMonth() + 1];
            const occDay = occ.getDate();
            const curYear = new Date().getFullYear();
            if (occYear !== curYear) return null;
            return (
              <View style={styles.thisYearBox}>
                <Text style={styles.thisYearLabel}>📅 Appears this year on</Text>
                <Text style={styles.thisYearValue}>{occMonth} {occDay}, {occYear}</Text>
              </View>
            );
          })()}
        </View>
      )}

      {/* ── How it Works ── */}
      <View style={styles.howSection}>
        <Text style={styles.howTitle}>🎓  How Does the Tithi Calculator Work?</Text>
        <Text style={styles.howSubtitle}>A simple guide for everyone</Text>

        {/* What is a Tithi? */}
        <View style={styles.howCard}>
          <Text style={styles.howCardTitle}>🌙 What is a Tithi?</Text>
          <Text style={styles.howBody}>
            A <Text style={styles.howBold}>Tithi</Text> is a "lunar day" — but it's NOT the same as a
            regular day!{'\n\n'}
            Imagine the <Text style={styles.howBold}>Moon</Text> running around the Earth, and the{' '}
            <Text style={styles.howBold}>Sun</Text> shining from far away. The <Text style={styles.howBold}>angle</Text>{' '}
            between the Moon and the Sun keeps changing as the Moon moves.{'\n\n'}
            Every time that angle increases by <Text style={styles.howBold}>12°</Text>, one Tithi is complete.
            There are <Text style={styles.howBold}>30 tithis</Text> in a full lunar month (30 × 12° = 360°).
          </Text>
        </View>

        {/* Two Halves */}
        <View style={styles.howCard}>
          <Text style={styles.howCardTitle}>🌓 Two Halves of the Month</Text>
          <Text style={styles.howBody}>
            The 30 tithis are split into two halves called <Text style={styles.howBold}>Paksha</Text>:{'\n\n'}
            🌒 <Text style={styles.howBold}>Shukla Paksha</Text> (Bright Half) — Tithis 1–15{'\n'}
            {'    '}Moon grows from New Moon → Full Moon{'\n\n'}
            🌘 <Text style={styles.howBold}>Krishna Paksha</Text> (Dark Half) — Tithis 1–15{'\n'}
            {'    '}Moon shrinks from Full Moon → New Moon{'\n\n'}
            Each tithi has a name:{'\n'}
            1. Pratipada  2. Dwitiya  3. Tritiya ...{'\n'}
            11. <Text style={styles.howBold}>Ekadashi</Text>  13. <Text style={styles.howBold}>Trayodashi</Text>{' '}
            15. Purnima/Amavasya
          </Text>
        </View>

        {/* Why time matters */}
        <View style={[styles.howCard, { backgroundColor: '#FFF9F0' }]}>
          <Text style={styles.howCardTitle}>⏰ Why Does Time of Day Matter?</Text>
          <Text style={styles.howBody}>
            Unlike a regular day that runs midnight to midnight, a tithi can start and end at{' '}
            <Text style={styles.howBold}>any hour</Text>.{'\n\n'}
            For example, Trayodashi (13th tithi) might start at 2 PM on Monday and end
            at 5 AM on Tuesday. Someone born Monday morning gets tithi 12, but someone
            born Monday evening gets tithi 13 — <Text style={styles.howBold}>same date, different tithi!</Text>{'\n\n'}
            That's why specifying your <Text style={styles.howBold}>exact birth time</Text> and{' '}
            <Text style={styles.howBold}>timezone</Text> gives you the correct tithi.
          </Text>
        </View>

        {/* How this calculator works */}
        <View style={styles.howCard}>
          <Text style={styles.howCardTitle}>🔬 What Happens Under the Hood?</Text>
          <Text style={styles.howBody}>
            <Text style={styles.howBold}>Step 1:</Text> Convert your date (and time) to a number
            astronomers use called a <Text style={styles.howBold}>Julian Day</Text>.{'\n\n'}
            <Text style={styles.howBold}>Step 2:</Text> Calculate the Moon's exact position in the
            sky using the <Text style={styles.howBold}>Meeus algorithm</Text> (a precise astronomical formula).{'\n\n'}
            <Text style={styles.howBold}>Step 3:</Text> Calculate the Sun's position and subtract the{' '}
            <Text style={styles.howBold}>Lahiri Ayanamsha</Text> to get the sidereal (Vedic) position.{'\n\n'}
            <Text style={styles.howBold}>Step 4:</Text> Subtract Sun from Moon → this angle ÷ 12° = your Tithi!{'\n\n'}
            <Text style={styles.howBold}>Step 5:</Text> The Sun's sidereal position also tells us the{' '}
            <Text style={styles.howBold}>Lunar Month</Text> name (Chaitra, Vaishakh, etc.).
          </Text>
        </View>

        {/* No time specified */}
        <View style={styles.howCard}>
          <Text style={styles.howCardTitle}>🏔️ What if I Don't Know the Time?</Text>
          <Text style={styles.howBody}>
            No problem! When no time is provided, we calculate the tithi at{' '}
            <Text style={styles.howBold}>Kashmir sunrise</Text> (~6:15 AM IST) — the traditional
            reference point for Kashmiri Pandits.{'\n\n'}
            In Hindu tradition, the tithi at <Text style={styles.howBold}>sunrise</Text> determines
            which tithi "owns" that day for rituals and calendar purposes.
          </Text>
        </View>

        {/* Fun fact */}
        <View style={[styles.howCard, { backgroundColor: '#F0F0FF', borderColor: '#6C5CE7' }]}>
          <Text style={styles.howCardTitle}>🤯 Cool Fact</Text>
          <Text style={styles.howBody}>
            Ekadashi (11th tithi) is considered sacred for fasting. Kashmiri Pandits
            especially observe <Text style={styles.howBold}>Trayodashi (13th)</Text> as it's
            dedicated to Lord Shiva. And Ashtami (8th) is sacred to Goddess Durga!
          </Text>
        </View>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F8' },
  content: { padding: 20 },
  heading: { fontSize: 22, fontWeight: '700', color: '#2D2D3A', marginBottom: 6 },
  subheading: { fontSize: 14, color: '#888', lineHeight: 20, marginBottom: 16 },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: '#555', marginBottom: 6, marginTop: 12 },
  yearDayRow: {
    flexDirection: 'row',
    gap: 14,
  },
  yearDayCol: {
    flex: 1,
  },
  yearInput: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    fontSize: 18,
    fontWeight: '600',
    borderWidth: 1,
    borderColor: '#EAEAEF',
    textAlign: 'center',
  },
  dayInput: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    fontSize: 18,
    fontWeight: '600',
    borderWidth: 1,
    borderColor: '#EAEAEF',
    textAlign: 'center',
  },
  monthGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  monthBtn: {
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#EAEAEF',
    minWidth: 58,
    alignItems: 'center',
  },
  monthBtnActive: {
    backgroundColor: '#6C5CE7',
    borderColor: '#6C5CE7',
  },
  monthBtnText: { fontSize: 14, fontWeight: '600', color: '#555' },
  monthBtnTextActive: { color: '#fff' },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
    marginBottom: 16,
  },
  todayBtn: {
    backgroundColor: '#F0EDFF',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  todayBtnText: { fontSize: 15, fontWeight: '600', color: '#6C5CE7' },
  calcBtn: {
    flex: 1,
    backgroundColor: '#6C5CE7',
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  calcBtnDisabled: { opacity: 0.4 },
  calcBtnText: { fontSize: 16, fontWeight: '600', color: '#fff' },
  errorText: { fontSize: 13, color: '#FF6B6B', marginBottom: 12 },
  resultCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#EAEAEF',
    marginBottom: 20,
  },
  resultLabel: { fontSize: 12, fontWeight: '600', color: '#999', textTransform: 'uppercase', marginTop: 12 },
  resultValue: { fontSize: 17, fontWeight: '600', color: '#2D2D3A', marginTop: 2 },
  divider: { height: 1, backgroundColor: '#EAEAEF', marginVertical: 14 },
  summaryText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#6C5CE7',
    textAlign: 'center',
    marginTop: 4,
  },
  thisYearBox: {
    backgroundColor: '#F0FFF0',
    borderRadius: 10,
    padding: 12,
    marginTop: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#66BB6A',
  },
  thisYearLabel: { fontSize: 12, color: '#2E7D32', fontWeight: '600' },
  thisYearValue: { fontSize: 16, color: '#2E7D32', fontWeight: '700', marginTop: 4 },
  infoCard: {
    backgroundColor: '#F0EDFF',
    borderRadius: 14,
    padding: 16,
  },
  infoTitle: { fontSize: 14, fontWeight: '700', color: '#6C5CE7', marginBottom: 6 },
  infoText: { fontSize: 13, color: '#555', lineHeight: 20 },
  timeToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F0EDFF',
    borderRadius: 12,
    padding: 12,
    marginTop: 14,
  },
  timeToggleText: { fontSize: 14, fontWeight: '600', color: '#6C5CE7' },
  timeToggleArrow: { fontSize: 12, color: '#6C5CE7' },
  timeSection: {
    backgroundColor: '#FAFAFE',
    borderRadius: 12,
    padding: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#EAEAEF',
  },
  timeHint: { fontSize: 12, color: '#999', lineHeight: 18, marginTop: 10 },
  timeNoteText: { fontSize: 12, color: '#6C5CE7', fontWeight: '600', marginTop: 4 },
  howSection: { marginTop: 24, paddingTop: 20, borderTopWidth: 1, borderTopColor: '#EAEAEF' },
  howTitle: { fontSize: 20, fontWeight: '700', color: '#2D2D3A', textAlign: 'center' },
  howSubtitle: { fontSize: 13, color: '#888', textAlign: 'center', marginBottom: 16 },
  howCard: {
    backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 14,
    borderWidth: 1, borderColor: '#EAEAEF',
  },
  howCardTitle: { fontSize: 16, fontWeight: '700', color: '#2D2D3A', marginBottom: 8 },
  howBody: { fontSize: 14, color: '#444', lineHeight: 22 },
  howBold: { fontWeight: '700', color: '#2D2D3A' },
});
