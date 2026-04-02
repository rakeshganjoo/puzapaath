/**
 * Navigation type definitions — extracted here so screens can import them
 * WITHOUT creating a circular dependency through AppNavigator.
 *
 * Screens:   import type { RootStackParamList } from '../navigation/types';
 * Services:  import type { RootStackParamList } from '../navigation/types';
 * Navigator: import type { RootStackParamList } from './types';
 */

export type RootStackParamList = {
  Home: undefined;
  PujaHome: undefined;
  Setup: undefined;
  Samagri: undefined;
  Calendar: undefined;
  CalendarExplainer: undefined;
  TithiCalculator: undefined;
  MuhuratEventPicker: undefined;
  MuhuratInput: { eventId: string };
  MuhuratResults: {
    eventId: string;
    dateFrom: string;
    dateTo: string;
    locationName: string;
    locationLat: number;
    locationLng: number;
    preferredDays?: number[];
    timeWindow: 'morning' | 'afternoon' | 'any';
    numResults: number;
    person1Name?: string;
    person1DOB?: string;
    person1TOB?: string;
    person1POB?: string;
    person2Name?: string;
    person2DOB?: string;
    person2TOB?: string;
    person2POB?: string;
  };
  TekniInput: undefined;
  TekniLoading: {
    name: string;
    fatherName: string;
    motherName: string;
    gotra: string;
    ishtdevi: string;
    gender: 'male' | 'female';
    year: number;
    month: number;
    day: number;
    hour: number;
    minute: number;
    placeName: string;
    latitude: number;
    longitude: number;
    userLagnaRashi?: number;  // 1-12 if user provides
    userMoonRashi?: number;
    userGrahaRashis?: string; // JSON string of {grahaName: rashiNum}
  };
  TekniResult: { tekniJson: string };
  PujaNavigator: { partId: 'A' | 'B' | 'C' };
  StepDetail: { partId: 'A' | 'B' | 'C'; stepIndex: number };
};
