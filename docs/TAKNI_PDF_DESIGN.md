# Takni PDF Design — Traditional Birth Chart Document

> **Feature:** Tekni → Takni PDF Export  
> **App:** Janthari (जंथ्री)  
> **Created:** March 20, 2026

---

## 1. What is Takni?

**Takni** is the physical/printable form of a **Tekni** (birth horoscope). Traditionally, a Pandit Ji writes this on special paper with traditional symbols, borders, and sacred markings. Our digital Takni replicates this experience as a downloadable PDF.

---

## 2. Takni Unique ID — TakniCode™

### 2.1 Design Philosophy

Every Takni must have a **globally unique identifier** that:
- Uniquely identifies a person among billions
- Can regenerate the entire Takni without any stored data
- Is compact enough for a barcode/QR code
- Is human-readable in parts

### 2.2 Encoding Scheme

A Takni is fully determined by **5 birth parameters**:
1. Date of birth (year, month, day)
2. Time of birth (hour, minute) 
3. Place of birth (latitude, longitude)
4. Gender
5. Name (for display only — not part of astrological calculation)

**TakniCode format:** `JT-{birthData}-{locationData}-{gender}-{nameHash}`

#### Bit-level encoding (compact binary → Base32):

| Field | Bits | Range | Notes |
|-------|------|-------|-------|
| Year | 11 | 0–2047 (1900–3947) | year - 1900 |
| Month | 4 | 1–12 | |
| Day | 5 | 1–31 | |
| Hour | 5 | 0–23 | |
| Minute | 6 | 0–59 | |
| Latitude | 17 | -90.000 to +90.000 | (lat + 90) × 1000, unsigned int |
| Longitude | 18 | -180.000 to +180.000 | (lon + 180) × 1000, unsigned int |
| Gender | 1 | 0=Male, 1=Female | |
| Name CRC | 16 | 0–65535 | CRC-16 of UTF-8 name (for display verification) |
| **Total** | **83 bits** | | ~11 bytes |

**Encoding:** 83 bits → 17 Base32 characters (5 bits each)

**Full TakniCode:** `JT-XXXXX-XXXXX-XXXXX-XX` (17 chars in groups of 5-5-5-2)  
With `JT-` prefix: 22 characters total.

### 2.3 Examples

```
Birth: Jan 15, 1975, 05:30 AM, Srinagar (34.084°N, 74.797°E), Male, "Rakesh"
→ JT-A7F3K-NP82M-Q4D6R-BW
```

### 2.4 QR Code

The TakniCode is embedded as a **QR code** on the PDF. Scanning it with Janthari app instantly regenerates the full Takni. The QR contains:

```
janthari://takni/{TakniCode}/{URLEncodedName}
```

Example: `janthari://takni/JT-A7F3K-NP82M-Q4D6R-BW/Rakesh%20Ganjoo`

This allows:
- **Without stored data:** Recalculate all planetary positions from birth params
- **Name included:** Display name is part of the URL (not the astrological calc)
- **Billions of unique codes:** 2^83 = 9.67 × 10^24 possible combinations

---

## 3. PDF Template Design

### 3.1 Page Layout (A4 Portrait: 210mm × 297mm)

```
┌──────────────────────────────────────────┐
│  ┌──── Decorative Border (kashmir) ────┐ │
│  │                                     │ │
│  │  ☸ श्री गणेशाय नमः ☸              │ │ ← Header with sacred invocation
│  │  ═══════════════════════════════    │ │
│  │                                     │ │
│  │  ┌─────────────────────────────┐   │ │
│  │  │ NORTH INDIAN KUNDALI CHART │   │ │ ← Diamond chart (centered)
│  │  │     (Diamond Layout)        │   │ │
│  │  │     with planet glyphs      │   │ │
│  │  └─────────────────────────────┘   │ │
│  │                                     │ │
│  │  ─── Birth Details Panel ─────     │ │
│  │  Name  DOB  TOB  POB               │ │
│  │  Lagna  Rashi  Nakshatra  Nadi     │ │
│  │                                     │ │
│  │  ─── Graha Positions Table ───     │ │
│  │  Planet | Sign | Degree | Naksh    │ │
│  │  Su Mo Ma Me Ju Ve Sa Ra Ke        │ │
│  │                                     │ │
│  │  ─── QR Code + TakniCode ────     │ │
│  │  [QR]  JT-XXXXX-XXXXX-XXXXX-XX    │ │
│  │                                     │ │
│  │  ☸ सप्तर्षि संवत् ५१०२ ☸          │ │ ← Footer with Saptarishi year
│  └─────────────────────────────────────┘ │
└──────────────────────────────────────────┘
```

