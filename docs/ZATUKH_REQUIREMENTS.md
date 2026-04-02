# Zatukh (Full Horoscope) — Functional Requirements

> **Feature Tile:** Zatuk — Full Horoscope & Kundali  
> **App:** Janthari (जंथ्री)  
> **Status:** Coming Soon  
> **Last Updated:** March 19, 2026

---

## 1. What is Zatukh?

**Zatukh** (ज़ातूख) is the Kashmiri Pandit term for a **complete Janam Patri** (birth horoscope). The word derives from the Sanskrit **Jatak** (जातक — "one who is born"), which in Kashmiri pronunciation becomes Zatukh/Zatuk.

### Zatukh vs Tekni

| Aspect | Tekni (टेकनी) | Zatukh (ज़ातूख) |
|--------|---------------|-----------------|
| **Purpose** | Marriage matching (Guna Milan) | Complete life horoscope |
| **Scope** | Nakshatra, Rashi, 8 Kootas, Doshas | All 9 Grahas in 12 Houses, Dashas, Yogas, predictions |
| **Charts** | Lagna chart only | Lagna + Navamsa + Chandra + Dashamsa |
| **Output** | Score (out of 36) + compatibility report | Full life reading — career, health, marriage, wealth, spirituality |
| **When prepared** | Before marriage discussions | At birth (or any time for life guidance) |
| **Traditional form** | Single-page matching sheet | Multi-page bound document from Jyotishi |

In KP families, the Zatukh is typically prepared by the family Jyotishi shortly after a child's birth and kept for life. It's consulted for:
- Marriage (the Tekni is extracted from the Zatukh)
- Career decisions
- Timing of major events (Muhurat)
- Understanding health tendencies
- Dasha period awareness (good/bad phases)

---

## 2. Inputs Required

Same as Tekni (the Zatukh is generated from identical birth data):

| # | Input | Type | Required | Notes |
|---|-------|------|----------|-------|
| 1 | **Full Name** | Text | Yes | Displayed on the horoscope |
| 2 | **Date of Birth** | Date picker | Yes | Gregorian date |
| 3 | **Exact Time of Birth** | Time picker (HH:MM) | Yes | Critical for Lagna accuracy |
| 4 | **Place of Birth** | Location search | Yes | Resolves to Lat/Long |
| 5 | **Latitude** | Decimal degrees | Auto-filled | Manual override available |
| 6 | **Longitude** | Decimal degrees | Auto-filled | Manual override available |
| 7 | **Gender** | Male / Female | Yes | Affects some predictions |

---

## 3. Core Calculations

### 3.1 Fundamental Computations (shared with Tekni)

These are computed first and form the base of the Zatukh:

- **Ayanamsa** — Lahiri (default), with option for Krishnamurti
- **Lagna** (Ascendant) — rising sign at birth
- **9 Graha sidereal longitudes** — Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn, Rahu, Ketu
- **Rashi** (Moon Sign)
- **Nakshatra + Pada**
- **House placement** of each Graha in the 12 Bhavas

### 3.2 Multiple Charts (Kundalis)

A full Zatukh contains several charts, each offering different perspectives:

#### Chart 1: Lagna Kundali (Birth Chart) — PRIMARY
- The main chart. Houses are counted from the Ascendant sign.
- Shows where all 9 Grahas are placed at the moment of birth.
- This is the foundation of all analysis.

#### Chart 2: Chandra Kundali (Moon Chart)
- Same planetary positions, but houses are counted from the **Moon's sign** (Rashi).
- Shows the mind, emotions, and mental constitution.
- In KP tradition, Chandra Kundali is given significant weight — often equal to Lagna chart.

