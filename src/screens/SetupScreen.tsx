import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';
import {
  getProfiles,
  saveProfile,
  deleteProfile,
  setActiveProfile,
  generateProfileId,
  type UserProfile,
} from '../services/ProfileService';

type Props = NativeStackScreenProps<RootStackParamList, 'Setup'>;

const MONTHS = [
  'Chaitra', 'Vaishakh', 'Jyeshtha', 'Ashadh',
  'Shravan', 'Bhadrapad', 'Ashwin', 'Kartik',
  'Margshirsh', 'Paush', 'Magh', 'Phalgun',
];

const TITHIS = [
  'Pratipada (1)', 'Dwitiya (2)', 'Tritiya (3)', 'Chaturthi (4)',
  'Panchami (5)', 'Shashthi (6)', 'Saptami (7)', 'Ashtami (8)',
  'Navami (9)', 'Dashami (10)', 'Ekadashi (11)', 'Dwadashi (12)',
  'Trayodashi (13)', 'Chaturdashi (14)', 'Purnima/Amavasya (15)',
];

const DAYS = ['Ravivar', 'Somvar', 'Mangalvar', 'Budhvar', 'Guruvar', 'Shukravar', 'Shanivar'];

export default function SetupScreen({ navigation }: Props) {
  const [name, setName] = useState('');
  const [gotra, setGotra] = useState('');
  const [month, setMonth] = useState('');
  const [paksha, setPaksha] = useState<'krishna' | 'shukla'>('shukla');
  const [tithi, setTithi] = useState('');
  const [day, setDay] = useState('');
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [editingProfileId, setEditingProfileId] = useState<string | null>(null);

  // Load saved profiles
  useEffect(() => {
    getProfiles().then(setProfiles);
  }, []);

  const loadProfile = useCallback((profile: UserProfile) => {
    setName(profile.personName);
    setGotra(profile.gotra);
    setMonth(profile.lunarMonth);
    setPaksha(profile.paksha);
    setTithi(profile.tithi);
    setDay(profile.day);
    setEditingProfileId(profile.id);
  }, []);

  const handleDelete = useCallback(async (id: string, profileName: string) => {
    Alert.alert('Delete Profile', `Remove "${profileName}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteProfile(id);
          const updated = await getProfiles();
          setProfiles(updated);
          if (editingProfileId === id) {
            setEditingProfileId(null);
            setName(''); setGotra(''); setMonth(''); setTithi(''); setDay('');
          }
        },
      },
    ]);
  }, [editingProfileId]);

  const save = useCallback(async () => {
    const profileId = editingProfileId || generateProfileId();
    const profile: UserProfile = {
      id: profileId,
      personName: name,
      gotra,
      lunarMonth: month,
      paksha,
      tithi,
      day,
      createdAt: editingProfileId
        ? profiles.find((p) => p.id === editingProfileId)?.createdAt || new Date().toISOString()
        : new Date().toISOString(),
      lastUsedAt: new Date().toISOString(),
    };
    await saveProfile(profile);
    await setActiveProfile(profileId);

    const session = {
      personName: name,
      gotra,
      lunarMonth: month,
      paksha,
      tithi,
      day,
      isShortVersion: false,
      currentPartId: 'A' as const,
      currentStepIndex: 0,
      completedSteps: [] as string[],
      samagriChecked: [] as string[],
      startedAt: new Date().toISOString(),
    };
    await AsyncStorage.setItem('pujaSession', JSON.stringify(session));
    navigation.navigate('PujaNavigator', { partId: 'A' });
  }, [name, gotra, month, paksha, tithi, day, navigation, editingProfileId, profiles]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.heading}>Enter Puja Details</Text>
      <Text style={styles.subtext}>
        These details will auto-fill the Sankalp mantra.
      </Text>

      {/* Saved Profiles */}
      {profiles.length > 0 && (
        <View style={styles.profileSection}>
          <Text style={styles.profileSectionTitle}>Saved Profiles</Text>
          {profiles.map((p) => (
            <View key={p.id} style={[
              styles.profileCard,
              editingProfileId === p.id && styles.profileCardActive,
            ]}>
              <TouchableOpacity
                style={styles.profileInfo}
                onPress={() => loadProfile(p)}
              >
                <Text style={styles.profileName}>{p.personName}</Text>
                <Text style={styles.profileDetail}>
                  {p.gotra} • {p.lunarMonth || '—'} • {p.tithi || '—'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.profileDeleteBtn}
                onPress={() => handleDelete(p.id, p.personName)}
              >
                <Text style={styles.profileDeleteText}>✕</Text>
              </TouchableOpacity>
            </View>
          ))}
          <TouchableOpacity
            style={styles.newProfileBtn}
            onPress={() => {
              setEditingProfileId(null);
              setName(''); setGotra(''); setMonth(''); setTithi(''); setDay('');
              setPaksha('shukla');
            }}
          >
            <Text style={styles.newProfileText}>+ New Profile</Text>
          </TouchableOpacity>
        </View>
      )}

      <Text style={styles.label}>Name of Person (जातक)</Text>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder="e.g. RG"
      />

      <Text style={styles.label}>Gotra (गोत्र)</Text>
      <TextInput
        style={styles.input}
        value={gotra}
        onChangeText={setGotra}
        placeholder="e.g. Pat Svamina Kaushika"
      />

      <Text style={styles.label}>Lunar Month (मास)</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
        {MONTHS.map((m) => (
          <TouchableOpacity
            key={m}
            style={[styles.chip, month === m && styles.chipActive]}
            onPress={() => setMonth(m)}
          >
            <Text style={[styles.chipText, month === m && styles.chipTextActive]}>{m}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Text style={styles.label}>Paksha (पक्ष)</Text>
      <View style={styles.row}>
        {(['shukla', 'krishna'] as const).map((p) => (
          <TouchableOpacity
            key={p}
            style={[styles.chip, paksha === p && styles.chipActive, { marginRight: 10 }]}
            onPress={() => setPaksha(p)}
          >
            <Text style={[styles.chipText, paksha === p && styles.chipTextActive]}>
              {p === 'shukla' ? 'शुक्ल (Bright)' : 'कृष्ण (Dark)'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Tithi (तिथि)</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
        {TITHIS.map((t) => (
          <TouchableOpacity
            key={t}
            style={[styles.chip, tithi === t && styles.chipActive]}
            onPress={() => setTithi(t)}
          >
            <Text style={[styles.chipText, tithi === t && styles.chipTextActive]}>{t}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Text style={styles.label}>Day (वार)</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
        {DAYS.map((d) => (
          <TouchableOpacity
            key={d}
            style={[styles.chip, day === d && styles.chipActive]}
            onPress={() => setDay(d)}
          >
            <Text style={[styles.chipText, day === d && styles.chipTextActive]}>{d}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <TouchableOpacity
        style={[styles.saveBtn, (!name || !gotra) && styles.saveBtnDisabled]}
        onPress={save}
        disabled={!name || !gotra}
      >
        <Text style={styles.saveBtnText}>
          {editingProfileId ? 'Update & Start Puja 🙏' : 'Save & Start Puja 🙏'}
        </Text>
      </TouchableOpacity>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F8' },
  content: { padding: 20 },
  heading: { fontSize: 22, fontWeight: '700', color: '#2D2D3A', marginBottom: 4 },
  subtext: { fontSize: 13, color: '#999', marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', color: '#555', marginTop: 16, marginBottom: 8 },
  input: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#EAEAEF',
    color: '#2D2D3A',
  },
  chipRow: { flexDirection: 'row', marginBottom: 4 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#EAEAEF',
    marginRight: 8,
    marginBottom: 8,
  },
  chipActive: { backgroundColor: '#6C5CE7', borderColor: '#6C5CE7' },
  chipText: { fontSize: 13, color: '#666' },
  chipTextActive: { color: '#fff', fontWeight: '600' },
  row: { flexDirection: 'row', flexWrap: 'wrap' },
  saveBtn: {
    backgroundColor: '#6C5CE7',
    borderRadius: 14,
    padding: 18,
    alignItems: 'center',
    marginTop: 24,
  },
  saveBtnDisabled: { opacity: 0.4 },
  saveBtnText: { fontSize: 16, fontWeight: '600', color: '#fff' },
  profileSection: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#EAEAEF',
  },
  profileSectionTitle: { fontSize: 15, fontWeight: '600', color: '#2D2D3A', marginBottom: 10 },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F8',
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#EAEAEF',
  },
  profileCardActive: {
    borderColor: '#6C5CE7',
    backgroundColor: '#F8F6FF',
  },
  profileInfo: { flex: 1 },
  profileName: { fontSize: 15, fontWeight: '600', color: '#2D2D3A' },
  profileDetail: { fontSize: 12, color: '#999', marginTop: 2 },
  profileDeleteBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F5F5F8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileDeleteText: { fontSize: 13, color: '#E74C3C', fontWeight: 'bold' },
  newProfileBtn: {
    padding: 10,
    alignItems: 'center',
  },
  newProfileText: { fontSize: 14, color: '#6C5CE7', fontWeight: '500' },
});
