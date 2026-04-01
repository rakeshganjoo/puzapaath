/**
 * TakniHTMLGenerator — Generates a traditional Takni (birth chart) as HTML.
 *
 * Same look & feel as the PDF version but rendered as HTML with CSS @media print
 * support. User clicks "Print / Save as PDF" to produce the PDF.
 *
 * Features:
 * - Transparent Ganesha image with flanking invocations
 * - Parchment background, maroon/gold decorative borders
 * - Bilingual English + Devanagari text throughout
 * - SVG North Indian diamond Kundali chart (left) with house legend (right)
 * - Graha positions table
 * - QR code + TakniCode footer
 */

import { encodeTakniCode, buildTakniQRUrl } from './TakniEncoder';
import { GANESHA_BASE64 } from '../assets/takni/ganeshaBase64';

// ── Types live in SSoT: src/types/tekni.ts ─────────────────────────────
import type { GrahaPosition, TekniData } from '../types/tekni';
export type { GrahaPosition, TekniData };

// ── Lookups ─────────────────────────────────────────────────────────────

const RASHI_LIST = ['Mesha','Vrishabha','Mithuna','Karka','Simha','Kanya','Tula','Vrischika','Dhanu','Makara','Kumbha','Meena'];
const RASHI_DEV: Record<string, string> = {
  Mesha: 'मेष', Vrishabha: 'वृषभ', Mithuna: 'मिथुन', Karka: 'कर्क',
  Simha: 'सिंह', Kanya: 'कन्या', Tula: 'तुला', Vrischika: 'वृश्चिक',
  Dhanu: 'धनु', Makara: 'मकर', Kumbha: 'कुम्भ', Meena: 'मीन',
};
const GRAHA_DEV: Record<string, string> = {
  Sun: 'सूर्य', Moon: 'चन्द्र', Mars: 'मंगल', Mercury: 'बुध',
  Jupiter: 'गुरु', Venus: 'शुक्र', Saturn: 'शनि', Rahu: 'राहु', Ketu: 'केतु',
};
const GRAHA_ABBR: Record<string, string> = {
  Sun: 'Su', Moon: 'Mo', Mars: 'Ma', Mercury: 'Me',
  Jupiter: 'Ju', Venus: 'Ve', Saturn: 'Sa', Rahu: 'Ra', Ketu: 'Ke',
};
// Standard Vedic/Western astrological symbols for each graha
const GRAHA_SYMBOL: Record<string, string> = {
  Sun: '☉', Moon: '☽', Mars: '♂', Mercury: '☿',
  Jupiter: '♃', Venus: '♀', Saturn: '♄', Rahu: '☊', Ketu: '☋',
};
const NADI_DEV: Record<string, string> = { Aadi: 'आदि', Madhya: 'मध्य', Antya: 'अन्त्य' };
const GANA_DEV: Record<string, string> = { Deva: 'देव', Manushya: 'मनुष्य', Rakshasa: 'राक्षस' };

// House significations (brief)
const HOUSE_SIG = [
  'Self, Personality, Health',
  'Wealth, Family, Speech',
  'Siblings, Courage, Communication',
  'Mother, Home, Happiness',
  'Children, Intelligence, Creativity',
  'Enemies, Debts, Health Issues',
  'Marriage, Partnerships, Business',
  'Longevity, Transformation, Obstacles',
  'Fortune, Dharma, Father',
  'Career, Fame, Authority',
  'Gains, Income, Elder Siblings',
  'Losses, Moksha, Foreign Lands',
];

// ── Helpers ─────────────────────────────────────────────────────────────

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function fmtDate(y: number, m: number, d: number): string {
  const mn = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  return `${mn[m - 1]} ${d}, ${y}`;
}

