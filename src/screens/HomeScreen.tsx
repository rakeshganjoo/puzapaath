import React, { useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Image,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { CommonActions } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { gregorianToLunar, DAYS } from '../services/HinduCalendar';
import { KP_FESTIVALS, getMonthlyObservances, type KPFestival } from '../data/kpFestivals';
import { useTheme } from '../contexts/UIContext';
import { useAuth } from '../contexts/AuthContext';
import { getActiveProfile } from '../services/ProfileService';
import type { AppLocale } from '../i18n/translations';

const logoImg    = require('../assets/images/tiles/jan-swastik_tile.jpeg');

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

type Tile = {
  ionicon: IoniconName;
  title: string;
  sub: string;
  screen?: keyof RootStackParamList;
  params?: RootStackParamList[keyof RootStackParamList];
  soon?: boolean;
};

type LayoutProfile = 'mobile' | 'tablet' | 'desktop';

function detectWebBrowser(): 'chrome' | 'safari' | 'edge' | 'firefox' | 'other' {
  if (Platform.OS !== 'web' || typeof navigator === 'undefined') return 'other';
  const ua = navigator.userAgent;
  if (/Edg\//i.test(ua)) return 'edge';
  if (/Firefox\//i.test(ua)) return 'firefox';
  if (/Chrome\//i.test(ua) && !/Edg\//i.test(ua)) return 'chrome';
  if (/Safari\//i.test(ua) && !/Chrome\//i.test(ua)) return 'safari';
  return 'other';
}

export default function HomeScreen({ navigation }: Props) {
  const { locale, setLocale, t } = useTheme();
  const { user, isAuthenticated, signInWithGoogle, signOut } = useAuth();
  const [activeProfileName, setActiveProfileName] = React.useState<string | null>(null);
  const [activeProfileId, setActiveProfileId] = React.useState<string | null>(null);
  const { width } = useWindowDimensions();

  React.useEffect(() => {
    const loadProfile = async () => {
      const profile = await getActiveProfile();
      setActiveProfileName(profile?.personName ?? null);
      setActiveProfileId(profile?.id ?? null);
    };
    loadProfile();
  }, []);

  const isWeb = Platform.OS === 'web';
  const profile: LayoutProfile = width >= 1100 ? 'desktop' : width >= 760 ? 'tablet' : 'mobile';
  const columns = profile === 'desktop' ? 3 : 2;
  const horizontalPadding = profile === 'mobile' ? 12 : 20;
  const gridGap = 8;
  const maxContentWidth = profile === 'desktop' ? 1080 : profile === 'tablet' ? 800 : 440;
  const contentWidth = Math.min(width - horizontalPadding * 2, maxContentWidth);
  const tileWidthPct = columns === 3 ? '32%' : '48.5%';
  const tileHeight = profile === 'mobile' ? 120 : 132;

  // Active features
  const tiles: Tile[] = [
    {
      ionicon: 'calendar-outline',
      title: t('home.tiles.calendarTitle', 'KP Calendar'),
      sub: t('home.tiles.calendarSub', 'Festivals · Tithis · Print'),
      screen: 'Calendar',
    },
    {
      ionicon: 'moon-outline',
      title: t('home.tiles.tithiTitle', 'Tithi Calculator'),
      sub: t('home.tiles.tithiSub', 'Lunar date for any day'),
      screen: 'TithiCalculator',
    },
    {
      ionicon: 'star-outline',
      title: t('home.tiles.muhuratTitle', 'Shubh Muhurat'),
      sub: t('home.tiles.muhuratSub', 'Auspicious timings'),
      screen: 'MuhuratEventPicker',
    },
    {
      ionicon: 'flame-outline',
      title: t('home.tiles.pujaTitle', "Pu'za Paath"),
      sub: t('home.tiles.pujaSub', 'Interactive · Step by step'),
      screen: 'PujaHome',
    },
    {
      ionicon: 'document-text-outline',
      title: t('home.tiles.tekniTitle', 'Tekni'),
      sub: t('home.tiles.tekniSub', 'Janam Kundali · PDF'),
      screen: 'TekniInput',
    },
    {
      ionicon: 'telescope-outline',
      title: t('home.tiles.zatukTitle', 'Zatuk'),
      sub: t('home.tiles.zatukSub', 'Full Horoscope'),
      soon: true,
    },
    {
      ionicon: 'planet-outline',
      title: t('home.tiles.jyotishTitle', 'Jyotish'),
      sub: t('home.tiles.jyotishSub', 'Vedic Astrology'),
      soon: true,
    },
  ];

  const today = new Date();
  const ds = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;
  const lunar = useMemo(() => gregorianToLunar(ds), [ds]);

  const todayFestivals = useMemo(() => {
    if (!lunar) return [];
    return KP_FESTIVALS.filter(
      f => (f.lunarMonth === lunar.lunarMonth || f.lunarMonthAlt === lunar.lunarMonth)
        && f.paksha === lunar.paksha && f.tithi === lunar.tithiNum,
    );
  }, [lunar]);

  const todayObs = useMemo(() => {
    if (!lunar) return [];
    return getMonthlyObservances(lunar.tithiNum, lunar.paksha);
  }, [lunar]);

  const greg = `${MONTHS[today.getMonth()]} ${today.getDate()}, ${today.getFullYear()}`;
  const day = DAYS[today.getDay()];
  const tithi = lunar
    ? lunar.tithiNum === 15
      ? (lunar.paksha === 'shukla'
        ? `${t('common.purnima', 'Purnima')} (15)`
        : `${t('common.amavasya', 'Amavasya')} (15)`)
      : lunar.tithi
    : '';

  const languageButtons: { code: AppLocale; label: string }[] = [
    { code: 'en', label: 'EN' },
    { code: 'hi', label: 'HI' },
    { code: 'ks', label: 'KS' },
  ];

  const handleHelpPress = React.useCallback(() => {
    try {
      navigation.navigate('Help' as never);
    } catch {
      navigation.dispatch(CommonActions.navigate({ name: 'Help' }));
    }
  }, [navigation]);

  return (
    <ScrollView style={st.scroll} contentContainerStyle={[st.scrollInner, { paddingHorizontal: horizontalPadding }]}>
      <View style={[st.container, { maxWidth: maxContentWidth }]}>

        {/* ── Header Card ─────────────────────────────────── */}
        <LinearGradient
          colors={['#FDF6E8', '#F7F2EB']}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={st.heroCard}
        >
          <View style={st.heroRow}>
            <Image source={logoImg} style={st.logo} />
            <View style={st.heroText}>
              <View style={st.nameRow}>
                <Text style={st.nameDev}>जंथरी</Text>
                <Text style={st.nameEng}> Janthari</Text>
              </View>
              {lunar && (
                <Text style={st.panchang} numberOfLines={2}>
                  {greg} · {day}{'\n'}
                  {lunar.lunarMonth} · {lunar.paksha === 'shukla'
                    ? t('common.shuklaPaksha', 'Shukla')
                    : t('common.krishnaPaksha', 'Krishna')} Paksha · {tithi}
                </Text>
              )}
            </View>
            {/* Language chips */}
            <View style={st.langGroup}>
              {languageButtons.map((item) => (
                <TouchableOpacity
                  key={item.code}
                  style={[st.langChip, locale === item.code && st.langChipActive]}
                  onPress={() => setLocale(item.code)}
                  accessibilityRole="button"
                >
                  <Text style={[st.langChipText, locale === item.code && st.langChipTextActive]}>{item.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </LinearGradient>

        {/* ── Today's Festivals ────────────────────────────── */}
        {(todayFestivals.length > 0 || todayObs.length > 0) && (
          <View style={st.festPanel}>
            {todayFestivals.slice(0, 2).map((f: KPFestival, i) => (
              <View key={i} style={[st.festTag, f.category === 'major' && st.festMajor]}>
                <Ionicons name="sparkles-outline" size={11} color={f.category === 'major' ? '#7B5A2F' : '#666'} style={{ marginRight: 4 }} />
                <Text style={[st.festText, f.category === 'major' && st.festMajorText]}>{f.name}</Text>
              </View>
            ))}
            {todayObs.slice(0, 2).map((o, i) => (
              <Text key={`o${i}`} style={st.obsText}>· {o}</Text>
            ))}
          </View>
        )}

        {/* ── Auth Strip ───────────────────────────────────── */}
        {isAuthenticated && user ? (
          <View style={st.authStrip}>
            <Ionicons name="person-circle-outline" size={16} color="#2E7D32" />
            <Text style={st.authEmail} numberOfLines={1}>{user.email}</Text>
            {activeProfileName && <Text style={st.authProfileChip}>{activeProfileName}</Text>}
            <View style={{ flex: 1 }} />
            <TouchableOpacity onPress={() => navigation.navigate('Calendar', { openAllEvents: true })} style={st.authBtn}>
              <Text style={st.authBtnText}>Events</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('TekniLibrary')} style={st.authBtn}>
              <Text style={st.authBtnText}>Tekni</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('Setup', { activeProfileId: activeProfileId ?? undefined })} style={st.authBtn}>
              <Text style={st.authBtnText}>Profile</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={signOut} style={[st.authBtn, st.authBtnLogout]}>
              <Text style={[st.authBtnText, st.authBtnLogoutText]}>Logout</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={st.authStrip}>
            <Ionicons name="person-outline" size={16} color="#999" />
            <Text style={st.authGuestLabel}>Sign in to save Tekni & Events</Text>
            <View style={{ flex: 1 }} />
            <TouchableOpacity onPress={() => navigation.navigate('Setup')} style={st.authBtn}>
              <Text style={st.authBtnText}>Setup</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={signInWithGoogle} style={[st.authBtn, st.authBtnSignIn]}>
              <Ionicons name="logo-google" size={12} color="#fff" style={{ marginRight: 4 }} />
              <Text style={[st.authBtnText, { color: '#fff' }]}>Sign In</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ── Feature Grid ─────────────────────────────────── */}
        <View style={[st.grid, { gap: gridGap }]}>
          {tiles.map((tile, i) => {
            const inner = (
              <View style={[st.tile, { height: tileHeight }, tile.soon && st.tileSoon]}>
                <View style={st.iconBox}>
                  <Ionicons name={tile.ionicon} size={28} color='#8B0000' />
                </View>
                <Text style={st.tileName} numberOfLines={2}>{tile.title}</Text>
                <Text style={st.tileSub} numberOfLines={2}>{tile.sub}</Text>
                {tile.soon && (
                  <View style={st.badge}><Text style={st.badgeText}>{t('common.comingSoon', 'Soon')}</Text></View>
                )}
              </View>
            );

            if (tile.screen) {
              return (
                <TouchableOpacity
                  key={i}
                  style={{ width: tileWidthPct }}
                  onPress={() => navigation.navigate(tile.screen as any, tile.params as any)}
                  activeOpacity={0.75}
                  accessibilityRole="button"
                  accessibilityLabel={`${tile.title}. ${tile.sub}`}
                >
                  {inner}
                </TouchableOpacity>
              );
            }
            return <View key={i} style={{ width: tileWidthPct }}>{inner}</View>;
          })}
        </View>

        {/* ── Footer ───────────────────────────────────────── */}
        <View style={st.footerCard}>
          <Text style={st.footerText}>Namaskar.</Text>
          <Text style={st.footerText}>
            This app helps the KP community stay rooted in tradition while keeping important dates and tithis accessible.
          </Text>
          <Text style={st.footerText}>
            Calendar and tithi outputs are computed using trusted astronomical references.
          </Text>
          <Text style={st.footerText}>
            Please review the "How This Works" section for full methodology.
          </Text>
          <Text style={[st.footerText, st.footerTextLast]}>
            We will continue to improve the app with regular updates while keeping the experience simple and consistent.
          </Text>

          <TouchableOpacity
            style={st.footerHelpBtn}
            onPress={handleHelpPress}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Open Help and FAQ"
          >
            <Ionicons name="help-circle-outline" size={14} color="#596273" />
            <Text style={st.footerHelpBtnText}>Open Help & FAQ</Text>
          </TouchableOpacity>
        </View>

      </View>
    </ScrollView>
  );
}

const st = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: '#F2F2F5' },
  scrollInner: { alignItems: 'center', paddingVertical: 10 },
  container: { width: '100%', alignItems: 'stretch' },

  // ── Header Card ──────────────────────────────────────────
  heroCard: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#DDD5C4',
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 8,
  },
  heroRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logo: {
    width: 42,
    height: 42,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#D0C5B0',
  },
  heroText: { flex: 1 },
  nameRow: { flexDirection: 'row', alignItems: 'baseline', flexWrap: 'wrap', flexShrink: 1 },
  nameDev: { fontSize: 15, fontWeight: '800', color: '#8F744A', flexShrink: 1 },
  nameEng: { fontSize: 19, fontWeight: '700', color: '#1C2130', flexShrink: 1 },
  panchang: { fontSize: 11, color: '#4A5068', fontWeight: '600', marginTop: 2, lineHeight: 16 },

  langGroup: { flexDirection: 'column', gap: 4, alignItems: 'flex-end' },
  langChip: {
    borderWidth: 1,
    borderColor: '#CFC8BA',
    borderRadius: 5,
    paddingHorizontal: 7,
    paddingVertical: 2,
    backgroundColor: '#FFFFFFCC',
    minWidth: 30,
    alignItems: 'center',
  },
  langChipActive: { borderColor: '#A8895F', backgroundColor: '#F5E9D5' },
  langChipText: { fontSize: 10, color: '#666', fontWeight: '700' },
  langChipTextActive: { color: '#75572F' },

  // ── Festivals ────────────────────────────────────────────
  festPanel: {
    borderWidth: 1,
    borderColor: '#E1D8C8',
    backgroundColor: '#FFFBF3',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginBottom: 8,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    alignItems: 'center',
  },
  festTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECE7DD',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  festMajor: { backgroundColor: '#F4E6CE' },
  festText: { fontSize: 11, fontWeight: '700', color: '#555' },
  festMajorText: { color: '#7B5A2F' },
  obsText: { fontSize: 11, color: '#696969' },

  // ── Auth Strip ───────────────────────────────────────────
  authStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E4E0D8',
    paddingHorizontal: 10,
    paddingVertical: 7,
    marginBottom: 8,
    gap: 6,
  },
  authEmail: { fontSize: 11, color: '#444', fontWeight: '600', flexShrink: 1 },
  authGuestLabel: { fontSize: 11, color: '#888', flexShrink: 1 },
  authProfileChip: {
    fontSize: 10,
    backgroundColor: '#E8F5E9',
    color: '#2E7D32',
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 1,
    fontWeight: '700',
  },
  authBtn: {
    backgroundColor: '#F4F4F6',
    borderRadius: 6,
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: '#DDD',
    flexDirection: 'row',
    alignItems: 'center',
  },
  authBtnText: { fontSize: 11, fontWeight: '700', color: '#444' },
  authBtnLogout: { borderColor: '#FFCDD2', backgroundColor: '#FFF0F0' },
  authBtnLogoutText: { color: '#C62828' },
  authBtnSignIn: { backgroundColor: '#FF6D00', borderColor: '#FF6D00' },

  // ── Feature Grid ─────────────────────────────────────────
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 8,
    marginBottom: 8,
  },
  tile: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#8B0000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 7,
  },
  tileSoon: { opacity: 0.45 },
  iconBox: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: '#FFF0EE',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  tileName: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1C2130',
    textAlign: 'center',
    lineHeight: 18,
  },
  tileSub: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
    textAlign: 'center',
    lineHeight: 15,
  },
  badge: {
    backgroundColor: '#EAE4D8',
    borderRadius: 5,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginTop: 5,
  },
  badgeText: { fontSize: 9, fontWeight: '800', color: '#776241' },

  // ── Footer ───────────────────────────────────────────────
  footerCard: {
    marginBottom: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#DDD5C4',
    backgroundColor: '#FAF7F2',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  footerText: {
    fontSize: 11,
    lineHeight: 15,
    color: '#5A5A66',
    textAlign: 'center',
    marginBottom: 3,
  },
  footerTextLast: {
    marginBottom: 8,
  },
  footerHelpBtn: {
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D7DBE2',
    backgroundColor: '#EEF1F5',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    gap: 6,
  },
  footerHelpBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#4A5260',
  },
});
