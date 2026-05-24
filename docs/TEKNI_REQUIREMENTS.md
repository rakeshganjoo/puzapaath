# Tekni Making — Functional Requirements

> **Feature Tile:** Tekni Making  
> **App:** Janthari (जंथ्री)  
> **Status:** Partially Implemented  
> **Last Updated:** March 19, 2026

---

## 1. What is Tekni?

**Tekni** (टेकनी) is the Kashmiri Pandit term for a **Janam Kundali** (birth horoscope). It is a detailed astrological birth chart prepared for every individual in the KP community, primarily used for:

- Recording a person's planetary positions at the exact moment of birth
- **Marriage compatibility matching** (Tekni Milaan) between prospective bride and groom
- Identifying auspicious and inauspicious periods in life (Dasha analysis)
- Checking for doshas (Manglik, Nadi, etc.)

Traditionally, the family **Jyotishi** (astrologer) prepares the Tekni on a special paper. Both families exchange Teknis before proceeding with marriage discussions.

---

## 2. Inputs Required

The user must provide the following to generate a Tekni:

| # | Input | Type | Required | Notes |
|---|-------|------|----------|-------|
| 1 | **Full Name** | Text | Yes | Person's name (for display on chart) |
| 2 | **Date of Birth** | Date picker | Yes | Gregorian date |
| 3 | **Exact Time of Birth** | Time picker (HH:MM) | Yes | Lagna changes every ~2 hours; accuracy is critical |
| 4 | **Place of Birth** | Location search | Yes | Must resolve to latitude + longitude |
| 5 | **Latitude** | Decimal degrees | Auto-filled | From place selection, or manual entry |
| 6 | **Longitude** | Decimal degrees | Auto-filled | From place selection, or manual entry |
| 7 | **Gender** | Male / Female | Yes | Used in matching logic |

### Place of Birth — Special Handling
- Provide a searchable list of **major KP-relevant cities**: Srinagar, Jammu, Delhi, Mumbai, Bangalore, Pune, Lucknow, etc.
- Allow **manual lat/long entry** for births in small villages (e.g., many KPs born in Kashmir valley villages)
- Default: Srinagar (34.0837°N, 74.7973°E)

## 2.1 Current Delivery Status

The current app already supports these Tekni capabilities:

- Birth-data form entry for name, DOB, TOB, place, coordinates, and gender
- Astronomical Tekni computation via `TekniService`
- Tekni preview rendering on web
- TakniCode generation and QR embedding in HTML/PDF output

The following are not yet implemented in the app and remain roadmap items:

- Save Tekni records locally under a user-chosen unique name
- Limit saved Teknis to a maximum of 6 per user/profile
- Reopen a previously saved Tekni without recomputing the full form manually
- Regenerate a Tekni from a saved TakniCode / QR deep link inside the app
- Edit or delete saved Teknis
- Replace an old saved Tekni with a newly generated one when the user chooses

---

## 3. Core Calculations

### 3.1 Astronomical Computations

From the birth date, time, and place, compute:

| Calculation | Description |
|-------------|-------------|
| **Local Sidereal Time (LST)** | Sidereal time at birth place — derived from UT + longitude correction |
| **Ayanamsa** | Tropical-to-Sidereal correction. Use **Lahiri Ayanamsa** (standard for Indian/KP astrology) |
| **9 Graha Positions** | Sidereal longitude of: Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn, Rahu, Ketu |
| **Lagna (Ascendant)** | Rising sign on eastern horizon at birth — depends on time + place |
| **Moon Sign (Rashi)** | Zodiac sign where Moon is placed — primary identifier in Vedic astrology |
| **Nakshatra** | Moon's exact star position (1 of 27 nakshatras), including **Pada** (quarter, 1–4) |
| **Nadi** | Derived from Nakshatra — Aadi, Madhya, or Antya (critical for matching) |

### 3.2 The 12 Rashis (Zodiac Signs)

| # | Sanskrit | English | Symbol | Lord |
|---|----------|---------|--------|------|
| 1 | Mesha | Aries | ♈ | Mars |
| 2 | Vrishabha | Taurus | ♉ | Venus |
| 3 | Mithuna | Gemini | ♊ | Mercury |
| 4 | Karka | Cancer | ♋ | Moon |
| 5 | Simha | Leo | ♌ | Sun |
| 6 | Kanya | Virgo | ♍ | Mercury |
| 7 | Tula | Libra | ♎ | Venus |
| 8 | Vrischika | Scorpio | ♏ | Mars |
| 9 | Dhanu | Sagittarius | ♐ | Jupiter |
| 10 | Makara | Capricorn | ♑ | Saturn |
| 11 | Kumbha | Aquarius | ♒ | Saturn |
| 12 | Meena | Pisces | ♓ | Jupiter |

