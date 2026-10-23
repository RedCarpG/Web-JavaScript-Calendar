// Bazi (四柱八字) chart built on tyme4ts. Field layout follows the common
// 排盘 convention (主星 / 天干 / 地支 / 藏干 / 纳音 / 星运 / 自坐 / 空亡),
// similar to cantian-ai/bazi-mcp, but uses tyme4ts only.
import {
  ChildLimit,
  DefaultEightCharProvider,
  Gender,
  HeavenStem,
  LunarHour,
  LunarSect2EightCharProvider,
  SixtyCycle,
  SolarTime,
  type DecadeFortune,
} from 'tyme4ts'

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
}

export interface BaziInput {
  year: number
  month: number
  day: number
  hour: number
  minute: number
  gender: 0 | 1
  /** 1: 晚子时日柱算明天; 2: 晚子时日柱算当天 */
  sect: 1 | 2
}

const providers = { 1: new DefaultEightCharProvider(), 2: new LunarSect2EightCharProvider() }

function glyph(x: { getName(): string; getElement(): { getName(): string } }, tenStar?: string): Glyph {
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

export function buildBazi(input: BaziInput): BaziChart {
  LunarHour.provider = providers[input.sect]
  const time = SolarTime.fromYmdHms(input.year, input.month, input.day, input.hour, input.minute, 0)
  const lunarHour = time.getLunarHour()
  const ec = lunarHour.getEightChar()
  const me = ec.getDay().getHeavenStem()
  const pillars = [
    pillar('年柱', ec.getYear(), me, false),
    pillar('月柱', ec.getMonth(), me, false),
    pillar('日柱', ec.getDay(), me, true),
    pillar('时柱', ec.getHour(), me, false),
  ]

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
    solarText: `${input.year}年${input.month}月${input.day}日 ${String(input.hour).padStart(2, '0')}:${String(input.minute).padStart(2, '0')}`,
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
  }
}
