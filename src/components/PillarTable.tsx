import type { ReactNode } from 'react'
import type { Pillar } from '../lib/bazi'
import type { SchoolSettings } from '../lib/schools'
import { useTerm } from '../settingsContext'
import { Char } from './Char'
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
  const cls = (i: number) => (i === dividerAt ? 'divider' : undefined)
  const rows = [
    [term('纳音'), 'sound'],
    [term('星运'), 'terrain'],
    [term('自坐'), 'selfTerrain'],
    [term('空亡'), 'empty'],
  ] as const
  return (
    <table className="pillars">
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
              {term(p.stem.tenStar ?? '')}
            </td>
          ))}
        </tr>
        <tr className="row-char">
          <th>{term('天干')}</th>
          {pillars.map((p, i) => (
            <td key={p.label} className={cls(i)}>
              <Char g={p.stem} />
            </td>
          ))}
        </tr>
        <tr className="row-char">
          <th>{term('地支')}</th>
          {pillars.map((p, i) => (
            <td key={p.label} className={cls(i)}>
              <Char g={p.branch} />
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
                  <small>{term(h.tenStar ?? '')}</small>
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
