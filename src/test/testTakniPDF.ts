/**
 * Test script — Generate a sample Takni PDF with test fixture data.
 * Run: npx ts-node --esm src/test/testTakniPDF.ts
 * Or:  node -e "require('./dist/test/testTakniPDF')"
 */

import { generateTakniPDF, type TekniData } from '../services/TakniPDFGenerator';
import { encodeTakniCode, decodeTakniCode, type TakniBirthData } from '../services/TakniEncoder';
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
  // Test encoder
  console.log('=== TakniCode Encoder Test ===');
  const code = encodeTakniCode(sampleBirth);
  console.log('Encoded:', code);

  const decoded = decodeTakniCode(code);
  console.log('Decoded:', decoded);
  console.log('Year match:', decoded.year === sampleBirth.year);
  console.log('Month match:', decoded.month === sampleBirth.month);
  console.log('Day match:', decoded.day === sampleBirth.day);
  console.log('Hour match:', decoded.hour === sampleBirth.hour);
  console.log('Minute match:', decoded.minute === sampleBirth.minute);
  console.log('Lat match:', Math.abs(decoded.latitude - sampleBirth.latitude) < 0.002);
  console.log('Lon match:', Math.abs(decoded.longitude - sampleBirth.longitude) < 0.002);
  console.log('Gender match:', decoded.gender === sampleBirth.gender);
  console.log('');

  // Test PDF generation
  console.log('=== Generating Sample Takni PDF ===');
  const pdfBytes = await generateTakniPDF(sampleTekni);
  const outPath = '/tmp/sample_takni.pdf';
  fs.writeFileSync(outPath, pdfBytes);
  console.log(`PDF written to: ${outPath} (${pdfBytes.length} bytes)`);
  console.log('Open with: open /tmp/sample_takni.pdf');
}

main().catch(console.error);
