# Jyotish (Vedic Astrology) — Functional Requirements

> **Feature Tile:** Jyotish — Vedic Astrology  
> **App:** Janthari (जंथ्री)  
> **Status:** Coming Soon  
> **Last Updated:** March 19, 2026

---

## 1. What is Jyotish?

**Jyotish** (ज्योतिष) literally means "science of light" — the Vedic system of astrology. While Zatukh provides a static birth chart and Tekni handles marriage matching, **Jyotish in Janthari** is the **living, dynamic astrology feature** — daily predictions, transit tracking, personalized alerts, and real-time planetary guidance.

### How it Fits in Janthari

| Feature | Nature | Timeframe |
|---------|--------|-----------|
| **KP Calendar** | Reference | Year-long calendar view |
| **Tithi Calculator** | Tool | One-time lookup |
| **Puja Paath** | Guide | Event-specific |
| **Tekni** | Analysis | One-time (for matching) |
| **Zatukh** | Analysis | One-time (birth chart) |
| **Jyotish** | **Living** | **Daily/weekly/monthly — ongoing** |

Jyotish is the feature that brings users **back every day**. It's the personalized "what does today mean for me?" experience.

### KP Community Context

In Kashmiri Pandit tradition:
- Families consult Jyotishis before major decisions (marriage, travel, business)
- **Panchang** (daily calendar) is checked every morning for auspicious timings
- **Rahu Kaal** (inauspicious period ruled by Rahu) is avoided for new beginnings
- **Sade Sati** awareness is deeply embedded — people know when Saturn is transiting their Moon
- **Dasha changes** are significant life markers — "My Saturn Mahadasha started"

---

## 2. Feature Overview

Jyotish provides three tiers of astrological guidance:

### Tier 1 — Universal (No Birth Data Needed)
Available to everyone, no login or birth details required:
- **Today's Panchang** — Tithi, Nakshatra, Yoga, Karana, Rahu Kaal
- **Planetary Positions Today** — Where are the 9 Grahas right now
- **Auspicious/Inauspicious Timings** — Rahu Kaal, Yamaghanta, Gulika
- **General Daily Rashi Predictions** — For all 12 Moon signs

### Tier 2 — Personalized (Birth Data Required)
Requires a saved Zatukh (birth chart):
- **My Day Today** — Personalized daily prediction based on transits over birth chart
- **Current Dasha Period** — What Mahadasha/Antardasha is active and what it means
- **Transit Alerts** — Significant planetary movements affecting your chart
- **Sade Sati Status** — Active/inactive with phase details

### Tier 3 — Deep Analysis (Requires Zatukh)
For users who want detailed astrological analysis:
- **Monthly Forecast** — Detailed month-ahead predictions per life area
- **Upcoming Events** — Best dates for marriage, travel, property, etc.
- **Retrograde Impact** — How Mercury/Saturn/Jupiter retrogrades affect your chart
- **Eclipse Analysis** — Solar/Lunar eclipse impact on your natal chart

---

## 3. Core Calculations

### 3.1 Daily Panchang — The Five Limbs

**Panchang** (पंचांग) means "five limbs" — the five elements that define each moment in the Vedic calendar.

| # | Limb | Sanskrit | What It Is | How to Calculate |
|---|------|----------|------------|------------------|
| 1 | **Tithi** | तिथि | Lunar day (1–30). Angular distance between Sun and Moon ÷ 12° | `(MoonLong - SunLong) / 12` → tithi number |
| 2 | **Nakshatra** | नक्षत्र | Moon's current star mansion (1–27). Moon's sidereal longitude ÷ 13°20' | `MoonLong / 13.333` → nakshatra number |
| 3 | **Yoga** | योग | Sun + Moon combined longitude ÷ 13°20'. 27 Yogas total | `(SunLong + MoonLong) / 13.333` → yoga number |
| 4 | **Karana** | करण | Half-tithi. Each tithi has 2 karanas. 11 karana types. | Derived from tithi position (first or second half) |
| 5 | **Vara** | वार | Day of the week (Sunday=Ravi, Monday=Soma, etc.) | Standard day calculation |

#### The 27 Yogas

