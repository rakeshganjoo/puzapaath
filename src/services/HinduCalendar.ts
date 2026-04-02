/**
 * KP (Kashmiri Pandit) Calendar — Lunisolar (Chandramasa) System
 * Based on Saptarishi Samvat (epoch 3076 BCE), also known as Nechipattri.
 *
 * Month naming follows PURNIMANT convention:
 *   1. Find the new moon (Amavasya) that begins the current lunation.
 *   2. The Sun's sidereal rashi at that new moon gives the Amant base month.
 *   3. Shukla Paksha keeps the base month name.
 *   4. Krishna Paksha gets the NEXT month name (Purnimant shift).
 *      e.g. NM in Vrishchika → base Margshirsh → Krishna = Paush
 *
 * Kashmiri month names: Chet, Vaisakh, Jeth, Har, Sawan, Bhadoon,
 *                       Asuj, Kartik, Mangir, Poh, Magh, Phagun
 *
 * Tithi: Moon–Sun elongation (Meeus Ch. 47 Moon + solar position)
 * computed at Kashmir sunrise gives the precise lunar day (1–30).
 *
 * Derives: lunar month, paksha, tithi (1-15), day of week.
 */

const LUNAR_MONTHS = [
  'Chaitra', 'Vaishakh', 'Jyeshtha', 'Ashadh',
  'Shravan', 'Bhadrapad', 'Ashwin', 'Kartik',
  'Margshirsh', 'Paush', 'Magh', 'Phalgun',
];

const DAYS = ['Ravivar', 'Somvar', 'Mangalvar', 'Budhvar', 'Guruvar', 'Shukravar', 'Shanivar'];

const VASARA_NAMES = ['Ravi', 'Soma', 'Mangal', 'Budh', 'Brihaspati', 'Shukra', 'Shani'];

const TITHI_SANKALPA = [
  'Pratipadam', 'Dwitiyam', 'Tritiyam', 'Chaturthyam', 'Panchamyam',
  'Shashthyam', 'Saptamyam', 'Ashtamyam', 'Navamyam', 'Dashamyam',
  'Ekadashyam', 'Dwadashyam', 'Trayodashyam', 'Chaturdashyam', 'Purnimam',
];
const TITHI_SANKALPA_KRISHNA_15 = 'Amavasyam';

const SYNODIC_MONTH = 29.53059;

// Kashmir sunrise: ~6:15 AM local (74.8°E ≈ UTC+5:00), ≈ 1:15 UTC = noon UT - 10.75h
const IST_SUNRISE_OFFSET = -10.75 / 24; // ≈ -0.448 days from noon UT

// ── Gregorian ↔ Julian Day ──────────────────────────────────────────────

function gregorianToJD(year: number, month: number, day: number): number {
  const a = Math.floor((14 - month) / 12);
  const y = year + 4800 - a;
  const m = month + 12 * a - 3;
  return (
    day +
    Math.floor((153 * m + 2) / 5) +
    365 * y +
    Math.floor(y / 4) -
    Math.floor(y / 100) +
    Math.floor(y / 400) -
    32045
  );
}

// ── Meeus New-Moon Algorithm ────────────────────────────────────────────

/**
 * Compute the Julian Ephemeris Day of the k-th new moon.
 * k = 0 → the new moon of January 6, 2000 (~18:14 UTC).
 */
