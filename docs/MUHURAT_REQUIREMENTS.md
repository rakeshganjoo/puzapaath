# Saath — Shubh Muhurat Finder — Functional Requirements

> **Feature Tile:** Shubh Muhurat Finder  
> **Kashmiri Name:** Saath (साथ) — the auspicious moment  
> **App:** Janthari (जंथ्री)  
> **Status:** Coming Soon  
> **Last Updated:** March 19, 2026

---

## 1. What is Muhurat?

**Muhurat** (मुहूर्त) literally means "a moment in time." In Vedic astrology, it refers to an **electional time** — the science of choosing the most auspicious date and time to begin an important activity. The branch of Jyotish that deals with Muhurat selection is called **Muhurat Shastra** or **Electional Astrology (Prashna Jyotish)**.

### The Principle

Every moment has a unique planetary configuration. Just as a person's birth chart (Zatukh) captures the karma of their birth moment, the "birth chart" of an event captures its destiny. Starting an event at an auspicious time ensures:

- Favorable planetary support for success
- Avoidance of malefic influences that cause obstacles
- Alignment with cosmic rhythms for smooth outcomes

### KP Community Context

In Kashmiri Pandit families:
- **No major event begins without consulting a Jyotishi** for the Muhurat
- The family pandit provides the **Saath** (साथ) — the exact auspicious moment
- Common phrase: *"Panditji se saath le lo"* (Go get the auspicious time from Panditji)
- Even in modern diaspora families, Muhurat is sought for weddings, house warmings, naming ceremonies
- The Saath is typically written on a chit (small paper) with exact date, time, and tithi details
- **Navreh** (KP New Year, Chaitra Shukla Pratipada) is itself a Muhurat — the most auspicious moment to begin the new year

---

## 2. Types of Events (Muhurat Categories)

The tool must support Muhurat selection for a wide range of life events. Each event type has specific astrological rules beyond the general ones.

### 2.1 Samskaras (Sacraments / Life Milestones)

| # | Event | KP Term | Description | Special Requirements |
|---|-------|---------|-------------|---------------------|
| 1 | **Wedding / Marriage** | Khandur / Lagan | The main marriage ceremony | Strongest rules: 7th house, Venus, Jupiter. Most complex Muhurat |
| 2 | **Engagement** | Kasamdari / Vaagdan | Formal betrothal | 7th house favorable, no malefic aspects |
| 3 | **Yagnopavit / Mekhla** | Mekhla | Sacred thread ceremony for boys | Sun, Jupiter strong. Uttarayana preferred |
| 4 | **Naming Ceremony** | Naam Karan | Naming the child | Moon strong, good Nakshatra, benefic Lagna |
| 5 | **First Feeding** | Annaprashan | Baby's first grain | Moon strong, digestive yoga considered |
| 6 | **Mundan** | Mundan | First head shave of child | Mars favorable, no malefic aspects to Lagna |
| 7 | **Vidya Arambh** | — | Initiation of education | Mercury, Jupiter strong. Saraswati Puja day |
| 8 | **Griha Pravesh** | Griha Pravesh | House warming / entering new home | 4th house lord strong, Jupiter-Venus alignment |
| 9 | **Funeral / Shraddh Timing** | Shraddh / Karyam | Post-death rituals | Not a "shubh" Muhurat but timing still matters |

### 2.2 Material / Worldly Events

| # | Event | Description | Special Requirements |
|---|-------|-------------|---------------------|
| 10 | **New Vehicle Purchase** | Taking delivery of car/bike | Mars (vehicles), 3rd house favorable |
| 11 | **Property Purchase** | Registration / possession | 4th house, Jupiter strong, no Saturn affliction |
| 12 | **New Business Launch** | Opening shop, company registration | 10th house, Mercury strong, Thursday/Friday preferred |
| 13 | **Job Joining** | Starting a new job | 10th house, Sun strong, Monday preferred |
| 14 | **Travel** | Long journey / migration | 3rd, 9th house clear, no malefic in 8th |
| 15 | **School Admission** | First day of school | Mercury, 4th/5th house, Wednesday preferred |
| 16 | **Investment / Financial** | Starting SIP, property investment | 2nd, 11th house, Jupiter-Venus favorable |
| 17 | **Medical Treatment** | Surgery, starting treatment | 6th house analysis, Mars favorable |
| 18 | **Legal Matters** | Filing case, court appearance | Jupiter strong, 9th house favorable |

### 2.3 Religious / Spiritual Events

| # | Event | Description | Special Requirements |
|---|-------|-------------|---------------------|
| 19 | **Puja / Havan** | Performing special worship | Shukla Paksha preferred, no Rahu Kaal |
| 20 | **Mantra Deeksha** | Initiation into mantra practice | Guru (Jupiter) strong, Thursday preferred |
| 21 | **Temple Visit / Pilgrimage** | Yatra timing | 9th house, Jupiter favorable |
| 22 | **Donation** | Charity / Daan | 9th, 12th house favorable |

---

## 3. Inputs Required from User

### 3.1 Primary Inputs

| # | Input | Type | Required | Notes |
|---|-------|------|----------|-------|
| 1 | **Event Type** | Dropdown / Category picker | Yes | Select from categories in §2 |
| 2 | **Preferred Date Range** | Date range picker (from–to) | Yes | "I need a Muhurat between April 10 and May 15" |
| 3 | **Location of Event** | Location search / manual | Yes | Latitude + Longitude needed for sunrise/sunset, planetary positions |
| 4 | **Preferred Time Window** | Optional time range (e.g., 8 AM – 6 PM) | No | User may have practical constraints |

