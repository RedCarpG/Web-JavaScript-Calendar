import { describe, expect, it } from 'vitest'
import { buildBazi, flowDays, flowMonths, fortunePillars, fortuneRelations } from '../bazi'
import { computeRelations } from '../relations'
import { DEFAULT_SCHOOLS } from '../schools'
import { computeShenSha } from '../shensha'
import { equationOfTime, toTrueSolarTime } from '../solarTime'

const base = { year: 1990, month: 5, day: 15, hour: 10, minute: 30, gender: 1 } as const
const names = (xs: { name: string }[]) => xs.map((x) => x.name).sort()

describe('buildBazi', () => {
  it('builds the four pillars', () => {
    const chart = buildBazi(base)
    expect(chart.pillars.map((p) => p.stem.char + p.branch.char)).toEqual(['庚午', '辛巳', '庚辰', '辛巳'])
  })

  it('uses the year ganzhi (not 小运) for 流年', () => {
    const years = buildBazi(base).decades.flatMap((d) => d.years)
    expect(years.find((y) => y.year === 2026)?.ganzhi).toBe('丙午')
    expect(years.find((y) => y.year === 1997)?.ganzhi).toBe('丁丑')
  })

  it('applies true solar time', () => {
    // 乌鲁木齐 10:30 北京时间 ≈ 08:24 真太阳时 → 辰时 (庚辰)
    const chart = buildBazi({ ...base, longitude: 87.62 })
    expect(chart.trueSolar?.text).toMatch(/1990年5月15日 08:2\d/)
    expect(chart.pillars[3].stem.char + chart.pillars[3].branch.char).toBe('庚辰')
  })

  it('lists 岁运 relations only when they involve a fortune column', () => {
    const chart = buildBazi(base)
    // 壬午运: 午 meets 年支午 → 自刑; every relation must involve 大运
    const rels = fortuneRelations(chart, [{ label: '大运', ganzhi: '壬午' }])
    expect(rels.map((r) => r.text)).toContain('午午自刑')
    expect(rels.every((r) => r.members.includes('大运'))).toBe(true)
    expect(fortuneRelations(chart, []).length).toBe(0)
  })

  it('builds 流月 by 节令 and 流日 within them', () => {
    const months = flowMonths(2026, '庚')
    expect(months.map((m) => m.ganzhi)).toEqual(['庚寅', '辛卯', '壬辰', '癸巳', '甲午', '乙未', '丙申', '丁酉', '戊戌', '己亥', '庚子', '辛丑'])
    expect(months[0].start).toBe('2/4') // 立春
    expect(months[8].stem.tenStar).toBe('偏印') // 庚 → 戊
    const days = flowDays(2026, 8, '庚') // 戊戌月: 寒露 10/8 – 11/6
    expect([days[0].month, days[0].day, days.at(-1)!.month, days.at(-1)!.day]).toEqual([10, 8, 11, 6])
    expect(days.find((d) => d.month === 10 && d.day === 23)?.ganzhi).toBe('庚午')
  })

  it('gives 岁运 columns full pillar data with natal-based 神煞', () => {
    const chart = buildBazi(base) // 庚午 辛巳 庚辰 辛巳
    const [decade] = fortunePillars(chart, [{ label: '大运', ganzhi: '丁丑' }])
    expect(decade.stem.tenStar).toBe('正官')
    expect(decade.hidden.map((h) => h.char)).toEqual(['己', '癸', '辛'])
    // 庚日 天乙 in 丑未 → 丑 qualifies; 年支午 → 华盖戌 does not
    expect(decade.shenSha.map((x) => x.name)).toContain('天乙贵人')
  })
})

describe('computeShenSha', () => {
  // 庚午 辛巳 庚辰 辛巳, hand-checked against the rule tables
  const stars = computeShenSha([
    { stem: '庚', branch: '午' },
    { stem: '辛', branch: '巳' },
    { stem: '庚', branch: '辰' },
    { stem: '辛', branch: '巳' },
  ])

  it('year pillar', () => expect(names(stars[0])).toEqual(['月德贵人', '灾煞'].sort()))
  it('month pillar', () => expect(names(stars[1])).toEqual(['亡神', '劫煞', '天德贵人'].sort()))
  it('day pillar', () =>
    expect(names(stars[2])).toEqual(['十恶大败', '吊客', '国印贵人', '天医', '寡宿', '月德贵人', '魁罡'].sort()))
  it('hour pillar', () => expect(names(stars[3])).toEqual(['亡神', '劫煞', '天德贵人'].sort()))

  it('finds 天乙贵人 and 驿马', () => {
    const s = computeShenSha([
      { stem: '甲', branch: '子' },
      { stem: '丙', branch: '寅' },
      { stem: '甲', branch: '申' },
      { stem: '乙', branch: '丑' },
    ])
    expect(names(s[3])).toContain('天乙贵人') // 甲 → 丑未
    expect(names(s[1])).toContain('驿马') // 子年 / 申日 → 寅
    expect(names(s[0])).toContain('将星') // 申日 → 子
  })
})

