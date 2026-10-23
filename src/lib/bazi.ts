// Bazi (四柱八字) chart built on tyme4ts. Field layout follows the common
// 排盘 convention (主星 / 天干 / 地支 / 藏干 / 纳音 / 星运 / 自坐 / 空亡),
// similar to cantian-ai/bazi-mcp, but uses tyme4ts only.
import {
  ChildLimit,
  China95ChildLimitProvider,
  DefaultChildLimitProvider,
  DefaultEightCharProvider,
  LunarSect1ChildLimitProvider,
  LunarSect2ChildLimitProvider,
  Gender,
  HeavenStem,
  LunarHour,
  LunarSect2EightCharProvider,
  SixtyCycle,
  SolarTime,
  type DecadeFortune,
} from 'tyme4ts'
import { computeRelations, type Relation, type RelationMember } from './relations'
import { DEFAULT_SCHOOLS, type SchoolSettings } from './schools'
import { computeShenSha, type ShenSha } from './shensha'
import { toTrueSolarTime } from './solarTime'

export type ElementName = '木' | '火' | '土' | '金' | '水'
export const ELEMENTS: ElementName[] = ['木', '火', '土', '金', '水']

export interface Glyph {
  char: string
  element: ElementName
  tenStar?: string
}

export interface Pillar {
  label: string
  stem: Glyph
  branch: Glyph
  hidden: Glyph[]
  sound: string
  terrain: string
  selfTerrain: string
  empty: string
  shenSha: ShenSha[]
}

export interface FortuneYear {
  year: number
  age: number
  ganzhi: string
  /** 小运 */
  smallFortune: string
  stem: Glyph
  branch: Glyph
}

export interface DecadeInfo {
  ganzhi: string
  startAge: number
  endAge: number
  startYear: number
  endYear: number
  stem: Glyph
  branch: Glyph
  years: FortuneYear[]
}

export interface BaziChart {
  gender: '男' | '女'
  solarText: string
  lunarText: string
  zodiac: string
  dayMaster: Glyph
  pillars: Pillar[]
  fetalOrigin: string
  fetalBreath: string
  ownSign: string
  bodySign: string
  startText: string
  decades: DecadeInfo[]
  elementCount: Record<ElementName, number>
  relations: Relation[]
  /** Born 23:00–24:00 (after 真太阳时), where the 晚子时 setting matters */
  lateZiHour: boolean
  /** Set when 真太阳时 is applied */
  trueSolar?: { text: string; offsetMinutes: number }
}

export interface BaziInput {
  year: number
  month: number
  day: number
  hour: number
  minute: number
  gender: 0 | 1
  /** Birthplace longitude; when set, the chart uses 真太阳时 */
  longitude?: number
}

const eightCharProviders = { nextDay: new DefaultEightCharProvider(), sameDay: new LunarSect2EightCharProvider() }
const childLimitProviders = {
  default: new DefaultChildLimitProvider(),
  sect1: new LunarSect1ChildLimitProvider(),
  sect2: new LunarSect2ChildLimitProvider(),
  china95: new China95ChildLimitProvider(),
}

export function glyph(x: { getName(): string; getElement(): { getName(): string } }, tenStar?: string): Glyph {
  return { char: x.getName(), element: x.getElement().getName() as ElementName, tenStar }
}

function stemGlyph(stem: HeavenStem, me: HeavenStem): Glyph {
  return glyph(stem, me.getTenStar(stem).getName())
}

function pillar(label: string, sc: SixtyCycle, me: HeavenStem, isDay: boolean): Pillar {
  const stem = sc.getHeavenStem()
  const branch = sc.getEarthBranch()
  return {
    label,
    stem: isDay ? glyph(stem, '日主') : stemGlyph(stem, me),
    branch: glyph(branch),
    hidden: [branch.getHideHeavenStemMain(), branch.getHideHeavenStemMiddle(), branch.getHideHeavenStemResidual()]
      .filter((h): h is HeavenStem => h != null)
      .map((h) => stemGlyph(h, me)),
    sound: sc.getSound().getName(),
    terrain: me.getTerrain(branch).getName(),
    selfTerrain: stem.getTerrain(branch).getName(),
    empty: sc.getExtraEarthBranches().map((b) => b.getName()).join(''),
    shenSha: [],
  }
}

