import { describe, expect, it } from 'vitest'
import { buildStarChart, computeChart, formatLon, houseOf, toUtc } from '../astrology'
import { DEFAULT_STAR_SETTINGS } from '../starPrefs'

// Einstein, 1879-03-14 11:30 LMT Ulm (48°24′N, 10°E) = 10:50 UT.
// Published positions (Astrodatabank, Rodden rating AA), Placidus.
const einstein = computeChart(new Date(Date.UTC(1879, 2, 14, 10, 50)), 48.4, 10, DEFAULT_STAR_SETTINGS)
const at = (key: string) => einstein.points.find((p) => p.key === key)!

describe('星盘 positions', () => {
  it('matches a well-documented chart to within about 1′', () => {
    const expected: [string, string][] = [
      ['sun', '双鱼 23°30′'],
      ['moon', '射手 14°32′'],
      ['mercury', '白羊 3°09′'],
      ['venus', '白羊 16°59′'],
      ['mars', '摩羯 26°55′'],
      ['jupiter', '水瓶 27°29′'],
      ['saturn', '白羊 4°11′'],
      ['uranus', '处女 1°17′'],
      ['neptune', '金牛 7°52′'],
      ['pluto', '金牛 24°44′'],
    ]
    for (const [key, text] of expected) expect(formatLon(at(key).lon), key).toBe(text)
    // Angles: ASC 11°38′ 巨蟹, MC 12°49′ 双鱼 published; allow 2′ for ΔT and rounding.
    expect(Math.abs(einstein.asc - (90 + 11 + 38 / 60))).toBeLessThan(2 / 60)
    expect(Math.abs(einstein.mc - (330 + 12 + 49 / 60))).toBeLessThan(2 / 60)
    expect(at('uranus').retrograde).toBe(true)
    expect(at('sun').retrograde).toBe(false)
  })

  it('keeps the nodes opposite and the true node near the mean one', () => {
    expect(Math.abs(((at('southNode').lon - at('node').lon + 360) % 360) - 180)).toBeLessThan(1e-9)
    const mean = computeChart(einstein.utc, 48.4, 10, { ...DEFAULT_STAR_SETTINGS, node: 'mean' })
    const diff = Math.abs(((at('node').lon - mean.points.find((p) => p.key === 'node')!.lon + 540) % 360) - 180)
    expect(diff).toBeLessThan(2)
  })

  it('finds the tight aspects', () => {
    const names = einstein.aspects.map((a) => `${a.a.key}-${a.type.key}-${a.b.key}`)
    expect(names).toContain('mercury-conjunction-saturn')
    expect(names).toContain('sun-sextile-pluto')
    for (const a of einstein.aspects) expect(a.orb).toBeLessThanOrEqual(10)
  })
})

describe('星盘 houses', () => {
  it('builds Whole Sign and Equal houses from the ascendant', () => {
    const whole = computeChart(einstein.utc, 48.4, 10, { ...DEFAULT_STAR_SETTINGS, houses: 'whole' })
    expect(whole.cusps[0]).toBe(90) // 巨蟹 0°
    expect(whole.cusps[6]).toBe(270)
    const equal = computeChart(einstein.utc, 48.4, 10, { ...DEFAULT_STAR_SETTINGS, houses: 'equal' })
    expect(equal.cusps[3]).toBeCloseTo((einstein.asc + 90) % 360, 9)
  })

  it('puts Placidus angles on the cusps and keeps cusps in order', () => {
    expect(einstein.cusps[0]).toBeCloseTo(einstein.asc, 9)
    expect(einstein.cusps[9]).toBeCloseTo(einstein.mc, 9)
    for (let i = 0; i < 12; i++) {
      const span = (einstein.cusps[(i + 1) % 12] - einstein.cusps[i] + 360) % 360
      expect(span).toBeGreaterThan(10)
      expect(span).toBeLessThan(60)
    }
    expect(houseOf(einstein.asc + 0.01, einstein.cusps)).toBe(1)
    expect(houseOf(einstein.mc - 0.01, einstein.cusps)).toBe(9)
  })
})