### 3.2 Optional (Personalized) Inputs

| # | Input | Type | Required | Notes |
|---|-------|------|----------|-------|
| 5 | **Person 1 Birth Details** | Date, Time, Place | No | If provided, transit analysis over natal chart for deeper accuracy |
| 6 | **Person 2 Birth Details** | Date, Time, Place | No | For marriage/engagement: both charts analyzed |
| 7 | **Preferred Day of Week** | Multi-select | No | "We prefer Saturday or Sunday" |
| 8 | **Avoid Specific Dates** | Date picker | No | "Cannot do April 22 — work conflict" |

### 3.3 Output Preferences

| # | Input | Type | Notes |
|---|-------|------|-------|
| 9 | **Number of Options** | 1 / 3 / 5 | How many Muhurat candidates to show |
| 10 | **Detail Level** | Basic / Detailed | Basic = date + time. Detailed = full Panchang + planetary analysis |

---

## 4. Core Calculations — The Muhurat Algorithm

Selecting a Shubh Muhurat requires evaluating **multiple astrological factors simultaneously**. A good Muhurat is one where ALL critical factors align favorably — no single factor can be evaluated in isolation.

### 4.1 The Panchang Five Limbs (Mandatory Check)

Every Muhurat must pass the Panchang filter first:

#### 4.1.1 Tithi (Lunar Day)

| Classification | Tithis | Effect |
|---------------|--------|--------|
| **Nanda** (Joyful) | 1, 6, 11 | Generally auspicious |
| **Bhadra** (Gentle) | 2, 7, 12 | Good for peaceful activities |
| **Jaya** (Victorious) | 3, 8, 13 | Good for competitive/courageous acts |
| **Rikta** (Empty) | 4, 9, 14 | **Inauspicious** — avoid for all good works |
| **Purna** (Complete) | 5, 10, 15 (Purnima) | Excellent for completeness |

**Amavasya (New Moon):** Generally avoided for auspicious events. Exception: Diwali Puja.

**Tithi rules by event:**
- Marriage: Prefer 2, 3, 5, 7, 10, 11, 12, 13. Avoid 4, 8, 14, Amavasya, Purnima adjacent.
- Griha Pravesh: 2, 3, 5, 7, 10, 11, 12, 13. Avoid Rikta tithis.
- Yagnopavit: 2, 3, 5, 7, 10, 11, 12, 13. Shukla Paksha strongly preferred.
- Travel: Avoid 4, 8, 9, 14, Amavasya.
- Vehicle purchase: 2, 3, 5, 7, 10, 11, 12, 13.

#### 4.1.2 Nakshatra (Lunar Mansion)

The 27 Nakshatras classified by nature:

| Type | Nakshatras | Good For |
|------|-----------|----------|
| **Dhruva** (Fixed) | Rohini, Uttara Phalguni, Uttara Ashadha, Uttara Bhadrapada | Foundation laying, Griha Pravesh, permanent structures |
| **Chara** (Moveable) | Punarvasu, Swati, Shravana, Dhanishtha, Shatabhisha | Travel, vehicle purchase, starting journeys |
| **Ugra** (Fierce) | Bharani, Magha, Purva Phalguni, Purva Ashadha, Purva Bhadrapada | Avoid — for destructive acts only |
| **Kshipra / Laghu** (Swift) | Ashwini, Pushya, Hasta, Abhijit\* | Quick tasks, business start, trading |
| **Mridu** (Soft/Gentle) | Mrigashira, Chitra, Anuradha, Revati | Marriage, music, arts, friendship |
| **Tikshna** (Sharp) | Ardra, Ashlesha, Jyeshtha, Moola | Avoid — tantra, surgery only |
| **Mishra** (Mixed) | Krittika, Vishakha | Mixed results — context dependent |

\*Abhijit is the 28th (intercalary) Nakshatra used only in Muhurat — a 4-ghati window near noon when Uttara Ashadha transitions to Shravana. **Extremely auspicious** for all activities.

**Nakshatra rules by event:**
- Marriage: Rohini, Mrigashira, Magha, Uttara Phalguni, Hasta, Swati, Anuradha, Moola, Uttara Ashadha, Uttara Bhadrapada, Revati
- Griha Pravesh: Rohini, Uttara Phalguni, Uttara Ashadha, Uttara Bhadrapada, Pushya, Swati, Shravana, Dhanishtha
- Yagnopavit: Ashwini, Rohini, Mrigashira, Punarvasu, Pushya, Uttara Phalguni, Hasta, Swati, Anuradha, Uttara Ashadha, Shravana, Revati
- Vehicle purchase: Ashwini, Rohini, Pushya, Hasta, Swati, Shravana

#### 4.1.3 Yoga (Luni-Solar Combination)

**Yoga** = `(SunSiderealLong + MoonSiderealLong) / 13°20'` → 1 of 27 Yogas.

| Classification | Yogas | Effect |
|---------------|-------|--------|
| **Auspicious** | Siddhi, Amrita, Sarvartha Siddhi, Ravi, Shubha, Shukla, Brahma, Indra, Priti, Ayushman, Saubhagya | Excellent for Muhurat |
| **Inauspicious** | Vishkumbha, Atiganda, Shoola, Ganda, Vyaghata, Vajra, Vyatipata, Parigha, Vaidhriti | Avoid completely |
| **Moderate** | Remaining yogas | Context dependent |

**Special Yogas (time-based, not Panchang Yoga):**