function computeNewMoonJD(k: number): number {
  const T = k / 1236.85;
  const T2 = T * T;
  const T3 = T2 * T;
  const T4 = T3 * T;

  const E = 1 - 0.002516 * T - 0.0000074 * T2;
  const E2 = E * E;

  let JDE =
    2451550.09766 +
    29.530588861 * k +
    0.00015437 * T2 -
    0.00000015 * T3 +
    0.00000000073 * T4;

  // Sun's mean anomaly (degrees)
  const M = 2.5534 + 29.1053567 * k - 0.0000014 * T2 - 0.00000011 * T3;
  // Moon's mean anomaly
  const Mp = 201.5643 + 385.81693528 * k + 0.0107582 * T2 + 0.00001238 * T3 - 0.000000058 * T4;
  // Moon's argument of latitude
  const F = 160.7108 + 390.67050284 * k - 0.0016118 * T2 - 0.00000227 * T3 + 0.000000011 * T4;
  // Longitude of ascending node
  const Om = 124.7746 - 1.56375588 * k + 0.0020672 * T2 + 0.00000215 * T3;

  const rad = Math.PI / 180;
  const mr = M * rad;
  const mpr = Mp * rad;
  const fr = F * rad;
  const omr = Om * rad;

  JDE +=
    -0.4072  * Math.sin(mpr) +
     0.17241 * E * Math.sin(mr) +
     0.01608 * Math.sin(2 * mpr) +
     0.01039 * Math.sin(2 * fr) +
     0.00739 * E * Math.sin(mpr - mr) -
     0.00514 * E * Math.sin(mpr + mr) +
     0.00208 * E2 * Math.sin(2 * mr) -
     0.00111 * Math.sin(mpr - 2 * fr) -
     0.00057 * Math.sin(mpr + 2 * fr) +
     0.00056 * E * Math.sin(2 * mpr + mr) -
     0.00042 * Math.sin(3 * mpr) +
     0.00042 * E * Math.sin(mr + 2 * fr) +
     0.00038 * E * Math.sin(mr - 2 * fr) -
     0.00024 * E * Math.sin(2 * mpr - mr) -
     0.00017 * Math.sin(omr) -
     0.00007 * Math.sin(mpr + 2 * mr) +
     0.00004 * Math.sin(2 * mpr - 2 * fr) +
     0.00004 * Math.sin(3 * mr) +
     0.00003 * Math.sin(mpr + mr - 2 * fr) +
     0.00003 * Math.sin(2 * mpr + 2 * fr) -
     0.00003 * Math.sin(mpr + mr + 2 * fr) +
     0.00003 * Math.sin(mpr - mr + 2 * fr) -
     0.00002 * Math.sin(mpr - mr - 2 * fr) -
     0.00002 * Math.sin(3 * mpr + mr) +
     0.00002 * Math.sin(4 * mpr);

  return JDE;
}

/**
 * Find the k and JD of the new moon immediately before the given JD.
 */
function findPreviousNewMoon(jd: number): { k: number; jd: number } {
  const year = 2000 + (jd - 2451545) / 365.25;
  let k = Math.round((year - 2000) * 12.3685);
  let nm = computeNewMoonJD(k);

  while (nm > jd) { k--; nm = computeNewMoonJD(k); }
  while (computeNewMoonJD(k + 1) <= jd) { k++; nm = computeNewMoonJD(k); }

  return { k, jd: nm };
}

/**
 * Find the Meeus-k of the Chaitra new moon for a given Gregorian year.
 * Chaitra new moon = first new moon on or after March 14.
 */
function findChaitraK(year: number): number {
  const threshold = gregorianToJD(year, 3, 14) + IST_SUNRISE_OFFSET;
  const yearDec = year + 2 / 12;
  let k = Math.round((yearDec - 2000) * 12.3685);
  let nm = computeNewMoonJD(k);

  while (nm < threshold) { k++; nm = computeNewMoonJD(k); }
  while (computeNewMoonJD(k - 1) >= threshold) { k--; }

  return k;
}

// ── Solar & Lunar Position ─────────────────────────────────────────────

/** Tropical ecliptic longitude of the Sun (degrees 0-360). */
function tropicalSolarLongitude(jd: number): number {
  const T = (jd - 2451545.0) / 36525.0;
  const L0 = (280.46646 + 36000.76983 * T + 0.0003032 * T * T) % 360;
  const M = (357.52911 + 35999.05029 * T - 0.0001537 * T * T) % 360;
  const Mrad = M * Math.PI / 180;
  const C =
    (1.914602 - 0.004817 * T - 0.000014 * T * T) * Math.sin(Mrad) +
    (0.019993 - 0.000101 * T) * Math.sin(2 * Mrad) +
    0.000289 * Math.sin(3 * Mrad);
  let lon = (L0 + C) % 360;
  if (lon < 0) lon += 360;
  return lon;
}

/** Sidereal (nirayana) solar longitude using Lahiri ayanamsha. */
function siderealSolarLongitude(jd: number): number {
  const tropLong = tropicalSolarLongitude(jd);
  const ayanamsha = 23.856 + 0.0137 * (jd - 2451545.0) / 365.25;
  let sid = (tropLong - ayanamsha) % 360;
  if (sid < 0) sid += 360;
  return sid;
}

/**
 * Tropical ecliptic longitude of the Moon (Meeus Ch. 47, main terms).
 * Accuracy ~10 arcminutes, sufficient for tithi computation.
 */
