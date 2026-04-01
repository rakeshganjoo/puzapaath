/**
 * TakniPDFGenerator — Generates a traditional-looking Takni (birth chart) PDF.
 *
 * Features:
 * - Ganesha image header with sacred invocation
 * - Aged parchment background with maroon/gold decorative border
 * - Bilingual English + Devanagari text
 * - Traditional Hindu/Kashmiri symbols (Om, Trishul, corner ornaments)
 * - North Indian diamond Kundali chart
 * - Complete birth details: Name, Father, Mother, Gotra, Ishtdevi, DOB, TOB, POB
 * - Graha positions table with Devanagari planet/rashi names
 * - QR code with TakniCode for instant regeneration
 */

import { PDFDocument, PDFFont, PDFPage, rgb, StandardFonts } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import QRCode from 'qrcode';
import * as fs from 'fs';
import * as path from 'path';
import { encodeTakniCode, buildTakniQRUrl, type TakniBirthData } from './TakniEncoder';
import { KUNDALI_CHART, GRAHA_ABBR } from '../assets/takni/ornaments';

// ── Types live in SSoT: src/types/tekni.ts ─────────────────────────────
import type { GrahaPosition, TekniData } from '../types/tekni';
export type { GrahaPosition, TekniData };

// ── Constants ───────────────────────────────────────────────────────────

const PAGE_W = 595.28;
const PAGE_H = 841.89;
const MARGIN = 36;
const INNER_MARGIN = 44;

const COL = {
  parchment:  rgb(0.96, 0.90, 0.78),
  parchDark:  rgb(0.92, 0.86, 0.72),
  border:     rgb(0.55, 0.10, 0.12),
  text:       rgb(0.24, 0.17, 0.12),
  textLight:  rgb(0.42, 0.31, 0.22),
  gold:       rgb(0.77, 0.65, 0.35),
  vermillion: rgb(0.89, 0.26, 0.20),
  saffron:    rgb(0.93, 0.55, 0.15),
  chartLine:  rgb(0.50, 0.00, 0.13),
  white:      rgb(1, 1, 1),
  cream:      rgb(0.98, 0.95, 0.88),
};

// ── Devanagari Lookups ──────────────────────────────────────────────────

const RASHI_DEV: Record<string, string> = {
  Mesha: '\u092E\u0947\u0937', Vrishabha: '\u0935\u0943\u0937\u092D',
  Mithuna: '\u092E\u093F\u0925\u0941\u0928', Karka: '\u0915\u0930\u094D\u0915',
  Simha: '\u0938\u093F\u0902\u0939', Kanya: '\u0915\u0928\u094D\u092F\u093E',
  Tula: '\u0924\u0941\u0932\u093E', Vrischika: '\u0935\u0943\u0936\u094D\u091A\u093F\u0915',
  Dhanu: '\u0927\u0928\u0941', Makara: '\u092E\u0915\u0930',
  Kumbha: '\u0915\u0941\u092E\u094D\u092D', Meena: '\u092E\u0940\u0928',
};

const GRAHA_DEV: Record<string, string> = {
  Sun: '\u0938\u0942\u0930\u094D\u092F', Moon: '\u091A\u0928\u094D\u0926\u094D\u0930',
  Mars: '\u092E\u0902\u0917\u0932', Mercury: '\u092C\u0941\u0927',
  Jupiter: '\u0917\u0941\u0930\u0941', Venus: '\u0936\u0941\u0915\u094D\u0930',
  Saturn: '\u0936\u0928\u093F', Rahu: '\u0930\u093E\u0939\u0941',
  Ketu: '\u0915\u0947\u0924\u0941',
};

const NADI_DEV: Record<string, string> = {
  Aadi: '\u0906\u0926\u093F', Madhya: '\u092E\u0927\u094D\u092F', Antya: '\u0905\u0928\u094D\u0924\u094D\u092F',
};

const GANA_DEV: Record<string, string> = {
  Deva: '\u0926\u0947\u0935', Manushya: '\u092E\u0928\u0941\u0937\u094D\u092F', Rakshasa: '\u0930\u093E\u0915\u094D\u0937\u0938',
};

// ── Drawing Helpers ─────────────────────────────────────────────────────