function fmtTime(h: number, m: number): string {
  const ap = h >= 12 ? 'PM' : 'AM';
  const hr = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${hr}:${String(m).padStart(2, '0')} ${ap}`;
}

function fmtDeg(deg: number): string {
  const d = deg % 30;
  const dd = Math.floor(d);
  const mm = Math.floor((d - dd) * 60);
  const ss = Math.floor(((d - dd) * 60 - mm) * 60);
  return `${dd}° ${String(mm).padStart(2, '0')}' ${String(ss).padStart(2, '0')}"`;
}

// ── SVG Kundali Chart ───────────────────────────────────────────────────

function buildKundaliSVG(tekni: TekniData): string {
  const S = 400; // viewBox size
  const M = S / 2; // midpoint

  // House rashis: house 1 = lagna rashi, house 2 = next, etc.
  const houseRashis: number[] = [];
  for (let h = 0; h < 12; h++) houseRashis.push(((tekni.lagnaRashiNum - 1 + h) % 12) + 1);

  // Planet placements by house — symbol + English/Hindi
  const byHouse = new Map<number, { symbol: string; label: string }[]>();
  for (const g of tekni.grahas) {
    const hi = houseRashis.indexOf(g.rashiNum);
    if (hi >= 0) {
      const h = hi + 1;
      if (!byHouse.has(h)) byHouse.set(h, []);
      const sym = GRAHA_SYMBOL[g.name] || '';
      const dev = GRAHA_DEV[g.name] || '';
      const retro = g.isRetro ? '℞' : '';
      byHouse.get(h)!.push({ symbol: sym, label: `${g.name}/${dev}${retro}` });
    }
  }

  // North Indian diamond chart — proper geometry:
  // Outer square + Inner tilted diamond (connecting midpoints) + Corner-to-corner diagonals
  // This creates exactly 12 houses: 4 kites (1,4,7,10) + 8 triangles
  // House numbering goes clockwise from top
  const centers: [number, number][] = [
    [M, M / 2],          // 1  — top center kite
    [M + M / 2, M / 4],  // 2  — upper-right triangle
    [S - M / 4, M / 2],  // 3  — right-upper triangle
    [M + M / 2, M],      // 4  — right center kite
    [S - M / 4, M + M / 2], // 5 — right-lower triangle
    [M + M / 2, S - M / 4], // 6 — lower-right triangle
    [M, M + M / 2],      // 7  — bottom center kite
    [M / 2, S - M / 4],  // 8  — lower-left triangle
    [M / 4, M + M / 2],  // 9  — left-lower triangle
    [M / 2, M],          // 10 — left center kite
    [M / 4, M / 2],      // 11 — left-upper triangle
    [M / 2, M / 4],      // 12 — upper-left triangle
  ];

  let svg = `<svg viewBox="0 0 ${S} ${S}" class="kundali-svg">`;
  // Outer square background
  svg += `<rect x="0" y="0" width="${S}" height="${S}" fill="#FBF3E2" stroke="#800021" stroke-width="2.5" rx="2"/>`;
  // Inner diamond (tilted square connecting midpoints of outer square)
  svg += `<line x1="${M}" y1="0" x2="${S}" y2="${M}" stroke="#800021" stroke-width="1.5"/>`;
  svg += `<line x1="${S}" y1="${M}" x2="${M}" y2="${S}" stroke="#800021" stroke-width="1.5"/>`;
  svg += `<line x1="${M}" y1="${S}" x2="0" y2="${M}" stroke="#800021" stroke-width="1.5"/>`;
  svg += `<line x1="0" y1="${M}" x2="${M}" y2="0" stroke="#800021" stroke-width="1.5"/>`;
  // Full diagonals from corners through center
  svg += `<line x1="0" y1="0" x2="${S}" y2="${S}" stroke="#800021" stroke-width="1.2"/>`;
  svg += `<line x1="${S}" y1="0" x2="0" y2="${S}" stroke="#800021" stroke-width="1.2"/>`;

  // Label each house
  for (let h = 0; h < 12; h++) {
    const [cx, cy] = centers[h];
    const rashiNum = houseRashis[h];

    // House/Rashi number (large, bold, prominent)
    svg += `<text x="${cx}" y="${cy - 14}" text-anchor="middle" class="house-num">${rashiNum}</text>`;

    // Planet lines: symbol + Eng/Hindi on each line
    const planets = byHouse.get(h + 1);
    if (planets) {
      planets.forEach((p, i) => {
        svg += `<text x="${cx}" y="${cy + 6 + i * 16}" text-anchor="middle" class="planet-text">${esc(p.symbol)} ${esc(p.label)}</text>`;
      });
    }
  }

  // Asc marker on house 1
  svg += `<text x="${M}" y="${centers[0][1] - 30}" text-anchor="middle" class="asc-label">Asc</text>`;

  svg += '</svg>';
  return svg;
}