describe('星盘 time zones', () => {
  it('applies China daylight saving (1986–1991) and Beijing time otherwise', () => {
    expect(toUtc({ year: 1990, month: 7, day: 1, hour: 12, minute: 0 }, 'Asia/Shanghai')).toEqual({
      date: new Date(Date.UTC(1990, 6, 1, 3)),
      offsetMinutes: 540,
    })
    expect(toUtc({ year: 1990, month: 12, day: 1, hour: 12, minute: 0 }, 'Asia/Shanghai').offsetMinutes).toBe(480)
    expect(toUtc({ year: 2026, month: 7, day: 1, hour: 12, minute: 0 }, 'Asia/Shanghai').offsetMinutes).toBe(480)
  })

  it('casts from wall-clock time at a city', () => {
    const chart = buildStarChart({ year: 1997, month: 11, day: 2, hour: 9, minute: 30 }, {
      name: '北京',
      latitude: 39.9,
      longitude: 116.41,
      timeZone: 'Asia/Shanghai',
    }, DEFAULT_STAR_SETTINGS)
    expect(chart.utc.toISOString()).toBe('1997-11-02T01:30:00.000Z')
    // Sun in 天蝎 around 9–10°, rising sign 射手 on a November morning in Beijing
    expect(formatLon(chart.points.find((p) => p.key === 'sun')!.lon)).toMatch(/^天蝎 9°/)
    expect(Math.floor(chart.asc / 30)).toBe(8)
  })
})

describe('星盘 overseas places', () => {
  const wall = (year: number, month: number, day: number, hour = 12) => ({ year, month, day, hour, minute: 0 })
  const place = (timeZone: string, latitude = 40, longitude = 0) => ({ name: 'x', latitude, longitude, timeZone })

  it('follows each zone’s daylight saving, both hemispheres', () => {
    const ny = buildStarChart(wall(1990, 7, 1), place('America/New_York', 40.71, -74.01), DEFAULT_STAR_SETTINGS)
    expect(ny.offsetMinutes).toBe(-240)
    expect(ny.dst).toBe(true)
    expect(buildStarChart(wall(1990, 1, 15), place('America/New_York'), DEFAULT_STAR_SETTINGS).dst).toBe(false)
    // Southern summer: Sydney is on daylight time in January
    const syd = buildStarChart(wall(2000, 1, 15), place('Australia/Sydney', -33.87, 151.21), DEFAULT_STAR_SETTINGS)
    expect(syd.offsetMinutes).toBe(660)
    expect(syd.dst).toBe(true)
    expect(buildStarChart(wall(2000, 7, 15), place('Australia/Sydney'), DEFAULT_STAR_SETTINGS).dst).toBe(false)
  })

  it('handles half-hour zones and labels them', async () => {
    const { formatOffset, formatCoords } = await import('../astrology')
    const india = buildStarChart(wall(2000, 1, 1), place('Asia/Kolkata', 28.61, 77.21), DEFAULT_STAR_SETTINGS)
    expect(india.offsetMinutes).toBe(330)
    expect(formatOffset(india.offsetMinutes)).toBe('UTC+5:30')
    expect(formatOffset(-240)).toBe('UTC−4')
    expect(formatCoords(-33.87, -70.67)).toBe('33.87°S 70.67°W')
  })

  it('falls back to equal houses inside the polar circles', () => {
    const north = buildStarChart(wall(2000, 6, 21), place('Europe/Oslo', 70, 25), DEFAULT_STAR_SETTINGS)
    expect(north.housesFallback).toBe(true)
    for (let i = 0; i < 12; i++) expect(north.cusps[i]).toBeCloseTo((north.asc + i * 30) % 360, 9)
    expect(buildStarChart(wall(2000, 6, 21), place('Europe/Oslo', 59.91, 10.75), DEFAULT_STAR_SETTINGS).housesFallback).toBe(false)
  })

  it('lists every city once, with a zone the runtime knows', async () => {
    const { WORLD_CITIES } = await import('../worldCities')
    const { CITIES } = await import('../solarTime')
    const all = [...CITIES, ...WORLD_CITIES.flatMap((r) => r.cities)]
    expect(new Set(all.map((c) => c.name)).size).toBe(all.length)
    for (const c of all) {
      expect(() => new Intl.DateTimeFormat('en', { timeZone: c.timeZone ?? 'Asia/Shanghai' }), c.name).not.toThrow()
      expect(Math.abs(c.latitude)).toBeLessThan(70)
    }
  })
})