### 3.2 Visual Elements — Traditional Symbols (NOT emojis)

We use **SVG glyphs** inspired by traditional Hindu/Vedic manuscript decorations:

| Element | Symbol | Usage |
|---------|--------|-------|
| Om | ॐ (Devanagari) | Top center of page |
| Swastika | 卐 (Unicode) | Corner decorations |
| Shri | श्री | Before auspicious text |
| Trishul | SVG trident | Section dividers |
| Padma (Lotus) | SVG | Border corners |
| Kalash | SVG | Top border center |
| Diya (Lamp) | SVG | Footer accents |
| Conch (Shankh) | SVG | Section markers |
| Chakra | SVG | Near the chart |

### 3.3 Color Palette — Aged Parchment

| Element | Color | Hex |
|---------|-------|-----|
| Paper background | Aged parchment cream | #F5E6C8 |
| Border | Dark maroon/burgundy | #8B1A1A |
| Text primary | Deep brown ink | #3D2B1F |
| Text secondary | Faded brown | #6B4E37 |
| Planet glyphs | Dark red | #A0522D |
| Chart lines | Maroon | #800020 |
| Gold accents | Old gold | #C5A55A |
| Sacred symbols | Vermillion red | #E34234 |

### 3.4 Typography

| Usage | Font | Style |
|-------|------|-------|
| Title/Sacred text | Devanagari serif (Noto Serif Devanagari) | Bold |
| Birth details | Roman serif (Noto Serif) | Regular |
| Planet data | Monospace (for alignment) | Regular |
| TakniCode | Monospace | Bold |

### 3.5 Border Design

The border is a **double-line frame with corner lotuses**:
- Outer border: thick maroon line (2pt)
- Inner border: thin gold line (0.5pt), 4mm inside outer
- Corner ornaments: lotus/padma SVG at each corner (rotated 0°/90°/180°/270°)
- Top center: Kalash ornament
- Bottom center: Om symbol

---

## 4. Implementation Plan

### 4.1 Technology Choice

**pdf-lib** (npm package) — Pure JavaScript PDF generation:
- Works in browser AND React Native
- No server required
- Can embed fonts, images, draw vectors
- Small bundle size (~200KB)

### 4.2 Asset Pipeline

1. **Create SVG ornaments once** → Convert to PDF paths
2. **Embed fonts** → Noto Serif Devanagari + Noto Serif (subset for size)
3. **Template function** → Takes computed Tekni data → Returns PDF bytes

### 4.3 Template Reuse

```typescript
// Called once at app startup or first use
const template = await loadTakniTemplate(); // fonts, borders, ornaments

// Called per Tekni generation
const pdfBytes = await generateTakniPDF(template, tekniData);
```

### 4.4 QR Code Generation

Use **qrcode** npm package to generate QR as PNG/SVG, embed into PDF.

---

## 5. File Deliverables

| File | Purpose |
|------|---------|
| `src/services/TakniEncoder.ts` | TakniCode encode/decode (birth params ↔ Base32 code) |
| `src/services/TakniPDFGenerator.ts` | PDF template + generation using pdf-lib |
| `src/assets/takni/` | SVG ornaments, font subsets, border elements |
| `src/screens/TekniScreen.tsx` | Input form + chart display + PDF download |