| # | Yoga | Nature | # | Yoga | Nature |
|---|------|--------|---|------|--------|
| 1 | Vishkumbha | Inauspicious | 15 | Vajra | Inauspicious |
| 2 | Priti | Auspicious | 16 | Siddhi | Auspicious |
| 3 | Ayushman | Auspicious | 17 | Vyatipata | Inauspicious |
| 4 | Saubhagya | Auspicious | 18 | Variyan | Auspicious |
| 5 | Shobhana | Auspicious | 19 | Parigha | Inauspicious |
| 6 | Atiganda | Inauspicious | 20 | Shiva | Auspicious |
| 7 | Sukarma | Auspicious | 21 | Siddha | Auspicious |
| 8 | Dhriti | Auspicious | 22 | Sadhya | Auspicious |
| 9 | Shula | Inauspicious | 23 | Shubha | Auspicious |
| 10 | Ganda | Inauspicious | 24 | Shukla | Auspicious |
| 11 | Vriddhi | Auspicious | 25 | Brahma | Auspicious |
| 12 | Dhruva | Auspicious | 26 | Indra | Auspicious |
| 13 | Vyaghata | Inauspicious | 27 | Vaidhriti | Inauspicious |
| 14 | Harshana | Auspicious | | | |

#### The 11 Karanas

**Fixed Karanas** (occur once per lunar month):
| Karana | Occurs On |
|--------|-----------|
| Kimstughna | 1st half of Shukla Pratipada |
| Shakuni | 2nd half of Krishna Chaturdashi |
| Chatushpada | 1st half of Amavasya |
| Naga | 2nd half of Amavasya |

**Repeating Karanas** (cycle through, 7 types × 8 rounds = 56 halves):
Bava, Balava, Kaulava, Taitila, Gara, Vanija, Vishti (Bhadra)

**Vishti (Bhadra)** is considered inauspicious — avoid starting new work during Vishti Karana.

### 3.2 Inauspicious Daily Periods

#### Rahu Kaal (राहु काल)
A daily ~90-minute inauspicious period ruled by Rahu. Avoid starting new ventures, travel, or important work.

**Calculation method:** Divide daylight hours into 8 equal parts. Rahu Kaal occurs in a specific part depending on the weekday:

| Day | Rahu Kaal Part # | Approximate Time (for ~6am-6pm day) |
|-----|------------------|--------------------------------------|
| Sunday | 8th | 4:30 PM – 6:00 PM |
| Monday | 2nd | 7:30 AM – 9:00 AM |
| Tuesday | 7th | 3:00 PM – 4:30 PM |
| Wednesday | 5th | 12:00 PM – 1:30 PM |
| Thursday | 6th | 1:30 PM – 3:00 PM |
| Friday | 4th | 10:30 AM – 12:00 PM |
| Saturday | 3rd | 9:00 AM – 10:30 AM |

**Mnemonic:** "Mother Saw Father Wearing The Turban on Sunday"
(Mon-Sat-Fri-Wed-Thu-Tue-Sun → 2-3-4-5-6-7-8)

**Precise calculation:**
```
daylight_duration = sunset - sunrise
part_duration = daylight_duration / 8
rahu_start = sunrise + (part_number - 1) × part_duration
rahu_end = rahu_start + part_duration
```

Requires **sunrise/sunset** for the user's location on that date.

#### Yamaghanta (यमघंट)
Another inauspicious period, following a different weekday rotation:

| Day | Part # |
|-----|--------|
| Sunday | 5th |
| Monday | 4th |
| Tuesday | 3rd |
| Wednesday | 2nd |
| Thursday | 1st |
| Friday | 7th |
| Saturday | 6th |

#### Gulika Kaal (गुलिक काल)
Saturn's son — another inauspicious period:

| Day | Part # |
|-----|--------|
| Sunday | 7th |
| Monday | 6th |
| Tuesday | 5th |
| Wednesday | 4th |
| Thursday | 3rd |
| Friday | 2nd |
| Saturday | 1st |

#### Abhijit Muhurat (अभिजित मुहूर्त)
The single most auspicious period every day — approximately **48 minutes around solar noon**. Overrides most negative timings.

```
abhijit_start = solar_noon - 24 minutes
abhijit_end = solar_noon + 24 minutes
```

