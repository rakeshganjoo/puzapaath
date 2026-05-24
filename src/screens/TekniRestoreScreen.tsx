import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { decodeTakniCode, verifyTakniName } from '../services/TakniEncoder';
import { computeTekni } from '../services/TekniService';

type Props = NativeStackScreenProps<RootStackParamList, 'TekniRestore'>;

export default function TekniRestoreScreen({ navigation, route }: Props) {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const decoded = decodeTakniCode(route.params.code);
      const requestedName = route.params.name?.trim();
      const verifiedName = requestedName && verifyTakniName(requestedName, decoded.nameCrc)
        ? requestedName
        : requestedName
          ? `${requestedName} (restored)`
          : 'Restored Tekni';

      const tekni = computeTekni({
        name: verifiedName,
        fatherName: '',
        motherName: '',
        gotra: '',
        ishtdevi: '',
        gender: decoded.gender,
        year: decoded.year,
        month: decoded.month,
        day: decoded.day,
        hour: decoded.hour,
        minute: decoded.minute,
        placeName: `Lat ${decoded.latitude.toFixed(3)}, Lon ${decoded.longitude.toFixed(3)}`,
        latitude: decoded.latitude,
        longitude: decoded.longitude,
      });

      navigation.replace('TekniResult', {
        tekniJson: JSON.stringify(tekni),
        suggestedSaveName: verifiedName,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to restore this Tekni.');
    }
  }, [navigation, route.params.code, route.params.name]);

  return (
    <View style={styles.container}>
      {error ? (
        <>
          <Text style={styles.errorTitle}>Restore failed</Text>
          <Text style={styles.errorText}>{error}</Text>
        </>
      ) : (
        <>
          <ActivityIndicator size="large" color="#6C5CE7" />
          <Text style={styles.title}>Restoring Tekni...</Text>
          <Text style={styles.sub}>Decoding TakniCode and regenerating the chart.</Text>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F8',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  title: { fontSize: 20, fontWeight: '800', color: '#2D2D3A', marginTop: 14 },
  sub: { fontSize: 13, color: '#6F6F7A', marginTop: 6, textAlign: 'center' },
  errorTitle: { fontSize: 20, fontWeight: '800', color: '#C62828' },
  errorText: { fontSize: 14, color: '#6F6F7A', marginTop: 8, textAlign: 'center' },
});