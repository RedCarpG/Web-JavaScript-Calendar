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

function describe(solar: SolarDay): Pick<DayCell, 'sub' | 'subKind'> {
  const lunar = solar.getLunarDay()
  const festival = solar.getFestival() ?? lunar.getFestival()
  if (festival) return { sub: festival.getName(), subKind: 'festival' }
  const term = solar.getTermDay()
  if (term.getDayIndex() === 0) return { sub: term.getSolarTerm().getName(), subKind: 'term' }
  if (lunar.getDay() === 1) return { sub: lunar.getLunarMonth().getName(), subKind: 'month' }
  return { sub: lunar.getName(), subKind: 'lunar' }
}

/** Six-week grid covering the given month, starting on Monday or Sunday. */
export function buildMonthGrid(year: number, month: number, weekStart: WeekStart = 'mon'): DayCell[] {
  const first = SolarDay.fromYmd(year, month, 1)
  // tyme4ts weeks: 0 = Sunday … 6 = Saturday; shift so weekStart is column 0.
  const lead = (first.getWeek().getIndex() + (weekStart === 'mon' ? 6 : 0)) % 7
  const start = first.next(-lead)
  const today = todaySolar()
  const cells: DayCell[] = []
  for (let i = 0; i < 42; i++) {
    const solar = start.next(i)
    const holiday = solar.getLegalHoliday()
    cells.push({
      key: solar.toString(),
      solar,
      day: solar.getDay(),
      inMonth: solar.getMonth() === month,
      isToday: sameDay(solar, today),
      isWeekend: solar.getWeek().getIndex() % 6 === 0,
      holiday: holiday ? (holiday.isWork() ? '班' : '休') : undefined,
      ...describe(solar),
    })
  }
  return cells
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
