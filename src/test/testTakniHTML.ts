/**
 * Test script — Generate sample Takni HTML.
 * Run: npx tsx src/test/testTakniHTML.ts
 */

import { generateTakniHTML, type TekniData } from '../services/TakniHTMLGenerator';
import { encodeTakniCode, buildTakniQRUrl, type TakniBirthData } from '../services/TakniEncoder';
import QRCode from 'qrcode';
import * as fs from 'fs';

const sampleBirth: TakniBirthData = {
  name: 'Rakesh Ganjoo',
  fatherName: 'Makhan Lal Ganjoo',
  motherName: 'Mohini Ganjoo',
  gotra: 'Bharadwaj',
  ishtdevi: 'Ragnya Devi',
  placeName: 'Srinagar, J&K',
  year: 1975,
  month: 1,
  day: 15,
  hour: 5,
  minute: 30,
  latitude: 34.084,
  longitude: 74.797,
  gender: 'male',
};

const sampleTekni: TekniData = {
  birth: sampleBirth,
  lagnaRashi: 'Dhanu',
  lagnaRashiNum: 9,
  moonRashi: 'Karka',
  nakshatra: 'Pushya',
  pada: 2,
  nadi: 'Madhya',
  gana: 'Deva',
  varna: 'Brahmin',
  yoni: 'Goat',
  saptarshiYear: 5051,
  grahas: [
    { name: 'Sun',     rashi: 'Dhanu',      rashiNum: 9,  degrees: 270.5,   nakshatra: 'Purva Ashadha', pada: 3 },
    { name: 'Moon',    rashi: 'Karka',      rashiNum: 4,  degrees: 107.2,   nakshatra: 'Pushya',        pada: 2 },
    { name: 'Mars',    rashi: 'Vrischika',  rashiNum: 8,  degrees: 245.8,   nakshatra: 'Jyeshtha',      pada: 1 },
    { name: 'Mercury', rashi: 'Dhanu',      rashiNum: 9,  degrees: 265.1,   nakshatra: 'Purva Ashadha', pada: 1 },
    { name: 'Jupiter', rashi: 'Meena',      rashiNum: 12, degrees: 348.3,   nakshatra: 'Revati',        pada: 2, isRetro: true },
    { name: 'Venus',   rashi: 'Makara',     rashiNum: 10, degrees: 292.7,   nakshatra: 'Shravana',      pada: 4 },
    { name: 'Saturn',  rashi: 'Karka',      rashiNum: 4,  degrees: 100.4,   nakshatra: 'Pushya',        pada: 1, isRetro: true },
    { name: 'Rahu',    rashi: 'Vrischika',  rashiNum: 8,  degrees: 238.9,   nakshatra: 'Anuradha',      pada: 4 },
    { name: 'Ketu',    rashi: 'Vrishabha',  rashiNum: 2,  degrees: 58.9,    nakshatra: 'Mrigashirsha',  pada: 1 },
  ],
};

async function main() {
  // Generate QR code data URL
  const takniCode = encodeTakniCode(sampleBirth);
  const qrUrl = buildTakniQRUrl(takniCode, sampleBirth.name);
  const qrDataUrl = await QRCode.toDataURL(qrUrl, {
    width: 200, margin: 1,
    color: { dark: '#3D2B1F', light: '#F5E6C800' },
    errorCorrectionLevel: 'M',
  });

  const html = generateTakniHTML(sampleTekni, qrDataUrl);
  const outPath = '/tmp/sample_takni.html';
  fs.writeFileSync(outPath, html);
  console.log(`HTML written to: ${outPath} (${html.length} chars)`);
  console.log('Open with: open /tmp/sample_takni.html');
}

main().catch(console.error);
