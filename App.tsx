import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './src/navigation/AppNavigator';
import { UIProvider } from './src/contexts/UIContext';
import { AudioProvider } from './src/contexts/AudioContext';
import { CalendarProvider } from './src/contexts/CalendarContext';
import { PujaProvider } from './src/contexts/PujaContext';
import { SyncProvider } from './src/contexts/SyncContext';
import { AuthProvider } from './src/contexts/AuthContext';

export default function App() {
  return (
    <UIProvider>
      <AuthProvider>
        <SyncProvider>
          <AudioProvider>
            <CalendarProvider>
              <PujaProvider>
                <NavigationContainer>
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
