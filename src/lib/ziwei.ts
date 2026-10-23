// 紫微斗数命盘, built on iztro (https://github.com/SylarLong/iztro, MIT).
// iztro is only imported here, and this module is only loaded by the 紫微
// tab, so the calendar and bazi pages don't pay for it.
import { astro } from 'iztro'
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
}

/** Clock hour → iztro 时辰 index: 0 早子 (00–01), 1 丑 … 11 亥, 12 晚子 (23–24). */
export const timeIndex = (hour: number) => (hour === 23 ? 12 : Math.floor((hour + 1) / 2))

const pad = (n: number) => String(n).padStart(2, '0')

export function buildZiwei(input: BaziInput, schools: ZiweiSchoolSettings): ZiweiChart {
  const { corrected, time } = effectiveTime(input)
  const chart = astro.withOptions({
    type: 'solar',
    dateStr: `${time.year}-${pad(time.month)}-${pad(time.day)}`,
    timeIndex: timeIndex(time.hour),
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

  const star = (s: { name: string; type: string; brightness?: string; mutagen?: string }): ZiweiStar => ({
    name: s.name,
    brightness: s.brightness || undefined,
    mutagen: s.mutagen || undefined,
    element: STAR_ELEMENT[s.name],
    luck: starLuck(s.type),
  })

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
  }
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

/** 三方四正 of a palace: its 对宫 (six palaces on) and the two 三合 palaces (four on, either way). */
export function sanFangSiZheng(branch: string): { opposite: string; trines: [string, string] } {
  const i = BRANCH_ORDER.indexOf(branch)
  const at = (n: number) => BRANCH_ORDER[(i + n) % 12]
  return { opposite: at(6), trines: [at(4), at(8)] }
}
