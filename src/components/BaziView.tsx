import { useMemo, useState } from 'react'
import {
  ELEMENTS,
  buildBazi,
  currentFlowMonth,
  flowDays,
  flowMonths,
  fortunePillars,
  fortuneRelations,
  type BaziInput,
  type FortuneColumn,
} from '../lib/bazi'
import type { Relation } from '../lib/relations'
import type { SchoolSettings } from '../lib/schools'
import { Char } from './Char'
import { BirthForm } from './BirthForm'
import { SchoolMark } from './Schools'
import { HighlightScope, useHighlight, useTrigger } from './highlight'
import { ConceptTip } from './GlossaryTips'
import { PillarTable } from './PillarTable'
import { useTerm } from '../settingsContext'

interface Props {
  input: BaziInput
  onChange: (input: BaziInput) => void
  schools: SchoolSettings
  onSchoolsChange: (schools: SchoolSettings) => void
}

export function BaziView({ input, onChange, schools, onSchoolsChange }: Props) {
  const chart = useMemo(() => buildBazi(input, schools), [input, schools])
  const term = useTerm()
  const thisYear = new Date().getFullYear()
  const currentDecade = Math.max(
    0,
    chart.decades.findIndex((d) => d.startYear <= thisYear && thisYear <= d.endYear),
  )
  const [picked, setPicked] = useState<number | null>(null)
  const decadeIndex = picked ?? currentDecade
  const decade = chart.decades[decadeIndex]
  const [pickedYear, setPickedYear] = useState<number | null>(null)
  const [pickedMonth, setPickedMonth] = useState<number | null>(null)
  const [pickedDay, setPickedDay] = useState<string | null>(null)
  const fortuneYear =
    decade.years.find((y) => y.year === pickedYear) ?? decade.years.find((y) => y.year === thisYear) ?? decade.years[0]
  const dayMaster = chart.dayMaster.char
  const months = useMemo(() => flowMonths(fortuneYear.year, dayMaster), [fortuneYear.year, dayMaster])
  const todayMonth = useMemo(() => currentFlowMonth(fortuneYear.year), [fortuneYear.year])
  const month = months[pickedMonth ?? todayMonth ?? 0]
  const days = useMemo(() => flowDays(fortuneYear.year, month.index, dayMaster), [fortuneYear.year, month.index, dayMaster])
  const day = days.find((d) => d.key === pickedDay) ?? days.find((d) => d.isToday) ?? days[0]

  // Picking a coarser level resets the finer ones to their defaults.
  const pickDecade = (i: number) => {
    setPicked(i)
    setPickedYear(null)
    setPickedMonth(null)
    setPickedDay(null)
  }
  const pickYear = (y: number) => {
    setPickedYear(y)
    setPickedMonth(null)
    setPickedDay(null)
  }
  const pickMonth = (i: number) => {
    setPickedMonth(i)
    setPickedDay(null)
  }

  // 流日 → 大运, the usual 岁运盘 order (finest first), then the natal chart.
  const columns: FortuneColumn[] = [
    { label: '流日', ganzhi: day.ganzhi },
    { label: '流月', ganzhi: month.ganzhi },
    { label: '流年', ganzhi: fortuneYear.ganzhi },
    { label: '大运', ganzhi: decade.ganzhi },
  ]
  const combined = fortunePillars(chart, columns, schools)
  const fortuneRels = fortuneRelations(chart, columns, schools)

  const [open, setOpen] = useState({ decade: true, year: true, month: true, day: true })
  const toggle = (key: keyof typeof open) => setOpen((o) => ({ ...o, [key]: !o[key] }))
  const toggleAll = () => {
    const next = !Object.values(open).every(Boolean)
    setOpen({ decade: next, year: next, month: next, day: next })
  }
  const total = ELEMENTS.reduce((s, e) => s + chart.elementCount[e], 0)

  const update = (patch: Partial<BaziInput>) => {
    setPicked(null)
    setPickedYear(null)
    setPickedMonth(null)
    setPickedDay(null)
    onChange({ ...input, ...patch })
  }

  return (
    <div className="bazi-layout">
      <BirthForm input={input} onChange={update} schools={schools} onSchoolsChange={onSchoolsChange} />

      <section className="card">
        <div className="chart-meta">
          <div>
            <strong>{chart.gender === '男' ? term('乾造') : term('坤造')}</strong> · 属{term(chart.zodiac)}
          </div>
          <div className="muted">阳历 {chart.solarText}</div>
          {chart.trueSolar && (
            <div className="muted">
              真太阳时 {chart.trueSolar.text}（{chart.trueSolar.offsetMinutes >= 0 ? '+' : '−'}
              {Math.abs(Math.round(chart.trueSolar.offsetMinutes))}分）
            </div>
          )}
          <div className="muted">
            {term('农历')} {term(chart.lunarText)}
          </div>
        </div>

        <HighlightScope pillars={chart.pillars} relations={chart.relations}>
          <PillarTable
            pillars={chart.pillars}
            schools={schools}
            dayMaster={chart.dayMaster.char}
            headerExtra={(p) =>
              chart.lateZiHour &&
              (p.label === '日柱' || p.label === '时柱') && <SchoolMark school="ziHour" settings={schools} />
            }
          />

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

          <Relations title={term('原局刑冲合会')} items={chart.relations} schools={schools} />
        </HighlightScope>

        <dl className="kv inline">
          <dt>
            <ConceptTip name="胎元" />
          </dt>
          <dd>{chart.fetalOrigin}</dd>
          <dt>
            <ConceptTip name="胎息" />
          </dt>
          <dd>{chart.fetalBreath}</dd>
          <dt>
            <ConceptTip name="命宫" />
          </dt>
          <dd>{chart.ownSign}</dd>
          <dt>
            <ConceptTip name="身宫" />
          </dt>
          <dd>{chart.bodySign}</dd>
        </dl>
      </section>

      <section className="card fortunes">
        <div className="fortunes-head">
          <h3>{term('岁运')}</h3>
          <button type="button" className="ghost" onClick={toggleAll}>
            {Object.values(open).every(Boolean) ? '全部收起' : '全部展开'}
          </button>
        </div>
        <FortuneRow
          title={term('大运')}
          summary={`${decade.ganzhi} · ${decade.startAge}–${decade.endAge}岁 · ${decade.startYear}–${decade.endYear}`}
          open={open.decade}
          onToggle={() => toggle('decade')}
        >
          <p className="muted row-note">
            {chart.startText}
            <SchoolMark school="childLimit" settings={schools} />
          </p>
          <div className="fortune-row">
            {chart.decades.map((d, i) => (
              <button
                key={d.startYear}
                className={['fortune', i === decadeIndex && 'selected', i === currentDecade && 'current'].filter(Boolean).join(' ')}
                onClick={() => pickDecade(i)}
              >
                <small>{d.startAge}岁</small>
                <small className="muted">{d.startYear}</small>
                <Char g={d.stem} small />
                <Char g={d.branch} small />
                <small>{term(d.stem.tenStar ?? '')}</small>
              </button>
            ))}
          </div>
        </FortuneRow>
        <FortuneRow
          title={term('流年')}
          summary={`${fortuneYear.year} ${fortuneYear.ganzhi} · ${fortuneYear.age}岁`}
          open={open.year}
          onToggle={() => toggle('year')}
        >
          <div className="fortune-row">
            {decade.years.map((y) => (
              <button
                key={y.year}
                className={['fortune', y.year === thisYear && 'current', y.year === fortuneYear.year && 'selected']
                  .filter(Boolean)
                  .join(' ')}
                onClick={() => pickYear(y.year)}
              >
                <small>{y.year}</small>
                <small className="muted">{y.age}岁</small>
                <Char g={y.stem} small />
                <Char g={y.branch} small />
                <small>{term(y.stem.tenStar ?? '')}</small>
                <small className="muted" title={term('小运')}>
                  {y.smallFortune}
                </small>
              </button>
            ))}
          </div>
        </FortuneRow>
        <FortuneRow
          title={term('流月')}
          summary={`${month.ganzhi} · ${month.start}起`}
          open={open.month}
          onToggle={() => toggle('month')}
        >
          <div className="fortune-row months">
            {months.map((m) => (
              <button
                key={m.index}
                className={['fortune', m.index === todayMonth && 'current', m.index === month.index && 'selected']
                  .filter(Boolean)
                  .join(' ')}
                onClick={() => pickMonth(m.index)}
              >
                <small>{m.start}</small>
                <Char g={m.stem} small />
                <Char g={m.branch} small />
                <small>{term(m.stem.tenStar ?? '')}</small>
              </button>
            ))}
          </div>
        </FortuneRow>
        <FortuneRow
          title={term('流日')}
          summary={`${day.month}/${day.day} ${day.ganzhi}`}
          open={open.day}
          onToggle={() => toggle('day')}
        >
          <div className="fortune-row days">
            {days.map((d) => (
              <button
                key={d.key}
                className={['fortune', d.isToday && 'current', d.key === day.key && 'selected'].filter(Boolean).join(' ')}
                onClick={() => setPickedDay(d.key)}
              >
                <small>
                  {d.month}/{d.day}
                </small>
                <Char g={d.stem} small />
                <Char g={d.branch} small />
                <small>{term(d.stem.tenStar ?? '')}</small>
              </button>
            ))}
          </div>
        </FortuneRow>
      </section>

      <section className="card">
        <h3 className="section-title">{term('岁运盘')}</h3>
        <p className="muted row-note">
          {day.month}月{day.day}日 · {month.ganzhi}月 · {fortuneYear.year}
          {fortuneYear.ganzhi}年 · {decade.ganzhi}
          {term('运')}，合参命主原局
        </p>
        <HighlightScope pillars={[...combined, ...chart.pillars]} relations={fortuneRels}>
          <div className="table-scroll">
            <PillarTable
              pillars={[...combined, ...chart.pillars]}
              schools={schools}
              dividerAt={combined.length}
              dayMaster={chart.dayMaster.char}
            />
          </div>
          <Relations title={term('岁运刑冲合会')} items={fortuneRels} schools={schools} empty="与原局无明显刑冲合会" />
        </HighlightScope>
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
          {items.map((r, i) => (
            <RelationChip key={r.text + r.members.join('')} relation={r} index={i} schools={schools} />
          ))}
        </div>
      )}
    </div>
  )
}

function FortuneRow({
  title,
  summary,
  open,
  onToggle,
  children,
}: {
  title: string
  summary: string
  open: boolean
  onToggle: () => void
  children: React.ReactNode
}) {
  return (
    <div className={`fortune-group${open ? ' open' : ''}`}>
      <button type="button" className="fortune-toggle" aria-expanded={open} onClick={onToggle}>
        <span className="chev" aria-hidden="true">
          ›
        </span>
        <span className="fortune-title">{title}</span>
        <span className="muted fortune-summary">{summary}</span>
      </button>
      {open && <div className="fortune-body">{children}</div>}
    </div>
  )
}

function RelationChip({ relation: r, index, schools }: { relation: Relation; index: number; schools: SchoolSettings }) {
  const term = useTerm()
  const { hover, rels } = useHighlight()
  const trigger = useTrigger({ kind: 'rel', index })
  const state = rels.has(index) ? ' hl-on' : hover ? ' hl-dim' : ''
  return (
    <span className={`rel rel-${r.kind} hl-target${state}`} {...trigger}>
      <b>{term(r.members.join('·'))}</b> {term(r.text)}
      {r.school && <SchoolMark school={r.school} settings={schools} />}
    </span>
  )
}