describe('computeRelations', () => {
  const rels = computeRelations([
    { label: '年', stem: '甲', branch: '寅' },
    { label: '月', stem: '己', branch: '午' },
    { label: '日', stem: '庚', branch: '戌' },
    { label: '时', stem: '丙', branch: '申' },
  ]).map((r) => r.text)

  it('stem combine and clash', () => {
    expect(rels).toContain('甲己合土')
    expect(rels).toContain('甲庚相冲')
  })
  it('branch three-combine, half-combine, clash', () => {
    expect(rels).toContain('寅午戌三合火局')
    expect(rels).toContain('寅午半合火局')
    expect(rels).toContain('寅申相冲')
  })
  it('punishments', () => {
    expect(computeRelations([
      { label: '年', stem: '甲', branch: '子' },
      { label: '日', stem: '乙', branch: '卯' },
      { label: '时', stem: '丙', branch: '午' },
      { label: '月', stem: '丁', branch: '午' },
    ]).map((r) => r.text)).toEqual(expect.arrayContaining(['子卯无礼之刑', '午午自刑', '子午相冲', '卯午相破']))
  })
})

describe('solarTime', () => {
  it('equation of time peaks near +16 min in early November', () => {
    expect(equationOfTime(2000, 11, 3)).toBeCloseTo(16.4, 0)
  })
  it('crosses midnight correctly', () => {
    const { time } = toTrueSolarTime({ year: 2000, month: 1, day: 1, hour: 0, minute: 10 }, 87.62)
    expect(time).toMatchObject({ year: 1999, month: 12, day: 31, hour: 21 })
  })
})

describe('流派 settings', () => {
  const p = (gz: string) => ({ stem: gz[0], branch: gz[1] })

  it('天乙贵人: 庚日 丑未 vs 寅午, flagged', () => {
    const chart = [p('甲子'), p('丙寅'), p('庚子'), p('乙丑')]
    const a = computeShenSha(chart, DEFAULT_SCHOOLS)
    expect(a[3].find((x) => x.name === '天乙贵人')?.school).toBe('tianYi')
    const b = computeShenSha(chart, { ...DEFAULT_SCHOOLS, tianYi: 'gengTigerHorse', stemRef: 'dayOnly' })
    expect(names(b[3])).not.toContain('天乙贵人')
    expect(names(b[1])).toContain('天乙贵人') // 寅
  })

  it('阴干羊刃 three variants', () => {
    const chart = [p('甲寅'), p('丙辰'), p('乙卯'), p('戊寅')]
    expect(names(computeShenSha(chart, { ...DEFAULT_SCHOOLS, yangRen: 'forward' })[1])).toContain('羊刃')
    const backward = computeShenSha(chart, { ...DEFAULT_SCHOOLS, yangRen: 'backward' })
    expect(backward[3].find((x) => x.name === '羊刃')?.school).toBe('yangRen')
    const none = computeShenSha(chart, { ...DEFAULT_SCHOOLS, yangRen: 'yangOnly' })
    expect(none.flat().some((x) => x.name === '羊刃')).toBe(false)
  })

  it('三合类神煞 reference pillar', () => {
    // 子年 → 驿马寅; 午日 → 驿马申
    const chart = [p('甲子'), p('丙寅'), p('庚午'), p('甲申')]
    const yearOnly = computeShenSha(chart, { ...DEFAULT_SCHOOLS, branchRef: 'yearOnly' })
    expect(names(yearOnly[1])).toContain('驿马')
    expect(names(yearOnly[3])).not.toContain('驿马')
    const dayOnly = computeShenSha(chart, { ...DEFAULT_SCHOOLS, branchRef: 'dayOnly' })
    expect(names(dayOnly[3])).toContain('驿马')
    expect(dayOnly[3].find((x) => x.name === '驿马')?.school).toBe('branchRef')
  })

  it('午未合 化土 / 化火', () => {
    const m = [
      { label: '年', stem: '甲', branch: '午' },
      { label: '日', stem: '乙', branch: '未' },
    ]
    expect(computeRelations(m)[0]).toMatchObject({ text: '午未六合土', school: 'wuWei' })
    expect(computeRelations(m, undefined, { ...DEFAULT_SCHOOLS, wuWei: '火' })[0].text).toBe('午未六合火')
  })

  it('晚子时 changes the day pillar', () => {
    const late = { ...base, hour: 23, minute: 30 }
    const same = buildBazi(late, { ...DEFAULT_SCHOOLS, ziHour: 'sameDay' })
    const next = buildBazi(late, { ...DEFAULT_SCHOOLS, ziHour: 'nextDay' })
    expect(same.lateZiHour).toBe(true)
    expect(same.pillars[2].stem.char + same.pillars[2].branch.char).toBe('庚辰')
    expect(next.pillars[2].stem.char + next.pillars[2].branch.char).toBe('辛巳')
  })

  it('起运算法 changes the start text', () => {
    const texts = (['default', 'sect1', 'sect2', 'china95'] as const).map(
      (childLimit) => buildBazi(base, { ...DEFAULT_SCHOOLS, childLimit }).startText,
    )
    expect(new Set(texts).size).toBeGreaterThan(1)
  })
})