function moonEclipticLongitude(jd: number): number {
  const T = (jd - 2451545.0) / 36525.0;
  const T2 = T * T;
  const T3 = T2 * T;
  const T4 = T3 * T;
  const rad = Math.PI / 180;

  const Lp = ((218.3164477 + 481267.88123421 * T - 0.0015786 * T2 + T3 / 538841 - T4 / 65194000) % 360 + 360) % 360;
  const D  = ((297.8501921 + 445267.1114034 * T - 0.0018819 * T2 + T3 / 545868 - T4 / 113065000) % 360 + 360) % 360;
  const M  = ((357.5291092 + 35999.0502909 * T - 0.0001536 * T2 + T3 / 24490000) % 360 + 360) % 360;
  const Mp = ((134.9633964 + 477198.8675055 * T + 0.0087414 * T2 + T3 / 69699 - T4 / 14712000) % 360 + 360) % 360;
  const F  = ((93.2720950 + 483202.0175233 * T - 0.0036539 * T2 - T3 / 3526000 + T4 / 863310000) % 360 + 360) % 360;

  const E = 1 - 0.002516 * T - 0.0000074 * T2;
  const E2 = E * E;
  const Dr = D * rad, Mr = M * rad, Mpr = Mp * rad, Fr = F * rad;

  let sumL = 0;
  sumL += 6288774 * Math.sin(Mpr);
  sumL += 1274027 * Math.sin(2 * Dr - Mpr);
  sumL += 658314 * Math.sin(2 * Dr);
  sumL += 213618 * Math.sin(2 * Mpr);
  sumL += -185116 * E * Math.sin(Mr);
  sumL += -114332 * Math.sin(2 * Fr);
  sumL += 58793 * Math.sin(2 * Dr - 2 * Mpr);
  sumL += 57066 * E * Math.sin(2 * Dr - Mr - Mpr);
  sumL += 53322 * Math.sin(2 * Dr + Mpr);
  sumL += 45758 * E * Math.sin(2 * Dr - Mr);
  sumL += -40923 * E * Math.sin(Mr - Mpr);
  sumL += -34720 * Math.sin(Dr);
  sumL += -30383 * E * Math.sin(Mr + Mpr);
  sumL += 15327 * Math.sin(2 * Dr - 2 * Fr);
  sumL += -12528 * Math.sin(Mpr + 2 * Fr);
  sumL += 10980 * Math.sin(Mpr - 2 * Fr);
  sumL += 10675 * Math.sin(4 * Dr - Mpr);
  sumL += 10034 * Math.sin(3 * Mpr);
  sumL += 8548 * Math.sin(4 * Dr - 2 * Mpr);
  sumL += -7888 * E * Math.sin(2 * Dr + Mr - Mpr);
  sumL += -6766 * E * Math.sin(2 * Dr + Mr);
  sumL += -5163 * Math.sin(Dr - Mpr);
  sumL += 4987 * E * Math.sin(Dr + Mr);
  sumL += 4036 * E * Math.sin(2 * Dr - Mr + Mpr);
  sumL += 3994 * Math.sin(2 * Dr + 2 * Mpr);
  sumL += 3861 * Math.sin(4 * Dr);
  sumL += 3665 * Math.sin(2 * Dr - 3 * Mpr);
  sumL += -2689 * E * Math.sin(Mr - 2 * Mpr);
  sumL += -2602 * Math.sin(2 * Dr - Mpr + 2 * Fr);
  sumL += 2390 * E * Math.sin(2 * Dr - Mr - 2 * Mpr);
  sumL += -2348 * Math.sin(Dr + Mpr);
  sumL += 2236 * E2 * Math.sin(2 * Dr - 2 * Mr);
  sumL += -2120 * E * Math.sin(Mr + 2 * Mpr);
  sumL += -2069 * E2 * Math.sin(2 * Mr);
  sumL += 2048 * E2 * Math.sin(2 * Dr - 2 * Mr - Mpr);
  sumL += -1773 * Math.sin(2 * Dr + Mpr - 2 * Fr);
  sumL += -1595 * Math.sin(2 * Dr + 2 * Fr);
  sumL += 1215 * E * Math.sin(4 * Dr - Mr - Mpr);
  sumL += -1110 * Math.sin(2 * Mpr + 2 * Fr);
  sumL += -892 * Math.sin(Dr - 3 * Mpr);

  const A1 = (119.75 + 131.849 * T) * rad;
  const A2 = (53.09 + 479264.290 * T) * rad;
  sumL += 3958 * Math.sin(A1);
  sumL += 1962 * Math.sin(Lp * rad - Fr);
  sumL += 318 * Math.sin(A2);

  return ((Lp + sumL / 1000000) % 360 + 360) % 360;
}

