import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';
import pujaData from '../data/pujaData';
import type { PujaStep } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'PujaNavigator'>;

export default function PujaNavigatorScreen({ route, navigation }: Props) {
  const { partId } = route.params;
  const part = pujaData.parts.find((p) => p.id === partId);

  if (!part) return <Text>Part not found</Text>;

  React.useLayoutEffect(() => {
    navigation.setOptions({
      title: `${part.title.devanagari} — ${part.title.english}`,
    });
  }, [navigation, part]);

  const renderStep = ({ item, index }: { item: PujaStep; index: number }) => (
    <TouchableOpacity
      style={[styles.stepCard, item.isOptional && styles.optionalCard]}
      onPress={() => navigation.navigate('StepDetail', { partId, stepIndex: index })}
    >
      <View style={[styles.stepBadge, item.isOptional && styles.optionalBadge]}>
        <Text style={styles.stepNumber}>{item.number}</Text>
      </View>
      <View style={styles.stepInfo}>
        <Text style={styles.stepTitleDev}>{item.title.devanagari}</Text>
        <Text style={styles.stepTitleRoman}>{item.title.roman}</Text>
        <Text style={styles.stepTitleEng}>{item.title.english}</Text>
        {item.isOptional && <Text style={styles.optionalTag}>⚡ Can be skipped</Text>}
        {item.subSteps && (
          <Text style={styles.subStepCount}>
            {item.subSteps.length} sub-steps
          </Text>
        )}
      </View>
      <Text style={styles.arrow}>›</Text>
    </TouchableOpacity>
  );

  // Navigation to next/prev part
  const partIndex = pujaData.parts.findIndex((p) => p.id === partId);
  const nextPart = pujaData.parts[partIndex + 1];
  const prevPart = pujaData.parts[partIndex - 1];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.partSub}>{part.subtitle}</Text>
        <Text style={styles.stepCountLabel}>{part.steps.length} Steps</Text>
      </View>

      <FlatList
        data={part.steps}
        renderItem={renderStep}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 12, paddingBottom: 20 }}
      />

      {/* Part navigation */}
      <View style={styles.navRow}>
        {prevPart ? (
          <TouchableOpacity
            style={styles.navBtn}
            onPress={() => navigation.replace('PujaNavigator', { partId: prevPart.id })}
          >
            <Text style={styles.navBtnText}>‹ Part {prevPart.id}</Text>
          </TouchableOpacity>
        ) : (
          <View />
        )}
        {nextPart ? (
          <TouchableOpacity
            style={[styles.navBtn, { backgroundColor: '#6C5CE7' }]}
            onPress={() => navigation.replace('PujaNavigator', { partId: nextPart.id })}
          >
            <Text style={[styles.navBtnText, { color: '#fff' }]}>Part {nextPart.id} ›</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.navBtn, { backgroundColor: '#4A3F8A' }]}
            onPress={() => navigation.navigate('Home')}
          >
            <Text style={[styles.navBtnText, { color: '#fff' }]}>Complete</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F8' },
  header: { padding: 16, paddingBottom: 8 },
  partSub: { fontSize: 14, color: '#666', lineHeight: 20 },
  stepCountLabel: { fontSize: 13, color: '#6C5CE7', fontWeight: '600', marginTop: 6 },
  stepCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#EAEAEF',
  },
  optionalCard: { borderLeftWidth: 3, borderLeftColor: '#DDD' },
  stepBadge: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#6C5CE7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  optionalBadge: { backgroundColor: '#C0C0CC' },
  stepNumber: { fontSize: 14, fontWeight: '700', color: '#fff' },
  stepInfo: { flex: 1 },
  stepTitleDev: { fontSize: 15, fontWeight: '600', color: '#9A7B4F' },
  stepTitleRoman: { fontSize: 13, color: '#555', marginTop: 1 },
  stepTitleEng: { fontSize: 12, color: '#999', marginTop: 1 },
  optionalTag: { fontSize: 11, color: '#999', marginTop: 4 },
  subStepCount: { fontSize: 11, color: '#999', marginTop: 2 },
  arrow: { fontSize: 20, color: '#CCC' },
  navRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#EAEAEF',
    backgroundColor: '#fff',
  },
  navBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#F0F0F5',
  },
  navBtnText: { fontSize: 14, fontWeight: '600', color: '#2D2D3A' },
});