| Yoga | How to Calculate | Effect |
|------|-----------------|--------|
| **Sarvartha Siddhi Yoga** | Specific Nakshatra + Vara combinations (lookup table) | **Most auspicious — overrides many negatives** |
| **Amrita Siddhi Yoga** | Specific Nakshatra + Vara combinations | Supremely auspicious |
| **Ravi Yoga** | Sun in specific Nakshatra + Vara | Auspicious window |
| **Guru Pushya Yoga** | Thursday + Pushya Nakshatra | **Exceptionally rare and auspicious** for all activities |
| **Dwipushkar Yoga** | Specific Tithi + Vara + Nakshatra | Results double — good if event is good |
| **Tripushkar Yoga** | Specific Tithi + Vara + Nakshatra | Results triple |

#### Sarvartha Siddhi Yoga Lookup Table

| Day (Vara) | Nakshatras that form Sarvartha Siddhi |
|-----------|--------------------------------------|
| Sunday | Pushya, Hasta, Uttara Phalguni, Uttara Ashadha, Uttara Bhadrapada, Ashwini |
| Monday | Rohini, Mrigashira, Shravana, Dhanishtha, Hasta |
| Tuesday | Ashwini, Uttara Phalguni, Krittika, Anuradha |
| Wednesday | Rohini, Anuradha, Hasta, Krittika, Mrigashira |
| Thursday | Ashwini, Punarvasu, Pushya, Swati, Revati, Anuradha |
| Friday | Ashwini, Anuradha, Revati, Punarvasu, Shravana |
| Saturday | Rohini, Swati, Shravana, Pushya, Uttara Bhadrapada |

#### Amrita Siddhi Yoga Lookup Table

| Day (Vara) | Nakshatra |
|-----------|-----------|
| Sunday | Hasta |
| Monday | Mrigashira |
| Tuesday | Ashwini |
| Wednesday | Anuradha |
| Thursday | Pushya |
| Friday | Revati |
| Saturday | Rohini |

#### 4.1.4 Karana (Half-Tithi)

There are 11 Karanas. Each tithi has 2 Karanas (first and second half):

| Type | Karanas | Effect |
|------|---------|--------|
| **Moveable (Chara)** — repeat 8 times in a cycle | Bava, Balava, Kaulava, Taitila, Gara, Vanija, Vishti (Bhadra) | Bava through Vanija are acceptable. **Vishti (Bhadra) is always inauspicious** |
| **Fixed (Sthira)** — occur once per lunar month | Shakuni, Chatushpada, Naga, Kimsthughna | Generally avoided except Kimsthughna which is neutral |

**Critical rule:** **Bhadra Karana (Vishti)** must be completely avoided. It occurs 7 times per lunar month and is the single most common disqualifier.

#### 4.1.5 Vara (Day of the Week)

| Day | Lord | Good For | Avoid For |
|-----|------|----------|-----------|
| Sunday (Ravivar) | Sun | Government work, authority, health | Marriage |
| Monday (Somvar) | Moon | Marriage, travel, ornaments, peace | — |
| Tuesday (Mangalvar) | Mars | **Avoid for most auspicious events** | Marriage, Griha Pravesh, new ventures. OK for surgery, battles |
| Wednesday (Budhvar) | Mercury | Education, business, investment, travel | — |
| Thursday (Guruvar) | Jupiter | **Best for almost everything** — marriage, Yagnopavit, education, spiritual | — |
| Friday (Shukravar) | Venus | Marriage, vehicle, ornaments, entertainment | — |
| Saturday (Shanivar) | Saturn | **Avoid for most events** | Marriage, new beginnings. OK for property, oil, iron-related |

### 4.2 Lagna (Ascendant) Analysis — The Most Critical Factor

The **rising sign at the chosen Muhurat time** is the "birth chart" of the event. This is the most sophisticated part of Muhurat selection and distinguishes a precise Muhurat from a general "good day."

#### Lagna Rules

| Rule | Description |
|------|-------------|
| **Lagna Lord Strong** | The ruler of the rising sign must not be combust, debilitated, or retrograde |
| **No Malefic in Lagna** | Saturn, Mars, Rahu, Ketu should not be in the 1st house |
| **No Malefic in 7th** | Planets in 7th aspect the Lagna — malefics there harm |
| **No Malefic in 8th** | 8th house = obstacles, hidden problems |
| **Jupiter's Aspect** | Jupiter aspecting Lagna (1st, 5th, 7th, 9th aspect) makes it very strong |
| **Moon Strong** | Moon should not be in 6th, 8th, or 12th from Muhurat Lagna |
| **Benefics in Kendras** | Jupiter, Venus, Mercury, Moon in 1st, 4th, 7th, 10th = excellent |

#### Best Lagnas by Event Type

| Event | Preferred Lagnas (Rising Signs) | Avoid |
|-------|-------------------------------|-------|
| Marriage | Taurus, Gemini, Cancer, Virgo, Libra, Sagittarius, Aquarius, Pisces | Aries, Leo, Scorpio, Capricorn |
| Griha Pravesh | Taurus, Cancer, Leo, Virgo, Libra, Sagittarius, Aquarius, Pisces | Aries, Scorpio |
| Yagnopavit | Gemini, Cancer, Virgo, Sagittarius, Pisces | — |
| Business | Taurus, Leo, Virgo, Libra, Sagittarius, Aquarius | Scorpio, Capricorn |
| Vehicle | Gemini, Cancer, Virgo, Libra, Aquarius | Aries, Scorpio |
| Education | Gemini, Virgo, Sagittarius, Pisces | — |

#### Lagna Calculation