function decadeInfo(df: DecadeFortune, me: HeavenStem): DecadeInfo {
  const sc = df.getSixtyCycle()
  const years: FortuneYear[] = []
  let f = df.getStartFortune()
  for (let i = 0; i < 10; i++) {
    // Fortune.getSixtyCycle() is the 小运; the 流年 is the year's own ganzhi.
    const sixtyCycleYear = f.getSixtyCycleYear()
    const ysc = sixtyCycleYear.getSixtyCycle()
    years.push({
      year: sixtyCycleYear.getYear(),
      age: f.getAge(),
      ganzhi: ysc.getName(),
      smallFortune: f.getSixtyCycle().getName(),
      stem: stemGlyph(ysc.getHeavenStem(), me),
      branch: glyph(ysc.getEarthBranch()),
    })
    f = f.next(1)
  }
  return {
    ganzhi: sc.getName(),
    startAge: df.getStartAge(),
    endAge: df.getEndAge(),
    startYear: df.getStartSixtyCycleYear().getYear(),
    endYear: df.getEndSixtyCycleYear().getYear(),
    stem: stemGlyph(sc.getHeavenStem(), me),
    branch: glyph(sc.getEarthBranch()),
    years,
  }
}

export function buildBazi(input: BaziInput, schools: SchoolSettings = DEFAULT_SCHOOLS): BaziChart {
  // tyme4ts selects these algorithms through static providers.
  LunarHour.provider = eightCharProviders[schools.ziHour]
  ChildLimit.provider = childLimitProviders[schools.childLimit]
  const corrected = input.longitude == null ? undefined : toTrueSolarTime(input, input.longitude)
  const t = corrected?.time ?? input
  const time = SolarTime.fromYmdHms(t.year, t.month, t.day, t.hour, t.minute, 0)
  const lunarHour = time.getLunarHour()
  const ec = lunarHour.getEightChar()
  const me = ec.getDay().getHeavenStem()
  const pillars = [
    pillar('年柱', ec.getYear(), me, false),
    pillar('月柱', ec.getMonth(), me, false),
    pillar('日柱', ec.getDay(), me, true),
    pillar('时柱', ec.getHour(), me, false),
  ]

  const shenSha = computeShenSha(
    pillars.map((p) => ({ stem: p.stem.char, branch: p.branch.char })),
    schools,
  )
  pillars.forEach((p, i) => (p.shenSha = shenSha[i]))

  const elementCount = Object.fromEntries(ELEMENTS.map((e) => [e, 0])) as Record<ElementName, number>
  for (const p of pillars) {
    elementCount[p.stem.element]++
    elementCount[p.branch.element]++
  }

  const childLimit = ChildLimit.fromSolarTime(time, input.gender === 1 ? Gender.MAN : Gender.WOMAN)
  const end = childLimit.getEndTime()
  const decades: DecadeInfo[] = []
  let df = childLimit.getStartDecadeFortune()
  for (let i = 0; i < 10; i++) {
    decades.push(decadeInfo(df, me))
    df = df.next(1)
  }

  const lunarDay = lunarHour.getLunarDay()
  return {
    gender: input.gender === 1 ? '男' : '女',
    solarText: formatTime(input),
    lunarText: `${lunarDay.getLunarMonth().getLunarYear().getSixtyCycle().getName()}年${lunarDay.getLunarMonth().getName()}${lunarDay.getName()} ${lunarHour.getName()}`,
    zodiac: ec.getYear().getEarthBranch().getZodiac().getName(),
    dayMaster: glyph(me),
    pillars,
    fetalOrigin: ec.getFetalOrigin().getName(),
    fetalBreath: ec.getFetalBreath().getName(),
    ownSign: ec.getOwnSign().getName(),
    bodySign: ec.getBodySign().getName(),
    startText: `出生后${childLimit.getYearCount()}年${childLimit.getMonthCount()}个月${childLimit.getDayCount()}天起运（${end.getYear()}年${end.getMonth()}月${end.getDay()}日交运），${childLimit.isForward() ? '顺' : '逆'}排`,
    decades,
    elementCount,
    relations: computeRelations(relationMembers(pillars), undefined, schools),
    lateZiHour: t.hour === 23,
    trueSolar: corrected && { text: formatTime(corrected.time), offsetMinutes: corrected.offsetMinutes },
  }
}

const pad = (n: number) => String(n).padStart(2, '0')
const formatTime = (t: { year: number; month: number; day: number; hour: number; minute: number }) =>
  `${t.year}年${t.month}月${t.day}日 ${pad(t.hour)}:${pad(t.minute)}`

function relationMembers(pillars: Pillar[]): RelationMember[] {
  return pillars.map((p) => ({ label: p.label[0], stem: p.stem.char, branch: p.branch.char }))
}

/** 岁运与原局的刑冲合会: only relations involving the given 大运 / 流年. */
export function fortuneRelations(
  chart: BaziChart,
  decade?: DecadeInfo,
  year?: FortuneYear,
  schools: SchoolSettings = DEFAULT_SCHOOLS,
): Relation[] {
  const members = relationMembers(chart.pillars)
  const focus: string[] = []
  if (decade) {
    members.push({ label: '运', stem: decade.stem.char, branch: decade.branch.char })
    focus.push('运')
  }
  if (year) {
    members.push({ label: '岁', stem: year.stem.char, branch: year.branch.char })
    focus.push('岁')
  }
  return focus.length ? computeRelations(members, focus, schools) : []
}