/** Sun's sidereal rashi → lunar month name. */
const RASHI_TO_MONTH: string[] = [
  /* 0  Mesha */      'Vaishakh',
  /* 1  Vrishabha */  'Jyeshtha',
  /* 2  Mithuna */    'Ashadh',
  /* 3  Karka */      'Shravan',
  /* 4  Simha */      'Bhadrapad',
  /* 5  Kanya */      'Ashwin',
  /* 6  Tula */       'Kartik',
  /* 7  Vrishchika */ 'Margshirsh',
  /* 8  Dhanu */      'Paush',
  /* 9  Makara */     'Magh',
  /* 10 Kumbha */     'Phalgun',
  /* 11 Meena */      'Chaitra',
];

/** Raw tithi (1-30) from Moon–Sun elongation at a given JD. */
function rawTithiAtJD(jd: number): number {
  const moonLon = moonEclipticLongitude(jd);
  const sunLon = tropicalSolarLongitude(jd);
  let elongation = (moonLon - sunLon) % 360;
  if (elongation < 0) elongation += 360;
  const t = Math.ceil(elongation / 12);
  return t || 30;
}

/**
 * Lunar day (1-30) from Moon–Sun elongation at Kashmir sunrise.
 * 1-15 = Shukla Paksha, 16-30 = Krishna Paksha.
 *
 * Handles kshaya (skipped) tithis at paksha boundaries: when Shukla
 * Pratipada (or Krishna Pratipada) starts after today's sunrise and
 * ends before tomorrow's, it never "prevails" at any sunrise.  Standard
 * panchang convention assigns the kshaya Pratipada to the earlier day so
 * that key festivals (Navreh, etc.) are never missing from the calendar.
 */
function getLunarDay(year: number, month: number, day: number): number {
  const jd = gregorianToJD(year, month, day) + IST_SUNRISE_OFFSET;
  const tithiToday = rawTithiAtJD(jd);

  // Only adjust at paksha boundaries (Amavasya→Pratipada or Purnima→K.Pratipada)
  if (tithiToday === 30 || tithiToday === 15) {
    const tithiTomorrow = rawTithiAtJD(jd + 1);
    const expected = (tithiToday % 30) + 1;
    const gap = ((tithiTomorrow - tithiToday) % 30 + 30) % 30;
    if (gap >= 2) {
      return expected;
    }
  }

  return tithiToday;
}

/**
 * Lunar month naming using Purnimant convention:
 *
 * 1. Find the new moon (Amavasya) that starts the current lunation.
 * 2. Sun's sidereal rashi at that new moon gives the Amant base month.
 * 3. Shukla Paksha (lunarDay 1-15): uses the base month name.
 * 4. Krishna Paksha (lunarDay 16-30): uses base + 1 (Purnimant shift).
 *    e.g. NM in Vrishchika → Margshirsh base → Krishna = Paush
 */
function getLunarMonth(year: number, month: number, day: number, lunarDay: number): string {
  const jd = gregorianToJD(year, month, day) + IST_SUNRISE_OFFSET;

  // Handle kshaya Pratipada: when lunarDay is 1 but raw tithi is still 30,
  // the new moon is about to happen. Use the upcoming NM instead.
  const rawTithi = rawTithiAtJD(jd);
  const kshayaPratipada = (lunarDay === 1 && rawTithi === 30);

  let nmJD: number;
  if (kshayaPratipada) {
    const { jd: futureNM } = findPreviousNewMoon(jd + 1);
    nmJD = futureNM;
  } else {
    const prev = findPreviousNewMoon(jd);
    nmJD = prev.jd;
  }

  // Sun's sidereal rashi at the new moon determines the base (Amant) month
  const solarAtNM = siderealSolarLongitude(nmJD);
  const rashiIdx = Math.floor(solarAtNM / 30);

  // Purnimant: Krishna Paksha gets the next month name
  if (lunarDay > 15) {
    return RASHI_TO_MONTH[(rashiIdx + 1) % 12];
  }
  return RASHI_TO_MONTH[rashiIdx];
}

