import { useMemo } from 'react'
import type { BaziInput } from '../lib/bazi'
import type { SchoolSettings } from '../lib/schools'
import { BOARD, buildZiwei, type ZiweiPalace, type ZiweiStar } from '../lib/ziwei'
import { useTerm } from '../settingsContext'
import { BirthForm } from './BirthForm'

interface Props {
  input: BaziInput
  onChange: (input: BaziInput) => void
  schools: SchoolSettings
  onSchoolsChange: (schools: SchoolSettings) => void
}

/** 紫微斗数 page: shared birth form plus the twelve-palace board. */
export function ZiweiView({ input, onChange, schools, onSchoolsChange }: Props) {
  const chart = useMemo(() => buildZiwei(input, schools), [input, schools])
  const term = useTerm()

  return (
    <div className="bazi-layout">
      <BirthForm input={input} onChange={onChange} schools={schools} onSchoolsChange={onSchoolsChange} />
      <section className="card">
        <div className="ziwei-scroll">
          <div className="ziwei-board">
            {Object.values(chart.palaces).map((p) => (
              <Palace key={p.branch} palace={p} />
            ))}
            <div className="ziwei-center">
              <div className="zc-title">
                <strong>{chart.gender === '男' ? term('乾造') : term('坤造')}</strong>
                <span>{term(chart.fiveElementsClass)}</span>
              </div>
              <dl className="kv">
                <dt>阳历</dt>
                <dd>{chart.solarText}</dd>
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
                <dt>生肖 · 星座</dt>
                <dd>
                  {term(chart.zodiac)} · {chart.sign}
                </dd>
              </dl>
              <div className="zc-legend">
                {(['禄', '权', '科', '忌'] as const).map((m) => (
                  <span key={m} className={`mutagen m-${m}`}>
                    {term(m)}
                  </span>
                ))}
                <span className="muted">生年四化</span>
              </div>
            </div>
          </div>
        </div>
        <p className="muted row-note ziwei-credit">
          命盘由 <a href="https://github.com/SylarLong/iztro">iztro</a> 排出（通行安星法）· 仅供参考
        </p>
      </section>
    </div>
  )
}

function Palace({ palace: p }: { palace: ZiweiPalace }) {
  const term = useTerm()
  const [row, col] = BOARD[p.branch]
  return (
    <div className={`palace${p.isSoul ? ' soul' : ''}`} style={{ gridRow: row, gridColumn: col }}>
      <div className="palace-stars">
        <div className="stars-major">
          {p.major.map((s) => (
            <StarItem key={s.name} star={s} />
          ))}
        </div>
        <div className="stars-minor">
          {p.minor.map((s) => (
            <StarItem key={s.name} star={s} />
          ))}
        </div>
        <div className="stars-adj">{p.adjective.map((s) => term(s.name)).join(' ')}</div>
      </div>
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

function StarItem({ star: s }: { star: ZiweiStar }) {
  const term = useTerm()
  return (
    <span className="star-item">
      <span className="star-name">{term(s.name)}</span>
      {s.brightness && <small className="star-bright">{term(s.brightness)}</small>}
      {s.mutagen && <span className={`mutagen m-${s.mutagen}`}>{term(s.mutagen)}</span>}
    </span>
  )
}