```
1. For each candidate time in the date range:
   a. Compute Local Sidereal Time (LST) from UT + event longitude
   b. Compute Ascendant degree from LST + event latitude (oblique ascension)
   c. Apply Lahiri Ayanamsha for sidereal conversion
   d. Determine rising sign (rashi) and degree
   e. Check planetary positions in houses relative to this Lagna
```

### 4.3 Inauspicious Periods to Avoid (Timing Filters)

These **absolute disqualifiers** must be checked and avoided:

#### 4.3.1 Rahu Kaal

| Day | Rahu Kaal (approx. IST) | Part # of 8 |
|-----|------------------------|-------------|
| Sunday | 4:30 PM – 6:00 PM | 8th |
| Monday | 7:30 AM – 9:00 AM | 2nd |
| Tuesday | 3:00 PM – 4:30 PM | 7th |
| Wednesday | 12:00 PM – 1:30 PM | 5th |
| Thursday | 1:30 PM – 3:00 PM | 6th |
| Friday | 10:30 AM – 12:00 PM | 4th |
| Saturday | 9:00 AM – 10:30 AM | 3rd |

**Calculation:** Divide daylight hours (sunrise to sunset) into 8 equal parts. The Rahu Kaal part number varies by day of week per the table above.

Formula: `rahu_start = sunrise + (part# - 1) × (daylight_duration / 8)`

#### 4.3.2 Yamaghanta

| Day | Yamaghanta Part # |
|-----|-------------------|
| Sunday | 5th |
| Monday | 4th |
| Tuesday | 3rd |
| Wednesday | 2nd |
| Thursday | 1st |
| Friday | 7th |
| Saturday | 6th |

#### 4.3.3 Gulika Kaal

| Day | Gulika Part # |
|-----|---------------|
| Sunday | 7th |
| Monday | 6th |
| Tuesday | 5th |
| Wednesday | 4th |
| Thursday | 3rd |
| Friday | 2nd |
| Saturday | 1st |

#### 4.3.4 Durmuhurta

Two approximately 48-minute inauspicious periods each day. Calculated from sunrise:
- **Daytime Durmuhurta:** Specific to each Vara (lookup table)
- **Nighttime Durmuhurta:** Less relevant for most events

#### 4.3.5 Varjyam (Tyajya Kaal)

A ~96-minute period each day when the Moon is at a specific Nakshatra Pada considered toxic. Must be calculated from the Moon's transit through each Nakshatra.

#### 4.3.6 Eclipses

- Avoid 7 days before and after a **Solar Eclipse**
- Avoid 3 days before and after a **Lunar Eclipse**
- No auspicious Muhurat during eclipse season (Grahan Kaal)

### 4.4 Monthly / Seasonal Filters

#### 4.4.1 Adhik Maas (Intercalary Month)