### 3.3 The 27 Nakshatras

| # | Nakshatra | Lord | Nadi |
|---|-----------|------|------|
| 1 | Ashwini | Ketu | Aadi |
| 2 | Bharani | Venus | Madhya |
| 3 | Krittika | Sun | Antya |
| 4 | Rohini | Moon | Antya |
| 5 | Mrigashirsha | Mars | Madhya |
| 6 | Ardra | Rahu | Aadi |
| 7 | Punarvasu | Jupiter | Aadi |
| 8 | Pushya | Saturn | Madhya |
| 9 | Ashlesha | Mercury | Antya |
| 10 | Magha | Ketu | Antya |
| 11 | Purva Phalguni | Venus | Madhya |
| 12 | Uttara Phalguni | Sun | Aadi |
| 13 | Hasta | Moon | Aadi |
| 14 | Chitra | Mars | Madhya |
| 15 | Swati | Rahu | Antya |
| 16 | Vishakha | Jupiter | Antya |
| 17 | Anuradha | Saturn | Madhya |
| 18 | Jyeshtha | Mercury | Aadi |
| 19 | Moola | Ketu | Aadi |
| 20 | Purva Ashadha | Venus | Madhya |
| 21 | Uttara Ashadha | Sun | Antya |
| 22 | Shravana | Moon | Antya |
| 23 | Dhanishta | Mars | Madhya |
| 24 | Shatabhisha | Rahu | Aadi |
| 25 | Purva Bhadrapada | Jupiter | Aadi |
| 26 | Uttara Bhadrapada | Saturn | Madhya |
| 27 | Revati | Mercury | Antya |

### 3.4 The 12 Bhavas (Houses)

Each house governs specific life areas. Grahas placed in these houses influence those areas.

| House | Name | Governs |
|-------|------|---------|
| 1st | Lagna / Tanu Bhava | Self, personality, physical body, health, appearance |
| 2nd | Dhana Bhava | Wealth, family, speech, food habits, right eye |
| 3rd | Sahaja Bhava | Siblings, courage, communication, short travels |
| 4th | Sukha Bhava | Mother, home, land, vehicles, mental peace, education |
| 5th | Putra Bhava | Children, intellect, creativity, past-life merit, romance |
| 6th | Ripu Bhava | Enemies, disease, debt, daily work, service |
| 7th | Kalatra Bhava | **Marriage**, spouse, partnerships, business associates |
| 8th | Ayu Bhava | Longevity, sudden events, inheritance, hidden things, in-laws |
| 9th | Dharma Bhava | Fortune, father, dharma, guru, long-distance travel, higher learning |
| 10th | Karma Bhava | Career, status, reputation, authority, karma |
| 11th | Labha Bhava | Gains, income, elder siblings, social network, fulfillment of desires |
| 12th | Vyaya Bhava | Loss, expenditure, foreign travel, moksha, isolation, bed pleasures |

### 3.5 Graha (Planet) Characteristics

| Graha | Sanskrit | Nature | Owns Rashis | Exalted In | Debilitated In |
|-------|----------|--------|-------------|------------|----------------|
| Sun | Surya | Malefic | Simha | Mesha | Tula |
| Moon | Chandra | Benefic | Karka | Vrishabha | Vrischika |
| Mars | Mangal | Malefic | Mesha, Vrischika | Makara | Karka |
| Mercury | Budha | Neutral | Mithuna, Kanya | Kanya | Meena |
| Jupiter | Guru | Benefic | Dhanu, Meena | Karka | Makara |
| Venus | Shukra | Benefic | Vrishabha, Tula | Meena | Kanya |
| Saturn | Shani | Malefic | Makara, Kumbha | Tula | Mesha |
| Rahu | — | Malefic | (Shadow) | Vrishabha* | Vrischika* |
| Ketu | — | Malefic | (Shadow) | Vrischika* | Vrishabha* |

*\* Rahu/Ketu exaltation is debated; these are commonly accepted values.*

