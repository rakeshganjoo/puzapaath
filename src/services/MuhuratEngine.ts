/**
 * Real Muhurat calculation engine.
 *
 * This implementation scans actual date/time slots in the requested range,
 * computes panchang + lagna astronomically for each slot, excludes
 * inauspicious periods, scores candidates, and returns the top results.
 */

import type {
  MuhuratCandidate, MuhuratEventType, PanchangSnapshot,
  LagnaInfo, InauspiciousPeriod, MuhuratScores,
} from '../types/muhurat';
import { getMuhuratEvent } from '../data/muhuratEvents';
import { gregorianToLunarWithTime } from './HinduCalendar';

const RAD = Math.PI / 180;
const DEG = 180 / Math.PI;

const TITHI_NAMES = [
  'Pratipada', 'Dwitiya', 'Tritiya', 'Chaturthi', 'Panchami',
  'Shashthi', 'Saptami', 'Ashtami', 'Navami', 'Dashami',
  'Ekadashi', 'Dwadashi', 'Trayodashi', 'Chaturdashi', 'Purnima/Amavasya',
];

const NAKSHATRA_NAMES = [
  'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra',
  'Punarvasu', 'Pushya', 'Ashlesha', 'Magha', 'Purva Phalguni',
  'Uttara Phalguni', 'Hasta', 'Chitra', 'Swati', 'Vishakha',
  'Anuradha', 'Jyeshtha', 'Moola', 'Purva Ashadha', 'Uttara Ashadha',
  'Shravana', 'Dhanishtha', 'Shatabhisha', 'Purva Bhadrapada',
  'Uttara Bhadrapada', 'Revati',
];

const YOGA_NAMES = [
  'Vishkumbha', 'Priti', 'Ayushman', 'Saubhagya', 'Shobhana',
  'Atiganda', 'Sukarman', 'Dhriti', 'Shoola', 'Ganda',
  'Vriddhi', 'Dhruva', 'Vyaghata', 'Harshana', 'Vajra',
  'Siddhi', 'Vyatipata', 'Variyan', 'Parigha', 'Shiva',
  'Siddha', 'Sadhya', 'Shubha', 'Shukla', 'Brahma',
  'Indra', 'Vaidhriti',
];

const KARANA_NAMES = [
  'Bava', 'Balava', 'Kaulava', 'Taitila', 'Gara', 'Vanija', 'Vishti',
  'Shakuni', 'Chatushpada', 'Naga', 'Kimsthughna',
];

const RASHI_NAMES = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
];

const VARA_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const GOOD_NAKSHATRAS: Record<string, number[]> = {
  marriage: [3, 4, 9, 11, 12, 14, 16, 18, 20, 25, 26],
  griha_pravesh: [3, 11, 20, 25, 7, 14, 21, 22],
  business: [0, 3, 7, 12, 14, 21],
  default: [0, 3, 4, 6, 7, 11, 12, 14, 16, 20, 21, 25, 26],
};

const GOOD_VARAS: Record<string, number[]> = {
  marriage: [1, 3, 4, 5],
  griha_pravesh: [1, 3, 4, 5],
  vehicle: [1, 3, 5],
  business: [3, 4, 5],
  default: [1, 3, 4, 5],
};

const GOOD_LAGNAS: Record<string, number[]> = {
  marriage: [1, 2, 3, 5, 6, 8, 10, 11],
  griha_pravesh: [1, 3, 4, 5, 6, 8, 10, 11],
  business: [1, 4, 5, 6, 8, 10],
  default: [1, 2, 3, 5, 6, 8, 10, 11],
};

const SARVARTHA_SIDDHI: Record<number, number[]> = {
  0: [7, 12, 11, 20, 25, 0],
  1: [3, 4, 21, 22, 12],
  2: [0, 11, 2, 16],
  3: [3, 16, 12, 2, 4],
  4: [0, 6, 7, 14, 26, 16],
  5: [0, 16, 26, 6, 21],
  6: [3, 14, 21, 7, 25],
};

