import { useLayoutEffect, useRef, type RefObject } from 'react'

const EASE = 'cubic-bezier(0.33, 1, 0.68, 1)'

/**
 * When a table's columns come and go, slides the cells that stay from where
 * they were to where they are now, and fades the new ones in (FLIP). Cells are
 * the elements with data-col inside ref, matched by data-col and row.
 * Positions are layout offsets, which ignore running transforms, so a
 * re-render mid-slide (a hover highlight, say) does not restart anything.
 */
export function useColumnFlip(ref: RefObject<HTMLElement | null>, enabled = true) {
  const prev = useRef<Map<string, [number, number]> | null>(null)
  useLayoutEffect(() => {
    const root = ref.current
    if (!root || !enabled) return
    const cells = [...root.querySelectorAll<HTMLElement>('[data-col]')]
    const keyOf = (el: HTMLElement) => `${el.dataset.col}|${(el.parentElement as HTMLTableRowElement).rowIndex}`
    const now = new Map(cells.map((el) => [keyOf(el), [el.offsetLeft, el.offsetTop] as [number, number]]))
    const old = prev.current
    prev.current = now
    if (!old || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    for (const el of cells) {
      const key = keyOf(el)
      const from = old.get(key)
      const [x, y] = now.get(key)!
      if (!from) {
        el.animate([{ opacity: 0, transform: 'translateY(-6px)' }, { opacity: 1, transform: 'none' }], {
          duration: 350,
          delay: 120,
          easing: EASE,
          fill: 'backwards',
        })
      } else if (Math.abs(from[0] - x) > 0.5 || Math.abs(from[1] - y) > 0.5) {
        el.animate([{ transform: `translate(${from[0] - x}px, ${from[1] - y}px)` }, { transform: 'none' }], {
          duration: 450,
          easing: EASE,
        })
      }
    }
  })
}
