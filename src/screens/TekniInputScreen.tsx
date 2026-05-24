/**
 * TekniInputScreen — Form to collect birth details for Tekni generation.
 * Follows the same pattern as MuhuratInputScreen.
 */

import React, { useState, useCallback, useEffect } from 'react';
import {
  ActivityIndicator, Alert, Platform, ScrollView, StyleSheet,
  Text, TextInput, TouchableOpacity, View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { CITIES } from '../data/cities';
import { getSavedTekni, hydrateSavedTeknis, refreshSavedTekniProfileScope } from '../services/SavedTekniService';

type Props = NativeStackScreenProps<RootStackParamList, 'TekniInput'>;

const COMMON_GOTRAS = [
  'Kashyap', 'Bharadwaj', 'Vashishtha', 'Kaushika',
  'Dhananjaya', 'Dattatreya', 'Atri',
];

function DateFields({ y, m, d, onY, onM, onD }: {
  y: string; m: string; d: string;
  onY: (v: string) => void; onM: (v: string) => void; onD: (v: string) => void;
}) {
  return (
    <View style={st.dateRow}>
      <TextInput style={[st.dateInput, { width: 60 }]} value={y} onChangeText={v => onY(v.replace(/[^0-9]/g, '').slice(0, 4))} placeholder="YYYY" placeholderTextColor="#B8A896" keyboardType="number-pad" maxLength={4} />
      <Text style={st.dateSep}>/</Text>
      <TextInput style={[st.dateInput, { width: 40 }]} value={m} onChangeText={v => onM(v.replace(/[^0-9]/g, '').slice(0, 2))} placeholder="MM" placeholderTextColor="#B8A896" keyboardType="number-pad" maxLength={2} />
      <Text style={st.dateSep}>/</Text>
      <TextInput style={[st.dateInput, { width: 40 }]} value={d} onChangeText={v => onD(v.replace(/[^0-9]/g, '').slice(0, 2))} placeholder="DD" placeholderTextColor="#B8A896" keyboardType="number-pad" maxLength={2} />
    </View>
  );
}

function TimeFields({ h, min, onH, onMin }: {
  h: string; min: string;
  onH: (v: string) => void; onMin: (v: string) => void;
}) {
  return (
    <View style={st.dateRow}>
      <TextInput style={[st.dateInput, { width: 40 }]} value={h} onChangeText={v => onH(v.replace(/[^0-9]/g, '').slice(0, 2))} placeholder="HH" placeholderTextColor="#B8A896" keyboardType="number-pad" maxLength={2} />
      <Text style={st.dateSep}>:</Text>
      <TextInput style={[st.dateInput, { width: 40 }]} value={min} onChangeText={v => onMin(v.replace(/[^0-9]/g, '').slice(0, 2))} placeholder="MM" placeholderTextColor="#B8A896" keyboardType="number-pad" maxLength={2} />
      <Text style={st.timeHint}>(24hr)</Text>
    </View>
  );
}

export default function TekniInputScreen({ navigation, route }: Props) {
  // Person details
  const [name, setName] = useState('');
  const [fatherName, setFatherName] = useState('');
  const [motherName, setMotherName] = useState('');
  const [gotra, setGotra] = useState('');
  const [ishtdevi, setIshtdevi] = useState('');
  const [gender, setGender] = useState<'male' | 'female'>('male');

  // Date of birth
  const [dobY, setDobY] = useState('');
  const [dobM, setDobM] = useState('');
  const [dobD, setDobD] = useState('');

  // Time of birth
  const [tobH, setTobH] = useState('');
  const [tobMin, setTobMin] = useState('');

  // Place of birth
  const [selectedCity, setSelectedCity] = useState(0);
  const [showAllCities, setShowAllCities] = useState(false);
  const [isOtherCity, setIsOtherCity] = useState(false);
  const [otherCityName, setOtherCityName] = useState('');
  const [otherLat, setOtherLat] = useState('');
  const [otherLng, setOtherLng] = useState('');
  const [geocoding, setGeocoding] = useState(false);

  // Rashi input state
  const [showRashiInput, setShowRashiInput] = useState(false);
  const [userLagna, setUserLagna] = useState(0); // 0 = auto
  const [userMoon, setUserMoon] = useState(0);
  const [savedTekniName, setSavedTekniName] = useState('');

  const RASHIS = [
    'Mesha', 'Vrishabha', 'Mithuna', 'Karka', 'Simha', 'Kanya',
    'Tula', 'Vrischika', 'Dhanu', 'Makara', 'Kumbha', 'Meena',
  ];

  const isValid = name.trim().length > 0 && dobY.length === 4 && dobM.length >= 1 && dobD.length >= 1 && tobH.length >= 1 && tobMin.length >= 1
    && (!isOtherCity || (otherCityName.trim().length > 0 && otherLat.length > 0 && otherLng.length > 0));

  useEffect(() => {
    async function loadSavedTekni() {
      if (!route.params?.savedTekniId) return;
      await hydrateSavedTeknis();
      await refreshSavedTekniProfileScope();
      const record = getSavedTekni(route.params.savedTekniId);
      if (!record) return;

      const birth = record.birth;
      setSavedTekniName(record.name);
      setName(birth.name);
      setFatherName(birth.fatherName);
      setMotherName(birth.motherName);
      setGotra(birth.gotra);
      setIshtdevi(birth.ishtdevi);
      setGender(birth.gender);
      setDobY(String(birth.year));
      setDobM(String(birth.month));
      setDobD(String(birth.day));
      setTobH(String(birth.hour));
      setTobMin(String(birth.minute));

      const matchingCityIndex = CITIES.findIndex(
        (city) => city.label === birth.placeName && city.lat === birth.latitude && city.lng === birth.longitude,
      );
      if (matchingCityIndex >= 0) {
        setSelectedCity(matchingCityIndex);
        setIsOtherCity(false);
      } else {
        setIsOtherCity(true);
        setOtherCityName(birth.placeName);
        setOtherLat(String(birth.latitude));
        setOtherLng(String(birth.longitude));
      }
    }

    loadSavedTekni().catch(() => {});
  }, [route.params?.savedTekniId]);

  // Geocode a place name using OpenStreetMap Nominatim (free, no API key)
  const geocodePlace = useCallback(async (place: string) => {
    if (!place.trim()) return;
    setGeocoding(true);
    try {
      const q = encodeURIComponent(place.trim());
      const resp = await fetch(`https://nominatim.openstreetmap.org/search?q=${q}&format=json&limit=1`, {
        headers: { 'User-Agent': 'Janthari-App/1.0' },
      });
      const data = await resp.json();
      if (data && data.length > 0) {
        setOtherLat(parseFloat(data[0].lat).toFixed(3));
        setOtherLng(parseFloat(data[0].lon).toFixed(3));
      } else {
        Alert.alert('Not Found', 'Could not find coordinates. Please enter Lat/Lng manually.');
      }
    } catch {
      Alert.alert('Error', 'Geocoding failed. Please enter Lat/Lng manually.');
    } finally {
      setGeocoding(false);
    }
  }, []);

  const handleGenerate = () => {
    let placeName: string, latitude: number, longitude: number;
    if (isOtherCity) {
      placeName = otherCityName.trim();
      latitude = parseFloat(otherLat);
      longitude = parseFloat(otherLng);
    } else {
      const city = CITIES[selectedCity];
      placeName = city.label;
      latitude = city.lat;
      longitude = city.lng;
    }
    navigation.navigate('TekniLoading', {
      name: name.trim(),
      fatherName: fatherName.trim(),
      motherName: motherName.trim(),
      gotra: gotra.trim(),
      ishtdevi: ishtdevi.trim(),
      gender,
      year: parseInt(dobY),
      month: parseInt(dobM),
      day: parseInt(dobD),
      hour: parseInt(tobH),
      minute: parseInt(tobMin),
      placeName,
      latitude,
      longitude,
      ...(userLagna > 0 ? { userLagnaRashi: userLagna } : {}),
      ...(userMoon > 0 ? { userMoonRashi: userMoon } : {}),
      ...(route.params?.savedTekniId ? { savedTekniId: route.params.savedTekniId } : {}),
      suggestedSaveName: savedTekniName || name.trim(),
    });
  };

  const displayCities = showAllCities ? CITIES : CITIES.slice(0, 6);

  return (
    <ScrollView style={st.scroll} contentContainerStyle={st.scrollContent}>
      <TouchableOpacity style={st.libraryBtn} onPress={() => navigation.navigate('TekniLibrary')}>
        <Text style={st.libraryBtnText}>📚 My Teknis</Text>
      </TouchableOpacity>

      {route.params?.savedTekniId && !!savedTekniName && (
        <View style={st.editingCard}>
          <Text style={st.editingTitle}>Editing saved Tekni</Text>
          <Text style={st.editingName}>{savedTekniName}</Text>
        </View>
      )}

      {/* ── Section: Personal Details ── */}
      <View style={st.section}>
        <Text style={st.sectionTitle}>👤  Personal Details / व्यक्तिगत विवरण</Text>
        <View style={st.field}>
          <Text style={st.label}>Full Name *</Text>
          <TextInput style={st.input} value={name} onChangeText={setName} placeholder="e.g. RG" placeholderTextColor="#B8A896" />
        </View>
        <View style={st.row}>
          <View style={[st.field, { flex: 1 }]}>
            <Text style={st.label}>Father's Name / पिता</Text>
            <TextInput style={st.input} value={fatherName} onChangeText={setFatherName} placeholder="Father's name" placeholderTextColor="#B8A896" />
          </View>
          <View style={{ width: 12 }} />
          <View style={[st.field, { flex: 1 }]}>
            <Text style={st.label}>Mother's Name / माता</Text>
            <TextInput style={st.input} value={motherName} onChangeText={setMotherName} placeholder="Mother's name" placeholderTextColor="#B8A896" />
          </View>
        </View>
        <View style={st.row}>
          <View style={[st.field, { flex: 1 }]}>
            <Text style={st.label}>Gotra / गोत्र</Text>
            <View style={st.chipRow}>
              {COMMON_GOTRAS.map(g => (
                <TouchableOpacity key={g} style={[st.chip, gotra === g && st.chipActive]} onPress={() => setGotra(g)}>
                  <Text style={[st.chipText, gotra === g && st.chipTextActive]}>{g}</Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity
                style={[st.chip, !COMMON_GOTRAS.includes(gotra) && gotra !== '' && st.chipActive]}
                onPress={() => setGotra('')}
              >
                <Text style={[st.chipText, !COMMON_GOTRAS.includes(gotra) && gotra !== '' && st.chipTextActive]}>Other…</Text>
              </TouchableOpacity>
            </View>
            {!COMMON_GOTRAS.includes(gotra) && (
              <TextInput
                style={[st.input, { marginTop: 6 }]}
                value={COMMON_GOTRAS.includes(gotra) ? '' : gotra}
                onChangeText={setGotra}
                placeholder="Enter gotra pravara"
                placeholderTextColor="#B8A896"
              />
            )}
          </View>
          <View style={{ width: 12 }} />
          <View style={[st.field, { flex: 1 }]}>
            <Text style={st.label}>Ishtdevi / इष्टदेवी</Text>
            <TextInput style={st.input} value={ishtdevi} onChangeText={setIshtdevi} placeholder="e.g. Ragnya Devi" placeholderTextColor="#B8A896" />
          </View>
        </View>
        <View style={st.field}>
          <Text style={st.label}>Gender</Text>
          <View style={st.chipRow}>
            {(['male', 'female'] as const).map(g => (
              <TouchableOpacity key={g} style={[st.chip, gender === g && st.chipActive]} onPress={() => setGender(g)}>
                <Text style={[st.chipText, gender === g && st.chipTextActive]}>{g === 'male' ? '♂ Male / पुरुष' : '♀ Female / स्त्री'}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      {/* ── Section: Birth Date & Time ── */}
      <View style={st.section}>
        <Text style={st.sectionTitle}>📅  Date & Time of Birth</Text>
        <View style={st.field}>
          <Text style={st.label}>Date of Birth * (YYYY / MM / DD)</Text>
          <DateFields y={dobY} m={dobM} d={dobD} onY={setDobY} onM={setDobM} onD={setDobD} />
        </View>
        <View style={st.field}>
          <Text style={st.label}>Time of Birth * (24-hour)</Text>
          <TimeFields h={tobH} min={tobMin} onH={setTobH} onMin={setTobMin} />
        </View>
      </View>

      {/* ── Section: Place of Birth ── */}
      <View style={st.section}>
        <Text style={st.sectionTitle}>📍  Place of Birth</Text>
        <View style={st.chipRow}>
          {displayCities.map((c, i) => (
            <TouchableOpacity key={i} style={[st.chip, !isOtherCity && selectedCity === i && st.chipActive]} onPress={() => { setSelectedCity(i); setIsOtherCity(false); }}>
              <Text style={[st.chipText, !isOtherCity && selectedCity === i && st.chipTextActive]}>{c.label}</Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity style={[st.chip, isOtherCity && st.chipActive]} onPress={() => setIsOtherCity(true)}>
            <Text style={[st.chipText, isOtherCity && st.chipTextActive]}>Other…</Text>
          </TouchableOpacity>
        </View>
        {!showAllCities && !isOtherCity && CITIES.length > 6 && (
          <TouchableOpacity onPress={() => setShowAllCities(true)}>
            <Text style={st.showMore}>Show more cities...</Text>
          </TouchableOpacity>
        )}
        {isOtherCity ? (
          <View style={{ marginTop: 8 }}>
            <View style={st.row}>
              <TextInput
                style={[st.input, { flex: 1 }]}
                value={otherCityName}
                onChangeText={setOtherCityName}
                placeholder="City name, Country"
                placeholderTextColor="#B8A896"
                onBlur={() => geocodePlace(otherCityName)}
              />
              <TouchableOpacity
                style={[st.geocodeBtn, geocoding && { opacity: 0.5 }]}
                onPress={() => geocodePlace(otherCityName)}
                disabled={geocoding}
              >
                {geocoding ? <ActivityIndicator size="small" color="#fff" /> : <Text style={st.geocodeBtnText}>📍 Find</Text>}
              </TouchableOpacity>
            </View>
            <View style={[st.row, { marginTop: 6, gap: 8 }]}>
              <View style={{ flex: 1 }}>
                <Text style={st.label}>Latitude</Text>
                <TextInput style={st.input} value={otherLat} onChangeText={setOtherLat} placeholder="e.g. 28.614" placeholderTextColor="#B8A896" keyboardType="decimal-pad" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={st.label}>Longitude</Text>
                <TextInput style={st.input} value={otherLng} onChangeText={setOtherLng} placeholder="e.g. 77.209" placeholderTextColor="#B8A896" keyboardType="decimal-pad" />
              </View>
            </View>
            <Text style={st.coordHint}>Type city name and press Find to auto-calculate coordinates</Text>
          </View>
        ) : (
          <Text style={st.coordHint}>
            Lat: {CITIES[selectedCity].lat.toFixed(3)}°, Lng: {CITIES[selectedCity].lng.toFixed(3)}°
          </Text>
        )}
      </View>

      {/* ── Optional Rashi Input ── */}
      <TouchableOpacity
        style={st.rashiToggle}
        onPress={() => setShowRashiInput(!showRashiInput)}
      >
        <Text style={st.rashiToggleText}>
          {showRashiInput ? '⚙️ Rashi positions specified' : '⚙️ I know my Rashi positions (optional)'}
        </Text>
        <Text style={st.rashiToggleArrow}>{showRashiInput ? '▼' : '▶'}</Text>
      </TouchableOpacity>

      {showRashiInput && (
        <View style={st.section}>
          <Text style={st.label}>Lagna Rashi (Ascendant) — leave blank for auto</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 10 }}>
            <View style={st.chipRow}>
              <TouchableOpacity style={[st.chip, userLagna === 0 && st.chipActive]} onPress={() => setUserLagna(0)}>
                <Text style={[st.chipText, userLagna === 0 && st.chipTextActive]}>Auto</Text>
              </TouchableOpacity>
              {RASHIS.map((r, i) => (
                <TouchableOpacity key={i} style={[st.chip, userLagna === i + 1 && st.chipActive]} onPress={() => setUserLagna(i + 1)}>
                  <Text style={[st.chipText, userLagna === i + 1 && st.chipTextActive]}>{r}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
          <Text style={st.label}>Moon Rashi (Chandra Rashi) — leave blank for auto</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={st.chipRow}>
              <TouchableOpacity style={[st.chip, userMoon === 0 && st.chipActive]} onPress={() => setUserMoon(0)}>
                <Text style={[st.chipText, userMoon === 0 && st.chipTextActive]}>Auto</Text>
              </TouchableOpacity>
              {RASHIS.map((r, i) => (
                <TouchableOpacity key={i} style={[st.chip, userMoon === i + 1 && st.chipActive]} onPress={() => setUserMoon(i + 1)}>
                  <Text style={[st.chipText, userMoon === i + 1 && st.chipTextActive]}>{r}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
          <Text style={st.coordHint}>
            If you know these from a PanditJi, select them here. Otherwise leave as "Auto" and Janthari will compute.
          </Text>
        </View>
      )}

      {/* ── Generate Button ── */}
      <TouchableOpacity
        style={[st.generateBtn, !isValid && st.generateBtnDisabled]}
        onPress={handleGenerate}
        disabled={!isValid}
        activeOpacity={0.8}
      >
        <Text style={st.generateBtnText}>{route.params?.savedTekniId ? '🔄  Regenerate Saved Tekni' : '🔮  Generate Takni / टेकनी बनायें'}</Text>
      </TouchableOpacity>

      <Text style={st.footerNote}>
        The PanditJi will carefully compute your Janam Kundali based on Vedic calculations.
        This may take a moment...
      </Text>

      {/* ── How it Works ── */}
      <View style={st.howSection}>
        <Text style={st.howTitle}>🎓  How Does a Tekni Work?</Text>
        <Text style={st.howSubtitle}>A simple guide for everyone</Text>

        {/* What is a Tekni? */}
        <View style={st.howCard}>
          <Text style={st.howCardTitle}>📜 What is a Tekni (टेकनी)?</Text>
          <Text style={st.howBody}>
            A <Text style={st.howBold}>Tekni</Text> (also called Janam Kundali or Birth Chart) is like a{' '}
            <Text style={st.howBold}>snapshot of the sky</Text> at the exact moment you were born.{'\n\n'}
            Imagine standing outside when a baby is born and looking up — where was the Sun? The Moon?
            The planets? A Tekni records all of that in a special chart.
          </Text>
        </View>

        {/* The Diamond Chart */}
        <View style={st.howCard}>
          <Text style={st.howCardTitle}>💎 The Diamond-Shaped Chart</Text>
          <Text style={st.howBody}>
            The chart has <Text style={st.howBold}>12 houses</Text> arranged in a diamond shape (North Indian style).
            Each house represents a segment of the sky:{'\n\n'}
            🏠 House 1 (Lagna) = The eastern horizon — the sign rising when you were born{'\n'}
            🏠 Houses 2–12 = The rest of the sky, going counter-clockwise{'\n\n'}
            Each house covers one <Text style={st.howBold}>Rashi</Text> (zodiac sign) — like Mesh (Aries),
            Vrishabh (Taurus), Mithun (Gemini), and so on.
          </Text>
        </View>

        {/* Planets */}
        <View style={st.howCard}>
          <Text style={st.howCardTitle}>🪐 Nine Celestial Bodies (Navagraha)</Text>
          <Text style={st.howBody}>
            Vedic astrology tracks <Text style={st.howBold}>nine grahas</Text>:{'\n\n'}
            ☉ <Text style={st.howBold}>Surya</Text> (Sun) — Your soul & authority{'\n'}
            ☽ <Text style={st.howBold}>Chandra</Text> (Moon) — Your mind & emotions{'\n'}
            ♂ <Text style={st.howBold}>Mangal</Text> (Mars) — Energy & courage{'\n'}
            ☿ <Text style={st.howBold}>Budh</Text> (Mercury) — Intelligence & speech{'\n'}
            ♃ <Text style={st.howBold}>Guru</Text> (Jupiter) — Wisdom & fortune{'\n'}
            ♀ <Text style={st.howBold}>Shukra</Text> (Venus) — Love & beauty{'\n'}
            ♄ <Text style={st.howBold}>Shani</Text> (Saturn) — Discipline & karma{'\n'}
            ☊ <Text style={st.howBold}>Rahu</Text> — North lunar node (ambition){'\n'}
            ☋ <Text style={st.howBold}>Ketu</Text> — South lunar node (spirituality){'\n\n'}
            Rahu and Ketu are always <Text style={st.howBold}>exactly opposite</Text> each other in the chart!
          </Text>
        </View>

        {/* Why birth time matters */}
        <View style={[st.howCard, { backgroundColor: '#FFF9F0' }]}>
          <Text style={st.howCardTitle}>⏰ Why Does Exact Birth Time Matter?</Text>
          <Text style={st.howBody}>
            The Lagna (rising sign) changes roughly every <Text style={st.howBold}>2 hours</Text>.
            Even twins born 10 minutes apart can have different charts!{'\n\n'}
            That's why we ask for the <Text style={st.howBold}>exact hour and minute</Text> of birth,
            plus the <Text style={st.howBold}>city</Text> — because sunrise time differs by location.
          </Text>
        </View>

        {/* What it tells you */}
        <View style={st.howCard}>
          <Text style={st.howCardTitle}>🔮 What Does a Tekni Tell You?</Text>
          <Text style={st.howBody}>
            🌙 <Text style={st.howBold}>Rashi</Text> — Your Moon sign (emotional nature){'\n'}
            ⭐ <Text style={st.howBold}>Nakshatra</Text> — Your birth star (1 of 27 special star groups){'\n'}
            📐 <Text style={st.howBold}>Lagna</Text> — Your ascendant (how the world sees you){'\n'}
            🕉️ <Text style={st.howBold}>Dasha</Text> — Planetary periods that influence different life phases{'\n\n'}
            In Kashmiri Pandit tradition, the Tekni is prepared at birth and consulted
            for <Text style={st.howBold}>naming ceremonies</Text>, <Text style={st.howBold}>marriage matching</Text>,
            and <Text style={st.howBold}>muhurat</Text> (auspicious timing).
          </Text>
        </View>

        {/* Fun fact */}
        <View style={[st.howCard, { backgroundColor: '#F0F0FF', borderColor: '#6C5CE7' }]}>
          <Text style={st.howCardTitle}>🤯 Cool Fact</Text>
          <Text style={st.howBody}>
            The word <Text style={st.howBold}>Tekni (टेकनी)</Text> is uniquely Kashmiri Pandit — in the rest of
            India it's called Janam Kundali or Janam Patri. The tradition of making a Tekni has been
            passed down by KP families for centuries!
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const st = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: '#F5F0E8' },
  scrollContent: { padding: 20, paddingBottom: 40, maxWidth: 600, alignSelf: 'center' as const, width: '100%' as any },
  libraryBtn: {
    alignSelf: 'flex-start',
    backgroundColor: '#EEE8FF',
    borderRadius: 10,
    paddingVertical: 9,
    paddingHorizontal: 12,
    marginBottom: 10,
  },
  libraryBtnText: { color: '#4F46C6', fontWeight: '700', fontSize: 13 },
  editingCard: {
    backgroundColor: '#FFF9F0',
    borderColor: '#E8DCC8',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  editingTitle: { fontSize: 12, color: '#8B6A45', fontWeight: '700' },
  editingName: { fontSize: 16, color: '#2D2D3A', fontWeight: '800', marginTop: 4 },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12, padding: 16, marginBottom: 14,
    ...Platform.select({ web: { boxShadow: '0 1px 4px rgba(0,0,0,0.08)' } as any, default: { elevation: 1 } }),
  },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#3D2B1F', marginBottom: 12 },
  field: { marginBottom: 10 },
  label: { fontSize: 12, fontWeight: '600', color: '#6B4F38', marginBottom: 4 },
  input: {
    borderWidth: 1, borderColor: '#D4C5B0', borderRadius: 8,
    paddingHorizontal: 12, paddingVertical: 8,
    fontSize: 14, color: '#3D2B1F', backgroundColor: '#FDFAF5',
  },
  row: { flexDirection: 'row' as const },
  dateRow: { flexDirection: 'row' as const, alignItems: 'center' as const, gap: 4 },
  dateInput: {
    borderWidth: 1, borderColor: '#D4C5B0', borderRadius: 8,
    paddingHorizontal: 8, paddingVertical: 8, textAlign: 'center' as const,
    fontSize: 14, color: '#3D2B1F', backgroundColor: '#FDFAF5',
  },
  dateSep: { fontSize: 16, color: '#6B4F38', marginHorizontal: 2 },
  timeHint: { fontSize: 11, color: '#999', marginLeft: 8 },
  chipRow: { flexDirection: 'row' as const, flexWrap: 'wrap' as const, gap: 8 },
  chip: {
    paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20,
    borderWidth: 1, borderColor: '#D4C5B0', backgroundColor: '#FDFAF5',
  },
  chipActive: { backgroundColor: '#8C1A1F', borderColor: '#8C1A1F' },
  chipText: { fontSize: 12, color: '#6B4F38', fontWeight: '500' },
  chipTextActive: { color: '#fff' },
  showMore: { color: '#8C1A1F', fontSize: 12, fontWeight: '600', marginTop: 6 },
  coordHint: { fontSize: 11, color: '#999', marginTop: 6 },
  geocodeBtn: {
    backgroundColor: '#8C1A1F', borderRadius: 8, paddingHorizontal: 14,
    paddingVertical: 8, marginLeft: 8, justifyContent: 'center' as const,
  },
  geocodeBtnText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  generateBtn: {
    backgroundColor: '#8C1A1F', borderRadius: 12, paddingVertical: 14,
    alignItems: 'center' as const, marginTop: 6,
  },
  generateBtnDisabled: { opacity: 0.5 },
  generateBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  footerNote: { fontSize: 11, color: '#999', textAlign: 'center' as const, marginTop: 12, lineHeight: 16 },
  rashiToggle: {
    flexDirection: 'row' as const, justifyContent: 'space-between' as const, alignItems: 'center' as const,
    backgroundColor: '#F0EDE6', borderRadius: 12, padding: 12, marginBottom: 8,
  },
  rashiToggleText: { fontSize: 13, fontWeight: '600' as const, color: '#6B4F38' },
  rashiToggleArrow: { fontSize: 12, color: '#6B4F38' },
  howSection: { marginTop: 24, paddingTop: 20, borderTopWidth: 1, borderTopColor: '#E0D6C8' },
  howTitle: { fontSize: 20, fontWeight: '700', color: '#3D2B1F', textAlign: 'center' as const },
  howSubtitle: { fontSize: 13, color: '#8C7A6B', textAlign: 'center' as const, marginBottom: 16 },
  howCard: {
    backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 14,
    borderWidth: 1, borderColor: '#E0D6C8',
    ...Platform.select({ web: { boxShadow: '0 1px 4px rgba(0,0,0,0.06)' } as any, default: { elevation: 1 } }),
  },
  howCardTitle: { fontSize: 16, fontWeight: '700', color: '#3D2B1F', marginBottom: 8 },
  howBody: { fontSize: 14, color: '#444', lineHeight: 22 },
  howBold: { fontWeight: '700' as const, color: '#3D2B1F' },
});
