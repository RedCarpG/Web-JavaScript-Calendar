import { useMemo, useState } from 'react'
import { ELEMENTS, buildBazi, type BaziInput, type Glyph } from '../lib/bazi'

interface Props {
  input: BaziInput
  onChange: (input: BaziInput) => void
}

const pad = (n: number) => String(n).padStart(2, '0')

export function BaziView({ input, onChange }: Props) {
  const chart = useMemo(() => buildBazi(input), [input])
  const thisYear = new Date().getFullYear()
  const currentDecade = Math.max(
    0,
    chart.decades.findIndex((d) => d.startYear <= thisYear && thisYear <= d.endYear),
  )
  const [picked, setPicked] = useState<number | null>(null)
  const decadeIndex = picked ?? currentDecade
  const decade = chart.decades[decadeIndex]
  const total = ELEMENTS.reduce((s, e) => s + chart.elementCount[e], 0)

  const dateValue = `${input.year}-${pad(input.month)}-${pad(input.day)}`
  const timeValue = `${pad(input.hour)}:${pad(input.minute)}`
  const update = (patch: Partial<BaziInput>) => {
    setPicked(null)
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
        <label>
          晚子时
          <select value={input.sect} onChange={(e) => update({ sect: Number(e.target.value) as 1 | 2 })}>
            <option value={2}>日柱算当天</option>
            <option value={1}>日柱算明天</option>
          </select>
        </label>
      </section>

      <section className="card">
        <div className="chart-meta">
          <div>
            <strong>{chart.gender === '男' ? '乾造' : '坤造'}</strong> · 属{chart.zodiac}
          </div>
          <div className="muted">阳历 {chart.solarText}</div>
          <div className="muted">农历 {chart.lunarText}</div>
        </div>

        <table className="pillars">
          <thead>
            <tr>
              <th />
              {chart.pillars.map((p) => (
                <th key={p.label}>{p.label}</th>
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
        <p className="muted">{chart.startText}</p>
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
            <div key={y.year} className={['fortune', y.year === thisYear && 'current'].filter(Boolean).join(' ')}>
              <small>{y.year}</small>
              <small className="muted">{y.age}岁</small>
              <Char g={y.stem} small />
              <Char g={y.branch} small />
              <small>{y.stem.tenStar}</small>
              <small className="muted" title="小运">{y.smallFortune}</small>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

function Char({ g, small }: { g: Glyph; small?: boolean }) {
  return (
    <span className={`char el-${g.element}${small ? ' small' : ''}`} title={g.element}>
      {g.char}
    </span>
  )
}
