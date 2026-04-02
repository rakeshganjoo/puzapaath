import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { MUHURAT_EVENTS } from '../data/muhuratEvents';

type Props = NativeStackScreenProps<RootStackParamList, 'MuhuratEventPicker'>;

export default function MuhuratEventPickerScreen({ navigation }: Props) {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Hero */}
      <View style={styles.hero}>
        <Text style={styles.heroIcon}>🕉️</Text>
        <Text style={styles.heroTitle}>Shubh Muhurat Finder</Text>
        <Text style={styles.heroSub}>
          Find the most auspicious time for your important events
        </Text>
        <Text style={styles.heroKP}>
          "Panditji se saath le lo"
        </Text>
      </View>

      {/* Question prompt */}
      <Text style={styles.prompt}>What do you need Saath for?</Text>

      {/* Event groups */}
      {MUHURAT_EVENTS.map((group) => (
        <View key={group.category} style={styles.group}>
          <Text style={styles.groupTitle}>{group.icon}  {group.title}</Text>
          <View style={styles.eventGrid}>
            {group.events.map((event) => (
              <TouchableOpacity
                key={event.id}
                style={styles.eventCard}
                activeOpacity={0.7}
                onPress={() => navigation.navigate('MuhuratInput', { eventId: event.id })}
              >
                <Text style={styles.eventIcon}>{event.icon}</Text>
                <Text style={styles.eventName}>{event.name}</Text>
                {event.kpName && (
                  <Text style={styles.eventKP}>{event.kpName}</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ))}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F8' },
  content: { padding: 16 },

  // Hero section
  hero: {
    alignItems: 'center',
    backgroundColor: '#FFF9F0',
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E8DCC8',
  },
  heroIcon: { fontSize: 40 },
  heroTitle: { fontSize: 22, fontWeight: '700', color: '#2D2D3A', marginTop: 8 },
  heroSub: { fontSize: 14, color: '#666', textAlign: 'center', marginTop: 6, lineHeight: 20 },
  heroKP: {
    fontSize: 13,
    color: '#9A7B4F',
    fontStyle: 'italic',
    marginTop: 8,
  },

  // Prompt
  prompt: {
    fontSize: 17,
    fontWeight: '600',
    color: '#2D2D3A',
    marginBottom: 16,
  },

  // Groups
  group: { marginBottom: 20 },
  groupTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // Event grid
  eventGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  eventCard: {
    width: '31%' as any,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EAEAEF',
    minHeight: 100,
    justifyContent: 'center',
  },
  eventIcon: { fontSize: 28 },
  eventName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2D2D3A',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 16,
  },
  eventKP: {
    fontSize: 10,
    color: '#9A7B4F',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 3,
  },
});
