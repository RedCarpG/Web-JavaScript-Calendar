import type { ReactNode } from 'react'
import type { Glyph, Pillar } from '../lib/bazi'
import type { SchoolSettings } from '../lib/schools'
import { useTerm } from '../settingsContext'
import { Char } from './Char'
import { useHighlight, useTrigger } from './highlight'
import { SchoolMark } from './Schools'
import { ShenShaTip } from './ShenShaTip'

interface Props {
  pillars: Pillar[]
  schools: SchoolSettings
  /** Extra content after a column's header label */
  headerExtra?: (p: Pillar) => ReactNode
  /** Index of the first natal column, drawn with a divider before it */
  dividerAt?: number
}

/** 主星 / 天干 / 地支 / 藏干 / 纳音 / 星运 / 自坐 / 空亡 / 神煞 table for any set of pillars. */
export function PillarTable({ pillars, schools, headerExtra, dividerAt }: Props) {
  const term = useTerm()
  const { hover } = useHighlight()
  const cls = (i: number) => (i === dividerAt ? 'divider' : undefined)
  const rows = [
    [term('纳音'), 'sound'],
    [term('星运'), 'terrain'],
    [term('自坐'), 'selfTerrain'],
    [term('空亡'), 'empty'],
  ] as const
  return (
    <table className={`pillars${hover ? ' hl-active' : ''}`}>
      <thead>
        <tr>
          <th />
          {pillars.map((p, i) => (
            <th key={p.label} className={cls(i)}>
              {term(p.label)}
              {headerExtra?.(p)}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        <tr className="row-star">
          <th>{term('主星')}</th>
          {pillars.map((p, i) => (
            <td key={p.label} className={cls(i)}>
              <Star name={p.stem.tenStar} />
            </td>
          ))}
        </tr>
        <tr className="row-char">
          <th>{term('天干')}</th>
          {pillars.map((p, i) => (
            <td key={p.label} className={cls(i)}>
              <GanzhiCell pillar={p.label} part="stem" g={p.stem} />
            </td>
          ))}
        </tr>
        <tr className="row-char">
          <th>{term('地支')}</th>
          {pillars.map((p, i) => (
            <td key={p.label} className={cls(i)}>
              <GanzhiCell pillar={p.label} part="branch" g={p.branch} />
            </td>
          ))}
        </tr>
        <tr>
          <th>{term('藏干')}</th>
          {pillars.map((p, i) => (
            <td key={p.label} className={['hidden-stems', cls(i)].filter(Boolean).join(' ')}>
              {p.hidden.map((h) => (
                <div key={h.char}>
                  <span className={`el-${h.element}`}>{h.char}</span>
                  <small>
                    <Star name={h.tenStar} />
                  </small>
                </div>
              ))}
            </td>
          ))}
        </tr>
        {rows.map(([title, key]) => (
          <tr key={key}>
            <th>{title}</th>
            {pillars.map((p, i) => (
              <td key={p.label} className={cls(i)}>
                {term(p[key])}
              </td>
            ))}
          </tr>
        ))}
        <tr className="row-shensha">
          <th>{term('神煞')}</th>
          {pillars.map((p, i) => (
            <td key={p.label} className={cls(i)}>
              {p.shenSha.map((s) => (
                <div key={s.name}>
                  <ShenShaTip name={s.name} />
                  {s.school && <SchoolMark school={s.school} settings={schools} />}
                </div>
              ))}
            </td>
          ))}
        </tr>
      </tbody>
    </table>
  )
}

/** A 天干 or 地支 that highlights what it 刑冲合会 with. */
function GanzhiCell({ pillar, part, g }: { pillar: string; part: 'stem' | 'branch'; g: Glyph }) {
  const { cells } = useHighlight()
  const trigger = useTrigger({ kind: 'cell', pillar, part })
  return (
    <span className={`hl-target${cells.has(`${pillar}|${part}`) ? ' hl-on' : ''}`} {...trigger}>
      <Char g={g} />
    </span>
  )
}

/** A 十神 that highlights every 十神 of the same name. */
function Star({ name }: { name?: string }) {
  const term = useTerm()
  const { star } = useHighlight()
  const trigger = useTrigger({ kind: 'star', name: name ?? '' })
  // 日主 is a label, not a 十神
  if (!name || name === '日主') return <>{name ? term(name) : null}</>
  return (
    <span className={`hl-target star${star === name ? ' hl-on' : ''}`} {...trigger}>
      {term(name)}
    </span>
  )
}
