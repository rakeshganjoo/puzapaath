/**
 * TekniResultScreen — Displays the computed Takni as HTML with Print button.
 * Receives TekniData via route params (JSON-serialized).
 */

import React, { useEffect, useRef, useState } from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { generateTakniHTML, type TekniData } from '../services/TakniHTMLGenerator';
import { encodeTakniCode, buildTakniQRUrl } from '../services/TakniEncoder';

type Props = NativeStackScreenProps<RootStackParamList, 'TekniResult'>;

export default function TekniResultScreen({ route }: Props) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [html, setHtml] = useState<string | null>(null);

  useEffect(() => {
    async function build() {
      const tekni: TekniData = JSON.parse(route.params.tekniJson);
      let qrDataUrl: string | undefined;
      if (Platform.OS === 'web') {
        try {
          const QRCode = (await import('qrcode')).default;
          const code = encodeTakniCode(tekni.birth);
          const url = buildTakniQRUrl(code, tekni.birth.name);
          qrDataUrl = await QRCode.toDataURL(url, {
            width: 200, margin: 1,
            color: { dark: '#3D2B1F', light: '#F5E6C800' },
            errorCorrectionLevel: 'M',
          });
        } catch { /* QR unavailable */ }
      }
      setHtml(generateTakniHTML(tekni, qrDataUrl));
    }
    build();
  }, [route.params.tekniJson]);

  const handlePrint = () => {
    if (Platform.OS === 'web' && iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.print();
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

  if (Platform.OS === 'web') {
    return (
      <View style={styles.container}>
        <View style={styles.toolbar}>
          <TouchableOpacity style={styles.printBtn} onPress={handlePrint}>
            <Text style={styles.printBtnText}>🖨️  Print / Save as PDF</Text>
          </TouchableOpacity>
        </View>
        <iframe
          ref={iframeRef}
          srcDoc={html}
          style={{ flex: 1, border: 'none', width: '100%' }}
          title="Takni Preview"
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.loadingText}>Takni preview is available on web.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#E8D8C0' },
  toolbar: {
    flexDirection: 'row',
    justifyContent: 'center',
    padding: 10,
    backgroundColor: '#F5E6C8',
    borderBottomWidth: 1,
    borderBottomColor: '#C5A659',
  },
  printBtn: {
    backgroundColor: '#8C1A1F',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
  },
  printBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5E6C8',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6B4F38',
  },
});