function drawParchmentBg(page: PDFPage) {
  page.drawRectangle({ x: 0, y: 0, width: PAGE_W, height: PAGE_H, color: COL.parchment });
}

function drawDecorativeBorder(page: PDFPage, devFont: PDFFont) {
  // Outer border
  page.drawRectangle({
    x: MARGIN, y: MARGIN,
    width: PAGE_W - 2 * MARGIN, height: PAGE_H - 2 * MARGIN,
    borderColor: COL.border, borderWidth: 2.5,
  });
  // Inner border
  page.drawRectangle({
    x: INNER_MARGIN, y: INNER_MARGIN,
    width: PAGE_W - 2 * INNER_MARGIN, height: PAGE_H - 2 * INNER_MARGIN,
    borderColor: COL.gold, borderWidth: 0.75,
  });

  // Corner ornaments: layered circles (maroon > gold > vermillion)
  const corners: [number, number][] = [
    [MARGIN, MARGIN], [PAGE_W - MARGIN, MARGIN],
    [MARGIN, PAGE_H - MARGIN], [PAGE_W - MARGIN, PAGE_H - MARGIN],
  ];
  for (const [cx, cy] of corners) {
    page.drawCircle({ x: cx, y: cy, size: 6, color: COL.border });
    page.drawCircle({ x: cx, y: cy, size: 3.5, color: COL.gold });
    page.drawCircle({ x: cx, y: cy, size: 1.5, color: COL.vermillion });
  }

  // Om symbols at top & bottom center
  const om = '\u0950';
  for (const [mx, my] of [[PAGE_W / 2, PAGE_H - MARGIN + 1], [PAGE_W / 2, MARGIN - 7]] as [number, number][]) {
    const omW = devFont.widthOfTextAtSize(om, 12);
    page.drawText(om, { x: mx - omW / 2, y: my, size: 12, font: devFont, color: COL.vermillion });
  }

  // Side trishul marks
  for (const [sx, sy] of [[MARGIN - 3, PAGE_H / 2], [PAGE_W - MARGIN - 5, PAGE_H / 2]] as [number, number][]) {
    page.drawLine({ start: { x: sx + 4, y: sy - 6 }, end: { x: sx + 4, y: sy + 6 }, thickness: 1, color: COL.gold });
    page.drawCircle({ x: sx + 4, y: sy + 8, size: 2, color: COL.vermillion });
  }

  // Inner corner L-filigree
  const ics: [number, number, number, number][] = [
    [INNER_MARGIN + 2, INNER_MARGIN + 2, 1, 1],
    [PAGE_W - INNER_MARGIN - 2, INNER_MARGIN + 2, -1, 1],
    [INNER_MARGIN + 2, PAGE_H - INNER_MARGIN - 2, 1, -1],
    [PAGE_W - INNER_MARGIN - 2, PAGE_H - INNER_MARGIN - 2, -1, -1],
  ];
  for (const [ix, iy, dx, dy] of ics) {
    page.drawLine({ start: { x: ix, y: iy }, end: { x: ix + 18 * dx, y: iy }, thickness: 0.5, color: COL.gold });
    page.drawLine({ start: { x: ix, y: iy }, end: { x: ix, y: iy + 18 * dy }, thickness: 0.5, color: COL.gold });
  }
}

function drawSmallDiamond(page: PDFPage, cx: number, cy: number, s: number, color: ReturnType<typeof rgb>) {
  page.drawLine({ start: { x: cx, y: cy + s }, end: { x: cx + s, y: cy }, thickness: 1.2, color });
  page.drawLine({ start: { x: cx + s, y: cy }, end: { x: cx, y: cy - s }, thickness: 1.2, color });
  page.drawLine({ start: { x: cx, y: cy - s }, end: { x: cx - s, y: cy }, thickness: 1.2, color });
  page.drawLine({ start: { x: cx - s, y: cy }, end: { x: cx, y: cy + s }, thickness: 1.2, color });
}

