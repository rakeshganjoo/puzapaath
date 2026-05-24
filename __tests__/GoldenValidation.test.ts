import { gregorianToLunar, gregorianToLunarWithTime } from '../src/services/HinduCalendar';
import { KP_FESTIVALS } from '../src/data/kpFestivals';

type GoldenCase = {
  date: string;
  lunarMonth: string;
  paksha: 'shukla' | 'krishna';
  tithiNum: number;
  festivalName?: string;
  source: string;
  hour?: number;
  minute?: number;
  utcOffset?: number;
};

const GOLDEN_CASES: GoldenCase[] = [
  {
    date: '1975-01-03',
    lunarMonth: 'Paush',
    paksha: 'krishna',
    tithiNum: 6,
    source: 'Family validation note preserved in cal_test.ts',
  },
  {
    date: '2024-03-25',
    lunarMonth: 'Phalgun',
    paksha: 'shukla',
    tithiNum: 15,
    festivalName: 'Holi',
    source: 'Widely published Holi / Phalguna Purnima date',
  },
  {
    date: '2024-08-19',
    lunarMonth: 'Shravan',
    paksha: 'shukla',
    tithiNum: 15,
    festivalName: 'Shravan Purnima (Raksha Bandhan)',
    source: 'Widely published Raksha Bandhan date',
  },
  {
    date: '2024-08-26',
    lunarMonth: 'Bhadrapad',
    paksha: 'krishna',
    tithiNum: 8,
    festivalName: 'Janmashtami',
    source: 'Widely published Janmashtami date',
  },
  {
    date: '2024-09-07',
    lunarMonth: 'Bhadrapad',
    paksha: 'shukla',
    tithiNum: 4,
    festivalName: 'Ganesh Chaturthi',
    source: 'Widely published Ganesh Chaturthi date',
  },
  {
    date: '2024-10-12',
    lunarMonth: 'Ashwin',
    paksha: 'shukla',
    tithiNum: 10,
    festivalName: 'Dussehra / Vijayadashami',
    hour: 15,
    minute: 0,
    utcOffset: 5.5,
    source: 'Widely published Vijayadashami date; checked at aparahna-style observance time',
  },
  {
    date: '2024-12-11',
    lunarMonth: 'Margshirsh',
    paksha: 'shukla',
    tithiNum: 11,
    festivalName: 'Gita Jayanti',
    source: 'Widely published Gita Jayanti date',
  },
  {
    date: '2025-02-26',
    lunarMonth: 'Phalgun',
    paksha: 'krishna',
    tithiNum: 13,
    festivalName: 'Herath (Maha Shivratri)',
    source: 'Repo validation note in cal_test.ts for Herath 2025',
  },
  {
    date: '2025-10-20',
    lunarMonth: 'Kartik',
    paksha: 'krishna',
    tithiNum: 15,
    festivalName: 'Diwali / Deepawali',
    hour: 19,
    minute: 0,
    utcOffset: 5.5,
    source: 'Repo validation note in cal_test.ts for Diwali 2025; checked at evening Lakshmi-puja style time',
  },
];

describe('Golden validation suite', () => {
  test.each(GOLDEN_CASES)('$date -> $lunarMonth $paksha $tithiNum', ({ date, lunarMonth, paksha, tithiNum, hour, minute, utcOffset }) => {
    const result = hour != null && minute != null && utcOffset != null
      ? gregorianToLunarWithTime(
          Number(date.slice(0, 4)),
          Number(date.slice(5, 7)),
          Number(date.slice(8, 10)),
          hour,
          minute,
          utcOffset,
        )
      : gregorianToLunar(date);
    expect(result).not.toBeNull();
    expect(result?.lunarMonth).toBe(lunarMonth);
    expect(result?.paksha).toBe(paksha);
    expect(result?.tithiNum).toBe(tithiNum);
  });

  test.each(GOLDEN_CASES.filter((c) => c.festivalName))(
    '$date matches festival mapping for $festivalName',
    ({ date, festivalName, hour, minute, utcOffset }) => {
      const result = hour != null && minute != null && utcOffset != null
        ? gregorianToLunarWithTime(
            Number(date.slice(0, 4)),
            Number(date.slice(5, 7)),
            Number(date.slice(8, 10)),
            hour,
            minute,
            utcOffset,
          )
        : gregorianToLunar(date);
      expect(result).not.toBeNull();

      const matches = KP_FESTIVALS.filter(
        (f) =>
          (f.lunarMonth === result?.lunarMonth || f.lunarMonthAlt === result?.lunarMonth) &&
          f.paksha === result?.paksha &&
          f.tithi === result?.tithiNum,
      );

      expect(matches.length).toBeGreaterThan(0);
      expect(matches.some((m) => m.name === festivalName)).toBe(true);
    },
  );

  test('golden cases remain unique and reviewable', () => {
    const keys = GOLDEN_CASES.map((c) => `${c.date}|${c.lunarMonth}|${c.paksha}|${c.tithiNum}`);
    expect(new Set(keys).size).toBe(GOLDEN_CASES.length);
    expect(GOLDEN_CASES.every((c) => c.source.length > 0)).toBe(true);
  });
});