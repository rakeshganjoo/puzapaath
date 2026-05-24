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
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { gregorianToLunar, DAYS } from '../services/HinduCalendar';
import { KP_FESTIVALS, getMonthlyObservances, type KPFestival } from '../data/kpFestivals';
import { useTheme } from '../contexts/UIContext';
import { useAuth } from '../contexts/AuthContext';
import { getActiveProfile } from '../services/ProfileService';
import type { AppLocale } from '../i18n/translations';

const logoImg = require('../assets/images/tiles/jan-swastik_tile.jpeg');
const ganeshaImg = require('../assets/images/tiles/jan-ganesha_tile.jpeg');
const bramhaImg = require('../assets/images/tiles/jan-bramha_tile.jpeg');
const birthdayImg = require('../assets/images/tiles/jan-birthday_tile2.jpeg');
const tekniImg = require('../assets/images/tiles/jan-tekni_tile.jpeg');
const zatukImg = require('../assets/images/tiles/jan-zatuk_tile.jpeg');
const tithiImg = require('../assets/images/tiles/jan-tithi_tile.jpeg');
const saathImg = require('../assets/images/tiles/jan-saath_tile.jpeg');

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];

import type { ImageSourcePropType } from 'react-native';

type Tile = {
  icon: string;
  title: string;
  sub: string;
  screen?: keyof RootStackParamList;
  params?: RootStackParamList[keyof RootStackParamList];
  soon?: boolean;
  img?: ImageSourcePropType;
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

  // Load active profile name
  React.useEffect(() => {
    const loadProfile = async () => {
      const profile = await getActiveProfile();
      setActiveProfileName(profile?.personName ?? null);
      setActiveProfileId(profile?.id ?? null);
    };
    loadProfile();
  }, []);

  const browser = useMemo(() => detectWebBrowser(), []);
  const isWeb = Platform.OS === 'web';
  const profile: LayoutProfile = width >= 1100 ? 'desktop' : width >= 760 ? 'tablet' : 'mobile';
  const columns = profile === 'desktop' ? 3 : 2;
  const horizontalPadding = profile === 'mobile' ? 14 : 20;
  const gridGap = profile === 'mobile' ? 10 : 14;
  const maxContentWidth = profile === 'desktop' ? 1120 : profile === 'tablet' ? 860 : 460;
  const contentWidth = Math.min(width - horizontalPadding * 2, maxContentWidth);
  const tileWidth = Math.max(148, Math.floor((contentWidth - gridGap * (columns - 1)) / columns));

  const tileMinHeight = profile === 'mobile' ? 168 : 182;
  const titleSize = profile === 'mobile' ? 15 : 17;
  const subtitleSize = profile === 'mobile' ? 12 : 13;

  const tiles: Tile[] = [
    {
      icon: '\u25C9',
      img: ganeshaImg,
      title: t('home.tiles.calendarTitle', 'KP Calendar'),
      sub: t('home.tiles.calendarSub', 'Festivals - Tithis - Print'),
      screen: 'Calendar',
    },
    {
      icon: '\u25C8',
      img: tithiImg,
      title: t('home.tiles.tithiTitle', 'Tithi Calculator'),
      sub: t('home.tiles.tithiSub', 'Find lunar date for any day'),
      screen: 'TithiCalculator',
    },
    {
      icon: '\u2737',
      img: saathImg,
      title: t('home.tiles.muhuratTitle', 'Shubh Muhurat Finder'),
      sub: t('home.tiles.muhuratSub', 'Auspicious time for events'),
      screen: 'MuhuratEventPicker',
    },
    {
      icon: '\u2726',
      img: birthdayImg,
      title: t('home.tiles.pujaTitle', "Pu'za Paath (Interactive)"),
      sub: t('home.tiles.pujaSub', 'JanamDin - Step by step'),
      screen: 'PujaHome',
    },
    {
      icon: '\u25CE',
      img: tekniImg,
      title: t('home.tiles.tekniTitle', 'Tekni Making'),
      sub: t('home.tiles.tekniSub', 'Janam Kundali and PDF'),
      screen: 'TekniInput',
    },
    {
      icon: '\u2739',
      img: zatukImg,
      title: t('home.tiles.zatukTitle', 'Zatuk'),
      sub: t('home.tiles.zatukSub', 'Full Horoscope and Kundali'),
      soon: true,
    },
    {
      icon: '\u272D',
      img: bramhaImg,
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
    { code: 'en', label: t('home.languageShort.en', 'EN') },
    { code: 'hi', label: t('home.languageShort.hi', 'HI') },
    { code: 'ks', label: t('home.languageShort.ks', 'KS') },
  ];

  return (
    <ScrollView style={st.scroll} contentContainerStyle={st.scrollInner}>
      <View style={[st.container, { width: contentWidth }]}>
        {/* Auth & Profile Section */}
        <View style={st.authSection}>
          {isAuthenticated && user ? (
            <View style={st.authCard}>
              <View style={st.authCardContent}>
                <View style={st.authInfo}>
                  <Text style={st.authLabel}>Signed In</Text>
                  <Text style={st.authEmail}>{user.email}</Text>
                  {activeProfileName && (
                    <Text style={st.authProfile}>Profile: <Text style={st.authProfileName}>{activeProfileName}</Text></Text>
                  )}
                </View>
                <TouchableOpacity style={st.logoutBtn} onPress={signOut}>
                  <Text style={st.logoutText}>Logout</Text>
                </TouchableOpacity>
              </View>

              <View style={st.authQuickRow}>
                <TouchableOpacity
                  style={st.authQuickBtn}
                  onPress={() => navigation.navigate('Calendar', { openAllEvents: true })}
                >
                  <Text style={st.authQuickBtnText}>My Events</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={st.authQuickBtn}
                  onPress={() => navigation.navigate('TekniLibrary')}
                >
                  <Text style={st.authQuickBtnText}>My Tekni</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={st.authQuickBtn}
                  onPress={() => navigation.navigate('Setup', { activeProfileId: activeProfileId ?? undefined })}
                >
                  <Text style={st.authQuickBtnText}>Update Profile</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={st.authCardSignIn}>
              <View style={st.authCardContent}>
                <View style={st.authInfo}>
                  <Text style={[st.authLabel, st.authLabelSignedOut]}>Not Signed In</Text>
                  <Text style={st.authHint}>Sign in to save Takni and Events.</Text>
                </View>
                <TouchableOpacity style={st.signinBtn} onPress={signInWithGoogle}>
                  <Text style={st.signinText}>Sign In</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        <LinearGradient
          colors={['#FEF8E8', '#F3F0EB', '#F8F4EF']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={st.heroCard}
        >
          <View style={st.geoCircleOuter} />
          <View style={st.geoCircleInner} />
          <View style={st.geoDiamond} />

          <View style={st.headerTopRow}>
            <Image source={logoImg} style={st.logo} />
            <View style={st.headerText}>
              <View style={st.nameRow}>
                <Text style={st.nameDev}>{'\u091C\u0902\u0925\u094D\u0930\u0940'}</Text>
                <Text style={st.nameEng}> Janthari</Text>
              </View>
              {lunar && (
                <Text style={st.panchang} numberOfLines={2}>
                  {greg} ({day}){'\n'}
                  {lunar.lunarMonth} {'\u2022'} {lunar.paksha === 'shukla'
                    ? t('common.shuklaPaksha', 'Shukla Paksha')
                    : t('common.krishnaPaksha', 'Krishna Paksha')} {'\u2022'} {tithi}
                </Text>
              )}
            </View>
          </View>

          <View style={st.langRow}>
            <Text style={st.langLabel}>{t('common.language', 'Language')}:</Text>
            {languageButtons.map((item) => (
              <TouchableOpacity
                key={item.code}
                style={[st.langChip, locale === item.code && st.langChipActive]}
                onPress={() => setLocale(item.code)}
                accessibilityRole="button"
                accessibilityLabel={`Switch language to ${item.label}`}
              >
                <Text style={[st.langChipText, locale === item.code && st.langChipTextActive]}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {isWeb && (
            <Text style={st.browserHint}>
              {`Optimized for ${browser} on ${profile}`}
            </Text>
          )}
        </LinearGradient>

        {(todayFestivals.length > 0 || todayObs.length > 0) && (
          <View style={st.festPanel}>
            {todayFestivals.slice(0, 2).map((f: KPFestival, i) => (
              <View key={i} style={[st.festTag, f.category === 'major' && st.festMajor]}>
                <Text style={[st.festText, f.category === 'major' && st.festMajorText]}>{f.name}</Text>
              </View>
            ))}
            {todayObs.slice(0, 2).map((o, i) => (
              <Text key={`o${i}`} style={st.obsText}>{'\u2022'} {o}</Text>
            ))}
          </View>
        )}

        <View style={st.grid}>
          {tiles.map((tile, i) => {
            const endOfRow = (i + 1) % columns === 0;
            const card = (
              <View
                style={[
                  st.tile,
                  tile.soon && st.tileSoon,
                  {
                    width: tileWidth,
                    minHeight: tileMinHeight,
                    marginRight: endOfRow ? 0 : gridGap,
                  },
                ]}
              >
                <View style={st.tileGeometry}>
                  <Text style={st.tileGeometryText}>{tile.icon}</Text>
                </View>
                {tile.img ? <Image source={tile.img} style={st.tileImg} /> : null}
                <Text style={[st.tileName, { fontSize: titleSize }]} numberOfLines={2}>{tile.title}</Text>
                <Text style={[st.tileSub, { fontSize: subtitleSize }]} numberOfLines={2}>{tile.sub}</Text>
                {tile.soon && (
                  <View style={st.badge}><Text style={st.badgeText}>{t('common.comingSoon', 'Coming Soon')}</Text></View>
                )}
              </View>
            );

            if (tile.screen) {
              return (
                <TouchableOpacity
                  key={i}
                  style={st.tileWrap}
                  onPress={() => navigation.navigate(tile.screen as any, tile.params as any)}
                  activeOpacity={0.8}
                  accessibilityRole="button"
                  accessibilityLabel={`${tile.title}. ${tile.sub}`}
                >
                  {card}
                </TouchableOpacity>
              );
            }

            return (
              <View key={i} style={st.tileWrap}>
                {card}
              </View>
            );
          })}
        </View>

        <View style={st.footerCard}>
          <Text style={st.footerText}>
            {`🙏🏻Namaskar,\n\nThis is our humble effort to help the KP community stay rooted in our traditions and values, while making important dates and tithis easily accessible on the go.\n\nThe calendar and tithi outputs are mathematically computed using trusted astronomical references, with precise calculation logic down to very fine time fractions.\n\nFor complete transparency, we encourage you to explore the "How This Works" section to understand the methodology behind each result.\n\nWe will continue to improve the app with regular updates, while keeping the experience simple, consistent, and meaningful for everyone!`}
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const st = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: '#F4F4F7' },
  scrollInner: { alignItems: 'center', paddingVertical: 6 },
  container: { maxWidth: 1120 },

  authSection: { width: '100%', paddingHorizontal: 14, marginBottom: 8 },
  authCard: {
    backgroundColor: '#E8F5E9',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#A5D6A7',
    padding: 12,
    marginBottom: 6,
  },
  authCardSignIn: {
    backgroundColor: '#FFF3E0',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#FFB74D',
    padding: 12,
    marginBottom: 6,
  },
  authCardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  authInfo: { flex: 1 },
  authLabel: { fontSize: 13, fontWeight: '700', color: '#2E7D32' },
  authEmail: { fontSize: 12, color: '#558B2F', marginTop: 2 },
  authProfile: { fontSize: 12, color: '#558B2F', marginTop: 4 },
  authProfileName: { fontWeight: '700' },
  authHint: { fontSize: 11, color: '#E65100', marginTop: 2 },
  authLabelSignedOut: { color: '#E65100' },
  signinBtn: {
    backgroundColor: '#FF9800',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginLeft: 10,
  },
  signinText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  logoutBtn: {
    backgroundColor: 'rgba(46, 125, 50, 0.15)',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginLeft: 10,
    borderWidth: 1,
    borderColor: '#A5D6A7',
  },
  logoutText: { color: '#2E7D32', fontSize: 12, fontWeight: '700' },
  authQuickRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 10,
  },
  authQuickBtn: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#A5D6A7',
  },
  authQuickBtnText: { color: '#2E7D32', fontSize: 11, fontWeight: '700' },

  heroCard: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#DBD3C3',
    overflow: 'hidden',
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 8,
    position: 'relative',
  },
  geoCircleOuter: {
    position: 'absolute',
    right: -20,
    top: -22,
    width: 92,
    height: 92,
    borderRadius: 46,
    borderWidth: 1,
    borderColor: 'rgba(168, 141, 95, 0.4)',
  },
  geoCircleInner: {
    position: 'absolute',
    right: 8,
    top: 8,
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(122, 129, 141, 0.45)',
  },
  geoDiamond: {
    position: 'absolute',
    right: 46,
    top: 52,
    width: 14,
    height: 14,
    borderWidth: 1,
    borderColor: '#A8895F',
    transform: [{ rotate: '45deg' }],
    backgroundColor: 'rgba(255, 255, 255, 0.55)',
  },

  headerTopRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  logo: {
    width: 48,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D5C6AB',
    backgroundColor: '#fff',
  },
  headerText: { marginLeft: 8, flex: 1 },

  langRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' },
  langLabel: { fontSize: 10, color: '#6A6A6A', marginRight: 6, fontWeight: '600' },
  langChip: {
    borderWidth: 1,
    borderColor: '#CFC8BA',
    borderRadius: 6,
    paddingHorizontal: 5,
    paddingVertical: 1,
    marginRight: 4,
    marginBottom: 4,
    backgroundColor: '#FFFFFFCC',
  },
  langChipActive: { borderColor: '#A8895F', backgroundColor: '#F9EFE0' },
  langChipText: { fontSize: 9, color: '#666', fontWeight: '700' },
  langChipTextActive: { color: '#75572F' },

  nameRow: { flexDirection: 'row', alignItems: 'baseline' },
  nameDev: { fontSize: 20, fontWeight: '800', color: '#8F744A' },
  nameEng: { fontSize: 28, fontWeight: '700', color: '#2A2F38' },
  panchang: { fontSize: 12, color: '#3E4660', fontWeight: '700', marginTop: 2, lineHeight: 17 },
  browserHint: { fontSize: 9, color: '#777', marginTop: 1 },

  festPanel: {
    borderWidth: 1,
    borderColor: '#E1D8C8',
    backgroundColor: '#FBF7EE',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginBottom: 6,
  },
  festTag: {
    backgroundColor: '#ECE7DD',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginBottom: 6,
    alignSelf: 'flex-start',
  },
  festMajor: { backgroundColor: '#F4E6CE' },
  festText: { fontSize: 11, fontWeight: '700', color: '#555' },
  festMajorText: { color: '#7B5A2F' },
  obsText: { fontSize: 12, color: '#696969', marginTop: 2 },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'stretch',
  },
  tileWrap: {
    marginBottom: 10,
  },
  tile: {
    backgroundColor: '#FCFCFD',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#DDD9D0',
    paddingVertical: 14,
    paddingHorizontal: 12,
    alignItems: 'center',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 6,
  },
  tileSoon: { opacity: 0.52 },
  tileGeometry: {
    position: 'absolute',
    top: 8,
    right: 10,
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#C2B59A',
    backgroundColor: '#F7EEE0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tileGeometryText: { fontSize: 10, color: '#8E7653', fontWeight: '700' },
  tileImg: {
    width: 56,
    height: 56,
    borderRadius: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2DCCF',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  tileName: {
    fontWeight: '800',
    color: '#2A2F38',
    textAlign: 'center',
    lineHeight: 22,
  },
  tileSub: {
    color: '#636A74',
    marginTop: 4,
    textAlign: 'center',
    lineHeight: 18,
  },
  badge: {
    backgroundColor: '#EAE4D8',
    borderRadius: 9,
    paddingHorizontal: 9,
    paddingVertical: 3,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#D3C8B4',
  },
  badgeText: { fontSize: 10, fontWeight: '800', color: '#776241' },
  tileIcon: {
    fontSize: 22,
    marginBottom: 10,
    color: '#8E7653',
  },
  footerCard: {
    marginTop: 4,
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#DBD3C3',
    backgroundColor: '#FBF8F2',
    paddingHorizontal: 12,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 2,
  },
  footerText: {
    fontSize: 12,
    lineHeight: 20,
    color: '#4D4D57',
    textAlign: 'left',
  },
});
