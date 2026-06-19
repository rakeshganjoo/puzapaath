/**
 * help-glossary.ts — Comprehensive help content for Janthari
 * 
 * Organized by module (Getting Started, Calendar, Tekni, Puja, Muhurat, FAQ)
 * Plain English, diaspora-aware, no gatekeeping Sanskrit jargon
 * 
 * Structure:
 *   - HELP_GLOSSARY: Key terms with short/long explanations, examples
 *   - HELP_TOPICS: Guides organized by category
 *   - HELP_FAQ: Frequently asked questions
 */

export interface HelpTerm {
  id: string;
  title: string;
  shortDesc: string;
  fullDesc: string;
  whyItMatters: string;
  examples?: string[];
  learnMore?: string;
  module: 'getting-started' | 'calendar' | 'tekni' | 'puja' | 'muhurat' | 'general';
}

export interface HelpGuide {
  id: string;
  title: string;
  category: string;
  content: string;
  module: string;
  readTime: number; // in minutes
}

export interface HelpFAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  relatedTerms?: string[];
}

// ============================================================================
// GLOSSARY: Key terms explained in simple language
// ============================================================================

export const HELP_GLOSSARY: Record<string, HelpTerm> = {
  // Getting Started Terms
  janthari: {
    id: 'janthari',
    title: 'Janthari',
    shortDesc: 'Your personal Hindu calendar and astrology guide',
    fullDesc:
      'Janthari is a modern app that combines ancient Vedic knowledge with your personal birth chart (Kundali). It helps you find auspicious times for important events, understand your astrological profile, and connect with Hindu traditions and festivals.',
    whyItMatters:
      'Many families rely on astrology for important decisions—from naming ceremonies to marriages. This app brings that wisdom to your phone.',
    examples: [
      'Use it to find the perfect time for your child\'s naming ceremony',
      'Understand your personality through your birth chart',
      'Plan important events on auspicious dates',
    ],
    module: 'getting-started',
  },

  kundali: {
    id: 'kundali',
    title: 'Kundali (Birth Chart)',
    shortDesc: 'Your astrological profile based on birth date, time, and location',
    fullDesc:
      'A Kundali is like your "astrological fingerprint." It\'s a map of the sky created at the exact moment you were born. Your birth date, time (to the minute), and location all matter. In Vedic astrology, this chart reveals your personality, strengths, challenges, and life patterns.',
    whyItMatters:
      'Families have used Kundalis for thousands of years to understand personality, match couples for marriage, and time important events.',
    examples: [
      'Your Kundali might show you\'re naturally a leader (strong Mars)',
      'It can reveal good career paths (Jupiter placement)',
      'Helps find auspicious marriage matches (Kundali matching)',
    ],
    module: 'getting-started',
  },

  // Calendar Terms
  tithi: {
    id: 'tithi',
    title: 'Tithi (Lunar Day)',
    shortDesc: 'A day in the Hindu lunar calendar—different from regular calendar days',
    fullDesc:
      'The Hindu calendar is based on the Moon, not the Sun. A Tithi is a lunar day, and it doesn\'t match regular calendar days. The Moon goes through different phases (waxing and waning), and each phase is divided into 15 Tithis. Tithi 1 is Pratipada, Tithi 15 is Purnima (full moon).',
    whyItMatters:
      'Hindu festivals, pujas, and auspicious events are timed by Tithi, not by the regular calendar. So Diwali falls on Amavasya (new moon), Holi on Purnima (full moon).',
    examples: [
      'Makar Sankranti falls on Tithi 1 (Pratipada) of Magha month',
      'Janmashtami (Krishna\'s birthday) falls on Tithi 8 (Ashtami) of Bhadrapad',
      'Your birth Tithi influences your temperament',
    ],
    module: 'calendar',
  },

  paksha: {
    id: 'paksha',
    title: 'Paksha (Moon Phase)',
    shortDesc: 'Either the waxing (bright) or waning (dark) half of the lunar month',
    fullDesc:
      'In the Hindu calendar, the month is split into two halves: Shukla Paksha (waxing/bright phase, when the moon is growing) and Krishna Paksha (waning/dark phase, when the moon is shrinking). Each half has 15 Tithis. The month ends on Amavasya (new moon) or Purnima (full moon).',
    whyItMatters:
      'Different activities are considered auspicious in different Pakshas. For example, auspicious ceremonies usually happen during Shukla Paksha.',
    examples: [
      'Diwali is in Krishna Paksha (when the moon is fading)',
      'Most marriages happen in Shukla Paksha (when moon is growing)',
      'Fasting (Vrat) traditions differ between the two phases',
    ],
    module: 'calendar',
  },

  nakshatra: {
    id: 'nakshatra',
    title: 'Nakshatra (Birth Star)',
    shortDesc: 'The constellation under which you were born—one of 27 lunar mansions',
    fullDesc:
      'There are 27 Nakshatras (constellations) in Vedic astrology. Your Nakshatra is determined by the Moon\'s position at your exact birth time. It\'s one of the most important factors in your birth chart. Each Nakshatra has unique qualities and deity associations.',
    whyItMatters:
      'Nakshatra determines your personality traits, compatible partners for marriage, and lucky times for you.',
    examples: [
      'If you\'re born under Ashwini Nakshatra, you\'re naturally quick and energetic',
      'Rohini Nakshatras are often considered lucky for business',
      'Marriages are often matched by Nakshatra compatibility',
    ],
    module: 'calendar',
  },

  rashi: {
    id: 'rashi',
    title: 'Rashi (Zodiac Sign)',
    shortDesc: 'Your zodiac sign based on the Moon\'s position—one of 12 signs',
    fullDesc:
      'Rashi is the Hindu zodiac sign. Unlike Western astrology (which uses Sun sign), Vedic astrology uses your Moon sign (Rashi). The 12 Rashis are: Aries, Taurus, Gemini, Cancer, Leo, Virgo, Libra, Scorpio, Sagittarius, Capricorn, Aquarius, Pisces. Your Rashi influences your personality and emotional nature.',
    whyItMatters:
      'Your Rashi determines basic personality traits, compatible Rashis for relationships, and is used in marriage matching.',
    examples: [
      'If you\'re Vrishabha (Taurus), you\'re grounded, loyal, and creative',
      'Mithuna (Gemini) Rashis are communicative and adaptable',
      'Friendly and enemy Rashi relationships are checked for marriage matches',
    ],
    module: 'calendar',
  },

  masa: {
    id: 'masa',
    title: 'Masa (Lunar Month)',
    shortDesc: 'A month in the Hindu lunar calendar',
    fullDesc:
      'The Hindu calendar has 12 months (Masas). Each month is named after a Nakshatra: Chaitra, Vaisakha, Jyeshtha, Ashadha, Shravan, Bhadrapad, Kartik, Margshirsh, Paush, Magha, Phalgun, and Chaitra. The lunar year is shorter than the solar year, so an extra month (Adhik Masa) is added periodically.',
    whyItMatters:
      'Festivals and pujas are timed by Masa. For example, Durga Puja is in Ashwin, Diwali is in Kartik.',
    examples: [
      'Shravan is the holiest month for Shiva devotees',
      'Kartik Masa is when Diwali is celebrated',
      'Magha is an auspicious month for many ceremonies',
    ],
    module: 'calendar',
  },

  // Tekni Terms
  tekni: {
    id: 'tekni',
    title: 'Tekni (Birth Chart)',
    shortDesc: 'The same as Kundali—your astrological profile',
    fullDesc:
      'Tekni is a regional term for Kundali or birth chart. It\'s a detailed map of the sky at your exact birth moment. The chart shows the positions of 9 planets (Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn, Rahu, Ketu) in 12 houses (Bhavas) and 12 zodiac signs (Rashis).',
    whyItMatters:
      'Your Tekni reveals your personality, life purpose, career path, relationships, health, and timing of major life events.',
    examples: [
      'A strong Jupiter in your 10th house suggests business or leadership success',
      'Moon in the 4th house favors family and home life',
      'Rahu in the 2nd house might bring wealth through unconventional means',
    ],
    module: 'tekni',
  },

  lagna: {
    id: 'lagna',
    title: 'Lagna (Ascendant/1st House)',
    shortDesc: 'Your "public personality" sign in astrology—how others perceive you',
    fullDesc:
      'Lagna is the zodiac sign on the eastern horizon at your birth moment. It\'s the most important point in your chart and determines all house placements. Your Lagna influences how you appear to the world, your body type, temperament, and overall personality. The 1st house (house of Lagna) represents you, your character, and life direction.',
    whyItMatters:
      'Lagna is the foundation of your entire birth chart. Everything else is calculated from it. It shapes first impressions and your core identity.',
    examples: [
      'If you\'re Simha (Leo) Lagna, you\'re confident, creative, and natural leaders',
      'Mithuna (Gemini) Lagnas are witty, curious, and communicative',
      'Meena (Pisces) Lagnas are intuitive, spiritual, and empathetic',
    ],
    module: 'tekni',
  },

  graha: {
    id: 'graha',
    title: 'Graha (Planet)',
    shortDesc: 'The 9 celestial bodies that influence your life in astrology',
    fullDesc:
      'The 9 Grahas are: Surya (Sun), Chandra (Moon), Mangal (Mars), Budha (Mercury), Guru (Jupiter), Shukra (Venus), Shani (Saturn), Rahu (North Node), and Ketu (South Node). Each Graha has unique qualities and governs different life areas. Their positions in your chart reveal personality traits and life events.',
    whyItMatters:
      'Each Graha influences specific parts of life: Jupiter brings wealth, Venus brings relationships, Saturn brings lessons, and so on.',
    examples: [
      'Strong Sun = confidence, leadership, father\'s influence',
      'Strong Moon = emotional intelligence, family bonds',
      'Strong Jupiter = luck, wealth, education, relationships',
    ],
    module: 'tekni',
  },

  bhava: {
    id: 'bhava',
    title: 'Bhava (House)',
    shortDesc: 'One of 12 areas of life in your birth chart',
    fullDesc:
      'Your birth chart is divided into 12 Bhavas (houses). Each house governs different life areas: 1st = self, 2nd = family/wealth, 3rd = siblings/communication, 4th = home/mother, 5th = creativity/children, 6th = health/enemies, 7th = marriage/partnerships, 8th = transformation/death, 9th = luck/religion, 10th = career/father, 11th = friends/income, 12th = losses/spirituality.',
    whyItMatters:
      'Planets in different houses affect different parts of your life. A planet in the 7th house affects relationships and marriage.',
    examples: [
      'Jupiter in the 7th house blesses a happy marriage',
      'Saturn in the 10th house creates a slow but steady career rise',
      'Venus in the 5th house favors romance and creative expression',
    ],
    module: 'tekni',
  },

  nadi: {
    id: 'nadi',
    title: 'Nadi (Life Pulse)',
    shortDesc: 'Your temperament type—Vata, Pitta, or Kapha',
    fullDesc:
      'Nadi connects astrology to Ayurveda (Indian medicine). There are 3 Nadis: Vata (airy, changeable), Pitta (fiery, intense), and Kapha (earthy, stable). Your Nadi is determined by the Nakshatra of your Moon and Lord (planet ruling it). It influences your physical constitution, energy levels, and health tendencies.',
    whyItMatters:
      'Knowing your Nadi helps you understand your health, energy patterns, and what foods/activities suit you best.',
    examples: [
      'Vata Nadis are quick, creative, but need grounding (eat warm foods)',
      'Pitta Nadis are driven, ambitious, but need cooling (avoid spicy foods)',
      'Kapha Nadis are calm, steady, but need stimulation (exercise regularly)',
    ],
    module: 'tekni',
  },

  yoni: {
    id: 'yoni',
    title: 'Yoni (Animal Nature)',
    shortDesc: 'Your instinctive nature—represented by an animal',
    fullDesc:
      'Each Nakshatra is associated with a Yoni (animal). There are 14 Yonis: Horse, Elephant, Sheep, Serpent, Dog, Cat, Rat, Buffalo, Tiger, Lion, Monkey, Mongoose, Deer, Boar. Your Yoni is determined by your Nakshatra and reflects your instinctive behavior, passions, and natural talents. It\'s often used in marriage matching—compatible Yonis have better partnerships.',
    whyItMatters:
      'Your Yoni shows your natural instincts, strengths in relationships, and compatibility with potential partners.',
    examples: [
      'Horse Yoni people are energetic, independent, and love freedom',
      'Lion Yoni people are courageous, dominant, and protective',
      'Deer Yoni people are gentle, cautious, and sensitive',
    ],
    module: 'tekni',
  },

  // Puja Terms
  puja: {
    id: 'puja',
    title: 'Puja (Ritual Worship)',
    shortDesc: 'A Hindu ceremony of worship, prayer, and gratitude',
    fullDesc:
      'Puja is a sacred ritual of worship and devotion. It involves prayers, mantras, offerings (flowers, incense, food), and focusing your intention toward a deity or life goal. Pujas can be simple (lighting a lamp at home) or elaborate (temple ceremonies). Each step has a purpose—cleansing, inviting, offering, and blessing.',
    whyItMatters:
      'Puja connects you to spiritual traditions, brings focus to intentions, and creates a sacred space for gratitude and reflection.',
    examples: [
      'Janam Din Puja celebrates and blesses your birthday',
      'Durga Puja worships the goddess of strength',
      'Ganesh Puja removes obstacles before starting new projects',
    ],
    module: 'puja',
  },

  sankalp: {
    id: 'sankalp',
    title: 'Sankalp (Sacred Intention)',
    shortDesc: 'A solemn vow or intention you declare at the start of a puja',
    fullDesc:
      'Sankalp is your stated intention for the puja. You speak it aloud in Sanskrit or your language, declaring what you\'re praying for—health, success, family well-being, gratitude for the year. Speaking your intention out loud makes it powerful and focuses your mind and heart toward the goal.',
    whyItMatters:
      'Sankalp turns a ritual into a personal prayer. It\'s how you make the puja meaningful for your specific life situation.',
    examples: [
      '"I perform this Janam Din Puja for health, prosperity, and wisdom"',
      '"I pray for my family\'s well-being and my career success"',
    ],
    module: 'puja',
  },

  samagri: {
    id: 'samagri',
    title: 'Samagri (Ritual Materials)',
    shortDesc: 'The sacred items needed to perform a puja',
    fullDesc:
      'Samagri includes items like flowers, incense, oil lamps (diyas), bells, conch shells, grains, and sacred thread. Each item has symbolic meaning—flowers represent beauty, incense represents purification, lamps represent removing darkness. Samagri can be simple (flowers and water) or elaborate depending on the puja.',
    whyItMatters:
      'The physical items help you create a sacred atmosphere and engage all senses in the ritual.',
    examples: [
      'Marigolds and jasmine for flowers',
      'Ghee lamps (diyas) for light',
      'Incense (dhoop) for purification',
    ],
    module: 'puja',
  },

  mantra: {
    id: 'mantra',
    title: 'Mantra (Sacred Chant)',
    shortDesc: 'A repetition of sacred words or sounds with spiritual power',
    fullDesc:
      'A Mantra is a phrase, word, or sound (like "Om") repeated during meditation or puja. Mantras have been used for thousands of years to focus the mind, invoke blessings, and connect with the divine. The Sanskrit words carry spiritual vibrations that calm and elevate your consciousness.',
    whyItMatters:
      'Mantras quiet the mind, deepen focus, and are believed to invoke specific blessings (health, protection, wisdom).',
    examples: [
      '"Om Namah Shivaya" — honoring Shiva',
      '"Om Gam Ganapataye Namah" — honoring Ganesh',
      '"Om" — the primordial sound of creation',
    ],
    module: 'puja',
  },

  // Muhurat Terms
  muhurat: {
    id: 'muhurat',
    title: 'Muhurat (Auspicious Time)',
    shortDesc: 'A time window considered auspicious for starting important activities',
    fullDesc:
      'Muhurat is a carefully calculated time period (usually 15–60 minutes) when planetary positions align favorably. Starting important events during a Muhurat is believed to bring success and remove obstacles. Muhurat is calculated using planetary positions, lunar calendar (Tithi), day (Vara), and star (Nakshatra). Different activities need different Muhurats—marriage, business launch, travel, housewarming, etc.',
    whyItMatters:
      'Families have used Muhurat for thousands of years to time important events. It\'s like choosing a day with "luck on your side."',
    examples: [
      'Finding the best Muhurat for your wedding',
      'Choosing auspicious timing for starting a business',
      'Picking the right moment to move into a new home',
    ],
    module: 'muhurat',
  },

  vara: {
    id: 'vara',
    title: 'Vara (Weekday)',
    shortDesc: 'A day of the week (Monday–Sunday) with its own astrological qualities',
    fullDesc:
      'In astrology, each weekday is ruled by a planet: Monday (Moon), Tuesday (Mars), Wednesday (Mercury), Thursday (Jupiter), Friday (Venus), Saturday (Saturn), Sunday (Sun). Each day carries the energy of its ruling planet. Some days are better for certain activities—Tuesday for starting new ventures, Wednesday for trade, Friday for marriage.',
    whyItMatters:
      'Choosing the right Vara amplifies the chances of success for your event.',
    examples: [
      'Thursday (Jupiter) is good for starting businesses',
      'Friday (Venus) is ideal for marriage and partnerships',
      'Tuesday (Mars) is good for overcoming obstacles and courageous action',
    ],
    module: 'muhurat',
  },

  grahana: {
    id: 'grahana',
    title: 'Grahana (Eclipse)',
    shortDesc: 'A Solar or Lunar eclipse—considered inauspicious for new activities',
    fullDesc:
      'A Grahana is an eclipse. Solar eclipses (Surya Grahana) are when the Moon blocks the Sun. Lunar eclipses (Chandra Grahana) are when Earth\'s shadow blocks the Moon. Eclipses are considered times of high energy and transformation. Traditionally, starting new activities during an eclipse is discouraged—it\'s seen as a time to pause, reflect, and reset.',
    whyItMatters:
      'Avoiding Muhurat during eclipses is a traditional precaution to prevent obstacles.',
    examples: [
      'No auspicious events scheduled during a solar or lunar eclipse',
      'Fasting and prayers are recommended during eclipses in many traditions',
    ],
    module: 'muhurat',
  },

  // General Terms
  vedic_astrology: {
    id: 'vedic_astrology',
    title: 'Vedic Astrology (Jyotisha)',
    shortDesc: 'Ancient Hindu astrology based on the Vedas and lunar calendar',
    fullDesc:
      'Vedic astrology (also called Jyotisha or KP astrology) is the astrology system of ancient India. It\'s based on the Vedas (oldest Hindu texts) and uses the lunar calendar. Unlike Western astrology (which uses the solar calendar and 12 Sun signs), Vedic astrology uses the lunar calendar, 27 star constellations (Nakshatras), and the Moon\'s zodiac sign (Rashi). KP astrology is a refined branch that focuses on precise planetary timing.',
    whyItMatters:
      'Understanding your Vedic chart helps you align with Hindu traditions, understand your personality, time life events, and make informed decisions.',
    examples: [
      'Vedic astrology predicts timing of marriage, career success, and challenges',
      'It\'s used for Kundali matching before marriages',
      'Used to find auspicious times (Muhurat) for important events',
    ],
    module: 'general',
  },

  kp_astrology: {
    id: 'kp_astrology',
    title: 'KP Astrology',
    shortDesc: 'A modern, precise branch of Vedic astrology focused on accurate timing',
    fullDesc:
      'KP (Krishnamurti Paddhati) astrology is a refined system developed by Prof. K.S. Krishnamurti in the 1960s. It uses the same Vedic principles but with more precise calculations. KP astrology is known for its accuracy in predicting timing of events. It divides zodiac signs into sub-divisions called "Cusps" for greater precision.',
    whyItMatters:
      'KP astrology gives more accurate Muhurat calculations and event predictions than traditional methods.',
    examples: [
      'KP astrology precisely predicts when you\'ll get married (not just "year" but "month")',
      'Better Muhurat calculations using Cusps',
    ],
    module: 'general',
  },

  krishnamurthy_ayanamsa: {
    id: 'krishnamurthy_ayanamsa',
    title: 'Krishnamurthy Ayanamsa',
    shortDesc: 'An adjustment factor used in KP astrology calculations',
    fullDesc:
      'Ayanamsa is an adjustment for the gradual shift of Earth\'s axis over centuries (precession). The Krishnamurthy Ayanamsa is the specific adjustment used in KP astrology to ensure precise calculations. Different astrology systems use different Ayanamsas—Lahiri is common in traditional Vedic, Krishnamurthy in KP.',
    whyItMatters:
      'Using the correct Ayanamsa ensures your birth chart calculations are accurate.',
    module: 'general',
  },

  kshaya: {
    id: 'kshaya',
    title: 'Kshaya Tithi (Skipped Lunar Day)',
    shortDesc: 'A lunar day that is so short it never "reaches sunrise"',
    fullDesc:
      'Kshaya Tithi happens when a lunar day (Tithi) is so short in duration that it starts and ends between two consecutive sunrises—meaning it never "prevails" at any sunrise. When this occurs, that Tithi is skipped in the calendar, and you jump to the next one. For example: Amavasya followed directly by Dwitiya (Pratipada is skipped). This is common in lunar calendars, especially in Kashmiri Pandit (KP) calendars. Janthari now shows a note when this happens: "Pratipada was short (kshaya tithi) — missing day."',
    whyItMatters:
      'Understanding kshaya tithis helps you interpret lunar calendars correctly. A missing day is not an error; it\'s the reality of Moon\'s motion. Families need to know this to plan ceremonies and festivals properly.',
    examples: [
      'June 15, 2026: Amavasya observed, Pratipada skipped to Dwitiya',
      'Festivals are NOT affected by kshaya—they have their own lunar date rules',
      'If your Janma Tithi is kshaya, celebrate on the observed date with other families',
    ],
    module: 'calendar',
  },

  adhika: {
    id: 'adhika',
    title: 'Adhika Tithi (Double Lunar Day)',
    shortDesc: 'A lunar day that is so long it spans two calendar days',
    fullDesc:
      'Adhika Tithi is the opposite of Kshaya. It happens when a lunar day (Tithi) is long enough to prevail at TWO consecutive sunrises. When this occurs, the same Tithi appears on two calendar days in a row. For example: Ashtami appears on both Monday and Tuesday. This is also normal and reflects the Moon\'s varying motion. Janthari shows a note when this happens: "Double day — Ashtami appears on two consecutive days."',
    whyItMatters:
      'Adhika tithis are rarer than kshaya but important to recognize. If your Janma Tithi appears twice in a year, celebrate on the first occurrence (unless your family priest advises differently).',
    examples: [
      'Ashtami appearing on both Monday and Tuesday (rare but happens)',
      'Celebrated once on the first day per traditional practice',
      'Not the same as Adhik Masa (extra lunar month), which is a different concept',
    ],
    module: 'calendar',
  },
};