const AMRITA_SIDDHI: Record<number, number> = {
  0: 12, 1: 4, 2: 0, 3: 16, 4: 7, 5: 26, 6: 3,
};

const RAHU_SEG = [8, 2, 7, 5, 6, 4, 3];
const YAMA_SEG = [5, 4, 3, 2, 1, 7, 6];
const GULIKA_SEG = [7, 6, 5, 4, 3, 2, 1];

const LORD_BY_SIGN = ['Mars', 'Venus', 'Mercury', 'Moon', 'Sun', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Saturn', 'Jupiter'];
const OWN_SIGNS: Record<string, number[]> = {
  Sun: [4], Moon: [3], Mars: [0, 7], Mercury: [2, 5], Jupiter: [8, 11], Venus: [1, 6], Saturn: [9, 10],
};
const EXALT_SIGNS: Record<string, number> = {
  Sun: 0, Moon: 1, Mars: 9, Mercury: 5, Jupiter: 3, Venus: 11, Saturn: 6,
};
const DEBIL_SIGN: Record<string, number> = {
  Sun: 6, Moon: 7, Mars: 3, Mercury: 11, Jupiter: 9, Venus: 5, Saturn: 0,
};

function norm(x: number): number { return ((x % 360) + 360) % 360; }

function toJD(y: number, m: number, d: number): number {
  const a = Math.floor((14 - m) / 12);
  const yy = y + 4800 - a;
  const mm = m + 12 * a - 3;
  return d + Math.floor((153 * mm + 2) / 5) + 365 * yy + Math.floor(yy / 4)
    - Math.floor(yy / 100) + Math.floor(yy / 400) - 32045;
}

function jdAtLocal(date: Date, h: number, min: number, lon: number): number {
  const tz = lon / 15;
  return toJD(date.getFullYear(), date.getMonth() + 1, date.getDate()) + (h + min / 60) / 24 - 0.5 - tz / 24;
}

function ayanamsha(jd: number): number {
  return 23.856 + 0.0137 * (jd - 2451545.0) / 365.25;
}

function tropicalSolarLongitude(jd: number): number {
  const T = (jd - 2451545.0) / 36525;
  const L0 = norm(280.46646 + 36000.76983 * T);
  const M = norm(357.52911 + 35999.05029 * T) * RAD;
  const C = (1.914602 - 0.004817 * T - 0.000014 * T * T) * Math.sin(M)
    + (0.019993 - 0.000101 * T) * Math.sin(2 * M)
    + 0.000289 * Math.sin(3 * M);
  return norm(L0 + C);
}

function moonTropicalLongitude(jd: number): number {
  const T = (jd - 2451545.0) / 36525;
  const T2 = T * T, T3 = T2 * T, T4 = T3 * T;
  const Lp = norm(218.3164477 + 481267.88123421 * T - 0.0015786 * T2 + T3 / 538841 - T4 / 65194000);
  const D = norm(297.8501921 + 445267.1114034 * T - 0.0018819 * T2 + T3 / 545868 - T4 / 113065000);
  const M = norm(357.5291092 + 35999.0502909 * T - 0.0001536 * T2);
  const Mp = norm(134.9633964 + 477198.8675055 * T + 0.0087414 * T2 + T3 / 69699 - T4 / 14712000);
  const F = norm(93.2720950 + 483202.0175233 * T - 0.0036539 * T2 - T3 / 3526000 + T4 / 863310000);
  const E = 1 - 0.002516 * T - 0.0000074 * T2;
  const E2 = E * E;
  const Dr = D * RAD, Mr = M * RAD, Mpr = Mp * RAD, Fr = F * RAD;

  let s = 0;
  s += 6288774 * Math.sin(Mpr);
  s += 1274027 * Math.sin(2 * Dr - Mpr);
  s += 658314 * Math.sin(2 * Dr);
  s += 213618 * Math.sin(2 * Mpr);
  s += -185116 * E * Math.sin(Mr);
  s += -114332 * Math.sin(2 * Fr);
  s += 58793 * Math.sin(2 * Dr - 2 * Mpr);
  s += 57066 * E * Math.sin(2 * Dr - Mr - Mpr);
  s += 53322 * Math.sin(2 * Dr + Mpr);
  s += 45758 * E * Math.sin(2 * Dr - Mr);
  s += -40923 * E * Math.sin(Mr - Mpr);
  s += -34720 * Math.sin(Dr);
  s += -30383 * E * Math.sin(Mr + Mpr);
  s += 15327 * Math.sin(2 * Dr - 2 * Fr);
  s += -12528 * Math.sin(Mpr + 2 * Fr);
  s += 10980 * Math.sin(Mpr - 2 * Fr);
  s += 10675 * Math.sin(4 * Dr - Mpr);
  s += 10034 * Math.sin(3 * Mpr);
  s += 8548 * Math.sin(4 * Dr - 2 * Mpr);
  s += -7888 * E * Math.sin(2 * Dr + Mr - Mpr);
  s += -6766 * E * Math.sin(2 * Dr + Mr);
  s += -5163 * Math.sin(Dr - Mpr);
  s += 4987 * E * Math.sin(Dr + Mr);
  s += 4036 * E * Math.sin(2 * Dr - Mr + Mpr);
  s += 3994 * Math.sin(2 * Dr + 2 * Mpr);
  s += 3861 * Math.sin(4 * Dr);
  s += 3665 * Math.sin(2 * Dr - 3 * Mpr);
  s += -2689 * E * Math.sin(Mr - 2 * Mpr);
  s += -2602 * Math.sin(2 * Dr - Mpr + 2 * Fr);
  s += 2390 * E * Math.sin(2 * Dr - Mr - 2 * Mpr);
  s += -2348 * Math.sin(Dr + Mpr);
  s += 2236 * E2 * Math.sin(2 * Dr - 2 * Mr);
  s += -2120 * E * Math.sin(Mr + 2 * Mpr);
  s += -2069 * E2 * Math.sin(2 * Mr);
  s += 2048 * E2 * Math.sin(2 * Dr - 2 * Mr - Mpr);
  s += -1773 * Math.sin(2 * Dr + Mpr - 2 * Fr);
  s += -1595 * Math.sin(2 * Dr + 2 * Fr);
  s += 1215 * E * Math.sin(4 * Dr - Mr - Mpr);
  s += -1110 * Math.sin(2 * Mpr + 2 * Fr);
  s += -892 * Math.sin(Dr - 3 * Mpr);

  const A1 = (119.75 + 131.849 * T) * RAD;
  const A2 = (53.09 + 479264.29 * T) * RAD;
  s += 3958 * Math.sin(A1) + 1962 * Math.sin(Lp * RAD - Fr) + 318 * Math.sin(A2);
  return norm(Lp + s / 1000000);
}

function siderealLon(tropical: number, jd: number): number {
  return norm(tropical - ayanamsha(jd));
}

function solveKepler(M: number, e: number): number {
  let E = M;
  for (let i = 0; i < 24; i++) {
    const d = (M - E + e * Math.sin(E)) / (1 - e * Math.cos(E));
    E += d;
    if (Math.abs(d) < 1e-10) break;
  }
  return E;
}

function trueAnomaly(E: number, e: number): number {
  return 2 * Math.atan2(Math.sqrt(1 + e) * Math.sin(E / 2), Math.sqrt(1 - e) * Math.cos(E / 2));
}

type Planet6 = 'Mercury' | 'Venus' | 'Earth' | 'Mars' | 'Jupiter' | 'Saturn';
interface OrbEl { L: number; a: number; e: number; i: number; Om: number; pi: number; }

function orbitalElements(planet: Planet6, T: number): OrbEl {
  switch (planet) {
    case 'Mercury': return { L: norm(252.250906 + 149472.6746358 * T), a: 0.38709831, e: 0.20563175 + 0.000020407 * T, i: 7.004986 - 0.0059516 * T, Om: norm(48.330893 - 0.1254229 * T), pi: norm(77.456119 + 0.1588643 * T) };
    case 'Venus': return { L: norm(181.979801 + 58517.815676 * T), a: 0.72332982, e: 0.00677188 - 0.000047766 * T, i: 3.394662 - 0.0008568 * T, Om: norm(76.67992 - 0.278008 * T), pi: norm(131.563707 + 0.0048646 * T) };
    case 'Earth': return { L: norm(100.466449 + 35999.3728519 * T), a: 1.000001018, e: 0.01670862 - 0.000042037 * T, i: 0, Om: 0, pi: norm(102.937348 + 0.3225557 * T) };
    case 'Mars': return { L: norm(355.433275 + 19140.2993313 * T), a: 1.523679342, e: 0.09340062 + 0.000090483 * T, i: 1.849726 - 0.0081477 * T, Om: norm(49.558093 - 0.295025 * T), pi: norm(336.060234 + 0.4439016 * T) };
    case 'Jupiter': return { L: norm(34.351484 + 3034.9056746 * T), a: 5.202603191, e: 0.04849485 + 0.000163244 * T, i: 1.30327 - 0.0019877 * T, Om: norm(100.464441 + 0.1766828 * T), pi: norm(14.331309 + 0.2155525 * T) };
    case 'Saturn': return { L: norm(50.077444 + 1222.1137943 * T), a: 9.554909596, e: 0.05550825 - 0.000346641 * T, i: 2.488878 + 0.0025514 * T, Om: norm(113.665524 - 0.2566649 * T), pi: norm(93.056787 + 0.5665496 * T) };
  }
}

function helioXYZ(el: OrbEl): { x: number; y: number; z: number } {
  const M = norm(el.L - el.pi) * RAD;
  const om = (el.pi - el.Om) * RAD;
  const Omr = el.Om * RAD;
  const ir = el.i * RAD;
  const E = solveKepler(M, el.e);
  const v = trueAnomaly(E, el.e);
  const r = el.a * (1 - el.e * Math.cos(E));
  const cO = Math.cos(Omr), sO = Math.sin(Omr);
  const cv = Math.cos(om + v), sv = Math.sin(om + v), ci = Math.cos(ir);
  return {
    x: r * (cO * cv - sO * sv * ci),
    y: r * (sO * cv + cO * sv * ci),
    z: r * sv * Math.sin(ir),
  };
}

type Planet5 = 'Mercury' | 'Venus' | 'Mars' | 'Jupiter' | 'Saturn';

function geocentricTropicalLon(planet: Planet5, jd: number): number {
  const T = (jd - 2451545.0) / 36525;
  const p = helioXYZ(orbitalElements(planet, T));
  const e = helioXYZ(orbitalElements('Earth', T));
  return norm(Math.atan2(p.y - e.y, p.x - e.x) * DEG);
}

function rahuTropicalLon(jd: number): number {
  const T = (jd - 2451545.0) / 36525;
  return norm(125.0445479 - 1934.1362608 * T + 0.0020762 * T * T + (T * T * T) / 467410);
}

function lagnaTropicalLon(jd: number, lat: number, lon: number): number {
  const T = (jd - 2451545.0) / 36525;
  const gmst = norm(280.46061837 + 360.98564736629 * (jd - 2451545.0));
  const lst = norm(gmst + lon);
  const eps = (23.439291111 - 0.013004167 * T) * RAD;
  const ramc = lst * RAD;
  const latr = lat * RAD;
  return norm(Math.atan2(-Math.cos(ramc), Math.sin(eps) * Math.tan(latr) + Math.cos(eps) * Math.sin(ramc)) * DEG);
}

function dayOfYear(d: Date): number {
  const s = new Date(d.getFullYear(), 0, 0);
  return Math.floor((d.getTime() - s.getTime()) / 86400000);
}

function timezoneFromLongitude(lon: number): number {
  return Math.round((lon / 15) * 2) / 2;
}

function sunriseSunset(date: Date, lat: number, lon: number): { sunrise: number; sunset: number } {
  const n = dayOfYear(date);
  const lngHour = lon / 15;
  const zenith = 90.833;
  const latRad = lat * RAD;

  const calc = (isSunrise: boolean): number | null => {
    const t = n + ((isSunrise ? 6 : 18) - lngHour) / 24;
    const M = 0.9856 * t - 3.289;
    const L = norm(M + 1.916 * Math.sin(M * RAD) + 0.02 * Math.sin(2 * M * RAD) + 282.634);
    let RA = norm(Math.atan(0.91764 * Math.tan(L * RAD)) * DEG);
    const Lquad = Math.floor(L / 90) * 90;
    const RAquad = Math.floor(RA / 90) * 90;
    RA = (RA + Lquad - RAquad) / 15;

    const sinDec = 0.39782 * Math.sin(L * RAD);
    const cosDec = Math.cos(Math.asin(sinDec));
    const cosH = (Math.cos(zenith * RAD) - sinDec * Math.sin(latRad)) / (cosDec * Math.cos(latRad));
    if (cosH > 1 || cosH < -1) return null;

    const H = (isSunrise ? 360 - Math.acos(cosH) * DEG : Math.acos(cosH) * DEG) / 15;
    const T = H + RA - 0.06571 * t - 6.622;
    const UT = norm(T * 15 - lon) / 15;
    const local = UT + timezoneFromLongitude(lon);
    return local;
  };

  const sr = calc(true);
  const ss = calc(false);

  if (sr == null || ss == null) return { sunrise: 6, sunset: 18 };
  return { sunrise: sr, sunset: ss > sr ? ss : sr + 12 };
}

function hourToHHMM(h: number): string {
  const mins = Math.round(h * 60);
  const hh = Math.floor((mins % (24 * 60)) / 60);
  const mm = mins % 60;
  return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
}

function hhmmToHour(s: string): number {
  const [h, m] = s.split(':').map(Number);
  return h + m / 60;
}

function getKaranaName(elongation: number): string {
  const halfIndex = Math.floor(norm(elongation) / 6) + 1; // 1..60
  if (halfIndex === 1) return 'Kimsthughna';
  if (halfIndex === 58) return 'Shakuni';
  if (halfIndex === 59) return 'Chatushpada';
  if (halfIndex === 60) return 'Naga';
  const seq = ['Bava', 'Balava', 'Kaulava', 'Taitila', 'Gara', 'Vanija', 'Vishti'];
  return seq[(halfIndex - 2) % 7];
}

function overlaps(aStart: number, aEnd: number, bStart: number, bEnd: number): boolean {
  return aStart < bEnd && bStart < aEnd;
}

function scoreTithi(tithiNum: number): number {
  if ([4, 9, 14].includes(tithiNum)) return 3;
  if ([5, 10, 15].includes(tithiNum)) return 15;
  if ([1, 6, 11].includes(tithiNum)) return 12;
  if ([2, 7, 12].includes(tithiNum)) return 12;
  if ([3, 8, 13].includes(tithiNum)) return 10;
  return 8;
}

function scoreNakshatra(idx: number, eventId: string): number {
  const good = GOOD_NAKSHATRAS[eventId] || GOOD_NAKSHATRAS.default;
  if (good.includes(idx)) return idx === 3 ? 15 : 14;
  if ([1, 5, 8, 17, 18].includes(idx)) return 3;
  return 8;
}

function scoreYoga(idx: number): number {
  if ([1, 2, 3, 4, 6, 7, 11, 13, 15, 17, 19, 20, 21, 22, 23, 24, 25].includes(idx)) return 9;
  if ([0, 5, 8, 9, 12, 14, 16, 18, 26].includes(idx)) return 2;
  return 5;
}

function scoreKarana(name: string): number {
  if (name === 'Vishti') return 0;
  if (['Bava', 'Balava', 'Kaulava', 'Taitila', 'Gara', 'Vanija'].includes(name)) return 5;
  return 2;
}

function scoreVara(vara: number, eventId: string): number {
  const good = GOOD_VARAS[eventId] || GOOD_VARAS.default;
  if (good.includes(vara)) return 10;
  if (vara === 2) return 3;
  if (vara === 6) return 4;
  return 6;
}

function houseFromLagna(sign: number, lagnaSign: number): number {
  return ((sign - lagnaSign + 12) % 12) + 1;
}

function lordStrength(lagnaSign: number, lordSign: number): LagnaInfo['lordStrength'] {
  const lord = LORD_BY_SIGN[lagnaSign];
  if ((OWN_SIGNS[lord] || []).includes(lordSign) || EXALT_SIGNS[lord] === lordSign) return 'strong';
  if (DEBIL_SIGN[lord] === lordSign) return 'weak';
  const house = houseFromLagna(lordSign, lagnaSign);
  if ([6, 8, 12].includes(house)) return 'weak';
  return 'moderate';
}

function dailyInauspiciousPeriods(vara: number, sunrise: number, sunset: number): InauspiciousPeriod[] {
  const seg = (sunset - sunrise) / 8;
  const mk = (idx: number, type: InauspiciousPeriod['type']): InauspiciousPeriod => ({
    type,
    start: hourToHHMM(sunrise + (idx - 1) * seg),
    end: hourToHHMM(sunrise + idx * seg),
  });

  return [
    mk(RAHU_SEG[vara], 'rahu_kaal'),
    mk(YAMA_SEG[vara], 'yamaghanta'),
    mk(GULIKA_SEG[vara], 'gulika'),
  ];
}

function buildSummary(event: MuhuratEventType, p: PanchangSnapshot, l: LagnaInfo, bonusYogas: string[], total: number): string {
  const lead = total >= 90
    ? `An exceptional Muhurat for ${event.name}.`
    : total >= 75
      ? `A very strong Muhurat for ${event.name}.`
      : total >= 60
        ? `A good Muhurat for ${event.name}.`
        : `An acceptable Muhurat for ${event.name}.`;
  const yogas = bonusYogas.length > 0 ? ` Special yogas active: ${bonusYogas.join(', ')}.` : '';
  return `${lead} ${p.varaName} with ${p.nakshatraName} Nakshatra, ${p.tithiName}, and ${l.signName} Lagna supports this event.${yogas}`;
}

function buildWarnings(l: LagnaInfo, blocked: InauspiciousPeriod[]): string[] {
  const w: string[] = [];
  if (l.maleficsInKendra) w.push(`${l.signName} Lagna has malefics in Kendra. Begin with Ganesh puja for shanti.`);
  if ([6, 8, 12].includes(l.moonHouse)) w.push(`Moon is in ${l.moonHouse}th house from Lagna; emotional sensitivity can be higher.`);
  if (blocked.length > 0) w.push(`Avoid overlap with ${blocked.map(b => b.type.replace('_', ' ')).join(', ')}.`);
  return w;
}

function formatDateISO(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export interface MuhuratRequestParams {
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
  person2Name?: string;
  person2DOB?: string;
}

export function calculateMuhurat(params: MuhuratRequestParams): MuhuratCandidate[] {
  const event = getMuhuratEvent(params.eventId);
  if (!event) return [];

  const from = new Date(`${params.dateFrom}T00:00:00`);
  const to = new Date(`${params.dateTo}T00:00:00`);
  const out: MuhuratCandidate[] = [];

  for (let d = new Date(from); d <= to; d.setDate(d.getDate() + 1)) {
    const vara = d.getDay();

    if (params.preferredDays && params.preferredDays.length > 0 && !params.preferredDays.includes(vara)) {
      continue;
    }

    const { sunrise, sunset } = sunriseSunset(d, params.locationLat, params.locationLng);
    const inauspicious = dailyInauspiciousPeriods(vara, sunrise, sunset);

    const slotStart = params.timeWindow === 'morning'
      ? Math.max(sunrise + 0.25, 6)
      : params.timeWindow === 'afternoon'
        ? Math.max(12, sunrise + 3)
        : Math.max(sunrise + 0.25, 6);

    const slotEnd = params.timeWindow === 'morning'
      ? Math.min(12, sunset - 1.5)
      : params.timeWindow === 'afternoon'
        ? Math.min(18, sunset - 0.75)
        : Math.min(18, sunset - 0.75);

    for (let t = slotStart; t <= slotEnd; t += 0.5) {
      const start = t;
      const end = Math.min(t + 1.5, sunset);
      if (end - start < 0.75) continue;

      const blocked = inauspicious.filter((p) => overlaps(start, end, hhmmToHour(p.start), hhmmToHour(p.end)));
      if (blocked.length > 0) continue;

      const h = Math.floor(start);
      const m = Math.round((start - h) * 60);
      const jd = jdAtLocal(d, h, m, params.locationLng);

      const sunTrop = tropicalSolarLongitude(jd);
      const moonTrop = moonTropicalLongitude(jd);
      const sunSid = siderealLon(sunTrop, jd);
      const moonSid = siderealLon(moonTrop, jd);
      const elong = norm(moonTrop - sunTrop);

      const rawTithi = Math.ceil(elong / 12) || 30;
      const paksha: 'shukla' | 'krishna' = rawTithi <= 15 ? 'shukla' : 'krishna';
      const tithi = rawTithi <= 15 ? rawTithi : rawTithi - 15;
      const tithiName = tithi === 15
        ? (paksha === 'shukla' ? 'Purnima' : 'Amavasya')
        : TITHI_NAMES[tithi - 1];

      const nakshatra = Math.min(Math.floor(moonSid / (360 / 27)), 26);
      const yoga = Math.min(Math.floor(norm(moonSid + sunSid) / (360 / 27)), 26);
      const karanaName = getKaranaName(elong);
      const karana = Math.max(0, KARANA_NAMES.indexOf(karanaName));
      const moonSign = Math.floor(moonSid / 30) % 12;

      const lunar = gregorianToLunarWithTime(
        d.getFullYear(), d.getMonth() + 1, d.getDate(),
        h, m, timezoneFromLongitude(params.locationLng),
      );

      const lagnaSid = siderealLon(lagnaTropicalLon(jd, params.locationLat, params.locationLng), jd);
      const lagnaSign = Math.floor(lagnaSid / 30) % 12;

      const marsSign = Math.floor(siderealLon(geocentricTropicalLon('Mars', jd), jd) / 30) % 12;
      const saturnSign = Math.floor(siderealLon(geocentricTropicalLon('Saturn', jd), jd) / 30) % 12;
      const jupiterSign = Math.floor(siderealLon(geocentricTropicalLon('Jupiter', jd), jd) / 30) % 12;
      const rahuSign = Math.floor(siderealLon(rahuTropicalLon(jd), jd) / 30) % 12;
      const ketuSign = (rahuSign + 6) % 12;
      const moonHouse = houseFromLagna(moonSign, lagnaSign);

      const lordPlanet = LORD_BY_SIGN[lagnaSign];
      const lordSign = lordPlanet === 'Sun' ? Math.floor(sunSid / 30) % 12
        : lordPlanet === 'Moon' ? moonSign
          : lordPlanet === 'Mars' ? marsSign
            : lordPlanet === 'Mercury' ? Math.floor(siderealLon(geocentricTropicalLon('Mercury', jd), jd) / 30) % 12
              : lordPlanet === 'Jupiter' ? jupiterSign
                : lordPlanet === 'Venus' ? Math.floor(siderealLon(geocentricTropicalLon('Venus', jd), jd) / 30) % 12
                  : saturnSign;

      const lStrength = lordStrength(lagnaSign, lordSign);
      const maleficsInKendra = [marsSign, saturnSign, rahuSign, ketuSign]
        .some((s) => [1, 4, 7, 10].includes(houseFromLagna(s, lagnaSign)));
      const diffToLagnaFromJupiter = houseFromLagna(lagnaSign, jupiterSign);
      const jupiterAspect = [5, 7, 9].includes(diffToLagnaFromJupiter);

      const lagna: LagnaInfo = {
        sign: lagnaSign,
        signName: RASHI_NAMES[lagnaSign],
        degree: +(lagnaSid % 30).toFixed(1),
        lordStrength: lStrength,
        maleficsInKendra,
        jupiterAspect,
        moonHouse,
      };

      const tithiScore = scoreTithi(tithi);
      const nakScore = scoreNakshatra(nakshatra, params.eventId);
      const yogaScore = scoreYoga(yoga);
      const karScore = scoreKarana(karanaName);
      const varaScore = scoreVara(vara, params.eventId);
      const goodL = GOOD_LAGNAS[params.eventId] || GOOD_LAGNAS.default;

      let lagnaScore = goodL.includes(lagnaSign) ? 16 : 8;
      if (lStrength === 'strong') lagnaScore += 3;
      if (lStrength === 'weak') lagnaScore -= 3;
      if (jupiterAspect) lagnaScore += 4;
      if (!maleficsInKendra) lagnaScore += 2;
      if ([6, 8, 12].includes(moonHouse)) lagnaScore -= 3;
      lagnaScore = Math.max(0, Math.min(25, lagnaScore));

      const bonusYogas: string[] = [];
      if ((SARVARTHA_SIDDHI[vara] || []).includes(nakshatra)) bonusYogas.push('Sarvartha Siddhi Yoga');
      if (AMRITA_SIDDHI[vara] === nakshatra) bonusYogas.push('Amrita Siddhi Yoga');
      if (vara === 4 && nakshatra === 7) bonusYogas.push('Guru Pushya Yoga');

      const mid = (sunrise + sunset) / 2;
      if (overlaps(start, end, mid - 0.4, mid + 0.4)) bonusYogas.push('Abhijit Muhurat');

      const cleanScore = 10;
      const bonusScore = Math.min(10, bonusYogas.length * 4 + (bonusYogas.includes('Guru Pushya Yoga') ? 2 : 0));

      const total = Math.max(20, Math.min(100,
        tithiScore + nakScore + yogaScore + karScore + varaScore + lagnaScore + cleanScore + bonusScore,
      ));

      const rating: 1 | 2 | 3 | 4 | 5 = total >= 90 ? 5 : total >= 75 ? 4 : total >= 60 ? 3 : total >= 45 ? 2 : 1;

      const panchang: PanchangSnapshot = {
        tithi,
        tithiName,
        paksha,
        nakshatra,
        nakshatraName: NAKSHATRA_NAMES[nakshatra],
        yoga,
        yogaName: YOGA_NAMES[yoga],
        karana,
        karanaName,
        vara,
        varaName: VARA_NAMES[vara],
        sunrise: hourToHHMM(sunrise),
        sunset: hourToHHMM(sunset),
        moonSign,
        moonSignName: RASHI_NAMES[moonSign],
        lunarMonth: lunar?.lunarMonth || 'Unknown',
      };

      const scores: MuhuratScores = {
        tithi: tithiScore,
        nakshatra: nakScore,
        yoga: yogaScore,
        karana: karScore,
        vara: varaScore,
        lagna: lagnaScore,
        cleanPeriod: cleanScore,
        bonus: bonusScore,
        total,
      };

      out.push({
        date: formatDateISO(d),
        timeStart: hourToHHMM(start),
        timeEnd: hourToHHMM(end),
        durationMinutes: Math.round((end - start) * 60),
        eventType: event,
        panchang,
        lagna,
        inauspiciousPeriods: inauspicious,
        bonusYogas,
        scores,
        rating,
        summary: buildSummary(event, panchang, lagna, bonusYogas, total),
        warnings: buildWarnings(lagna, blocked),
        location: params.locationName,
      });
    }
  }

  out.sort((a, b) => b.scores.total - a.scores.total || a.date.localeCompare(b.date) || a.timeStart.localeCompare(b.timeStart));

  const filtered: MuhuratCandidate[] = [];
  const seen = new Set<string>();
  for (const c of out) {
    const k = `${c.date}|${c.timeStart}`;
    if (seen.has(k)) continue;
    seen.add(k);
    filtered.push(c);
    if (filtered.length >= params.numResults) break;
  }

  return filtered;
}
