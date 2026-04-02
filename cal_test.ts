import { gregorianToLunar, getMonthCalendar } from './src/services/HinduCalendar';
import { KP_FESTIVALS } from './src/data/kpFestivals';

// Validate: Jan 3, 1975 should be Paush (Poh) Krishna Shashthi (6)
console.log('=== Jan 3, 1975 Validation ===');
const r = gregorianToLunar('1975-01-03');
console.log('Result:', JSON.stringify(r));
console.log('Month=Paush?', r?.lunarMonth === 'Paush' ? '✓' : '✗ ' + r?.lunarMonth);

// Check festival matching for all of 2026
console.log('\n=== Festival Matching 2026 ===');
const found: string[] = [];
for (let m = 1; m <= 12; m++) {
  const days = getMonthCalendar(2026, m);
  for (const day of days) {
    for (const f of KP_FESTIVALS) {
      if (day.lunarMonth === f.lunarMonth && day.paksha === f.paksha && day.tithiNum === f.tithi) {
        const dateStr = `${day.date.getFullYear()}-${String(day.date.getMonth()+1).padStart(2,'0')}-${String(day.date.getDate()).padStart(2,'0')}`;
        found.push(`${dateStr}: ${f.name} (${day.lunarMonth} ${day.paksha} ${day.tithiNum})`);
      }
    }
  }
}
console.log(`Found ${found.length} festival matches:`);
found.forEach(f => console.log('  ' + f));

// Also check 2025 for Diwali/Herath
console.log('\n=== Key 2025 dates ===');
// Diwali 2025: Oct 20
const diwali = gregorianToLunar('2025-10-20');
console.log('Oct 20 2025 (Diwali):', JSON.stringify(diwali));
const diwali2 = gregorianToLunar('2025-10-21');
console.log('Oct 21 2025:', JSON.stringify(diwali2));
// Shivratri 2025: Feb 26
const shivratri = gregorianToLunar('2025-02-26');
console.log('Feb 26 2025 (Shivratri):', JSON.stringify(shivratri));
