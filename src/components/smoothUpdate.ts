import { flushSync } from 'react-dom'

let latest = 0

/**
 * Runs a state update inside a view transition, tagged on <html data-vt> with
 * its kind so styles.css can say what animates for it (a page switch slides;
 * a 紫微 运限 or 星盘 行运/推运 change crossfades its blocks). Without view
 * transitions, or with reduced motion, it just updates.
 */
export function smoothUpdate(kind: string, update: () => void) {
  if (!document.startViewTransition || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    update()
    return
  }
  const root = document.documentElement
  const id = ++latest
  root.dataset.vt = kind
  // The transition waits for a painted frame before updating; if none comes
  // soon (a page that is not being drawn), skip it and update anyway.
  let updated = false
  const transition = document.startViewTransition(() => {
    if (updated) return
    updated = true
    flushSync(update)
  })
  setTimeout(() => {
    if (updated) return
    updated = true
    transition.skipTransition()
    update()
  }, 300)
  transition.finished.finally(() => {
    if (id === latest) delete root.dataset.vt
  })
}
