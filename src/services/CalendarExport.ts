/**
 * Calendar export utilities — CSV (Google Calendar format) and Print.
 */
import { getMonthCalendar, LUNAR_MONTHS, TITHI_NAMES, type CalendarDay } from './HinduCalendar';
import { KP_FESTIVALS, getMonthlyObservances, getObservanceTags, type KPFestival, type ObservanceTag } from '../data/kpFestivals';
import { Platform } from 'react-native';

const MONTH_NAMES = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];

function findFestivals(d: CalendarDay): KPFestival[] {
  return KP_FESTIVALS.filter(
    (f) => (f.lunarMonth === d.lunarMonth || f.lunarMonthAlt === d.lunarMonth) && f.paksha === d.paksha && f.tithi === d.tithiNum,
  );
}

function pad2(n: number): string { return n < 10 ? '0' + n : '' + n; }

function formatDate(d: Date): string {
  return `${pad2(d.getMonth() + 1)}/${pad2(d.getDate())}/${d.getFullYear()}`;
}

// ── CSV Export (Google Calendar format) ─────────────────────────────────

function buildCSVRows(startYear: number, startMonth: number, months: number): string[] {
  const rows: string[] = [];
  rows.push('Subject,Start Date,All Day Event,Description');
  let y = startYear, m = startMonth;

  for (let i = 0; i < months; i++) {
    const days = getMonthCalendar(y, m);
    for (const d of days) {
      const festivals = findFestivals(d);
      const observances = getMonthlyObservances(d.tithiNum, d.paksha);
      const dateStr = formatDate(d.date);
      const lunarInfo = `${d.lunarMonth} ${d.paksha === 'shukla' ? 'Shukla' : 'Krishna'} ${d.tithiName}`;

      for (const f of festivals) {
        const desc = escapeCSV(`${lunarInfo}. ${f.description}`);
        rows.push(`${escapeCSV(f.name)},${dateStr},True,${desc}`);
      }
      for (const o of observances) {
        const desc = escapeCSV(`${lunarInfo}. Monthly observance.`);
        rows.push(`${escapeCSV(o)},${dateStr},True,${desc}`);
      }
    }
    m++;
    if (m > 12) { m = 1; y++; }
  }
  return rows;
}

function escapeCSV(s: string): string {
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return '"' + s.replace(/"/g, '""') + '"';
  }
  return s;
}

/**
 * Export a 12-month calendar as CSV and trigger download.
 */