#### Chart 3: Navamsa Kundali (D-9 — Divisional Chart)
- The most important divisional chart.
- Each sign is divided into 9 parts (3°20' each). The Navamsa sign of each planet is plotted.
- **Primary use:** Marriage, spouse characteristics, spiritual destiny.
- Confirms or modifies the Lagna chart predictions.
- **Calculation:** For each Graha, take its sidereal longitude. The Navamsa sign is determined by which 3°20' division it falls in.

**Navamsa mapping:**

| Rashi | Navamsa starts from |
|-------|-------------------|
| Mesha, Simha, Dhanu (Fire) | Mesha |
| Vrishabha, Kanya, Makara (Earth) | Makara |
| Mithuna, Tula, Kumbha (Air) | Tula |
| Karka, Vrischika, Meena (Water) | Karka |

Each sign spans 30°. Divide into 9 parts of 3°20' each. The Navamsa sign cycles through the zodiac starting from the above starting sign.

#### Chart 4: Dashamsa Kundali (D-10 — Career Chart)
- Each sign divided into 10 parts (3° each).
- Specifically for **career, profession, and status** analysis.
- Optional but valuable for modern users.

### 3.3 Planetary Strengths — Shadbala (Six Strengths)

Each Graha's effectiveness depends on its strength. The **Shadbala** system measures 6 types:

| # | Bala (Strength) | What It Measures | Method |
|---|-----------------|------------------|--------|
| 1 | **Sthana Bala** (Positional) | Strength from sign placement — own sign, exaltation, friend's sign, etc. | Uchcha Bala + Saptavargaja Bala + Ojhayugma Bala + Kendra Bala + Drekkana Bala |
| 2 | **Dig Bala** (Directional) | Strength from house position — each planet is strongest in a specific house | Jupiter/Mercury strong in 1st, Sun/Mars in 10th, Moon/Venus in 4th, Saturn in 7th |
| 3 | **Kala Bala** (Temporal) | Strength from time — day/night birth, weekday lord, hora lord, year/month lords | Day birth benefits Sun/Jupiter/Venus; Night benefits Moon/Mars/Saturn |
| 4 | **Cheshta Bala** (Motional) | Strength from planetary speed — retrograde, direct, stationary | Retrograde planets gain Cheshta Bala (they appear brighter) |
| 5 | **Naisargika Bala** (Natural) | Inherent strength of each planet (fixed values) | Sun(60) > Moon(51.43) > Venus(42.86) > Jupiter(34.29) > Mercury(25.71) > Mars(17.14) > Saturn(8.57) |
| 6 | **Drik Bala** (Aspectual) | Strength from aspects received — benefic aspects strengthen, malefic weaken | Sum of benefic and malefic aspects on the planet |

**Total Shadbala** = Sum of all 6. Expressed in **Rupas** (1 Rupa = 60 Virupas).

**Minimum required Shadbala (in Rupas):**

| Planet | Minimum Rupas |
|--------|---------------|
| Sun | 6.5 |
| Moon | 6.0 |
| Mars | 5.0 |
| Mercury | 7.0 |
| Jupiter | 6.5 |
| Venus | 5.5 |
| Saturn | 5.0 |

If a planet's Shadbala is below its minimum, it is considered **weak** and its significations may suffer.

### 3.4 Vimshottari Dasha (Planetary Period System)

The **Vimshottari Dasha** is the primary predictive tool in Vedic astrology. It allocates a total cycle of **120 years** across 9 planetary periods based on the **birth Nakshatra**.

#### Dasha Sequence and Durations

| # | Dasha Lord | Duration (years) |
|---|------------|-------------------|
| 1 | Ketu | 7 |
| 2 | Venus (Shukra) | 20 |
| 3 | Sun (Surya) | 6 |
| 4 | Moon (Chandra) | 10 |
| 5 | Mars (Mangal) | 7 |
| 6 | Rahu | 18 |
| 7 | Jupiter (Guru) | 16 |
| 8 | Saturn (Shani) | 19 |
| 9 | Mercury (Budha) | 17 |
| | **Total** | **120 years** |

#### Determining the Starting Dasha

The birth Nakshatra's **lord** determines which Dasha is active at birth:

| Nakshatra | Dasha Lord |
|-----------|------------|
| Ashwini, Magha, Moola | Ketu |
| Bharani, Purva Phalguni, Purva Ashadha | Venus |
| Krittika, Uttara Phalguni, Uttara Ashadha | Sun |
| Rohini, Hasta, Shravana | Moon |
| Mrigashirsha, Chitra, Dhanishta | Mars |
| Ardra, Swati, Shatabhisha | Rahu |
| Punarvasu, Vishakha, Purva Bhadrapada | Jupiter |
| Pushya, Anuradha, Uttara Bhadrapada | Saturn |
| Ashlesha, Jyeshtha, Revati | Mercury |

#### Balance of Dasha at Birth

The Moon's position within the Nakshatra determines how much of the first Dasha remains:

```
Balance = (End of Nakshatra longitude - Moon's longitude) / (Nakshatra span of 13°20')
         × Total Dasha duration of that planet
```

**Example:** Moon at 10° Ashwini. Ashwini spans 0°–13°20'.
- Remaining = (13°20' - 10°) / 13°20' = 3°20' / 13°20' = 0.25
- Ketu Dasha balance = 0.25 × 7 years = 1 year 9 months

#### Sub-periods (Antardashas / Bhuktis)

Each Mahadasha is subdivided into 9 **Antardashas** (sub-periods) in the same sequence, proportional to total years:

```
Antardasha duration = (Mahadasha years × Antardasha lord years) / 120
```

**Example:** During Jupiter Mahadasha (16 years):
- Jupiter-Jupiter Antardasha = (16 × 16) / 120 = 2 years 1 month 18 days
- Jupiter-Saturn Antardasha = (16 × 19) / 120 = 2 years 6 months 12 days
- etc.

#### Further Subdivisions

| Level | Name | Division |
|-------|------|----------|
| 1 | Mahadasha | 9 periods = 120 years |
| 2 | Antardasha (Bhukti) | Each Mahadasha → 9 sub-periods |
| 3 | Pratyantardasha | Each Antardasha → 9 sub-sub-periods |
| 4 | Sookshma Dasha | Each Pratyantardasha → 9 (rarely used) |
| 5 | Prana Dasha | Each Sookshma → 9 (academic only) |

**For Janthari app:** Implement up to **Pratyantardasha** (Level 3). This gives date-level precision for predictions.

### 3.5 Yogas (Special Planetary Combinations)

Yogas are specific planetary configurations that produce notable results. Include the most significant ones:

#### Auspicious Yogas (Shubha Yogas)

| Yoga | Formation | Result |
|------|-----------|--------|
| **Gaja Kesari** | Jupiter in a Kendra (1/4/7/10) from Moon | Wisdom, fame, prosperity, long life |
| **Budha-Aditya** | Sun and Mercury in the same house | Intelligence, skilled communication, learning |
| **Chandra-Mangal** | Moon and Mars conjunct | Wealth through own effort, courage |
| **Lakshmi Yoga** | Venus in own/exalted sign in a Kendra/Trikona | Great wealth, luxury, beauty |
| **Hamsa Yoga** | Jupiter in own/exalted sign in a Kendra | Virtuous, learned, respected, spiritual |
| **Malavya Yoga** | Venus in own/exalted sign in a Kendra | Luxury, vehicles, refined arts, attractive spouse |
| **Sasa Yoga** | Saturn in own/exalted sign in a Kendra | Authority, power, leadership over people |
| **Ruchaka Yoga** | Mars in own/exalted sign in a Kendra | Brave, commanding, military/police success |
| **Bhadra Yoga** | Mercury in own/exalted sign in a Kendra | Eloquent, intellectual, business acumen |
| **Dhana Yoga** | Lords of 1st, 2nd, 5th, 9th, 11th connected | Wealth accumulation |
| **Raja Yoga** | Lords of Kendra (1/4/7/10) + Trikona (1/5/9) conjunct or exchange | Power, authority, high position |
| **Viparita Raja Yoga** | Lords of 6th, 8th, or 12th in each other's houses | Sudden rise from adversity |
| **Neecha Bhanga Raja** | Debilitated planet's debilitation gets cancelled | Turns weakness into great strength |

#### Inauspicious Yogas (Ashubha Yogas)

| Yoga | Formation | Result |
|------|-----------|--------|
| **Kuja Dosha (Manglik)** | Mars in 1st, 4th, 7th, 8th, or 12th from Lagna/Moon/Venus | Marital challenges |
| **Kaal Sarpa Yoga** | All 7 planets between Rahu and Ketu | Life challenges, delayed success, karmic lessons |
| **Shani Dosha** | Saturn afflicting 1st, 4th, 7th, or 10th house | Delays, obstacles, discipline required |
| **Kemdrum Yoga** | No planets in 2nd or 12th from Moon | Emotional loneliness, financial fluctuations |
| **Daridra Yoga** | Lord of 11th in 6th/8th/12th | Financial difficulties |
| **Grahan Yoga** | Rahu/Ketu conjunct Sun or Moon | Eclipse on luminaries — health/father/mother issues |

#### Yoga Cancellations (Bhanga)
Many negative yogas get cancelled under specific conditions. The app must check cancellation rules before displaying negative yogas, to avoid unnecessary alarm.

**Kuja Dosha cancellation conditions:**
- Mars in its own sign (Mesha/Vrischika) in the dosha-forming house
- Mars aspected by Jupiter
- Mars in Karka or Makara in 8th house
- Both partners are Manglik

**Kaal Sarpa cancellation:**
- Any planet conjunct Rahu or Ketu
- Jupiter aspecting Rahu or Ketu

### 3.6 Bhava Analysis (House-by-House Life Predictions)

For each of the 12 houses, analyze:

1. **Sign on the cusp** (which Rashi occupies this house)
2. **Lord of the house** (which planet owns that Rashi)
3. **Planets placed in the house** (occupants)
4. **Aspects on the house** (which planets cast drishti)
5. **Lord's placement** (which house the lord sits in)
6. **Lord's strength** (Shadbala of the house lord)

#### Aspect (Drishti) Rules

All planets have **7th house aspect** (they aspect the house directly opposite). Additionally:

| Planet | Special Aspects |
|--------|----------------|
| Mars | 4th and 8th house from its position |
| Jupiter | 5th and 9th house from its position |
| Saturn | 3rd and 10th house from its position |
| Rahu/Ketu | 5th, 7th, 9th (same as Jupiter, debated) |

### 3.7 Ashtakavarga (Transit Strength Grid)

A predictive tool showing the strength of each planet in each sign during transits.

- Each of the 7 planets (excluding Rahu/Ketu) + Lagna produces a grid of benefic points (bindus) across 12 signs
- Each cell gets 0 or 1 bindu from each of 8 contributors (7 planets + Lagna)
- **Sarvashtakavarga:** Sum of all 7 individual Ashtakavargas — shows overall strength per sign
- **Maximum per sign:** 56 (all 8 contributors × 7 planets contributing)
- **Average per sign:** 28
- Signs with **> 28 bindus** are strong; **< 28** are weak

**Use in Zatukh:** Show the Sarvashtakavarga table. Highlight the signs where key planets (especially Saturn, Jupiter) will transit in coming years — predicts good/challenging transits.

---

## 4. Zatukh Display — Screens & Layout

### Screen 1: Input Form
Same as Tekni input form (see TEKNI_REQUIREMENTS.md, Section 6, Screen 1).

### Screen 2: Zatukh Overview (Main View)

```
┌──────────────────────────────────────┐
│  ज़ातूख — Zatukh                      │
│  Rakesh Ganjoo                       │
│  Jan 15, 1975 • 05:30 AM            │
│  Srinagar, J&K (34.08°N, 74.80°E)   │
│                                      │
│  ┌──────────────────┐                │
│  │  LAGNA KUNDALI   │                │
│  │  (North Indian   │                │
│  │   Diamond Chart) │                │
│  └──────────────────┘                │
│                                      │
│  Key Details:                        │
│  Lagna: Dhanu      Rashi: Karka     │
│  Nakshatra: Pushya (Pada 2)         │
│  Nadi: Madhya      Gana: Deva       │
│  Current Dasha: Jupiter-Saturn      │
│                                      │
│  ┌────────┬────────┬────────┐       │
│  │ Charts │ Dashas │ Yogas  │       │
│  └────────┴────────┴────────┘       │
│  ┌────────┬────────┬────────┐       │
│  │ Houses │ Planets│ Transit│       │
│  └────────┴────────┴────────┘       │
└──────────────────────────────────────┘
```

Tapping each section navigates to detail screens.

### Screen 3: Charts Tab

Show all computed charts in a swipeable/tab view:

| Tab | Chart | Purpose |
|-----|-------|---------|
| 1 | Lagna Kundali | Main birth chart |
| 2 | Chandra Kundali | Moon chart — emotional/mental |
| 3 | Navamsa (D-9) | Marriage & spiritual destiny |
| 4 | Dashamsa (D-10) | Career & profession |

Each chart is rendered in **North Indian diamond format** with Graha abbreviations placed in the appropriate houses.

### Screen 4: Dasha Timeline

```
┌──────────────────────────────────────┐
│  Vimshottari Dasha Timeline          │
│                                      │
│  ──●────────●─────────●──────●──▶    │
│   Birth   Ketu     Venus    Sun      │
│   1975    1975-77  1977-97  1997-03  │
│                                      │
│  📍 Current: Jupiter Mahadasha       │
│     2019 — 2035                      │
│                                      │
│  Sub-periods (Antardasha):           │
│  ├── Ju-Ju  Jun 2019 – Aug 2021     │
│  ├── Ju-Sa  Aug 2021 – Feb 2024     │
│  ├── Ju-Me  Feb 2024 – Jun 2026  ◀ NOW
│  ├── Ju-Ke  Jun 2026 – May 2027     │
│  ├── Ju-Ve  May 2027 – Jan 2030     │
│  ├── Ju-Su  Jan 2030 – Oct 2030     │
│  ├── Ju-Mo  Oct 2030 – Feb 2032     │
│  ├── Ju-Ma  Feb 2032 – Jan 2033     │
│  └── Ju-Ra  Jan 2033 – Jun 2035     │
│                                      │
│  [ Expand Pratyantardasha ]          │
└──────────────────────────────────────┘
```

### Screen 5: Yogas Found

```
┌──────────────────────────────────────┐
│  Yogas in Your Chart                 │
│                                      │
│  ✅ Auspicious Yogas                 │
│  ┌──────────────────────────────┐   │
│  │ 🌟 Gaja Kesari Yoga          │   │
│  │ Jupiter in 7th from Moon      │   │
│  │ → Wisdom, fame, prosperity    │   │
│  └──────────────────────────────┘   │
│  ┌──────────────────────────────┐   │
│  │ 🌟 Budha-Aditya Yoga         │   │
│  │ Sun + Mercury in 2nd house    │   │
│  │ → Intelligence, communication │   │
│  └──────────────────────────────┘   │
│                                      │
│  ⚠️ Doshas                           │
│  ┌──────────────────────────────┐   │
│  │ 🔴 Kuja Dosha (Manglik)      │   │
│  │ Mars in 7th house from Lagna  │   │
│  │ Cancellation: ❌ Not cancelled │   │
│  └──────────────────────────────┘   │
│                                      │
│  No Kaal Sarpa Yoga ✅               │
└──────────────────────────────────────┘
```

### Screen 6: House Analysis

```
┌──────────────────────────────────────┐
│  Bhava (House) Analysis              │
│                                      │
│  [1st] [2nd] [3rd] [4th] ...        │
│                                      │
│  ┌──────────────────────────────┐   │
│  │ 7th House — Kalatra Bhava     │   │
│  │ (Marriage & Partnerships)     │   │
│  │                               │   │
│  │ Sign: Mithuna (Gemini)        │   │
│  │ Lord: Mercury (in 2nd house)  │   │
│  │ Occupants: Mars               │   │
│  │ Aspects: Jupiter (5th), Saturn│   │
│  │                               │   │
│  │ Analysis:                     │   │
│  │ Mars in 7th → Manglik Dosha   │   │
│  │ Jupiter aspect → beneficial   │   │
│  │ Mercury in 2nd → lord in      │   │
│  │ wealth house (good for spouse │   │
│  │ bringing financial stability) │   │
│  └──────────────────────────────┘   │
└──────────────────────────────────────┘
```

### Screen 7: Planetary Details

```
┌──────────────────────────────────────┐
│  Graha Details                       │
│                                      │
│  ┌──────────────────────────────┐   │
│  │ ♃ Jupiter (Guru)              │   │
│  │                               │   │
│  │ Sign: Meena (Pisces) — Own    │   │
│  │ House: 4th (Sukha Bhava)      │   │
│  │ Nakshatra: Revati (Pada 3)    │   │
│  │ Degree: 22° 14' 38"          │   │
│  │ Status: Direct                │   │
│  │ Navamsa: Kumbha               │   │
│  │                               │   │
│  │ Shadbala: 7.2 Rupas (Strong✅)│   │
│  │ ├── Sthana: 2.1              │   │
│  │ ├── Dig: 0.8                  │   │
│  │ ├── Kala: 1.5                 │   │
│  │ ├── Cheshta: 1.2              │   │
│  │ ├── Naisargika: 0.57          │   │
│  │ └── Drik: 1.0                 │   │
│  │                               │   │
│  │ Dignities: Own sign, in Kendra│   │
│  │ → Hamsa Yoga formed           │   │
│  └──────────────────────────────┘   │
│                                      │
│  [Su] [Mo] [Ma] [Me] [Ju] ...       │
└──────────────────────────────────────┘
```

---

## 5. Prediction Engine — Life Area Analysis

The Zatukh should provide interpretive text for key life areas based on house lords, occupants, and aspects.

### 5.1 Life Areas to Cover

| Area | Primary Houses | Key Factors |
|------|---------------|-------------|
| **Personality & Health** | 1st, 6th, 8th | Lagna lord strength, malefics in 6th/8th |
| **Wealth & Finance** | 2nd, 11th | 2nd lord placement, Dhana Yogas, Jupiter/Venus |
| **Education & Intellect** | 4th, 5th | 5th lord, Mercury, Jupiter aspects on 5th |
| **Career & Profession** | 10th, 6th, 2nd | 10th lord, Saturn, Sun strength, Dashamsa |
| **Marriage & Relationships** | 7th, 2nd | 7th lord, Venus, Mars, Navamsa analysis |
| **Children** | 5th, 9th | 5th lord, Jupiter (for male), Saptamsa |
| **Parents** | 4th (mother), 9th (father) | Respective lord placement and afflictions |
| **Siblings** | 3rd, 11th | 3rd lord, Mars |
| **Travel & Foreign** | 9th, 12th | Rahu, 12th lord, planets in moveable signs |
| **Spiritual Life** | 9th, 12th, 5th | Jupiter, Ketu, 12th house planets |
| **Overall Fortune** | 9th, 1st, 5th | Trikona lords, benefic aspects |

### 5.2 Prediction Text Approach

For Phase 1, use **rule-based template text**:

```
IF 7th lord in 2nd house AND 7th lord is benefic:
  → "Spouse is likely to bring financial stability to the family.
     Marriage may happen through family connections."

IF Mars in 7th house AND no Jupiter aspect:
  → "Manglik Dosha present. May cause delays or challenges in
     married life. Remedies recommended."

IF Jupiter aspects 5th house:
  → "Strong indication of good education and intelligent children.
     Natural inclination toward learning and wisdom."
```

Each prediction is tagged with:
- **Confidence:** Strong (multiple factors align) / Moderate (single factor) / Mild
- **Source factors:** "Based on 7th lord in 2nd, Venus in 4th"
- **Remedies** (if applicable): Gemstones, mantras, charitable acts

---

## 6. Additional Features

### 6.1 Current Transit Overlay

Show where planets are **today** relative to the birth chart:

- Saturn transit over natal Moon = **Sade Sati** (7.5 year Saturn period — very significant in KP tradition)
- Jupiter transit through various houses = yearly fortune indicator
- Rahu/Ketu transit axis = karmic themes for the period

```
┌──────────────────────────────────────┐
│  Current Transits (March 2026)       │
│                                      │
│  ♄ Saturn in Meena → Your 4th house  │
│    Impact: Home, mother, peace of    │
│    mind may need attention           │
│                                      │
│  ♃ Jupiter in Mithuna → Your 7th    │
│    Impact: Favorable for partnerships│
│    and marriage matters              │
│                                      │
│  ⚠️ Sade Sati: Not active ✅         │
│     (Last: 2020-2027)               │
└──────────────────────────────────────┘
```

### 6.2 Sade Sati Calculator

**Sade Sati** = Saturn transiting through the 12th, 1st, and 2nd houses from natal Moon (each transit ~2.5 years = 7.5 years total). KPs take this very seriously.

Show:
- Past Sade Sati periods
- Current status (active/inactive, which phase)
- Next Sade Sati start date
- Phase: Rising (12th from Moon), Peak (over Moon), Setting (2nd from Moon)

### 6.3 Muhurat Suggestions

Based on the person's chart, suggest auspicious dates for:
- Marriage (7th house factors)
- Starting business (10th house + Jupiter transit)
- Travel (9th house + Rahu)
- House purchase (4th house + Saturn transit)

### 6.4 Remedies Section

For each identified Dosha or weak planet, suggest traditional remedies:

| Remedy Type | Example |
|-------------|---------|
| **Gemstone** | Blue Sapphire for weak Saturn, Yellow Sapphire for Jupiter |
| **Mantra** | "Om Namah Shivaya" for Moon affliction |
| **Charity** | Donate black sesame on Saturday for Saturn Dosha |
| **Fasting** | Monday fast for Moon, Thursday for Jupiter |
| **Puja** | Navagraha Puja for overall planetary pacification |

**Note:** Present remedies as traditional suggestions, not guarantees. Include disclaimer.

### 6.5 Share & Export

- **Share as Image** — Rendered chart + summary as a shareable image
- **PDF Export** — Full multi-page Zatukh document with all charts, dashas, yogas, predictions
- **Save Locally** — AsyncStorage with all computed data
- **Print Layout** — Traditional Zatukh format optimized for printing

---

## 7. Technical Architecture

### 7.1 Calculation Dependencies

```
Input (DOB, Time, Place)
  │
  ├──▶ Swiss Ephemeris / astronomy-engine
  │     ├── 9 Graha sidereal longitudes
  │     ├── Lagna degree
  │     └── House cusps
  │
  ├──▶ Chart Generator
  │     ├── Lagna Kundali
  │     ├── Chandra Kundali
  │     ├── Navamsa (D-9)
  │     └── Dashamsa (D-10)
  │
  ├──▶ Dasha Calculator
  │     ├── Birth Nakshatra → Starting Dasha
  │     ├── Balance of Dasha at birth
  │     ├── Mahadasha timeline (120 years)
  │     ├── Antardasha sub-periods
  │     └── Pratyantardasha (3rd level)
  │
  ├──▶ Yoga Detector
  │     ├── Check ~20 major Yoga rules
  │     ├── Check Dosha conditions
  │     └── Check cancellation rules
  │
  ├──▶ Shadbala Calculator
  │     ├── 6 strength components per planet
  │     └── Strong/Weak classification
  │
  ├──▶ Ashtakavarga Calculator
  │     ├── Individual planet grids
  │     └── Sarvashtakavarga (combined)
  │
  └──▶ Prediction Engine
        ├── House-by-house analysis
        ├── Life area predictions
        ├── Transit overlay
        └── Sade Sati calculation
```

### 7.2 Data Models

```typescript
interface Zatukh {
  // Input
  name: string;
  dob: string;          // ISO date
  timeOfBirth: string;  // HH:MM
  placeOfBirth: string;
  latitude: number;
  longitude: number;
  gender: 'male' | 'female';

  // Computed — Core
  lagna: Rashi;
  lagnaDegreee: number;
  moonSign: Rashi;
  nakshatra: Nakshatra;
  nakshatraPada: 1 | 2 | 3 | 4;
  nadi: 'Aadi' | 'Madhya' | 'Antya';
  gana: 'Deva' | 'Manushya' | 'Rakshasa';
  varna: 'Brahmin' | 'Kshatriya' | 'Vaishya' | 'Shudra';

  // Computed — Planets
  grahas: GrahaPosition[];  // 9 planets with sign, degree, house, nakshatra, navamsa

  // Charts
  lagnaChart: Chart;
  chandraChart: Chart;
  navamsaChart: Chart;
  dashamsaChart: Chart;

  // Dashas
  dashaTimeline: MahadashaEntry[];
  currentDasha: { maha: string; antar: string; pratyantar: string };

  // Analysis
  yogas: YogaResult[];
  doshas: DoshaResult[];
  shadbala: ShadbalaResult[];
  ashtakavarga: AshtakavargaGrid;
  houseAnalysis: HouseAnalysis[];

  // Predictions
  predictions: LifeAreaPrediction[];
  transits: TransitResult[];
  sadeSati: SadeSatiInfo;

  // Meta
  createdAt: string;
  ayanamsa: 'lahiri' | 'krishnamurti';
}

interface GrahaPosition {
  graha: Graha;
  siderealLongitude: number;
  rashi: Rashi;
  degree: number;           // Within the sign (0-30)
  house: number;            // 1-12 in Lagna chart
  nakshatra: Nakshatra;
  nakshatraPada: 1 | 2 | 3 | 4;
  navamsaRashi: Rashi;
  isRetrograde: boolean;
  isExalted: boolean;
  isDebilitated: boolean;
  isOwnSign: boolean;
  isCombust: boolean;       // Too close to Sun
}

interface MahadashaEntry {
  lord: Graha;
  startDate: string;
  endDate: string;
  antardashas: AntardashaEntry[];
}

interface YogaResult {
  name: string;
  type: 'auspicious' | 'inauspicious';
  formation: string;       // How it's formed in this chart
  effect: string;          // What it means
  strength: 'strong' | 'moderate' | 'mild';
  isCancelled: boolean;
  cancellationReason?: string;
}
```

### 7.3 Platform Responsiveness

| Element | Desktop (Web) | Mobile (iPhone/Android) |
|---------|---------------|------------------------|
| Charts | Side-by-side (Lagna + Navamsa) | Stacked, swipeable tabs |
| Dasha timeline | Horizontal timeline bar | Vertical scrollable list |
| House analysis | 4×3 grid overview | Scrollable list with expandable cards |
| Planet details | Table view | Accordion cards |
| Overall layout | maxWidth: 800px centered | Full width, bottom tab navigation |

### 7.4 Offline-First

- All calculations run locally — no API calls
- Swiss Ephemeris data bundled with the app (or precomputed tables for 1900–2100)
- Saved Zatukhs stored in AsyncStorage
- Share/export generates images/PDF client-side

---

## 8. Phase Plan

| Phase | Scope | Depends On |
|-------|-------|------------|
| **Phase 1** | Dasha calculator (Vimshottari) — given birth Nakshatra + pada, compute full Dasha timeline with Antardashas | Nakshatra data tables |
| **Phase 2** | Yoga detector — given planet positions in houses/signs, identify all applicable Yogas and Doshas | Lookup rules |
| **Phase 3** | Shadbala calculator — compute 6 strengths for each planet | Astronomy library (planet speeds, etc.) |
| **Phase 4** | Chart rendering — North Indian diamond SVG for all 4 chart types | Planet positions + house mapping |
| **Phase 5** | Prediction engine — rule-based text for each life area | Phases 1-4 |
| **Phase 6** | Transit overlay — current planet positions vs birth chart, Sade Sati | Ephemeris for current date |
| **Phase 7** | Full UI — input form, overview, detail screens, share/export | All above |
| **Phase 8** | PDF export — multi-page traditional Zatukh format for printing | Phase 7 |

**Note:** Phases 1 and 2 share the Tekni feature's astronomy engine — build once, use for both Tekni and Zatukh.

---

## 9. Relationship to Other Janthari Features

```
┌─────────────────────────────────────────────┐
│               JANTHARI APP                   │
│                                              │
│  ┌──────────┐   ┌──────────┐   ┌─────────┐ │
│  │KP Calendar│   │  Tithi   │   │  Puja   │ │
│  │           │   │Calculator│   │  Paath  │ │
│  └──────────┘   └──────────┘   └─────────┘ │
│                                              │
│  ┌──────────────────────────────────────┐   │
│  │        Astronomy Engine              │   │
│  │  (Swiss Ephemeris / astronomy-engine)│   │
│  │  Planet positions, Ayanamsa, Houses  │   │
│  └──────┬────────────────────┬──────────┘   │
│         │                    │               │
│  ┌──────▼──────┐    ┌───────▼───────┐       │
│  │   TEKNI     │    │    ZATUKH     │       │
│  │  (Matching) │    │ (Full Horoscope│       │
│  │             │    │  & Kundali)   │       │
│  │ • 8 Kootas │    │ • 4 Charts    │       │
│  │ • 36 Gunas │    │ • Dashas      │       │
│  │ • Doshas   │    │ • Yogas       │       │
│  │ • Score    │    │ • Shadbala    │       │
│  └─────────────┘    │ • Predictions │       │
│                     │ • Transits    │       │
│  ┌──────────┐       │ • Remedies    │       │
│  │ Jyotish  │       └───────────────┘       │
│  │(Vedic    │                                │
│  │Astrology)│ ← Future: daily/weekly         │
│  │          │   predictions, transit alerts   │
│  └──────────┘                                │
└─────────────────────────────────────────────┘
```

The astronomy engine is the shared foundation. Tekni extracts matching-specific data. Zatukh uses the full computation. Jyotish (daily predictions tile) will use transit data.

---

## 10. Accuracy & Disclaimer

### 10.1 Validation
- Cross-verify planetary positions against Jagannatha Hora (free desktop software — gold standard)
- Test Dasha timelines against known charts
- Verify Yoga detection with at least 20 known examples
- Validate Shadbala against published tables

### 10.2 Mandatory Disclaimer

Display prominently in the app:

> *"This Zatukh is generated using Vedic astrological calculations based on the Lahiri Ayanamsa system. It is intended for educational and cultural reference. Astrological predictions are traditional interpretations and should not be used as the sole basis for life decisions. Consult qualified professionals for medical, financial, or legal advice."*

---

## 11. Glossary (Zatukh-specific terms)

| Term | Meaning |
|------|---------|
| **Zatukh** | KP term for full birth horoscope (from Sanskrit Jatak) |
| **Janam Patri** | Hindi term for birth horoscope document |
| **Kundali** | Birth chart — the diagram showing planet positions |
| **Navamsa** | 9th divisional chart — key for marriage analysis |
| **Dashamsa** | 10th divisional chart — key for career analysis |
| **Vimshottari Dasha** | 120-year planetary period system |
| **Mahadasha** | Major planetary period (top level) |
| **Antardasha / Bhukti** | Sub-period within a Mahadasha |
| **Pratyantardasha** | Sub-sub-period (3rd level) |
| **Shadbala** | Six-fold strength measurement of a planet |
| **Yoga** | Special planetary combination producing specific results |
| **Dosha** | Astrological defect or affliction |
| **Sade Sati** | 7.5-year Saturn transit over natal Moon — major life phase |
| **Drishti** | Planetary aspect — how one planet influences a house/planet |
| **Ashtakavarga** | Benefic point system for transit prediction |
| **Grahan Yoga** | Eclipse combination — Rahu/Ketu with Sun or Moon |
| **Bhanga** | Cancellation of a negative yoga or debilitation |
| **Rupa** | Unit of measurement for Shadbala (1 Rupa = 60 Virupas) |
| **Bindu** | Benefic point in Ashtakavarga (0 or 1 per contributor) |
| **Combustion** | Planet too close to Sun — loses strength |
