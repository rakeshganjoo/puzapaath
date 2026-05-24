import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Platform,
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
import {
  getNotificationSettings,
  isNotificationSupported,
  sendTestNotification,
  updateNotificationSettings,
} from '../services/NotificationService';

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

export default function SetupScreen({ navigation, route }: Props) {
  const { settings, loading: syncLoading, syncing, enableSync, updateEndpoint, runSync } = useSync();
  const { user, loading: authLoading, isAuthenticated, signInWithGoogle, signOut } = useAuth();
  const requestedProfileId = route.params?.activeProfileId;
  const [didAutoSelectRequestedProfile, setDidAutoSelectRequestedProfile] = useState(false);
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
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [notificationTime, setNotificationTime] = useState('08:00');
  const [notificationBusy, setNotificationBusy] = useState(false);

  useEffect(() => {
    getProfiles().then(setProfiles);
  }, []);

  useEffect(() => {
    const loadNotificationSettings = async () => {
      const settings = await getNotificationSettings();
      setNotificationsEnabled(settings.enabled);
      setNotificationTime(`${String(settings.hour).padStart(2, '0')}:${String(settings.minute).padStart(2, '0')}`);
    };
    loadNotificationSettings();
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

  useEffect(() => {
    if (didAutoSelectRequestedProfile) return;
    if (!requestedProfileId) {
      setDidAutoSelectRequestedProfile(true);
      return;
    }
    if (profiles.length === 0) return;

    const requestedProfile = profiles.find((p) => p.id === requestedProfileId);
    if (requestedProfile) {
      loadProfile(requestedProfile);
    }
    setDidAutoSelectRequestedProfile(true);
  }, [didAutoSelectRequestedProfile, requestedProfileId, profiles, loadProfile]);

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

  const saveProfileOnly = useCallback(async () => {
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
    
    // Clear form and reload profiles
    const updated = await getProfiles();
    setProfiles(updated);
    setEditingProfileId(null);
    setName(''); setGotra(''); setEnglishBirthday(''); setMonth(''); setTithi(''); setDay('');
    setPaksha('shukla');
    Alert.alert('Success', 'Profile saved! Your calendar events are now linked to this profile.');
  }, [name, gotra, englishBirthday, month, paksha, tithi, day, editingProfileId, profiles]);

  const applyNotificationSettings = useCallback(async () => {
    if (!isNotificationSupported()) {
      Alert.alert('Not Available', 'Notifications are available on Android and iOS app builds.');
      return;
    }

    const timeMatch = notificationTime.match(/^(\d{2}):(\d{2})$/);
    if (!timeMatch) {
      Alert.alert('Invalid Time', 'Please enter reminder time in HH:MM format (for example 08:00).');
      return;
    }

    const hour = Number(timeMatch[1]);
    const minute = Number(timeMatch[2]);
    if (hour < 0 || hour > 23 || minute < 0 || minute > 59) {
      Alert.alert('Invalid Time', 'Hour must be 00-23 and minutes must be 00-59.');
      return;
    }

    setNotificationBusy(true);
    try {
      const { settings, scheduledCount } = await updateNotificationSettings({
        enabled: notificationsEnabled,
        hour,
        minute,
      });
      setNotificationsEnabled(settings.enabled);
      setNotificationTime(`${String(settings.hour).padStart(2, '0')}:${String(settings.minute).padStart(2, '0')}`);

      if (settings.enabled) {
        Alert.alert('Reminders Enabled', `Daily reminders are active. Scheduled ${scheduledCount} upcoming notifications.`);
      } else {
        Alert.alert('Reminders Disabled', 'All scheduled reminders were cleared.');
      }
    } finally {
      setNotificationBusy(false);
    }
  }, [notificationTime, notificationsEnabled]);

  const triggerTestNotification = useCallback(async () => {
    const ok = await sendTestNotification();
    if (!ok) {
      Alert.alert('Permission Needed', 'Please allow notifications in app/device settings first.');
      return;
    }
    Alert.alert('Test Scheduled', 'A test reminder will arrive in a couple of seconds.');
  }, []);

  // Auto-enable cloud sync when user signs in
  useEffect(() => {
    if (isAuthenticated && !settings?.enabled && !syncLoading) {
      enableSync(true);
    }
  }, [isAuthenticated, settings?.enabled, syncLoading, enableSync]);

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
          Sign in with Google to automatically back up your profiles and custom calendar events. Your Janthari data stays yours—no ads, no tracking.
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
          Your signed-in Google account is used as the sync identity automatically. All your profiles and custom calendar events stay tied to your account. Every time you tap "Sync Now," your local changes are sent to our server and any changes from other devices are pulled down.
        </Text>
      </View>

      <View style={styles.notifySection}>
        <Text style={styles.profileSectionTitle}>Daily Reminder Notifications</Text>
        <Text style={styles.syncHelp}>
          Get alerts for important tithis (Ashtami, Ekadashi, Purnima/Amavasya), Kashmiri birthdays,
          English birthdays, and your custom saved events.
        </Text>

        {!isNotificationSupported() && (
          <Text style={styles.notifyUnavailable}>
            Notifications are not supported on {Platform.OS}. Use Android/iOS app build for reminders.
          </Text>
        )}

        <View style={styles.notifyToggleRow}>
          <TouchableOpacity
            style={[styles.notifyToggleBtn, notificationsEnabled && styles.notifyToggleBtnActive]}
            onPress={() => setNotificationsEnabled((prev) => !prev)}
            disabled={notificationBusy || !isNotificationSupported()}
          >
            <Text style={[styles.notifyToggleText, notificationsEnabled && styles.notifyToggleTextActive]}>
              {notificationsEnabled ? 'Reminders: ON' : 'Reminders: OFF'}
            </Text>
          </TouchableOpacity>

          <TextInput
            style={[styles.notifyTimeInput, !isNotificationSupported() && styles.notifyDisabled]}
            value={notificationTime}
            onChangeText={setNotificationTime}
            editable={!notificationBusy && isNotificationSupported()}
            placeholder="08:00"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.notifyButtonRow}>
          <TouchableOpacity
            style={[styles.notifyApplyBtn, (notificationBusy || !isNotificationSupported()) && styles.notifyDisabled]}
            onPress={applyNotificationSettings}
            disabled={notificationBusy || !isNotificationSupported()}
          >
            <Text style={styles.notifyApplyText}>{notificationBusy ? 'Saving...' : 'Save Reminder Settings'}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.notifyTestBtn, (notificationBusy || !isNotificationSupported()) && styles.notifyDisabled]}
            onPress={triggerTestNotification}
            disabled={notificationBusy || !isNotificationSupported()}
          >
            <Text style={styles.notifyTestText}>Send Test</Text>
          </TouchableOpacity>
        </View>
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

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[styles.saveProfileBtn, (!name || !gotra) && styles.saveBtnDisabled]}
          onPress={saveProfileOnly}
          disabled={!name || !gotra}
        >
          <Text style={styles.saveProfileBtnText}>
            {editingProfileId ? 'Update Profile ✓' : 'Save Profile ✓'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.savePujaBtn, (!name || !gotra) && styles.saveBtnDisabled]}
          onPress={save}
          disabled={!name || !gotra}
        >
          <Text style={styles.saveBtnText}>
            {editingProfileId ? 'Start Puja 🙏' : 'Save & Start Puja 🙏'}
          </Text>
        </TouchableOpacity>
      </View>

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
  notifySection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EAEAEF',
    padding: 14,
    marginBottom: 16,
  },
  notifyUnavailable: { fontSize: 12, color: '#C0392B', marginBottom: 10 },
  notifyToggleRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2, marginBottom: 10 },
  notifyToggleBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#CCC',
    backgroundColor: '#fff',
    marginRight: 10,
  },
  notifyToggleBtnActive: { borderColor: '#2E7D32', backgroundColor: '#EAF7EC' },
  notifyToggleText: { color: '#666', fontSize: 12, fontWeight: '700' },
  notifyToggleTextActive: { color: '#2E7D32' },
  notifyTimeInput: {
    width: 90,
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#EAEAEF',
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 14,
    color: '#2D2D3A',
  },
  notifyButtonRow: { flexDirection: 'row', alignItems: 'center' },
  notifyApplyBtn: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: '#6C5CE7',
    marginRight: 8,
  },
  notifyApplyText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  notifyTestBtn: {
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: 'center',
    backgroundColor: '#F1EDFF',
    borderWidth: 1,
    borderColor: '#D8D3F8',
  },
  notifyTestText: { color: '#6C5CE7', fontSize: 12, fontWeight: '700' },
  notifyDisabled: { opacity: 0.45 },
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
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 24,
  },
  saveProfileBtn: {
    flex: 1,
    backgroundColor: '#E8E3F8',
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#6C5CE7',
  },
  saveProfileBtnText: { fontSize: 14, fontWeight: '600', color: '#6C5CE7' },
  savePujaBtn: {
    flex: 1,
    backgroundColor: '#6C5CE7',
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
  },
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