// ── Public API ──────────────────────────────────────────────────────────

export interface LunarDate {
  lunarMonth: string;
  paksha: 'shukla' | 'krishna';
  tithi: string;
  tithiNum: number;
  day: string;
}

const TITHI_NAMES = [
  'Pratipada (1)', 'Dwitiya (2)', 'Tritiya (3)', 'Chaturthi (4)',
  'Panchami (5)', 'Shashthi (6)', 'Saptami (7)', 'Ashtami (8)',
  'Navami (9)', 'Dashami (10)', 'Ekadashi (11)', 'Dwadashi (12)',
  'Trayodashi (13)', 'Chaturdashi (14)', 'Purnima (15)',
];
const TITHI_AMAVASYA = 'Amavasya (15)';

/**
 * Convert a Gregorian date string (YYYY-MM-DD) to KP (Purnimant) lunar date.
 * Uses Kashmir sunrise convention (default for calendar).
 */
export function gregorianToLunar(dateStr: string): LunarDate | null {
  const parts = dateStr.split('-');
  if (parts.length !== 3) return null;
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10);
  const day = parseInt(parts[2], 10);
  if (isNaN(year) || isNaN(month) || isNaN(day)) return null;

  const lunarDay = getLunarDay(year, month, day);
  const paksha: 'shukla' | 'krishna' = lunarDay <= 15 ? 'shukla' : 'krishna';
  const tithiNum = lunarDay <= 15 ? lunarDay : lunarDay - 15;
  const tithi = paksha === 'krishna' && tithiNum === 15
    ? TITHI_AMAVASYA
    : TITHI_NAMES[Math.min(tithiNum - 1, 14)];

  const lunarMonth = getLunarMonth(year, month, day, lunarDay);

  const dateObj = new Date(year, month - 1, day);
  const dayOfWeek = DAYS[dateObj.getDay()];

  return { lunarMonth, paksha, tithi, tithiNum, day: dayOfWeek };
}

/**
 * Convert a Gregorian date+time to KP (Purnimant) lunar date.
 * Uses the EXACT time provided (with UTC offset) instead of Kashmir sunrise.
 *
 * @param year   Gregorian year
 * @param month  Gregorian month (1-12)
 * @param day    Gregorian day
 * @param hour   Local hour (0-23)
 * @param minute Local minute (0-59)
 * @param utcOffsetHours  UTC offset in hours (e.g. 5.5 for IST, 8 for Singapore)
 */
export function gregorianToLunarWithTime(
  year: number, month: number, day: number,
  hour: number, minute: number,
  utcOffsetHours: number,
): LunarDate | null {
  if (isNaN(year) || isNaN(month) || isNaN(day)) return null;

  // Compute JD at the exact specified moment
  const jdNoon = gregorianToJD(year, month, day);
  // JD is at 12:00 UT (noon), so adjust for local time relative to UT noon
  const localTimeInDays = (hour + minute / 60) / 24; // fraction of day from midnight
  const utOffsetInDays = utcOffsetHours / 24;
  // JD at this moment = JD_noon + (localTime - 0.5) - utcOffset
  // (localTime - 0.5) converts from midnight-based to noon-based
  const jd = jdNoon + (localTimeInDays - 0.5) - utOffsetInDays;

  // Compute raw tithi at this exact moment
  const rawTithi = rawTithiAtJD(jd);
  const paksha: 'shukla' | 'krishna' = rawTithi <= 15 ? 'shukla' : 'krishna';
  const tithiNum = rawTithi <= 15 ? rawTithi : rawTithi - 15;
  const tithi = paksha === 'krishna' && tithiNum === 15
    ? TITHI_AMAVASYA
    : TITHI_NAMES[Math.min(tithiNum - 1, 14)];

  // For lunar month, use the same logic but with this JD
  const lunarDay = rawTithi;
  const lunarMonth = getLunarMonth(year, month, day, lunarDay);

  const dateObj = new Date(year, month - 1, day);
  const dayOfWeek = DAYS[dateObj.getDay()];

  return { lunarMonth, paksha, tithi, tithiNum, day: dayOfWeek };
}

// ── Calendar generation ─────────────────────────────────────────────────

