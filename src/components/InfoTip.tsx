import { useEffect, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

const WIDTH = 260
const GAP = 8
const SHEET_BREAKPOINT = 480

type Place = { mode: 'float'; left: number; top: number; above: boolean } | { mode: 'sheet' }

/**
 * Text with a dotted underline that shows an explanation bubble on hover
 * (mouse), focus (keyboard) or tap (touch). The bubble is portalled to <body>
 * and placed against the viewport, so scrolling containers can't clip it; on
 * phones it docks to the bottom of the screen.
 */
export function InfoTip({
  label,
  title,
  children,
  className,
}: {
  label: ReactNode
  title: ReactNode
  children: ReactNode
  /** Extra class on the trigger, e.g. "plain" to drop the dotted underline */
  className?: string
}) {
  const ref = useRef<HTMLSpanElement>(null)
  const [place, setPlace] = useState<Place | null>(null)

  const show = () => {
    const el = ref.current
    if (!el) return
    if (window.innerWidth <= SHEET_BREAKPOINT) return setPlace({ mode: 'sheet' })
    // The page may be scaled by 显示大小 (CSS zoom); the bubble takes the same
    // zoom, so its left/top are given in its own, zoomed, pixels.
    const zoom = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--ui-zoom')) || 1
    const width = WIDTH * zoom
    const r = el.getBoundingClientRect()
    const left = Math.min(Math.max(r.left + r.width / 2 - width / 2, GAP), window.innerWidth - width - GAP)
    // Prefer above; flip below when there isn't room for a typical bubble.
    const above = r.top > 180 * zoom
    setPlace({ mode: 'float', left: left / zoom, top: (above ? r.top - GAP : r.bottom + GAP) / zoom, above })
  }
  const hide = () => setPlace(null)

  // The bubble is fixed to the viewport, so hide it rather than let it drift on scroll.
  useEffect(() => {
    if (!place) return
    window.addEventListener('scroll', hide, true)
    window.addEventListener('resize', hide)
    return () => {
      window.removeEventListener('scroll', hide, true)
      window.removeEventListener('resize', hide)
    }
  }, [place])

  const style =
    place?.mode === 'float'
      ? { left: place.left, top: place.top, width: WIDTH, transform: place.above ? 'translateY(-100%)' : undefined }
      : undefined

  return (
    <span
      ref={ref}
      className={className ? `tip ${className}` : 'tip'}
      tabIndex={0}
      onPointerEnter={(e) => e.pointerType === 'mouse' && show()}
      onPointerLeave={(e) => e.pointerType === 'mouse' && hide()}
      onFocus={show}
      onBlur={hide}
    >
      <span className="tip-label">{label}</span>
      {place &&
        createPortal(
          <span className={`tip-pop ${place.mode}`} role="tooltip" style={style}>
            <strong>{title}</strong>
            {children}
          </span>,
          document.body,
        )}
    </span>
  )
}

/** "查法 …" / "含义 …" style line inside a bubble. */
export function TipLine({ name, children }: { name: string; children: ReactNode }) {
  return (
    <span>
      <b>{name}</b>
      {children}
    </span>
  )
}
