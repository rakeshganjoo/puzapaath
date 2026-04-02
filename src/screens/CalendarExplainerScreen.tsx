import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'CalendarExplainer'>;

// ── Visual helpers ──────────────────────────────────────────────────────

function MoonPhase({ emoji, label }: { emoji: string; label: string }) {
  return (
    <View style={s.moonItem}>
      <Text style={s.moonEmoji}>{emoji}</Text>
      <Text style={s.moonLabel}>{label}</Text>
    </View>
  );
}

function CompareRow({ left, right }: { left: string; right: string }) {
  return (
    <View style={s.compareRow}>
      <Text style={[s.compareCell, s.compareCellLeft]}>{left}</Text>
      <Text style={s.compareArrow}>↔</Text>
      <Text style={[s.compareCell, s.compareCellRight]}>{right}</Text>
    </View>
  );
}

function MindMapNode({ text, children, color }: { text: string; children?: string[]; color: string }) {
  return (
    <View style={s.mapNode}>
      <View style={[s.mapBubble, { backgroundColor: color }]}>
        <Text style={s.mapBubbleText}>{text}</Text>
      </View>
      {children && (
        <View style={s.mapChildren}>
          {children.map((c, i) => (
            <View key={i} style={s.mapChild}>
              <View style={[s.mapLine, { backgroundColor: color }]} />
              <View style={s.mapChildBubble}>
                <Text style={s.mapChildText}>{c}</Text>
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

// ── Main Screen ─────────────────────────────────────────────────────────

export default function CalendarExplainerScreen({ navigation }: Props) {
  return (
    <ScrollView style={s.container} contentContainerStyle={s.content}>

      {/* Title */}
      <Text style={s.title}>How Does the Kashmiri Calendar Work?</Text>
      <Text style={s.subtitle}>A simple guide 🎒</Text>

      {/* ── Section 1: Two Calendars ── */}
      <View style={s.card}>
        <Text style={s.sectionTitle}>🌍 Two Ways to Track Time</Text>
        <Text style={s.body}>
          You already know the <Text style={s.bold}>Gregorian calendar</Text> — January to December, 
          the one hanging on your wall. It follows the <Text style={s.bold}>Sun</Text>. {'\n\n'}
          There's another way: the <Text style={s.bold}>Hindu (Lunisolar) calendar</Text>. 
          It follows the <Text style={s.bold}>Moon</Text> and has been used in India for thousands of years.{'\n\n'}
          Kashmiri Pandits use a special version called the <Text style={s.bold}>Purnimant</Text> system.
        </Text>
      </View>

      {/* Visual: Sun vs Moon */}
      <View style={s.vsCard}>
        <View style={s.vsCol}>
          <Text style={s.vsEmoji}>☀️</Text>
          <Text style={s.vsLabel}>Gregorian</Text>
          <Text style={s.vsDetail}>Follows the Sun</Text>
          <Text style={s.vsDetail}>365 days/year</Text>
          <Text style={s.vsDetail}>12 fixed months</Text>
        </View>
        <Text style={s.vsDivider}>VS</Text>
        <View style={s.vsCol}>
          <Text style={s.vsEmoji}>🌙</Text>
          <Text style={s.vsLabel}>KP Calendar</Text>
          <Text style={s.vsDetail}>Follows the Moon</Text>
          <Text style={s.vsDetail}>~354 days/year</Text>
          <Text style={s.vsDetail}>12 lunar months</Text>
        </View>
      </View>

      {/* ── Section 2: Moon Phases ── */}
      <View style={s.card}>
        <Text style={s.sectionTitle}>🌕 The Moon is the Clock</Text>
        <Text style={s.body}>
          Watch the moon tonight! Over about <Text style={s.bold}>30 days</Text>, the moon goes through a full cycle:
        </Text>
      </View>

      {/* Moon phase diagram */}
      <View style={s.moonCard}>
        <View style={s.moonRow}>
          <MoonPhase emoji="🌑" label="New Moon (Amavasya)" />
          <Text style={s.moonArrow}>→</Text>
          <MoonPhase emoji="🌒" label="Waxing Crescent" />
          <Text style={s.moonArrow}>→</Text>
          <MoonPhase emoji="🌓" label="First Quarter" />
          <Text style={s.moonArrow}>→</Text>
          <MoonPhase emoji="🌔" label="Waxing Gibbous" />
        </View>
        <View style={s.moonRow}>
          <MoonPhase emoji="🌕" label="Full Moon (Purnima)" />
          <Text style={s.moonArrow}>→</Text>
          <MoonPhase emoji="🌖" label="Waning Gibbous" />
          <Text style={s.moonArrow}>→</Text>
          <MoonPhase emoji="🌗" label="Last Quarter" />
          <Text style={s.moonArrow}>→</Text>
          <MoonPhase emoji="🌘" label="Waning Crescent" />
        </View>
        <Text style={s.moonCaption}>One full cycle ≈ 29.5 days = 1 lunar month</Text>
      </View>

      <View style={s.card}>
        <Text style={s.body}>
          Each lunar month is split into <Text style={s.bold}>two halves</Text>:{'\n\n'}
          🌒 <Text style={s.bold}>Shukla Paksha</Text> (Bright Half) — Moon grows bigger {'\n'}
          {'    '}New Moon → Full Moon = Days 1–15{'\n\n'}
          🌘 <Text style={s.bold}>Krishna Paksha</Text> (Dark Half) — Moon gets smaller{'\n'}
          {'    '}Full Moon → New Moon = Days 1–15
        </Text>
      </View>

      {/* ── Section 3: Tithis ── */}
      <View style={s.card}>
        <Text style={s.sectionTitle}>📏 What is a Tithi?</Text>
        <Text style={s.body}>
          Just like Monday, Tuesday... are days in your week, a <Text style={s.bold}>Tithi</Text> is a 
          "lunar day." Each half-month (paksha) has <Text style={s.bold}>15 tithis</Text>:{'\n\n'}
          1. Pratipada  2. Dwitiya  3. Tritiya  4. Chaturthi  5. Panchami{'\n'}
          6. Shashthi  7. Saptami  8. <Text style={s.bold}>Ashtami</Text>  9. Navami  10. Dashami{'\n'}
          11. <Text style={s.bold}>Ekadashi</Text>  12. Dwadashi  13. <Text style={s.bold}>Trayodashi</Text>  14. Chaturdashi{'\n'}
          15. Purnima (full moon) or Amavasya (new moon)
        </Text>
        <View style={s.tipBox}>
          <Text style={s.tipText}>
            💡 <Text style={s.bold}>Think of it this way:</Text> In the Gregorian calendar you say 
            "March 17." In the KP calendar you say "Chaitra Krishna Trayodashi" 
            — that's Month + Half + Tithi!
          </Text>
        </View>
      </View>

      {/* ── Section: Kshaya & Adhika Tithis ── */}
      <View style={s.card}>
        <Text style={s.sectionTitle}>⏭️ Missing & Repeated Days (Kshaya & Adhika)</Text>
        <Text style={s.body}>
          Here's something surprising: in the lunar calendar, a day can sometimes 
          <Text style={s.bold}> go missing</Text>, and sometimes the 
          <Text style={s.bold}> same day happens twice!</Text> {'\n\n'}
          <Text style={s.bold}>Why?</Text> Because a tithi (lunar day) is NOT exactly 24 hours. 
          It depends on how fast the Moon is moving — and the Moon's speed varies!{'\n\n'}
          A tithi can be as short as <Text style={s.bold}>~19 hours</Text> or as long as{' '}
          <Text style={s.bold}>~26 hours</Text>.{'\n\n'}
          In the Hindu calendar, the tithi at <Text style={s.bold}>sunrise</Text> determines 
          which tithi "owns" that entire day.
        </Text>
      </View>

      {/* Kshaya visual */}
      <View style={[s.card, { backgroundColor: '#FFF3E0', borderColor: '#E65100' }]}>
        <Text style={s.sectionTitle}>⟳ Kshaya Tithi (Lost Day)</Text>
        <Text style={s.body}>
          Imagine a very short tithi (~19 hours). It starts <Text style={s.bold}>after</Text> sunrise 
          on Monday and ends <Text style={s.bold}>before</Text> sunrise on Tuesday. 
          No sunrise ever falls during it!
        </Text>
        <View style={s.kshayaVisual}>
          <View style={s.kshayaRow}>
            <View style={[s.kshayaBox, { backgroundColor: '#4A90D9' }]}>
              <Text style={s.kshayaBoxText}>Mon sunrise{'\n'}Tithi 4</Text>
            </View>
            <View style={[s.kshayaBox, { backgroundColor: '#E74C3C', opacity: 0.5 }]}>
              <Text style={s.kshayaBoxText}>Tithi 5{'\n'}(no sunrise!)</Text>
            </View>
            <View style={[s.kshayaBox, { backgroundColor: '#4A90D9' }]}>
              <Text style={s.kshayaBoxText}>Tue sunrise{'\n'}Tithi 6</Text>
            </View>
          </View>
          <Text style={[s.body, { marginTop: 8, textAlign: 'center' }]}>
            Tithi 5 is <Text style={s.bold}>kshaya</Text> (lost) — it simply doesn't appear
            in the calendar! Monday shows 4, Tuesday shows 6.
          </Text>
        </View>
      </View>

      {/* Adhika visual */}
      <View style={[s.card, { backgroundColor: '#E3F2FD', borderColor: '#1565C0' }]}>
        <Text style={s.sectionTitle}>⟲ Adhika Tithi (Repeated Day)</Text>
        <Text style={s.body}>
          Now imagine a slow-moving Moon making a long tithi (~26 hours). 
          It's active at <Text style={s.bold}>two</Text> consecutive sunrises!
        </Text>
        <View style={s.kshayaVisual}>
          <View style={s.kshayaRow}>
            <View style={[s.kshayaBox, { backgroundColor: '#27AE60' }]}>
              <Text style={s.kshayaBoxText}>Mon sunrise{'\n'}Tithi 8</Text>
            </View>
            <View style={[s.kshayaBox, { backgroundColor: '#27AE60' }]}>
              <Text style={s.kshayaBoxText}>Tue sunrise{'\n'}Tithi 8</Text>
            </View>
            <View style={[s.kshayaBox, { backgroundColor: '#4A90D9' }]}>
              <Text style={s.kshayaBoxText}>Wed sunrise{'\n'}Tithi 9</Text>
            </View>
          </View>
          <Text style={[s.body, { marginTop: 8, textAlign: 'center' }]}>
            Tithi 8 is <Text style={s.bold}>adhika</Text> (extra) — it appears twice!
            Both Monday and Tuesday show the same tithi.
          </Text>
        </View>
      </View>

      <View style={s.tipBox}>
        <Text style={s.tipText}>
          💡 <Text style={s.bold}>Fun fact:</Text> Kshaya and Adhika tithis happen a few times every 
          month! Our calendar marks them with{' '}
          <Text style={{ color: '#E65100', fontWeight: '700' }}>⟳ Kshaya</Text> and{' '}
          <Text style={{ color: '#1565C0', fontWeight: '700' }}>⟲ Adhika</Text>{' '}
          badges so you can spot them.
        </Text>
      </View>

      {/* ── Section 4: Month Names ── */}
      <View style={s.card}>
        <Text style={s.sectionTitle}>📆 12 Months — Both Calendars</Text>
        <Text style={s.body}>
          The Gregorian year starts in January. The KP year starts in <Text style={s.bold}>Chaitra</Text> (around March/April). 
          Here is how the 12 months line up roughly:
        </Text>
      </View>

      <View style={s.compareCard}>
        <View style={s.compareHeader}>
          <Text style={s.compareHeaderText}>Gregorian</Text>
          <Text style={s.compareHeaderText}>  </Text>
          <Text style={s.compareHeaderText}>KP (Purnimant)</Text>
        </View>
        <CompareRow left="Mar – Apr" right="Chaitra (चैत्र)" />
        <CompareRow left="Apr – May" right="Vaishakh (वैशाख)" />
        <CompareRow left="May – Jun" right="Jyeshtha (ज्येष्ठ)" />
        <CompareRow left="Jun – Jul" right="Ashadh (आषाढ़)" />
        <CompareRow left="Jul – Aug" right="Shravan (श्रावण)" />
        <CompareRow left="Aug – Sep" right="Bhadrapad (भाद्रपद)" />
        <CompareRow left="Sep – Oct" right="Ashwin (आश्विन)" />
        <CompareRow left="Oct – Nov" right="Kartik (कार्तिक)" />
        <CompareRow left="Nov – Dec" right="Margshirsh (मार्गशीर्ष)" />
        <CompareRow left="Dec – Jan" right="Paush (पौष)" />
        <CompareRow left="Jan – Feb" right="Magh (माघ)" />
        <CompareRow left="Feb – Mar" right="Phalgun (फाल्गुन)" />
      </View>

      {/* ── Section 5: Purnimant Explained ── */}
      <View style={s.card}>
        <Text style={s.sectionTitle}>🔑 What Makes KP "Purnimant" Special?</Text>
        <Text style={s.body}>
          In India, there are <Text style={s.bold}>two ways</Text> to name lunar months:{'\n\n'}
          • <Text style={s.bold}>Amanta</Text> (used in South India): The month ends at the new moon (Amavasya).{'\n'}
          • <Text style={s.bold}>Purnimant</Text> (used by KPs and North India): The month ends at the full moon (Purnima).{'\n\n'}
          <Text style={s.bold}>Practical difference:</Text> During Krishna Paksha (the dark half), the month name 
          is one ahead in Purnimant. So what South Indians call "Phalgun Krishna" is called 
          "<Text style={s.bold}>Chaitra Krishna</Text>" by Kashmiri Pandits!
        </Text>
      </View>

      {/* ── Mind Map ── */}
      <Text style={s.mapTitle}>🧠 Mind Map: KP Calendar at a Glance</Text>
      <View style={s.mapContainer}>
        <View style={[s.mapBubble, { backgroundColor: '#6C5CE7', alignSelf: 'center' }]}>
          <Text style={[s.mapBubbleText, { fontSize: 14 }]}>KP Calendar</Text>
        </View>
        <View style={s.mapBranches}>
          <MindMapNode
            text="📅 12 Months"
            color="#4A90D9"
            children={['Chaitra → Phalgun', 'Starts ~March/April (Navreh)', '~29.5 days each']}
          />
          <MindMapNode
            text="🌗 2 Pakshas"
            color="#27AE60"
            children={['Shukla = Bright (growing moon)', 'Krishna = Dark (shrinking moon)']}
          />
          <MindMapNode
            text="📏 15 Tithis"
            color="#E67E22"
            children={['Each paksha has 15 tithis', 'Pratipada (1) → Purnima/Amavasya (15)']}
          />
          <MindMapNode
            text="🌕 Purnimant"
            color="#9B59B6"
            children={['Month ends at Full Moon', 'Used by KPs & North India', 'Krishna Paksha shifts +1 month']}
          />
          <MindMapNode
            text="🔭 Astronomy"
            color="#E74C3C"
            children={['Based on real moon phase', 'Meeus algorithm for accuracy', 'IST sunrise determines tithi']}
          />
          <MindMapNode
            text="🎉 Festivals"
            color="#F39C12"
            children={['Navreh (New Year)', 'Herath (Shivratri)', 'Zyeshta Ashtami', 'Janmashtami, Diwali, etc.']}
          />
        </View>
      </View>

      {/* ── Section 6: How We Calculate ── */}
      <View style={s.card}>
        <Text style={s.sectionTitle}>🔬 How This App Calculates the Calendar</Text>
        <Text style={s.body}>
          We don't just look up dates in a table — we calculate them from real astronomy!{'\n\n'}
          <Text style={s.bold}>Step 1:</Text> Find the exact moment of each New Moon using the 
          Jean Meeus algorithm (a famous astronomer's math formula accurate to ±2 minutes).{'\n\n'}
          <Text style={s.bold}>Step 2:</Text> Figure out which New Moon starts Chaitra each year 
          (the one closest to the Spring Equinox, around March 20).{'\n\n'}
          <Text style={s.bold}>Step 3:</Text> For any Gregorian date, calculate how many days have passed since 
          the last New Moon. Divide by the tithi length to get the current tithi number.{'\n\n'}
          <Text style={s.bold}>Step 4:</Text> Count New Moons from Chaitra to determine the month. 
          If it's Krishna Paksha, shift the month name forward by 1 (Purnimant rule).{'\n\n'}
          <Text style={s.bold}>Step 5:</Text> Evaluate everything at IST sunrise (6:00 AM India time), 
          because in the Hindu system, the tithi at sunrise is the tithi for that entire day.
        </Text>
      </View>

      {/* ── Visual: Calendar Address ── */}
      <View style={s.card}>
        <Text style={s.sectionTitle}>🏠 Reading a Calendar "Address"</Text>
        <Text style={s.body}>
          Just like a home address has Street → City → Country, a KP date has:
        </Text>
        <View style={s.addressBox}>
          <View style={s.addressRow}>
            <Text style={s.addressLabel}>Month →</Text>
            <View style={[s.addressTag, { backgroundColor: '#4A90D920' }]}>
              <Text style={[s.addressTagText, { color: '#4A90D9' }]}>Chaitra</Text>
            </View>
          </View>
          <View style={s.addressRow}>
            <Text style={s.addressLabel}>Half →</Text>
            <View style={[s.addressTag, { backgroundColor: '#27AE6020' }]}>
              <Text style={[s.addressTagText, { color: '#27AE60' }]}>Krishna Paksha</Text>
            </View>
          </View>
          <View style={s.addressRow}>
            <Text style={s.addressLabel}>Day →</Text>
            <View style={[s.addressTag, { backgroundColor: '#E67E2220' }]}>
              <Text style={[s.addressTagText, { color: '#E67E22' }]}>Trayodashi (13)</Text>
            </View>
          </View>
          <View style={s.addressRow}>
            <Text style={s.addressLabel}>Weekday →</Text>
            <View style={[s.addressTag, { backgroundColor: '#9B59B620' }]}>
              <Text style={[s.addressTagText, { color: '#9B59B6' }]}>Mangalvar (Tuesday)</Text>
            </View>
          </View>
        </View>
        <Text style={[s.body, { marginTop: 8 }]}>
          So March 17, 2026 = <Text style={s.bold}>Chaitra Krishna Trayodashi, Mangalvar</Text>
        </Text>
      </View>

      {/* ── Fun Facts ── */}
      <View style={[s.card, { backgroundColor: '#FFF9F0', borderColor: '#E8DCC8' }]}>
        <Text style={s.sectionTitle}>🤯 Cool Facts</Text>
        <Text style={s.body}>
          • The KP New Year (<Text style={s.bold}>Navreh</Text>) falls on Chaitra Shukla Pratipada 
          — the first bright day after the spring new moon!{'\n\n'}
          • <Text style={s.bold}>Herath</Text> (Shivratri) is always Phalgun Krishna Trayodashi 
          — the darkest night of the year before spring.{'\n\n'}
          • The lunar year is about <Text style={s.bold}>11 days shorter</Text> than the solar year. 
          That's why festivals "move around" in the Gregorian calendar each year!{'\n\n'}
          • The word "<Text style={s.bold}>Monday</Text>" comes from "Moon-day" — even English weekday names 
          connect to celestial bodies, just like the Sanskrit Somvar (Som = Moon)!
        </Text>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

// ── Styles ──────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F8' },
  content: { padding: 16 },

  title: { fontSize: 22, fontWeight: '700', color: '#2D2D3A', textAlign: 'center', marginTop: 8 },
  subtitle: { fontSize: 14, color: '#888', textAlign: 'center', marginTop: 4, marginBottom: 16 },

  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#EAEAEF',
  },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: '#2D2D3A', marginBottom: 10 },
  body: { fontSize: 14, color: '#444', lineHeight: 22 },
  bold: { fontWeight: '700', color: '#2D2D3A' },

  // Sun vs Moon
  vsCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#EAEAEF',
    alignItems: 'center',
  },
  vsCol: { flex: 1, alignItems: 'center' },
  vsEmoji: { fontSize: 36 },
  vsLabel: { fontSize: 14, fontWeight: '700', color: '#2D2D3A', marginTop: 6 },
  vsDetail: { fontSize: 12, color: '#666', marginTop: 2 },
  vsDivider: { fontSize: 16, fontWeight: '700', color: '#CCC', marginHorizontal: 8 },

  // Moon phases
  moonCard: {
    backgroundColor: '#1A1A2E',
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
  },
  moonRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 10, flexWrap: 'wrap' },
  moonItem: { alignItems: 'center', width: 68 },
  moonEmoji: { fontSize: 28 },
  moonLabel: { fontSize: 9, color: '#CCC', textAlign: 'center', marginTop: 2 },
  moonArrow: { fontSize: 14, color: '#666', marginHorizontal: 2 },
  moonCaption: { fontSize: 12, color: '#888', textAlign: 'center', marginTop: 4 },

  // Tip box
  tipBox: {
    backgroundColor: '#FFF9F0',
    borderRadius: 10,
    padding: 12,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#E8DCC8',
  },
  tipText: { fontSize: 13, color: '#9A7B4F', lineHeight: 20 },

  // Compare table
  compareCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#EAEAEF',
  },
  compareHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#EAEAEF',
  },
  compareHeaderText: { flex: 1, fontSize: 12, fontWeight: '700', color: '#6C5CE7', textAlign: 'center' },
  compareRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
  },
  compareCell: { flex: 1, fontSize: 13, color: '#444' },
  compareCellLeft: { textAlign: 'right', paddingRight: 4 },
  compareCellRight: { textAlign: 'left', paddingLeft: 4, fontWeight: '500' },
  compareArrow: { fontSize: 11, color: '#CCC', marginHorizontal: 4 },

  // Mind map
  mapTitle: { fontSize: 17, fontWeight: '700', color: '#2D2D3A', textAlign: 'center', marginTop: 8, marginBottom: 12 },
  mapContainer: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#EAEAEF',
  },
  mapBranches: { marginTop: 12 },
  mapNode: { marginBottom: 12 },
  mapBubble: {
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 14,
    alignSelf: 'flex-start',
  },
  mapBubbleText: { fontSize: 13, fontWeight: '700', color: '#fff' },
  mapChildren: { marginLeft: 20, marginTop: 4 },
  mapChild: { flexDirection: 'row', alignItems: 'center', marginBottom: 3 },
  mapLine: { width: 16, height: 2, borderRadius: 1, marginRight: 6 },
  mapChildBubble: {
    backgroundColor: '#F5F5F8',
    borderRadius: 6,
    paddingVertical: 3,
    paddingHorizontal: 8,
  },
  mapChildText: { fontSize: 12, color: '#555' },

  // Address
  addressBox: { marginTop: 10, marginBottom: 4 },
  addressRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  addressLabel: { width: 80, fontSize: 13, fontWeight: '600', color: '#888' },
  addressTag: { borderRadius: 8, paddingVertical: 4, paddingHorizontal: 12 },
  addressTagText: { fontSize: 14, fontWeight: '700' },

  // Kshaya / Adhika visual diagrams
  kshayaVisual: { marginTop: 12 },
  kshayaRow: { flexDirection: 'row', justifyContent: 'center', gap: 8 },
  kshayaBox: {
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: 'center',
    minWidth: 90,
  },
  kshayaBoxText: { fontSize: 12, fontWeight: '600', color: '#fff', textAlign: 'center' },
});
