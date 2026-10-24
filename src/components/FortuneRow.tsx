import { useRef, type ReactNode } from 'react'
import { useScrollHints } from './useScrollHints'

/** A collapsible 运 row (大运, 流年 … or 大限 …) with its current pick shown in the header. */
export function FortuneRow({
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
  children: ReactNode
}) {
  const ref = useRef<HTMLDivElement>(null)
  // The summary names the pick, so it changing means the row should re-centre on it.
  useScrollHints(ref, `${summary}|${open}`, '.fortune-row')
  return (
    <div className={`fortune-group${open ? ' open' : ''}`} ref={ref}>
      <button type="button" className="fortune-toggle" aria-expanded={open} onClick={onToggle}>
        <span className="chev" aria-hidden="true">
          ›
        </span>
        <span className="fortune-title">{title}</span>
        <span className="muted fortune-summary">{summary}</span>
      </button>
      {/* Always rendered, so opening and closing can slide (see .fortune-body-wrap). */}
      <div className="fortune-body-wrap" inert={!open}>
        <div className="fortune-body">{children}</div>
      </div>
    </div>
  )
}
