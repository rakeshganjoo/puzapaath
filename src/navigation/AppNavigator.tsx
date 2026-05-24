import React from 'react';
import { Platform, Text, TouchableOpacity } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeScreen, SetupScreen } from '../mfes/home-mfe';
import { CalendarScreen, CalendarExplainerScreen } from '../mfes/calendar-mfe';
import { TithiCalculatorScreen } from '../mfes/tithi-mfe';
import {
  MuhuratEventPickerScreen,
  MuhuratInputScreen,
  MuhuratResultsScreen,
} from '../mfes/muhurat-mfe';
import { PujaHomeScreen, PujaNavigatorScreen, StepDetailScreen, SamagriScreen } from '../mfes/puja-mfe';
import {
  TekniInputScreen,
  TekniLibraryScreen,
  TekniLoadingScreen,
  TekniRestoreScreen,
  TekniResultScreen,
} from '../mfes/tekni-mfe';
import type { RootStackParamList } from './types';
import { useTheme } from '../contexts/UIContext';

export type { RootStackParamList };

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  const { t } = useTheme();

  return (
    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={({ navigation: nav }) => ({
        headerStyle: { backgroundColor: '#fff' },
        headerTintColor: '#2D2D3A',
        headerTitleStyle: { fontWeight: '700', fontSize: 19 },
        headerTitleAlign: 'center' as const,
        contentStyle: { backgroundColor: '#F5F5F8' },
        headerShadowVisible: false,
        ...(nav.canGoBack()
          ? {
              headerLeft: () => (
                <TouchableOpacity
                  onPress={() => nav.goBack()}
                  style={{ paddingRight: 12, paddingVertical: 6, paddingHorizontal: 8, backgroundColor: '#F0EDFF', borderRadius: 10 }}
                  accessibilityRole="button"
                  accessibilityLabel="Go back"
                >
                  <Text style={{ fontSize: 18, color: '#4F46C6', fontWeight: '700' }}>{'‹ Back'}</Text>
                </TouchableOpacity>
              ),
            }
          : {}),
        headerBackTitleVisible: false,
      })}
    >
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={() => ({
          title: 'Janthari',
          headerShown: true,
          headerStyle: { backgroundColor: '#F5F5F8' },
          headerShadowVisible: false,
          headerTitle: '',
        })}
      />
      <Stack.Screen
        name="PujaHome"
        component={PujaHomeScreen}
        options={{ title: `🪔 ${t('nav.pujaHome', 'Interactive Puja Paath')}` }}
      />
      <Stack.Screen
        name="Setup"
        component={SetupScreen}
        options={{ title: t('nav.setup', 'Setup (Sankalp)') }}
      />
      <Stack.Screen
        name="Samagri"
        component={SamagriScreen}
        options={{ title: t('nav.samagri', 'Samagri - Materials') }}
      />
      <Stack.Screen
        name="Calendar"
        component={CalendarScreen}
        options={{ title: `📅 ${t('nav.calendar', 'KP Calendar')}` }}
      />
      <Stack.Screen
        name="CalendarExplainer"
        component={CalendarExplainerScreen}
        options={{ title: `🎓 ${t('nav.calendarExplainer', 'How KP Calendar Works')}` }}
      />
      <Stack.Screen
        name="TithiCalculator"
        component={TithiCalculatorScreen}
        options={{ title: `🧮 ${t('nav.tithiCalculator', 'Tithi Calculator')}` }}
      />
      <Stack.Screen
        name="MuhuratEventPicker"
        component={MuhuratEventPickerScreen}
        options={{ title: `🕉 ${t('nav.muhuratPicker', 'Shubh Muhurat Finder')}` }}
      />
      <Stack.Screen
        name="MuhuratInput"
        component={MuhuratInputScreen}
        options={{ title: `🕉 ${t('nav.muhuratInput', 'Muhurat Details')}` }}
      />
      <Stack.Screen
        name="MuhuratResults"
        component={MuhuratResultsScreen}
        options={{ title: `🕉 ${t('nav.muhuratResults', 'Your Shubh Muhurat')}` }}
      />
      <Stack.Screen
        name="TekniInput"
        component={TekniInputScreen}
        options={{ title: t('nav.tekniInput', 'Tekni - Janam Kundali') }}
      />
      <Stack.Screen
        name="TekniLibrary"
        component={TekniLibraryScreen}
        options={{ title: 'My Teknis' }}
      />
      <Stack.Screen
        name="TekniLoading"
        component={TekniLoadingScreen}
        options={{ title: t('nav.tekniLoading', 'Computing Kundali...'), headerShown: false }}
      />
      <Stack.Screen
        name="TekniResult"
        component={TekniResultScreen}
        options={{ title: t('nav.tekniResult', 'Tekni - Your Takni') }}
      />
      <Stack.Screen
        name="TekniRestore"
        component={TekniRestoreScreen}
        options={{ title: 'Restore Tekni' }}
      />
      <Stack.Screen
        name="PujaNavigator"
        component={PujaNavigatorScreen}
        options={{ title: t('nav.pujaNavigator', 'Puja Steps') }}
      />
      <Stack.Screen
        name="StepDetail"
        component={StepDetailScreen}
        options={{ title: t('nav.stepDetail', 'Step') }}
      />
    </Stack.Navigator>
  );
}
