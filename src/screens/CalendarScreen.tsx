import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Pressable,
  ScrollView,
  StyleSheet,
  Platform,
  Modal,
  TextInput,
  Alert,
  useWindowDimensions,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { getMonthCalendar, getSankalpa, TITHI_NAMES, type CalendarDay } from '../services/HinduCalendar';
import { KP_FESTIVALS, getMonthlyObservances, getObservanceTags, type KPFestival } from '../data/kpFestivals';
import { exportCalendarCSV, printCalendar } from '../services/CalendarExport';
import {
  getEventsForDay, getEventsForMonth,
  LUNAR_MONTHS_LIST, TYPE_EMOJI,
  type SavedEvent, type EventType,
} from '../services/SavedEventsService';
import { useCalendar } from '../contexts/CalendarContext';

type Props = NativeStackScreenProps<RootStackParamList, 'Calendar'>;

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const MONTH_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const KASHMIRI_WEEKDAYS = ['Ravivar', 'Somvar', 'Mangalvar', 'Budhvar', 'Guruvar', 'Shukravar', 'Shanivar'];

function findFestivals(lunarMonth: string, paksha: 'shukla' | 'krishna', tithiNum: number): KPFestival[] {
  return KP_FESTIVALS.filter(
    (f) => (f.lunarMonth === lunarMonth || f.lunarMonthAlt === lunarMonth) && f.paksha === paksha && f.tithi === tithiNum,
  );
}

/** Tithi display name without the (N) suffix */
function tithiLabel(tithiNum: number, paksha: 'shukla' | 'krishna'): string {
  if (tithiNum === 15) return paksha === 'shukla' ? 'Purnima' : 'Amavasya';
  const raw = TITHI_NAMES[Math.min(tithiNum - 1, 14)];
  return raw.replace(/\s*\(\d+\)$/, '');
}

/** Build the 12-month carousel: 1 past + current + 10 future */
function buildMonthCarousel(curYear: number, curMonth: number): { year: number; month: number }[] {
  const items: { year: number; month: number }[] = [];
  // 1 month before
  let y = curMonth === 1 ? curYear - 1 : curYear;
  let m = curMonth === 1 ? 12 : curMonth - 1;
  items.push({ year: y, month: m });
  // current
  items.push({ year: curYear, month: curMonth });
  // 10 months ahead
  y = curYear; m = curMonth;
  for (let i = 0; i < 10; i++) {
    m++;
    if (m > 12) { m = 1; y++; }
    items.push({ year: y, month: m });
  }
  return items;
}

function getSamvatDetails(date: Date) {
  const gregorianYear = date.getFullYear();
  return {
    vikramSamvat: gregorianYear + 57,
    saptarishiSamvat: gregorianYear + 3076,
  };
}

/** Moon phase emoji from tithi number + paksha */
function moonPhaseEmoji(tithiNum: number, paksha: 'shukla' | 'krishna'): string {
  if (paksha === 'shukla') {
    if (tithiNum === 15) return '🌕';
    if (tithiNum >= 12) return '🌔';
    if (tithiNum >= 7)  return '🌓';
    if (tithiNum >= 3)  return '🌒';
    return '🌑';
  } else {
    if (tithiNum === 15) return '🌑';
    if (tithiNum >= 12) return '🌘';
    if (tithiNum >= 7)  return '🌗';
    if (tithiNum >= 3)  return '🌖';
    return '🌕';
  }
}

const TITHI_NUMS = Array.from({ length: 15 }, (_, i) => i + 1);
const EVENT_TYPES: { type: EventType; label: string }[] = [
  { type: 'birthday', label: '🎂 Birthday' },
  { type: 'anniversary', label: '❤️ Anniversary' },
  { type: 'custom', label: '⭐ Custom' },
];

