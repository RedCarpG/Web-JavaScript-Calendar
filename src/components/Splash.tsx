import { useEffect, useRef, useState, useSyncExternalStore } from 'react'

/** A loading screen stays at least this long, so a quick load fades in and out instead of flashing. */
export const SPLASH_MIN_MS = 900
/** How long the loading screen takes to fade out (matches .splash.done in index.html) */
export const SPLASH_FADE_MS = 400

// How many <SplashSignal>s (Suspense fallbacks) are showing right now.
let pending = 0
const listeners = new Set<() => void>()
const emit = () => listeners.forEach((l) => l())
const subscribe = (l: () => void) => {
  listeners.add(l)
  return () => listeners.delete(l)
}

/** Suspense fallback: while it is mounted, <SplashOverlay> shows the loading screen. */
export function SplashSignal() {
  useEffect(() => {
    pending++
    emit()
    return () => {
      pending--
      emit()
    }
  }, [])
  return null
}

/**
 * The loading screen while a tab's code loads: it fades in when a
 * <SplashSignal> appears, and fades out once they are all gone, but never
 * before SPLASH_MIN_MS.
 */
export function SplashOverlay() {
  const loading = useSyncExternalStore(subscribe, () => pending > 0)
  const [shown, setShown] = useState(false)
  const [leaving, setLeaving] = useState(false)
  const since = useRef(0)
  useEffect(() => {
    if (loading) {
      if (!shown) since.current = performance.now()
      setShown(true)
      setLeaving(false)
      return
    }
    if (!shown) return
    const wait = Math.max(0, SPLASH_MIN_MS - (performance.now() - since.current))
    const fade = setTimeout(() => setLeaving(true), wait)
    const hide = setTimeout(() => setShown(false), wait + SPLASH_FADE_MS)
    return () => {
      clearTimeout(fade)
      clearTimeout(hide)
    }
  }, [loading, shown])
  return shown ? <Splash leaving={leaving} /> : null
}

/**
 * The 星曆 loading screen. It is the same as the #splash in index.html (shown
 * until the app first mounts), whose inline <style> styles both.
 */
function Splash({ leaving }: { leaving: boolean }) {
  return (
    <div className={`splash fade-in${leaving ? ' done' : ''}`} role="status" aria-label="正在加载">
      <svg className="splash-mark" viewBox="0 0 64 64" aria-hidden="true">
        <g className="splash-ring">
          <circle cx="32" cy="32" r="23" fill="none" stroke="var(--splash-line)" strokeWidth="1.2" />
          <ellipse
            cx="32"
            cy="32"
            rx="27"
            ry="11"
            fill="none"
            stroke="var(--splash-line)"
            strokeWidth=".9"
            transform="rotate(-35 32 32)"
          />
        </g>
        <path
          className="splash-star"
          d="M32 18 L35.5 28.5 L46 32 L35.5 35.5 L32 46 L28.5 35.5 L18 32 L28.5 28.5 Z"
          fill="var(--splash-star)"
        />
        <circle cx="32" cy="32" r="3" fill="var(--splash-line)" />
      </svg>
      <div className="splash-title">星曆</div>
      <div className="splash-en">ChroniQ</div>
      <div className="splash-tag">觀星象 · 知曆數 · 察時變</div>
    </div>
  )
}
