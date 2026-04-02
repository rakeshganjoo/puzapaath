/**
 * Kashmiri Pandit festivals and important observances.
 * Each festival is defined by its lunar date (month, paksha, tithi).
 * Some festivals span multiple days.
 */

export interface KPFestival {
  name: string;
  nameKashmiri?: string;
  lunarMonth: string;
  lunarMonthAlt?: string; // Alternative month for rashi-boundary dates
  paksha: 'shukla' | 'krishna';
  tithi: number; // 1-15
  description: string;
  category: 'major' | 'observance' | 'fasting';
}

export const KP_FESTIVALS: KPFestival[] = [
  // ── CHAITRA ──
  {
    name: 'Navreh (New Year)',
    nameKashmiri: 'नवरेह',
    lunarMonth: 'Chaitra',
    paksha: 'shukla',
    tithi: 1,
    description: 'Kashmiri Pandit New Year. View the Navreh Thali with rice, calendar, bread, yogurt, walnuts, flowers, and a mirror at dawn.',
    category: 'major',
  },
  {
    name: 'Ram Navami',
    lunarMonth: 'Chaitra',
    paksha: 'shukla',
    tithi: 9,
    description: 'Birthday of Lord Rama. Fast and worship.',
    category: 'major',
  },
  // ── VAISHAKH ──
  {
    name: 'Pan / Baisakhi',
    nameKashmiri: 'पान',
    lunarMonth: 'Vaishakh',
    paksha: 'shukla',
    tithi: 1,
    description: 'First day of Vaishakh. Spring harvest festival.',
    category: 'observance',
  },
  {
    name: 'Vaishakh Ashtami',
    lunarMonth: 'Vaishakh',
    paksha: 'shukla',
    tithi: 8,
    description: 'Ashtami observance — visit temple.',
    category: 'observance',
  },
  // ── JYESHTHA ──
  {
    name: 'Zyeshta Ashtami (Kheer Bhawani)',
    nameKashmiri: 'ज़्येष्ठा अष्टमी',
    lunarMonth: 'Jyeshtha',
    paksha: 'shukla',
    tithi: 8,
    description: 'Pilgrimage to Kheer Bhawani temple at Tulmul. One of the most important KP festivals. Offer milk and kheer to the sacred spring.',
    category: 'major',
  },
  // ── ASHADH ──
  {
    name: 'Guru Purnima',
    lunarMonth: 'Ashadh',
    paksha: 'shukla',
    tithi: 15,
    description: 'Day to honor the Guru. Worship Ved Vyasa.',
    category: 'observance',
  },
  {
    name: 'Har Navami',
    lunarMonth: 'Ashadh',
    paksha: 'shukla',
    tithi: 9,
    description: 'Worship of Goddess Sharika (Hari Parbat).',
    category: 'observance',
  },
  // ── SHRAVAN ──
  {
    name: 'Shravan Purnima (Raksha Bandhan)',
    nameKashmiri: 'श्रावण पूर्णिमा',
    lunarMonth: 'Shravan',
    paksha: 'shukla',
    tithi: 15,
    description: 'Raksha Bandhan — sisters tie Naervan (sacred thread) on brother\'s wrist. Change Janeu (sacred thread).',
    category: 'major',
  },
  {
    name: 'Janmashtami',
    nameKashmiri: 'ज़न्माष्टमी',
    lunarMonth: 'Bhadrapad',
    paksha: 'krishna',
    tithi: 8,
    description: 'Birthday of Lord Krishna. Fast all day, break fast at midnight after puja.',
    category: 'major',
  },
  // ── BHADRAPAD ──
  {
    name: 'Ganesh Chaturthi',
    lunarMonth: 'Bhadrapad',
    paksha: 'shukla',
    tithi: 4,
    description: 'Birthday of Lord Ganesh.',
    category: 'observance',
  },
  {
    name: 'Anant Chaturdashi',
    lunarMonth: 'Bhadrapad',
    paksha: 'shukla',
    tithi: 14,
    description: 'Worship of Ananta (Vishnu). Tie the Anant thread.',
    category: 'observance',
  },
  // ── ASHWIN ──
  {
    name: 'Navratri Begins',
    nameKashmiri: 'नवरात्र',
    lunarMonth: 'Ashwin',
    paksha: 'shukla',
    tithi: 1,
    description: 'Nine nights of Devi worship begin. KPs celebrate with special pujas each day.',
    category: 'major',
  },
  {
    name: 'Dussehra / Vijayadashami',
    nameKashmiri: 'दशहरा',
    lunarMonth: 'Ashwin',
    paksha: 'shukla',
    tithi: 10,
    description: 'Victory of good over evil. Exchange of Naervan (sacred thread) and blessings.',
    category: 'major',
  },
  {
    name: 'Kaw Purnima',
    nameKashmiri: 'कॉव पूर्णिमा',
    lunarMonth: 'Ashwin',
    paksha: 'shukla',
    tithi: 15,
    description: 'Feed crows (ancestors). KPs cook special rice and place it on rooftops for crows.',
    category: 'observance',
  },
  // ── KARTIK ──
  {
    name: 'Diwali / Deepawali',
    nameKashmiri: 'दीवली',
    lunarMonth: 'Kartik',
    paksha: 'krishna',
    tithi: 15,
    description: 'Festival of lights. KPs light Aer (walnuts strung in grass) near water sources. Lakshmi puja in the evening.',
    category: 'major',
  },
  // ── MARGSHIRSH ──
  {
    name: 'Gita Jayanti',
    lunarMonth: 'Margshirsh',
    paksha: 'shukla',
    tithi: 11,
    description: 'Day the Bhagavad Gita was revealed. Read or recite the Gita.',
    category: 'observance',
  },
  // ── PAUSH ──
  {
    name: 'Shishur Saptami (Lohri)',
    nameKashmiri: 'शिशुर',
    lunarMonth: 'Magh',
    paksha: 'krishna',
    tithi: 7,
    description: 'KP Lohri. Prepare Girda (bread) and other traditional foods. Light a bonfire.',
    category: 'observance',
  },
  // ── MAGH ──
  {
    name: 'Phalgun Krishna Ashtami',
    lunarMonth: 'Phalgun',
    paksha: 'krishna',
    tithi: 8,
    description: 'Ashtami observance in Phalgun.',
    category: 'fasting',
  },
  // ── PHALGUN ──
  {
    name: 'Herath (Maha Shivratri)',
    nameKashmiri: 'हेरथ',
    lunarMonth: 'Phalgun',
    paksha: 'krishna',
    tithi: 13,
    description: 'The biggest KP festival. Three-day celebration honoring Lord Shiva\'s marriage to Parvati. Day 1 (Vagur Batta): special Vatuk puja with walnuts arranged in a mound. All-night vigil with four prahar pujas.',
    category: 'major',
  },
  {
    name: 'Herath Salaam (Zang Trai)',
    nameKashmiri: 'ज़ंग त्राय',
    lunarMonth: 'Phalgun',
    paksha: 'krishna',
    tithi: 14,
    description: 'Day after Shivratri. Exchange greetings. Elders give blessings and children receive money (Herath Kharchi).',
    category: 'major',
  },
  {
    name: 'Holi',
    lunarMonth: 'Phalgun',
    paksha: 'shukla',
    tithi: 15,
    description: 'Festival of colors. Holika Dahan on the eve.',
    category: 'observance',
  },
  // ── Recurring monthly observances ──
];

