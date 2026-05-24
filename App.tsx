import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './src/navigation/AppNavigator';
import type { RootStackParamList } from './src/navigation/types';
import { UIProvider } from './src/contexts/UIContext';
import { AudioProvider } from './src/contexts/AudioContext';
import { CalendarProvider } from './src/contexts/CalendarContext';
import { PujaProvider } from './src/contexts/PujaContext';
import { SyncProvider } from './src/contexts/SyncContext';
import { AuthProvider } from './src/contexts/AuthContext';
import { initializeNotificationsOnLaunch } from './src/services/NotificationService';

const linking = {
  prefixes: ['https://www.janthari.com', 'https://janthari.pages.dev'],
  config: {
    screens: {
      Home: '',
      Calendar: 'calendar',
      TekniInput: 'tekni',
      TekniLibrary: 'tekni/library',
      TekniRestore: 'takni/:code/:name?',
    },
  },
} satisfies Parameters<typeof NavigationContainer<RootStackParamList>>[0]['linking'];

export default function App() {
  React.useEffect(() => {
    initializeNotificationsOnLaunch().catch(() => {
      // Notification support can vary by platform/runtime; app should continue normally.
    });
  }, []);

  return (
    <UIProvider>
      <AuthProvider>
        <SyncProvider>
          <AudioProvider>
            <CalendarProvider>
              <PujaProvider>
                <NavigationContainer linking={linking}>
                  <StatusBar style="light" />
                  <AppNavigator />
                </NavigationContainer>
              </PujaProvider>
            </CalendarProvider>
          </AudioProvider>
        </SyncProvider>
      </AuthProvider>
    </UIProvider>
  );
}
