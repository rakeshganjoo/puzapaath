Pranam Pandit Ji,

Sharing one simple note about how Janthari is calculating today, so you can validate and guide us.

In Janthari, Calendar, Tekni, and Muhurat are all using real calculation logic. No random or fake logic is used.

We take normal Gregorian date as input, then convert using Surya-Chandra positions.

Tithi calculation is done like this:
1. Compute Moon longitude and Sun longitude.
2. Find angular difference (Moon - Sun), from 0 to 360.
3. Every 12 degree is one tithi.
4. So tithi number = ceiling((Moon - Sun angle) / 12).
5. Day assignment is done using Kashmir sunrise convention.

Paksha logic:
- 1 to 15 = Shukla Paksha
- 16 to 30 = Krishna Paksha

Month (maas) logic is Purnimant:
1. Find the new moon starting that lunation.
2. Check Sun sidereal rashi at that new moon.
3. That gives base month.
4. In Krishna paksha we apply next-month shift (standard Purnimant rule).

Rashi method:
- We use sidereal (nirayana) zodiac with Lahiri ayanamsha.
- In Tekni, graha positions (Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn, Rahu, Ketu) are calculated from astronomy formulas.
- Lagna is calculated from local sidereal time + latitude + longitude.
- Nakshatra and pada are from Moon sidereal longitude.

Simple source + formula note for above points:
- Main source: Jean Meeus, Astronomical Algorithms (2nd edition), especially solar/lunar position chapters and orbital-element method.
- Sidereal conversion used in app: sidereal longitude = tropical longitude - ayanamsha.
- Lahiri ayanamsha used in engine (linear form in code): ayanamsha ~= 23.856 + 0.0137 * (JD - 2451545.0) / 365.25.
- Rashi formula: rashi index = floor(sidereal_longitude / 30) + 1.

Graha formulas (simple):
- Sun: standard solar equation from Meeus (mean longitude + equation of center).
- Moon: Meeus lunar periodic terms (main terms).
- Mars/Mercury/Jupiter/Venus/Saturn: orbital elements -> solve Kepler equation -> heliocentric to geocentric longitude.
- Rahu: mean ascending node formula (Meeus style):
	Rahu ~= 125.0445479 - 1934.1362608*T + 0.0020762*T^2 (+ small higher terms), where T is Julian centuries from J2000.
- Ketu = Rahu + 180 deg.

Lagna formula (simple):
- First compute GMST and then Local Sidereal Time (LST): LST = GMST + longitude.
- Then ascendant longitude from latitude + obliquity + LST using spherical astronomy relation:
	asc = atan2(-cos(theta), sin(epsilon)*tan(phi) + cos(epsilon)*sin(theta))
	where theta = LST, phi = latitude, epsilon = obliquity.

Nakshatra and Pada formula:
- One nakshatra span = 13 deg 20 min (= 13.3333 deg).
- Nakshatra index = floor(moon_sidereal_longitude / 13.3333) + 1.
- One pada span = 3 deg 20 min (= 3.3333 deg).
- Pada index = floor((moon_sidereal_longitude mod 13.3333) / 3.3333) + 1.

Very important clarification on "Rashi mismatch":
- In Jyotish, people usually say "Rashi" meaning Janma Rashi (Moon sign).
- In chart generation, Lagna (Ascendant) is separate and can be different from Janma Rashi.
- So one person can be:
	- Janma Rashi = Mesha
	- Lagna = Dhanu
	and this is not a mathematical error.

How to verify quickly:
1. Check the Moon row in Graha table. If Moon is in Mesha, then Janma Rashi is Mesha.
2. Check Lagna field separately. Lagna can be Dhanu at the same birth time.
3. If Moon is near rashi boundary (around 29 deg or 0 deg), even a small birth-time difference can shift rashi.

Possible practical reason for mismatch in edge cases:
- Birth-time and timezone handling matters a lot near boundaries.
- Lagna changes fast (~2 hours per sign), Moon changes slower but can still cross sign boundaries.
- We can add an explicit timezone input field and a side-by-side comparison mode with Panditji values in next update.

NASA/JPL clarity:
- We are not calling live NASA API in runtime.
- But if needed, we can compare our output against JPL ephemeris datasets as an external validation layer in next phase.

Muhurat method:
1. App scans date range and time slots for selected event.
2. For each slot it calculates tithi, nakshatra, yoga, karana, vara, moon sign, and lagna.
3. It calculates Rahu Kaal, Yamaghanta, and Gulika and removes overlapping slots.
4. Remaining slots are scored by event rules and top options are shown.

Validation already in place:
- We maintain fixed golden dates in tests.
- Includes family reference date and known festival anchors like Holi, Janmashtami, Dussehra, Diwali, Herath.
- Some checks are sunrise-based, some are observance-time based.

Important clarity:
- Right now Janthari does not call live NASA API at runtime.
- It uses internal astronomical formulas and golden test validation.
- If you suggest, we can add an external ephemeris comparison report in next phase.

Please guide us on these points:
1. Is our tithi and paksha assignment aligned with parampara?
2. Is Purnimant month shift being applied correctly?
3. Which Muhurat rules should be stricter in scoring?

Aapka margdarshan is most important for us.
Pranam and thank you.
