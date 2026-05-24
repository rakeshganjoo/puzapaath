/**
 * TekniResultScreen — Displays the computed Takni as HTML with print and save actions.
 */

import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { generateTakniHTML, type TekniData } from '../services/TakniHTMLGenerator';
import { buildTakniQRUrl, encodeTakniCode } from '../services/TakniEncoder';
import {
  canSaveMoreTeknis,
  getSavedTekniCount,
  hydrateSavedTeknis,
  refreshSavedTekniProfileScope,
  saveTekniRecord,
  updateSavedTekni,
} from '../services/SavedTekniService';

type Props = NativeStackScreenProps<RootStackParamList, 'TekniResult'>;

export default function TekniResultScreen({ navigation, route }: Props) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [html, setHtml] = useState<string | null>(null);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saveName, setSaveName] = useState(route.params.suggestedSaveName ?? '');
  const [isSaving, setIsSaving] = useState(false);
  const tekni = useMemo(() => JSON.parse(route.params.tekniJson) as TekniData, [route.params.tekniJson]);

  useEffect(() => {
    setSaveName(route.params.suggestedSaveName ?? tekni.birth.name);
  }, [route.params.suggestedSaveName, tekni.birth.name]);

  useEffect(() => {
    async function build() {
      let qrDataUrl: string | undefined;
      if (Platform.OS === 'web') {
        try {
          const QRCode = (await import('qrcode')).default;
          const code = encodeTakniCode(tekni.birth);
          const url = buildTakniQRUrl(code, tekni.birth.name);
          qrDataUrl = await QRCode.toDataURL(url, {
            width: 200,
            margin: 1,
            color: { dark: '#3D2B1F', light: '#F5E6C800' },
            errorCorrectionLevel: 'M',
          });
        } catch {
          qrDataUrl = undefined;
        }
      }
      setHtml(generateTakniHTML(tekni, qrDataUrl));
    }
    build().catch(() => {});
  }, [tekni]);

  const handlePrint = () => {
    if (Platform.OS === 'web' && iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.print();
    }
  };

  const handlePersist = async () => {
    const trimmed = saveName.trim();
    if (!trimmed) {
      Alert.alert('Name Required', 'Please enter a unique saved Tekni name.');
      return;
    }

    setIsSaving(true);
    try {
      await hydrateSavedTeknis();
      await refreshSavedTekniProfileScope();

      const result = route.params.savedTekniId
        ? updateSavedTekni(route.params.savedTekniId, { name: trimmed, birth: tekni.birth, tekni })
        : saveTekniRecord(trimmed, tekni.birth, tekni);

      if (!result.ok) {
        const message = result.reason === 'duplicate-name'
          ? 'That saved Tekni name is already in use. Please choose another.'
          : result.reason === 'limit-reached'
            ? "Can't save more than 6 Teknis. Delete 1 saved Tekni to keep space."
            : 'Select a profile before saving a Tekni.';
        Alert.alert('Could Not Save Tekni', message);
        return;
      }

      setShowSaveModal(false);
      navigation.setParams({
        savedTekniId: result.record.id,
        suggestedSaveName: result.record.name,
      });
      Alert.alert('Saved', route.params.savedTekniId ? 'Saved Tekni updated.' : 'Tekni saved to My Teknis.');
    } finally {
      setIsSaving(false);
    }
  };

  if (!html) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#8C1A1F" />
        <Text style={styles.loadingText}>Rendering Takni...</Text>
      </View>
    );
  }

  const saveButtonLabel = route.params.savedTekniId ? 'Update Saved Tekni' : 'Save Tekni';
  const vaultUsage = getSavedTekniCount();

  return (
    <View style={styles.container}>
      <View style={styles.toolbar}>
        {Platform.OS === 'web' && (
          <TouchableOpacity style={styles.printBtn} onPress={handlePrint}>
            <Text style={styles.printBtnText}>🖨️ Print / PDF</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[styles.saveBtn, !route.params.savedTekniId && !canSaveMoreTeknis() && styles.saveBtnDisabled]}
          onPress={() => setShowSaveModal(true)}
          disabled={!route.params.savedTekniId && !canSaveMoreTeknis()}
        >
          <Text style={styles.saveBtnText}>{saveButtonLabel}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.libraryBtn} onPress={() => navigation.navigate('TekniLibrary')}>
          <Text style={styles.libraryBtnText}>📚 My Teknis</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.vaultBanner}>
        <Text style={styles.vaultBannerText}>Saved vault usage: {vaultUsage} / 6</Text>
        {!route.params.savedTekniId && !canSaveMoreTeknis() && (
          <Text style={styles.vaultBannerSubText}>Can't save more than 6 Teknis. Delete 1 to keep space.</Text>
        )}
      </View>

      {Platform.OS === 'web' ? (
        <iframe
          ref={iframeRef}
          srcDoc={html}
          style={{ flex: 1, border: 'none', width: '100%' }}
          title="Takni Preview"
        />
      ) : (
        <View style={styles.nativeCard}>
          <Text style={styles.nativeTitle}>Takni ready</Text>
          <Text style={styles.nativeHint}>Preview is available on web. You can still save this Tekni now and reopen it later from My Teknis.</Text>
        </View>
      )}

      <Modal visible={showSaveModal} transparent animationType="fade" onRequestClose={() => setShowSaveModal(false)}>
        <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={() => setShowSaveModal(false)}>
          <TouchableOpacity style={styles.modalCard} activeOpacity={1} onPress={(event) => event.stopPropagation()}>
            <Text style={styles.modalTitle}>{saveButtonLabel}</Text>
            <Text style={styles.modalHint}>Use a unique saved name so you can find this Tekni later.</Text>
            <TextInput
              style={styles.input}
              value={saveName}
              onChangeText={setSaveName}
              placeholder="e.g. Rakesh Birth Tekni"
              placeholderTextColor="#9B8F84"
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setShowSaveModal(false)}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalSaveBtn, isSaving && styles.saveBtnDisabled]} onPress={handlePersist} disabled={isSaving}>
                <Text style={styles.modalSaveText}>{isSaving ? 'Saving...' : saveButtonLabel}</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#E8D8C0' },
  toolbar: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    gap: 8,
    backgroundColor: '#F5E6C8',
    borderBottomWidth: 1,
    borderBottomColor: '#C5A659',
  },
  printBtn: {
    backgroundColor: '#8C1A1F',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 8,
  },
  printBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  saveBtn: {
    backgroundColor: '#4F46C6',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 8,
  },
  saveBtnDisabled: { opacity: 0.5 },
  saveBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  libraryBtn: {
    backgroundColor: '#EEE8FF',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
  },
  libraryBtnText: { color: '#4F46C6', fontSize: 14, fontWeight: '700' },
  vaultBanner: {
    backgroundColor: '#FFF7E7',
    borderBottomWidth: 1,
    borderBottomColor: '#D9C28D',
    paddingVertical: 8,
    alignItems: 'center',
  },
  vaultBannerText: { color: '#7A5B1A', fontSize: 12, fontWeight: '700' },
  vaultBannerSubText: { color: '#8B6A45', fontSize: 11, marginTop: 2 },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5E6C8',
  },
  loadingText: { marginTop: 12, fontSize: 14, color: '#6B4F38' },
  nativeCard: {
    margin: 20,
    backgroundColor: '#FFF9F0',
    borderRadius: 14,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E8DCC8',
  },
  nativeTitle: { fontSize: 18, fontWeight: '800', color: '#2D2D3A' },
  nativeHint: { fontSize: 13, color: '#6F6F7A', marginTop: 8, lineHeight: 19 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'center', padding: 20 },
  modalCard: { backgroundColor: '#fff', borderRadius: 16, padding: 18 },
  modalTitle: { fontSize: 18, fontWeight: '800', color: '#2D2D3A' },
  modalHint: { fontSize: 13, color: '#6F6F7A', marginTop: 6, lineHeight: 18 },
  input: {
    borderWidth: 1,
    borderColor: '#D4C5B0',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#3D2B1F',
    backgroundColor: '#FDFAF5',
    marginTop: 14,
  },
  modalButtons: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10, marginTop: 16 },
  modalCancelBtn: { backgroundColor: '#F2F0ED', borderRadius: 10, paddingVertical: 10, paddingHorizontal: 14 },
  modalCancelText: { color: '#4D4D5A', fontWeight: '700' },
  modalSaveBtn: { backgroundColor: '#4F46C6', borderRadius: 10, paddingVertical: 10, paddingHorizontal: 14 },
  modalSaveText: { color: '#fff', fontWeight: '700' },
});
