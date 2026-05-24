import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import {
  MAX_TEKNIS_PER_PROFILE,
  deleteSavedTekni,
  ensureTekniComputed,
  getSavedTeknis,
  hydrateSavedTeknis,
  refreshSavedTekniProfileScope,
} from '../services/SavedTekniService';
import type { SavedTekniRecord } from '../types/tekni';

type Props = NativeStackScreenProps<RootStackParamList, 'TekniLibrary'>;

export default function TekniLibraryScreen({ navigation }: Props) {
  const [items, setItems] = useState<SavedTekniRecord[]>([]);
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [restoreCode, setRestoreCode] = useState('');
  const [restoreName, setRestoreName] = useState('');

  const load = useCallback(async () => {
    await hydrateSavedTeknis();
    await refreshSavedTekniProfileScope();
    setItems(getSavedTeknis());
  }, []);

  useEffect(() => {
    load();
    return navigation.addListener('focus', load);
  }, [load, navigation]);

  const handleDelete = useCallback((id: string) => {
    Alert.alert('Delete Tekni', 'Remove this saved Tekni?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          deleteSavedTekni(id);
          load().catch(() => {});
        },
      },
    ]);
  }, [load]);

  const handleOpen = useCallback((item: SavedTekniRecord) => {
    const resolved = ensureTekniComputed(item);
    navigation.navigate('TekniResult', {
      tekniJson: JSON.stringify(resolved.tekni),
      savedTekniId: resolved.id,
      suggestedSaveName: resolved.name,
    });
  }, [navigation]);

  const handleRestore = useCallback(() => {
    const code = restoreCode.trim().toUpperCase();
    if (!code) return;
    setShowRestoreModal(false);
    setRestoreCode('');
    navigation.navigate('TekniRestore', {
      code,
      name: restoreName.trim() || undefined,
    });
  }, [navigation, restoreCode, restoreName]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.headerCard}>
        <Text style={styles.headerTitle}>My Teknis</Text>
        <Text style={styles.headerHint}>Save up to {MAX_TEKNIS_PER_PROFILE} named Teknis per profile. Open, edit, delete, or restore from TakniCode.</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={[styles.primaryBtn, items.length >= MAX_TEKNIS_PER_PROFILE && styles.primaryBtnDisabled]}
            onPress={() => navigation.navigate('TekniInput')}
            disabled={items.length >= MAX_TEKNIS_PER_PROFILE}
          >
            <Text style={styles.primaryBtnText}>New Tekni</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryBtn} onPress={() => setShowRestoreModal(true)}>
            <Text style={styles.secondaryBtnText}>Restore from Code</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.countText}>{items.length} / {MAX_TEKNIS_PER_PROFILE} saved</Text>
        {items.length >= MAX_TEKNIS_PER_PROFILE && (
          <Text style={styles.limitHint}>Can't save more than 6 Teknis. Delete 1 saved Tekni to keep space.</Text>
        )}
      </View>

      {items.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>No saved Teknis yet</Text>
          <Text style={styles.emptyHint}>Generate a Tekni and save it with a unique name, or restore one from a TakniCode link.</Text>
        </View>
      ) : (
        items.map((item) => (
          <View key={item.id} style={styles.card}>
            <Text style={styles.cardTitle}>{item.name}</Text>
            <Text style={styles.cardMeta}>{item.birth.name} • {item.birth.day}/{item.birth.month}/{item.birth.year} • {item.birth.placeName || 'Saved coordinates'}</Text>
            <Text style={styles.codeText}>{item.takniCode}</Text>
            <View style={styles.actions}>
              <TouchableOpacity style={styles.primaryMiniBtn} onPress={() => handleOpen(item)}>
                <Text style={styles.primaryMiniBtnText}>Open</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.secondaryMiniBtn} onPress={() => navigation.navigate('TekniInput', { savedTekniId: item.id })}>
                <Text style={styles.secondaryMiniBtnText}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.deleteMiniBtn} onPress={() => handleDelete(item.id)}>
                <Text style={styles.deleteMiniBtnText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))
      )}

      <Modal visible={showRestoreModal} transparent animationType="fade" onRequestClose={() => setShowRestoreModal(false)}>
        <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={() => setShowRestoreModal(false)}>
          <TouchableOpacity style={styles.modalCard} activeOpacity={1} onPress={(event) => event.stopPropagation()}>
            <Text style={styles.modalTitle}>Restore Tekni</Text>
            <Text style={styles.modalHint}>Paste the TakniCode. Name is optional but improves verification.</Text>
            <TextInput
              style={styles.input}
              value={restoreCode}
              onChangeText={setRestoreCode}
              autoCapitalize="characters"
              placeholder="JT-XXXXX-XXXXX-XXXXX-XX"
              placeholderTextColor="#9B8F84"
            />
            <TextInput
              style={styles.input}
              value={restoreName}
              onChangeText={setRestoreName}
              placeholder="Name on the Tekni (optional)"
              placeholderTextColor="#9B8F84"
            />
            <View style={styles.headerButtons}>
              <TouchableOpacity style={styles.secondaryBtn} onPress={() => setShowRestoreModal(false)}>
                <Text style={styles.secondaryBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.primaryBtn} onPress={handleRestore}>
                <Text style={styles.primaryBtnText}>Restore</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F8' },
  content: { padding: 16, paddingBottom: 28 },
  headerCard: {
    backgroundColor: '#FFF9F0',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E8DCC8',
    padding: 16,
    marginBottom: 14,
  },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#2D2D3A' },
  headerHint: { fontSize: 13, color: '#7A6F66', marginTop: 6, lineHeight: 19 },
  headerButtons: { flexDirection: 'row', gap: 10, marginTop: 12 },
  primaryBtn: {
    backgroundColor: '#6C5CE7',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  primaryBtnDisabled: { opacity: 0.5 },
  primaryBtnText: { color: '#fff', fontWeight: '700' },
  secondaryBtn: {
    backgroundColor: '#EEE8FF',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  secondaryBtnText: { color: '#4F46C6', fontWeight: '700' },
  countText: { marginTop: 12, color: '#6B5D53', fontSize: 12, fontWeight: '600' },
  limitHint: { marginTop: 6, color: '#8B6A45', fontSize: 12 },
  emptyCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 18,
    borderWidth: 1,
    borderColor: '#EAEAEF',
  },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: '#2D2D3A' },
  emptyHint: { fontSize: 13, color: '#7A6F66', marginTop: 6, lineHeight: 19 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#EAEAEF',
    padding: 14,
    marginBottom: 12,
  },
  cardTitle: { fontSize: 16, fontWeight: '800', color: '#2D2D3A' },
  cardMeta: { fontSize: 12, color: '#6F6F7A', marginTop: 4, lineHeight: 17 },
  codeText: { fontSize: 12, color: '#4F46C6', marginTop: 8, fontWeight: '700' },
  actions: { flexDirection: 'row', gap: 8, marginTop: 12 },
  primaryMiniBtn: { backgroundColor: '#6C5CE7', borderRadius: 8, paddingVertical: 8, paddingHorizontal: 12 },
  primaryMiniBtnText: { color: '#fff', fontWeight: '700', fontSize: 12 },
  secondaryMiniBtn: { backgroundColor: '#EAF4FF', borderRadius: 8, paddingVertical: 8, paddingHorizontal: 12 },
  secondaryMiniBtnText: { color: '#1565C0', fontWeight: '700', fontSize: 12 },
  deleteMiniBtn: { backgroundColor: '#FDECEC', borderRadius: 8, paddingVertical: 8, paddingHorizontal: 12 },
  deleteMiniBtnText: { color: '#C62828', fontWeight: '700', fontSize: 12 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', padding: 20 },
  modalCard: { backgroundColor: '#fff', borderRadius: 16, padding: 16 },
  modalTitle: { fontSize: 18, fontWeight: '800', color: '#2D2D3A' },
  modalHint: { fontSize: 13, color: '#7A6F66', marginTop: 6, lineHeight: 19 },
  input: {
    borderWidth: 1,
    borderColor: '#DED7D1',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#2D2D3A',
    marginTop: 12,
  },
});