Note: Not applicable on Wednesdays (debated — some traditions say it's fine).

### 3.3 Sunrise/Sunset Calculation

Required for Rahu Kaal and all time-based calculations:

- Use **astronomical sunrise/sunset** (center of sun disc at horizon, accounting for atmospheric refraction)
- Inputs: date, latitude, longitude
- Libraries: `suncalc` (npm) or compute using standard solar position algorithms
- For KP community defaults: Srinagar, Jammu, Delhi sunrise/sunset times

### 3.4 Current Planetary Positions

Compute the sidereal longitude of all 9 Grahas for the **current date and time**:

| Display | Details |
|---------|---------|
| Graha name | Sun, Moon, Mars, etc. |
| Current Rashi | Which zodiac sign it's in |
| Degree in Rashi | Exact degree (e.g., 15°24' in Meena) |
| Nakshatra | Which lunar mansion |
| Retrograde? | ℞ symbol if retrograde |
| Speed | Normal / Slow / Stationary / Retrograde |

**Retrograde periods** are significant — Mercury retrograde is well-known, but Saturn and Jupiter retrogrades also matter in Vedic astrology.

### 3.5 Transit Analysis (Gochar)

**Gochar** = transit of planets over the natal (birth) chart positions.

For a personalized user, compute:
1. Current position of each transit planet
2. Which **natal house** it's transiting through (from Moon sign — standard in Vedic transit analysis)
3. **Ashtakavarga bindus** for that planet in that transit sign (from Zatukh data)

#### Key Transit Events

| Transit | Significance | Duration |
|---------|--------------|----------|
| **Jupiter changes sign** | Major shift in fortune/focus | ~1 year |
| **Saturn changes sign** | Major life restructuring | ~2.5 years |
| **Rahu/Ketu change axis** | Karmic theme shifts | ~18 months |
| **Mercury retrograde** | Communication/tech disruptions | ~3 weeks, 3-4× per year |
| **Mars changes sign** | Energy/conflict shifts | ~45 days |
| **Venus retrograde** | Relationship/finance review | ~40 days, every 18 months |
| **Eclipse (Solar/Lunar)** | Powerful triggering events | Day-specific |

#### Transit Results by House (from Moon)

| Transit House | General Effect |
|---------------|----------------|
| 1st | Stress, health awareness, new beginnings (mixed) |
| 2nd | Financial matters, family focus |
| 3rd | Courage, communication, short trips (generally good) |
| 4th | Home, mother, emotional state |
| 5th | Children, creativity, romance |
| 6th | Victory over enemies, health improvement (good) |
| 7th | Partnerships, marriage matters |
| 8th | Obstacles, transformation, hidden matters (challenging) |
| 9th | Fortune, father, travel, spirituality (good) |
| 10th | Career, status, reputation |
| 11th | Gains, income, social success (best house) |
| 12th | Expenses, foreign connections, spiritual growth |

**Vedha (Obstruction) Points:** Some transit positions from Moon have Vedha points — a planet in the Vedha house blocks the good/bad result of the transit. Include Vedha checking.

### 3.6 Sade Sati Calculation

**Sade Sati** (साढ़े साती) — Saturn's 7.5-year transit through the 12th, 1st, and 2nd houses from natal Moon sign.

**Three Phases:**

| Phase | Name | Saturn transiting | Duration | Nature |
|-------|------|-------------------|----------|--------|
| 1 | Rising (Ascending) | 12th from Moon | ~2.5 years | Mental pressure, hidden expenses, sleep issues |
| 2 | Peak | Over natal Moon (1st from Moon) | ~2.5 years | Maximum intensity — health, mind, career challenges |
| 3 | Setting (Descending) | 2nd from Moon | ~2.5 years | Financial pressure, family issues, speech matters |

**Calculation:**
```
user_moon_sign = from Zatukh
saturn_current_sign = from ephemeris

if saturn in (moon_sign - 1): Phase 1 (Rising)
if saturn in (moon_sign):     Phase 2 (Peak)
if saturn in (moon_sign + 1): Phase 3 (Setting)
```

**Saturn transit dates (for reference/validation):**

| Sign | Saturn Entry | Saturn Exit |
|------|-------------|-------------|
| Makara (Capricorn) | Jan 2020 | Apr 2022 |
| Kumbha (Aquarius) | Apr 2022 | Mar 2025 |
| Meena (Pisces) | Mar 2025 | Jun 2027 |
| Mesha (Aries) | Jun 2027 | Aug 2029 |
| ... | ... | ... |

Show: Past Sade Sati periods, current status, next occurrence, and intensity based on Ashtakavarga bindus of Saturn in those signs.

### 3.7 Daily Rashi Predictions (General — for all 12 signs)

Rule-based predictions considering:
1. **Moon's transit** — Where Moon is today relative to the user's Moon sign
2. **Planetary aspects** forming today
3. **Tithi** — Certain tithis are better for certain activities
4. **Nakshatra** — Moon's Nakshatra affects the day's character

For each Rashi, generate predictions covering:
- Overall mood/energy
- Career/work
- Relationships
- Health
- Lucky color/number (traditional)

**Approach:** Use a combination of:
- Moon transit through 12 houses from each Rashi → base prediction
- Modify with day's Yoga (auspicious/inauspicious)
- Modify with active planetary aspects (benefic/malefic)

---

## 4. User Interface — Screens

### Screen 1: Jyotish Home (Daily View)

```
┌──────────────────────────────────────┐
│  ⭐ Jyotish — March 19, 2026         │
│  Wednesday (Budhvar)                 │
│                                      │
│  ┌──────────────────────────────┐   │
│  │  📅 Today's Panchang         │   │
│  │                               │   │
│  │  Tithi: Shukla Panchami (5)   │   │
│  │  Nakshatra: Rohini            │   │
│  │  Yoga: Saubhagya (Auspicious) │   │
│  │  Karana: Balava               │   │
│  │  Sunrise: 6:23 AM             │   │
│  │  Sunset: 6:31 PM              │   │
│  └──────────────────────────────┘   │
│                                      │
│  ┌──────────────────────────────┐   │
│  │  ⏰ Today's Timings           │   │
│  │                               │   │
│  │  🔴 Rahu Kaal: 12:00-1:27 PM │   │
│  │  🟡 Yamaghanta: 7:30-9:00 AM │   │
│  │  🟡 Gulika: 10:30-12:00 PM   │   │
│  │  ✅ Abhijit: 12:03-12:51 PM  │   │
│  └──────────────────────────────┘   │
│                                      │
│  ┌──────────────────────────────┐   │
│  │  🪐 Planet Positions          │   │
│  │  ☉ Sun    → Meena  15°24'    │   │
│  │  ☽ Moon   → Vrishabha 8°12'  │   │
│  │  ♂ Mars   → Mithuna 22°08'   │   │
│  │  ☿ Mercury→ Kumbha 28°44' ℞  │   │
│  │  ♃ Jupiter→ Mithuna 20°31'   │   │
│  │  ♀ Venus  → Mesha 5°19'      │   │
│  │  ♄ Saturn → Meena 3°47'      │   │
│  │  ☊ Rahu   → Meena 27°05'     │   │
│  │  ☋ Ketu   → Kanya 27°05'     │   │
│  └──────────────────────────────┘   │
│                                      │
│  ┌────────┬────────┬────────┐       │
│  │My Day  │Rashifal│Transits│       │
│  └────────┴────────┴────────┘       │
└──────────────────────────────────────┘
```

### Screen 2: My Day (Personalized — requires Zatukh)

```
┌──────────────────────────────────────┐
│  ☀️ My Day — March 19, 2026          │
│  For: Rakesh (Karka Rashi)           │
│                                      │
│  Current Dasha:                      │
│  Jupiter → Mercury (until Jun 2026)  │
│  Theme: Learning, communication,     │
│  intellectual growth                 │
│                                      │
│  Today's Transits on Your Chart:     │
│  ┌──────────────────────────────┐   │
│  │ ♃ Jupiter in your 12th house  │   │
│  │   Spiritual growth, expenses  │   │
│  │   on good causes, foreign     │   │
│  │   connections. Moderate day.   │   │
│  └──────────────────────────────┘   │
│  ┌──────────────────────────────┐   │
│  │ ♄ Saturn in your 9th house    │   │
│  │   Discipline in higher        │   │
│  │   learning, long-distance     │   │
│  │   travel may face delays.     │   │
│  └──────────────────────────────┘   │
│                                      │
│  Sade Sati: ❌ Not Active            │
│  Next: Jun 2027 (Saturn → Mesha,     │
│  12th from your Vrishabha Moon)      │
│                                      │
│  ┌──────────────────────────────┐   │
│  │  Today's Rating: ★★★☆☆       │   │
│  │  Best time: 2:30 - 4:00 PM   │   │
│  │  Avoid: 12:00 - 1:27 PM      │   │
│  │  (Rahu Kaal)                  │   │
│  └──────────────────────────────┘   │
└──────────────────────────────────────┘
```

### Screen 3: Rashifal (12 Sign Predictions)

```
┌──────────────────────────────────────┐
│  🔮 Today's Rashifal                 │
│                                      │
│  Select your Rashi:                  │
│  ┌────┬────┬────┬────┐             │
│  │ ♈ │ ♉ │ ♊ │ ♋ │             │
│  │Mesh│Vris│Mith│Kark│             │
│  ├────┼────┼────┼────┤             │
│  │ ♌ │ ♍ │ ♎ │ ♏ │             │
│  │Simh│Kany│Tula│Vris│             │
│  ├────┼────┼────┼────┤             │
│  │ ♐ │ ♑ │ ♒ │ ♓ │             │
│  │Dhan│Maka│Kumb│Meen│             │
│  └────┴────┴────┴────┘             │
│                                      │
│  ♋ Karka (Cancer) — Mar 19, 2026    │
│  ┌──────────────────────────────┐   │
│  │  Overall: ★★★☆☆ Average      │   │
│  │                               │   │
│  │  Moon transits your 11th      │   │
│  │  house today — social gains   │   │
│  │  and networking favored.      │   │
│  │                               │   │
│  │  💼 Career: Steady progress   │   │
│  │  ❤️ Love: Harmonious          │   │
│  │  💰 Finance: Unexpected gain  │   │
│  │  🏥 Health: Watch digestion   │   │
│  │                               │   │
│  │  Lucky: Green, 4, East        │   │
│  └──────────────────────────────┘   │
└──────────────────────────────────────┘
```

### Screen 4: Transit Calendar (Monthly View)

```
┌──────────────────────────────────────┐
│  🪐 Transit Calendar — March 2026    │
│                                      │
│  Upcoming Transits:                  │
│  ┌──────────────────────────────┐   │
│  │ Mar 21 — Sun enters Mesha ☉→♈│  │
│  │ New Vedic Year (Chaitra)      │   │
│  │ Impact: Energizing for Mesha  │   │
│  │ and Simha natives             │   │
│  └──────────────────────────────┘   │
│  ┌──────────────────────────────┐   │
│  │ Mar 25 — Mercury goes direct │   │
│  │ ☿ stations direct in Kumbha   │   │
│  │ Impact: Communication clears, │   │
│  │ tech issues resolve           │   │
│  └──────────────────────────────┘   │
│  ┌──────────────────────────────┐   │
│  │ Apr 2 — Venus enters Vrishabha│  │
│  │ ♀ in own sign (strong)        │   │
│  │ Impact: Good for Vrishabha and│   │
│  │ Tula natives — love, luxury   │   │
│  └──────────────────────────────┘   │
│                                      │
│  [March] [April] [May] [June]       │
└──────────────────────────────────────┘
```

### Screen 5: Planetary Retrograde Tracker

```
┌──────────────────────────────────────┐
│  ℞ Retrogrades — 2026                │
│                                      │
│  Currently Retrograde:               │
│  ┌──────────────────────────────┐   │
│  │ ☿ Mercury ℞                   │   │
│  │ Feb 28 — Mar 25, 2026         │   │
│  │ In Kumbha (Aquarius)          │   │
│  │ ████████████░░░░ 72% done     │   │
│  │ Impact: Review, revise, don't │   │
│  │ sign new contracts             │   │
│  └──────────────────────────────┘   │
│                                      │
│  Upcoming:                           │
│  ♄ Saturn ℞: Jun 8 — Oct 24, 2026  │
│  ♃ Jupiter ℞: Jul 11 — Nov 7, 2026 │
│  ☿ Mercury ℞: Jun 29 — Jul 22, 2026│
│  ♀ Venus ℞: Dec 2026 — Jan 2027    │
│                                      │
│  Past:                               │
│  ☿ Mercury ℞: Feb 28 — Mar 25 ✅    │
└──────────────────────────────────────┘
```

---

## 5. Notifications & Alerts

### 5.1 Daily Notification (Optional)

Morning push notification (configurable time, default 6:30 AM):

```
🌅 Good Morning! Today's Panchang:
Shukla Panchami • Rohini Nakshatra
Rahu Kaal: 12:00-1:27 PM
Your Day Rating: ★★★☆☆
```

### 5.2 Transit Alerts

Push notifications for significant planetary events:

| Event | Notification | When |
|-------|-------------|------|
| **Planet changes sign** | "♃ Jupiter enters Mithuna today — your 12th house. Focus on spiritual growth." | Day of transit |
| **Retrograde starts** | "☿ Mercury goes retrograde today. Double-check communications." | Day of station |
| **Retrograde ends** | "☿ Mercury is direct again! Safe to sign contracts." | Day of station |
| **Eclipse** | "Lunar Eclipse in Kanya tomorrow. Avoid starting new ventures." | 1 day before |
| **Sade Sati phase change** | "Saturn enters your Moon sign — Peak phase of Sade Sati begins." | Day of transit |
| **Dasha change** | "Your Jupiter-Ketu Antardasha begins today." | Day of change |

### 5.3 Notification Settings

User can toggle:
- [ ] Daily Panchang summary
- [ ] Rahu Kaal reminders
- [ ] Transit alerts (major planet sign changes)
- [ ] Retrograde start/end
- [ ] Eclipse alerts
- [ ] Sade Sati updates
- [ ] Dasha period changes
- Time preference for daily notification

---

## 6. Data Requirements

### 6.1 Ephemeris Data

Must compute planetary positions for **any date from 1900–2100**. Two approaches:

**Option A — Swiss Ephemeris (Full)**
- Most accurate (~1 arc-second precision)
- Requires ~2MB of ephemeris data files bundled with app
- npm: `swisseph` (native binding) or WASM port
- Handles all planets including Rahu/Ketu

**Option B — Astronomy-Engine (Lighter)**
- npm: `astronomy-engine` — pure JavaScript, no native bindings
- Accurate to ~1 arc-minute (sufficient for Rashi/Nakshatra determination)
- Smaller bundle size
- May need supplementary computation for mean Rahu/Ketu nodes

**Recommendation:** Start with `astronomy-engine` for Phase 1 (lighter, pure JS, works on web + native). Upgrade to Swiss Ephemeris if higher precision needed later.

### 6.2 Sunrise/Sunset Data

- npm: `suncalc` — widely used, accurate, small package
- Input: date, latitude, longitude
- Output: sunrise, sunset, solar noon, dawn, dusk
- Required for: Rahu Kaal, Yamaghanta, Gulika, Abhijit Muhurat

### 6.3 Location Data

**Pre-loaded cities** (for quick selection):

| City | Lat | Long | Timezone |
|------|-----|------|----------|
| Srinagar | 34.0837 | 74.7973 | IST (UTC+5:30) |
| Jammu | 32.7266 | 74.8570 | IST |
| Delhi | 28.6139 | 77.2090 | IST |
| Mumbai | 19.0760 | 72.8777 | IST |
| Bangalore | 12.9716 | 77.5946 | IST |
| Pune | 18.5204 | 73.8567 | IST |
| Lucknow | 26.8467 | 80.9462 | IST |
| Hyderabad | 17.3850 | 78.4867 | IST |
| Chennai | 13.0827 | 80.2707 | IST |
| Kolkata | 22.5726 | 88.3639 | IST |
| Faridabad | 28.4089 | 77.3178 | IST |
| Noida | 28.5355 | 77.3910 | IST |
| Edison (NJ) | 40.5187 | -74.4121 | EST (UTC-5) |
| Fremont (CA) | 37.5485 | -121.9886 | PST (UTC-8) |
| Plano (TX) | 33.0198 | -96.6989 | CST (UTC-6) |

Include major US cities where KP diaspora lives, plus major Indian cities.

Allow **custom location** via GPS or manual lat/long entry.

### 6.4 Prediction Templates

Rule-based prediction text for:
- 12 Rashis × 12 transit houses × 5 life areas = **720 prediction templates** (minimum)
- 27 Nakshatra descriptions
- 27 Yoga descriptions
- 11 Karana descriptions
- 9 Graha transit interpretations per house

These are static content files — develop with quality traditional astrology references.

---

## 7. Technical Architecture

### 7.1 Computation Flow

```
┌─────────────────────────────────────┐
│           JYOTISH ENGINE            │
│                                     │
│  Input: Current Date/Time + Location│
│         (+ optional: Birth Data)    │
│                                     │
│  ┌─────────────────────────┐       │
│  │  Astronomical Layer     │       │
│  │  • Solar position       │       │
│  │  • Lunar position       │       │
│  │  • All 9 Graha positions│       │
│  │  • Sunrise/Sunset       │       │
│  │  (astronomy-engine +    │       │
│  │   suncalc)              │       │
│  └──────────┬──────────────┘       │
│             │                       │
│  ┌──────────▼──────────────┐       │
│  │  Panchang Calculator    │       │
│  │  • Tithi (from Sun-Moon)│       │
│  │  • Nakshatra (from Moon)│       │
│  │  • Yoga (Sun+Moon)      │       │
│  │  • Karana (from Tithi)  │       │
│  │  • Vara (weekday)       │       │
│  └──────────┬──────────────┘       │
│             │                       │
│  ┌──────────▼──────────────┐       │
│  │  Timing Calculator      │       │
│  │  • Rahu Kaal            │       │
│  │  • Yamaghanta           │       │
│  │  • Gulika               │       │
│  │  • Abhijit Muhurat      │       │
│  └──────────┬──────────────┘       │
│             │                       │
│  ┌──────────▼──────────────┐       │
│  │  Transit Analyzer       │       │
│  │  (Needs birth chart)    │       │
│  │  • Gochar positions     │       │
│  │  • House transits       │       │
│  │  • Sade Sati check      │       │
│  │  • Retrograde impact    │       │
│  │  • Vedha checking       │       │
│  └──────────┬──────────────┘       │
│             │                       │
│  ┌──────────▼──────────────┐       │
│  │  Prediction Generator   │       │
│  │  • Template selection   │       │
│  │  • Modifier application │       │
│  │  • Rating calculation   │       │
│  │  • Lucky attributes     │       │
│  └──────────────────────────┘       │
└─────────────────────────────────────┘
```

### 7.2 Caching Strategy

- **Panchang for today:** Computed once at app launch, cached for the day
- **Planetary positions:** Recompute every hour (planets don't move much intra-day, except Moon)
- **Moon position:** Recompute every 30 minutes (Moon moves ~0.5°/hour — can change Nakshatra)
- **Transit predictions:** Recompute when a transit planet changes sign (checked daily)
- **Sunrise/Sunset:** Cached per location per day

### 7.3 Offline Capability

All Jyotish features must work **completely offline**:
- Ephemeris calculations are local (no API)
- Prediction templates bundled with app
- Sunrise/sunset calculated locally
- Only location detection needs network (fallback: last known location or manual entry)

### 7.4 Data Models

```typescript
interface DailyPanchang {
  date: string;         // ISO date
  vara: string;         // Day name (Ravi, Soma, etc.)
  tithi: {
    name: string;       // e.g., "Shukla Panchami"
    number: number;     // 1-30
    paksha: 'shukla' | 'krishna';
    endTime: string;    // When this tithi ends
  };
  nakshatra: {
    name: string;
    number: number;     // 1-27
    pada: 1 | 2 | 3 | 4;
    endTime: string;
  };
  yoga: {
    name: string;
    number: number;     // 1-27
    nature: 'auspicious' | 'inauspicious';
    endTime: string;
  };
  karana: {
    name: string;
    nature: 'auspicious' | 'inauspicious' | 'neutral';
  };
  sunrise: string;
  sunset: string;
  solarNoon: string;
}

interface DailyTimings {
  rahuKaal: { start: string; end: string };
  yamaghanta: { start: string; end: string };
  gulikaKaal: { start: string; end: string };
  abhijitMuhurat: { start: string; end: string };
}

interface PlanetPosition {
  graha: Graha;
  siderealLongitude: number;
  rashi: Rashi;
  degreeInSign: number;
  nakshatra: Nakshatra;
  nakshatraPada: 1 | 2 | 3 | 4;
  isRetrograde: boolean;
  speed: number;       // degrees per day
}

interface TransitResult {
  graha: Graha;
  currentSign: Rashi;
  houseFromMoon: number;  // 1-12
  ashtakavargaBindus: number;
  interpretation: string;
  impact: 'positive' | 'neutral' | 'challenging';
}

interface DailyPrediction {
  rashi: Rashi;
  date: string;
  overallRating: 1 | 2 | 3 | 4 | 5;
  categories: {
    career: string;
    love: string;
    finance: string;
    health: string;
  };
  luckyColor: string;
  luckyNumber: number;
  luckyDirection: string;
  moonTransitHouse: number;
  activePlanetaryYoga: string;
}

interface SadeSatiStatus {
  isActive: boolean;
  phase?: 'rising' | 'peak' | 'setting';
  startDate?: string;
  endDate?: string;
  saturnSign: Rashi;
  moonSign: Rashi;
  nextSadeSati?: { startDate: string; saturnSign: Rashi };
  previousSadeSati?: { startDate: string; endDate: string };
}
```

---

## 8. Platform Considerations

| Element | Desktop (Web) | Mobile (iPhone/Android) |
|---------|---------------|------------------------|
| Panchang card | Full width, all 5 elements visible | Compact card, tap to expand |
| Planet positions | Table view with degrees | Scrollable list with icons |
| Rashifal grid | 4×3 grid, all visible | 2-column grid, scroll |
| Transit calendar | Horizontal timeline | Vertical card list |
| Notifications | Not applicable (web) | Native push notifications |
| Location | Browser geolocation API | Native GPS |
| Widget | N/A | iOS widget showing today's panchang (future) |

### Mobile-Specific Features (Future)
- **iOS Widget:** Shows today's Tithi, Nakshatra, and Rahu Kaal at a glance
- **Apple Watch Complication:** Rahu Kaal countdown
- **Android Widget:** Same as iOS widget

---

## 9. Content Guidelines

### 9.1 Prediction Tone
- **Balanced** — never doom-and-gloom; always include constructive advice
- **Culturally respectful** — use traditional KP terminology alongside English
- **Non-prescriptive** — "may experience" not "will experience"
- **Empowering** — focus on what the user can do, not just what will happen

### 9.2 Language
- Primary: **English** with KP/Sanskrit terms in parentheses
- Future: Hindi option, Kashmiri option (Devanagari)
- Example: "Today's Tithi is Shukla Panchami (शुक्ल पंचमी) — auspicious for worship and learning."

### 9.3 Disclaimer

> *"Jyotish predictions are based on Vedic astrological principles and are provided for cultural and spiritual reference. They should be viewed as guidance, not guarantees. Use personal judgment for important life decisions."*

---

## 10. Phase Plan

| Phase | Scope | Depends On | Complexity |
|-------|-------|------------|------------|
| **Phase 1** | Daily Panchang — Tithi, Nakshatra, Yoga, Karana, Vara. Sunrise/sunset for any location. | `astronomy-engine` + `suncalc` | Medium |
| **Phase 2** | Daily timings — Rahu Kaal, Yamaghanta, Gulika, Abhijit Muhurat for user's location | Phase 1 (sunrise/sunset) | Low |
| **Phase 3** | Current planetary positions — all 9 Grahas with Rashi, degree, Nakshatra, retrograde status | `astronomy-engine` | Medium |
| **Phase 4** | General Rashifal — daily predictions for all 12 Moon signs, based on Moon transit | Phase 3 + prediction templates | Medium (content-heavy) |
| **Phase 5** | Personalized transit analysis — Gochar over birth chart, house-by-house | Phase 3 + Zatukh integration | Medium |
| **Phase 6** | Sade Sati tracker — current status, phases, past/future periods | Phase 3 + Zatukh | Low |
| **Phase 7** | Retrograde tracker + Eclipse calendar | Phase 3 | Low |
| **Phase 8** | Notifications — daily panchang, transit alerts, retrograde alerts | All above + push notification setup | Medium |
| **Phase 9** | Monthly forecast + detailed life-area predictions | Phase 5 + expanded templates | High (content) |

**Shared dependencies with Tekni/Zatukh:** Phases 1 and 3 (astronomy engine) are the same foundation. Build once, reuse everywhere.

---

## 11. Relationship to Other Features

```
                    ASTRONOMY ENGINE
                   (Planet Positions)
                         │
          ┌──────────────┼──────────────┐
          │              │              │
     ┌────▼────┐   ┌────▼────┐   ┌────▼────┐
     │  TEKNI  │   │ ZATUKH  │   │ JYOTISH │
     │(Match)  │   │(Birth   │   │(Daily   │
     │         │   │ Chart)  │   │ Living) │
     │ Static  │   │ Static  │   │ Dynamic │
     │ One-time│   │ One-time│   │ Every   │
     │         │   │         │   │ day     │
     └────┬────┘   └────┬────┘   └────┬────┘
          │              │              │
          │         ┌────▼────┐         │
          └────────▶│  SAVED  │◀────────┘
                    │ ZATUKH  │
                    │ (Birth  │
                    │  Data)  │
                    └─────────┘
                         │
                    Used by Jyotish for
                    personalized predictions
                    & transit analysis
```

- **Jyotish reads from saved Zatukh** for personalized features (Tiers 2 & 3)
- **KP Calendar** already shows Tithi/Panchang — Jyotish goes deeper with timings and predictions
- **Muhurat Finder** (separate tile) shares the same Panchang + timing engine

---

## 12. Glossary (Jyotish-specific terms)

| Term | Meaning |
|------|---------|
| **Jyotish** | "Science of Light" — Vedic astrology |
| **Panchang** | "Five Limbs" — daily Vedic calendar (Tithi, Nakshatra, Yoga, Karana, Vara) |
| **Gochar** | Transit — movement of planets through signs relative to birth chart |
| **Rahu Kaal** | Daily inauspicious period ruled by Rahu (~90 min) |
| **Yamaghanta** | Daily inauspicious period ruled by Yama (death) |
| **Gulika** | Daily inauspicious period ruled by Saturn's son |
| **Abhijit Muhurat** | Daily most auspicious ~48-minute period around solar noon |
| **Rashifal** | Daily/weekly/monthly predictions per zodiac sign |
| **Vedha** | Obstruction point — blocks the transit result of a planet |
| **Karana** | Half-tithi — 11 types, used in Muhurat selection |
| **Yoga (Panchang)** | One of 27 daily Yogas from Sun+Moon combined longitude (different from chart Yogas) |
| **Vara** | Day of the week in Vedic system (Ravi-var, Soma-var, etc.) |
| **Station** | When a planet appears to stop before reversing direction (retrograde ↔ direct) |
| **Combustion** | Planet within a certain degree of Sun — loses visibility and strength |
| **Sade Sati** | 7.5-year Saturn transit through 12th, 1st, 2nd from Moon — major life phase |
