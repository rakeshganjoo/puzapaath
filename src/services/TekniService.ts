/**
 * TekniService.ts — Full Jyotish Astronomical Computation
 *
 * Planetary positions via Meeus orbital-element method
 * ("Astronomical Algorithms" 2nd ed., Chapters 31–33).
 * Accuracy: ~1–2° geocentric ecliptic longitude — sufficient for
 * rashi (30° wide) and nakshatra (13.33° wide) assignment.
 *
 * Sun  : Meeus Ch. 27 solar longitude formula
 * Moon : 40-term Meeus Ch. 47 formula (same as the calendar engine)
 * Mars, Mercury, Jupiter, Venus, Saturn: Meeus orbital elements (Table 31.a)
 * Rahu : Mean lunar ascending node formula
 * Ketu : Always 180° from Rahu
 * Lagna: From Local Sidereal Time + birth latitude and longitude
 *
 * Ayanamsha : Lahiri (matches the KP calendar engine)
 * UTC offset : Estimated from birth longitude (local mean time).
 *   Traditional jyotish uses LMT; actual timezone introduces < 30 min
 *   error for most Indian locations. For diaspora births the user should
 *   verify placement with their pandit if exact lagna degree matters.
 */

import type { TekniData, GrahaPosition } from '../types/tekni';
import type { RootStackParamList } from '../navigation/types';

type TekniParams = RootStackParamList['TekniLoading'];

// ─── Helpers ───────────────────────────────────────────────────────────
const RAD = Math.PI / 180;
const DEG = 180 / Math.PI;
function norm(a: number): number { return ((a % 360) + 360) % 360; }

// ─── Julian Day ────────────────────────────────────────────────────────
function toJD(y: number, m: number, d: number): number {
  const a = Math.floor((14 - m) / 12);
  const yr = y + 4800 - a;
  const mo = m + 12 * a - 3;
  return d + Math.floor((153 * mo + 2) / 5) + 365 * yr +
    Math.floor(yr / 4) - Math.floor(yr / 100) + Math.floor(yr / 400) - 32045;
}

/**
 * JD at the exact birth moment.
 * UTC offset is estimated from birth longitude (local mean time).
 * For India (lon ≈ 77°) the estimate is within ~15 min of IST.
 */
function birthJD(y: number, m: number, d: number, h: number, min: number, lon: number): number {
  const utcOffset = lon / 15.0;
  return toJD(y, m, d) + (h + min / 60) / 24 - 0.5 - utcOffset / 24;
}

// ─── Ayanamsha (Lahiri) ────────────────────────────────────────────────
function ayanamsha(jd: number): number {
  return 23.856 + 0.0137 * (jd - 2451545.0) / 365.25;
}
function sid(trop: number, jd: number): number { return norm(trop - ayanamsha(jd)); }

// ─── Sun (Meeus Ch. 27) ────────────────────────────────────────────────
function sunTropLon(jd: number): number {
  const T  = (jd - 2451545.0) / 36525;
  const L0 = norm(280.46646 + 36000.76983 * T);
  const M  = norm(357.52911 + 35999.05029 * T) * RAD;
  const C  = (1.914602 - 0.004817 * T - 0.000014 * T * T) * Math.sin(M)
           + (0.019993 - 0.000101 * T) * Math.sin(2 * M)
           + 0.000289 * Math.sin(3 * M);
  return norm(L0 + C);
}