export function exportCalendarCSV(startYear: number, startMonth: number): void {
  if (Platform.OS !== 'web') return;
  const rows = buildCSVRows(startYear, startMonth, 12);
  const csv = rows.join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `KP_Calendar_${startYear}_${pad2(startMonth)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ── Print ───────────────────────────────────────────────────────────────

const WEEKDAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

/** Short paksha label */
function pk(paksha: 'shukla' | 'krishna'): string {
  return paksha === 'shukla' ? 'Shukla' : 'Krishna';
}

/** Full tithi label without the (N) suffix from TITHI_NAMES */
function tithiLabel(tithiNum: number): string {
  const raw = TITHI_NAMES[Math.min(tithiNum - 1, 14)];
  return raw.replace(/\s*\(\d+\)$/, '');
}

interface DayPrintInfo {
  d: CalendarDay;
  festivals: KPFestival[];
  tags: ObservanceTag[];
}

function buildMonthHTML(year: number, month: number): string {
  const days = getMonthCalendar(year, month);
  const firstDow = days[0].date.getDay();

  // Pre-compute all day info
  const infos: DayPrintInfo[] = days.map(d => ({
    d,
    festivals: findFestivals(d),
    tags: getObservanceTags(d.tithiNum, d.paksha, d.lunarMonth),
  }));

  // Collect notable dates for the summary below the grid
  const notables: string[] = [];
  for (const info of infos) {
    for (const f of info.festivals) {
      notables.push(`<b>${info.d.day}</b> — <span class="notable-fest">${f.name}</span> · ${info.d.lunarMonth} ${pk(info.d.paksha)} ${tithiLabel(info.d.tithiNum)} (${info.d.tithiNum})`);
    }
    for (const t of info.tags) {
      // Only list in summary if no matching festival already covers it
      const covered = info.festivals.some(f => f.tithi === info.d.tithiNum && f.paksha === info.d.paksha);
      if (!covered) {
        notables.push(`<b>${info.d.day}</b> — <span class="notable-${t.cls}">${t.label}</span> · ${t.detail}`);
      }
    }
  }

  let html = `<div class="month-block">`;
  html += `<h2>${MONTH_NAMES[month - 1]} ${year}</h2>`;
  html += `<table><thead><tr>${WEEKDAYS.map(w => `<th>${w}</th>`).join('')}</tr></thead><tbody><tr>`;

  // Leading empty cells
  for (let i = 0; i < firstDow; i++) html += '<td class="empty"></td>';

  let dow = firstDow;
  for (const info of infos) {
    const { d, festivals, tags } = info;

    // Determine cell CSS class based on priority: major > ashtami > ekadashi > purnima > amavasya > chaturthi > fest
    let cellClass = '';
    if (festivals.some(f => f.category === 'major')) cellClass = 'major';
    else if (festivals.length > 0) cellClass = 'fest';
    else if (tags.length > 0) cellClass = tags[0].cls;

    html += `<td class="${cellClass}">`;

    // Day number
    html += `<div class="daynum">${d.day}</div>`;

    // Full lunar line: "Chaitra • Krishna • Chaturdashi (14)"
    const tName = tithiLabel(d.tithiNum);
    // For Purnima/Amavasya show the actual name
    const tDisplay = d.tithiNum === 15
      ? (d.paksha === 'shukla' ? 'Purnima' : 'Amavasya')
      : tName;
    html += `<div class="lunar">${d.lunarMonth} · ${pk(d.paksha)} · ${tDisplay} (${d.tithiNum})</div>`;

    // Observance tags (icons)
    if (tags.length > 0) {
      html += `<div class="tags">${tags.map(t => `<span class="tag tag-${t.cls}">${t.label}</span>`).join(' ')}</div>`;
    }

    // Festival names
    if (festivals.length > 0) {
      html += `<div class="festname">${festivals.map(f => f.name.split('(')[0].trim()).join(', ')}</div>`;
    }

    html += '</td>';
    dow++;
    if (dow === 7 && d.day < days.length) { html += '</tr><tr>'; dow = 0; }
  }

  // Trailing empty cells
  if (dow > 0) { for (let i = dow; i < 7; i++) html += '<td class="empty"></td>'; }
  html += '</tr></tbody></table>';

  // Notable dates summary below the grid
  if (notables.length > 0) {
    html += `<div class="notable-section">`;
    html += `<div class="notable-title">📋 Important Dates — ${MONTH_NAMES[month - 1]} ${year}</div>`;
    html += `<div class="notable-list">${notables.map(n => `<div class="notable-item">${n}</div>`).join('')}</div>`;
    html += `</div>`;
  }

  html += '</div>';
  return html;
}

const PRINT_CSS = `
  @page { margin: 0; size: auto; }
  @media print {
    @page { margin: 0; }
    html, body { -webkit-print-color-adjust: exact; print-color-adjust: exact; margin: 0; }
    body { padding: 12mm 10mm !important; }
  }
  @media print {
    .month-block { page-break-inside: avoid; }
    .notable-section { page-break-inside: avoid; }
  }
  * { box-sizing: border-box; }
  body { font-family: -apple-system, 'Segoe UI', sans-serif; color: #2D2D3A; padding: 12px; }
  h1 { text-align: center; font-size: 22px; margin-bottom: 2px; color: #2D2D3A; }
  .subtitle { text-align: center; color: #888; font-size: 12px; margin-bottom: 4px; }

  /* Legend */
  .legend { display: flex; flex-wrap: wrap; gap: 12px; justify-content: center; margin: 10px 0 16px; padding: 10px 16px; background: #F8F8FA; border-radius: 8px; border: 1px solid #E0E0E0; }
  .legend-item { display: flex; align-items: center; gap: 5px; font-size: 11px; }
  .legend-swatch { width: 14px; height: 14px; border-radius: 3px; border: 1px solid rgba(0,0,0,0.08); display: inline-block; }
  .legend-key { font-weight: 600; color: #555; }

  /* Month block */
  h2 { font-size: 17px; margin: 20px 0 6px; color: #6C5CE7; border-bottom: 2px solid #6C5CE7; padding-bottom: 4px; }
  table { width: 100%; border-collapse: collapse; font-size: 10px; table-layout: fixed; }
  th { background: #6C5CE7; color: #fff; padding: 5px 2px; text-align: center; font-size: 11px; font-weight: 600; }
  td { border: 1px solid #D8D8D8; vertical-align: top; padding: 4px; height: 72px; width: 14.28%; }
  td.empty { background: #FAFAFA; }

  /* Day number */
  .daynum { font-weight: 700; font-size: 14px; color: #2D2D3A; line-height: 1; }

  /* Lunar info line */
  .lunar { font-size: 8.5px; color: #666; margin-top: 2px; line-height: 1.3; }

  /* Tags */
  .tags { margin-top: 2px; }
  .tag { font-size: 8px; font-weight: 600; display: inline-block; padding: 0px 3px; border-radius: 3px; }
  .tag-ashtami { background: #FFF3E0; color: #E65100; }
  .tag-ekadashi { background: #E8F5E9; color: #2E7D32; }
  .tag-purnima { background: #E3F2FD; color: #1565C0; }
  .tag-amavasya { background: #F3E5F5; color: #6A1B9A; }
  .tag-chaturthi { background: #FFF8E1; color: #F57F17; }

  /* Festival name */
  .festname { font-size: 8.5px; color: #6C5CE7; font-weight: 700; margin-top: 2px; line-height: 1.2; }

  /* Cell background colors */
  td.major    { background: #FFF0F0; border-left: 3px solid #FF6B6B; }
  td.fest     { background: #F0EDFF; border-left: 3px solid #6C5CE7; }
  td.ashtami  { background: #FFF8F0; border-left: 3px solid #E65100; }
  td.ekadashi { background: #F0FFF0; border-left: 3px solid #2E7D32; }
  td.purnima  { background: #F0F7FF; border-left: 3px solid #1565C0; }
  td.amavasya { background: #F8F0FF; border-left: 3px solid #6A1B9A; }
  td.chaturthi { background: #FFFDF0; border-left: 3px solid #F57F17; }

  /* Notable dates summary */
  .notable-section { margin: 8px 0 16px; padding: 10px 14px; background: #FAFAFA; border: 1px solid #E0E0E0; border-radius: 8px; }
  .notable-title { font-size: 12px; font-weight: 700; color: #2D2D3A; margin-bottom: 6px; }
  .notable-list { column-count: 2; column-gap: 20px; }
  .notable-item { font-size: 10px; color: #444; margin-bottom: 3px; break-inside: avoid; line-height: 1.4; }
  .notable-fest { color: #FF6B6B; font-weight: 600; }
  .notable-ashtami { color: #E65100; font-weight: 600; }
  .notable-ekadashi { color: #2E7D32; font-weight: 600; }
  .notable-purnima { color: #1565C0; font-weight: 600; }
  .notable-amavasya { color: #6A1B9A; font-weight: 600; }
  .notable-chaturthi { color: #F57F17; font-weight: 600; }

  /* Abbreviation key */
  .abbr-note { text-align: center; font-size: 10px; color: #999; margin-top: 2px; }
`;

function buildLegendHTML(): string {
  return `<div class="legend">
    <div class="legend-item"><div class="legend-swatch" style="background:#FFF0F0;border-left:3px solid #FF6B6B;"></div><span class="legend-key">Major Festival</span></div>
    <div class="legend-item"><div class="legend-swatch" style="background:#F0EDFF;border-left:3px solid #6C5CE7;"></div><span class="legend-key">Festival / Observance</span></div>
    <div class="legend-item"><div class="legend-swatch" style="background:#FFF8F0;border-left:3px solid #E65100;"></div><span class="legend-key">🔱 Ashtami</span></div>
    <div class="legend-item"><div class="legend-swatch" style="background:#F0FFF0;border-left:3px solid #2E7D32;"></div><span class="legend-key">🙏 Ekadashi (Fast)</span></div>
    <div class="legend-item"><div class="legend-swatch" style="background:#F0F7FF;border-left:3px solid #1565C0;"></div><span class="legend-key">🌕 Purnima (Full Moon)</span></div>
    <div class="legend-item"><div class="legend-swatch" style="background:#F8F0FF;border-left:3px solid #6A1B9A;"></div><span class="legend-key">🌑 Amavasya (New Moon)</span></div>
    <div class="legend-item"><div class="legend-swatch" style="background:#FFFDF0;border-left:3px solid #F57F17;"></div><span class="legend-key">🐘 Chaturthi (Ganesh)</span></div>
    <div class="legend-item"><span class="legend-key">S = Shukla Paksha (waxing)</span></div>
    <div class="legend-item"><span class="legend-key">K = Krishna Paksha (waning)</span></div>
  </div>
  <div class="abbr-note">Each cell reads: <b>Lunar Month · Paksha · Tithi Name (Number)</b> — e.g. "Chaitra · Krishna · Chaturdashi (14)"</div>`;
}

function buildPrintHTML(startYear: number, startMonth: number, months: number): string {
  let bodyHTML = '';
  let y = startYear, m = startMonth;
  for (let i = 0; i < months; i++) {
    bodyHTML += buildMonthHTML(y, m);
    m++;
    if (m > 12) { m = 1; y++; }
  }
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>KP Calendar ${startYear}</title>
<style>${PRINT_CSS}</style></head><body>
<h1>📅 KP Calendar — Kashmiri Pandit Purnimant Calendar</h1>
<p class="subtitle">${startYear} · PuzaPaath · Purnimant System (IST Sunrise)</p>
${buildLegendHTML()}
${bodyHTML}
</body></html>`;
}

/**
 * Open a print window for the calendar (1 month or full year).
 */
export function printCalendar(startYear: number, startMonth: number, months: number): void {
  if (Platform.OS !== 'web') return;
  const html = buildPrintHTML(startYear, startMonth, months);
  const win = window.open('', '_blank');
  if (!win) return;
  win.document.write(html);
  win.document.close();
  win.focus();
  win.print();
}
