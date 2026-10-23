import { useEffect, type RefObject } from 'react'

/**
 * For horizontally scrolling rows inside ref (those matching selector, or ref
 * itself when selector is omitted):
 * - marks them .can-left / .can-right while there is more to scroll that way,
 *   which styles.css turns into faded edges;
 * - when key changes, scrolls each row so its .selected chip (else .current)
 *   sits in the middle, without moving the page.
 */
export function useScrollHints(ref: RefObject<HTMLElement | null>, key: unknown, selector?: string) {
  useEffect(() => {
    const root = ref.current
    if (!root) return
    const rows = selector ? [...root.querySelectorAll<HTMLElement>(selector)] : [root]
    const mark = (row: HTMLElement) => {
      const max = row.scrollWidth - row.clientWidth
      row.classList.toggle('can-left', row.scrollLeft > 1)
      row.classList.toggle('can-right', row.scrollLeft < max - 1)
    }
    for (const row of rows) {
      const chip = row.querySelector<HTMLElement>('.selected') ?? row.querySelector<HTMLElement>('.current')
      if (chip && row.scrollWidth > row.clientWidth) {
        // offsetLeft is relative to the row (position: relative in CSS), in layout px
        row.scrollLeft = chip.offsetLeft - (row.clientWidth - chip.offsetWidth) / 2
      }
      mark(row)
    }
    const onScroll = (e: Event) => mark(e.currentTarget as HTMLElement)
    const onResize = () => rows.forEach(mark)
    rows.forEach((row) => row.addEventListener('scroll', onScroll, { passive: true }))
    window.addEventListener('resize', onResize)
    return () => {
      rows.forEach((row) => row.removeEventListener('scroll', onScroll))
      window.removeEventListener('resize', onResize)
    }
  }, [ref, key, selector])
}
