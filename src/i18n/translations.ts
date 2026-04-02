export type AppLocale = 'en' | 'hi' | 'ks';

interface TranslationTree {
  [key: string]: string | TranslationTree;
}

type LocaleDictionary = Record<AppLocale, TranslationTree>;

export const DEFAULT_LOCALE: AppLocale = 'en';

export const SUPPORTED_LOCALES: { code: AppLocale; label: string }[] = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'Hindi' },
  { code: 'ks', label: 'Kashmiri' },
];

export const translations: LocaleDictionary = {
  en: {
    common: {
      language: 'Language',
      comingSoon: 'Coming Soon',
      shuklaPaksha: 'Shukla Paksha',
      krishnaPaksha: 'Krishna Paksha',
      purnima: 'Purnima',
      amavasya: 'Amavasya',
    },
    nav: {
      pujaHome: 'Interactive Puja Paath',
      setup: 'Setup (Sankalp)',
      samagri: 'Samagri - Materials',
      calendar: 'KP Calendar',
      calendarExplainer: 'How KP Calendar Works',
      tithiCalculator: 'Tithi Calculator',
      muhuratPicker: 'Shubh Muhurat Finder',
      muhuratInput: 'Muhurat Details',
      muhuratResults: 'Your Shubh Muhurat',
      tekniInput: 'Tekni - Janam Kundali',
      tekniLoading: 'Computing Kundali...',
      tekniResult: 'Tekni - Your Takni',
      pujaNavigator: 'Puja Steps',
      stepDetail: 'Step',
    },
    home: {
      tiles: {
        calendarTitle: 'KP Calendar',
        calendarSub: 'Festivals - Tithis - Print',
        tithiTitle: 'Tithi Calculator',
        tithiSub: 'Find lunar date for any day',
        muhuratTitle: 'Shubh Muhurat Finder',
        muhuratSub: 'Auspicious time for events',
        pujaTitle: "Pu'za Paath (Interactive)",
        pujaSub: 'JanamDin - Step by step',
        tekniTitle: 'Tekni Making',
        tekniSub: 'Janam Kundali and PDF',
        zatukTitle: 'Zatuk',
        zatukSub: 'Full Horoscope and Kundali',
        jyotishTitle: 'Jyotish',
        jyotishSub: 'Vedic Astrology',
      },
      languageShort: {
        en: 'EN',
        hi: 'HI',
        ks: 'KS',
      },
    },
  },
  hi: {
    common: {
      language: 'भाषा',
      comingSoon: 'जल्द आ रहा है',
      shuklaPaksha: 'शुक्ल पक्ष',
      krishnaPaksha: 'कृष्ण पक्ष',
      purnima: 'पूर्णिमा',
      amavasya: 'अमावस्या',
    },
    nav: {
      pujaHome: 'इंटरैक्टिव पूजा पाठ',
      setup: 'सेटअप (संकल्प)',
      samagri: 'सामग्री',
      calendar: 'केपी कैलेंडर',
      calendarExplainer: 'केपी कैलेंडर कैसे काम करता है',
      tithiCalculator: 'तिथि कैलकुलेटर',
      muhuratPicker: 'शुभ मुहूर्त खोजक',
      muhuratInput: 'मुहूर्त विवरण',
      muhuratResults: 'आपका शुभ मुहूर्त',
      tekniInput: 'टेकनी - जन्म कुंडली',
      tekniLoading: 'कुंडली गणना जारी...',
      tekniResult: 'टेकनी - आपकी तक्नी',
      pujaNavigator: 'पूजा चरण',
      stepDetail: 'चरण',
    },
    home: {
      tiles: {
        calendarTitle: 'केपी कैलेंडर',
        calendarSub: 'त्योहार - तिथि - प्रिंट',
        tithiTitle: 'तिथि कैलकुलेटर',
        tithiSub: 'किसी भी दिन की चंद्र तिथि जानें',
        muhuratTitle: 'शुभ मुहूर्त खोजक',
        muhuratSub: 'शुभ समय सुझाव',
        pujaTitle: 'पूजा पाठ (इंटरैक्टिव)',
        pujaSub: 'जन्मदिन - चरण दर चरण',
        tekniTitle: 'टेकनी निर्माण',
        tekniSub: 'जन्म कुंडली और पीडीएफ',
        zatukTitle: 'जतुक',
        zatukSub: 'पूर्ण राशिफल और कुंडली',
        jyotishTitle: 'ज्योतिष',
        jyotishSub: 'वैदिक ज्योतिष',
      },
      languageShort: {
        en: 'EN',
        hi: 'HI',
        ks: 'KS',
      },
    },
  },
  ks: {
    common: {
      language: 'زٕبٲن',
      comingSoon: 'یِیہ چھُ أسان',
      shuklaPaksha: 'شُکٕل پَکش',
      krishnaPaksha: 'کِرشٕن پَکش',
      purnima: 'پوٗرنِما',
      amavasya: 'اَماوَسیا',
    },
    nav: {
      pujaHome: 'انٹریکٹو پوجا پاٹھ',
      setup: 'سیٹ اَپ (سنکلپ)',
      samagri: 'سامگری',
      calendar: 'کے پی کیلنڈر',
      calendarExplainer: 'کے پی کیلنڈر کِتھ پٲٹھ چَلے',
      tithiCalculator: 'تِتھی کیلکولیٹر',
      muhuratPicker: 'شُبھ مُہورت فائنڈر',
      muhuratInput: 'مُہورت تفصیل',
      muhuratResults: 'تُہند شُبھ مُہورت',
      tekniInput: 'ٹیکنی - جنم کنڈلی',
      tekniLoading: 'کنڈلی حساب پَتہ...',
      tekniResult: 'ٹیکنی - تُہند تکنی',
      pujaNavigator: 'پوجا قدم',
      stepDetail: 'قدم',
    },
    home: {
      tiles: {
        calendarTitle: 'کے پی کیلنڈر',
        calendarSub: 'تہوار - تِتھی - پرنٹ',
        tithiTitle: 'تِتھی کیلکولیٹر',
        tithiSub: 'ہر روزٕچ چاندری تِتھی ژان',
        muhuratTitle: 'شُبھ مُہورت فائنڈر',
        muhuratSub: 'تقریب پٮٹھ شُبھ وقت',
        pujaTitle: 'پوجا پاٹھ (انٹریکٹو)',
        pujaSub: 'جنمدِن - قدم بہ قدم',
        tekniTitle: 'ٹیکنی بنٲون',
        tekniSub: 'جنم کنڈلی تہ پی ڈی ایف',
        zatukTitle: 'زَتُک',
        zatukSub: 'پورٕ Horoscope تہ کنڈلی',
        jyotishTitle: 'جیوٗتِش',
        jyotishSub: 'ویدک علم نجوم',
      },
      languageShort: {
        en: 'EN',
        hi: 'HI',
        ks: 'KS',
      },
    },
  },
};

function walk(tree: TranslationTree, parts: string[]): string | TranslationTree | undefined {
  let current: string | TranslationTree | undefined = tree;
  for (const part of parts) {
    if (typeof current === 'string' || !current || !(part in current)) return undefined;
    current = current[part] as string | TranslationTree;
  }
  return current;
}

export function translate(locale: AppLocale, key: string, fallback?: string): string {
  const parts = key.split('.');
  const primary = walk(translations[locale], parts);
  if (typeof primary === 'string') return primary;

  const secondary = walk(translations[DEFAULT_LOCALE], parts);
  if (typeof secondary === 'string') return secondary;

  return fallback ?? key;
}
