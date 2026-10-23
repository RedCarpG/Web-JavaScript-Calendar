import { SolarDay, type SixtyCycle } from 'tyme4ts'
import { glyph, type Glyph } from './bazi'

export interface DayCell {
  key: string
  solar: SolarDay
  day: number
  inMonth: boolean
  isToday: boolean
  isWeekend: boolean
  /** Text under the day number: festival > solar term > lunar day */
  sub: string
  subKind: 'festival' | 'term' | 'lunar' | 'month'
  /** 日干支, e.g. 庚午 */
  ganzhi: string
  /** 节气 starting this day, if any */
  termName?: string
  /** Solar or lunar festival, if any */
  festival?: string
  /** Statutory holiday marker: 休 (off) / 班 (make-up workday) */
  holiday?: '休' | '班'
}

export type WeekStart = 'mon' | 'sun'

const WEEKDAY_NAMES = ['日', '一', '二', '三', '四', '五', '六'] // tyme4ts index: 0 = Sunday

/** Column headers starting from the given weekday, with weekend flags. */
export function weekTitles(weekStart: WeekStart = 'mon'): { name: string; weekend: boolean }[] {
  const offset = weekStart === 'mon' ? 1 : 0
  return Array.from({ length: 7 }, (_, i) => {
    const index = (i + offset) % 7
    return { name: WEEKDAY_NAMES[index], weekend: index === 0 || index === 6 }
  })
}

export function todaySolar(): SolarDay {
  const d = new Date()
  return SolarDay.fromYmd(d.getFullYear(), d.getMonth() + 1, d.getDate())
}

export function sameDay(a: SolarDay, b: SolarDay): boolean {
  return a.getYear() === b.getYear() && a.getMonth() === b.getMonth() && a.getDay() === b.getDay()
}

function makeCell(solar: SolarDay, month: number, today: SolarDay): DayCell {
  // getLunarDay() is the expensive call; compute it once per cell.
  const lunar = solar.getLunarDay()
  const termDay = solar.getTermDay()
  const termName = termDay.getDayIndex() === 0 ? termDay.getSolarTerm().getName() : undefined
  const festival = solar.getFestival() ?? lunar.getFestival()
  const holiday = solar.getLegalHoliday()
  const sub: Pick<DayCell, 'sub' | 'subKind'> = festival
    ? { sub: festival.getName(), subKind: 'festival' }
    : termName
      ? { sub: termName, subKind: 'term' }
      : lunar.getDay() === 1
        ? { sub: lunar.getLunarMonth().getName(), subKind: 'month' }
        : { sub: lunar.getName(), subKind: 'lunar' }
  return {
    key: solar.toString(),
    solar,
    day: solar.getDay(),
    inMonth: solar.getMonth() === month,
    isToday: sameDay(solar, today),
    isWeekend: solar.getWeek().getIndex() % 6 === 0,
    holiday: holiday ? (holiday.isWork() ? '班' : '休') : undefined,
    ganzhi: lunar.getSixtyCycle().getName(),
    termName,
    festival: festival?.getName(),
    ...sub,
  }
}

/** Days to show before the 1st so that weekStart is column 0. */
function leadDays(first: SolarDay, weekStart: WeekStart): number {
  // tyme4ts weeks: 0 = Sunday … 6 = Saturday
  return (first.getWeek().getIndex() + (weekStart === 'mon' ? 6 : 0)) % 7
}

/** Six-week grid covering the given month, starting on Monday or Sunday. */
export function buildMonthGrid(year: number, month: number, weekStart: WeekStart = 'mon'): DayCell[] {
  const first = SolarDay.fromYmd(year, month, 1)
  const start = first.next(-leadDays(first, weekStart))
  const today = todaySolar()
  return Array.from({ length: 42 }, (_, i) => makeCell(start.next(i), month, today))
}

export interface WeekDay extends DayCell {
  duty: string
  recommends: string[]
  avoids: string[]
}

/** The seven days of the week containing anchor, with 建除 and 宜忌. */
export function buildWeek(anchor: SolarDay, weekStart: WeekStart = 'mon'): WeekDay[] {
  const start = anchor.next(-leadDays(anchor, weekStart))
  const today = todaySolar()
  return Array.from({ length: 7 }, (_, i) => {
    const solar = start.next(i)
    const lunar = solar.getLunarDay()
    return {
      ...makeCell(solar, solar.getMonth(), today),
      duty: lunar.getDuty().getName(),
      recommends: lunar.getRecommends().map((t) => t.getName()),
      avoids: lunar.getAvoids().map((t) => t.getName()),
    }
  })
}

export interface MiniMonth {
  month: number
  /** Empty cells before the 1st */
  lead: number
  days: DayCell[]
}

/** Twelve compact months for the year view (in-month days only). */
export function buildYear(year: number, weekStart: WeekStart = 'mon'): MiniMonth[] {
  const today = todaySolar()
  return Array.from({ length: 12 }, (_, i) => {
    const month = i + 1
    const first = SolarDay.fromYmd(year, month, 1)
    const count = first.getSolarMonth().getDayCount()
    return {
      month,
      lead: leadDays(first, weekStart),
      days: Array.from({ length: count }, (_, d) => makeCell(first.next(d), month, today)),
    }
  })
}

export interface DayDetail {
  solarText: string
  weekText: string
  constellation: string
  lunarText: string
  ganzhi: string
  /** 年、月、日三柱，供竖排显示 */
  pillars: { label: string; stem: Glyph; branch: Glyph }[]
  zodiac: string
  term: string
  festivals: string[]
  duty: string
  twelveStar: string
  twentyEightStar: string
  recommends: string[]
  avoids: string[]
  goodGods: string[]
  badGods: string[]
}

const pillar = (label: string, sc: SixtyCycle) => ({
  label,
  stem: glyph(sc.getHeavenStem()),
  branch: glyph(sc.getEarthBranch()),
})

export function buildDayDetail(solar: SolarDay): DayDetail {
  const lunar = solar.getLunarDay()
  const term = solar.getTermDay()
  const gods = lunar.getGods()
  const festivals = [solar.getFestival(), lunar.getFestival(), solar.getLegalHoliday()]
    .filter((f) => f != null)
    .map((f) => f.getName())
  return {
    solarText: `${solar.getYear()}年${solar.getMonth()}月${solar.getDay()}日`,
    weekText: `星期${solar.getWeek().getName()}`,
    constellation: `${solar.getConstellation().getName()}座`,
    lunarText: `${lunar.getLunarMonth().getName()}${lunar.getName()}`,
    ganzhi: solar.getSixtyCycleDay().toString(),
    pillars: [
      pillar('年', solar.getSixtyCycleDay().getYear()),
      pillar('月', solar.getSixtyCycleDay().getMonth()),
      pillar('日', solar.getSixtyCycleDay().getSixtyCycle()),
    ],
    zodiac: lunar.getYearSixtyCycle().getEarthBranch().getZodiac().getName(),
    term: `${term.getSolarTerm().getName()}第${term.getDayIndex() + 1}天`,
    festivals: [...new Set(festivals)],
    duty: lunar.getDuty().getName(),
    twelveStar: lunar.getTwelveStar().getName(),
    twentyEightStar: lunar.getTwentyEightStar().getName(),
    recommends: lunar.getRecommends().map((t) => t.getName()),
    avoids: lunar.getAvoids().map((t) => t.getName()),
    goodGods: gods.filter((g) => g.getLuck().getName() === '吉').map((g) => g.getName()),
    badGods: gods.filter((g) => g.getLuck().getName() !== '吉').map((g) => g.getName()),
  }
}