When a lunar month has no solar sankranti (sun doesn't change rashi), it becomes **Adhik Maas** (extra month). **All auspicious events are prohibited** during Adhik Maas.

#### 4.4.2 Kharmas Period

When the Sun transits Sagittarius (approx. Dec 16 – Jan 14), all marriage, Griha Pravesh, and Yagnopavit Muhurats are prohibited. Also called **Dhanurmas** or **Malmaas** in different traditions.

#### 4.4.3 Pitru Paksha (Mahalaya)

The 15 days of Ashwin Krishna Paksha (Sept/Oct) are dedicated to ancestors. **No auspicious events** during this period.

#### 4.4.4 Chaturmas

The 4-month period from Ashadh Shukla Ekadashi (Devshayani) to Kartik Shukla Ekadashi (Devuthani). Marriage is avoided during this period in many traditions. KP community generally avoids weddings during Chaturmas.

#### 4.4.5 Shunya Maas (Empty Months)

Certain Lagnas have "shunya" (void) months where they should not be used:

| Lagna | Shunya Month |
|-------|-------------|
| Aries | Phalgun |
| Taurus | Shravan |
| Gemini | Kartik |
| Cancer | Chaitra |
| Leo | Phalgun |
| Virgo | Vaishakh |
| Libra | Kartik |
| Scorpio | Jyeshtha |
| Sagittarius | Bhadrapad |
| Capricorn | Ashadh |
| Aquarius | Margshirsh |
| Pisces | Paush |

### 4.5 Transit Analysis (if Birth Data Provided)

When user provides natal chart data, additional checks:

| Check | Description |
|-------|-------------|
| **Jupiter Transit** | Jupiter should not be transiting 6th, 8th, or 12th from natal Moon |
| **Saturn Transit** | No Sade Sati or Ashtama Shani active (or mitigated) |
| **Dasha Compatibility** | Current Mahadasha/Antardasha lords should not be inimical |
| **Transit Moon** | Event-day Moon should be in favorable house from natal Moon (2, 5, 7, 9, 10, 11) |
| **No Retrograde Benefics** | Jupiter retrograde weakens the Muhurat if Jupiter is the Lagna lord |

### 4.6 Tarabalam (Nakshatra Strength from Birth Star)

If user's birth Nakshatra is known, calculate Tara strength:

Count from birth Nakshatra to Muhurat-day Nakshatra:

| Tara # | Name | Count (mod 9) | Effect |
|---------|------|---------------|--------|
| 1 | Janma | 1st | Moderate — avoid for very important events |
| 2 | Sampat | 2nd | **Excellent** — wealth and prosperity |
| 3 | Vipat | 3rd | **Bad** — danger, obstacles |
| 4 | Kshema | 4th | **Good** — safety and well-being |
| 5 | Pratyari | 5th | **Bad** — enmity, opposition |
| 6 | Sadhaka | 6th | **Good** — achievement |
| 7 | Vadha | 7th | **Bad** — harm |
| 8 | Mitra | 8th | **Good** — friendship, support |
| 9 | Ati-Mitra | 9th | **Excellent** — supreme friendship |

### 4.7 Chandrabalam (Moon Strength from Birth Moon)

The Moon on the Muhurat day should be in a favorable house from the natal Moon sign:

| House from Birth Moon | Effect |
|----------------------|--------|
| 1st | Moderate |
| 2nd | **Good** |
| 3rd | **Good** |
| 4th | Avoid |
| 5th | **Good** |
| 6th | Avoid |
| 7th | **Good** |
| 8th | Avoid |
| 9th | **Good** |
| 10th | **Good** |
| 11th | **Excellent** |
| 12th | Avoid |

---

## 5. The Muhurat Selection Algorithm

### 5.1 Pipeline Overview

```
User Input (event type, date range, location)
          │
          ▼
┌──────────────────────────────┐
│ Phase 1: ELIMINATE BAD DAYS  │
│  - Remove Adhik Maas days    │
│  - Remove Kharmas days       │
│  - Remove Pitru Paksha       │
│  - Remove Eclipse periods    │
│  - Remove Rikta Tithis       │
│  - Remove Bhadra Karana      │
│  - Remove inauspicious Yogas │
│  - Remove bad Varas (event)  │
│  - Remove bad Nakshatras     │
│  - Remove Shunya months      │
└──────────┬───────────────────┘
           │ Remaining candidate days
           ▼
┌──────────────────────────────┐
│ Phase 2: FIND TIME WINDOWS   │
│  For each candidate day:     │
│  - Compute sunrise/sunset    │
│  - Compute Rahu Kaal         │
│  - Compute Yamaghanta        │
│  - Compute Gulika Kaal       │
│  - Compute Durmuhurta        │
│  - Compute Varjyam           │
│  - Find clean windows        │
│  (exclude all bad periods)   │
└──────────┬───────────────────┘
           │ Clean time windows
           ▼
┌──────────────────────────────┐
│ Phase 3: EVALUATE LAGNAS     │
│  For each clean window:      │
│  - Compute rising sign       │
│  - Check Lagna lord strength │
│  - Check malefics in 1,7,8   │
│  - Check benefics in Kendras │
│  - Check Jupiter aspect      │
│  - Check Moon placement      │
│  - Assign Lagna score        │
└──────────┬───────────────────┘
           │ Scored windows
           ▼
┌──────────────────────────────┐
│ Phase 4: BONUS YOGAS         │
│  - Sarvartha Siddhi Yoga?    │
│  - Amrita Siddhi Yoga?       │
│  - Guru Pushya Yoga?         │
│  - Dwipushkar/Tripushkar?    │
│  - Abhijit Muhurat window?   │
│  → Add bonus points          │
└──────────┬───────────────────┘
           │
           ▼
┌──────────────────────────────┐
│ Phase 5: PERSONALIZATION     │
│  (if birth data provided)    │
│  - Tarabalam check           │
│  - Chandrabalam check        │
│  - Transit analysis          │
│  - Dasha compatibility       │
│  → Adjust scores             │
└──────────┬───────────────────┘
           │
           ▼
┌──────────────────────────────┐
│ Phase 6: RANK & PRESENT      │
│  - Sort by composite score   │
│  - Pick top N candidates     │
│  - Generate detail report    │
│  - Present to user           │
└──────────────────────────────┘
```

### 5.2 Scoring System

Each Muhurat candidate receives a composite score:

| Factor | Weight | Max Points | Calculation |
|--------|--------|------------|-------------|
| Tithi quality | 15% | 15 | Nanda=12, Bhadra=12, Jaya=10, Purna=15, Rikta=0 |
| Nakshatra suitability | 15% | 15 | Event-specific rating from §4.1.2 |
| Yoga quality | 10% | 10 | Auspicious=10, Moderate=5, Inauspicious=0 |
| Karana quality | 5% | 5 | Good=5, Neutral=3, Vishti=0 |
| Vara suitability | 10% | 10 | Event-specific from §4.1.5 |
| Lagna strength | 25% | 25 | Based on all Lagna rules in §4.2 |
| Clean period (no bad kaal) | 10% | 10 | Full 10 if no overlap with any inauspicious period |
| Bonus Yogas | 10% | 10 | Sarvartha=6, Amrita=8, Guru Pushya=10, Abhijit=5 |

**With personalization (if birth data):**

| Factor | Additional Weight |
|--------|-----------------|
| Tarabalam | +5 (good tara) or -10 (bad tara) |
| Chandrabalam | +5 (good) or -10 (bad) |
| Transit compatibility | +5 to -10 |

**Classification:**
- **90–100:** ★★★★★ Exceptional Muhurat (rare)
- **75–89:** ★★★★ Very Good Muhurat
- **60–74:** ★★★ Good Muhurat
- **45–59:** ★★ Acceptable Muhurat
- **Below 45:** Not recommended

---

## 6. Data Models (TypeScript)

```typescript
/** Event types for Muhurat selection */
type MuhuratEventCategory = 'samskara' | 'material' | 'religious';

interface MuhuratEventType {
  id: string;
  name: string;
  category: MuhuratEventCategory;
  kpName?: string;                  // Kashmiri Pandit term
  description: string;
  preferredTithis: number[];        // 1-15
  preferredNakshatras: number[];    // 1-27
  preferredVaras: number[];         // 0=Sun, 1=Mon ... 6=Sat
  preferredLagnas: number[];        // 0=Aries ... 11=Pisces
  avoidTithis: number[];
  avoidNakshatras: number[];
  avoidVaras: number[];
  avoidLagnas: number[];
  requiresShukla: boolean;          // Must be Shukla Paksha?
  seasonalRestrictions: string[];   // 'kharmas' | 'chaturmas' | 'pitru_paksha'
}

/** User input for Muhurat search */
interface MuhuratRequest {
  eventType: string;                // ID from MuhuratEventType
  dateRange: { from: string; to: string };  // ISO dates
  location: {
    name: string;
    latitude: number;
    longitude: number;
    timezone: string;
  };
  preferredTimeWindow?: { from: string; to: string }; // "08:00" "18:00"
  preferredDays?: number[];         // 0-6 (Sun-Sat)
  avoidDates?: string[];            // ISO dates to skip

  // Optional personalization
  person1?: BirthDetails;
  person2?: BirthDetails;           // For marriage/engagement
}

interface BirthDetails {
  name: string;
  dateOfBirth: string;              // ISO date
  timeOfBirth: string;              // HH:MM
  placeOfBirth: {
    name: string;
    latitude: number;
    longitude: number;
  };
  moonSign?: number;                // 0-11 (if already known)
  birthNakshatra?: number;          // 1-27 (if already known)
}

/** A single daily Panchang snapshot */
interface PanchangSnapshot {
  tithi: number;                    // 1-30
  tithiName: string;
  paksha: 'shukla' | 'krishna';
  nakshatra: number;                // 1-27
  nakshatraName: string;
  yoga: number;                     // 1-27
  yogaName: string;
  karana: number;                   // 1-11
  karanaName: string;
  vara: number;                     // 0-6
  varaName: string;
  sunrise: string;                  // HH:MM local
  sunset: string;
  moonSign: number;
  lunarMonth: string;
}

/** Inauspicious period */
interface InauspiciousPeriod {
  type: 'rahu_kaal' | 'yamaghanta' | 'gulika' | 'durmuhurta' | 'varjyam';
  start: string;                    // HH:MM
  end: string;
  durationMinutes: number;
}

/** A Muhurat candidate result */
interface MuhuratCandidate {
  date: string;                     // ISO date
  timeStart: string;                // HH:MM — recommended start time
  timeEnd: string;                  // HH:MM — window closes
  durationMinutes: number;

  panchang: PanchangSnapshot;
  lagna: {
    sign: number;                   // 0-11
    signName: string;
    degree: number;
    lordStrength: 'strong' | 'moderate' | 'weak';
    maleficsInKendra: boolean;
    jupiterAspect: boolean;
    moonHouse: number;              // Moon's house from Lagna
  };

  inauspiciousPeriods: InauspiciousPeriod[];  // For the day
  bonusYogas: string[];             // "Sarvartha Siddhi", "Amrita Siddhi", etc.

  scores: {
    tithi: number;
    nakshatra: number;
    yoga: number;
    karana: number;
    vara: number;
    lagna: number;
    cleanPeriod: number;
    bonus: number;
    tarabalam?: number;             // If birth data provided
    chandrabalam?: number;
    transit?: number;
    total: number;
  };

  rating: 1 | 2 | 3 | 4 | 5;       // Star rating
  summary: string;                   // Human-readable verdict
  warnings: string[];                // Any caveats
}

/** Final response to user */
interface MuhuratResult {
  request: MuhuratRequest;
  candidates: MuhuratCandidate[];   // Sorted best-first
  noResultReason?: string;          // If no Muhurat found in range
  metadata: {
    daysScanned: number;
    daysEliminated: number;
    windowsEvaluated: number;
    computeTimeMs: number;
  };
}
```

---

## 7. Screen Wireframes

### 7.1 Event Selection Screen

```
┌─────────────────────────────────┐
│     🕉️  Shubh Muhurat Finder   │
│     Find auspicious timing      │
│                                 │
│  What event?                    │
│  ┌─────────────────────────┐   │
│  │ 💍  Marriage / Lagan     │   │
│  │ 🏠  Griha Pravesh        │   │
│  │ 🧵  Yagnopavit (Mekhla)  │   │
│  │ 🚗  New Vehicle           │   │
│  │ 📚  School Admission      │   │
│  │ 🏢  Business Launch       │   │
│  │ 🙏  Puja / Havan          │   │
│  │ ✈️  Travel                │   │
│  │ ➕  More events...         │   │
│  └─────────────────────────┘   │
└─────────────────────────────────┘
```

### 7.2 Date Range & Location Screen

```
┌─────────────────────────────────┐
│  ← Back        Marriage Muhurat │
│                                 │
│  📅 Date Range                  │
│  ┌────────────┐ ┌────────────┐ │
│  │ From: Apr 1│ │ To: Jun 30 │ │
│  └────────────┘ └────────────┘ │
│                                 │
│  📍 Event Location              │
│  ┌─────────────────────────┐   │
│  │ 🔍 Srinagar, J&K        │   │
│  └─────────────────────────┘   │
│                                 │
│  ⏰ Preferred Time (optional)   │
│  ┌────────────┐ ┌────────────┐ │
│  │ After: 6AM │ │ Before: 8PM│ │
│  └────────────┘ └────────────┘ │
│                                 │
│  📋 Preferred Days (optional)   │
│  [Mon] [Wed] [Thu] [Fri] [Sat] │
│                                 │
│  ─── Personalize (optional) ─── │
│  ┌─────────────────────────┐   │
│  │ ➕ Add Bride's Details   │   │
│  │ ➕ Add Groom's Details   │   │
│  └─────────────────────────┘   │
│                                 │
│  [    🔮 Find Muhurats    ]     │
└─────────────────────────────────┘
```

### 7.3 Results Screen

```
┌─────────────────────────────────┐
│  ← Back     3 Muhurats Found   │
│                                 │
│  ┌─── ★★★★★ BEST ───────────┐ │
│  │ 📅 Thursday, April 16      │ │
│  │ ⏰ 10:24 AM – 12:48 PM     │ │
│  │                             │ │
│  │ Chaitra Sh. Dashami (10)    │ │
│  │ Nakshatra: Pushya           │ │
│  │ Yoga: Siddhi                │ │
│  │ Lagna: Gemini               │ │
│  │                             │ │
│  │ ✨ Guru Pushya Yoga!        │ │
│  │ ✨ Sarvartha Siddhi Yoga    │ │
│  │ Score: 94/100               │ │
│  │                             │ │
│  │ [View Details]              │ │
│  └─────────────────────────────┘ │
│                                 │
│  ┌─── ★★★★ VERY GOOD ──────┐  │
│  │ 📅 Monday, April 21       │ │
│  │ ⏰ 7:15 AM – 9:30 AM      │ │
│  │ Vaishakh Sh. Dwitiya (2)   │ │
│  │ Nakshatra: Rohini           │ │
│  │ Score: 82/100               │ │
│  │ [View Details]              │ │
│  └─────────────────────────────┘ │
│                                 │
│  ┌─── ★★★ GOOD ────────────┐  │
│  │ 📅 Friday, May 2          │ │
│  │ ...                        │ │
│  └─────────────────────────────┘ │
└─────────────────────────────────┘
```

### 7.4 Detail View (Single Muhurat)

```
┌─────────────────────────────────┐
│  ← Back     Muhurat Details     │
│                                 │
│  ★★★★★ Thursday, April 16      │
│  10:24 AM – 12:48 PM IST       │
│  Score: 94 / 100                │
│                                 │
│  ─── Panchang ───               │
│  Tithi    : Shukla Dashami (10) │
│  Nakshatra: Pushya (♋ Cancer)   │
│  Yoga     : Siddhi              │
│  Karana   : Gara                │
│  Vara     : Thursday (Jupiter)  │
│  Sunrise  : 6:12 AM             │
│  Sunset   : 6:48 PM             │
│                                 │
│  ─── Lagna Chart ───            │
│  Rising: Gemini 14°22'          │
│  Lord: Mercury (strong)         │
│  Jupiter aspects Lagna  ✅       │
│  No malefics in 1,7,8  ✅       │
│  Moon in 11th (excellent)✅      │
│                                 │
│  ─── Bonus Yogas ───            │
│  ✨ Guru Pushya Yoga (Thu+Pushya)│
│  ✨ Sarvartha Siddhi Yoga       │
│                                 │
│  ─── Avoid Today ───            │
│  ⚠️ Rahu Kaal: 1:30–3:00 PM    │
│  ⚠️ Gulika: 9:00–10:24 AM      │
│                                 │
│  ─── Personalized ───           │
│  Tarabalam: Sampat (2nd) ✅      │
│  Chandrabalam: 11th ✅           │
│                                 │
│  ─── Scores Breakdown ───       │
│  Tithi      ██████████████ 14   │
│  Nakshatra  ███████████████ 15  │
│  Yoga       ████████░░░░░░  8   │
│  Karana     ████░░░░░░░░░░  4   │
│  Vara       ██████████░░░░ 10   │
│  Lagna      ████████████████ 23 │
│  Clean      ██████████░░░░ 10   │
│  Bonus      ██████████░░░░ 10   │
│  ─────────────────────── 94     │
│                                 │
│  [📋 Copy Muhurat]  [📤 Share]  │
└─────────────────────────────────┘
```

---

## 8. Technical Approach

### 8.1 Computation Engine

The Muhurat engine reuses the existing HinduCalendar astronomy functions and extends them:

| Existing (from HinduCalendar.ts) | New (Muhurat-specific) |
|----------------------------------|----------------------|
| `tropicalSolarLongitude()` | `computeLagna(jd, lat, lon)` — Ascendant calculation |
| `moonEclipticLongitude()` | `computeHouses(jd, lat, lon)` — 12 house cusps |
| `siderealSolarLongitude()` | `computeRahuKaal(sunrise, sunset, vara)` |
| `getLunarDay()` / `rawTithiAtJD()` | `computeYamaghanta(sunrise, sunset, vara)` |
| `computeNewMoonJD()` | `computeGulikaKaal(sunrise, sunset, vara)` |
| `findPreviousNewMoon()` | `isAdhikMaas(lunarMonth)` |
| `gregorianToJD()` | `isBhadraKarana(tithi, halfFlag)` |
| | `computeSunriseSunset(jd, lat, lon)` |
| | `getNakshatraAtJD(jd)` — Moon's nakshatra at any moment |
| | `getYogaAtJD(jd)` — Panchang Yoga at any moment |
| | `checkSarvarthaSiddhi(vara, nakshatra)` |
| | `checkAmritaSiddhi(vara, nakshatra)` |
| | `computeTabalam(birthNak, muhuratNak)` |
| | `computeChandrabalam(birthMoon, muhuratMoon)` |

### 8.2 Performance Considerations

A typical Muhurat search over a **3-month date range** involves:
- ~90 days to scan
- ~12 hours per day (6 AM – 6 PM)
- Lagna changes every ~2 hours → ~6 Lagna windows per day
- **~540 candidate windows** to evaluate

Each evaluation requires:
- 2 planetary position calculations (Sun, Moon minimum)
- 1 Lagna calculation
- 9 Graha positions for full Lagna analysis
- ~5 inauspicious period calculations

**Optimization strategies:**
1. **Early pruning:** Eliminate full days in Phase 1 before computing windows
2. **Cache planetary positions:** Positions change slowly; interpolate between hourly snapshots
3. **Pre-compute Panchang:** Calculate once per day, not per window
4. **Web Worker:** Run computation off the main thread to keep UI responsive
5. **Progressive results:** Show results as they're found, don't wait for full scan

### 8.3 Offline Capability

All calculations are **pure astronomical math** — no API calls needed. The Muhurat engine runs entirely client-side in the browser/app. This ensures:
- Works offline (crucial for users in areas with poor connectivity)
- No server costs
- Instant results
- Privacy (birth data never leaves the device)

---

## 9. Build Phases

### Phase 1 — Foundation (Core Engine)
- [ ] `computeSunriseSunset()` for any location and date
- [ ] `computeLagna()` — Ascendant from LST + latitude
- [ ] `getNakshatraAtJD()` — Moon's Nakshatra at any JD
- [ ] `getYogaAtJD()` — Panchang Yoga at any JD
- [ ] `getKaranaAtJD()` — Karana from tithi position
- [ ] Rahu Kaal, Yamaghanta, Gulika calculations
- [ ] Unit tests for all functions against known almanac values

### Phase 2 — Event Type Database
- [ ] Define all event types with their rules (§2)
- [ ] Tithi, Nakshatra, Vara, Lagna preference tables per event
- [ ] Seasonal restriction rules (Adhik Maas, Kharmas, Pitru Paksha, Chaturmas)
- [ ] Sarvartha Siddhi, Amrita Siddhi lookup tables
- [ ] Unit tests for rule matching

### Phase 3 — Selection Algorithm
- [ ] Phase 1-2 of pipeline: day elimination + time window finding
- [ ] Phase 3: Lagna evaluation and scoring
- [ ] Phase 4: Bonus Yoga detection
- [ ] Composite scoring system
- [ ] Integration tests: known good Muhurats produce high scores

### Phase 4 — Personalization
- [ ] Tarabalam calculation
- [ ] Chandrabalam calculation
- [ ] Transit analysis (Jupiter, Saturn over natal chart)
- [ ] Score adjustment with personalization
- [ ] Tests for personalized scoring

### Phase 5 — UI (Event Selection + Input)
- [ ] Event type picker screen
- [ ] Date range and location input screen
- [ ] Optional birth details entry
- [ ] Form validation
- [ ] Location search with KP-relevant city presets

### Phase 6 — UI (Results + Detail)
- [ ] Results list with star ratings and score bars
- [ ] Detail view with Panchang, Lagna chart, score breakdown
- [ ] Copy/Share Muhurat functionality
- [ ] "No Muhurat found" state with suggestions (extend range, relax constraints)
- [ ] Loading/progress indicator during computation

### Phase 7 — Validation & Polish
- [ ] Validate against published Panchangs and professional astrologer Muhurats
- [ ] Edge cases: polar regions, extreme latitudes, date boundaries
- [ ] Performance optimization (Web Worker, caching)
- [ ] Accessibility and responsive layout
- [ ] KP community beta testing

---

## 10. Validation Strategy

### 10.1 Known Muhurat Cross-Reference

Validate the engine against published Muhurats from reputable Panchangs:

| Source | Usage |
|--------|-------|
| Drik Panchang (drikpanchang.com) | Cross-check Shubh Muhurat listings |
| Prokerala Muhurat | Compare marriage/Griha Pravesh Muhurats |
| Local KP Pandit Janthari (printed) | Ground truth for KP-specific dates |
| Kundli software (Jagannatha Hora, etc.) | Lagna and planetary position verification |

### 10.2 Test Cases

| Test | Expected |
|------|----------|
| Marriage Muhurat April 2026 (Srinagar) | Should find dates matching Drik Panchang |
| Griha Pravesh during Kharmas (Dec 16-Jan 14) | Should return zero results |
| Event during Pitru Paksha | Should return zero results |
| Guru Pushya Yoga detection | Should flag all Thursdays with Pushya Nakshatra |
| Bhadra Karana avoidance | No Muhurat should fall during Bhadra/Vishti |
| Score 95+ candidate | Must have auspicious tithi + good Nakshatra + strong Lagna + bonus Yoga |

---

## 11. KP-Specific Considerations

| Consideration | Details |
|--------------|---------|
| **Default location** | Srinagar (34.0837°N, 74.7973°E) — many users are KP diaspora but events reference Kashmir time |
| **Saath format** | The Muhurat output should resemble the traditional "Saath chit" — date, time, tithi, Nakshatra, Lagna |
| **Herath Muhurat** | Special handling: Herath (Maha Shivaratri) puja timing follows KP-specific rules |
| **Navreh association** | Navreh is the most auspicious day in the KP calendar — should appear as top recommendation if it falls in the search range |
| **Language** | Support both English and Kashmiri/Hindi terms for all astrological concepts |
| **Pure day awareness** | When showing a Muhurat, also mention if the eve (Pure) day has any significance |
| **Pandit consultation note** | Disclaimer: "This tool provides astrological guidance. For traditional ceremonies, also consult your family Pandit." |