// ─── Moon (40-term Meeus Ch. 47) ──────────────────────────────────────
function moonTropLon(jd: number): number {
  const T  = (jd - 2451545.0) / 36525;
  const T2 = T * T, T3 = T2 * T, T4 = T3 * T;
  const Lp = norm(218.3164477 + 481267.88123421 * T - 0.0015786 * T2 + T3 / 538841   - T4 / 65194000);
  const D  = norm(297.8501921 + 445267.1114034  * T - 0.0018819 * T2 + T3 / 545868   - T4 / 113065000);
  const M  = norm(357.5291092 + 35999.0502909   * T - 0.0001536 * T2);
  const Mp = norm(134.9633964 + 477198.8675055  * T + 0.0087414 * T2 + T3 / 69699    - T4 / 14712000);
  const F  = norm(93.2720950  + 483202.0175233  * T - 0.0036539 * T2 - T3 / 3526000  + T4 / 863310000);
  const E  = 1 - 0.002516 * T - 0.0000074 * T2;
  const E2 = E * E;
  const [Dr, Mr, Mpr, Fr] = [D, M, Mp, F].map(x => x * RAD);
  let s = 0;
  s += 6288774 * Math.sin(Mpr);            s += 1274027 * Math.sin(2*Dr - Mpr);
  s += 658314  * Math.sin(2*Dr);           s += 213618  * Math.sin(2*Mpr);
  s += -185116 * E  * Math.sin(Mr);        s += -114332 * Math.sin(2*Fr);
  s += 58793   * Math.sin(2*Dr - 2*Mpr);   s += 57066   * E  * Math.sin(2*Dr - Mr - Mpr);
  s += 53322   * Math.sin(2*Dr + Mpr);     s += 45758   * E  * Math.sin(2*Dr - Mr);
  s += -40923  * E  * Math.sin(Mr - Mpr);  s += -34720  * Math.sin(Dr);
  s += -30383  * E  * Math.sin(Mr + Mpr);  s += 15327   * Math.sin(2*Dr - 2*Fr);
  s += -12528  * Math.sin(Mpr + 2*Fr);     s += 10980   * Math.sin(Mpr - 2*Fr);
  s += 10675   * Math.sin(4*Dr - Mpr);     s += 10034   * Math.sin(3*Mpr);
  s += 8548    * Math.sin(4*Dr - 2*Mpr);   s += -7888   * E  * Math.sin(2*Dr + Mr - Mpr);
  s += -6766   * E  * Math.sin(2*Dr + Mr); s += -5163   * Math.sin(Dr - Mpr);
  s += 4987    * E  * Math.sin(Dr + Mr);   s += 4036    * E  * Math.sin(2*Dr - Mr + Mpr);
  s += 3994    * Math.sin(2*Dr + 2*Mpr);   s += 3861    * Math.sin(4*Dr);
  s += 3665    * Math.sin(2*Dr - 3*Mpr);   s += -2689   * E  * Math.sin(Mr - 2*Mpr);
  s += -2602   * Math.sin(2*Dr - Mpr + 2*Fr);
  s += 2390    * E  * Math.sin(2*Dr - Mr - 2*Mpr);
  s += -2348   * Math.sin(Dr + Mpr);       s += 2236    * E2 * Math.sin(2*Dr - 2*Mr);
  s += -2120   * E  * Math.sin(Mr + 2*Mpr); s += -2069  * E2 * Math.sin(2*Mr);
  s += 2048    * E2 * Math.sin(2*Dr - 2*Mr - Mpr);
  s += -1773   * Math.sin(2*Dr + Mpr - 2*Fr);
  s += -1595   * Math.sin(2*Dr + 2*Fr);
  s += 1215    * E  * Math.sin(4*Dr - Mr - Mpr);
  s += -1110   * Math.sin(2*Mpr + 2*Fr);   s += -892    * Math.sin(Dr - 3*Mpr);
  const A1r = (119.75 + 131.849 * T) * RAD;
  const A2r = (53.09 + 479264.290 * T) * RAD;
  s += 3958 * Math.sin(A1r) + 1962 * Math.sin(Lp * RAD - Fr) + 318 * Math.sin(A2r);
  return norm(Lp + s / 1000000);
}

// ─── Kepler solver & true anomaly ─────────────────────────────────────
function solveKepler(M: number, e: number): number {
  let E = M;
  for (let i = 0; i < 50; i++) {
    const dE = (M - E + e * Math.sin(E)) / (1 - e * Math.cos(E));
    E += dE;
    if (Math.abs(dE) < 1e-10) break;
  }
  return E;
}
function trueAnomaly(E: number, e: number): number {
  return 2 * Math.atan2(Math.sqrt(1 + e) * Math.sin(E / 2), Math.sqrt(1 - e) * Math.cos(E / 2));
}

