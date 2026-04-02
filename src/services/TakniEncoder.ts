/**
 * TakniEncoder — Encode/Decode birth parameters into a compact TakniCode.
 *
 * A TakniCode is a 22-character string (e.g. "JT-A7F3K-NP82M-Q4D6R-BW")
 * that fully encodes the 5 birth parameters needed to regenerate a Tekni:
 *   - Date of birth (year 1900–3947, month, day)
 *   - Time of birth (hour, minute)
 *   - Place of birth (lat/lon to 0.001° precision)
 *   - Gender (male/female)
 *
 * Total: 83 bits → 17 Base32 characters → formatted as JT-XXXXX-XXXXX-XXXXX-XX
 */

export interface TakniBirthData {
  name: string;
  fatherName: string;
  motherName: string;
  gotra: string;
  ishtdevi: string;
  placeName: string;     // e.g. "Srinagar, J&K"
  year: number;
  month: number;   // 1–12
  day: number;      // 1–31
  hour: number;     // 0–23
  minute: number;   // 0–59
  latitude: number; // -90 to +90
  longitude: number; // -180 to +180
  gender: 'male' | 'female';
}

// Base32 alphabet (RFC 4648 without padding, no I/L/O/U to avoid confusion)
const B32 = 'ABCDEFGHJKMNPQRSTVWXYZ23456789';

function crc16(str: string): number {
  const bytes = new TextEncoder().encode(str);
  let crc = 0xFFFF;
  for (const byte of bytes) {
    crc ^= byte << 8;
    for (let j = 0; j < 8; j++) {
      crc = (crc & 0x8000) ? ((crc << 1) ^ 0x1021) : (crc << 1);
      crc &= 0xFFFF;
    }
  }
  return crc;
}

/**
 * Encode birth data into ~83-bit buffer, then Base32-encode to TakniCode.
 *
 * Bit layout (MSB first):
 *   [11] year-1900  [4] month-1  [5] day-1
 *   [5] hour  [6] minute
 *   [17] lat = (lat+90)*1000 unsigned
 *   [18] lon = (lon+180)*1000 unsigned
 *   [1] gender (0=male, 1=female)
 *   [16] CRC-16 of name (uppercase, trimmed)
 *   Total = 83 bits  → padded to 85 bits (17 × 5)
 */
export function encodeTakniCode(data: TakniBirthData): string {
  const yearBits  = (data.year - 1900) & 0x7FF;       // 11 bits
  const monthBits = (data.month - 1) & 0xF;            // 4 bits
  const dayBits   = (data.day - 1) & 0x1F;             // 5 bits
  const hourBits  = data.hour & 0x1F;                   // 5 bits
  const minBits   = data.minute & 0x3F;                 // 6 bits

  const latInt = Math.round((data.latitude + 90) * 1000) & 0x1FFFF;    // 17 bits
  const lonInt = Math.round((data.longitude + 180) * 1000) & 0x3FFFF;  // 18 bits

  const genderBit = data.gender === 'female' ? 1 : 0;
  const nameCrc = crc16(data.name.trim().toUpperCase());

  // Pack into a bit array (83 bits)
  const bits: number[] = [];

  function pushBits(value: number, count: number) {
    for (let i = count - 1; i >= 0; i--) {
      bits.push((value >> i) & 1);
    }
  }

  pushBits(yearBits, 11);
  pushBits(monthBits, 4);
  pushBits(dayBits, 5);
  pushBits(hourBits, 5);
  pushBits(minBits, 6);
  pushBits(latInt, 17);
  pushBits(lonInt, 18);
  pushBits(genderBit, 1);
  pushBits(nameCrc, 16);

  // Pad to 85 bits (17 × 5) for Base32
  while (bits.length < 85) bits.push(0);

  // Convert to Base32
  let code = '';
  for (let i = 0; i < 85; i += 5) {
    const val = (bits[i] << 4) | (bits[i+1] << 3) | (bits[i+2] << 2) | (bits[i+3] << 1) | bits[i+4];
    code += B32[val];
  }

  // Format: JT-XXXXX-XXXXX-XXXXX-XX
  return `JT-${code.slice(0,5)}-${code.slice(5,10)}-${code.slice(10,15)}-${code.slice(15,17)}`;
}

/**
 * Decode a TakniCode back into birth parameters.
 * Name is not recoverable (only CRC for verification).
 */
export function decodeTakniCode(code: string): Omit<TakniBirthData, 'name' | 'fatherName' | 'motherName' | 'gotra' | 'ishtdevi' | 'placeName'> & { nameCrc: number } {
  // Strip prefix and dashes
  const raw = code.replace(/^JT-/, '').replace(/-/g, '');

  if (raw.length !== 17) {
    throw new Error(`Invalid TakniCode length: expected 17 chars, got ${raw.length}`);
  }

  // Base32 → bits
  const bits: number[] = [];
  for (const ch of raw) {
    const idx = B32.indexOf(ch);
    if (idx < 0) throw new Error(`Invalid Base32 character: ${ch}`);
    for (let b = 4; b >= 0; b--) {
      bits.push((idx >> b) & 1);
    }
  }

  function readBits(start: number, count: number): number {
    let val = 0;
    for (let i = 0; i < count; i++) {
      val = (val << 1) | bits[start + i];
    }
    return val;
  }

  let offset = 0;
  const year    = readBits(offset, 11) + 1900; offset += 11;
  const month   = readBits(offset, 4) + 1;     offset += 4;
  const day     = readBits(offset, 5) + 1;     offset += 5;
  const hour    = readBits(offset, 5);          offset += 5;
  const minute  = readBits(offset, 6);          offset += 6;
  const latInt  = readBits(offset, 17);         offset += 17;
  const lonInt  = readBits(offset, 18);         offset += 18;
  const gender  = readBits(offset, 1) ? 'female' as const : 'male' as const; offset += 1;
  const nameCrc = readBits(offset, 16);

  return {
    year,
    month,
    day,
    hour,
    minute,
    latitude: latInt / 1000 - 90,
    longitude: lonInt / 1000 - 180,
    gender,
    nameCrc,
  };
}

/**
 * Build the deep-link URL for embedding in QR code.
 */
export function buildTakniQRUrl(code: string, name: string): string {
  return `https://www.janthari.com/takni/${code}/${encodeURIComponent(name.trim())}`;
}

/**
 * Verify a name against the CRC stored in a decoded TakniCode.
 */
export function verifyTakniName(name: string, expectedCrc: number): boolean {
  return crc16(name.trim().toUpperCase()) === expectedCrc;
}