// ============================================================================
// HELP GUIDES: Organized by topic
// ============================================================================

export const HELP_GUIDES: HelpGuide[] = [
  // Getting Started Guides
  {
    id: 'getting-started-welcome',
    title: 'Welcome to Janthari',
    category: 'Getting Started',
    module: 'getting-started',
    readTime: 3,
    content: `Janthari is your personal guide to Hindu calendar, astrology, and auspicious timing.

Whether you\'re planning a wedding, starting a business, celebrating a birthday, or simply want to understand your astrological profile—Janthari brings ancient Vedic wisdom to your phone.

**What can you do with Janthari?**

1. **Tekni (Birth Chart)** — Enter your birth date, time, and location to generate your birth chart. Understand your personality, strengths, and life patterns.

2. **KP Calendar** — Explore the Hindu lunar calendar. Find major festivals and important dates.

3. **Tithi Calculator** — Convert between regular dates and Hindu lunar dates.

4. **Muhurat Finder** — Find auspicious times for important events—marriage, business launch, housewarming, travel, etc.

5. **Janam Din Puja** — Learn and perform your birthday celebration ritual with step-by-step guidance.

**First Steps:**

1. Go to **Setup** to enter your birth information (date, time, location)
2. Visit **Tekni** to see your birth chart
3. Explore **Calendar** to see Hindu festivals
4. Use **Muhurat** to find good timing for your plans
5. Check this **Help** section anytime you have questions

Ready? Let\'s begin!`,
  },

  {
    id: 'getting-started-birth-info',
    title: 'Why Your Birth Information Matters',
    category: 'Getting Started',
    module: 'getting-started',
    readTime: 2,
    content: `To generate your birth chart (Tekni), we need three pieces of information:

**1. Birth Date**
The date you were born (e.g., January 15, 1990)

**2. Birth Time**
The exact time of birth (e.g., 2:45 AM)
This should be as precise as possible—to the minute.

Why? In astrology, even 2 minutes changes your chart. Birth time determines your Lagna (ascendant), which is the foundation of everything.

**Where to find your birth time?**
- Birth certificate
- Hospital records
- Parents or grandparents (if they remember)
- Astrological software often estimates if you\'re unsure

**3. Birth Location**
The city/hospital where you were born.

Why? Birth location determines which timezone to use, which affects all calculations.

**What if I don\'t know my exact time?**
If you only know the date and location, Janthari can estimate using noon (12:00 PM). It won\'t be perfect, but it\'s better than nothing. You can update later when you find your birth certificate.

**Is my information private?**
Yes! Your birth information is stored only on your phone. We don\'t send it to servers unless you choose to sync.`,
  },

  {
    id: 'getting-started-privacy',
    title: 'Is My Data Private and Secure?',
    category: 'Getting Started',
    module: 'getting-started',
    readTime: 2,
    content: `**Short answer: Yes, your data is private by default.**

**How does Janthari protect your data?**

1. **Local Storage** — Your birth information and charts are stored on your phone only. We don\'t upload anything to our servers without your permission.

2. **Optional Cloud Sync** — You can choose to sync your profile to our secure cloud (using your Google or Apple account). This is optional and encrypted.

3. **No Third-Party Sharing** — We never sell your data or share it with advertisers.

4. **No Tracking** — Janthari doesn\'t track your behavior or location.

**What information do we collect?**
- Your birth date, time, location (only if you sync)
- App usage (how often you open Janthari, which features you use)
- Crash reports (to help us fix bugs)

**What about GDPR, privacy laws?**
Janthari complies with major privacy laws (GDPR, CCPA, etc.).

**Questions?**
If you have privacy concerns, visit our full Privacy Policy in Settings → About → Privacy Policy.`,
  },

  // Calendar Guides
  {
    id: 'calendar-lunar-calendar',
    title: 'Understanding the Hindu Lunar Calendar',
    category: 'Calendar',
    module: 'calendar',
    readTime: 4,
    content: `The Hindu calendar is based on the Moon, not the Sun.

**Solar Calendar (Regular/Western)**
- 365 days per year
- Based on Earth\'s orbit around the Sun
- Used worldwide

**Lunar Calendar (Hindu)**
- ~354 days per year (based on Moon cycles)
- Each month synced with the Moon\'s phases
- Festivals fall on specific lunar dates

**Why use the lunar calendar?**
Ancient Hindu traditions observed the Moon for thousands of years. The Moon affects tides, seasons, and human energy. Hindu festivals are timed to lunar cycles—Diwali on new moon (Amavasya), Holi on full moon (Purnima).

**The Lunar Month Structure**

Each lunar month (Masa) has 30 lunar days (Tithis):
- Tithis 1-15: Shukla Paksha (waxing/bright, Moon growing)
- Tithis 15-30: Krishna Paksha (waning/dark, Moon shrinking)

**The 12 Lunar Months** (same names in all Hindu traditions):
1. Chaitra
2. Vaisakha
3. Jyeshtha
4. Ashadha
5. Shravan
6. Bhadrapad
7. Kartik
8. Margshirsh
9. Paush
10. Magha
11. Phalgun
12. Chaitra (again)

**Fun Fact:** Every 2-3 years, an extra month (Adhik Masa) is added to keep the lunar year aligned with seasons. This is why some years have 13 months!

**Why this matters to you:**
- All Hindu festivals are on lunar dates
- Important ceremonies are timed to lunar phases
- Your "lunar birthday" (Janma Tithi) is different from your solar birthday`,
  },

  {
    id: 'calendar-tithi',
    title: 'What is Tithi (Lunar Day)?',
    category: 'Calendar',
    module: 'calendar',
    readTime: 4,
    content: `**Tithi** = A lunar day in the Hindu calendar

A regular (solar) day is 24 hours. A Tithi varies in length (usually 19–26 hours) because it\'s based on the Moon\'s movement.

**The 30 Tithis:**

**Shukla Paksha (Waxing Moon):**
1. Pratipada (1st)
2. Dwitiya (2nd)
3. Tritiya (3rd)
4. Chaturthi (4th)
5. Panchami (5th)
6. Shashthi (6th)
7. Saptami (7th)
8. Ashtami (8th)
9. Navami (9th)
10. Dashami (10th)
11. Ekadashi (11th)
12. Dwadashi (12th)
13. Trayodashi (13th)
14. Chaturdashi (14th)
15. Purnima (Full Moon)

**Krishna Paksha (Waning Moon):**
16-29: Same names as above, but in dark phase
30. Amavasya (New Moon)

**Example:** 
- Your birthday (regular calendar): January 15
- Your lunar birthday (Janma Tithi): Shukla Paksha Tritiya, Magha Masa, Ashwini Nakshatra
- When is your next lunar birthday? Check the Calendar to find it!

**Missing Days & Double Days (Kshaya & Adhika)**

Sometimes Tithis don't behave predictably because of the Moon\'s varying speed.

**Missing Day (Kshaya Tithi):**
A Tithi can be so short that it never "reaches sunrise"—it starts and ends between two sunrises. When this happens, that Tithi is skipped, and you jump to the next one. For example: Amavasya followed directly by Dwitiya (Pratipada skipped). On the calendar, you\'ll see a note like **"Pratipada was short (kshaya tithi) — missing day"** to explain the jump.

**Double Day (Adhika Tithi):**
A Tithi can also be long enough to span two calendar days. In this case, the same Tithi appears on two consecutive sunrises. You\'ll see a note like **"Double day — Ashtami appears on two consecutive days."**

**Why it matters:**
- These are normal and common in Kashmiri Pandit and South Indian calendars
- Missing/double days do NOT affect festival dates (festivals have their own rules)
- If your Janma Tithi (birth Tithi) appears twice in a year, celebrate on the first occurrence
- Janthari now transparently shows these with annotations so you understand what\'s happening

**Practical Family Rule:**
When you see a missing day note, trust the calendar—it\'s showing you the lunar astronomy. Share the note with your priest if planning ceremonies.`,
  },

  {
    id: 'calendar-festivals',
    title: 'Major Hindu Festivals & Their Dates',
    category: 'Calendar',
    module: 'calendar',
    readTime: 3,
    content: `Hindu festivals are celebrated on lunar dates, so they fall on different solar (regular calendar) dates each year.

**Major All-India Festivals:**

**Makar Sankranti** — January 14–15
- Celebrated when the Sun enters Capricorn (Makara Rashi)
- Harvest festival
- Kite flying, bonfires, new clothes

**Pongal/Makar Sankranti** — January 14–15 (South India)
- Tamil harvest festival
- Cooking new rice as offering

**Holi** — March (varies)
- Festival of colors, spring celebration
- Celebrated on Purnima (full moon) of Phalgun month
- Signifies good over evil

**Navaratri** — September–October (varies)
- 9-day festival honoring Goddess Durga
- Celebrated twice a year (Chaitra Navaratri in spring, Shardiya Navaratri in autumn)

**Dashhara** — October (varies)
- Celebrated on 10th day after Navaratri
- Celebrates victory of good over evil

**Diwali (Deepavali)** — October–November (varies)
- Festival of lights, celebrated on Amavasya (new moon) of Kartik
- Celebrating Rama\'s victory and return home
- Lights, sweets, new clothes, fireworks

**Janmashtami** — August–September (varies)
- Birthday of Lord Krishna
- Celebrated on Ashtami (8th Tithi) of Bhadrapad, Krishna Paksha

**Check Janthari Calendar** for exact dates of all festivals for your region!`,
  },

  // Tekni Guides
  {
    id: 'tekni-intro',
    title: 'What is Tekni (Birth Chart)?',
    category: 'Tekni',
    module: 'tekni',
    readTime: 4,
    content: `**Tekni** = Your astrological birth chart

Think of Tekni as your "astrological fingerprint."

**What is it?**
A Tekni is a snapshot of the sky at the exact moment you were born. It maps the positions of:
- The Sun, Moon, and 7 planets (Mars, Mercury, Jupiter, Venus, Saturn, Rahu, Ketu)
- Their placements in 12 zodiac signs (Rashis)
- Their placements in 12 life areas (Bhavas/houses)
- Your Moon sign (Rashi) and birth star (Nakshatra)

**Why does it matter?**
In Vedic astrology, your Tekni reveals:
1. Your personality and temperament
2. Your strengths and natural talents
3. Your challenges and lessons
4. Career paths that suit you
5. Relationship compatibility
6. Timing of major life events

**Real Example:**
- Person A: Strong Jupiter in 10th house → likely success in business or leadership
- Person B: Jupiter in 7th house → strong marriage and partnerships
- Person C: Weak Jupiter → may need to work harder for luck, but Jupiter Puja can help

**What makes your Tekni unique?**
Your birth date, birth time (to the minute!), and birth location all matter. Two people born on the same day but at different times have completely different charts.

**How to get your Tekni:**
1. Open Janthari
2. Go to **Tekni**
3. Enter your birth date, time, location
4. Tap "Generate Tekni"
5. Explore each component!`,
  },

  {
    id: 'tekni-lagna',
    title: 'Understanding Lagna (Your Ascendant)',
    category: 'Tekni',
    module: 'tekni',
    readTime: 3,
    content: `**Lagna** = The zodiac sign on the eastern horizon at your birth moment

It\'s the most important point in your birth chart. Lagna determines:
- Your appearance and body type
- Your personality and first impression
- Your life direction and destiny
- All other house placements in your chart

**The 12 Lagnas & Their Traits:**

1. **Aries (Mesh)** — Bold, courageous, pioneering, independent
2. **Taurus (Vrishabha)** — Grounded, loyal, creative, stable
3. **Gemini (Mithuna)** — Witty, curious, communicative, adaptable
4. **Cancer (Karka)** — Emotional, nurturing, family-oriented, intuitive
5. **Leo (Simha)** — Confident, creative, natural leader, generous
6. **Virgo (Kanya)** — Analytical, detail-oriented, practical, service-focused
7. **Libra (Tula)** — Balanced, artistic, diplomatic, people-pleaser
8. **Scorpio (Vrischika)** — Intense, secretive, transformative, powerful
9. **Sagittarius (Dhanu)** — Optimistic, adventurous, philosophical, freedom-loving
10. **Capricorn (Makara)** — Ambitious, disciplined, responsible, slow-and-steady
11. **Aquarius (Kumbha)** — Innovative, humanitarian, independent, visionary
12. **Pisces (Meena)** — Intuitive, artistic, spiritual, empathetic

**Your Lagna determines your 1st House**
- 1st House = You, your character, your life path
- A strong 1st House shows a clear sense of purpose
- A weak 1st House might mean identity confusion or needing direction`,
  },

  {
    id: 'tekni-grahas',
    title: 'The 9 Grahas (Planets) Explained',
    category: 'Tekni',
    module: 'tekni',
    readTime: 4,
    content: `There are 9 **Grahas** (celestial bodies) in Vedic astrology.

Each Graha governs specific life areas. Where they sit in your chart determines what energy you have in those areas.

**1. Surya (The Sun) ☀️**
- Governs: Self, ego, confidence, father, authority
- Strong Sun: Leadership, clarity, willpower
- Weak Sun: Low confidence, unclear identity

**2. Chandra (The Moon) 🌙**
- Governs: Emotions, mind, family, mother, nurturing
- Strong Moon: Emotional intelligence, good relationships
- Weak Moon: Emotional turbulence, unclear feelings

**3. Mangal (Mars) 🔴**
- Governs: Courage, passion, siblings, blood, energy
- Strong Mars: Courageous, passionate, energetic
- Weak Mars: Lack of initiative, passive

**4. Budha (Mercury) 🟡**
- Governs: Communication, intellect, trade, siblings
- Strong Mercury: Good communication, business success
- Weak Mercury: Communication issues, business struggles

**5. Guru (Jupiter) 🟠**
- Governs: Luck, wealth, wisdom, education, children
- Strong Jupiter: Prosperous, wise, fortunate
- Weak Jupiter: Need to work harder for success

**6. Shukra (Venus) 💜**
- Governs: Relationships, marriage, art, beauty, pleasure
- Strong Venus: Happy marriage, artistic talents
- Weak Venus: Relationship struggles, lack of comfort

**7. Shani (Saturn) ⚫**
- Governs: Discipline, karma, lessons, hard work, old age
- Strong Saturn: Discipline, steady success
- Weak Saturn: Laziness, avoidance of responsibility

**8. Rahu (North Node) 🟢**
- Governs: Obsessions, desires, worldly goals, success
- Rahu can give extreme success or challenges
- Rahu teaches through obsession

**9. Ketu (South Node) 🔵**
- Governs: Spirituality, detachment, hidden talents
- Ketu brings spiritual insight
- Ketu shows past-life talents

**In your Tekni:**
Each Graha sits in a sign (Rashi) and house (Bhava). This tells you what energy you have in different life areas.`,
  },

  {
    id: 'tekni-bhavas',
    title: 'The 12 Bhavas (Houses) Explained',
    category: 'Tekni',
    module: 'tekni',
    readTime: 4,
    content: `Your birth chart is divided into 12 **Bhavas** (houses), each governing different life areas.

**1st Bhava (House of Self)**
- You, personality, appearance, life direction
- Ruled by Lagna

**2nd Bhava (House of Wealth)**
- Money, family, speech, food
- Indicates prosperity and family wealth

**3rd Bhava (House of Siblings & Communication)**
- Siblings, communication, short travels, courage
- Shows your relationship with brothers/sisters

**4th Bhava (House of Home & Mother)**
- Home, mother, property, vehicles
- Indicates comfort and family happiness

**5th Bhava (House of Creativity & Children)**
- Children, creativity, romance, education
- Shows your creative talents and offspring

**6th Bhava (House of Health & Enemies)**
- Health, enemies, obstacles, loans, pets
- Shows health issues and how to overcome challenges

**7th Bhava (House of Marriage & Partnerships)**
- Marriage, spouse, partnerships, business
- Most important for relationship prediction

**8th Bhava (House of Transformation)**
- Transformation, death, inheritance, hidden things
- Shows major life changes and spiritual depth

**9th Bhava (House of Luck & Religion)**
- Luck, father, religion, higher learning, foreign travel
- Shows your fortune and spiritual inclination

**10th Bhava (House of Career & Father)**
- Career, public image, father, authority
- Most important for career prediction

**11th Bhava (House of Friends & Wealth)**
- Friends, income, gains, social network
- Shows how you gain money and friendship circles

**12th Bhava (House of Losses & Spirituality)**
- Spirituality, foreign lands, losses, expenses
- Shows your spiritual path and hidden strengths

**In your Tekni:**
Planets in different houses affect those life areas.
Example: Jupiter in 7th house = happy marriage`,
  },

  {
    id: 'tekni-nadi-yoni',
    title: 'Nadi, Yoni, and Personality Traits',
    category: 'Tekni',
    module: 'tekni',
    readTime: 3,
    content: `Your Tekni reveals **Nadi** and **Yoni**—two key personality indicators.

**Nadi (Your Life Pulse) — 3 Types**

All Nakshatras (birth stars) are divided into 3 Nadis:

**Vata (Air) Nadi** ☁️
- Personality: Quick, changeable, adaptable, creative
- Energy: High but scattered
- Health: Light frame, prone to anxiety, favor warm foods
- Professions: Artists, writers, teachers, traders

**Pitta (Fire) Nadi** 🔥
- Personality: Intense, driven, ambitious, strategic
- Energy: Focused and penetrating
- Health: Medium frame, prone to heat/inflammation, avoid spicy foods
- Professions: Leaders, entrepreneurs, politicians, doctors

**Kapha (Earth) Nadi** 🌍
- Personality: Calm, stable, grounded, loyal
- Energy: Slow but steady
- Health: Solid frame, prone to heaviness, exercise regularly
- Professions: Managers, accountants, engineers, healers

**Yoni (Your Animal Nature) — 14 Types**

Each birth star (Nakshatra) has an animal associated with it. Your Yoni shows your instinctive behavior:

- **Horse** → Energetic, independent, freedom-loving
- **Elephant** → Loyal, strong, protective
- **Sheep** → Gentle, cautious, sensitive
- **Serpent** → Mysterious, intuitive, secretive
- **Dog** → Faithful, devoted, alert
- **Cat** → Independent, curious, selfish
- **Rat** → Smart, resourceful, alert
- **Buffalo** → Sturdy, hardworking, stubborn
- **Tiger** → Courageous, dominant, wild
- **Lion** → Royal, courageous, protective
- **Monkey** → Playful, intelligent, mischievous
- **Mongoose** → Protector, brave, aggressive
- **Deer** → Gentle, cautious, sensitive
- **Boar** → Steady, protective, grounded

**Yoni in Marriage Matching:**
Certain Yoni pairs are compatible (Horse + Elephant), others not (Cat + Rat).

Check your Nadi and Yoni in your Tekni result!`,
  },

  // Puja Guides
  {
    id: 'puja-what-is',
    title: 'What is Puja? A Simple Guide',
    category: 'Puja',
    module: 'puja',
    readTime: 3,
    content: `**Puja** = A sacred ritual of worship, gratitude, and focused intention

**What happens in a puja?**
You gather sacred materials (flowers, incense, lamp, water) and perform a series of steps that connect you to a deity or spiritual energy. Each step has a meaning:

1. **Cleansing** — Wash your hands, face, create sacred space
2. **Invocation** — Call upon the deity, welcome their presence
3. **Offering** — Offer flowers, incense, food, water
4. **Prayer** — Speak your intention (Sankalp)
5. **Closing** — Ring bell, receive blessings (Aarti)

**Who do you worship?**
- Deities (Ganesh, Durga, Lakshmi, Shiva, Krishna, etc.)
- Your Ishta Devata (personal chosen deity)
- Or simply universal spiritual energy

**Why do puja?**
- **Spiritual connection** — Deepens your relationship with the divine
- **Focus** — Clarifies your intentions and goals
- **Gratitude** — Celebrates blessings in your life
- **Ritual** — Creates sacred space and meaning
- **Community** — Brings family/friends together

**Simple vs. Elaborate Puja**

**Simple Home Puja** (15 minutes)
- Light a lamp, ring bell
- Offer flowers and incense
- Say your prayer
- Receive blessing (Aarti)

**Elaborate Puja** (1-2 hours)
- Full ritual with mantras
- Multiple offerings
- Detailed steps
- Priest-led (optional)

**In Janthari:**
We focus on **Janam Din Puja** — a birthday celebration ritual that blesses you for the year ahead.`,
  },

  {
    id: 'puja-janam-din-puja',
    title: 'Janam Din Puja — Birthday Blessing Ritual',
    category: 'Puja',
    module: 'puja',
    readTime: 4,
    content: `**Janam Din Puja** = Your birthday celebration ritual

In Western culture, birthdays are about cake and presents. In Hindu tradition, they\'re about spiritual blessing and gratitude.

**What is Janam Din Puja?**
A ritual performed on or near your birthday to:
- Thank your parents for raising you
- Celebrate your life and growth
- Bless the year ahead
- Set intentions for the coming year

**When to perform it?**
- On your lunar birthday (Janma Tithi) — the traditional way
- On your solar birthday — the modern way
- Within a few days of your birthday — flexible timing

**What do you need?**
**Basic Samagri (Materials):**
- Lamp (diya) with oil
- Incense (dhoop or agarbatti)
- Fresh flowers (marigolds, roses)
- Sweets (any kind — you\'ll offer to deity and eat)
- Water (for offerings)
- Bell (optional but recommended)

**The Ritual Steps** (simplified):

1. **Preparation** (5 min)
   - Choose a clean, calm space
   - Place deity image (Ganesh or your chosen deity)
   - Arrange Samagri in front

2. **Cleansing** (2 min)
   - Wash hands and face
   - Ring bell 3 times to sanctify space

3. **Welcome** (2 min)
   - Light lamp
   - Offer flowers to deity
   - Ring bell again

4. **Your Sankalp (Intention)** (3 min)
   - Speak your intention: "I celebrate my birth and bless the year ahead"
   - Specific intention: "I pray for health, wisdom, and success"

5. **Offerings** (5 min)
   - Offer incense
   - Offer more flowers
   - Offer sweets (a small portion)

6. **Prayer/Meditation** (5 min)
   - Sit quietly
   - Say mantras or prayers (or just meditate)
   - Feel gratitude for your life

7. **Blessing (Aarti)** (3 min)
   - Ring bell slowly
   - Receive blessing: Touch lamp flame gently with right hand, touch your forehead
   - Eat offered sweets (Prasad)

**Total time:** 25–30 minutes

**In Janthari:**
We guide you step-by-step through Janam Din Puja with timing, mantras, and explanations.`,
  },

  {
    id: 'puja-samagri-where-to-buy',
    title: 'Samagri (Materials) — Where to Find Them',
    category: 'Puja',
    module: 'puja',
    readTime: 2,
    content: `**Samagri** = Sacred materials for puja

**What you need for Janam Din Puja:**

| Item | Where to Find |
|------|---------------|
| Flowers (marigolds, jasmine) | Grocery store, flower shop, garden |
| Incense (agarbatti) | Indian grocery store |
| Oil lamp (diya) | Indian store, local temple gift shops |
| Ghee (clarified butter) | Indian grocery, regular grocery |
| Sweets (laddu, barfi) | Indian bakery, grocery store |
| Water | Tap water |
| Bell (ghanti) | Indian store, temple gift shop |
| Conch shell (if desired) | Indian store, or skip it |

**Where to Source:**

**Indian Grocery Stores**
- Full selection of authentic items
- Knowledgeable staff who can help
- Community-oriented sourcing

**Local Temples**
- Gift shops often carry samagri
- Support your local temple community
- Staff familiar with puja needs

**Regular Grocery Stores**
- Flowers from produce section
- Ghee and oils from pantry section
- Sweets from bakery section
- Water from tap

**Flexibility:**
You don't need to buy everything new. Use what you have at home. Flowers from your garden work beautifully. If you don't have a bell or conch, that's fine—the intention matters most.

**Simple Sourcing (what you likely have):**
- Garden flowers or grocery store blooms + incense
- Coconut oil as lamp oil
- Store-bought or homemade sweets
- Use any small bowl as lamp

**Enhanced Sourcing (if you prefer):**
- Fresh flowers from local florist or farmer's market
- Premium or specialty incense
- Pure ghee in lamp
- Homemade or artisanal sweets from your community

**Pro Tip:** Many Indian festivals and temples sell pre-made puja kits. Check your local temple!`,
  },

  // Muhurat Guides
  {
    id: 'muhurat-what-is-and-why',
    title: 'What is Muhurat? Why Does it Matter?',
    category: 'Muhurat',
    module: 'muhurat',
    readTime: 4,
    content: `**Muhurat** = A carefully calculated time window when planets align favorably

**In Simple Words:**
Imagine you\'re starting a new business. You could start any day... or you could choose a day when the planets are working *for* you instead of *against* you.

That\'s Muhurat.

**How is Muhurat calculated?**
Muhurat is determined by several factors:
1. **Weekday (Vara)** — Each day (Mon–Sun) is ruled by a planet with specific qualities
2. **Lunar Day (Tithi)** — Certain Tithis are good for certain activities
3. **Birth Star (Nakshatra)** — The Moon\'s position in constellations
4. **Planetary Aspects** — Where planets are positioned
5. **Absence of bad yoga** — Avoiding times influenced by malefic planets

**Common Muhurats:**

**For Marriage**
- Ideal: Thursday, Friday, or Wednesday
- Avoid: Tuesday (Mars—violence), Saturday (Saturn—delays)
- Check: Avoid Grahana (eclipses), Bhramin (inauspicious day)

**For Business Launch**
- Ideal: Thursday (Jupiter—wealth), Wednesday (Mercury—trade)
- Good Tithis: 2, 3, 5, 7, 10, 12, 13

**For Housewarming (Griha Pravesh)**
- Ideal: Thursday, Friday, or Saturday
- Check: Avoid bad Nakshatras

**For Travel/Journey**
- Ideal: Tuesday, Thursday, or Friday
- Avoid: Saturday (delays)

**For Starting Education**
- Ideal: Thursday (Jupiter—wisdom)
- Avoid: Saturday, weekends

**Real Example:**
- Bad Muhurat: Start business on Tuesday with Saturn aspect = obstacles
- Good Muhurat: Start business on Thursday with Jupiter aspect = success

**Different traditions, different rules:**
KP Astrology (used in Janthari) is known for precise Muhurat calculations using Cusps.

**How Janthari helps:**
Enter your event type (marriage, business, travel) and date, and Janthari calculates the best time window for success!`,
  },

  {
    id: 'muhurat-finding-best-time',
    title: 'How to Find the Best Muhurat for Your Event',
    category: 'Muhurat',
    module: 'muhurat',
    readTime: 3,
    content: `**Step-by-Step Guide to Finding Your Perfect Muhurat**

**Step 1: Know Your Event**
What are you starting?
- Marriage
- Business launch
- Housewarming
- Job start
- Travel
- Surgery/medical procedure
- Other important event

**Step 2: Know Your Preferred Dates**
Do you have preferred dates? (Optional)
- Some families have family traditions
- Some have venue availability
- Some prefer certain months

**Step 3: Open Janthari Muhurat**
Tap **Muhurat** in the app.

**Step 4: Select Event Type**
Choose your event from the list.

**Step 5: Enter Dates (Optional)**
If you have preferred dates, enter them.

**Step 6: View Muhurat Results**
Janthari shows:
- All recommended times
- Auspicious times (green)
- Okay times (yellow)
- Avoid times (red)
- Time windows (usually 15–60 minutes)

**Understanding the Results:**

**Green (Highly Auspicious)**
- Best time for your event
- Planet alignment is perfect
- Go ahead with confidence

**Yellow (Acceptable)**
- Good timing, but not ideal
- No major obstacles
- Acceptable if you can\'t do green window

**Red (Avoid)**
- Unfavorable timing
- May face obstacles
- Best to reschedule if possible

**Step 7: Plan Around the Time Window**
Example:
- Muhurat: 2:15 PM – 2:45 PM on June 20
- Plan your ceremony/event to start within this window

**Pro Tips:**

**If Muhurat is very early/late:**
- Start your main event at Muhurat time
- Example: If Muhurat is 5:30 AM, do ceremony then (even if guests aren\'t there yet)

**If Muhurat is short (15 minutes):**
- Plan your event timeline accordingly
- Know exactly what will happen during Muhurat

**If you can\'t make the Muhurat:**
- Check next day\'s Muhurat
- Many events have acceptable windows on multiple days

**Real Example:**
- Marriage planned for July 10
- Janthari says: July 10 has no good Muhurat
- But July 15 has green window 6:00–7:15 PM
- Shift venue booking to July 15!`,
  },

  // FAQ
  {
    id: 'faq-birth-time',
    title: 'FAQ: I don\'t know my exact birth time. What do I do?',
    category: 'FAQ',
    module: 'general',
    readTime: 2,
    content: `**Q: I don\'t know my exact birth time. Can I still use Janthari?**

**A: Yes, but with limitations.**

**Option 1: Estimate**
- Use noon (12:00 PM) as a rough estimate
- This gives you a ballpark chart
- Accuracy: ~30–40%
- Better than nothing, but not ideal

**Option 2: Find Your Birth Time**
Check these sources:
1. **Birth Certificate** — First choice, usually has exact time
2. **Hospital Records** — Ask parents to contact hospital
3. **Parents/Grandparents** — Ask if they remember
4. **Astrological Software** — Some apps can estimate if you know your Lagna Rashi

**Option 3: Astrological Rectification**
- Work with an astrologer
- They analyze your life events to determine birth time
- More accurate but takes time and money

**Pro Tip:** Even a guess is better than noon. If you remember "morning," use 6:00 AM. This is more accurate than noon for morning births.

**Note:** Different charts need different birth times!
- 11:45 AM chart is different from 12:15 PM
- Even 1-2 minutes matters
- This is why exact time is so important`,
  },

  {
    id: 'faq-lagna-vs-rashi',
    title: 'FAQ: What\'s the difference between Lagna and Rashi?',
    category: 'FAQ',
    module: 'general',
    readTime: 2,
    content: `**Q: Lagna, Rashi, Moon sign, Sun sign... I\'m confused. Which one am I?**

**A: They are different things:**

**Lagna (Ascendant)**
- The zodiac sign on the eastern horizon at birth
- Your "public personality"
- Needs exact birth time
- Used for all house placements

**Rashi (Moon Sign in Vedic)**
- The zodiac sign where the Moon is positioned
- Your "emotional nature"
- Needs birth time but less sensitive
- Used for overall personality traits

**Sun Sign**
- The zodiac sign where the Sun is positioned
- Your "core identity"
- Only needs birth date, not time
- Least important in Vedic astrology

**Western Astrology vs. Vedic**

| Aspect | Western | Vedic |
|--------|---------|-------|
| Zodiac | Sun-based (Aries season = Apr) | Moon-based + lunar calendar |
| Primary Sign | Sun sign | Moon sign (Rashi) |
| 12 Signs | 12 months | 12 Rashis in lunar year |
| Accuracy | Less precise | More precise |
| Used for | Personality | Personality + timing + prediction |

**Simple Analogy:**
- **Lagna** = Your work personality (how you seem at the office)
- **Rashi** = Your home personality (how you are with family)
- **Sun Sign** = Your core essence (who you really are)

**Example:**
- Lagna: Leo (confident leader at work)
- Rashi: Cancer (emotional caregiver at home)
- Sun Sign: Virgo (detail-oriented in reality)

All three describe different facets of you!`,
  },

  {
    id: 'faq-kundali-matching',
    title: 'FAQ: What is Kundali Matching? Is it necessary for marriage?',
    category: 'FAQ',
    module: 'general',
    readTime: 3,
    content: `**Q: My family wants Kundali matching before marriage. What is it? Is it necessary?**

**A: Kundali Matching = Checking astrological compatibility between two birth charts**

**How it works:**
1. Get both birth charts (yours and your partner\'s)
2. Astrologer compares 8 dimensions of compatibility
3. Assigns points (out of 36) based on matches
4. Higher score = better compatibility

**8 Dimensions Checked:**

1. **Varna** — Nature compatibility (2 points)
2. **Vasya** — Dominance compatibility (2 points)
3. **Tara** — Birth star compatibility (3 points)
4. **Yoni** — Animal nature compatibility (4 points)
5. **Graha Maitri** — Planet friendship (5 points)
6. **Gana** — Temperament compatibility (6 points)
7. **Bhakoot** — Planetary aspects (7 points)
8. **Nadi** — Life pulse/health compatibility (8 points)

**Scoring:**
- 0–10: Incompatible (avoid)
- 10–20: Okay (manageable differences)
- 20–30: Good (compatible)
- 30+: Excellent (very compatible)

**Is it necessary?**
- **Tradition:** Many families consider it important
- **Modern view:** It\'s one factor among many
- **Practical:** Your relationship, personalities, and values matter more
- **Optional:** Some couples do it, some skip it

**Real Talk:**
Kundali Matching works best as a conversation starter, not a deal-breaker. If you\'re compatible as people, astrology won\'t fix it if you\'re not. And vice versa.

**In Janthari:**
We don\'t offer full Kundali matching yet, but we show your Yoni and Nadi—two key compatibility factors.`,
  },

  {
    id: 'faq-remedies',
    title: 'FAQ: If my chart shows challenges, can I fix them?',
    category: 'FAQ',
    module: 'general',
    readTime: 2,
    content: `**Q: My astrologer said I have "bad" planetary placements. Can I fix them?**

**A: Yes, through remedies—but not magic.**

**What are remedies?**
Actions you can take to strengthen weak planets or manage challenging ones. Think of them as "investing in luck."

**Common Remedies:**

**1. Pujas & Rituals**
- Perform puja to a specific deity
- Mantra repetition (e.g., recite "Om Namah Shivaya" 108 times)
- Fasting on specific days
- Example: Jupiter Puja to strengthen luck

**2. Wearing Gemstones**
- Ruby for Sun, Pearl for Moon, Coral for Mars, etc.
- Must be authentic and properly energized
- Consult an astrologer before buying

**3. Donations**
- Donate to charity (money, food, clothes)
- Support causes related to weak planet
- Example: Donate food to Saturn temple for Saturn challenges

**4. Lifestyle Changes**
- Wake early (for Sun-related issues)
- Meditation (for Moon/mind issues)
- Exercise (for Mars/energy issues)

**5. Timing (Muhurat)**
- Time important decisions to favorable planetary periods
- Avoid bad periods (Sade Sati, Dasha, Gochara)

**Reality Check:**
- Remedies don\'t "fix" your chart—they channel your efforts better
- Remedies + hard work = success
- Remedies alone won\'t make lazy people rich
- Think of it like: "I\'m blessed to work hard" vs. "Luck will find me"

**In Janthari:**
We recommend relevant Pujas based on your Tekni (like Janam Din Puja for overall blessing).`,
  },
  {
    id: 'faq-feedback-and-contribution',
    title: 'Feedback, Contribution, and Product Roadmap',
    category: 'FAQ',
    module: 'general',
    readTime: 3,
    content: `This section answers common practical questions from users.

**How can I provide feedback?**
You can share feedback through our support/contact channel listed in the app/website. We are also planning to add a dedicated in-app "Feedback" section so users can submit suggestions directly from Help.

**How can I contribute voluntarily?**
You can help by sharing cultural corrections, reporting mistakes, contributing festival details, and helping test new features. Donation/contribution options are being planned and will be published in a clear section once ready.

**Is there an Android or App Store app?**
Current focus is web access. Roadmap includes native mobile apps for Android and iOS, then voice assistant integrations like Siri and Alexa in later phases.

**How can I save Janthari for easy access?**
Open the website, then:
1. On iPhone Safari: Share -> Add to Home Screen
2. On Android Chrome: Menu -> Add to Home Screen
3. On desktop browser: Bookmark (Star icon) and pin tab

**About date mismatch reports (for example Mavas confusion)**
If you ever see a date that looks off, please report it with screenshot + date + location. Sometimes two lunar labels change very close to sunrise, so one day can look different across systems. We are improving display language so this is clearer for all users.`,
  },
];

