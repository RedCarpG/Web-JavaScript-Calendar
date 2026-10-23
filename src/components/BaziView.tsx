import { useMemo, useState } from 'react'
import { ELEMENTS, buildBazi, fortuneRelations, type BaziInput } from '../lib/bazi'
import type { Relation } from '../lib/relations'
import type { SchoolSettings } from '../lib/schools'
import { CITIES } from '../lib/solarTime'
import { Char } from './Char'
import { SchoolMark, SchoolSettingsPanel } from './Schools'

interface Props {
  input: BaziInput
  onChange: (input: BaziInput) => void
  schools: SchoolSettings
  onSchoolsChange: (schools: SchoolSettings) => void
}

const pad = (n: number) => String(n).padStart(2, '0')

export function BaziView({ input, onChange, schools, onSchoolsChange }: Props) {
  const chart = useMemo(() => buildBazi(input, schools), [input, schools])
  const [showSchools, setShowSchools] = useState(false)
  const thisYear = new Date().getFullYear()
  const currentDecade = Math.max(
    0,
    chart.decades.findIndex((d) => d.startYear <= thisYear && thisYear <= d.endYear),
  )
  const [picked, setPicked] = useState<number | null>(null)
  const decadeIndex = picked ?? currentDecade
  const decade = chart.decades[decadeIndex]
  const [pickedYear, setPickedYear] = useState<number | null>(null)
  const fortuneYear =
    decade.years.find((y) => y.year === pickedYear) ?? decade.years.find((y) => y.year === thisYear) ?? decade.years[0]
  const fortuneRels = fortuneRelations(chart, decade, fortuneYear, schools)
  const city = CITIES.find((c) => c.longitude === input.longitude)
  const total = ELEMENTS.reduce((s, e) => s + chart.elementCount[e], 0)

  const dateValue = `${input.year}-${pad(input.month)}-${pad(input.day)}`
  const timeValue = `${pad(input.hour)}:${pad(input.minute)}`
  const update = (patch: Partial<BaziInput>) => {
    setPicked(null)
    setPickedYear(null)
    onChange({ ...input, ...patch })
  }

  return (
    <div className="bazi-layout">
      <section className="card bazi-form">
        <label>
          出生日期
          <input
            type="date"
            min="1900-01-01"
            max="2100-12-31"
            value={dateValue}
            onChange={(e) => {
              const [y, m, d] = e.target.value.split('-').map(Number)
              if (y >= 1900 && y <= 2100) update({ year: y, month: m, day: d })
            }}
          />
        </label>
        <label>
          出生时间
          <input
            type="time"
            value={timeValue}
            onChange={(e) => {
              const [h, mi] = e.target.value.split(':').map(Number)
              if (!Number.isNaN(h)) update({ hour: h, minute: mi })
            }}
          />
        </label>
        <div className="seg" role="group" aria-label="性别">
          {(['男', '女'] as const).map((g, i) => (
            <button
              key={g}
              className={input.gender === 1 - i ? 'on' : undefined}
              onClick={() => update({ gender: (1 - i) as 0 | 1 })}
            >
              {g}
            </button>
          ))}
        </div>
        <label className="check">
          <input
            type="checkbox"
            checked={input.longitude != null}
            onChange={(e) => update({ longitude: e.target.checked ? CITIES[0].longitude : undefined })}
          />
          真太阳时
        </label>
        {input.longitude != null && (
          <>
            <label>
              出生地
              <select
                value={city?.name ?? ''}
                onChange={(e) => {
                  const c = CITIES.find((x) => x.name === e.target.value)
                  if (c) update({ longitude: c.longitude })
                }}
              >
                {!city && <option value="">自定义</option>}
                {CITIES.map((c) => (
                  <option key={c.name} value={c.name}>{c.name}</option>
                ))}
              </select>
            </label>
            <label>
              东经
              <input
                type="number"
                className="narrow"
                min={73}
                max={135}
                step={0.01}
                value={input.longitude}
                onChange={(e) => {
                  const v = Number(e.target.value)
                  if (e.target.value !== '' && v >= -180 && v <= 180) update({ longitude: v })
                }}
              />
            </label>
          </>
        )}
        <button
          type="button"
          className={`ghost${showSchools ? ' on' : ''}`}
          aria-expanded={showSchools}
          onClick={() => setShowSchools((v) => !v)}
        >
          流派设置
        </button>
        {showSchools && <SchoolSettingsPanel settings={schools} onChange={onSchoolsChange} />}
      </section>

      <section className="card">
        <div className="chart-meta">
          <div>
            <strong>{chart.gender === '男' ? '乾造' : '坤造'}</strong> · 属{chart.zodiac}
          </div>
          <div className="muted">阳历 {chart.solarText}</div>
          {chart.trueSolar && (
            <div className="muted">
              真太阳时 {chart.trueSolar.text}（{chart.trueSolar.offsetMinutes >= 0 ? '+' : '−'}
              {Math.abs(Math.round(chart.trueSolar.offsetMinutes))}分）
            </div>
          )}
          <div className="muted">农历 {chart.lunarText}</div>
        </div>

        <table className="pillars">
          <thead>
            <tr>
              <th />
              {chart.pillars.map((p) => (
                <th key={p.label}>
                  {p.label}
                  {chart.lateZiHour && (p.label === '日柱' || p.label === '时柱') && (
                    <SchoolMark school="ziHour" settings={schools} />
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr className="row-star">
              <th>主星</th>
              {chart.pillars.map((p) => (
                <td key={p.label}>{p.stem.tenStar}</td>
              ))}
            </tr>
            <tr className="row-char">
              <th>天干</th>
              {chart.pillars.map((p) => (
                <td key={p.label}><Char g={p.stem} /></td>
              ))}
            </tr>
            <tr className="row-char">
              <th>地支</th>
              {chart.pillars.map((p) => (
                <td key={p.label}><Char g={p.branch} /></td>
              ))}
            </tr>
            <tr>
              <th>藏干</th>
              {chart.pillars.map((p) => (
                <td key={p.label} className="hidden-stems">
                  {p.hidden.map((h) => (
                    <div key={h.char}>
                      <span className={`el-${h.element}`}>{h.char}</span>
                      <small>{h.tenStar}</small>
                    </div>
                  ))}
                </td>
              ))}
            </tr>
            {(
              [
                ['纳音', 'sound'],
                ['星运', 'terrain'],
                ['自坐', 'selfTerrain'],
                ['空亡', 'empty'],
              ] as const
            ).map(([title, key]) => (
              <tr key={key}>
                <th>{title}</th>
                {chart.pillars.map((p) => (
                  <td key={p.label}>{p[key]}</td>
                ))}
              </tr>
            ))}
            <tr className="row-shensha">
              <th>神煞</th>
              {chart.pillars.map((p) => (
                <td key={p.label}>
                  {p.shenSha.map((s) => (
                    <div key={s.name}>
                      {s.name}
                      {s.school && <SchoolMark school={s.school} settings={schools} />}
                    </div>
                  ))}
                </td>
              ))}
            </tr>
          </tbody>
        </table>

        <div className="elements">
          {ELEMENTS.map((e) => (
            <div key={e} className="el-bar">
              <span className={`el-${e}`}>{e}</span>
              <div className="track">
                <div className={`fill bg-${e}`} style={{ width: `${(chart.elementCount[e] / total) * 100}%` }} />
              </div>
              <span className="muted">{chart.elementCount[e]}</span>
            </div>
          ))}
        </div>

        <Relations title="原局刑冲合会" items={chart.relations} schools={schools} />

        <dl className="kv inline">
          <dt>胎元</dt>
          <dd>{chart.fetalOrigin}</dd>
          <dt>胎息</dt>
          <dd>{chart.fetalBreath}</dd>
          <dt>命宫</dt>
          <dd>{chart.ownSign}</dd>
          <dt>身宫</dt>
          <dd>{chart.bodySign}</dd>
        </dl>
      </section>

      <section className="card fortunes">
        <h3>大运</h3>
        <p className="muted">
          {chart.startText}
          <SchoolMark school="childLimit" settings={schools} />
        </p>
        <div className="fortune-row">
          {chart.decades.map((d, i) => (
            <button
              key={d.startYear}
              className={['fortune', i === decadeIndex && 'selected', i === currentDecade && 'current'].filter(Boolean).join(' ')}
              onClick={() => setPicked(i)}
            >
              <small>{d.startAge}岁</small>
              <small className="muted">{d.startYear}</small>
              <Char g={d.stem} small />
              <Char g={d.branch} small />
              <small>{d.stem.tenStar}</small>
            </button>
          ))}
        </div>
        <h3>流年 · {decade.ganzhi}运</h3>
        <div className="fortune-row">
          {decade.years.map((y) => (
            <button
              key={y.year}
              className={['fortune', y.year === thisYear && 'current', y.year === fortuneYear.year && 'selected']
                .filter(Boolean)
                .join(' ')}
              onClick={() => setPickedYear(y.year)}
            >
              <small>{y.year}</small>
              <small className="muted">{y.age}岁</small>
              <Char g={y.stem} small />
              <Char g={y.branch} small />
              <small>{y.stem.tenStar}</small>
              <small className="muted" title="小运">{y.smallFortune}</small>
            </button>
          ))}
        </div>
        <Relations
          title={`岁运作用 · ${decade.ganzhi}运 ${fortuneYear.year}${fortuneYear.ganzhi}年`}
          items={fortuneRels}
          schools={schools}
          empty="与原局无明显刑冲合会"
        />
      </section>
    </div>
  )
}

function Relations({
  title,
  items,
  schools,
  empty = '无',
}: {
  title: string
  items: Relation[]
  schools: SchoolSettings
  empty?: string
}) {
  return (
    <div className="relations">
      <h4>{title}</h4>
      {items.length === 0 ? (
        <p className="muted">{empty}</p>
      ) : (
        <div className="tags">
          {items.map((r) => (
            <span key={r.text + r.members.join('')} className={`rel rel-${r.kind}`}>
              <b>{r.members.join('')}</b> {r.text}
              {r.school && <SchoolMark school={r.school} settings={schools} />}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
