import { useMemo } from 'react'
import { ASPECT_INFO, HOUSE_INFO, PLANET_INFO, SIGN_INFO } from '../lib/astroInfo'
import {
  BODY_INFO,
  ELEMENT_NAME,
  SIGN_ELEMENT,
  SIGN_GLYPHS,
  SIGNS,
  buildStarChart,
  formatCoords,
  formatLon,
  formatOffset,
  type ChartPoint,
  type Element,
  type StarChart,
  type StarPlace,
  type StarSettings,
} from '../lib/astrology'
import type { BaziInput } from '../lib/bazi'
import { CITIES } from '../lib/solarTime'
import { WORLD_CITIES, allTimeZones } from '../lib/worldCities'
import { STAR_SCHOOLS, cityPlace } from '../lib/starPrefs'
import { BirthForm } from './BirthForm'
import { InfoTip, TipLine } from './InfoTip'
import { SchoolSettingsPanel } from './Schools'

interface Props {
  input: BaziInput
  onChange: (input: BaziInput) => void
  place: StarPlace
  onPlaceChange: (place: StarPlace) => void
  settings: StarSettings
  onSettingsChange: (settings: StarSettings) => void
}

/** 西洋占星 natal chart: the shared birth form, a birthplace, the wheel and the tables. */
export function StarChartView({ input, onChange, place, onPlaceChange, settings, onSettingsChange }: Props) {
  const chart = useMemo(() => buildStarChart(input, place, settings), [input, place, settings])
  const byKey = (k: ChartPoint['key']) => chart.points.find((p) => p.key === k)!
  const sun = byKey('sun')
  const moon = byKey('moon')
  const asc = byKey('asc')
  const bodies = chart.points.filter((p) => p.key !== 'asc' && p.key !== 'mc')
  // Element balance over the ten planets
  const elements = (['fire', 'earth', 'air', 'water'] as Element[]).map((e) => ({
    e,
    n: bodies.filter((p) => p.key !== 'node' && p.key !== 'southNode' && SIGN_ELEMENT[p.sign] === e).length,
  }))

  return (
    <div className="bazi-layout">
      <BirthForm
        input={input}
        onChange={onChange}
        trueSolar={false}
        extra={<PlacePicker place={place} onChange={onPlaceChange} />}
        schoolsPanel={<SchoolSettingsPanel registry={STAR_SCHOOLS} settings={settings} onChange={onSettingsChange} />}
      />

      <section className="card">
        <div className="big-three">
          {[
            [sun, '太阳'],
            [moon, '月亮'],
            [asc, '上升'],
          ].map(([p, label]) => {
            const pt = p as ChartPoint
            return (
              <div key={label as string} className={`b3 el-${SIGN_ELEMENT[pt.sign]}`}>
                <small className="muted">{label as string}</small>
                <span className="b3-glyph">{SIGN_GLYPHS[pt.sign]}</span>
                <strong>{SIGNS[pt.sign]}座</strong>
              </div>
            )
          })}
        </div>
        <p className="muted row-note star-meta">
          {place.name}（{formatCoords(place.latitude, place.longitude)}）· 按出生地时间 {formatOffset(chart.offsetMinutes)}
          {chart.dst && '（当时实行夏令时，已换算）'} · 回归黄道 ·{' '}
          {STAR_SCHOOLS.houses.options.find((o) => o.value === settings.houses)?.label}
          {chart.housesFallback && '（极圈内无法使用普拉西度，已改用等宫制）'}
        </p>
        <div className="star-layout">
          <StarWheel chart={chart} />
          <div className="star-tables">
            <table className="star-table">
              <thead>
                <tr>
                  <th>星体</th>
                  <th>位置</th>
                  <th>宫</th>
                </tr>
              </thead>
              <tbody>
                {chart.points.map((p) => (
                  <tr key={p.key}>
                    <td>
                      <span className="planet-glyph">{p.key === 'asc' || p.key === 'mc' ? '' : p.glyph}</span>
                      <InfoTip label={p.name} title={p.name}>
                        <span>{PLANET_INFO[p.key]}</span>
                      </InfoTip>
                      {p.retrograde && (
                        <InfoTip className="plain retro" label="℞" title="逆行">
                          <span>从地球看，这颗行星正在黄道上倒退。传统上认为它的作用更内省、迟缓或需要回顾。</span>
                        </InfoTip>
                      )}
                    </td>
                    <td className={`el-${SIGN_ELEMENT[p.sign]}`}>
                      <InfoTip label={formatLon(p.lon)} title={`${SIGNS[p.sign]}座 ${SIGN_GLYPHS[p.sign]}`}>
                        <TipLine name={ELEMENT_NAME[SIGN_ELEMENT[p.sign]]}>{SIGN_INFO[p.sign]}</TipLine>
                      </InfoTip>
                    </td>
                    <td>
                      <InfoTip label={String(p.house)} title={`第${p.house}宫`}>
                        <span>{HOUSE_INFO[p.house - 1]}</span>
                      </InfoTip>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="element-bars">
              {elements.map(({ e, n }) => (
                <span key={e} className={`el-${e}`}>
                  {ELEMENT_NAME[e]} <b>{n}</b>
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="card">
        <h3 className="section-title">宫位</h3>
        <div className="house-grid">
          {chart.cusps.map((c, i) => (
            <div key={i} className="house-cell">
              <InfoTip label={`第${i + 1}宫`} title={`第${i + 1}宫`}>
                <span>{HOUSE_INFO[i]}</span>
              </InfoTip>
              <span className={`el-${SIGN_ELEMENT[Math.floor(c / 30)]}`}>{formatLon(c)}</span>
            </div>
          ))}
        </div>

        <h3 className="section-title aspects-title">相位</h3>
        {chart.aspects.length === 0 ? (
          <p className="muted">没有主要相位。</p>
        ) : (
          <div className="aspect-list">
            {chart.aspects.map((a) => (
              <span key={a.a.key + a.b.key} className={`aspect-chip tone-${a.type.tone}`}>
                {a.a.name}
                <InfoTip className="plain" label={`${a.type.glyph}${a.type.name}`} title={`${a.type.name}相`}>
                  <span>{ASPECT_INFO[a.type.key]}</span>
                </InfoTip>
                {a.b.name}
                <small>{a.orb.toFixed(1)}°</small>
              </span>
            ))}
          </div>
        )}
        <p className="muted row-note">
          容许度：合、冲 8°，刑、拱 7°，六合 5°，涉及日月再加 2°。星体位置由{' '}
          <a href="https://github.com/cosinekitty/astronomy">astronomy-engine</a> 计算（误差约 1′）·{' '}
          <a href="https://github.com/RedCarpG/web-paipan-ChroniQ/blob/main/docs/schools.md#星盘">宫位制说明</a> · 仅供参考
        </p>
      </section>
    </div>
  )
}

/** Birthplace for houses and the time zone: a city (China or overseas), or custom coordinates and zone. */
function PlacePicker({ place, onChange }: { place: StarPlace; onChange: (p: StarPlace) => void }) {
  const known = findCity(place.name)
  const custom = !known
  const zones = useMemo(allTimeZones, [])
  return (
    <>
      <label>
        出生地
        <select
          value={custom ? '' : place.name}
          onChange={(e) => {
            const c = findCity(e.target.value)
            if (c) onChange(cityPlace(c))
            else onChange({ ...place, name: '自定义' })
          }}
        >
          <optgroup label="中国">
            {CITIES.map((c) => (
              <option key={c.name} value={c.name}>
                {c.name}
              </option>
            ))}
          </optgroup>
          {WORLD_CITIES.map((r) => (
            <optgroup key={r.region} label={r.region}>
              {r.cities.map((c) => (
                <option key={c.name} value={c.name}>
                  {c.name}
                </option>
              ))}
            </optgroup>
          ))}
          <option value="">自定义经纬度…</option>
        </select>
      </label>
      {custom && (
        <>
          <label>
            纬度（南为负）
            <input
              type="number"
              className="narrow"
              min={-90}
              max={90}
              step={0.01}
              value={place.latitude}
              onChange={(e) => {
                const v = Number(e.target.value)
                if (e.target.value !== '' && Math.abs(v) <= 90) onChange({ ...place, latitude: v })
              }}
            />
          </label>
          <label>
            经度（西为负）
            <input
              type="number"
              className="narrow"
              min={-180}
              max={180}
              step={0.01}
              value={place.longitude}
              onChange={(e) => {
                const v = Number(e.target.value)
                if (e.target.value !== '' && Math.abs(v) <= 180) onChange({ ...place, longitude: v })
              }}
            />
          </label>
          <label>
            时区
            <select value={place.timeZone} onChange={(e) => onChange({ ...place, timeZone: e.target.value })}>
              {zones.map((z) => (
                <option key={z} value={z}>
                  {z}
                </option>
              ))}
            </select>
          </label>
        </>
      )}
    </>
  )
}

const findCity = (name: string) =>
  CITIES.find((c) => c.name === name) ?? WORLD_CITIES.flatMap((r) => r.cities).find((c) => c.name === name)

/* ---------- The wheel ---------- */

const C = 200
const R_OUT = 196
const R_SIGN = 166
const R_HOUSE = 146
const R_PLANET = 124
const R_DEG = 104
const R_ASPECT = 90

/**
 * Traditional orientation: the ascendant at nine o'clock, signs running
 * counter-clockwise, so houses 1–6 sit below the horizon.
 */
function StarWheel({ chart }: { chart: StarChart }) {
  const at = (lon: number, r: number) => {
    const d = ((lon - chart.asc) * Math.PI) / 180
    return [C - r * Math.cos(d), C + r * Math.sin(d)] as const
  }
  const arc = (from: number, to: number, r1: number, r2: number) => {
    const [x1, y1] = at(from, r1)
    const [x2, y2] = at(to, r1)
    const [x3, y3] = at(to, r2)
    const [x4, y4] = at(from, r2)
    // Increasing longitude runs counter-clockwise on screen (sweep flag 0).
    return `M${x1},${y1} A${r1},${r1} 0 0 0 ${x2},${y2} L${x3},${y3} A${r2},${r2} 0 0 1 ${x4},${y4}Z`
  }
  const planets = chart.points.filter((p) => p.key !== 'asc' && p.key !== 'mc')
  const shown = spread(planets.map((p) => p.lon), 7.5)

  return (
    <svg className="star-wheel" viewBox="0 0 400 400" role="img" aria-label="星盘">
      {SIGNS.map((name, i) => {
        const el = SIGN_ELEMENT[i]
        const [gx, gy] = at(i * 30 + 15, (R_OUT + R_SIGN) / 2)
        return (
          <g key={name} className={`sign el-${el}`}>
            <path d={arc(i * 30, i * 30 + 30, R_OUT, R_SIGN)} className={`sign-band band-${el}`}>
              <title>{name}座</title>
            </path>
            <text x={gx} y={gy} className="sign-glyph" textAnchor="middle" dominantBaseline="central">
              {SIGN_GLYPHS[i]}
            </text>
          </g>
        )
      })}
      {Array.from({ length: 72 }, (_, i) => {
        const [x1, y1] = at(i * 5, R_SIGN)
        const [x2, y2] = at(i * 5, R_SIGN - (i % 2 ? 3 : 6))
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} className="tick" />
      })}
      <circle cx={C} cy={C} r={R_SIGN} className="ring" />
      <circle cx={C} cy={C} r={R_HOUSE} className="ring faint" />
      <circle cx={C} cy={C} r={R_ASPECT} className="ring" />
      {chart.cusps.map((c, i) => {
        const angle = i % 3 === 0
        const [x1, y1] = at(c, R_ASPECT)
        const [x2, y2] = at(c, R_SIGN)
        const next = chart.cusps[(i + 1) % 12]
        const mid = c + (((next - c + 360) % 360) || 30) / 2
        const [nx, ny] = at(mid, (R_SIGN + R_HOUSE) / 2)
        return (
          <g key={i}>
            <line x1={x1} y1={y1} x2={x2} y2={y2} className={angle ? 'cusp angle' : 'cusp'} />
            <text x={nx} y={ny} className="house-num" textAnchor="middle" dominantBaseline="central">
              {i + 1}
            </text>
          </g>
        )
      })}
      {(['asc', 'mc'] as const).map((k) => {
        const lon = k === 'asc' ? chart.asc : chart.mc
        const [x, y] = at(lon, R_OUT + 1)
        return (
          <text key={k} x={x} y={y} className="angle-label" textAnchor="middle" dominantBaseline="central">
            {k === 'asc' ? 'AC' : 'MC'}
          </text>
        )
      })}
      {chart.aspects
        .filter((a) => a.type.key !== 'conjunction' && a.a.key !== 'asc' && a.a.key !== 'mc' && a.b.key !== 'asc' && a.b.key !== 'mc')
        .map((a) => {
          const [x1, y1] = at(a.a.lon, R_ASPECT)
          const [x2, y2] = at(a.b.lon, R_ASPECT)
          return (
            <line
              key={a.a.key + a.b.key}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              className={`aspect-line tone-${a.type.tone}`}
              strokeOpacity={Math.max(0.25, 1 - a.orb / 8)}
            >
              <title>
                {a.a.name}
                {a.type.name}
                {a.b.name}（{a.orb.toFixed(1)}°）
              </title>
            </line>
          )
        })}
      {planets.map((p, i) => {
        const [tx, ty] = at(p.lon, R_HOUSE)
        const [lx, ly] = at(p.lon, R_HOUSE - 5)
        const [px, py] = at(shown[i], R_PLANET)
        const [dx, dy] = at(shown[i], R_DEG)
        return (
          <g key={p.key} className={`planet el-${SIGN_ELEMENT[p.sign]}`}>
            <title>
              {p.name} {formatLon(p.lon)}
              {p.retrograde ? ' 逆行' : ''} · 第{p.house}宫
            </title>
            <line x1={tx} y1={ty} x2={lx} y2={ly} className="planet-tick" />
            <text x={px} y={py} className="planet-glyph-svg" textAnchor="middle" dominantBaseline="central">
              {BODY_INFO[p.key as keyof typeof BODY_INFO].glyph}
            </text>
            <text x={dx} y={dy} className="planet-deg" textAnchor="middle" dominantBaseline="central">
              {Math.floor(p.lon % 30)}°{p.retrograde ? '℞' : ''}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

/** Push crowded longitudes apart (circularly) so glyphs don't overlap; returns display longitudes in input order. */
function spread(lons: number[], gap: number): number[] {
  const order = lons.map((l, i) => ({ l, i, d: l })).sort((a, b) => a.l - b.l)
  for (let pass = 0; pass < 60; pass++) {
    let moved = false
    for (let k = 0; k < order.length; k++) {
      const a = order[k]
      const b = order[(k + 1) % order.length]
      const diff = (((b.d - a.d) % 360) + 360) % 360
      if (order.length > 1 && diff < gap) {
        const push = (gap - diff) / 2
        a.d -= push
        b.d += push
        moved = true
      }
    }
    if (!moved) break
  }
  const out: number[] = []
  for (const o of order) out[o.i] = o.d
  return out
}
