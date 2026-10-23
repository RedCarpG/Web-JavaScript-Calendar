import { useMemo, useState } from 'react'
import { SolarDay } from 'tyme4ts'
import { Char } from './Char'
import { MonthPicker } from './MonthPicker'
import { buildDayDetail, buildMonthGrid, sameDay, todaySolar, weekTitles } from '../lib/calendar'
import { useSettings, useTerm } from '../settingsContext'

// tyme4ts handles far wider ranges; this keeps the dropdown a manageable length.
const MIN_YEAR = 1900
const MAX_YEAR = 2100
const YEARS = Array.from({ length: MAX_YEAR - MIN_YEAR + 1 }, (_, i) => MIN_YEAR + i)
const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1)

interface Props {
  onPickBazi: (day: SolarDay) => void
}

export function CalendarView({ onPickBazi }: Props) {
  const [selected, setSelected] = useState(todaySolar)
  const [view, setView] = useState(() => ({ year: selected.getYear(), month: selected.getMonth() }))

  const { weekStart, dayGanzhi } = useSettings()
  const term = useTerm()
  const cells = useMemo(() => buildMonthGrid(view.year, view.month, weekStart), [view, weekStart])
  const detail = useMemo(() => buildDayDetail(selected), [selected])

  const shiftMonth = (delta: number) =>
    setView(({ year, month }) => {
      const m = year * 12 + (month - 1) + delta
      const next = { year: Math.floor(m / 12), month: (m % 12) + 1 }
      return next.year < MIN_YEAR || next.year > MAX_YEAR ? { year, month } : next
    })

  const select = (day: SolarDay) => {
    setSelected(day)
    setView({ year: day.getYear(), month: day.getMonth() })
  }

  const lunarYear = SolarDay.fromYmd(view.year, view.month, 15).getLunarDay().getYearSixtyCycle()

  return (
    <div className="calendar-layout">
      <section className="card calendar">
        <header className="cal-head">
          <div className="cal-title">
            <h2 className="cal-pickers">
              <select
                aria-label="年份"
                value={view.year}
                onChange={(e) => setView((v) => ({ ...v, year: Number(e.target.value) }))}
              >
                {YEARS.map((y) => (
                  <option key={y} value={y}>
                    {y}年
                  </option>
                ))}
              </select>
              <select
                aria-label="月份"
                value={view.month}
                onChange={(e) => setView((v) => ({ ...v, month: Number(e.target.value) }))}
              >
                {MONTHS.map((m) => (
                  <option key={m} value={m}>
                    {m}月
                  </option>
                ))}
              </select>
              <MonthPicker
                year={view.year}
                month={view.month}
                minYear={MIN_YEAR}
                maxYear={MAX_YEAR}
                onPickMonth={(year, month) => setView({ year, month })}
                onPickDay={select}
              />
            </h2>
            <span className="muted">
              {lunarYear.getName()}年 · {term(lunarYear.getEarthBranch().getZodiac().getName())}年
            </span>
          </div>
          <div className="cal-nav">
            <button onClick={() => shiftMonth(-12)} aria-label="上一年">«</button>
            <button onClick={() => shiftMonth(-1)} aria-label="上个月">‹</button>
            <button onClick={() => select(todaySolar())}>今天</button>
            <button onClick={() => shiftMonth(1)} aria-label="下个月">›</button>
            <button onClick={() => shiftMonth(12)} aria-label="下一年">»</button>
          </div>
        </header>

        <div className="grid week-titles">
          {weekTitles(weekStart).map((w) => (
            <div key={w.name} className={w.weekend ? 'weekend' : undefined}>
              {w.name}
            </div>
          ))}
        </div>
        <div className="grid days">
          {cells.map((c) => (
            <button
              key={c.key}
              className={[
                'day',
                !c.inMonth && 'out',
                c.isToday && 'today',
                c.isWeekend && 'weekend',
                sameDay(c.solar, selected) && 'selected',
              ]
                .filter(Boolean)
                .join(' ')}
              onClick={() => select(c.solar)}
            >
              {c.holiday && <span className={`badge ${c.holiday === '休' ? 'off' : 'work'}`}>{c.holiday}</span>}
              <span className="num">{c.day}</span>
              <span className={`sub ${c.subKind}`}>{term(c.sub)}</span>
              {dayGanzhi === 'show' && <span className="gz">{c.ganzhi}</span>}
            </button>
          ))}
        </div>
      </section>

      <aside className="card detail">
        <div className="detail-hero">
          <div className="big">{selected.getDay()}</div>
          <div>
            <div>{detail.solarText}</div>
            <div className="muted">
              {detail.weekText} · {detail.constellation}
            </div>
          </div>
        </div>
        <div className="lunar-line">
          {term('农历')}
          {term(detail.lunarText)}
          <span className="muted"> · 属{term(detail.zodiac)}</span>
        </div>
        <div className="day-pillars" aria-label={detail.ganzhi}>
          {detail.pillars.map((p) => (
            <div key={p.label} className="day-pillar">
              <span className="muted">{p.label}</span>
              <Char g={p.stem} />
              <Char g={p.branch} />
            </div>
          ))}
        </div>
        {detail.festivals.length > 0 && (
          <div className="tags">
            {detail.festivals.map((f) => (
              <span key={f} className="tag festival">
                {term(f)}
              </span>
            ))}
          </div>
        )}
        <dl className="kv">
          <dt>{term('节气')}</dt>
          <dd>{term(detail.term)}</dd>
          <dt>{term('建除')}</dt>
          <dd>{term(detail.duty)}日</dd>
          <dt>{term('值神')}</dt>
          <dd>{term(detail.twelveStar)}</dd>
          <dt>{term('星宿')}</dt>
          <dd>{term(detail.twentyEightStar)}宿</dd>
        </dl>
        <TagBlock title={term('宜')} kind="good" items={detail.recommends.map(term)} />
        <TagBlock title={term('忌')} kind="bad" items={detail.avoids.map(term)} />
        <TagBlock title={term('吉神')} kind="neutral" items={detail.goodGods.map(term)} />
        <TagBlock title={term('凶煞')} kind="neutral" items={detail.badGods.map(term)} />
        <button className="primary block" onClick={() => onPickBazi(selected)}>
          以此日排八字 →
        </button>
      </aside>
    </div>
  )
}

function TagBlock({ title, kind, items }: { title: string; kind: string; items: string[] }) {
  if (items.length === 0) return null
  return (
    <div className="tag-block">
      <span className={`tag-title ${kind}`}>{title}</span>
      <p>{items.join(' ')}</p>
    </div>
  )
}