/**
 * Get monthly recurring observances that apply to every lunar month.
 */
export function getMonthlyObservances(tithi: number, paksha: 'shukla' | 'krishna'): string[] {
  const obs: string[] = [];
  if (paksha === 'shukla' && tithi === 11) obs.push('Ekadashi (Fasting)');
  if (paksha === 'krishna' && tithi === 11) obs.push('Ekadashi (Fasting)');
  if (paksha === 'shukla' && tithi === 15) obs.push('Purnima (Full Moon)');
  if (paksha === 'krishna' && tithi === 15) obs.push('Amavasya (New Moon)');
  if (paksha === 'shukla' && tithi === 4) obs.push('Chaturthi (Ganesh Day)');
  if (paksha === 'shukla' && tithi === 8) obs.push('Ashtami');
  return obs;
}

/** Observance tag for print highlighting — returns CSS class + short label. */
export interface ObservanceTag {
  cls: string;  // CSS class name
  label: string;
  detail: string; // expanded description for summary
}

export function getObservanceTags(
  tithi: number,
  paksha: 'shukla' | 'krishna',
  lunarMonth: string,
): ObservanceTag[] {
  const tags: ObservanceTag[] = [];
  if (tithi === 8 && paksha === 'shukla')
    tags.push({ cls: 'ashtami', label: '🔱 Ashtami', detail: `${lunarMonth} Shukla Ashtami — Temple visit, Devi puja` });
  if (tithi === 11 && paksha === 'shukla')
    tags.push({ cls: 'ekadashi', label: '🙏 Ekadashi', detail: `${lunarMonth} Shukla Ekadashi — Fast, Vishnu puja` });
  if (tithi === 11 && paksha === 'krishna')
    tags.push({ cls: 'ekadashi', label: '🙏 Ekadashi', detail: `${lunarMonth} Krishna Ekadashi — Fast, Vishnu puja` });
  if (tithi === 15 && paksha === 'shukla')
    tags.push({ cls: 'purnima', label: '🌕 Purnima', detail: `${lunarMonth} Purnima — Full Moon, auspicious for havan & charity` });
  if (tithi === 15 && paksha === 'krishna')
    tags.push({ cls: 'amavasya', label: '🌑 Amavasya', detail: `${lunarMonth} Amavasya — New Moon, tarpan for ancestors` });
  if (tithi === 4 && paksha === 'shukla')
    tags.push({ cls: 'chaturthi', label: '🐘 Chaturthi', detail: `${lunarMonth} Shukla Chaturthi — Ganesh puja` });
  return tags;
}
