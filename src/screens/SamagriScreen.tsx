import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SectionList,
  StyleSheet,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';
import pujaData from '../data/pujaData';
import type { SamagriItem } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'Samagri'>;

const CATEGORY_LABELS: Record<string, string> = {
  essential: 'Essential Items',
  panchdashang: 'Panchdashang Snan (15 Ingredients)',
  food: 'Food / Bhog',
  optional: 'Optional Items',
};

const CATEGORY_ORDER = ['essential', 'panchdashang', 'food', 'optional'];

export default function SamagriScreen({ navigation }: Props) {
  const [checked, setChecked] = useState<Set<string>>(new Set());

  const toggle = useCallback((id: string) => {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const sections = CATEGORY_ORDER.map((cat) => ({
    title: CATEGORY_LABELS[cat],
    data: pujaData.samagri.filter((s) => s.category === cat),
  })).filter((s) => s.data.length > 0);

  const totalItems = pujaData.samagri.length;
  const checkedCount = checked.size;

  return (
    <View style={styles.container}>
      {/* Progress bar */}
      <View style={styles.progressContainer}>
        <View style={[styles.progressBar, { width: `${(checkedCount / totalItems) * 100}%` }]} />
      </View>
      <Text style={styles.progressText}>
        {checkedCount}/{totalItems} items ready
      </Text>

      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        renderSectionHeader={({ section }) => (
          <Text style={styles.sectionHeader}>{section.title}</Text>
        )}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.itemCard, checked.has(item.id) && styles.itemChecked]}
            onPress={() => toggle(item.id)}
          >
            <Text style={styles.checkBox}>{checked.has(item.id) ? '☑' : '☐'}</Text>
            <View style={styles.itemInfo}>
              <Text style={styles.itemName}>
                {item.name.devanagari} — {item.name.english}
              </Text>
              <Text style={styles.itemRoman}>{item.name.roman}</Text>
              <Text style={styles.itemDesc}>{item.description}</Text>
            </View>
          </TouchableOpacity>
        )}
        contentContainerStyle={{ paddingBottom: 40 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F8' },
  progressContainer: {
    height: 4,
    backgroundColor: '#EAEAEF',
    borderRadius: 2,
    marginHorizontal: 16,
    marginTop: 12,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#6C5CE7',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 13,
    color: '#6C5CE7',
    textAlign: 'right',
    marginRight: 16,
    marginTop: 4,
    marginBottom: 8,
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2D2D3A',
    backgroundColor: '#F5F5F8',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#fff',
    marginHorizontal: 12,
    marginBottom: 6,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#EAEAEF',
  },
  itemChecked: { backgroundColor: '#F8F6FF', borderColor: '#6C5CE720' },
  checkBox: { fontSize: 20, marginRight: 12, marginTop: 2 },
  itemInfo: { flex: 1 },
  itemName: { fontSize: 14, fontWeight: '600', color: '#2D2D3A' },
  itemRoman: { fontSize: 12, color: '#999', marginTop: 2 },
  itemDesc: { fontSize: 12, color: '#888', marginTop: 4, fontStyle: 'italic' },
});
