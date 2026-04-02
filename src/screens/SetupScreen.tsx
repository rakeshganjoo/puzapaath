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
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import {
  getProfiles,
  saveProfile,
  deleteProfile,
  setActiveProfile,
  generateProfileId,
  type UserProfile,
} from '../services/ProfileService';
import { gregorianToLunar } from '../services/HinduCalendar';
import { setJSON } from '../services/StorageService';
import { useSync } from '../contexts/SyncContext';
import { useAuth } from '../contexts/AuthContext';

type Props = NativeStackScreenProps<RootStackParamList, 'Setup'>;

const MONTHS = [
  'Chaitra', 'Vaishakh', 'Jyeshtha', 'Ashadh',
  'Shravan', 'Bhadrapad', 'Ashwin', 'Kartik',
  'Margshirsh', 'Paush', 'Magh', 'Phalgun',
];

const COMMON_GOTRAS = [
  'Kashyap',
  'Bharadwaj',
  'Vashishtha',
  'Kaushika',
  'Dhananjaya',
  'Dattatreya',
  'Atri',
];

const TITHIS = [
  'Pratipada (1)', 'Dwitiya (2)', 'Tritiya (3)', 'Chaturthi (4)',
  'Panchami (5)', 'Shashthi (6)', 'Saptami (7)', 'Ashtami (8)',
  'Navami (9)', 'Dashami (10)', 'Ekadashi (11)', 'Dwadashi (12)',
  'Trayodashi (13)', 'Chaturdashi (14)', 'Purnima/Amavasya (15)',
];

const DAYS = ['Ravivar', 'Somvar', 'Mangalvar', 'Budhvar', 'Guruvar', 'Shukravar', 'Shanivar'];

