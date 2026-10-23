import { useMemo, useState } from 'react'
import type { BaziInput } from '../lib/bazi'
import { ELEMENTS } from '../lib/bazi'
import {
  BOARD,
  buildHoroscope,
  buildZiwei,
  dayInfo,
  daysInMonth,
  hourInfo,
  lunarToday,
  monthInfo,
  sanFangSiZheng,
  yearGanzhi,
  type HoroscopeTarget,
  type LayerKind,
  type ZiweiLayer,
  type ZiweiPalace,
  type ZiweiStar,
} from '../lib/ziwei'
import { ZIWEI_SCHOOLS, type ZiweiSchoolSettings } from '../lib/ziweiSchools'
import { useSettings, useTerm } from '../settingsContext'
import { BirthForm } from './BirthForm'
import { FortuneRow } from './FortuneRow'
import { SchoolSettingsPanel } from './Schools'
import { SanFangTip, StarTip } from './ZiweiTips'

/** A palace's part in the selected palace's 三方四正 */
type Role = 'self' | 'opposite' | 'trine'

/** How many 运限 layers the board shows */
type Depth = 'natal' | LayerKind
const DEPTHS: { value: Depth; label: string }[] = [
  { value: 'natal', label: '本命' },
  { value: 'decadal', label: '大限' },
  { value: 'yearly', label: '流年' },
  { value: 'monthly', label: '流月' },
  { value: 'daily', label: '流日' },
  { value: 'hourly', label: '流时' },
]
const LAYER_ORDER: LayerKind[] = ['decadal', 'yearly', 'monthly', 'daily', 'hourly']
/** One-character layer prefix: 大命, 年财, 月兄, 日福, 时官 … */
const LAYER_CHAR: Record<LayerKind, string> = { decadal: '大', yearly: '年', monthly: '月', daily: '日', hourly: '时' }
const LAYER_NAME: Record<LayerKind, string> = {
  decadal: '大限',
  yearly: '流年',
  monthly: '流月',
  daily: '流日',
  hourly: '流时',
}

interface Props {
  input: BaziInput
  onChange: (input: BaziInput) => void
  /** 紫微's own 流派设置, separate from 八字 */
  schools: ZiweiSchoolSettings
  onSchoolsChange: (schools: ZiweiSchoolSettings) => void
}