// ─── Orbital elements (Meeus Table 31.a, J2000.0 epoch) ───────────────
type Planet6 = 'Mercury' | 'Venus' | 'Earth' | 'Mars' | 'Jupiter' | 'Saturn';
interface OrbEl { L: number; a: number; e: number; i: number; Om: number; pi: number; }

function orbitalElements(planet: Planet6, T: number): OrbEl {
  const n = norm;
  switch (planet) {
    case 'Mercury': return { L: n(252.250906+149472.6746358*T), a:0.387098310, e:0.20563175+0.000020407*T,   i:7.004986-0.0059516*T,  Om:n(48.330893 -0.1254229*T), pi:n(77.456119 +0.1588643*T) };
    case 'Venus':   return { L: n(181.979801+58517.8156760*T),  a:0.723329820, e:0.00677188-0.000047766*T,   i:3.394662-0.0008568*T,  Om:n(76.679920 -0.2780080*T), pi:n(131.563707+0.0048646*T) };
    case 'Earth':   return { L: n(100.466449+35999.3728519*T),  a:1.000001018, e:0.01670862-0.000042037*T,   i:0.0,                   Om:0.0,                        pi:n(102.937348+0.3225557*T) };
    case 'Mars':    return { L: n(355.433275+19140.2993313*T),  a:1.523679342, e:0.09340062+0.000090483*T,   i:1.849726-0.0081477*T,  Om:n(49.558093 -0.2950250*T), pi:n(336.060234+0.4439016*T) };
    case 'Jupiter': return { L: n(34.351484 +3034.9056746*T),   a:5.202603191+0.0000001913*T, e:0.04849485+0.000163244*T, i:1.303270-0.0019877*T, Om:n(100.464441+0.1766828*T), pi:n(14.331309+0.2155525*T) };
    case 'Saturn':  return { L: n(50.077444 +1222.1137943*T),   a:9.554909596-0.0000021389*T, e:0.05550825-0.000346641*T, i:2.488878+0.0025514*T, Om:n(113.665524-0.2566649*T), pi:n(93.056787+0.5665496*T) };
  }
}

function helioXYZ(el: OrbEl): { x: number; y: number; z: number } {
  const M   = norm(el.L - el.pi) * RAD;
  const om  = (el.pi - el.Om) * RAD;
  const Omr = el.Om * RAD, ir = el.i * RAD;
  const E   = solveKepler(M, el.e);
  const v   = trueAnomaly(E, el.e);
  const r   = el.a * (1 - el.e * Math.cos(E));
  const cO  = Math.cos(Omr), sO = Math.sin(Omr);
  const cv  = Math.cos(om + v), sv = Math.sin(om + v), ci = Math.cos(ir);
  return {
    x: r * (cO * cv - sO * sv * ci),
    y: r * (sO * cv + cO * sv * ci),
    z: r * sv * Math.sin(ir),
  };
}

type Planet5 = 'Mercury' | 'Venus' | 'Mars' | 'Jupiter' | 'Saturn';

function geocentricTropLon(planet: Planet5, jd: number): number {
  const T = (jd - 2451545.0) / 36525;
  const p = helioXYZ(orbitalElements(planet, T));
  const e = helioXYZ(orbitalElements('Earth', T));
  return norm(Math.atan2(p.y - e.y, p.x - e.x) * DEG);
}

// ─── Retrograde detection ─────────────────────────────────────────────
function isRetrograde(planet: Planet5, jd: number): boolean {
  const l1 = geocentricTropLon(planet, jd - 0.5);
  const l2 = geocentricTropLon(planet, jd + 0.5);
  let d = l2 - l1;
  if (d > 180) d -= 360;
  if (d < -180) d += 360;
  return d < 0;
}

// ─── Rahu — mean lunar ascending node (Meeus Ch. 22) ──────────────────
function rahuTropLon(jd: number): number {
  const T = (jd - 2451545.0) / 36525;
  return norm(125.0445479 - 1934.1362608 * T + 0.0020762 * T * T
    + T * T * T / 467410 - T * T * T * T / 60616000);
}