// ── House Legend ─────────────────────────────────────────────────────────

function buildHouseLegend(tekni: TekniData): string {
  const houseRashis: number[] = [];
  for (let h = 0; h < 12; h++) houseRashis.push(((tekni.lagnaRashiNum - 1 + h) % 12) + 1);

  const byHouse = new Map<number, string[]>();
  for (const g of tekni.grahas) {
    const hi = houseRashis.indexOf(g.rashiNum);
    if (hi >= 0) {
      const h = hi + 1;
      if (!byHouse.has(h)) byHouse.set(h, []);
      const sym = GRAHA_SYMBOL[g.name] || '';
      const retro = g.isRetro ? ' ℞' : '';
      byHouse.get(h)!.push(`${sym} ${g.name}/${GRAHA_DEV[g.name] || ''}${retro}`);
    }
  }

  let html = '<table class="house-legend">';
  html += '<tr><th>House</th><th>Rashi</th><th>Planets</th><th>Signification</th></tr>';
  for (let h = 0; h < 12; h++) {
    const rashiNum = houseRashis[h];
    const rashiName = RASHI_LIST[rashiNum - 1];
    const planets = byHouse.get(h + 1)?.join(', ') || '—';
    const sig = HOUSE_SIG[h];
    html += `<tr>
      <td class="hl-house">${h + 1}</td>
      <td>${esc(rashiName)} / ${RASHI_DEV[rashiName] || ''}</td>
      <td class="hl-planets">${planets}</td>
      <td class="hl-sig">${esc(sig)}</td>
    </tr>`;
  }
  html += '</table>';
  return html;
}

// ── Main HTML Generation ────────────────────────────────────────────────