function drawSectionDivider(page: PDFPage, y: number, devFont: PDFFont) {
  const x1 = INNER_MARGIN + 12;
  const x2 = PAGE_W - INNER_MARGIN - 12;
  const mid = PAGE_W / 2;
  page.drawLine({ start: { x: x1, y }, end: { x: mid - 15, y }, thickness: 0.5, color: COL.gold });
  page.drawLine({ start: { x: mid + 15, y }, end: { x: x2, y }, thickness: 0.5, color: COL.gold });
  drawSmallDiamond(page, mid, y, 3, COL.vermillion);
  page.drawCircle({ x: mid - 10, y, size: 1, color: COL.gold });
  page.drawCircle({ x: mid + 10, y, size: 1, color: COL.gold });
}

function drawBilingualHeader(
  page: PDFPage, y: number,
  devText: string, engText: string,
  devBold: PDFFont, engBold: PDFFont,
): number {
  const devW = devBold.widthOfTextAtSize(devText, 13);
  page.drawText(devText, { x: (PAGE_W - devW) / 2, y, size: 13, font: devBold, color: COL.vermillion });
  y -= 14;
  const engW = engBold.widthOfTextAtSize(engText, 11);
  page.drawText(engText, { x: (PAGE_W - engW) / 2, y, size: 11, font: engBold, color: COL.border });
  return y - 12;
}

// ── Kundali Chart ───────────────────────────────────────────────────────

function drawKundaliChart(
  page: PDFPage, ox: number, oy: number, sz: number,
  tekni: TekniData, f: { helvBold: PDFFont; helv: PDFFont },
) {
  const sc = sz / KUNDALI_CHART.size;
  const tx = (x: number) => ox + x * sc;
  const ty = (y: number) => oy + (KUNDALI_CHART.size - y) * sc;

  page.drawRectangle({ x: ox, y: oy, width: sz, height: sz, color: COL.cream, borderColor: COL.chartLine, borderWidth: 1.5 });

  for (const [p1, p2] of KUNDALI_CHART.outerLines) {
    page.drawLine({ start: { x: tx(p1[0]), y: ty(p1[1]) }, end: { x: tx(p2[0]), y: ty(p2[1]) }, thickness: 1, color: COL.chartLine });
  }

  const houseRashis: number[] = [];
  for (let h = 0; h < 12; h++) houseRashis.push(((tekni.lagnaRashiNum - 1 + h) % 12) + 1);

  const byHouse: Map<number, string[]> = new Map();
  for (const g of tekni.grahas) {
    const hi = houseRashis.indexOf(g.rashiNum);
    if (hi >= 0) {
      const h = hi + 1;
      if (!byHouse.has(h)) byHouse.set(h, []);
      byHouse.get(h)!.push((GRAHA_ABBR[g.name] || g.name.slice(0, 2)) + (g.isRetro ? 'R' : ''));
    }
  }

  for (const h of KUNDALI_CHART.houses) {
    const cx = tx(h.cx), cy = ty(h.cy);
    page.drawText(String(houseRashis[h.house - 1]), { x: cx - 3, y: cy + 7, size: 7, font: f.helv, color: COL.textLight });
    const pl = byHouse.get(h.house);
    if (pl) {
      const t = pl.join(' ');
      page.drawText(t, { x: cx - f.helvBold.widthOfTextAtSize(t, 8) / 2, y: cy - 5, size: 8, font: f.helvBold, color: COL.border });
    }
  }

  page.drawText('Asc', { x: tx(KUNDALI_CHART.houses[0].cx) - 7, y: ty(KUNDALI_CHART.houses[0].cy) + 17, size: 7, font: f.helvBold, color: COL.vermillion });
}

// ── Main PDF Generation ─────────────────────────────────────────────────