// ─── Lagna (Ascendant) ────────────────────────────────────────────────
/**
 * Tropical ecliptic longitude of the Ascendant, computed from:
 *   - GMST at birth JD
 *   - Local Sidereal Time = GMST + birth longitude
 *   - Obliquity of ecliptic
 *   - Standard ascendant formula (Meeus Ch. 14)
 */
function lagnaLon(jd: number, lat: number, lon: number): number {
  const T    = (jd - 2451545.0) / 36525;
  const gmst = norm(280.46061837 + 360.98564736629 * (jd - 2451545.0));
  const lst  = norm(gmst + lon);
  const eps  = (23.439291111 - 0.013004167 * T - 0.00000163889 * T * T) * RAD;
  const RAMC = lst * RAD;
  const latr = lat * RAD;
  return norm(Math.atan2(-Math.cos(RAMC),
    Math.sin(eps) * Math.tan(latr) + Math.cos(eps) * Math.sin(RAMC)) * DEG);
}

// ─── Nakshatra lookup tables (traditional assignments) ────────────────
// 27 nakshatras in ecliptic order (0° Mesha to 360°), 13°20' each.
const RASHIS = [
  'Mesha','Vrishabha','Mithuna','Karka','Simha','Kanya',
  'Tula','Vrischika','Dhanu','Makara','Kumbha','Meena',
];
const NAKS = [
  'Ashwini','Bharani','Krittika','Rohini','Mrigashirsha','Ardra',
  'Punarvasu','Pushya','Ashlesha','Magha','Purva Phalguni','Uttara Phalguni',
  'Hasta','Chitra','Swati','Vishakha','Anuradha','Jyeshtha',
  'Mula','Purva Ashadha','Uttara Ashadha','Shravana','Dhanishta','Shatabhisha',
  'Purva Bhadrapada','Uttara Bhadrapada','Revati',
];
// Nadi: repeating Aadi–Madhya–Antya pattern across all 27 nakshatras
const NADIS  = ['Aadi','Madhya','Antya','Aadi','Madhya','Antya','Aadi','Madhya','Antya','Aadi','Madhya','Antya','Aadi','Madhya','Antya','Aadi','Madhya','Antya','Aadi','Madhya','Antya','Aadi','Madhya','Antya','Aadi','Madhya','Antya'];
const GANAS  = ['Deva','Manushya','Rakshasa','Manushya','Deva','Manushya','Deva','Deva','Rakshasa','Rakshasa','Manushya','Manushya','Deva','Rakshasa','Deva','Rakshasa','Deva','Rakshasa','Rakshasa','Manushya','Manushya','Deva','Rakshasa','Rakshasa','Manushya','Manushya','Deva'];
const VARNAS = ['Vaishya','Shudra','Brahmin','Shudra','Vaishya','Shudra','Vaishya','Kshatriya','Vaishya','Shudra','Brahmin','Kshatriya','Vaishya','Brahmin','Shudra','Kshatriya','Shudra','Vaishya','Shudra','Brahmin','Kshatriya','Vaishya','Shudra','Shudra','Brahmin','Kshatriya','Shudra'];
const YONIS  = ['Horse','Elephant','Goat','Serpent','Serpent','Dog','Cat','Goat','Cat','Rat','Rat','Cow','Buffalo','Tiger','Buffalo','Tiger','Deer','Deer','Dog','Monkey','Mongoose','Monkey','Lion','Horse','Lion','Cow','Elephant'];

function nakPada(sidLon: number): { nak: number; pada: number } {
  const lon  = norm(sidLon);
  const nak  = Math.min(Math.floor(lon / (360 / 27)), 26);
  const pada = Math.min(Math.floor((lon % (360 / 27)) / (360 / 108)) + 1, 4);
  return { nak, pada };
}

// ─── Build a GrahaPosition from sidereal longitude ────────────────────
function makeGraha(name: string, sidLon: number, retro: boolean): GrahaPosition {
  const lon = norm(sidLon);
  const { nak, pada } = nakPada(lon);
  return {
    name,
    rashi:     RASHIS[Math.floor(lon / 30) % 12],
    rashiNum:  Math.floor(lon / 30) % 12 + 1,
    degrees:   lon,
    nakshatra: NAKS[nak],
    pada,
    isRetro:   retro,
  };
}

