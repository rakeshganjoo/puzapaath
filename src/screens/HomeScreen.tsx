import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';
import pujaData from '../data/pujaData';
import { getActiveProfile, type UserProfile } from '../services/ProfileService';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export default function HomeScreen({ navigation }: Props) {
  const [activeProfile, setActiveProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      getActiveProfile().then(setActiveProfile);
    });
    return unsubscribe;
  }, [navigation]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.titleDev}>जन्मदिन पूजा</Text>
        <Text style={styles.titleEng}>Birthday Puja</Text>
        <Text style={styles.subtitle}>Kashmiri Pandit Tradition</Text>
      </View>

      {/* Active profile banner */}
      {activeProfile && (
        <TouchableOpacity
          style={styles.profileBanner}
          onPress={() => navigation.navigate('Setup')}
        >
          <Text style={styles.profileBannerLabel}>Active Profile</Text>
          <Text style={styles.profileBannerName}>{activeProfile.personName}</Text>
          <Text style={styles.profileBannerDetail}>
            {activeProfile.gotra} • {activeProfile.lunarMonth || '—'} • {activeProfile.tithi || '—'}
          </Text>
          <Text style={styles.profileBannerSwitch}>Tap to switch ›</Text>
        </TouchableOpacity>
      )}

      {/* Description */}
      <View style={styles.card}>
        <Text style={styles.descText}>{pujaData.description}</Text>
      </View>

      {/* Setup Button */}
      <TouchableOpacity
        style={[styles.actionBtn, { backgroundColor: '#6C5CE7' }]}
        onPress={() => navigation.navigate('Setup')}
      >
        <Text style={styles.actionBtnText}>Setup / संकल्प</Text>
        <Text style={styles.actionBtnSub}>Enter name, gotra, date</Text>
      </TouchableOpacity>

      {/* Samagri Button */}
      <TouchableOpacity
        style={[styles.actionBtn, { backgroundColor: '#6C5CE7' }]}
        onPress={() => navigation.navigate('Samagri')}
      >
        <Text style={styles.actionBtnText}>सामग्री — Materials</Text>
        <Text style={styles.actionBtnSub}>
          Checklist of {pujaData.samagri.length} items needed
        </Text>
      </TouchableOpacity>

      {/* Puja Parts */}
      <Text style={styles.sectionTitle}>Puja Sections</Text>
      {pujaData.parts.map((part) => (
        <TouchableOpacity
          key={part.id}
          style={styles.partCard}
          onPress={() => navigation.navigate('PujaNavigator', { partId: part.id })}
        >
          <View style={styles.partBadge}>
            <Text style={styles.partBadgeText}>{part.id}</Text>
          </View>
          <View style={styles.partInfo}>
            <Text style={styles.partTitleDev}>{part.title.devanagari}</Text>
            <Text style={styles.partTitleEng}>{part.title.english}</Text>
            <Text style={styles.partSub}>
              {part.steps.length} steps • {part.subtitle}
            </Text>
          </View>
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>
      ))}

      {/* Start Puja Button */}
      <TouchableOpacity
        style={[styles.actionBtn, { backgroundColor: '#6C5CE7', marginTop: 20 }]}
        onPress={() => navigation.navigate('PujaNavigator', { partId: 'A' })}
      >
        <Text style={styles.actionBtnText}>Start Full Puja</Text>
        <Text style={styles.actionBtnSub}>Begin from Part A — Doop Deep Puja</Text>
      </TouchableOpacity>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F8' },
  content: { padding: 20 },
  header: { alignItems: 'center', paddingVertical: 30 },
  titleDev: { fontSize: 32, fontWeight: '700', color: '#9A7B4F', letterSpacing: 0.5 },
  titleEng: { fontSize: 20, fontWeight: '500', color: '#2D2D3A', marginTop: 6 },
  subtitle: { fontSize: 13, color: '#999', marginTop: 4, letterSpacing: 0.3 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#EAEAEF',
  },
  descText: { fontSize: 14, color: '#666', lineHeight: 22 },
  actionBtn: {
    borderRadius: 14,
    padding: 18,
    marginBottom: 12,
    alignItems: 'center',
  },
  actionBtnText: { fontSize: 16, fontWeight: '600', color: '#fff' },
  actionBtnSub: { fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 4 },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#2D2D3A',
    marginTop: 24,
    marginBottom: 12,
  },
  partCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#EAEAEF',
  },
  partBadge: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#6C5CE7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  partBadgeText: { fontSize: 16, fontWeight: '700', color: '#fff' },
  partInfo: { flex: 1 },
  partTitleDev: { fontSize: 16, fontWeight: '600', color: '#9A7B4F' },
  partTitleEng: { fontSize: 14, color: '#2D2D3A', marginTop: 2 },
  partSub: { fontSize: 12, color: '#999', marginTop: 4 },
  arrow: { fontSize: 20, color: '#CCC' },
  profileBanner: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#6C5CE720',
    alignItems: 'center',
  },
  profileBannerLabel: { fontSize: 11, color: '#6C5CE7', fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1 },
  profileBannerName: { fontSize: 18, fontWeight: '600', color: '#2D2D3A', marginTop: 4 },
  profileBannerDetail: { fontSize: 13, color: '#888', marginTop: 2 },
  profileBannerSwitch: { fontSize: 12, color: '#6C5CE7', marginTop: 6, fontWeight: '500' },
});
