// 紫微斗数命盘, built on iztro (https://github.com/SylarLong/iztro, MIT).
// iztro is only imported here, and this module is only loaded by the 紫微
// tab, so the calendar and bazi pages don't pay for it.
import { astro, util } from 'iztro'
import { LunarDay, LunarMonth, LunarYear, SolarDay } from 'tyme4ts'
import { effectiveTime, formatTime, type BaziInput, type ElementName } from './bazi'
import { mutagenTable, type ZiweiSchoolSettings } from './ziweiSchools'
import { STAR_ELEMENT, starLuck, type StarLuck } from './ziweiStars'

export interface ZiweiStar {
  name: string
  /** 庙 旺 得 利 平 不 陷 */
  brightness?: string
  /** 生年四化: 禄 权 科 忌 */
  mutagen?: string
  /** 五行, for 主星 and 辅星 */
  element?: ElementName
  /** 吉凶 category */
  luck: StarLuck
}

export interface ZiweiPalace {
  /** 命宫、兄弟 … */
  name: string
  stem: string
  branch: string
  isSoul: boolean
  isBody: boolean
  major: ZiweiStar[]
  minor: ZiweiStar[]
  adjective: ZiweiStar[]
  /** 长生十二神 */
  changsheng: string
  /** 大限 age range */
  decadal: [number, number]
}

export interface ZiweiChart {
  gender: '男' | '女'
  solarText: string
  trueSolar?: { text: string; offsetMinutes: number }
  lunarText: string
  /** 四柱, e.g. 庚午 辛巳 庚辰 辛巳 */
  chineseDate: string
  /** 时辰, e.g. 巳时 */
  time: string
  timeRange: string
  zodiac: string
  sign: string
  /** 五行局 */
  fiveElementsClass: string
  /** 命主 / 身主 */
  soul: string
  body: string
  /** All twelve palaces, keyed by 地支 */
  palaces: Record<string, ZiweiPalace>
  /** 大限 in age order */
  decades: ZiweiDecade[]
  /** Lunar year of birth: 虚岁 1 */
  birthYear: number
}

export interface ZiweiDecade {
  /** The palace the 大限 runs through */
  branch: string
  stem: string
  palace: string
  range: [number, number]
  /** Lunar years covered, one per 虚岁 */
  years: number[]
}

export type LayerKind = 'decadal' | 'yearly' | 'monthly'

/** One 运限 layer (大限, 流年 or 流月) laid over the natal board. */
export interface ZiweiLayer {
  kind: LayerKind
  stem: string
  branch: string
  /** 地支 → this layer's palace name (命宫, 兄弟 …) */
  palaceNames: Record<string, string>
  /** Star name → this layer's 四化 (禄 权 科 忌) */
  mutagens: Record<string, string>
  /** 地支 → 流耀 (运禄, 流羊, 月马 …) */
  stars: Record<string, ZiweiStar[]>
}

/** Clock hour → iztro 时辰 index: 0 早子 (00–01), 1 丑 … 11 亥, 12 晚子 (23–24). */
export const timeIndex = (hour: number) => (hour === 23 ? 12 : Math.floor((hour + 1) / 2))

const pad = (n: number) => String(n).padStart(2, '0')

/**
 * Cast the iztro astrolabe. iztro keeps its config globally, so anything that
 * reads the astrolabe later (运限) casts again rather than reuse an old one.
 */
function cast(input: BaziInput, schools: ZiweiSchoolSettings) {
  const { corrected, time } = effectiveTime(input)
  const dateStr = `${time.year}-${pad(time.month)}-${pad(time.day)}`
  const timeIdx = timeIndex(time.hour)
  const chart = astro.withOptions({
    type: 'solar',
    dateStr,
    timeIndex: timeIdx,
    gender: input.gender === 1 ? '男' : '女',
    language: 'zh-CN',
    config: {
      algorithm: schools.algorithm,
      yearDivide: schools.yearDivide,
      horoscopeDivide: schools.horoscopeDivide,
      ageDivide: schools.ageDivide,
      dayDivide: schools.dayDivide,
      // iztro types the keys/values as its own name unions; zh-CN names are accepted
      mutagens: mutagenTable(schools) as never,
    },
  })
  return { chart, corrected, dateStr, timeIdx }
}

const star = (s: { name: string; type: string; brightness?: string; mutagen?: string }): ZiweiStar => ({
  name: s.name,
  brightness: s.brightness || undefined,
  mutagen: s.mutagen || undefined,
  element: STAR_ELEMENT[s.name],
  luck: starLuck(s.type),
})