export interface CalendarDay {
  date: Date;
  day: number;
  lunarMonth: string;
  paksha: 'shukla' | 'krishna';
  tithiNum: number;
  tithiName: string;
  dayOfWeek: string;
  /** True when this day's tithi repeats from the previous day (vriddhi/adhika tithi). */
  isAdhika?: boolean;
  /** True when a tithi was skipped between this day and the previous day (kshaya tithi). */
  isKshaya?: boolean;
  /** The tithi name that was skipped, if isKshaya is true. */
  skippedTithi?: string;
}

/** Tithi name for a given raw lunar day (1-30). */
function tithiNameForLunarDay(ld: number): string {
  const pk: 'shukla' | 'krishna' = ld <= 15 ? 'shukla' : 'krishna';
  const num = ld <= 15 ? ld : ld - 15;
  if (pk === 'krishna' && num === 15) return TITHI_AMAVASYA;
  return TITHI_NAMES[Math.min(num - 1, 14)];
}

/**
 * Generate CalendarDay objects for every day in a Gregorian month.
 * Detects adhika (repeated) and kshaya (skipped) tithis by comparing
 * the raw lunar day at each sunrise with the previous day.
 */
export function getMonthCalendar(year: number, month: number): CalendarDay[] {
  const daysInMonth = new Date(year, month, 0).getDate();
  const result: CalendarDay[] = [];

  // Get the previous day's lunar day for the first day comparison
  const prevDate = new Date(year, month - 1, 0); // last day of previous month
  let prevLunarDay = getLunarDay(prevDate.getFullYear(), prevDate.getMonth() + 1, prevDate.getDate());

  for (let d = 1; d <= daysInMonth; d++) {
    const lunarDay = getLunarDay(year, month, d);
    const paksha: 'shukla' | 'krishna' = lunarDay <= 15 ? 'shukla' : 'krishna';
    const tithiNum = lunarDay <= 15 ? lunarDay : lunarDay - 15;
    const dateObj = new Date(year, month - 1, d);

    // Detect adhika: same tithi as yesterday
    const isAdhika = lunarDay === prevLunarDay;

    // Detect kshaya: a tithi was skipped between yesterday and today
    const expectedNext = (prevLunarDay % 30) + 1;
    const gap = ((lunarDay - prevLunarDay) % 30 + 30) % 30;
    const isKshaya = gap >= 2;
    let skippedTithi: string | undefined;
    if (isKshaya) {
      skippedTithi = tithiNameForLunarDay(expectedNext);
    }

    result.push({
      date: dateObj,
      day: d,
      lunarMonth: getLunarMonth(year, month, d, lunarDay),
      paksha,
      tithiNum,
      tithiName: paksha === 'krishna' && tithiNum === 15
        ? TITHI_AMAVASYA
        : TITHI_NAMES[Math.min(tithiNum - 1, 14)],
      dayOfWeek: DAYS[dateObj.getDay()],
      isAdhika: isAdhika || undefined,
      isKshaya: isKshaya || undefined,
      skippedTithi,
    });

    prevLunarDay = lunarDay;
  }
  return result;
}

/**
 * Generate the Sankalpa / Panchang summary line for a given calendar day.
 */
export function getSankalpa(day: CalendarDay): string {
  const tithiIdx = day.tithiNum - 1;
  let tithiSankalpa: string;
  if (day.paksha === 'krishna' && day.tithiNum === 15) {
    tithiSankalpa = TITHI_SANKALPA_KRISHNA_15;
  } else {
    tithiSankalpa = TITHI_SANKALPA[Math.min(tithiIdx, 14)];
  }

  let nextTithi: string;
  if (day.tithiNum < 15) {
    nextTithi = day.paksha === 'krishna' && day.tithiNum === 14
      ? TITHI_SANKALPA_KRISHNA_15
      : TITHI_SANKALPA[tithiIdx + 1];
  } else {
    nextTithi = TITHI_SANKALPA[0];
  }

  const vasara = VASARA_NAMES[day.date.getDay()];

  return (
    `Om tat sat Brahma adi tavat tethav avadha ` +
    `${day.lunarMonth} Masasay ${day.paksha === 'shukla' ? 'Shukla' : 'Krishna'}-Pakshya ` +
    `Maha parvani "${tithiSankalpa}" parta ${nextTithi} ` +
    `${vasara}-Vasara sana-nita-yaam`
  );
}

export { LUNAR_MONTHS, TITHI_NAMES, DAYS };