export default function CalendarScreen({ navigation }: Props) {
  const today = useMemo(() => new Date(), []);
  const todayYear = today.getFullYear();
  const todayMonth = today.getMonth() + 1;
  const todayDate = today.getDate();
  const { width } = useWindowDimensions();
  const isMobile = width < 760;
  const [year, setYear] = useState(todayYear);
  const [month, setMonth] = useState(todayMonth); // 1-based
  const [selectedDay, setSelectedDay] = useState<CalendarDay | null>(null);
  const [zoomDay, setZoomDay] = useState<CalendarDay | null>(null);
  const [showLegend, setShowLegend] = useState(false);
  const [detailCardCollapsed, setDetailCardCollapsed] = useState(false);
  const tileScrollRef = useRef<ScrollView>(null);
  const isFirstMountRef = useRef(true);

  // Saved personal events — owned by CalendarContext (hydrated on app start)
  const { userEvents: savedEvents, addUserEvent, deleteUserEvent } = useCalendar();

  // Add Event modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState<EventType>('birthday');
  const [newLunarMonth, setNewLunarMonth] = useState(LUNAR_MONTHS_LIST[0]);
  const [newPaksha, setNewPaksha] = useState<'shukla' | 'krishna'>('shukla');
  const [newTithi, setNewTithi] = useState(1);

  const blurFocusedElement = useCallback(() => {
    if (Platform.OS !== 'web') return;
    const active = (globalThis as { document?: Document }).document?.activeElement as HTMLElement | null | undefined;
    active?.blur?.();
  }, []);

  const openAddModal = useCallback((prefillDay?: CalendarDay) => {
    setNewName('');
    setNewType('birthday');
    setNewLunarMonth(prefillDay?.lunarMonth ?? LUNAR_MONTHS_LIST[0]);
    setNewPaksha(prefillDay?.paksha ?? 'shukla');
    setNewTithi(prefillDay?.tithiNum ?? 1);
    setShowAddModal(true);
  }, []);

  const handleSaveEvent = useCallback(() => {
    if (!newName.trim()) return;
    const saved = addUserEvent({
      name: newName.trim(),
      type: newType,
      lunarMonth: newLunarMonth,
      paksha: newPaksha,
      tithiNum: newTithi,
      emoji: TYPE_EMOJI[newType],
    });
    if (!saved) {
      Alert.alert('Profile Required', 'Select or create a profile in Setup before saving personal calendar events.');
      return;
    }
    setShowAddModal(false);
  }, [newName, newType, newLunarMonth, newPaksha, newTithi, addUserEvent]);

  const handleDeleteEvent = useCallback((id: string) => {
    deleteUserEvent(id);
  }, [deleteUserEvent]);

  const days = useMemo(() => getMonthCalendar(year, month), [year, month]);
  const firstDow = days.length > 0 ? days[0].date.getDay() : 0;

  // Auto-select today on first mount (all platforms); desktop re-selects on month nav.
  useEffect(() => {
    const isCurrentMonth = year === todayYear && month === todayMonth;
    if (isCurrentMonth && (isFirstMountRef.current || !isMobile)) {
      const todayDay = days.find((d) => d.day === todayDate) ?? null;
      setSelectedDay(todayDay);
      isFirstMountRef.current = false;
    } else {
      setSelectedDay((prev) => {
        if (!prev) return prev;
        const stillInVisibleMonth = prev.date.getFullYear() === year && (prev.date.getMonth() + 1) === month;
        return stillInVisibleMonth ? prev : null;
      });
    }
    setZoomDay(null);
  }, [year, month, days, isMobile, todayYear, todayMonth, todayDate]);

  const closeZoomModal = useCallback(() => {
    blurFocusedElement();
    setZoomDay(null);
  }, [blurFocusedElement]);

  const handleDayPress = useCallback((day: CalendarDay) => {
    setSelectedDay(day);
    setDetailCardCollapsed(false);
    if (isMobile) {
      // Toggle zoom on same day click; open zoom on different day
      setZoomDay((prev) => (prev?.day === day.day ? null : day));
    }
  }, [isMobile]);

  const navigateToMonth = useCallback((y: number, m: number) => {
    setYear(y);
    setMonth(m);
  }, []);

  const goPrev = useCallback(() => {
    if (month === 1) { setMonth(12); setYear((y) => y - 1); }
    else setMonth((m) => m - 1);
  }, [month]);

  const goNext = useCallback(() => {
    if (month === 12) { setMonth(1); setYear((y) => y + 1); }
    else setMonth((m) => m + 1);
  }, [month]);

  // Month tile carousel
  const carousel = useMemo(() => buildMonthCarousel(todayYear, todayMonth), [todayYear, todayMonth]);

  // Pre-compute festivals per day
  const festivalMap = useMemo(() => {
    const map = new Map<number, KPFestival[]>();
    for (const d of days) {
      const f = findFestivals(d.lunarMonth, d.paksha, d.tithiNum);
      if (f.length > 0) map.set(d.day, f);
    }
    return map;
  }, [days]);

  // Pre-compute saved events per day
  const savedEventMap = useMemo(() => {
    const map = new Map<number, SavedEvent[]>();
    for (const d of days) {
      const evts = getEventsForDay(d.lunarMonth, d.paksha, d.tithiNum);
      if (evts.length > 0) map.set(d.day, evts);
    }
    return map;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [days, savedEvents]);

  // Paksha periods for "Important Events" panel
  const pakshaPeriods = useMemo(() => {
    const periods: { label: string; startDay: number; endDay: number }[] = [];
    if (days.length === 0) return periods;
    let segStart = 0;
    let segPaksha = days[0].paksha;
    let segMonth = days[0].lunarMonth;
    for (let i = 1; i <= days.length; i++) {
      const d = days[i];
      if (!d || d.paksha !== segPaksha || d.lunarMonth !== segMonth) {
        periods.push({
          label: `${segMonth} ${segPaksha === 'shukla' ? 'Shukla' : 'Krishna'} Paksha`,
          startDay: days[segStart].day,
          endDay: days[i - 1].day,
        });
        if (d) { segStart = i; segPaksha = d.paksha; segMonth = d.lunarMonth; }
      }
    }
    return periods;
  }, [days]);

  // All saved events that appear in this month
  const monthSavedEvents = useMemo(() => {
    const lunarMonths = [...new Set(days.map(d => d.lunarMonth))];
    return getEventsForMonth(lunarMonths);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [days, savedEvents]);

  const selectedFestivals = selectedDay
    ? findFestivals(selectedDay.lunarMonth, selectedDay.paksha, selectedDay.tithiNum)
    : [];
  const selectedObservances = selectedDay
    ? getMonthlyObservances(selectedDay.tithiNum, selectedDay.paksha)
    : [];
  const selectedSamvat = selectedDay ? getSamvatDetails(selectedDay.date) : null;

  const isToday = (d: number) =>
    year === todayYear && month === todayMonth && d === todayDate;

  // Sankalpa line for selected day
  const sankalpa = selectedDay ? getSankalpa(selectedDay) : null;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Sankalpa / Panchang summary */}
      {sankalpa && (
        <View style={styles.sankalpaCard}>
          <Text style={styles.sankalpaText}>{sankalpa}</Text>
        </View>
      )}

      {/* Month navigation */}
      <View style={styles.monthNav}>
        <TouchableOpacity onPress={goPrev} style={styles.navBtn}>
          <Text style={styles.navBtnText}>‹</Text>
        </TouchableOpacity>
        <View style={styles.monthTitleBlock}>
          <Text style={styles.monthSamvatLine}>
            VS {year + 57}  ·  SS {year + 3076}
          </Text>
          <Text style={styles.monthTitle}>{MONTH_NAMES[month - 1]} {year}</Text>
        </View>
        <TouchableOpacity onPress={goNext} style={styles.navBtn}>
          <Text style={styles.navBtnText}>›</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.addEventBtn} onPress={() => openAddModal()} activeOpacity={0.7}>
          <Text style={styles.addEventBtnText}>＋</Text>
        </TouchableOpacity>
      </View>

      {/* Weekday headers */}
      <View style={styles.weekRow}>
        {WEEKDAYS.map((wd) => (
          <View key={wd} style={styles.weekCell}>
            <Text style={styles.weekText}>{wd}</Text>
          </View>
        ))}
      </View>

      {/* Calendar grid — detailed view */}
      <View style={[styles.grid, isMobile && styles.gridMobile]}>
        {Array.from({ length: firstDow }).map((_, i) => (
          <View key={`pad-${i}`} style={styles.dayCell} />
        ))}
        {days.map((d) => {
          const festivals = festivalMap.get(d.day) || [];
          const userEvts = savedEventMap.get(d.day) || [];
          const isMajor = festivals.some((f) => f.category === 'major');
          const tags = getObservanceTags(d.tithiNum, d.paksha, d.lunarMonth);
          const sel = selectedDay?.day === d.day;
          const todayMark = isToday(d.day);
          const hasUserEvt = userEvts.length > 0;

          // Determine cell accent
          let cellBg: string | undefined;
          let borderColor: string | undefined;
          if (hasUserEvt) { cellBg = '#FFF3E0'; borderColor = '#E65100'; }
          else if (isMajor) { cellBg = '#FFF0F0'; borderColor = '#FF6B6B'; }
          else if (festivals.length > 0) { cellBg = '#F0EDFF'; borderColor = '#6C5CE7'; }
          else if (tags.length > 0) {
            const t = tags[0];
            if (t.cls === 'ashtami') { cellBg = '#FFF8F0'; borderColor = '#E65100'; }
            else if (t.cls === 'ekadashi') { cellBg = '#F0FFF0'; borderColor = '#2E7D32'; }
            else if (t.cls === 'purnima') { cellBg = '#F0F7FF'; borderColor = '#1565C0'; }
            else if (t.cls === 'amavasya') { cellBg = '#F8F0FF'; borderColor = '#6A1B9A'; }
            else if (t.cls === 'chaturthi') { cellBg = '#FFFDF0'; borderColor = '#F57F17'; }
          }

          return (
            <Pressable
              key={d.day}
              style={({ pressed }) => [
                styles.dayCell,
                isMobile && styles.dayCellMobile,
                cellBg ? { backgroundColor: cellBg } : undefined,
                borderColor ? { borderLeftWidth: 3, borderLeftColor: borderColor } : undefined,
                todayMark && styles.dayCellToday,
                sel && styles.dayCellSelected,
                pressed && styles.dayCellPressed,
              ]}
              onPress={() => handleDayPress(d)}
              android_ripple={{ color: 'rgba(108,92,231,0.12)', borderless: false }}
            >
              {/* Day number + moon phase emoji */}
              <View style={styles.dayNumRow}>
                <Text style={[
                  styles.dayNum,
                  todayMark && styles.dayNumToday,
                  sel && styles.dayNumSelected,
                  !sel && !todayMark && (d.paksha === 'krishna' ? styles.dayNumKrishna : styles.dayNumShukla),
                ]}>
                  {d.day}
                </Text>
                <Text style={[styles.moonEmoji, sel && styles.moonEmojiSel]}>
                  {moonPhaseEmoji(d.tithiNum, d.paksha)}
                </Text>
              </View>
              
              {/* Two-tier layout: Big tithi + small month/paksha */}
              <Text style={[
                styles.tithiBig,
                isMobile && styles.tithiBigMobile,
                sel && styles.tithiBigSelected,
              ]} numberOfLines={1}>
                {tithiLabel(d.tithiNum, d.paksha)}
              </Text>
              <Text style={[
                styles.lunarSmall,
                sel && { color: 'rgba(255,255,255,0.75)' }
              ]} numberOfLines={1}>
                {isMobile ? d.lunarMonth.slice(0, 3) : d.lunarMonth} {d.paksha === 'shukla' ? (isMobile ? 'Shu' : 'Shukla') : (isMobile ? 'Kri' : 'Krishna')}
              </Text>
              
              {/* Kshaya / Adhika indicators */}
              {d.isAdhika && (
                <Text style={[styles.kshayaAdhikaTag, { backgroundColor: '#E3F2FD', color: '#1565C0' }, sel && { color: '#fff', backgroundColor: 'rgba(255,255,255,0.25)' }]}>
                  ⟲ Adhika
                </Text>
              )}
              {d.isKshaya && (
                <Text style={[styles.kshayaAdhikaTag, { backgroundColor: '#FFF3E0', color: '#E65100' }, sel && { color: '#fff', backgroundColor: 'rgba(255,255,255,0.25)' }]}>
                  ⟳ Kshaya
                </Text>
              )}
              {/* Observance tags — skip any that duplicate the tithi name already shown */}
              {(() => {
                const thiLabel = tithiLabel(d.tithiNum, d.paksha).toLowerCase();
                const uniqueTags = tags.filter(t => !t.label.toLowerCase().includes(thiLabel));
                return uniqueTags.length > 0 ? (
                  <Text style={[styles.tagLine, sel && { color: '#fff' }]} numberOfLines={1}>
                    {isMobile ? uniqueTags[0]?.label : uniqueTags.map(t => t.label).join(' ')}
                  </Text>
                ) : null;
              })()}
              {/* Festival name */}
              {festivals.length > 0 && (
                <Text style={[styles.festLine, sel && { color: '#fff' }]} numberOfLines={1}>
                  {isMobile ? festivals[0]?.name.split('(')[0].trim() : festivals.map(f => f.name.split('(')[0].trim()).join(', ')}
                </Text>
              )}
              {/* User saved events */}
              {userEvts.length > 0 && (
                <Text style={[styles.userEventLine, sel && { color: '#fff' }]} numberOfLines={1}>
                  {isMobile ? `${TYPE_EMOJI[userEvts[0].type]} ${userEvts[0].name}` : userEvts.map(e => `${TYPE_EMOJI[e.type]} ${e.name}`).join(' ')}
                </Text>
              )}
            </Pressable>
          );
        })}
      </View>


      {/* Legend Toggle & Display */}
      <TouchableOpacity style={[styles.legendToggleBtn, isMobile && styles.legendToggleBtnMobile]} onPress={() => setShowLegend(!showLegend)}>
        <Text style={styles.legendToggleText}>Guide: Calendar Legend {showLegend ? '▼' : '▶'}</Text>
      </TouchableOpacity>
      
      {showLegend && (
        <View style={[styles.legendRow, isMobile && styles.legendRowMobile]}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#FF6B6B' }]} />
            <Text style={styles.legendText}>Major Festival</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#6C5CE7' }]} />
            <Text style={styles.legendText}>Observance</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#E65100' }]} />
            <Text style={styles.legendText}>🔱 Ashtami</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#2E7D32' }]} />
            <Text style={styles.legendText}>🙏 Ekadashi</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#1565C0' }]} />
            <Text style={styles.legendText}>🌕 Purnima</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#6A1B9A' }]} />
            <Text style={styles.legendText}>🌑 Amavasya</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#1565C0' }]} />
            <Text style={styles.legendText}>S = Shukla Paksha (Bright)</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#6A1B9A' }]} />
            <Text style={styles.legendText}>K = Krishna Paksha (Dark)</Text>
          </View>
          <View style={styles.legendItem}>
            <Text style={styles.legendText}>⟲ Adhika = Day repeated · ⟳ Kshaya = Day skipped</Text>
          </View>
        </View>
      )}

      {/* Selected day detail */}
      {selectedDay && (
        <View style={[styles.detailCard, isMobile && { marginTop: 8, marginBottom: 8 }]}>
          <TouchableOpacity 
            style={styles.detailCardHeader} 
            onPress={() => isMobile && setDetailCardCollapsed(!detailCardCollapsed)}
            activeOpacity={isMobile ? 0.7 : 1}
          >
            <View style={{ flex: 1 }}>
              <Text style={styles.detailDate}>
                {MONTH_NAMES[month - 1]} {selectedDay.day}, {year}
              </Text>
              <Text style={styles.detailVaar}>
                {KASHMIRI_WEEKDAYS[selectedDay.date.getDay()]} • {WEEKDAYS[selectedDay.date.getDay()]}
              </Text>
            </View>
            {isMobile && (
              <Text style={styles.detailCardToggle}>
                {detailCardCollapsed ? '▶' : '▼'}
              </Text>
            )}
          </TouchableOpacity>

          {(!isMobile || !detailCardCollapsed) && (
            <>
              <Text style={styles.detailLunar}>
                {selectedDay.lunarMonth} • {selectedDay.paksha === 'shukla' ? 'Shukla' : 'Krishna'} Paksha • {tithiLabel(selectedDay.tithiNum, selectedDay.paksha)} ({selectedDay.tithiNum})
              </Text>
              {selectedDay.isAdhika && (
                <Text style={styles.detailSpecial}>⟲ Adhika Tithi — same tithi as the previous day (moon moved slowly)</Text>
              )}
              {selectedDay.isKshaya && (
                <Text style={styles.detailSpecial}>⟳ Kshaya Tithi — {selectedDay.skippedTithi?.replace(/\s*\(\d+\)$/, '')} was skipped (moon moved fast)</Text>
              )}

              {selectedFestivals.length > 0 && (
                <View style={styles.festivalSection}>
                  {selectedFestivals.map((f, i) => (
                    <View key={i} style={styles.festivalItem}>
                      <View style={styles.festivalHeader}>
                        <Text style={styles.festivalName}>{f.name}</Text>
                        <View
                          style={[
                            styles.categoryBadge,
                            f.category === 'major' && { backgroundColor: '#FF6B6B20' },
                            f.category === 'fasting' && { backgroundColor: '#F0940020' },
                          ]}
                        >
                          <Text
                            style={[
                              styles.categoryText,
                              f.category === 'major' && { color: '#FF6B6B' },
                              f.category === 'fasting' && { color: '#F09400' },
                            ]}
                          >
                            {f.category}
                          </Text>
                        </View>
                      </View>
                      {f.nameKashmiri && (
                        <Text style={styles.festivalKashmiri}>{f.nameKashmiri}</Text>
                      )}
                      <Text style={styles.festivalDesc}>{f.description}</Text>
                    </View>
                  ))}
                </View>
              )}

              {selectedObservances.length > 0 && (
                <View style={styles.observanceSection}>
                  <Text style={styles.observanceTitle}>Monthly Observances</Text>
                  {selectedObservances.map((o, i) => (
                    <Text key={i} style={styles.observanceText}>• {o}</Text>
                  ))}
                </View>
              )}

              {selectedFestivals.length === 0 && selectedObservances.length === 0 && (
                <Text style={styles.noFestival}>No special observances on this day.</Text>
              )}
            </>
          )}
        </View>
      )}

      {/* Month tile carousel: 1 past + current + 10 future */}
      <Text style={styles.tilesSectionTitle}>Browse Months</Text>
      <ScrollView
        ref={tileScrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tilesScroll}
        contentContainerStyle={styles.tilesContent}
      >
        {carousel.map((item, idx) => {
          const isCurrent = item.year === year && item.month === month;
          return (
            <TouchableOpacity
              key={idx}
              style={[styles.monthTile, isCurrent && styles.monthTileActive]}
              onPress={() => navigateToMonth(item.year, item.month)}
              activeOpacity={0.7}
            >
              <Text style={[styles.tileMonth, isCurrent && styles.tileMonthActive]}>
                {MONTH_SHORT[item.month - 1]}
              </Text>
              <Text style={[styles.tileYear, isCurrent && styles.tileYearActive]}>
                {item.year}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Action toolbar */}
      {Platform.OS === 'web' && (
        <View style={styles.toolbarRow}>
          <TouchableOpacity
            style={styles.toolbarBtn}
            onPress={() => exportCalendarCSV(year, 1)}
          >
            <Text style={styles.toolbarIcon}>📥</Text>
            <Text style={styles.toolbarLabel}>Export CSV</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.toolbarBtn}
            onPress={() => printCalendar(year, month, 1)}
          >
            <Text style={styles.toolbarIcon}>🖨</Text>
            <Text style={styles.toolbarLabel}>Print Month</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.toolbarBtn}
            onPress={() => printCalendar(year, 1, 12)}
          >
            <Text style={styles.toolbarIcon}>📄</Text>
            <Text style={styles.toolbarLabel}>Print Year</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.toolbarBtn}
            onPress={() => navigation.navigate('CalendarExplainer' as any)}
          >
            <Text style={styles.toolbarIcon}>🎓</Text>
            <Text style={styles.toolbarLabel}>How It Works</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* ── Important Events for this month ── */}
      <View style={styles.importantSection}>
        <Text style={styles.importantTitle}>Important Events for {MONTH_NAMES[month - 1]} {year}</Text>

        {/* Paksha periods */}
        {pakshaPeriods.map((p, i) => (
          <View key={i} style={[styles.importantCard, p.label.includes('Shukla') ? styles.importantCardShukla : styles.importantCardKrishna]}>
            <Text style={styles.importantCardTitle}>{p.label}</Text>
            <Text style={styles.importantCardDates}>
              {MONTH_NAMES[month - 1].slice(0, 3)} {p.startDay}  —  {MONTH_NAMES[month - 1].slice(0, 3)} {p.endDay}
            </Text>
          </View>
        ))}

        {/* User saved events that fall this month */}
        {monthSavedEvents.length > 0 && (
          <>
            <Text style={styles.importantSubtitle}>Your Events</Text>
            {monthSavedEvents.map(evt => {
              // Find which day this event falls on
              const day = days.find(d =>
                d.lunarMonth === evt.lunarMonth && d.paksha === evt.paksha && d.tithiNum === evt.tithiNum,
              );
              return (
                <View key={evt.id} style={[styles.importantCard, styles.importantCardUser]}>
                  <View style={styles.importantCardRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.importantCardTitle}>{TYPE_EMOJI[evt.type]} {evt.name}</Text>
                      <Text style={styles.importantCardDates}>
                        {day ? `${MONTH_NAMES[month - 1].slice(0, 3)} ${day.day}` : evt.lunarMonth}
                        {'  ·  '}{evt.lunarMonth} {evt.paksha === 'shukla' ? 'Shukla' : 'Krishna'} {evt.tithiNum}
                      </Text>
                    </View>
                    <TouchableOpacity onPress={() => handleDeleteEvent(evt.id)} style={styles.deleteBtn}>
                      <Text style={styles.deleteBtnText}>✕</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </>
        )}

        {/* Add Event prompt */}
        <TouchableOpacity style={styles.addEventCard} onPress={() => openAddModal(selectedDay ?? undefined)} activeOpacity={0.7}>
          <Text style={styles.addEventCardText}>＋ Add Birthday / Anniversary / Custom Event</Text>
        </TouchableOpacity>
      </View>

      {/* ── Day Zoom Modal (Mobile) ── */}
      {zoomDay && isMobile && (
        <Modal visible transparent animationType="fade" onRequestClose={closeZoomModal}>
          <TouchableOpacity style={styles.zoomOverlay} activeOpacity={1} onPress={closeZoomModal}>
            <TouchableOpacity style={styles.zoomSheet} activeOpacity={1} onPress={e => e.stopPropagation()}>
              <View style={styles.zoomHeader}>
                <View>
                  <Text style={styles.zoomDateTop}>{MONTH_NAMES[month - 1]} {zoomDay.day}, {year} • {WEEKDAYS[zoomDay.date.getDay()]}</Text>
                  <Text style={styles.zoomLunarSummary}>
                    {zoomDay.lunarMonth} • {zoomDay.paksha === 'shukla' ? 'Shukla Paksha' : 'Krishna Paksha'} • {tithiLabel(zoomDay.tithiNum, zoomDay.paksha)} ({zoomDay.tithiNum})
                  </Text>
                </View>
                <TouchableOpacity onPress={closeZoomModal} style={styles.zoomCloseBtn}>
                  <Text style={styles.zoomClose}>Close ✕</Text>
                </TouchableOpacity>
              </View>
              
              <ScrollView style={styles.zoomContent} showsVerticalScrollIndicator={true}>
                <View style={styles.zoomSection}>
                  <Text style={styles.zoomSectionTitle}>Lunar Details</Text>
                  <Text style={styles.zoomText}>
                    <Text style={styles.zoomLabel}>Paksha: </Text>
                    {zoomDay.paksha === 'shukla' ? '🌒 Shukla (Bright)' : '🌘 Krishna (Dark)'}
                  </Text>
                  <Text style={styles.zoomText}>
                    <Text style={styles.zoomLabel}>Tithi: </Text>
                    {tithiLabel(zoomDay.tithiNum, zoomDay.paksha)}
                  </Text>
                  <Text style={styles.zoomText}>
                    <Text style={styles.zoomLabel}>Vikrami Samvat: </Text>
                    {getSamvatDetails(zoomDay.date).vikramSamvat}
                  </Text>
                  <Text style={styles.zoomText}>
                    <Text style={styles.zoomLabel}>Saptarishi Samvat: </Text>
                    {getSamvatDetails(zoomDay.date).saptarishiSamvat}
                  </Text>
                  {zoomDay.isAdhika && <Text style={[styles.zoomText, { color: '#1565C0' }]}>⟲ Adhika Tithi</Text>}
                  {zoomDay.isKshaya && <Text style={[styles.zoomText, { color: '#E65100' }]}>⟳ Kshaya Tithi</Text>}
                </View>

                {getObservanceTags(zoomDay.tithiNum, zoomDay.paksha, zoomDay.lunarMonth).length > 0 && (
                  <View style={styles.zoomSection}>
                    <Text style={styles.zoomSectionTitle}>Observances</Text>
                    {getObservanceTags(zoomDay.tithiNum, zoomDay.paksha, zoomDay.lunarMonth).map((tag, i) => (
                      <Text key={i} style={styles.zoomText}>• {tag.label}</Text>
                    ))}
                  </View>
                )}

                {(() => {
                  const festivals = findFestivals(zoomDay.lunarMonth, zoomDay.paksha, zoomDay.tithiNum);
                  if (festivals.length > 0) {
                    return (
                      <View style={styles.zoomSection}>
                        <Text style={styles.zoomSectionTitle}>Festivals</Text>
                        {festivals.map((f, i) => (
                          <View key={i} style={styles.zoomFestival}>
                            <Text style={[styles.zoomText, { fontWeight: '700', fontSize: 14 }]}>{f.name}</Text>
                            {f.nameKashmiri && <Text style={styles.zoomText}>🔤 {f.nameKashmiri}</Text>}
                            <Text style={styles.zoomText}>{f.description}</Text>
                          </View>
                        ))}
                      </View>
                    );
                  }
                  return null;
                })()}

                {(() => {
                  const userEvts = getEventsForDay(zoomDay.lunarMonth, zoomDay.paksha, zoomDay.tithiNum);
                  if (userEvts.length > 0) {
                    return (
                      <View style={styles.zoomSection}>
                        <Text style={styles.zoomSectionTitle}>Your Events</Text>
                        {userEvts.map((evt) => (
                          <Text key={evt.id} style={styles.zoomText}>
                            {TYPE_EMOJI[evt.type]} {evt.name}
                          </Text>
                        ))}
                      </View>
                    );
                  }
                  return null;
                })()}

                <TouchableOpacity style={styles.zoomAddBtn} onPress={() => { closeZoomModal(); openAddModal(zoomDay); }}>
                  <Text style={styles.zoomAddBtnText}>＋ Add Event</Text>
                </TouchableOpacity>
              </ScrollView>
            </TouchableOpacity>
          </TouchableOpacity>
        </Modal>
      )}

      {/* ── Add Event Modal ── */}
      <Modal visible={showAddModal} transparent animationType="slide" onRequestClose={() => { blurFocusedElement(); setShowAddModal(false); }}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => { blurFocusedElement(); setShowAddModal(false); }}>
          <TouchableOpacity style={styles.modalSheet} activeOpacity={1} onPress={e => e.stopPropagation()}>
            <Text style={styles.modalTitle}>Add Personal Event</Text>
            <Text style={styles.modalHint}>This event is saved only for the currently active profile.</Text>

            <Text style={styles.modalLabel}>Event Name *</Text>
            <TextInput
              style={styles.modalInput}
              value={newName}
              onChangeText={setNewName}
              placeholder="e.g. Mummi jis Birthday"
              placeholderTextColor="#AAA"
              autoFocus
            />

            <Text style={styles.modalLabel}>Type</Text>
            <View style={styles.modalChipRow}>
              {EVENT_TYPES.map(et => (
                <TouchableOpacity
                  key={et.type}
                  style={[styles.modalChip, newType === et.type && styles.modalChipActive]}
                  onPress={() => setNewType(et.type)}
                >
                  <Text style={[styles.modalChipText, newType === et.type && styles.modalChipTextActive]}>{et.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.modalLabel}>Lunar Month</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 10 }}>
              <View style={styles.modalChipRow}>
                {LUNAR_MONTHS_LIST.map(lm => (
                  <TouchableOpacity
                    key={lm}
                    style={[styles.modalChip, newLunarMonth === lm && styles.modalChipActive]}
                    onPress={() => setNewLunarMonth(lm)}
                  >
                    <Text style={[styles.modalChipText, newLunarMonth === lm && styles.modalChipTextActive]}>{lm}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            <Text style={styles.modalLabel}>Paksha</Text>
            <View style={styles.modalChipRow}>
              {(['shukla', 'krishna'] as const).map(p => (
                <TouchableOpacity
                  key={p}
                  style={[styles.modalChip, newPaksha === p && styles.modalChipActive]}
                  onPress={() => setNewPaksha(p)}
                >
                  <Text style={[styles.modalChipText, newPaksha === p && styles.modalChipTextActive]}>
                    {p === 'shukla' ? '🌒 Shukla (Bright)' : '🌘 Krishna (Dark)'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.modalLabel}>Tithi (lunar day 1–15)</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
              <View style={styles.modalChipRow}>
                {TITHI_NUMS.map(n => (
                  <TouchableOpacity
                    key={n}
                    style={[styles.modalChip, styles.modalChipSmall, newTithi === n && styles.modalChipActive]}
                    onPress={() => setNewTithi(n)}
                  >
                    <Text style={[styles.modalChipText, newTithi === n && styles.modalChipTextActive]}>{n}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            <View style={styles.modalBtnRow}>
              <TouchableOpacity style={styles.modalCancelBtn} onPress={() => { blurFocusedElement(); setShowAddModal(false); }}>
                <Text style={styles.modalCancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalSaveBtn, !newName.trim() && { opacity: 0.4 }]}
                onPress={handleSaveEvent}
                disabled={!newName.trim()}
              >
                <Text style={styles.modalSaveBtnText}>Save Event</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* Back to Home button */}
      <TouchableOpacity
        style={styles.backHomeBtn}
        onPress={() => navigation.navigate('Home' as any)}
        activeOpacity={0.7}
      >
        <Text style={styles.backHomeBtnText}>← Back to Home</Text>
      </TouchableOpacity>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F8' },
  content: { padding: 16 },

  // Sankalpa banner
  sankalpaCard: {
    backgroundColor: '#FFF9F0',
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E8DCC8',
  },
  sankalpaText: {
    fontSize: 13,
    color: '#9A7B4F',
    fontStyle: 'italic',
    lineHeight: 20,
    textAlign: 'center',
  },

  // Month navigation
  monthNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  navBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EAEAEF',
  },
  navBtnText: { fontSize: 22, color: '#6C5CE7', fontWeight: '600' },
  monthTitleBlock: { flex: 1, alignItems: 'center' },
  monthSamvatLine: { fontSize: 10, fontWeight: '600', color: '#8C7350', letterSpacing: 0.3 },
  monthTitle: { fontSize: 17, fontWeight: '700', color: '#2D2D3A', marginTop: 1 },

  // Weekday header
  weekRow: { flexDirection: 'row', marginBottom: 4 },
  weekCell: { width: '14.28%' as any, alignItems: 'center', paddingVertical: 4 },
  weekText: { fontSize: 11, fontWeight: '600', color: '#999' },

  // Grid
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  gridMobile: { marginTop: 4 },
  dayCell: {
    width: '14.28%' as any,
    minHeight: 70,
    paddingVertical: 3,
    paddingHorizontal: 2,
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    borderRadius: 6,
    marginBottom: 2,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#EAEAEF',
  },
  dayCellMobile: {
    minHeight: 96,
    paddingVertical: 6,
    paddingHorizontal: 4,
    borderRadius: 10,
    marginBottom: 5,
  },
  dayCellToday: {
    backgroundColor: '#6C5CE720',
    borderColor: '#6C5CE7',
  },
  dayCellPressed: {
    transform: [{ scale: 0.96 }],
    opacity: 0.9,
  },
  dayCellSelected: {
    backgroundColor: '#6C5CE7',
    borderColor: '#6C5CE7',
    shadowColor: '#6C5CE7',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
    elevation: 3,
  },
  dayNumRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  dayNum: { fontSize: 16, fontWeight: '700', color: '#2D2D3A' },
  dayNumToday: { color: '#6C5CE7' },
  dayNumSelected: { color: '#fff' },
  dayNumShukla: { color: '#1565C0' },
  dayNumKrishna: { color: '#4A148C' },
  moonEmoji: { fontSize: 13, marginLeft: 2, lineHeight: 16 },
  moonEmojiSel: { opacity: 0.9 },
  tithiBig: { fontSize: 13, fontWeight: '800', color: '#2D2D3A', marginTop: 4, lineHeight: 16 },
  tithiBigMobile: { fontSize: 10, fontWeight: '700', lineHeight: 13 },
  tithiBigSelected: { color: '#fff' },
  lunarSmall: { fontSize: 8, color: '#8D8D95', marginTop: 2, fontWeight: '600', lineHeight: 10 },
  lunarLine: { fontSize: 7.5, color: '#666', marginTop: 1, lineHeight: 10 },
  tagLine: { fontSize: 8, fontWeight: '600', color: '#E65100', marginTop: 2 },
  festLine: { fontSize: 8, fontWeight: '700', color: '#6C5CE7', marginTop: 2 },
  kshayaAdhikaTag: {
    fontSize: 7,
    fontWeight: '700',
    paddingHorizontal: 3,
    paddingVertical: 1,
    borderRadius: 3,
    marginTop: 1,
    alignSelf: 'flex-start' as const,
    overflow: 'hidden' as const,
  },

  // Legend
  legendRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
    marginBottom: 8,
    gap: 12,
  },
  legendRowMobile: {
    gap: 8,
    marginTop: 10,
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: 11, color: '#888' },
  legendToggleBtn: {
    backgroundColor: '#F0EDFF',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 9,
    marginTop: 10,
    marginBottom: 6,
    alignItems: 'center',
  },
  legendToggleBtnMobile: {
    marginTop: 12,
  },
  legendToggleText: { fontSize: 13, fontWeight: '600', color: '#6C5CE7' },

  // Mobile quick summary strip
  mobileFocusStrip: {
    backgroundColor: '#EEF0FF',
    borderWidth: 1,
    borderColor: '#D7DBFF',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginTop: 8,
    marginBottom: 2,
  },
  mobileFocusTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2D2D3A',
  },
  mobileFocusSubtitle: {
    marginTop: 3,
    fontSize: 12,
    fontWeight: '600',
    color: '#4B56A8',
  },

  // Detail card
  detailCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#EAEAEF',
  },
  detailCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailCardToggle: { fontSize: 14, color: '#6C5CE7', fontWeight: '700' },
  detailDate: { fontSize: 16, fontWeight: '600', color: '#2D2D3A' },
  detailVaar: { fontSize: 12, color: '#8C7350', marginTop: 2, fontWeight: '500' },
  detailLunar: { fontSize: 13, color: '#6C5CE7', marginTop: 8, fontWeight: '500' },
  samvatRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
    marginBottom: 2,
  },
  samvatChip: {
    flex: 1,
    backgroundColor: '#F7F3EC',
    borderWidth: 1,
    borderColor: '#E7DDCF',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  samvatLabel: { fontSize: 11, fontWeight: '600', color: '#8C7350' },
  samvatValue: { fontSize: 15, fontWeight: '800', color: '#2D2D3A', marginTop: 2 },
  detailHint: { fontSize: 12, color: '#7D6B53', marginTop: 8, lineHeight: 18 },
  detailSpecial: { fontSize: 12, color: '#E65100', marginTop: 4, fontStyle: 'italic' as const },

  // Festival in detail
  festivalSection: { marginTop: 12 },
  festivalItem: {
    backgroundColor: '#F9F8FF',
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
  },
  festivalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  festivalName: { fontSize: 15, fontWeight: '600', color: '#2D2D3A', flex: 1 },
  categoryBadge: {
    backgroundColor: '#6C5CE720',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 8,
  },
  categoryText: { fontSize: 10, fontWeight: '600', color: '#6C5CE7', textTransform: 'uppercase' },
  festivalKashmiri: { fontSize: 14, color: '#9A7B4F', marginTop: 4 },
  festivalDesc: { fontSize: 13, color: '#666', lineHeight: 20, marginTop: 6 },

  // Observances
  observanceSection: { marginTop: 12 },
  observanceTitle: { fontSize: 13, fontWeight: '600', color: '#2D2D3A', marginBottom: 4 },
  observanceText: { fontSize: 13, color: '#666', marginBottom: 2 },

  noFestival: { fontSize: 13, color: '#999', marginTop: 8 },

  // Month tiles carousel
  tilesSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2D2D3A',
    marginTop: 18,
    marginBottom: 8,
  },
  tilesScroll: { marginBottom: 4 },
  tilesContent: { gap: 8, paddingRight: 8 },
  monthTile: {
    width: 60,
    height: 56,
    borderRadius: 10,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#EAEAEF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  monthTileActive: {
    backgroundColor: '#6C5CE7',
    borderColor: '#6C5CE7',
  },
  tileMonth: { fontSize: 13, fontWeight: '600', color: '#2D2D3A' },
  tileMonthActive: { color: '#fff' },
  tileYear: { fontSize: 10, color: '#999', marginTop: 1 },
  tileYearActive: { color: 'rgba(255,255,255,0.7)' },

  // Action toolbar
  toolbarRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
    marginBottom: 4,
  },
  toolbarBtn: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#EAEAEF',
  },
  toolbarIcon: { fontSize: 18 },
  toolbarLabel: { fontSize: 10, color: '#6C5CE7', fontWeight: '600', marginTop: 3 },
  backHomeBtn: {
    backgroundColor: '#F0EDFF',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 16,
  },
  backHomeBtnText: { fontSize: 15, fontWeight: '600', color: '#6C5CE7' },

  // Month nav add button
  addEventBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: '#6C5CE7', justifyContent: 'center', alignItems: 'center',
    marginLeft: 8,
  },
  addEventBtnText: { color: '#fff', fontSize: 22, lineHeight: 26, fontWeight: '300' },

  // User event line in cell
  userEventLine: { fontSize: 7, fontWeight: '700', color: '#E65100', marginTop: 1 },

  // Important Events panel
  importantSection: {
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#EAEAEF',
  },
  importantTitle: { fontSize: 16, fontWeight: '700', color: '#2D2D3A', marginBottom: 12 },
  importantSubtitle: { fontSize: 13, fontWeight: '600', color: '#888', marginTop: 12, marginBottom: 6 },
  importantCard: {
    borderRadius: 12, padding: 14, marginBottom: 8,
  },
  importantCardRow: { flexDirection: 'row', alignItems: 'center' },
  importantCardShukla: { backgroundColor: '#1565C0' },
  importantCardKrishna: { backgroundColor: '#4A148C' },
  importantCardUser: { backgroundColor: '#C62828' },
  importantCardTitle: { fontSize: 15, fontWeight: '700', color: '#fff' },
  importantCardDates: { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 3 },
  deleteBtn: { padding: 6, marginLeft: 8 },
  deleteBtnText: { color: 'rgba(255,255,255,0.7)', fontSize: 16, fontWeight: '700' },
  addEventCard: {
    borderRadius: 12, padding: 14, marginTop: 2,
    backgroundColor: '#F0EDFF',
    borderWidth: 1, borderColor: '#6C5CE7',
    borderStyle: 'dashed' as const,
    alignItems: 'center',
  },
  addEventCardText: { fontSize: 14, fontWeight: '600', color: '#6C5CE7' },

  // Zoom Modal
  zoomOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center', alignItems: 'center',
  },
  zoomSheet: {
    backgroundColor: '#fff', borderRadius: 20,
    width: '90%', maxHeight: '80%',
    padding: 0, overflow: 'hidden',
  },
  zoomHeader: {
    backgroundColor: '#6C5CE7', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 16,
  },
  zoomDateTop: { fontSize: 13, fontWeight: '700', color: 'rgba(255,255,255,0.95)' },
  zoomLunarSummary: { marginTop: 4, fontSize: 15, fontWeight: '800', color: '#fff', lineHeight: 20 },
  zoomCloseBtn: {
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.28)',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  zoomClose: { fontSize: 13, color: '#fff', fontWeight: '700' },
  zoomContent: { padding: 20 },
  zoomSection: { marginBottom: 16 },
  zoomSectionTitle: { fontSize: 14, fontWeight: '700', color: '#2D2D3A', marginBottom: 8 },
  zoomText: { fontSize: 14, color: '#555', lineHeight: 20, marginBottom: 4 },
  zoomLabel: { fontWeight: '700', color: '#2D2D3A' },
  zoomFestival: { marginBottom: 10, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: '#EEE' },
  zoomAddBtn: {
    backgroundColor: '#6C5CE7', borderRadius: 12, paddingVertical: 14, marginTop: 12,
    alignItems: 'center',
  },
  zoomAddBtnText: { fontSize: 15, fontWeight: '700', color: '#fff' },

  // Modal
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20,
    padding: 24, paddingBottom: 40,
    maxHeight: '85%' as any,
    ...Platform.select({ web: { maxWidth: 560, alignSelf: 'center' as const, width: '100%' as any, borderRadius: 20, marginBottom: 40 } as any }),
  },
  modalTitle: { fontSize: 20, fontWeight: '700', color: '#2D2D3A', marginBottom: 16 },
  modalHint: { fontSize: 12, color: '#777', marginTop: -8, marginBottom: 12, lineHeight: 17 },
  modalLabel: { fontSize: 13, fontWeight: '600', color: '#555', marginBottom: 6, marginTop: 8 },
  modalInput: {
    borderWidth: 1, borderColor: '#EAEAEF', borderRadius: 10,
    padding: 12, fontSize: 15, color: '#2D2D3A', backgroundColor: '#FAFAFA',
    marginBottom: 4,
  },
  modalChipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  modalChip: {
    backgroundColor: '#F5F5F8', borderRadius: 20,
    paddingHorizontal: 14, paddingVertical: 8,
    borderWidth: 1, borderColor: '#EAEAEF',
  },
  modalChipSmall: { paddingHorizontal: 10, paddingVertical: 6 },
  modalChipActive: { backgroundColor: '#6C5CE7', borderColor: '#6C5CE7' },
  modalChipText: { fontSize: 13, fontWeight: '600', color: '#555' },
  modalChipTextActive: { color: '#fff' },
  modalBtnRow: { flexDirection: 'row', gap: 12, marginTop: 8 },
  modalCancelBtn: {
    flex: 1, borderRadius: 12, paddingVertical: 14, alignItems: 'center',
    backgroundColor: '#F5F5F8', borderWidth: 1, borderColor: '#EAEAEF',
  },
  modalCancelBtnText: { fontSize: 15, fontWeight: '600', color: '#888' },
  modalSaveBtn: {
    flex: 2, borderRadius: 12, paddingVertical: 14, alignItems: 'center',
    backgroundColor: '#6C5CE7',
  },
  modalSaveBtnText: { fontSize: 15, fontWeight: '700', color: '#fff' },
});