export default function SetupScreen({ navigation }: Props) {
  const { settings, loading: syncLoading, syncing, enableSync, updateEndpoint, runSync } = useSync();
  const { user, loading: authLoading, isAuthenticated, signInWithGoogle, signOut } = useAuth();
  const [name, setName] = useState('');
  const [gotra, setGotra] = useState('');
  const [englishBirthday, setEnglishBirthday] = useState('');
  const [month, setMonth] = useState('');
  const [paksha, setPaksha] = useState<'krishna' | 'shukla'>('shukla');
  const [tithi, setTithi] = useState('');
  const [day, setDay] = useState('');
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [editingProfileId, setEditingProfileId] = useState<string | null>(null);
  const [syncEndpointDraft, setSyncEndpointDraft] = useState('https://api.janthari.com');

  useEffect(() => {
    getProfiles().then(setProfiles);
  }, []);

  useEffect(() => {
    if (!settings) return;
    setSyncEndpointDraft(settings.endpoint);
  }, [settings]);

  const loadProfile = useCallback((profile: UserProfile) => {
    setName(profile.personName);
    setGotra(profile.gotra);
    setEnglishBirthday(profile.englishBirthday || '');
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
            setName(''); setGotra(''); setEnglishBirthday(''); setMonth(''); setTithi(''); setDay('');
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
      englishBirthday: englishBirthday || undefined,
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
    await setJSON('pujaSession', session);
    navigation.navigate('PujaNavigator', { partId: 'A' });
  }, [name, gotra, englishBirthday, month, paksha, tithi, day, navigation, editingProfileId, profiles]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.heading}>Enter Puja Details</Text>
      <Text style={styles.subtext}>
        These details will auto-fill the Sankalp mantra.
      </Text>

      {/* Optional cloud sync */}
      <View style={styles.syncSection}>
        <Text style={styles.profileSectionTitle}>Cloud Sync (Optional)</Text>
        <Text style={styles.syncHelp}>
          Sign in with Google to keep your Janthari data tied to your own account. Once signed in, the session stays active until you explicitly log out.
        </Text>

        <View style={styles.authCard}>
          <Text style={styles.authCardLabel}>Google Account</Text>
          {isAuthenticated && user ? (
            <>
              <Text style={styles.authCardName}>{user.name || user.email}</Text>
              <Text style={styles.authCardEmail}>{user.email}</Text>
              <TouchableOpacity style={styles.logoutBtn} onPress={signOut}>
                <Text style={styles.logoutBtnText}>Logout</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={styles.authCardEmail}>Not signed in</Text>
              <TouchableOpacity style={styles.googleBtn} onPress={signInWithGoogle} disabled={authLoading}>
                <Text style={styles.googleBtnText}>{authLoading ? 'Checking session...' : 'Sign in with Google'}</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        <View style={styles.syncToggleRow}>
          <TouchableOpacity
            style={[styles.syncToggleBtn, settings?.enabled && styles.syncToggleBtnActive]}
            onPress={() => enableSync(!(settings?.enabled ?? false))}
            disabled={syncLoading || !isAuthenticated}
          >
            <Text style={[styles.syncToggleText, settings?.enabled && styles.syncToggleTextActive]}>
              {settings?.enabled ? 'Cloud Sync: ON' : 'Cloud Sync: OFF'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.syncNowBtn, (!settings?.enabled || syncing || !isAuthenticated) && styles.syncNowBtnDisabled]}
            onPress={async () => {
              const result = await runSync();
              Alert.alert(result.ok ? 'Sync Complete' : 'Sync Notice', result.message);
            }}
            disabled={!settings?.enabled || syncing || !isAuthenticated}
          >
            <Text style={styles.syncNowText}>{syncing ? 'Syncing...' : 'Sync Now'}</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>Sync Endpoint</Text>
        <TextInput
          style={styles.input}
          value={syncEndpointDraft}
          onChangeText={setSyncEndpointDraft}
          onEndEditing={() => updateEndpoint(syncEndpointDraft)}
          placeholder="https://api.janthari.com"
          autoCapitalize="none"
        />
        <Text style={styles.helperText}>
          Your signed-in Google account is used as the sync identity automatically. Calendar updates and custom events stay profile-specific on-device, and cloud sync is tied to the logged-in account.
        </Text>
      </View>

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
                  {p.gotra} • {p.englishBirthday || p.lunarMonth || '—'} • {p.tithi || '—'}
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
              setName(''); setGotra(''); setEnglishBirthday(''); setMonth(''); setTithi(''); setDay('');
              setPaksha('shukla');
            }}
          >
            <Text style={styles.newProfileText}>+ New Profile</Text>
          </TouchableOpacity>
        </View>
      )}

      <Text style={styles.label}>Name of Person (Jatak)</Text>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder="e.g. RG"
      />

      <Text style={styles.label}>Gotra</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
        {COMMON_GOTRAS.map((g) => (
          <TouchableOpacity
            key={g}
            style={[styles.chip, gotra === g && styles.chipActive]}
            onPress={() => setGotra(g)}
          >
            <Text style={[styles.chipText, gotra === g && styles.chipTextActive]}>{g}</Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity
          style={[styles.chip, !COMMON_GOTRAS.includes(gotra) && gotra !== '' && styles.chipActive]}
          onPress={() => setGotra('')}
        >
          <Text style={[styles.chipText, !COMMON_GOTRAS.includes(gotra) && gotra !== '' && styles.chipTextActive]}>Other…</Text>
        </TouchableOpacity>
      </ScrollView>
      {(!COMMON_GOTRAS.includes(gotra)) && (
        <TextInput
          style={styles.input}
          value={COMMON_GOTRAS.includes(gotra) ? '' : gotra}
          onChangeText={setGotra}
          placeholder="Enter full gotra pravara (e.g. Pat Svamina Kaushika)"
        />
      )}

      <Text style={styles.label}>English Birthday (YYYY-MM-DD)</Text>
      <Text style={styles.helperText}>
        Don't know your Kashmiri Birthday tithi? Enter your English date below — we'll auto-calculate it! 🗓️
      </Text>
      <TextInput
        style={styles.input}
        value={englishBirthday}
        onChangeText={(text) => {
          setEnglishBirthday(text);
          // Auto-fill lunar date when valid YYYY-MM-DD is entered
          if (/^\d{4}-\d{2}-\d{2}$/.test(text)) {
            const lunar = gregorianToLunar(text);
            if (lunar) {
              setMonth(lunar.lunarMonth);
              setPaksha(lunar.paksha);
              setTithi(lunar.tithi);
              setDay(lunar.day);
            }
          }
        }}
        placeholder="YYYY-MM-DD (e.g. 1965-03-15)"
        keyboardType="default"
      />
      {englishBirthday && /^\d{4}-\d{2}-\d{2}$/.test(englishBirthday) && (() => {
        const lunar = gregorianToLunar(englishBirthday);
        if (!lunar) return null;
        return (
          <View style={styles.autoFillCard}>
            <Text style={styles.autoFillTitle}>Your Kashmiri Birthday (approximate)</Text>
            <Text style={styles.autoFillDate}>
              {lunar.lunarMonth} · {lunar.paksha === 'shukla' ? 'Shukla Paksha (Zoonpash)' : 'Krishna Paksha (Gatpash)'} · {lunar.tithi}
            </Text>
            <Text style={styles.autoFillDay}>{lunar.day}</Text>
          </View>
        );
      })()}

      <Text style={styles.label}>Lunar Month (Maas)</Text>
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

      <Text style={styles.label}>Paksha (Lunar Phase)</Text>
      <View style={styles.row}>
        {(['shukla', 'krishna'] as const).map((p) => (
          <TouchableOpacity
            key={p}
            style={[styles.chip, paksha === p && styles.chipActive, { marginRight: 10 }]}
            onPress={() => setPaksha(p)}
          >
            <Text style={[styles.chipText, paksha === p && styles.chipTextActive]}>
              {p === 'shukla' ? 'Shukla (Bright Half)' : 'Krishna (Dark Half)'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Tithi (Lunar Day)</Text>
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

      <Text style={styles.label}>Day (Vaar)</Text>
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
  syncSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EAEAEF',
    padding: 14,
    marginBottom: 16,
  },
  syncHelp: { fontSize: 12, color: '#666', marginTop: 4, marginBottom: 10, lineHeight: 18 },
  authCard: {
    backgroundColor: '#F8F6FF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E1DBFF',
    padding: 12,
    marginBottom: 12,
  },
  authCardLabel: { fontSize: 12, color: '#6C5CE7', fontWeight: '700', marginBottom: 4 },
  authCardName: { fontSize: 15, color: '#2D2D3A', fontWeight: '700' },
  authCardEmail: { fontSize: 13, color: '#666', marginTop: 2, marginBottom: 10 },
  googleBtn: {
    backgroundColor: '#6C5CE7',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    alignItems: 'center',
  },
  googleBtnText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  logoutBtn: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#D8D3F8',
    paddingVertical: 9,
    paddingHorizontal: 12,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  logoutBtnText: { color: '#6C5CE7', fontSize: 13, fontWeight: '700' },
  syncToggleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  syncToggleBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#CCC',
    marginRight: 10,
    backgroundColor: '#fff',
  },
  syncToggleBtnActive: { borderColor: '#2E7D32', backgroundColor: '#EAF7EC' },
  syncToggleText: { color: '#666', fontSize: 12, fontWeight: '700' },
  syncToggleTextActive: { color: '#2E7D32' },
  syncNowBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#6C5CE7',
  },
  syncNowBtnDisabled: { opacity: 0.4 },
  syncNowText: { color: '#fff', fontSize: 12, fontWeight: '700' },
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
  autoFillCard: {
    backgroundColor: '#F8F6FF',
    borderRadius: 12,
    padding: 14,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#6C5CE7',
    borderLeftWidth: 4,
  },
  autoFillTitle: { fontSize: 12, color: '#6C5CE7', fontWeight: '600', marginBottom: 4 },
  autoFillDate: { fontSize: 16, fontWeight: '700', color: '#2D2D3A' },
  autoFillDay: { fontSize: 13, color: '#888', marginTop: 2 },
  helperText: { fontSize: 12, color: '#888', marginBottom: 8, lineHeight: 16 },
});