---

## 4. Tekni Chart Display

### 4.1 Chart Format — North Indian Style (Diamond)

KPs traditionally use the **North Indian chart format** where the 12 houses are arranged in a diamond pattern:

```
         ┌─────┬─────┐
         │ 12  │  1  │
    ┌────┤     │     ├────┐
    │ 11 │     │     │  2 │
    ├────┘     └─────┘    ├
    │ 10                3 │
    ├────┐     ┌─────┐    ├
    │  9 │     │     │  4 │
    └────┤     │     ├────┘
         │  8  │  5  │
         ├─────┼─────┤
         │  7  │  6  │
         └─────┴─────┘
```

- **Lagna (1st house)** is always at the top-center
- Grahas are placed in their respective houses using standard abbreviations:
  - Su (Sun), Mo (Moon), Ma (Mars), Me (Mercury), Ju (Jupiter), Ve (Venus), Sa (Saturn), Ra (Rahu), Ke (Ketu)
- Houses rotate based on the Lagna sign

### 4.2 Information Panel (alongside the chart)

Display the following summary:

| Field | Example |
|-------|---------|
| Name | Rakesh Ganjoo |
| Date of Birth | January 15, 1975 |
| Time of Birth | 05:30 AM |
| Place of Birth | Srinagar, J&K |
| Lagna (Ascendant) | Dhanu (Sagittarius) |
| Rashi (Moon Sign) | Karka (Cancer) |
| Nakshatra | Pushya, Pada 2 |
| Nadi | Madhya |
| Varna | Brahmin |
| Yoni | Mesha (Goat) |
| Gana | Deva |

## 4.3 Saved Tekni Vault

The app should provide a local-first saved Tekni vault with the following behavior:

| Requirement | Rule |
|-------------|------|
| Maximum saved Teknis | 6 per active profile |
| Saved identity | Each Tekni must have a unique user-chosen name |
| Storage model | Save both the Tekni birth inputs and the computed output needed for quick reopen |
| Regeneration | User can regenerate the same Tekni from saved record, TakniCode, or QR deep link |
| Edit | User can rename or update saved birth details and regenerate |
| Delete | User can remove any saved Tekni |
| Replacement | If limit is reached, app should require delete/replace before saving another |

### Saved Tekni Vault UX

- Show a "My Teknis" list from the Tekni entry flow and result flow
- Allow "Save Tekni" after generation
- Require a unique display name before saving
- Show the TakniCode alongside each saved Tekni
- Provide actions: Open, Rename/Edit, Delete, Share/Export
- If a QR code or TakniCode is opened, route into the app and reconstruct the Tekni from encoded birth data

### Validation Rules

- Names are required and must be unique within the 6-item vault
- Save is blocked once 6 Teknis already exist unless the user deletes or replaces one
- Editing a Tekni must preserve its identity while allowing renamed metadata
- Regenerated Tekni must match the original encoded birth parameters

---

## 5. Ashtakoot Guna Milan (Marriage Compatibility)

### 5.1 Overview

When matching two Teknis (boy + girl), the **Ashtakoot system** evaluates compatibility across 8 dimensions totaling **36 gunas (points)**.

**Threshold:**
- **< 18 gunas** — Not recommended
- **18–24 gunas** — Acceptable match
- **24–32 gunas** — Good match
- **32–36 gunas** — Excellent match

### 5.2 The 8 Kootas

#### 1. Varna (वर्ण) — 1 Point
Spiritual/ego compatibility. Based on Rashi.

| Rashi | Varna |
|-------|-------|
| Karka, Vrischika, Meena | Brahmin (4) |
| Mesha, Simha, Dhanu | Kshatriya (3) |
| Vrishabha, Kanya, Makara | Vaishya (2) |
| Mithuna, Tula, Kumbha | Shudra (1) |

**Rule:** Boy's varna ≥ Girl's varna → 1 point. Otherwise → 0.

#### 2. Vashya (वश्य) — 2 Points
Mutual attraction and dominance.

| Category | Rashis |
|----------|--------|
| Chatushpada (4-legged) | Mesha, Vrishabha, 2nd half Dhanu, 1st half Makara |
| Manava (Human) | Mithuna, Kanya, Tula, 1st half Dhanu, Kumbha |
| Jalachara (Water) | Karka, Meena, 2nd half Makara |
| Vanachara (Wild) | Simha |
| Keeta (Insect) | Vrischika |

