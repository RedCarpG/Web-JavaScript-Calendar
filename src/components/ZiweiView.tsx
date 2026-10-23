import { useMemo, useState } from 'react'
import type { BaziInput } from '../lib/bazi'
import { ELEMENTS } from '../lib/bazi'
import { BOARD, buildZiwei, sanFangSiZheng, type ZiweiPalace, type ZiweiStar } from '../lib/ziwei'
import { ZIWEI_SCHOOLS, type ZiweiSchoolSettings } from '../lib/ziweiSchools'
import { useSettings, useTerm } from '../settingsContext'
import { BirthForm } from './BirthForm'
import { SchoolSettingsPanel } from './Schools'
import { SanFangTip, StarTip } from './ZiweiTips'

/** A palace's part in the selected palace's 三方四正 */
type Role = 'self' | 'opposite' | 'trine'

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
  const roles = useMemo(() => {
    if (!active) return null
    const { opposite, trines } = sanFangSiZheng(active)
    return new Map<string, Role>([[active, 'self'], [opposite, 'opposite'], [trines[0], 'trine'], [trines[1], 'trine']])
  }, [active])

  return (
    <div className="bazi-layout">
      <BirthForm
        input={input}
        onChange={onChange}
        schoolsPanel={<SchoolSettingsPanel registry={ZIWEI_SCHOOLS} settings={schools} onChange={onSchoolsChange} />}
      />
      <section className="card">
        <div className="ziwei-scroll">
          <div className={`ziwei-board color-${ziweiColor}${roles ? ' sf-active' : ''}`}>
            {Object.values(chart.palaces).map((p) => (
              <Palace key={p.branch} palace={p} role={roles?.get(p.branch)} onActive={setActive} />
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
                <dt className="zc-extra">生肖 · 星座</dt>
                <dd className="zc-extra">
                  {term(chart.zodiac)} · {chart.sign}
                </dd>
              </dl>
            </div>
          </div>
        </div>
        <div className="zw-legends">
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
    </div>
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
  onActive,
}: {
  palace: ZiweiPalace
  role?: Role
  onActive: (branch: string | null) => void
}) {
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
            <StarItem key={s.name} star={s} />
          ))}
        </div>
        <div className="stars-minor">
          {p.minor.map((s) => (
            <StarItem key={s.name} star={s} />
          ))}
        </div>
        <div className="stars-adj">
          {p.adjective.map((s) => (
            <StarTip key={s.name} star={s} className="star-name" />
          ))}
        </div>
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
      <StarTip star={s} className={`star-name luck-${s.luck}${s.element ? ` el-${s.element}` : ''}`} />
      {s.brightness && <small className="star-bright">{term(s.brightness)}</small>}
      {s.mutagen && <span className={`mutagen m-${s.mutagen}`}>{term(s.mutagen)}</span>}
    </span>
  )
}