describe('神煞说明', () => {
  it('has an explanation for every star computeShenSha can return', async () => {
    const { SHENSHA_INFO } = await import('../shenshaInfo')
    const { SCHOOLS } = await import('../schools')
    const STEMS = '甲乙丙丁戊己庚辛壬癸'
    const BRANCHES = '子丑寅卯辰巳午未申酉戌亥'
    const sixty = Array.from({ length: 60 }, (_, i) => ({ stem: STEMS[i % 10], branch: BRANCHES[i % 12] }))
    const seen = new Set<string>()
    const variants = [DEFAULT_SCHOOLS, ...Object.entries(SCHOOLS).flatMap(([k, info]) =>
      info.options.map((o) => ({ ...DEFAULT_SCHOOLS, [k]: o.value })))]
    for (const schools of variants)
      for (const year of sixty.filter((_, i) => i % 7 === 0))
        for (const month of sixty.filter((_, i) => i < 12))
          for (const day of sixty)
            for (const s of computeShenSha([year, month, day, sixty[(sixty.indexOf(day) + 5) % 60]], schools).flat())
              seen.add(s.name)
    const missing = [...seen].filter((n) => !SHENSHA_INFO[n])
    expect(missing).toEqual([])
    expect(seen.size).toBe(Object.keys(SHENSHA_INFO).length)
  })
})

describe('saved charts', () => {
  it('validates stored input and upserts by name', async () => {
    const { toBaziInput, upsertChart } = await import('../savedCharts')
    expect(toBaziInput({ ...base, longitude: 87.62 })).toEqual({ ...base, longitude: 87.62 })
    expect(toBaziInput({ ...base, month: 13 })).toBeNull()
    expect(toBaziInput({ ...base, gender: 2 })).toBeNull()
    expect(toBaziInput('junk')).toBeNull()
    let charts = upsertChart([], '张三', base)
    charts = upsertChart(charts, '李四', { ...base, gender: 0 })
    charts = upsertChart(charts, '张三', { ...base, hour: 8 })
    expect(charts.map((c) => [c.name, c.input.hour, c.input.gender])).toEqual([['张三', 8, 1], ['李四', 10, 0]])
  })
})

describe('术语说明', () => {
  it('covers every 纳音, 十二长生 and table concept', async () => {
    const { Sound, Terrain } = await import('tyme4ts')
    const { CONCEPTS, SOUND_INFO, TERRAIN_INFO } = await import('../glossary')
    const sounds = Array.from({ length: 30 }, (_, i) => Sound.fromIndex(i).getName())
    const terrains = Array.from({ length: 12 }, (_, i) => Terrain.fromIndex(i).getName())
    expect(sounds.filter((n) => !SOUND_INFO[n])).toEqual([])
    expect(terrains.filter((n) => !TERRAIN_INFO[n])).toEqual([])
    const shown = ['主星', '天干', '地支', '藏干', '纳音', '星运', '自坐', '空亡', '神煞', '大运', '流年', '流月', '流日', '胎元', '胎息', '命宫', '身宫']
    expect(shown.filter((n) => !CONCEPTS[n])).toEqual([])
  })

  it('records the 旬 behind each pillar\'s 空亡', () => {
    const [year] = buildBazi(base).pillars // 庚午: 甲子旬, 空亡 戌亥
    expect([year.xun, year.empty]).toEqual(['甲子', '戌亥'])
  })
})

describe('紫微斗数', () => {
  it('maps clock hours to 时辰 indexes', async () => {
    const { timeIndex } = await import('../ziwei')
    expect([0, 1, 2, 10, 11, 22, 23].map(timeIndex)).toEqual([0, 1, 1, 5, 6, 11, 12])
  })

  it('casts the chart (checked by hand: 命宫子, 身宫戌, 火六局)', async () => {
    const { buildZiwei } = await import('../ziwei')
    const z = buildZiwei(base, DEFAULT_SCHOOLS) // 1990-05-15 10:30 巳时 男
    expect(z.chineseDate).toBe('庚午 辛巳 庚辰 辛巳') // same 四柱 as the bazi chart
    expect(z.palaces['子'].isSoul).toBe(true)
    expect(z.palaces['戌'].isBody).toBe(true)
    expect(z.fiveElementsClass).toBe('火六局')
    // 庚年四化: 太阳禄 武曲权 太阴科 天同忌
    const mutagens = Object.values(z.palaces).flatMap((p) => p.major.filter((s) => s.mutagen).map((s) => s.name + s.mutagen))
    expect(mutagens.sort()).toEqual(['天同忌', '太阳禄', '太阴科', '武曲权'].sort())
  })

  it('places every palace on the board once', async () => {
    const { BOARD, buildZiwei } = await import('../ziwei')
    const z = buildZiwei(base, DEFAULT_SCHOOLS)
    expect(Object.keys(z.palaces).sort()).toEqual(Object.keys(BOARD).sort())
    expect(new Set(Object.values(BOARD).map(String)).size).toBe(12)
  })
})