// ─── Main Export ──────────────────────────────────────────────────────
export function computeTekni(params: TekniParams): TekniData {
  const jd = birthJD(
    params.year, params.month, params.day,
    params.hour, params.minute, params.longitude,
  );

  const userGrahaMap: Record<string, number> = params.userGrahaRashis
    ? JSON.parse(params.userGrahaRashis) : {};

  /**
   * Resolve final sidereal longitude for a graha:
   *  - If user provided a manual rashi override, use the midpoint of that rashi.
   *  - Otherwise use the astronomically computed sidereal longitude.
   */
  function resolveSidLon(name: string, computed: number): number {
    const override = userGrahaMap[name];
    return override != null ? (override - 1) * 30 + 15 : computed;
  }

  // Compute all sidereal longitudes
  const sunSid  = sid(sunTropLon(jd), jd);
  const moonSid = sid(moonTropLon(jd), jd);
  const marsSid = sid(geocentricTropLon('Mars',    jd), jd);
  const mercSid = sid(geocentricTropLon('Mercury', jd), jd);
  const jupSid  = sid(geocentricTropLon('Jupiter', jd), jd);
  const venSid  = sid(geocentricTropLon('Venus',   jd), jd);
  const satSid  = sid(geocentricTropLon('Saturn',  jd), jd);
  const rahuSid = sid(rahuTropLon(jd), jd);
  const ketuSid = norm(rahuSid + 180);

  // Lagna — user override or computed
  const lagnaIdx = params.userLagnaRashi != null
    ? params.userLagnaRashi - 1
    : Math.floor(sid(lagnaLon(jd, params.latitude, params.longitude), jd) / 30) % 12;

  // Moon — userMoonRashi takes precedence, then graha map, then computed
  const moonSidFinal =
    params.userMoonRashi != null    ? (params.userMoonRashi - 1) * 30 + 15 :
    userGrahaMap['Moon'] != null    ? (userGrahaMap['Moon'] - 1)  * 30 + 15 :
    moonSid;

  const grahas: GrahaPosition[] = [
    makeGraha('Sun',      resolveSidLon('Sun',     sunSid),  false),
    makeGraha('Moon',     moonSidFinal,                       false),
    makeGraha('Mars',     resolveSidLon('Mars',    marsSid), isRetrograde('Mars',    jd)),
    makeGraha('Mercury',  resolveSidLon('Mercury', mercSid), isRetrograde('Mercury', jd)),
    makeGraha('Jupiter',  resolveSidLon('Jupiter', jupSid),  isRetrograde('Jupiter', jd)),
    makeGraha('Venus',    resolveSidLon('Venus',   venSid),  isRetrograde('Venus',   jd)),
    makeGraha('Saturn',   resolveSidLon('Saturn',  satSid),  isRetrograde('Saturn',  jd)),
    makeGraha('Rahu',     userGrahaMap['Rahu'] != null ? (userGrahaMap['Rahu'] - 1) * 30 + 15 : rahuSid, false),
    makeGraha('Ketu',     userGrahaMap['Ketu'] != null ? (userGrahaMap['Ketu'] - 1) * 30 + 15 : ketuSid, false),
  ];

  const { nak: nakIdx, pada } = nakPada(moonSidFinal);

  return {
    birth: {
      name: params.name, fatherName: params.fatherName, motherName: params.motherName,
      gotra: params.gotra, ishtdevi: params.ishtdevi, placeName: params.placeName,
      year: params.year, month: params.month, day: params.day,
      hour: params.hour, minute: params.minute,
      latitude: params.latitude, longitude: params.longitude,
      gender: params.gender,
    },
    lagnaRashi:    RASHIS[lagnaIdx],
    lagnaRashiNum: lagnaIdx + 1,
    moonRashi:     grahas[1].rashi,
    nakshatra:     NAKS[nakIdx],
    pada,
    nadi:          NADIS[nakIdx],
    gana:          GANAS[nakIdx],
    varna:         VARNAS[nakIdx],
    yoni:          YONIS[nakIdx],
    grahas,
    saptarshiYear: params.year + 3076,
  };
}