export async function generateTakniPDF(tekni: TekniData): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  doc.registerFontkit(fontkit);
  doc.setTitle(`Takni - ${tekni.birth.name}`);
  doc.setAuthor('Janthari (www.janthari.com)');
  doc.setSubject('Kashmiri Pandit Birth Chart (Tekni)');

  const [helv, helvBold, timesRoman, timesBold, courier] = await Promise.all([
    doc.embedFont(StandardFonts.Helvetica),
    doc.embedFont(StandardFonts.HelveticaBold),
    doc.embedFont(StandardFonts.TimesRoman),
    doc.embedFont(StandardFonts.TimesRomanBold),
    doc.embedFont(StandardFonts.Courier),
  ]);

  // Embed Devanagari fonts
  const assetsDir = path.join(__dirname, '..', 'assets', 'takni');
  const devFont = await doc.embedFont(fs.readFileSync(path.join(assetsDir, 'DevanagariMT.ttf')));
  const devBold = await doc.embedFont(fs.readFileSync(path.join(assetsDir, 'DevanagariMTBold.ttf')));

  // Embed Ganesha image
  const ganeshaImg = await doc.embedJpg(fs.readFileSync(path.join(assetsDir, 'ganesha.jpeg')));

  const page = doc.addPage([PAGE_W, PAGE_H]);
  drawParchmentBg(page);
  drawDecorativeBorder(page, devFont);

  let y = PAGE_H - INNER_MARGIN - 8;

  // ── Ganesha Image (centered) ──
  const gW = 55, gH = 55;
  page.drawImage(ganeshaImg, { x: (PAGE_W - gW) / 2, y: y - gH, width: gW, height: gH });
  y -= gH + 4;

  // ── Sacred Invocation ──
  const invocation = '\u0936\u094D\u0930\u0940 \u0917\u0923\u0947\u0936\u093E\u092F \u0928\u092E\u0903';
  const invW = devBold.widthOfTextAtSize(invocation, 14);
  page.drawText(invocation, { x: (PAGE_W - invW) / 2, y, size: 14, font: devBold, color: COL.vermillion });

  // Flanking Om
  const om = '\u0950';
  page.drawText(om, { x: (PAGE_W - invW) / 2 - 22, y, size: 12, font: devFont, color: COL.saffron });
  page.drawText(om, { x: (PAGE_W + invW) / 2 + 10, y, size: 12, font: devFont, color: COL.saffron });
  y -= 16;

  // ── Title (bilingual) ──
  const titleDev = '\u091C\u0928\u094D\u092E \u0915\u0941\u0923\u094D\u0921\u0932\u0940 (\u091F\u0947\u0915\u0928\u0940)';
  const tdW = devBold.widthOfTextAtSize(titleDev, 16);
  page.drawText(titleDev, { x: (PAGE_W - tdW) / 2, y, size: 16, font: devBold, color: COL.border });
  y -= 15;
  const titleEng = 'Janam Kundali (Tekni)';
  const teW = timesBold.widthOfTextAtSize(titleEng, 13);
  page.drawText(titleEng, { x: (PAGE_W - teW) / 2, y, size: 13, font: timesBold, color: COL.text });
  y -= 10;
  drawSectionDivider(page, y, devFont);
  y -= 14;

  // ── Personal Details ──
  const labelW = 110;
  const c1 = INNER_MARGIN + 20;
  const c2 = PAGE_W / 2 + 10;

  // Name centered
  const nameW = timesBold.widthOfTextAtSize(tekni.birth.name, 18);
  page.drawText(tekni.birth.name, { x: (PAGE_W - nameW) / 2, y, size: 18, font: timesBold, color: COL.text });
  y -= 18;

  const dob = formatDate(tekni.birth.year, tekni.birth.month, tekni.birth.day);
  const tob = formatTime(tekni.birth.hour, tekni.birth.minute);
  const genderEng = tekni.birth.gender === 'male' ? 'Male' : 'Female';
  const genderDev = tekni.birth.gender === 'male' ? '\u092A\u0941\u0930\u0941\u0937' : '\u0938\u094D\u0924\u094D\u0930\u0940';

  // Helper to draw a bilingual label row: "English / देवनागरी:" + value
  const drawField = (x: number, yPos: number, engLabel: string, devLabel: string, value: string) => {
    let cx = x;
    page.drawText(engLabel, { x: cx, y: yPos, size: 8.5, font: helvBold, color: COL.textLight });
    cx += helvBold.widthOfTextAtSize(engLabel, 8.5);
    if (devLabel) {
      page.drawText(' / ', { x: cx, y: yPos, size: 8.5, font: helv, color: COL.textLight });
      cx += helv.widthOfTextAtSize(' / ', 8.5);
      page.drawText(devLabel + ':', { x: cx, y: yPos, size: 8.5, font: devFont, color: COL.textLight });
    }
    // Value offset from column start at fixed position
    page.drawText(value, { x: x + labelW, y: yPos, size: 9.5, font: timesRoman, color: COL.text });
  };

  type FieldDef = { eng: string; dev: string; val: string };
  const fieldRows: [FieldDef, FieldDef | null][] = [
    [{ eng: "Father's Name", dev: '\u092A\u093F\u0924\u093E', val: tekni.birth.fatherName },
     { eng: "Mother's Name", dev: '\u092E\u093E\u0924\u093E', val: tekni.birth.motherName }],
    [{ eng: 'Date of Birth', dev: '', val: dob },
     { eng: 'Time of Birth', dev: '', val: tob }],
    [{ eng: 'Place of Birth', dev: '', val: tekni.birth.placeName },
     { eng: 'Gender', dev: '', val: genderEng }],
    [{ eng: 'Lat / Long', dev: '', val: `${tekni.birth.latitude.toFixed(3)}\u00B0N, ${tekni.birth.longitude.toFixed(3)}\u00B0E` },
     null],
    [{ eng: 'Gotra', dev: '\u0917\u094B\u0924\u094D\u0930', val: tekni.birth.gotra },
     { eng: 'Ishtdevi', dev: '\u0907\u0937\u094D\u091F\u0926\u0947\u0935\u0940', val: tekni.birth.ishtdevi }],
  ];

  for (const [f1, f2] of fieldRows) {
    drawField(c1, y, f1.eng, f1.dev, f1.val);
    if (f2) drawField(c2, y, f2.eng, f2.dev, f2.val);
    y -= 13;
  }

  y -= 3;
  drawSectionDivider(page, y, devFont);
  y -= 12;

  // ── Kundali Chart ──
  y = drawBilingualHeader(page, y, '\u0915\u0941\u0923\u094D\u0921\u0932\u0940 \u091A\u0915\u094D\u0930', 'Kundali Chart (North Indian)', devBold, helvBold);
  const cSz = 170;
  drawKundaliChart(page, (PAGE_W - cSz) / 2, y - cSz, cSz, tekni, { helvBold, helv });
  y -= cSz + 8;
  drawSectionDivider(page, y, devFont);
  y -= 12;

  // ── Astrological Summary ──
  y = drawBilingualHeader(page, y, '\u091C\u094D\u092F\u094B\u0924\u093F\u0937 \u0938\u093E\u0930\u093E\u0902\u0936', 'Astrological Summary', devBold, helvBold);

  // Helper to draw a value that may contain "English (देवनागरी)" format
  const drawMixedValue = (x: number, yPos: number, value: string) => {
    const parenMatch = value.match(/^(.+?)\s*\(([^)]+)\)$/);
    if (parenMatch) {
      const engPart = parenMatch[1] + ' (';
      page.drawText(engPart, { x, y: yPos, size: 9.5, font: timesRoman, color: COL.text });
      const engW = timesRoman.widthOfTextAtSize(engPart, 9.5);
      page.drawText(parenMatch[2], { x: x + engW, y: yPos, size: 9.5, font: devFont, color: COL.text });
      const devW = devFont.widthOfTextAtSize(parenMatch[2], 9.5);
      page.drawText(')', { x: x + engW + devW, y: yPos, size: 9.5, font: timesRoman, color: COL.text });
    } else {
      page.drawText(value, { x, y: yPos, size: 9.5, font: timesRoman, color: COL.text });
    }
  };

  const sFieldRows: [FieldDef, FieldDef][] = [
    [{ eng: 'Lagna (Ascendant)', dev: '\u0932\u0917\u094D\u0928', val: `${tekni.lagnaRashi} (${RASHI_DEV[tekni.lagnaRashi] || ''})` },
     { eng: 'Janma Rashi (Moon)', dev: '\u091C\u0928\u094D\u092E \u0930\u093E\u0936\u093F (\u091A\u0928\u094D\u0926\u094D\u0930)', val: `${tekni.moonRashi} (${RASHI_DEV[tekni.moonRashi] || ''})` }],
    [{ eng: 'Nakshatra', dev: '\u0928\u0915\u094D\u0937\u0924\u094D\u0930', val: `${tekni.nakshatra}, Pada ${tekni.pada}` },
     { eng: 'Nadi', dev: '\u0928\u093E\u0921\u0940', val: `${tekni.nadi} (${NADI_DEV[tekni.nadi] || ''})` }],
    [{ eng: 'Gana', dev: '\u0917\u0923', val: `${tekni.gana} (${GANA_DEV[tekni.gana] || ''})` },
     { eng: 'Varna', dev: '\u0935\u0930\u094D\u0923', val: tekni.varna }],
    [{ eng: 'Yoni', dev: '\u092F\u094B\u0928\u093F', val: tekni.yoni },
     { eng: 'Saptarshi Samvat', dev: '', val: String(tekni.saptarshiYear) }],
  ];

  for (const [f1, f2] of sFieldRows) {
    // Draw labels (English + Devanagari separate)
    let cx1 = c1;
    page.drawText(f1.eng, { x: cx1, y, size: 8.5, font: helvBold, color: COL.textLight });
    cx1 += helvBold.widthOfTextAtSize(f1.eng, 8.5);
    if (f1.dev) {
      page.drawText(' / ', { x: cx1, y, size: 8.5, font: helv, color: COL.textLight });
      cx1 += helv.widthOfTextAtSize(' / ', 8.5);
      page.drawText(f1.dev + ':', { x: cx1, y, size: 8.5, font: devFont, color: COL.textLight });
    }
    drawMixedValue(c1 + labelW, y, f1.val);

    let cx2 = c2;
    page.drawText(f2.eng, { x: cx2, y, size: 8.5, font: helvBold, color: COL.textLight });
    cx2 += helvBold.widthOfTextAtSize(f2.eng, 8.5);
    if (f2.dev) {
      page.drawText(' / ', { x: cx2, y, size: 8.5, font: helv, color: COL.textLight });
      cx2 += helv.widthOfTextAtSize(' / ', 8.5);
      page.drawText(f2.dev + ':', { x: cx2, y, size: 8.5, font: devFont, color: COL.textLight });
    }
    drawMixedValue(c2 + labelW, y, f2.val);
    y -= 13;
  }

  y -= 3;
  drawSectionDivider(page, y, devFont);
  y -= 12;

  // ── Graha Positions Table ──
  y = drawBilingualHeader(page, y, '\u0917\u094D\u0930\u0939 \u0938\u094D\u0925\u093F\u0924\u093F', 'Graha Sthiti (Planetary Positions)', devBold, helvBold);

  const tc = [
    { label: 'Graha', x: INNER_MARGIN + 20 },
    { label: 'Rashi', x: INNER_MARGIN + 115 },
    { label: 'Degrees', x: INNER_MARGIN + 220 },
    { label: 'Nakshatra', x: INNER_MARGIN + 310 },
    { label: 'Pada', x: INNER_MARGIN + 430 },
  ];

  // Header row (dark background)
  page.drawRectangle({ x: INNER_MARGIN + 15, y: y - 2, width: PAGE_W - 2 * INNER_MARGIN - 30, height: 13, color: COL.border });
  for (const col of tc) {
    page.drawText(col.label, { x: col.x, y, size: 8.5, font: helvBold, color: COL.white });
  }
  y -= 14;

  // Data rows
  for (let i = 0; i < tekni.grahas.length; i++) {
    const g = tekni.grahas[i];
    if (i % 2 === 0) {
      page.drawRectangle({ x: INNER_MARGIN + 15, y: y - 2, width: PAGE_W - 2 * INNER_MARGIN - 30, height: 12, color: COL.parchDark });
    }
    const gd = GRAHA_DEV[g.name] || '';
    const rd = RASHI_DEV[g.rashi] || '';
    const retro = g.isRetro ? ' (R)' : '';
    // Planet name: English part + Devanagari part separately
    page.drawText(`${g.name}${retro} / `, { x: tc[0].x, y, size: 8.5, font: timesRoman, color: COL.text });
    if (gd) {
      const engW = timesRoman.widthOfTextAtSize(`${g.name}${retro} / `, 8.5);
      page.drawText(gd, { x: tc[0].x + engW, y, size: 8.5, font: devFont, color: COL.text });
    }
    // Rashi: English part + Devanagari part separately
    page.drawText(`${g.rashi} / `, { x: tc[1].x, y, size: 8.5, font: timesRoman, color: COL.text });
    if (rd) {
      const rashiEngW = timesRoman.widthOfTextAtSize(`${g.rashi} / `, 8.5);
      page.drawText(rd, { x: tc[1].x + rashiEngW, y, size: 8.5, font: devFont, color: COL.text });
    }
    page.drawText(formatDeg(g.degrees), { x: tc[2].x, y, size: 8.5, font: courier, color: COL.textLight });
    page.drawText(g.nakshatra, { x: tc[3].x, y, size: 8.5, font: timesRoman, color: COL.text });
    page.drawText(String(g.pada), { x: tc[4].x, y, size: 8.5, font: timesRoman, color: COL.text });
    y -= 12;
  }

  y -= 5;
  drawSectionDivider(page, y, devFont);
  y -= 12;

  // ── QR Code + TakniCode ──
  const takniCode = encodeTakniCode(tekni.birth);
  const qrUrl = buildTakniQRUrl(takniCode, tekni.birth.name);
  const qrDataUrl = await QRCode.toDataURL(qrUrl, {
    width: 100, margin: 1,
    color: { dark: '#3D2B1F', light: '#F5E6C800' },
    errorCorrectionLevel: 'M',
  });
  const qrPng = await doc.embedPng(dataUrlToBytes(qrDataUrl));
  const qS = 65;

  page.drawImage(qrPng, { x: INNER_MARGIN + 20, y: y - qS, width: qS, height: qS });

  const qx = INNER_MARGIN + 20 + qS + 12;
  page.drawText('TakniCode\u2122', { x: qx, y: y - 2, size: 9, font: helvBold, color: COL.textLight });
  page.drawText(takniCode, { x: qx, y: y - 16, size: 13, font: courier, color: COL.border });
  page.drawText('Scan QR with Janthari app to instantly regenerate this Takni', { x: qx, y: y - 30, size: 7.5, font: helv, color: COL.textLight });

  const samvatDev = '\u0938\u092A\u094D\u0924\u0930\u094D\u0937\u093F \u0938\u0902\u0935\u0924\u094D ' + tekni.saptarshiYear;
  page.drawText(samvatDev, { x: qx, y: y - 44, size: 9, font: devFont, color: COL.gold });
  page.drawText(`Saptarishi Samvat ${tekni.saptarshiYear}`, { x: qx, y: y - 55, size: 8, font: helv, color: COL.gold });

  // ── Footer ──
  const fy = MARGIN + 12;
  const closing = '\u0936\u0941\u092D\u0902 \u092D\u0935\u0924\u0941';
  const clW = devFont.widthOfTextAtSize(closing, 10);
  page.drawText(closing, { x: (PAGE_W - clW) / 2, y: fy + 12, size: 10, font: devFont, color: COL.vermillion });

  const footer = 'Generated by Janthari \u2022 www.janthari.com';
  const fW = helv.widthOfTextAtSize(footer, 7);
  page.drawText(footer, { x: (PAGE_W - fW) / 2, y: fy, size: 7, font: helv, color: COL.textLight });

  return doc.save();
}

// ── Utilities ───────────────────────────────────────────────────────────

function formatDate(y: number, m: number, d: number): string {
  const mn = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  return `${mn[m - 1]} ${d}, ${y}`;
}

function formatTime(h: number, m: number): string {
  const ap = h >= 12 ? 'PM' : 'AM';
  const hr = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${hr}:${String(m).padStart(2, '0')} ${ap}`;
}

function formatDeg(deg: number): string {
  const d = deg % 30;
  const dd = Math.floor(d);
  const mm = Math.floor((d - dd) * 60);
  const ss = Math.floor(((d - dd) * 60 - mm) * 60);
  return `${String(dd).padStart(2, ' ')}\u00B0 ${String(mm).padStart(2, '0')}' ${String(ss).padStart(2, '0')}"`;
}

function dataUrlToBytes(dataUrl: string): Uint8Array {
  const b64 = dataUrl.split(',')[1];
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}