export function generateTakniHTML(tekni: TekniData, qrDataUrl?: string): string {
  const b = tekni.birth;
  const takniCode = encodeTakniCode(b);
  const dob = fmtDate(b.year, b.month, b.day);
  const tob = fmtTime(b.hour, b.minute);
  const genderText = b.gender === 'male' ? 'Male / पुरुष' : 'Female / स्त्री';

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Takni – ${esc(b.name)}</title>
<style>
  /* ── Fonts ── */
  @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari:wght@400;600;700&family=Noto+Serif+Devanagari:wght@400;600;700&family=EB+Garamond:ital,wght@0,400;0,600;0,700;1,400&display=swap');

  :root {
    --parchment: #F5E6C8;
    --parch-dark: #EBDCBa;
    --border: #8C1A1F;
    --text: #3D2B1F;
    --text-light: #6B4F38;
    --gold: #C5A659;
    --vermillion: #E3432F;
    --saffron: #ED8C26;
    --chart-line: #800021;
    --cream: #FBF3E2;
  }

  * { margin: 0; padding: 0; box-sizing: border-box; }

  body {
    font-family: 'EB Garamond', 'Noto Serif Devanagari', Georgia, serif;
    background: #E8D8C0;
    color: var(--text);
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  .takni-page {
    width: 210mm;
    height: 297mm;
    margin: 20px auto;
    background: var(--parchment);
    position: relative;
    padding: 0;
    box-shadow: 0 4px 20px rgba(0,0,0,0.3);
    overflow: hidden;
  }

  /* ── Decorative Border ── */
  .border-outer {
    position: absolute; inset: 10px;
    border: 2.5px solid var(--border);
    pointer-events: none;
  }
  .border-inner {
    position: absolute; inset: 15px;
    border: 0.75px solid var(--gold);
    pointer-events: none;
  }
  /* Corner circles */
  .corner-dot { position: absolute; width: 10px; height: 10px; border-radius: 50%; background: var(--border); }
  .corner-dot::after { content: ''; position: absolute; inset: 2.5px; border-radius: 50%; background: var(--gold); }
  .corner-dot::before { content: ''; position: absolute; inset: 4px; border-radius: 50%; background: var(--vermillion); z-index: 1; }
  .corner-dot.tl { top: 5px; left: 5px; }
  .corner-dot.tr { top: 5px; right: 5px; }
  .corner-dot.bl { bottom: 5px; left: 5px; }
  .corner-dot.br { bottom: 5px; right: 5px; }
  /* Om on top/bottom center */
  .om-marker { position: absolute; left: 50%; transform: translateX(-50%); color: var(--vermillion); font-size: 12px; font-family: 'Noto Sans Devanagari', sans-serif; }
  .om-marker.top { top: 1px; }
  .om-marker.bottom { bottom: 0px; }

  .content { padding: 20px 26px 12px; position: relative; z-index: 1; }

  /* ── Compact Header (single line) ── */
  .header-row {
    display: flex; align-items: center; justify-content: center; gap: 10px;
    margin-bottom: 2px;
  }
  .ganesha-img { width: 36px; height: 36px; object-fit: contain; }
  .header-titles { text-align: center; }
  .header-titles .sacred {
    color: var(--vermillion); font-size: 14px; font-weight: 700;
    font-family: 'Noto Serif Devanagari', serif;
  }
  .header-titles .om { color: var(--saffron); font-size: 13px; font-family: 'Noto Sans Devanagari'; }
  .header-titles .title-line {
    font-size: 11px; color: var(--text-light);
  }
  .header-titles .title-dev {
    color: var(--border); font-size: 15px; font-weight: 700;
    font-family: 'Noto Serif Devanagari', serif;
  }
  .header-titles .title-eng {
    color: var(--text); font-size: 11px; font-weight: 600; letter-spacing: 0.4px;
  }
  .person-name { font-size: 20px; font-weight: 700; color: var(--text); font-family: 'EB Garamond', serif; }

  /* ── Dividers ── */
  .divider {
    display: flex; align-items: center; justify-content: center; gap: 6px;
    margin: 3px 0;
  }
  .divider .line { flex: 1; height: 0.5px; background: var(--gold); }
  .divider .diamond {
    width: 6px; height: 6px; background: var(--vermillion);
    transform: rotate(45deg); flex-shrink: 0;
  }

  /* ── Personal Details (3-col with dotted separators) ── */
  .details-3col {
    display: grid;
    grid-template-columns: 1fr auto 1fr auto 1fr;
    gap: 1px 0;
    margin: 3px 0;
    font-size: 11px;
  }
  .details-3col .col {
    padding: 0 10px;
  }
  .details-3col .col-sep {
    width: 1px;
    background: repeating-linear-gradient(to bottom, var(--gold) 0px, var(--gold) 3px, transparent 3px, transparent 6px);
  }
  .detail-row {
    display: flex; gap: 4px; align-items: baseline;
    padding: 1px 0;
  }
  .detail-label {
    color: var(--text-light); font-weight: 600; font-size: 10px;
    white-space: nowrap;
    font-family: 'EB Garamond', serif;
  }
  .detail-label .dev { font-family: 'Noto Sans Devanagari'; font-weight: 500; font-size: 9px; }
  .detail-value { color: var(--text); font-weight: 400; font-size: 10.5px; }

  /* ── Section Headers ── */
  .section-hdr {
    text-align: center; margin: 2px 0 3px;
  }
  .section-hdr .dev {
    color: var(--vermillion); font-size: 13px; font-weight: 700;
    font-family: 'Noto Serif Devanagari', serif;
  }
  .section-hdr .eng {
    color: var(--border); font-size: 10px; font-weight: 600;
    letter-spacing: 0.3px;
  }

  /* ── Kundali + House Legend side by side ── */
  .chart-section {
    display: flex; gap: 10px; align-items: flex-start;
    margin: 3px 0;
  }
  .chart-left { flex: 0 0 280px; }
  .kundali-svg { width: 280px; height: 280px; }
  .kundali-svg .house-num { font: bold 22px 'EB Garamond', serif; fill: var(--text); }
  .kundali-svg .planet-text { font: bold 13px 'Noto Sans Devanagari', 'EB Garamond', sans-serif; fill: var(--border); }
  .kundali-svg .asc-label { font: bold 11px sans-serif; fill: var(--vermillion); }

  .chart-right { flex: 1; overflow: hidden; }
  .house-legend {
    width: 100%; border-collapse: collapse; font-size: 8.5px;
  }
  .house-legend th {
    background: var(--border); color: #fff; padding: 2px 4px;
    text-align: left; font-weight: 600; font-size: 8px;
  }
  .house-legend td {
    padding: 1.5px 4px; border-bottom: 0.5px solid var(--gold);
    vertical-align: top;
  }
  .house-legend tr:nth-child(even) td { background: var(--parch-dark); }
  .hl-house { font-weight: 700; text-align: center; color: var(--border); width: 26px; }
  .hl-planets { font-weight: 600; color: var(--border); }
  .hl-sig { color: var(--text-light); font-style: italic; font-size: 7.5px; }

  /* ── Astrological Summary (3-col) ── */
  .astro-3col {
    display: grid;
    grid-template-columns: 1fr auto 1fr auto 1fr;
    gap: 1px 0; font-size: 11px; margin: 3px 0;
  }
  .astro-3col .col { padding: 0 10px; }
  .astro-3col .col-sep {
    width: 1px;
    background: repeating-linear-gradient(to bottom, var(--gold) 0px, var(--gold) 3px, transparent 3px, transparent 6px);
  }

  /* ── Graha Table ── */
  .graha-table {
    width: 100%; border-collapse: collapse; font-size: 10px; margin: 3px 0;
  }
  .graha-table th {
    background: var(--border); color: #fff; padding: 2.5px 5px;
    text-align: left; font-weight: 600; font-size: 9px;
  }
  .graha-table td { padding: 2px 5px; border-bottom: 0.5px solid var(--gold); }
  .graha-table tr:nth-child(even) td { background: var(--parch-dark); }
  .graha-table .deg { font-family: 'Courier New', monospace; font-size: 9px; color: var(--text-light); }

  /* ── QR / TakniCode Footer ── */
  .qr-section {
    display: flex; align-items: center; gap: 12px;
    margin-top: 4px; padding-top: 3px;
  }
  .qr-img { width: 60px; height: 60px; }
  .takni-code-label { font-size: 9px; color: var(--text-light); font-weight: 600; }
  .takni-code {
    font-family: 'Courier New', monospace; font-size: 14px;
    color: var(--border); font-weight: 700; letter-spacing: 1px;
  }
  .qr-hint { font-size: 8px; color: var(--text-light); margin-top: 1px; }
  .samvat { color: var(--gold); font-size: 10px; font-family: 'Noto Sans Devanagari'; margin-top: 2px; }

  /* ── Footer ── */
  .footer {
    text-align: center; margin-top: 4px; padding-top: 2px;
  }
  .footer .blessing { color: var(--vermillion); font-size: 12px; font-family: 'Noto Serif Devanagari', serif; }
  .footer .credits { color: var(--text-light); font-size: 7px; margin-top: 1px; }

  /* ── Print Styles ── */
  @media print {
    body { background: none !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .print-bar { display: none !important; }
    .takni-page {
      box-shadow: none !important;
      margin: 0 !important;
      width: 100% !important;
      height: auto !important;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    @page { margin: 0; size: A4 portrait; }
  }
</style>
</head>
<body>

<div class="takni-page">
  <div class="border-outer"></div>
  <div class="border-inner"></div>
  <div class="corner-dot tl"></div>
  <div class="corner-dot tr"></div>
  <div class="corner-dot bl"></div>
  <div class="corner-dot br"></div>
  <div class="om-marker top">ॐ</div>
  <div class="om-marker bottom">ॐ</div>

  <div class="content">

    <!-- ── Compact Header: Ganesha + Invocation + Titles in one block ── -->
    <div class="header-row">
      <img src="${GANESHA_BASE64}" alt="Shri Ganesha" class="ganesha-img">
      <div class="header-titles">
        <div><span class="om">ॐ</span> <span class="sacred">श्री गणेशाय नमः</span> <span class="om">ॐ</span></div>
        <div><span class="title-dev">जन्म कुण्डली (टेकनी)</span> — <span class="title-eng">Janam Kundali (Tekni)</span></div>
      </div>
      <img src="${GANESHA_BASE64}" alt="" class="ganesha-img" style="opacity:0.4;">
    </div>
    <div class="divider"><span class="line"></span><span class="diamond"></span><span class="line"></span></div>

    <!-- ── Person Name (centered) ── -->
    <div style="text-align:center;margin:1px 0;"><span class="person-name">${esc(b.name)}</span></div>

    <!-- ── Personal Details (3-col with dotted separators) ── -->
    <div class="details-3col">
      <div class="col">
        <div class="detail-row">
          <span class="detail-label">Father <span class="dev">/ पिता</span>:</span>
          <span class="detail-value">${esc(b.fatherName)}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">DOB:</span>
          <span class="detail-value">${esc(dob)}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Place:</span>
          <span class="detail-value">${esc(b.placeName)}</span>
        </div>
      </div>
      <div class="col-sep"></div>
      <div class="col">
        <div class="detail-row">
          <span class="detail-label">Mother <span class="dev">/ माता</span>:</span>
          <span class="detail-value">${esc(b.motherName)}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">TOB:</span>
          <span class="detail-value">${esc(tob)}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Gender:</span>
          <span class="detail-value">${genderText}</span>
        </div>
      </div>
      <div class="col-sep"></div>
      <div class="col">
        <div class="detail-row">
          <span class="detail-label">Gotra <span class="dev">/ गोत्र</span>:</span>
          <span class="detail-value">${esc(b.gotra)}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Ishtdevi <span class="dev">/ इष्टदेवी</span>:</span>
          <span class="detail-value">${esc(b.ishtdevi)}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Lat / Long:</span>
          <span class="detail-value">${b.latitude.toFixed(2)}°, ${b.longitude.toFixed(2)}°</span>
        </div>
      </div>
    </div>
    <div class="divider"><span class="line"></span><span class="diamond"></span><span class="line"></span></div>

    <!-- ── Kundali Chart + House Legend ── -->
    <div class="section-hdr">
      <span class="dev">कुण्डली चक्र</span> — <span class="eng">Kundali Chart</span>
    </div>
    <div class="chart-section">
      <div class="chart-left">
        ${buildKundaliSVG(tekni)}
      </div>
      <div class="chart-right">
        ${buildHouseLegend(tekni)}
      </div>
    </div>
    <div class="divider"><span class="line"></span><span class="diamond"></span><span class="line"></span></div>

    <!-- ── Astrological Summary (3-col) ── -->
    <div class="section-hdr">
      <span class="dev">ज्योतिष सारांश</span> — <span class="eng">Astrological Summary</span>
    </div>
    <div class="astro-3col">
      <div class="col">
        <div class="detail-row">
          <span class="detail-label">Lagna <span class="dev">/ लग्न</span>:</span>
          <span class="detail-value">${esc(tekni.lagnaRashi)} / ${RASHI_DEV[tekni.lagnaRashi] || ''}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Nadi <span class="dev">/ नाडी</span>:</span>
          <span class="detail-value">${esc(tekni.nadi)} / ${NADI_DEV[tekni.nadi] || ''}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Yoni <span class="dev">/ योनि</span>:</span>
          <span class="detail-value">${esc(tekni.yoni)}</span>
        </div>
      </div>
      <div class="col-sep"></div>
      <div class="col">
        <div class="detail-row">
          <span class="detail-label">Janma Rashi (Moon) <span class="dev">/ जन्म राशि (चन्द्र)</span>:</span>
          <span class="detail-value">${esc(tekni.moonRashi)} / ${RASHI_DEV[tekni.moonRashi] || ''}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Gana <span class="dev">/ गण</span>:</span>
          <span class="detail-value">${esc(tekni.gana)} / ${GANA_DEV[tekni.gana] || ''}</span>
        </div>
      </div>
      <div class="col-sep"></div>
      <div class="col">
        <div class="detail-row">
          <span class="detail-label">Nakshatra <span class="dev">/ नक्षत्र</span>:</span>
          <span class="detail-value">${esc(tekni.nakshatra)}, Pada ${tekni.pada}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Varna <span class="dev">/ वर्ण</span>:</span>
          <span class="detail-value">${esc(tekni.varna)}</span>
        </div>
      </div>
    </div>
    <div class="divider"><span class="line"></span><span class="diamond"></span><span class="line"></span></div>

    <!-- ── Graha Positions Table ── -->
    <div class="section-hdr">
      <span class="dev">ग्रह स्थिति</span> — <span class="eng">Graha Sthiti (Planetary Positions)</span>
    </div>
    <table class="graha-table">
      <thead>
        <tr><th>Graha / ग्रह</th><th>Rashi / राशि</th><th>Degrees</th><th>Nakshatra</th><th>Pada</th></tr>
      </thead>
      <tbody>
${tekni.grahas.map(g => {
  const retro = g.isRetro ? ' <span style="color:var(--vermillion)">℞</span>' : '';
  const sym = GRAHA_SYMBOL[g.name] || '';
  return `        <tr>
          <td>${esc(sym)} ${esc(g.name)}${retro} / ${GRAHA_DEV[g.name] || ''}</td>
          <td>${esc(g.rashi)} / ${RASHI_DEV[g.rashi] || ''}</td>
          <td class="deg">${fmtDeg(g.degrees)}</td>
          <td>${esc(g.nakshatra)}</td>
          <td>${g.pada}</td>
        </tr>`;
}).join('\n')}
      </tbody>
    </table>
    <div class="divider"><span class="line"></span><span class="diamond"></span><span class="line"></span></div>

    <!-- ── QR Code + TakniCode + Samvat ── -->
    <div class="qr-section">
      ${qrDataUrl ? `<img src="${qrDataUrl}" alt="QR Code" class="qr-img">` : '<div class="qr-img" style="background:#eee;border:1px solid #ccc;display:flex;align-items:center;justify-content:center;font-size:8px;color:#999;">QR</div>'}
      <div>
        <div class="takni-code-label">TakniCode™</div>
        <div class="takni-code">${esc(takniCode)}</div>
        <div class="qr-hint">Scan QR with Janthari app to regenerate this Takni</div>
        <div class="samvat">सप्तर्षि संवत् ${tekni.saptarshiYear}</div>
      </div>
    </div>

    <!-- ── Footer ── -->
    <div class="footer">
      <div class="blessing">शुभं भवतु</div>
      <div class="credits">Generated by Janthari • www.janthari.com</div>
    </div>

  </div><!-- .content -->
</div><!-- .takni-page -->

</body>
</html>`;
}
