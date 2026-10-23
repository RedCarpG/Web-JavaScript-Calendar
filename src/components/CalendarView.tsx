import { useMemo, useState } from 'react'
import { SolarDay } from 'tyme4ts'
import { WEEK_TITLES, buildDayDetail, buildMonthGrid, sameDay, todaySolar } from '../lib/calendar'

interface Props {
  onPickBazi: (day: SolarDay) => void
}

export function CalendarView({ onPickBazi }: Props) {
  const [selected, setSelected] = useState(todaySolar)
  const [view, setView] = useState(() => ({ year: selected.getYear(), month: selected.getMonth() }))

  const cells = useMemo(() => buildMonthGrid(view.year, view.month), [view])
  const detail = useMemo(() => buildDayDetail(selected), [selected])

  const shiftMonth = (delta: number) =>
    setView(({ year, month }) => {
      const m = year * 12 + (month - 1) + delta
      return { year: Math.floor(m / 12), month: (m % 12) + 1 }
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
            <h2>
              {view.year}年{view.month}月
            </h2>
            <span className="muted">
              {lunarYear.getName()}年 · {lunarYear.getEarthBranch().getZodiac().getName()}年
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
          {WEEK_TITLES.map((w, i) => (
            <div key={w} className={i >= 5 ? 'weekend' : undefined}>
              {w}
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
              <span className={`sub ${c.subKind}`}>{c.sub}</span>
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
          农历{detail.lunarText}
          <span className="muted"> · 属{detail.zodiac}</span>
        </div>
        <div className="ganzhi">{detail.ganzhi}</div>
        {detail.festivals.length > 0 && (
          <div className="tags">
            {detail.festivals.map((f) => (
              <span key={f} className="tag festival">{f}</span>
            ))}
          </div>
        )}
        <dl className="kv">
          <dt>节气</dt>
          <dd>{detail.term}</dd>
          <dt>建除</dt>
          <dd>{detail.duty}日</dd>
          <dt>值神</dt>
          <dd>{detail.twelveStar}</dd>
          <dt>星宿</dt>
          <dd>{detail.twentyEightStar}宿</dd>
        </dl>
        <TagBlock title="宜" kind="good" items={detail.recommends} />
        <TagBlock title="忌" kind="bad" items={detail.avoids} />
        <TagBlock title="吉神" kind="neutral" items={detail.goodGods} />
        <TagBlock title="凶煞" kind="neutral" items={detail.badGods} />
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