**Scoring:**
- Same category → 2 points
- One is food of other → 0 points
- Vashya of each other → 2 points
- One is Vashya → 1 point
- No relationship → 0.5 points

#### 3. Tara / Dina (तारा) — 3 Points
Destiny compatibility based on birth nakshatras.

**Method:**
1. Count from girl's Nakshatra to boy's Nakshatra (inclusive)
2. Divide by 9, note the remainder (R)
3. If R = 0, result = 9

| Remainder | Tara | Auspicious? |
|-----------|------|-------------|
| 1 | Janma | Inauspicious |
| 2 | Sampat | Auspicious |
| 3 | Vipat | Inauspicious |
| 4 | Kshema | Auspicious |
| 5 | Pratyari | Inauspicious |
| 6 | Saadhaka | Auspicious |
| 7 | Vadha | Inauspicious |
| 8 | Mitra | Auspicious |
| 9 | Ati-Mitra | Auspicious |

**Scoring:**
- Both directions auspicious → 3 points
- One direction auspicious → 1.5 points
- Both inauspicious → 0 points

#### 4. Yoni (योनि) — 4 Points
Physical and temperamental compatibility. Each Nakshatra has an animal type and gender.

| Nakshatra | Yoni (Animal) | Gender |
|-----------|---------------|--------|
| Ashwini | Horse | Male |
| Bharani | Elephant | Male |
| Krittika | Goat | Female |
| Rohini | Serpent | Male |
| Mrigashirsha | Serpent | Female |
| Ardra | Dog | Female |
| Punarvasu | Cat | Female |
| Pushya | Goat | Male |
| Ashlesha | Cat | Male |
| Magha | Rat | Male |
| Purva Phalguni | Rat | Female |
| Uttara Phalguni | Cow | Male |
| Hasta | Buffalo | Female |
| Chitra | Tiger | Female |
| Swati | Buffalo | Male |
| Vishakha | Tiger | Male |
| Anuradha | Deer | Female |
| Jyeshtha | Deer | Male |
| Moola | Dog | Male |
| Purva Ashadha | Monkey | Male |
| Uttara Ashadha | Mongoose | Male |
| Shravana | Monkey | Female |
| Dhanishta | Lion | Female |
| Shatabhisha | Horse | Female |
| Purva Bhadrapada | Lion | Male |
| Uttara Bhadrapada | Cow | Female |
| Revati | Elephant | Female |

**Scoring:**
- Same animal, opposite gender → 4 points
- Same animal, same gender → 2 points
- Friendly animals → 3 points
- Neutral animals → 2 points
- Enemy animals → 1 point
- Bitter enemies → 0 points

**Enemy Pairs:** Horse–Buffalo, Elephant–Lion, Goat–Monkey, Serpent–Mongoose, Dog–Deer, Cat–Rat, Cow–Tiger

#### 5. Graha Maitri / Rasyadhipati (ग्रह मैत्री) — 5 Points
Mental and intellectual compatibility based on the friendship between the lords of boy's and girl's Moon signs.

**Planetary Friendship Table:**

| Planet | Friends | Neutrals | Enemies |
|--------|---------|----------|---------|
| Sun | Moon, Mars, Jupiter | Mercury | Venus, Saturn |
| Moon | Sun, Mercury | Mars, Jupiter, Venus, Saturn | — |
| Mars | Sun, Moon, Jupiter | Venus, Saturn | Mercury |
| Mercury | Sun, Venus | Mars, Jupiter, Saturn | Moon |
| Jupiter | Sun, Moon, Mars | Saturn | Mercury, Venus |
| Venus | Mercury, Saturn | Mars, Jupiter | Sun, Moon |
| Saturn | Mercury, Venus | Jupiter | Sun, Moon, Mars |

**Scoring:**
- Both lords are friends → 5 points
- One friend, one neutral → 4 points
- Both neutral → 3 points
- One friend, one enemy → 1 point
- One neutral, one enemy → 0.5 points
- Both enemies → 0 points

#### 6. Gana (गण) — 6 Points
Temperament and nature compatibility.

