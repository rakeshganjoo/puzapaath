# Janthari Calculation Note For Panditji (Single Document)

Pandit Ji pranam,

This is one complete and simple note explaining how Janthari does calculations today, what date/year system it follows, how rashi is derived, and what we use for validation.

## 1) Short Truth Statement

- Calendar/Tithi: astronomical, active.
- Tekni (kundali): astronomical, active.
- Muhurat: astronomical slot-based, active.
- No random/fake logic in these modules.

Main code files:
- `src/services/HinduCalendar.ts`
- `src/services/TekniService.ts`
- `src/services/MuhuratEngine.ts`

## 2) Calendar System Used (Date + Year Logic)

Janthari follows KP tradition logic with these rules:

1. Gregorian date is input (`YYYY-MM-DD`).
2. Lunar day (tithi) is calculated from Moon-Sun angular difference.
3. Day assignment is done at Kashmir sunrise convention.
4. Month naming uses Purnimant method.
5. Samvat reference in code comments is Saptarishi Samvat (epoch 3076 BCE / Nechipattri tradition).

Important note:
- App display is primarily Gregorian date + computed lunar output.
- Saptarishi epoch is a traditional reference basis in the engine notes, not a separate user-entered calendar.

## 3) Tithi Calculation (Simple Language)

Formula idea:
- First compute Sun longitude and Moon longitude.
- Then compute elongation = Moon - Sun (0° to 360°).
- Every 12° is one tithi.
- So tithi number = ceiling(elongation / 12).

Practical meaning:
- 1-15 = Shukla Paksha
- 16-30 = Krishna Paksha
- Krishna 30 maps to Amavasya side logic; Shukla 15 is Purnima side logic.

Boundary handling included:
- Kshaya tithi handling near paksha boundaries.
- Adhika (repeated/vriddhi) detection in monthly calendar generation.

Code reference:
- `src/services/HinduCalendar.ts` (`rawTithiAtJD`, `getLunarDay`, `getMonthCalendar`)

## 4) Month Calculation (Purnimant Method)

How month name is decided:

1. Find the new moon beginning that lunation.
2. Compute Sun sidereal rashi at that new moon.
3. Map that rashi to base month.
4. If Krishna paksha, shift to next month name (Purnimant shift).

Rashi-to-month map used in engine:
- Mesha -> Vaishakh
- Vrishabha -> Jyeshtha
- Mithuna -> Ashadh
- Karka -> Shravan
- Simha -> Bhadrapad
- Kanya -> Ashwin
- Tula -> Kartik
- Vrishchika -> Margshirsh
- Dhanu -> Paush
- Makara -> Magh
- Kumbha -> Phalgun
- Meena -> Chaitra

Code reference:
- `src/services/HinduCalendar.ts` (`RASHI_TO_MONTH`, `getLunarMonth`)

## 5) Rashi Method Used In Janthari

Janthari uses sidereal zodiac logic (nirayana) with Lahiri ayanamsha.

### In Calendar Engine
- Sun tropical longitude is computed.
- Lahiri ayanamsha is subtracted.
- Result gives sidereal solar longitude.
- `floor(longitude / 30)` gives rashi index.

### In Tekni Engine
- Sun, Moon, and planets are first computed in tropical frame.
- Lahiri ayanamsha converts them to sidereal frame.
- Each graha rashi = `floor(sidereal_longitude / 30)`.
- Moon sidereal longitude gives Nakshatra and Pada.

Code reference:
- `src/services/HinduCalendar.ts` (`siderealSolarLongitude`)
- `src/services/TekniService.ts` (`ayanamsha`, `sid`, `makeGraha`, `nakPada`)

## 6) Astronomical Methods Used

### Calendar (`HinduCalendar.ts`)
- New moon timing: Meeus new-moon algorithm.
- Sun longitude: standard solar formula.
- Moon longitude: Meeus Chapter 47 main-term lunar model.

### Tekni (`TekniService.ts`)
- Sun: Meeus solar formula.
- Moon: Meeus lunar terms.
- Mars/Mercury/Jupiter/Venus/Saturn: orbital-element based geocentric method.
- Rahu: mean node formula.
- Ketu: 180° opposite Rahu.
- Lagna: local sidereal time + latitude/longitude.

### Muhurat (`MuhuratEngine.ts`)
- Scans date range and time slots.
- Computes sunrise/sunset by location.
- Computes Rahu Kaal, Yamaghanta, Gulika and rejects overlaps.
- Computes tithi, nakshatra, yoga, karana, vara, moon sign, lagna for each slot.
- Scores by event rules and returns top-ranked options.

## 7) Dates/Years Validation We Already Keep

Golden suite in code:
- `__tests__/GoldenValidation.test.ts`

Current anchored dates include:
- 1975-01-03 (family validation note)
- 2024 Holi, Raksha Bandhan, Janmashtami, Ganesh Chaturthi, Dussehra, Gita Jayanti
- 2025 Herath (Maha Shivratri), Diwali

Special handling in validation:
- Some festivals are checked by observance-time (not sunrise only), for example Dussehra/Diwali style checks.

Additional basic tests:
- `__tests__/HinduCalendar.test.ts`
- `__tests__/TekniService.test.ts`

## 8) About "NASA Date Sync" / External Sync

Current status (important clarity):
- Janthari does not call live NASA/JPL API at runtime.
- It uses embedded astronomical formulas (Meeus/orbital methods) locally.
- Accuracy is guarded by golden festival/date anchors and repeatable tests.

What this means:
- No internet dependency for daily calendar math.
- Deterministic output from same input.
- Validation currently comes from trusted reference dates and festival anchors in tests.

If required by Panditji, we can add a future audit layer:
- Periodic offline comparison report against external ephemeris tables (for example JPL/NASA data dumps or other trusted Panchang references), then keep signed comparison records.

## 9) What Is Still Pending (Already Planned)

- Expand golden suite with 20-30 more KP-specific family/Pandit dates.
- Add city-specific sunrise/sunset goldens (Srinagar, Jammu, Delhi, diaspora cities).
- Add Pandit-approved muhurat window goldens to externally anchor ranking.

## 10) One-Page Summary For Validation Conversation

If you want to present in two lines:

1. Janthari computes calendar, tekni, and muhurat using astronomy formulas (not lookup-only, not random).
2. It validates against fixed known dates/festivals and is ready for Pandit-led cross-check expansion.

With respect, this document is intentionally transparent so Panditji can challenge each step and we can improve further.
