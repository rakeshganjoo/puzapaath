/** Muhurat result types for the Shubh Muhurat Finder */

export type MuhuratEventCategory = 'samskara' | 'material' | 'religious';

export interface MuhuratEventType {
  id: string;
  name: string;
  category: MuhuratEventCategory;
  kpName?: string;
  icon: string;
}

export interface PanchangSnapshot {
  tithi: number;
  tithiName: string;
  paksha: 'shukla' | 'krishna';
  nakshatra: number;
  nakshatraName: string;
  yoga: number;
  yogaName: string;
  karana: number;
  karanaName: string;
  vara: number;
  varaName: string;
  sunrise: string;
  sunset: string;
  moonSign: number;
  moonSignName: string;
  lunarMonth: string;
}

export interface LagnaInfo {
  sign: number;
  signName: string;
  degree: number;
  lordStrength: 'strong' | 'moderate' | 'weak';
  maleficsInKendra: boolean;
  jupiterAspect: boolean;
  moonHouse: number;
}

export interface InauspiciousPeriod {
  type: 'rahu_kaal' | 'yamaghanta' | 'gulika' | 'durmuhurta' | 'varjyam';
  start: string;
  end: string;
}

export interface MuhuratScores {
  tithi: number;
  nakshatra: number;
  yoga: number;
  karana: number;
  vara: number;
  lagna: number;
  cleanPeriod: number;
  bonus: number;
  tarabalam?: number;
  chandrabalam?: number;
  transit?: number;
  total: number;
}

export interface MuhuratCandidate {
  date: string;
  timeStart: string;
  timeEnd: string;
  durationMinutes: number;
  eventType: MuhuratEventType;
  panchang: PanchangSnapshot;
  lagna: LagnaInfo;
  inauspiciousPeriods: InauspiciousPeriod[];
  bonusYogas: string[];
  scores: MuhuratScores;
  rating: 1 | 2 | 3 | 4 | 5;
  summary: string;
  warnings: string[];
  location: string;
}