| Gana | Nakshatras |
|------|------------|
| **Deva** (Divine) | Ashwini, Mrigashirsha, Punarvasu, Pushya, Hasta, Swati, Anuradha, Shravana, Revati |
| **Manushya** (Human) | Bharani, Rohini, Ardra, Purva Phalguni, Uttara Phalguni, Purva Ashadha, Uttara Ashadha, Purva Bhadrapada, Uttara Bhadrapada |
| **Rakshasa** (Demon) | Krittika, Ashlesha, Magha, Chitra, Vishakha, Jyeshtha, Moola, Dhanishta, Shatabhisha |

**Scoring:**

| Boy \ Girl | Deva | Manushya | Rakshasa |
|------------|------|----------|----------|
| **Deva** | 6 | 5 | 1 |
| **Manushya** | 5 | 6 | 0 |
| **Rakshasa** | 1 | 0 | 6 |

#### 7. Bhakoot (भकूट) — 7 Points
Emotional and family compatibility based on relative position of Moon signs.

**Inauspicious combinations (0 points):**
- 2/12 (Dwidwadash)
- 6/8 (Shadashtak)
- 5/9 (Nava Pancham) — *some traditions consider this auspicious*

**All other combinations → 7 points.**

Count the position of boy's rashi from girl's rashi and vice versa.

#### 8. Nadi (नाड़ी) — 8 Points ⚠️ MOST IMPORTANT

Nadi represents health, genetic compatibility, and progeny. **This is the single most critical factor in KP tradition.**

**Three Nadis** (derived from Nakshatra — see Section 3.3):
- **Aadi** (आदि) — Vata (wind)
- **Madhya** (मध्य) — Pitta (bile)
- **Antya** (अंत्य) — Kapha (phlegm)

**Scoring:**
- Different Nadi → **8 points**
- Same Nadi → **0 points** ⚠️ **Nadi Dosha**

**Nadi Dosha is the strongest rejection criterion in KP tradition.** If both boy and girl have the same Nadi, the match is generally rejected regardless of total guna score.

### 5.3 Dosha Checks (Beyond Guna Score)

#### Manglik Dosha (Mangal Dosha)
Mars in **1st, 4th, 7th, 8th, or 12th house** from Lagna.

- If one person is Manglik and other is not → significant concern
- If both are Manglik → cancels out
- **Cancellation conditions:** Mars in own sign, Mars aspected by Jupiter, Mars in specific signs in those houses

#### Nadi Dosha (covered in Koota 8)
- Same Nadi = Dosha
- **Exception/Cancellation:** If both have same Nakshatra but different Rashi, or same Rashi but different Nakshatra — some traditions allow Nadi Dosha cancellation

#### Bhakoot Dosha
- 2/12, 6/8 combinations
- **Cancellation:** If the lords of both rashis are friends or the same planet

---

## 6. Feature Screens & User Flow

### Screen 1: Tekni Input Form
```
┌──────────────────────────────┐
│  💍 Tekni Making             │
│                              │
│  Full Name: [____________]   │
│  Date of Birth: [DD/MM/YYYY] │
│  Time of Birth: [HH:MM AM]  │
│  Place of Birth: [Search...] │
│    Lat: [auto]  Long: [auto] │
│  Gender: (●) Male (○) Female │
│                              │
│  [ Generate Tekni ]          │
└──────────────────────────────┘
```

### Screen 2: Tekni Chart View
```
┌──────────────────────────────┐
│  Rakesh Ganjoo               │
│  Jan 15, 1975 • 05:30 AM    │
│  Srinagar, J&K               │
│                              │
│  ┌───────────────────────┐   │
│  │   North Indian Chart  │   │
│  │   (Diamond Layout)    │   │
│  │   with Graha labels   │   │
│  └───────────────────────┘   │
│                              │
│  Lagna: Dhanu   Rashi: Karka │
│  Nakshatra: Pushya (Pada 2)  │
│  Nadi: Madhya   Gana: Deva   │
│                              │
│  [ Match Tekni ] [ Save ]    │
│  [ Share as Image ]          │
└──────────────────────────────┘
```