export function buildZiwei(input: BaziInput, schools: ZiweiSchoolSettings): ZiweiChart {
  const { chart, corrected, dateStr, timeIdx } = cast(input, schools)

  const palaces: Record<string, ZiweiPalace> = {}
  for (const p of chart.palaces) {
    palaces[p.earthlyBranch] = {
      name: p.name,
      stem: p.heavenlyStem,
      branch: p.earthlyBranch,
      isSoul: p.name === '命宫',
      isBody: p.isBodyPalace,
      major: p.majorStars.map(star),
      minor: p.minorStars.map(star),
      adjective: p.adjectiveStars.map(star),
      changsheng: p.changsheng12,
      decadal: p.decadal.range,
    }
  }

  if (schools.tianma === 'month') {
    // 月马: same table as 年马, keyed by the lunar month's branch. iztro's own
    // month index (寅 = 0) keeps 闰月 handling in line with its other 月系 stars.
    const month = BRANCH_ORDER[(2 + util.fixLunarMonthIndex(dateStr, timeIdx, true)) % 12]
    moveStar(palaces, '天马', MA[month])
  }

  const birthYear = chart.rawDates.lunarDate.lunarYear
  const decades = Object.values(palaces)
    .map((p) => ({
      branch: p.branch,
      stem: p.stem,
      palace: p.name,
      range: p.decadal,
      years: Array.from({ length: p.decadal[1] - p.decadal[0] + 1 }, (_, i) => birthYear + p.decadal[0] - 1 + i),
    }))
    .sort((a, b) => a.range[0] - b.range[0])

  return {
    gender: input.gender === 1 ? '男' : '女',
    solarText: formatTime(input),
    trueSolar: corrected && { text: formatTime(corrected.time), offsetMinutes: corrected.offsetMinutes },
    lunarText: chart.lunarDate,
    chineseDate: chart.chineseDate,
    time: chart.time,
    timeRange: chart.timeRange,
    zodiac: chart.zodiac,
    sign: chart.sign,
    fiveElementsClass: chart.fiveElementsClass,
    soul: chart.soul,
    body: chart.body,
    palaces,
    decades,
    birthYear,
  }
}

const MUTAGENS = ['禄', '权', '科', '忌']

/**
 * 大限, 流年 and 流月 for a lunar year (and month, 1–12). iztro works from a
 * solar date, so we ask about a day safely inside that year or month.
 */
export function buildHoroscope(
  input: BaziInput,
  schools: ZiweiSchoolSettings,
  year: number,
  month: number,
): Record<LayerKind, ZiweiLayer> {
  const { chart } = cast(input, schools)
  const solar = LunarDay.fromYmd(year, month, 15).getSolarDay()
  const h = chart.horoscope(`${solar.getYear()}-${pad(solar.getMonth())}-${pad(solar.getDay())}`, 6)
  const branches = chart.palaces.map((p) => p.earthlyBranch)
  const layer = (kind: LayerKind, item: (typeof h)['decadal']): ZiweiLayer => ({
    kind,
    stem: item.heavenlyStem,
    branch: item.earthlyBranch,
    palaceNames: Object.fromEntries(branches.map((b, i) => [b, item.palaceNames[i]])),
    mutagens: Object.fromEntries(item.mutagen.map((name, i) => [name, MUTAGENS[i]])),
    stars: Object.fromEntries(branches.map((b, i) => [b, (item.stars?.[i] ?? []).map(star)])),
  })
  return { decadal: layer('decadal', h.decadal), yearly: layer('yearly', h.yearly), monthly: layer('monthly', h.monthly) }
}

/** Today's lunar year and month (a 闰月 counts as its month number). */
export function lunarToday(): { year: number; month: number } {
  const now = new Date()
  const m = SolarDay.fromYmd(now.getFullYear(), now.getMonth() + 1, now.getDate()).getLunarDay().getLunarMonth()
  return { year: m.getLunarYear().getYear(), month: m.getMonth() }
}

/** 干支 of a lunar year, e.g. 丙午 */
export const yearGanzhi = (year: number) => LunarYear.fromYear(year).getSixtyCycle().getName()

/** Name and 干支 of a lunar month, e.g. 正月 庚寅 */
export function monthInfo(year: number, month: number) {
  const m = LunarMonth.fromYm(year, month)
  return { name: m.getName(), ganzhi: m.getSixtyCycle().getName() }
}

/**
 * Board positions: 地支 → [row, column] on the traditional 4×4 square, with
 * 巳 at the top-left and 寅 at the bottom-left; the middle 2×2 is the centre.
 */
export const BOARD: Record<string, [number, number]> = {
  巳: [1, 1], 午: [1, 2], 未: [1, 3], 申: [1, 4],
  辰: [2, 1], 酉: [2, 4],
  卯: [3, 1], 戌: [3, 4],
  寅: [4, 1], 丑: [4, 2], 子: [4, 3], 亥: [4, 4],
}

const BRANCH_ORDER = '子丑寅卯辰巳午未申酉戌亥'

/** 驿马: 寅午戌马在申，申子辰马在寅，巳酉丑马在亥，亥卯未马在巳 */
const MA: Record<string, string> = Object.fromEntries(
  ['寅午戌申', '申子辰寅', '巳酉丑亥', '亥卯未巳'].flatMap((g) => [...g.slice(0, 3)].map((b) => [b, g[3]])),
)

/** Move a 辅星 to the palace on another branch. */
function moveStar(palaces: Record<string, ZiweiPalace>, name: string, to: string) {
  for (const p of Object.values(palaces)) {
    const i = p.minor.findIndex((s) => s.name === name)
    if (i < 0) continue
    if (p.branch === to) return
    palaces[to].minor.push(...p.minor.splice(i, 1))
    return
  }
}

/** 三方四正 of a palace: its 对宫 (six palaces on) and the two 三合 palaces (four on, either way). */
export function sanFangSiZheng(branch: string): { opposite: string; trines: [string, string] } {
  const i = BRANCH_ORDER.indexOf(branch)
  const at = (n: number) => BRANCH_ORDER[(i + n) % 12]
  return { opposite: at(6), trines: [at(4), at(8)] }
}
