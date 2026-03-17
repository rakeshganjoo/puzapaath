import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';
import SamagriScreen from '../screens/SamagriScreen';
import PujaNavigatorScreen from '../screens/PujaNavigatorScreen';
import StepDetailScreen from '../screens/StepDetailScreen';
import SetupScreen from '../screens/SetupScreen';

export type RootStackParamList = {
  Home: undefined;
  Setup: undefined;
  Samagri: undefined;
  PujaNavigator: { partId: 'A' | 'B' | 'C' };
  StepDetail: { partId: 'A' | 'B' | 'C'; stepIndex: number };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerStyle: { backgroundColor: '#fff' },
        headerTintColor: '#2D2D3A',
        headerTitleStyle: { fontWeight: '600', fontSize: 17 },
        contentStyle: { backgroundColor: '#F5F5F8' },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: 'पूजा पाठ — PuzaPaath', headerShown: false }}
      />
      <Stack.Screen
        name="Setup"
        component={SetupScreen}
        options={{ title: 'Setup / संकल्प' }}
      />
      <Stack.Screen
        name="Samagri"
        component={SamagriScreen}
        options={{ title: 'सामग्री — Materials' }}
      />
      <Stack.Screen
        name="PujaNavigator"
        component={PujaNavigatorScreen}
        options={{ title: 'Puja Steps' }}
      />
      <Stack.Screen
        name="StepDetail"
        component={StepDetailScreen}
        options={{ title: 'Step' }}
      />
    </Stack.Navigator>
  );
}