### Screen 3: Tekni Milaan (Match)
```
┌──────────────────────────────┐
│  💍 Tekni Milaan             │
│                              │
│  Boy: Rakesh    Girl: Sunita │
│                              │
│  Varna:       ■□  1/1       │
│  Vashya:      ■■  2/2       │
│  Tara:        ■□□ 1.5/3     │
│  Yoni:        ■■■□ 3/4      │
│  Graha Maitri:■■■■□ 4/5     │
│  Gana:        ■■■■■■ 6/6    │
│  Bhakoot:     ■■■■■■■ 7/7   │
│  Nadi:        ■■■■■■■■ 8/8  │
│                              │
│  Total: 32.5 / 36           │
│  ✅ Excellent Match          │
│                              │
│  Doshas:                     │
│  ✅ No Nadi Dosha            │
│  ⚠️ Boy is Manglik          │
│                              │
│  [ Share Report ]            │
└──────────────────────────────┘
```

### Screen 4: Saved Teknis
- List of previously generated Teknis
- Tap to view or use in matching
- Delete/edit capability

---

## 7. Technical Approach

### 7.1 Astronomy Library
- Use **Swiss Ephemeris** (`swisseph` npm package) or **astronomy-engine** for precise planetary position calculations
- Pre-computed Ayanamsa tables (Lahiri) for sidereal correction
- All calculations must work **offline** — no API dependency

### 7.2 Data Tables (Pure Lookup)
- Nakshatra → Nadi mapping (27 entries)
- Nakshatra → Yoni mapping (27 entries)
- Nakshatra → Gana mapping (27 entries)
- Rashi → Varna mapping (12 entries)
- Rashi → Vashya mapping (12 entries)
- Planetary friendship matrix (7×7)
- Yoni enemy/friend matrix (14×14)

### 7.3 Storage
- Save Teknis locally using **AsyncStorage** (React Native)
- Each Tekni stored as JSON with all computed values
- Share as rendered image (screenshot of chart view)

### 7.4 Platform Considerations
- **Web (desktop):** Chart renders in full width, side-by-side panels
- **Mobile (iPhone/Android):** Chart stacked vertically, scrollable
- All image/chart rendering uses fixed-pixel SVG or canvas — no percentage-based layout
- Touch-friendly inputs with native date/time pickers

---

## 8. Validation & Accuracy

### 8.1 Test Cases
- Verify planetary positions against known Kundali software (Jagannatha Hora, Kundli Pro)
- Test with at least 10 known birth charts where positions are independently verified
- Validate Guna matching against manually computed results from a KP Jyotishi

### 8.2 Known Constraints
- Ephemeris accuracy: planetary positions accurate to ~1 arc-minute (sufficient for Rashi/Nakshatra determination)
- Birth time ambiguity: 4-minute error in birth time = ~1° Lagna shift (warn user about importance of exact time)
- Ayanamsa: Lahiri is default; consider option for Krishnamurti or Raman in future

---

## 9. Phase Plan

| Phase | Scope | Depends On |
|-------|-------|------------|
| **Phase 1** | Guna matching engine (pure logic) — all 8 Kootas + Dosha checks. Input: two sets of Nakshatra/Rashi. No astronomy needed. | Lookup tables only |
| **Phase 2** | Birth chart calculation — given DOB/time/place, compute all 9 Graha positions, Lagna, Rashi, Nakshatra | Astronomy library |
| **Phase 3** | North Indian chart rendering (SVG/Canvas diamond layout) | Phase 2 |
| **Phase 4** | Full UI — input form, chart display, matching screen, save/share | Phases 1–3 |
| **Phase 5** | Advanced — Dasha periods, transit predictions, PDF export | Phase 4 |

---

## 10. Glossary

| Term | Meaning |
|------|---------|
| **Tekni** | KP term for Janam Kundali (birth chart) |
| **Tekni Milaan** | Matching two Teknis for marriage compatibility |
| **Graha** | Planet (9 in Vedic astrology including Rahu/Ketu) |
| **Rashi** | Zodiac sign (12 total) |
| **Nakshatra** | Lunar mansion / birth star (27 total) |
| **Pada** | Quarter of a Nakshatra (4 padas per Nakshatra) |
| **Lagna** | Ascendant — zodiac sign rising at birth |
| **Bhava** | House (12 in a chart) |
| **Guna** | Point/quality in the Ashtakoot matching system |
| **Dosha** | Astrological defect/flaw |
| **Ayanamsa** | Angular difference between tropical and sidereal zodiacs |
| **Purnimant** | Full-moon based calendar system used by KPs |
| **Jyotishi** | Astrologer |
| **Manglik** | Person with Mars in 1st/4th/7th/8th/12th house |
| **Nadi** | One of three constitutional types (Aadi/Madhya/Antya) |
