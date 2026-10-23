import type { ReactNode } from 'react'

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
