import { describe, expect, it } from 'vitest'
import { buildBazi, fortuneRelations } from '../bazi'
import { computeRelations } from '../relations'
import { computeShenSha } from '../shensha'
import { equationOfTime, toTrueSolarTime } from '../solarTime'

const base = { year: 1990, month: 5, day: 15, hour: 10, minute: 30, gender: 1, sect: 2 } as const

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

  it('lists 岁运 relations only when they involve the fortune', () => {
    const chart = buildBazi(base)
    const decade = chart.decades.find((d) => d.ganzhi === '壬午')!
    const rels = fortuneRelations(chart, decade)
    // 壬午运: 午 meets 年支午 → 自刑; every relation must involve 运
    expect(rels.map((r) => r.text)).toContain('午午自刑')
    expect(rels.every((r) => r.members.includes('运'))).toBe(true)
    expect(fortuneRelations(chart).length).toBe(0)
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

  it('year pillar', () => expect(stars[0].sort()).toEqual(['月德贵人', '灾煞'].sort()))
  it('month pillar', () => expect(stars[1].sort()).toEqual(['亡神', '劫煞', '天德贵人'].sort()))
  it('day pillar', () =>
    expect(stars[2].sort()).toEqual(['十恶大败', '吊客', '国印贵人', '天医', '寡宿', '月德贵人', '魁罡'].sort()))
  it('hour pillar', () => expect(stars[3].sort()).toEqual(['亡神', '劫煞', '天德贵人'].sort()))

  it('finds 天乙贵人 and 驿马', () => {
    const s = computeShenSha([
      { stem: '甲', branch: '子' },
      { stem: '丙', branch: '寅' },
      { stem: '甲', branch: '申' },
      { stem: '乙', branch: '丑' },
    ])
    expect(s[3]).toContain('天乙贵人') // 甲 → 丑未
    expect(s[1]).toContain('驿马') // 子年 / 申日 → 寅
    expect(s[0]).toContain('将星') // 申日 → 子
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