// ============================================================================
// FAQ COLLECTION
// ============================================================================

export const HELP_FAQ: HelpFAQ[] = [
  {
    id: 'faq-birth-time-importance',
    question: 'Why is birth time so important?',
    answer:
      'Birth time (to the minute) determines your Lagna (ascendant), which is the foundation of your entire birth chart. A 1-minute difference can change your Lagna, shifting all planetary placements and predictions. This is why accurate birth time is critical.',
    category: 'Getting Started',
    relatedTerms: ['lagna', 'kundali', 'tekni'],
  },
  {
    id: 'faq-lunar-vs-solar',
    question: 'Why is the lunar calendar different from the regular calendar?',
    answer:
      'The lunar calendar is based on the Moon\'s 29.5-day cycle, while the solar calendar is based on Earth\'s 365-day orbit around the Sun. Hindu festivals are timed to lunar dates because ancient traditions observed the Moon\'s spiritual significance.',
    category: 'Calendar',
    relatedTerms: ['tithi', 'masa', 'paksha'],
  },
  {
    id: 'faq-tekni-accuracy',
    question: 'How accurate is my Tekni if I only know my birth date, not time?',
    answer:
      'Very limited. Without birth time, you can\'t determine your Lagna (the most important factor). You\'d be missing house placements and accurate predictions. Use noon as an estimate if needed, but finding your actual birth certificate is strongly recommended.',
    category: 'Tekni',
    relatedTerms: ['tekni', 'lagna', 'birth-info'],
  },
  {
    id: 'faq-muhurat-mandatory',
    question: 'Is Muhurat mandatory, or can I start an event anytime?',
    answer:
      'You can start anytime, but choosing an auspicious Muhurat is believed to increase chances of success by aligning with favorable planetary positions. Think of it as choosing a day when "luck is on your side." Many families follow Muhurat tradition, others don\'t—it\'s a personal choice.',
    category: 'Muhurat',
    relatedTerms: ['muhurat', 'vara', 'grahana'],
  },
  {
    id: 'faq-puja-religious',
    question: 'Do I need to be religious to perform puja?',
    answer:
      'No. Puja is a ritual that works for anyone—it\'s about intention, gratitude, and creating sacred space. You don\'t need to believe in deities; you can use puja as a mindfulness practice or intention-setting ceremony.',
    category: 'Puja',
    relatedTerms: ['puja', 'sankalp'],
  },
  {
    id: 'faq-gemstones',
    question: 'Do gemstones really work?',
    answer:
      'Gemstones have been used for centuries in Vedic tradition. Some people report benefits; others don\'t. If you\'re interested, consult a reputable gemologist and astrologer. Authenticity is key—fake gemstones won\'t help. View it as a complementary practice, not a guarantee.',
    category: 'FAQ',
  },
  {
    id: 'faq-children-chart',
    question: 'Should I generate a birth chart for my newborn?',
    answer:
      'It\'s helpful for reference and understanding your child\'s personality tendencies. Many families do this to find auspicious timings for naming ceremonies, first haircut, etc. Start their Janam Din Puja tradition on their first birthday.',
    category: 'Getting Started',
  },
  {
    id: 'faq-how-tithi-is-calculated',
    question: 'How exactly is Tithi calculated in Janthari?',
    answer:
      'Short answer: we calculate it from Moon-Sun angle, not from calendar date alone. Formula used is Tithi number = floor(((Moon longitude - Sun longitude) mod 360) / 12) + 1. Each Tithi is a 12 degree slice. Since Moon speed is not constant, Tithi duration is not fixed at 24 hours. So yes, one Tithi can end in the middle of your day. Practical KP-family rule: always trust the exact start/end time window, not just the Tithi name for that date.',
    category: 'Calendar',
    relatedTerms: ['tithi', 'nakshatra', 'vedic_astrology'],
  },
  {
    id: 'faq-how-muhurat-is-decided',
    question: 'How does Janthari decide a Muhurat is good or bad?',
    answer:
      'It is a combined decision, not a one-line yes/no. Janthari checks Vara (weekday ruler), event-fit of Tithi, Nakshatra quality, and exclusion windows (for example eclipse periods), then ranks windows as high/medium/avoid. In plain family language: first we remove clearly bad slots, then we rank the remaining slots. Practical rule: if you cannot take the top slot, pick the next green window for the same event type instead of randomizing by convenience.',
    category: 'Muhurat',
    relatedTerms: ['muhurat', 'vara', 'grahana', 'kp_astrology'],
  },
  {
    id: 'faq-why-results-differ',
    question: 'Why does Janthari sometimes differ from a priest or another Panchang app?',
    answer:
      'This is normal and usually comes from setup differences, not "wrong astrology." Top 4 reasons are: (1) different Ayanamsa setting, (2) timezone/daylight-saving handling, (3) location coordinates used, and (4) rule priority while filtering Muhurat. Even a 1-2 minute shift can cross a boundary. Practical rule for families: compare only after confirming both systems use the same location, timezone, and Ayanamsa. Janthari keeps one consistent KP-oriented path so your results stay stable across repeated checks.',
    category: 'FAQ',
    relatedTerms: ['krishnamurthy_ayanamsa', 'kp_astrology', 'muhurat'],
  },
  {
    id: 'faq-location-impact',
    question: 'Why does changing location change my chart and Muhurat?',
    answer:
      'Because astrology is sky-at-location based, not generic-country based. Location changes timezone and local horizon. Lagna depends on the rising sign at that exact place/time, so nearby cities can still shift house boundaries. Muhurat can also move because sunrise-linked and local-time calculations depend on latitude/longitude. Practical rule: enter exact birth city first; if unknown, use nearest real town and keep that choice consistent everywhere.',
    category: 'Tekni',
    relatedTerms: ['lagna', 'tekni', 'muhurat'],
  },
  {
    id: 'faq-midnight-birth',
    question: 'If birth is around midnight, which date should I enter?',
    answer:
      'Use official hospital-record date and clock time as primary input. Births around 11:50 PM to 12:10 AM are very sensitive because date rollover can change houses and sometimes key boundaries. If family memory says a different traditional date, keep that as a note, but compute chart on documented civil date/time first. Practical rule: for midnight cases, double-check AM/PM and timezone before interpreting results.',
    category: 'Getting Started',
    relatedTerms: ['tekni', 'lagna'],
  },
  {
    id: 'faq-unknown-time-confidence',
    question: 'If my birth time is approximate, how much should I trust the result?',
    answer:
      'Use confidence bands: +/- 5 minutes is usually usable, +/- 15 minutes is moderate, and +/- 30+ minutes is low confidence for house-level readings. Moon-sign tendencies can still be directionally useful, but Lagna and houses may shift. Practical family rule: if time uncertainty is big, use the chart for broad guidance only, and avoid final marriage/career timing decisions until birth time is confirmed or rectified.',
    category: 'Tekni',
    relatedTerms: ['tekni', 'lagna', 'rashi'],
  },
  {
    id: 'faq-birthday-which-date',
    question: 'Which birthday should we follow: solar date or Janma Tithi?',
    answer:
      'Both are valid, but they serve different purposes. Solar birthday is civil/social (school, office, legal records). Janma Tithi is traditional/spiritual (puja, sankalp, blessings). Practical family rule: celebrate socially on solar date, do puja on Janma Tithi when possible.',
    category: 'Calendar',
    relatedTerms: ['tithi', 'puja', 'sankalp'],
  },
  {
    id: 'faq-timezone-dst',
    question: 'How do timezone and daylight saving affect calculations?',
    answer:
      'A lot. Birth time must be interpreted in the local timezone at that historical date, including daylight saving where applicable. If timezone is off by even 1 hour, Lagna and house placements can shift. Practical rule: for births outside India, verify city and date-specific timezone first before trusting interpretation.',
    category: 'Getting Started',
    relatedTerms: ['tekni', 'lagna'],
  },
  {
    id: 'faq-nakshatra-changed',
    question: 'Why did my Nakshatra change after correcting time/location?',
    answer:
      'Nakshatra boundaries are degree-based, so small input fixes can move the Moon across a boundary. Correcting birth minute, city coordinates, or timezone can therefore change Nakshatra and related outputs like Nadi/Yoni. Practical rule: finalize inputs first, then freeze chart for family use.',
    category: 'Tekni',
    relatedTerms: ['nakshatra', 'nadi', 'yoni'],
  },
  {
    id: 'faq-two-good-muhurats',
    question: 'If two Muhurat windows are good, how should we pick one?',
    answer:
      'Pick by this order: (1) higher rank in app, (2) better practical readiness (all key people available), (3) calmer window with fewer logistical risks. In family practice, a "good and executable" Muhurat is better than a "perfect but chaotic" one.',
    category: 'Muhurat',
    relatedTerms: ['muhurat', 'vara'],
  },
  {
    id: 'faq-priest-vs-app',
    question: 'Should we follow the priest or the app when there is a difference?',
    answer:
      'Use Janthari for transparent baseline and consistency. Then discuss any mismatch with your family priest by comparing assumptions: Ayanamsa, location, timezone, and event rules. Practical rule: align inputs first, then decide together. App and priest should support each other, not compete.',
    category: 'FAQ',
    relatedTerms: ['kp_astrology', 'krishnamurthy_ayanamsa', 'muhurat'],
  },
  {
    id: 'faq-minimum-puja',
    question: 'If we do not have full Samagri, can we still do puja properly?',
    answer:
      'Yes. Minimum valid setup is clean space, diya (or safe lamp), water, and sincere sankalp. Flowers/incense/sweets improve the ritual but are not mandatory for devotion. Practical family rule: do simple puja correctly rather than postponing endlessly for perfect materials.',
    category: 'Puja',
    relatedTerms: ['puja', 'samagri', 'sankalp'],
  },
  {
    id: 'faq-remedy-priority',
    question: 'How do we choose remedies when many are suggested?',
    answer:
      'Prioritize low-risk, repeatable remedies first: daily discipline, mantra, charity, and simple puja. Add gemstones or costly actions only after expert validation. Practical rule: consistent small remedies over 90 days are usually better than expensive one-time fixes.',
    category: 'FAQ',
    relatedTerms: ['puja', 'mantra', 'tekni'],
  },
  {
    id: 'faq-chart-refresh',
    question: 'Do we need to regenerate Tekni every year?',
    answer:
      'Birth chart (Tekni) itself is fixed for life once correct inputs are set. What changes over time are transits and timing interpretations. Practical rule: keep one verified Tekni, then refresh forecasts/Muhurat checks when planning events.',
    category: 'Tekni',
    relatedTerms: ['tekni', 'muhurat'],
  },
  {
    id: 'faq-can-use-offline',
    question: 'Can Janthari be used offline at home during rituals?',
    answer:
      'Most core help content and previously saved data can be used offline. Some dynamic calculations or sync flows may need internet depending on feature path. Practical rule: open and verify required screens before starting ritual if connectivity is uncertain.',
    category: 'Getting Started',
    relatedTerms: ['puja', 'calendar'],
  },
  {
    id: 'faq-how-sure-are-dates',
    question: 'How can we be sure these dates are correct?',
    answer:
      'We use consistent astronomical calculations for Sun-Moon positions and then derive Tithi and lunar month from those values. Still, edge cases near sunrise can look different across apps if settings differ. Simple rule for users: if a date feels unusual, share date + location + screenshot with us and we will verify quickly.',
    category: 'Calendar',
    relatedTerms: ['tithi', 'muhurat', 'vedic_astrology'],
  },
  {
    id: 'faq-data-source',
    question: 'What is the underlying data source for this information?',
    answer:
      'Janthari uses rule-based calendar logic plus astronomical formulas (Sun and Moon positions) implemented in the app code. Festival mappings are curated in our Kashmiri Pandit festival dataset and monthly observance rules. We do not randomly copy one external panchang feed; we apply one consistent method so results remain stable.',
    category: 'FAQ',
    relatedTerms: ['kp_astrology', 'tithi'],
  },
  {
    id: 'faq-app-roadmap',
    question: 'Is there an Android or App Store app? What is the future plan?',
    answer:
      'Right now Janthari is available on web. Roadmap plan: Phase 1 native Android app, Phase 2 native iOS app, Phase 3 assistant integrations (Siri shortcuts and Alexa-style voice support), and Phase 4 deeper personalization and reminders. We will publish rollout updates openly as each phase is ready.',
    category: 'Getting Started',
    relatedTerms: ['calendar', 'puja'],
  },
  {
    id: 'faq-bookmark-site',
    question: 'How can I bookmark the website so it is easy to access?',
    answer:
      'Use these quick steps: iPhone Safari -> Share -> Add to Home Screen. Android Chrome -> Menu -> Add to Home Screen. Desktop -> click the Star icon in browser and pin the tab if needed. This makes Janthari open like an app shortcut.',
    category: 'Getting Started',
    relatedTerms: ['calendar'],
  },
  {
    id: 'faq-voluntary-contribution',
    question: 'I wish to do voluntary contribution. How can I help?',
    answer:
      'You can help in practical ways: report date issues, suggest missing KP observances, review language for elders, and help test new features before release. A dedicated contribution/support section is being planned, and once ready we will publish clear options for volunteer and financial support.',
    category: 'FAQ',
    relatedTerms: ['calendar', 'puja'],
  },
  {
    id: 'faq-feedback-channel',
    question: 'How can I provide feedback to improve the website?',
    answer:
      'You can currently share feedback through our existing contact/support channel. We are adding a dedicated "Feedback" section inside Help so users can submit ideas directly from the app/website. For best action, share: what you expected, what happened, screenshot, date, and location.',
    category: 'FAQ',
    relatedTerms: ['calendar', 'muhurat'],
  },
  {
    id: 'faq-mavas-not-showing',
    question: 'Why does a Tithi sometimes appear to be "missing" on the calendar?',
    answer:
      'In Kashmiri Pandit and other Hindu calendars, sometimes a lunar day (Tithi) is so short that it does not "prevail" (reach sunrise) at all. This is called a Kshaya Tithi (skipped day). When this happens, you will see a note on the calendar like "Pratipada was short (kshaya tithi) — missing day." This explains the jump and is not an error. Example: In June 2026, Amavasya is followed by Pratipada the next day, but Pratipada was very short, so the calendar skips from Amavasya directly to Dwitiya. Practical family rule: when you see a "missing day" note, it means the lunar calendar is showing astronomical reality. These are common in Kashmiri calendars.',
    category: 'Calendar',
    relatedTerms: ['tithi', 'kshaya'],
  },
  {
    id: 'faq-double-day-tithi',
    question: 'Why does a Tithi sometimes appear on two consecutive days?',
    answer:
      'Sometimes a lunar day (Tithi) is long enough to span two calendar days. This is called an Adhika Tithi (double day). When this happens, you\'ll see a note like "Double day — Ashtami appears on two consecutive days." This is also normal and reflects the Moon\'s actual position. The two-day Tithi does not duplicate festivals or pujas; you celebrate on the first occurrence or check with your priest. Practical rule: if your Janma Tithi (birth Tithi) appears twice in a year, celebrate on the first occurrence, unless your family tradition says otherwise.',
    category: 'Calendar',
    relatedTerms: ['tithi', 'adhika'],
  },
  {
    id: 'faq-mavas-showing',
    question: 'I see "Amavasya" is now shown correctly with a note about missing day. What changed?',
    answer:
      'We updated Janthari to show true lunar dates and add helpful flags when Tithis are missing or doubled. Previously, when a Tithi was very short, the calendar would replace it with the next one for continuity. Now we show the actual observed Tithi and add a note explaining what happened. This is more transparent and helps families understand the lunar calendar better. For example: June 15, 2026 now correctly shows Amavasya (Mavas) with a note that Pratipada was short. This update applies to all dates and calendars going forward.',
    category: 'Calendar',
    relatedTerms: ['tithi', 'kshaya', 'amavasya'],
  },
];