/** 紫微斗数 page: shared birth form plus the twelve-palace board. */
export function ZiweiView({ input, onChange, schools, onSchoolsChange }: Props) {
  const chart = useMemo(() => buildZiwei(input, schools), [input, schools])
  const term = useTerm()
  const { ziweiColor } = useSettings()
  // The palace whose 三方四正 is shown (hover with a mouse, tap or focus otherwise)
  const [active, setActive] = useState<string | null>(null)

  // 运限: picks default to the current 大限, year, month, day and 时辰; the board only
  // shows layers once one is chosen (or 叠加 is set).
  const today = useMemo(lunarToday, [])
  const currentDecade = Math.max(
    0,
    chart.decades.findIndex((d) => d.years.includes(today.year)),
  )
  const [depth, setDepth] = useState<Depth>('natal')
  const [pickedDecade, setPickedDecade] = useState<number | null>(null)
  const [pickedYear, setPickedYear] = useState<number | null>(null)
  const [pickedMonth, setPickedMonth] = useState<number | null>(null)
  const [pickedDay, setPickedDay] = useState<number | null>(null)
  const [pickedHour, setPickedHour] = useState<number | null>(null)
  const decadeIndex = pickedDecade ?? currentDecade
  const decade = chart.decades[decadeIndex]
  const year = pickedYear ?? (decade.years.includes(today.year) ? today.year : decade.years[0])
  const month = pickedMonth ?? (year === today.year ? today.month : 1)
  const isThisMonth = year === today.year && month === today.month
  const day = Math.min(pickedDay ?? (isThisMonth ? today.day : 1), daysInMonth(year, month))
  const isToday = isThisMonth && day === today.day
  const hour = pickedHour ?? (isToday ? today.hour : 0)
  const horoscope = useMemo(
    () => (depth === 'natal' ? null : buildHoroscope(input, schools, { year, month, day, hour })),
    [depth, input, schools, year, month, day, hour],
  )
  const layers: ZiweiLayer[] = horoscope
    ? LAYER_ORDER.slice(
        0,
        DEPTHS.findIndex((d) => d.value === depth),
      ).map((k) => horoscope[k])
    : []
  const [open, setOpen] = useState({ decade: true, year: true, month: true, day: true, hour: true })
  const toggle = (key: keyof typeof open) => setOpen((o) => ({ ...o, [key]: !o[key] }))
  // Picking a coarser level resets the finer ones; picking any level shows it.
  const pickDecade = (i: number) => {
    setPickedDecade(i)
    setPickedYear(null)
    setPickedMonth(null)
    setPickedDay(null)
    setPickedHour(null)
    setDepth('decadal')
  }
  const pickYear = (y: number) => {
    setPickedYear(y)
    setPickedMonth(null)
    setPickedDay(null)
    setPickedHour(null)
    setDepth('yearly')
  }
  const pickMonth = (m: number) => {
    setPickedMonth(m)
    setPickedDay(null)
    setPickedHour(null)
    setDepth('monthly')
  }
  const pickDay = (d: number) => {
    setPickedDay(d)
    setPickedHour(null)
    setDepth('daily')
  }
  const pickHour = (h: number) => {
    setPickedHour(h)
    setDepth('hourly')
  }
  const update = (next: BaziInput) => {
    setDepth('natal')
    setPickedDecade(null)
    setPickedYear(null)
    setPickedMonth(null)
    setPickedDay(null)
    setPickedHour(null)
    onChange(next)
  }
  const shows = (kind: LayerKind) => layers.some((l) => l.kind === kind)
  const roles = useMemo(() => {
    if (!active) return null
    const { opposite, trines } = sanFangSiZheng(active)
    return new Map<string, Role>([
      [active, 'self'],
      [opposite, 'opposite'],
      [trines[0], 'trine'],
      [trines[1], 'trine'],
    ])
  }, [active])

  return (
    <div className="bazi-layout">
      <BirthForm
        input={input}
        onChange={update}
        schoolsPanel={<SchoolSettingsPanel registry={ZIWEI_SCHOOLS} settings={schools} onChange={onSchoolsChange} />}
      />
      <section className="card">
        <div className="ziwei-scroll">
          <div className={`ziwei-board color-${ziweiColor}${roles ? ' sf-active' : ''}`}>
            {Object.values(chart.palaces).map((p) => (
              <Palace key={p.branch} palace={p} role={roles?.get(p.branch)} layers={layers} onActive={setActive} />
            ))}
            {active && <SanFangLines branch={active} />}
            <div className="ziwei-center">
              <div className="zc-title">
                <strong>{chart.gender === '男' ? term('乾造') : term('坤造')}</strong>
                <span>{term(chart.fiveElementsClass)}</span>
              </div>
              <dl className="kv">
                <dt className="zc-extra">阳历</dt>
                <dd className="zc-extra">{chart.solarText}</dd>
                {chart.trueSolar && (
                  <>
                    <dt>真太阳时</dt>
                    <dd>{chart.trueSolar.text}</dd>
                  </>
                )}
                <dt>{term('农历')}</dt>
                <dd>
                  {term(chart.lunarText)} {term(chart.time)}
                </dd>
                <dt>{term('四柱')}</dt>
                <dd>{chart.chineseDate}</dd>
                <dt>{term('命主')}</dt>
                <dd>{term(chart.soul)}</dd>
                <dt>{term('身主')}</dt>
                <dd>{term(chart.body)}</dd>
                {layers.map((l) => (
                  <LayerRow key={l.kind} layer={l} target={{ year, month, day, hour }} />
                ))}
                <dt className="zc-extra">生肖 · 星座</dt>
                <dd className="zc-extra">
                  {term(chart.zodiac)} · {chart.sign}
                </dd>
              </dl>
              <SanFangSummary chart={chart} active={active} />
            </div>
          </div>
        </div>
        <div className="zw-legends">
          {layers.length > 0 && (
            <div className="zc-legend">
              {layers.map((l) => (
                <span key={l.kind} className={`mutagen lm-${l.kind}`}>
                  {LAYER_NAME[l.kind]}
                </span>
              ))}
              <span className="muted">运限四化、流耀与宫名</span>
            </div>
          )}
          <div className="zc-legend">
            {(['禄', '权', '科', '忌'] as const).map((m) => (
              <span key={m} className={`mutagen m-${m}`}>
                {term(m)}
              </span>
            ))}
            <span className="muted">生年四化</span>
          </div>
          <div className="zc-legend">
            {ziweiColor === 'element' ? (
              ELEMENTS.map((e) => (
                <span key={e} className={`el-${e}`}>
                  {e}
                </span>
              ))
            ) : (
              <>
                <span className="luck-major">主星</span>
                <span className="luck-good">吉星</span>
                <span className="luck-bad">煞星</span>
              </>
            )}
            <span className="muted">星曜配色（可在设置中切换）</span>
          </div>
          <div className="zc-legend muted">
            <span>
              悬停或点按宫位看
              <SanFangTip />
              ，悬停或点按星曜看解释
            </span>
          </div>
        </div>
        <p className="muted row-note ziwei-credit">
          命盘由 <a href="https://github.com/SylarLong/iztro">iztro</a> 排出（
          {schools.algorithm === 'zhongzhou' ? '中州派' : '通行版'}安星法）· 仅供参考
        </p>
      </section>

      <section className="card fortunes">
        <div className="fortunes-head">
          <h3>{term('运限')}</h3>
          <div className="seg small" role="group" aria-label="叠加到">
            {DEPTHS.map((d) => (
              <button key={d.value} className={depth === d.value ? 'on' : undefined} onClick={() => setDepth(d.value)}>
                {term(d.label)}
              </button>
            ))}
          </div>
        </div>
        <FortuneRow
          title={term('大限')}
          summary={`${decade.range[0]}–${decade.range[1]}岁 · ${decade.stem}${decade.branch} · ${term(decade.palace)}`}
          open={open.decade}
          onToggle={() => toggle('decade')}
        >
          <div className="fortune-row decades">
            {chart.decades.map((d, i) => (
              <button
                key={d.branch}
                className={[
                  'fortune',
                  i === currentDecade && 'current',
                  shows('decadal') && i === decadeIndex && 'selected',
                ]
                  .filter(Boolean)
                  .join(' ')}
                onClick={() => pickDecade(i)}
              >
                <small>
                  {d.range[0]}–{d.range[1]}
                </small>
                <small className="muted">{d.years[0]}</small>
                <strong>
                  {d.stem}
                  {d.branch}
                </strong>
                <small>{term(d.palace)}</small>
              </button>
            ))}
          </div>
        </FortuneRow>
        <FortuneRow
          title={term('流年')}
          summary={`${year} ${yearGanzhi(year)} · ${year - chart.birthYear + 1}岁`}
          open={open.year}
          onToggle={() => toggle('year')}
        >
          <div className="fortune-row">
            {decade.years.map((y) => (
              <button
                key={y}
                className={['fortune', y === today.year && 'current', shows('yearly') && y === year && 'selected']
                  .filter(Boolean)
                  .join(' ')}
                onClick={() => pickYear(y)}
              >
                <small>{y}</small>
                <small className="muted">{y - chart.birthYear + 1}岁</small>
                <strong>{yearGanzhi(y)}</strong>
              </button>
            ))}
          </div>
        </FortuneRow>
        <FortuneRow
          title={term('流月')}
          summary={`${term(monthInfo(year, month).name)} ${monthInfo(year, month).ganzhi}`}
          open={open.month}
          onToggle={() => toggle('month')}
        >
          <div className="fortune-row months">
            {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => {
              const info = monthInfo(year, m)
              return (
                <button
                  key={m}
                  className={[
                    'fortune',
                    year === today.year && m === today.month && 'current',
                    shows('monthly') && m === month && 'selected',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  onClick={() => pickMonth(m)}
                >
                  <small>{term(info.name)}</small>
                  <strong>{info.ganzhi}</strong>
                </button>
              )
            })}
          </div>
        </FortuneRow>
        <FortuneRow
          title={term('流日')}
          summary={`${dayInfo(year, month, day).name} ${dayInfo(year, month, day).ganzhi}`}
          open={open.day}
          onToggle={() => toggle('day')}
        >
          <div className="fortune-row days">
            {Array.from({ length: daysInMonth(year, month) }, (_, i) => i + 1).map((d) => {
              const info = dayInfo(year, month, d)
              return (
                <button
                  key={d}
                  className={[
                    'fortune',
                    isThisMonth && d === today.day && 'current',
                    shows('daily') && d === day && 'selected',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  onClick={() => pickDay(d)}
                >
                  <small>{info.name}</small>
                  <strong>{info.ganzhi}</strong>
                </button>
              )
            })}
          </div>
        </FortuneRow>
        <FortuneRow
          title={term('流时')}
          summary={`${term(hourInfo(year, month, day, hour).name)} ${hourInfo(year, month, day, hour).ganzhi}`}
          open={open.hour}
          onToggle={() => toggle('hour')}
        >
          <div className="fortune-row months">
            {Array.from({ length: 12 }, (_, i) => i).map((h) => {
              const info = hourInfo(year, month, day, h)
              return (
                <button
                  key={h}
                  className={[
                    'fortune',
                    isToday && h === today.hour && 'current',
                    shows('hourly') && h === hour && 'selected',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  onClick={() => pickHour(h)}
                >
                  <small>{term(info.name)}</small>
                  <strong>{info.ganzhi}</strong>
                </button>
              )
            })}
          </div>
        </FortuneRow>
        <p className="muted row-note">
          流年按{schools.horoscopeDivide === 'exact' ? '立春' : '正月初一'}换年（可在流派设置中切换）；流月按 iztro
          的斗君起月；流日、流时以农历日和时辰为准（子时取当日早子时）。
        </p>
      </section>
    </div>
  )
}

/** Centre-panel line naming a 运限 layer, e.g. 流年 2026 丙午 */
function LayerRow({ layer: l, target: t }: { layer: ZiweiLayer; target: HoroscopeTarget }) {
  const term = useTerm()
  const when: Record<LayerKind, string> = {
    decadal: '',
    yearly: `${t.year} `,
    monthly: `${term(monthInfo(t.year, t.month).name)} `,
    daily: `${dayInfo(t.year, t.month, t.day).name} `,
    hourly: `${term(hourInfo(t.year, t.month, t.day, t.hour).name)} `,
  }
  return (
    <>
      <dt className={`fl-${l.kind}`}>{term(LAYER_NAME[l.kind])}</dt>
      <dd>
        {when[l.kind]}
        {l.stem}
        {l.branch}
      </dd>
    </>
  )
}

/** Where a palace's 三方四正 line meets the centre square, in board units (each palace is 1×1). */
function anchor(branch: string): [number, number] {
  const [row, col] = BOARD[branch]
  const clamp = (n: number) => Math.min(Math.max(n, 1), 3)
  return [clamp(col - 0.5), clamp(row - 0.5)]
}

/** Lines across the centre: a triangle for the 三合 and a line to the 对宫. */
function SanFangLines({ branch }: { branch: string }) {
  const { opposite, trines } = sanFangSiZheng(branch)
  const [self, opp, t1, t2] = [branch, opposite, ...trines].map(anchor)
  return (
    <svg className="sf-lines" viewBox="0 0 4 4" preserveAspectRatio="none" aria-hidden="true">
      <polygon points={[self, t1, t2].map((p) => p.join(',')).join(' ')} />
      <line x1={self[0]} y1={self[1]} x2={opp[0]} y2={opp[1]} />
    </svg>
  )
}

const ROLE_LABEL: Record<Role, string> = {
  self: '本宫',
  opposite: '对宫',
  trine: '三合',
}

function Palace({
  palace: p,
  role,
  layers,
  onActive,
}: {
  palace: ZiweiPalace
  role?: Role
  layers: ZiweiLayer[]
  onActive: (branch: string | null) => void
}) {
  const flowStars = layers.flatMap((l) => l.stars[p.branch].map((s) => ({ kind: l.kind, star: s })))
  const term = useTerm()
  const [row, col] = BOARD[p.branch]
  return (
    <div
      className={`palace${p.isSoul ? ' soul' : ''}${role ? ` sf-${role}` : ''}`}
      style={{ gridRow: row, gridColumn: col }}
      tabIndex={0}
      aria-label={`${term(p.name)}，${p.stem}${p.branch}`}
      // Same pattern as the 八字 highlight: mouse hover, or focus for touch and keyboard.
      onPointerEnter={(e) => e.pointerType === 'mouse' && onActive(p.branch)}
      onPointerLeave={(e) => e.pointerType === 'mouse' && onActive(null)}
      onFocus={() => onActive(p.branch)}
      onBlur={() => onActive(null)}
    >
      {role && <span className="sf-tag">{ROLE_LABEL[role]}</span>}
      <div className="palace-stars">
        <div className="stars-major">
          {p.major.map((s) => (
            <StarItem key={s.name} star={s} layers={layers} />
          ))}
        </div>
        <div className="stars-minor">
          {p.minor.map((s) => (
            <StarItem key={s.name} star={s} layers={layers} />
          ))}
        </div>
        <div className="stars-adj">
          {p.adjective.map((s) => (
            <StarTip key={s.name} star={s} className="star-name" />
          ))}
        </div>
        {flowStars.length > 0 && (
          <div className="stars-flow">
            {flowStars.map(({ kind, star: s }) => (
              <span key={kind + s.name} className={`flow-star fl-${kind}`}>
                {term(s.name)}
              </span>
            ))}
          </div>
        )}
      </div>
      {layers.length > 0 && (
        <div className="layer-tags">
          {layers.map((l) => (
            <span key={l.kind} className={`layer-tag lm-${l.kind}${l.palaceNames[p.branch] === '命宫' ? ' soul' : ''}`}>
              {LAYER_CHAR[l.kind]}
              {term(l.palaceNames[p.branch].slice(0, 1))}
            </span>
          ))}
        </div>
      )}
      <div className="palace-foot">
        <span className="palace-decadal">
          {p.decadal[0]}–{p.decadal[1]}
        </span>
        <span className="palace-name">
          {term(p.name)}
          {p.isBody && <span className="body-tag">{term('身')}</span>}
        </span>
        <span className="palace-gz">
          {p.stem}
          {p.branch}
        </span>
      </div>
      <span className="palace-cs">{term(p.changsheng)}</span>
    </div>
  )
}

function StarItem({ star: s, layers }: { star: ZiweiStar; layers: ZiweiLayer[] }) {
  const term = useTerm()
  return (
    <span className="star-item">
      <StarTip star={s} className={`star-name luck-${s.luck}${s.element ? ` el-${s.element}` : ''}`} />
      {s.brightness && <small className="star-bright">{term(s.brightness)}</small>}
      {s.mutagen && <span className={`mutagen m-${s.mutagen}`}>{term(s.mutagen)}</span>}
      {layers.map(
        (l) =>
          l.mutagens[s.name] && (
            <span
              key={l.kind}
              className={`mutagen lm-${l.kind}`}
              title={`${LAYER_NAME[l.kind]}化${l.mutagens[s.name]}`}
            >
              {term(l.mutagens[s.name])}
            </span>
          ),
      )}
    </span>
  )
}

/** Centre-panel summary of the selected palace's 三方四正, or a hint when none is selected. */
function SanFangSummary({ chart, active }: { chart: ReturnType<typeof buildZiwei>; active: string | null }) {
  const term = useTerm()
  // Hint and summary share one fixed-height slot: if the centre grew on hover, the
  // whole board would reflow under the pointer and the hover would flicker.
  if (!active)
    return (
      <div className="zc-sf-area">
        <p className="zc-hint muted">悬停或点按宫位，这里会列出它的{term('三方四正')}</p>
      </div>
    )
  const { opposite, trines } = sanFangSiZheng(active)
  const rows: [Role, string][] = [
    ['self', active],
    ['opposite', opposite],
    ['trine', trines[0]],
    ['trine', trines[1]],
  ]
  return (
    <div className="zc-sf-area">
      <div className="zc-sanfang" key={active}>
        <strong>{term('三方四正')}</strong>
        {rows.map(([role, b]) => {
          const p = chart.palaces[b]
          return (
            <div key={b} className={`zc-sf-row sf-${role}`}>
              <span className="zc-sf-role">{ROLE_LABEL[role]}</span>
              <b>{term(p.name)}</b>
              <span className="muted">
                {p.major.length
                  ? p.major.map((s) => term(s.name)).join(' ')
                  : `空宫，借对宫 ${chart.palaces[sanFangSiZheng(b).opposite].major.map((s) => term(s.name)).join(' ')}`}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