// ============================================================================
// TOPIC ORGANIZATION FOR NAVIGATION
// ============================================================================

export const HELP_TOPICS_BY_CATEGORY = {
  'Getting Started': [
    HELP_GUIDES[0], // Welcome
    HELP_GUIDES[1], // Birth Info
    HELP_GUIDES[2], // Privacy
  ],
  Calendar: [
    HELP_GUIDES[3], // Lunar Calendar
    HELP_GUIDES[4], // Tithi
    HELP_GUIDES[5], // Festivals
  ],
  Tekni: [
    HELP_GUIDES[6], // Intro
    HELP_GUIDES[7], // Lagna
    HELP_GUIDES[8], // Grahas
    HELP_GUIDES[9], // Bhavas
    HELP_GUIDES[10], // Nadi Yoni
  ],
  Puja: [
    HELP_GUIDES[11], // What is Puja
    HELP_GUIDES[12], // Janam Din Puja
    HELP_GUIDES[13], // Samagri
  ],
  Muhurat: [
    HELP_GUIDES[14], // What is Muhurat
    HELP_GUIDES[15], // Finding Best Muhurat
  ],
  FAQ: [
    HELP_GUIDES[16], // Birth Time
    HELP_GUIDES[17], // Lagna vs Rashi
    HELP_GUIDES[18], // Kundali Matching
    HELP_GUIDES[19], // Remedies
    HELP_GUIDES[20], // Feedback and Contribution
  ],
};

// ============================================================================
// SEARCH HELPER: Flatten all content for search
// ============================================================================

export const getAllSearchableContent = () => {
  const searchable: Array<{
    id: string;
    type: 'term' | 'guide' | 'faq';
    title: string;
    content: string;
    category: string;
  }> = [];

  // Add glossary terms
  Object.values(HELP_GLOSSARY).forEach((term) => {
    searchable.push({
      id: term.id,
      type: 'term',
      title: term.title,
      content: `${term.shortDesc}\n${term.fullDesc}\n${term.whyItMatters}\n${(term.examples || []).join('\n')}`,
      category: term.module,
    });
  });

  // Add guides
  HELP_GUIDES.forEach((guide) => {
    searchable.push({
      id: guide.id,
      type: 'guide',
      title: guide.title,
      content: guide.content,
      category: guide.category,
    });
  });

  // Add FAQs
  HELP_FAQ.forEach((faq) => {
    searchable.push({
      id: faq.id,
      type: 'faq',
      title: faq.question,
      content: faq.answer,
      category: faq.category,
    });
  });

  return searchable;
};
