// App-wide display settings, kept per viewer in localStorage.

export interface Settings {
  theme: 'system' | 'light' | 'dark'
  /** 专有名词字形 */
  script: 'trad' | 'simp'
  weekStart: 'mon' | 'sun'
  /** 日历格子里显示日干支 */
  dayGanzhi: 'show' | 'hide'
  /** 紫微星曜配色 */
  ziweiColor: 'element' | 'luck'
}

export const DEFAULT_SETTINGS: Settings = { theme: 'system', script: 'trad', weekStart: 'mon', dayGanzhi: 'show', ziweiColor: 'element' }

export const SETTING_OPTIONS: { [K in keyof Settings]: { title: string; options: { value: Settings[K]; label: string }[] } } = {
  theme: {
    title: '颜色模式',
    options: [
      { value: 'system', label: '跟随系统' },
      { value: 'light', label: '浅色' },
      { value: 'dark', label: '深色' },
    ],
  },
  script: {
    title: '专有名词',
    options: [
      { value: 'trad', label: '繁體' },
      { value: 'simp', label: '简体' },
    ],
  },
  weekStart: {
    title: '每周起始',
    options: [
      { value: 'mon', label: '周一' },
      { value: 'sun', label: '周日' },
    ],
  },
  dayGanzhi: {
    title: '日历显示日干支',
    options: [
      { value: 'show', label: '显示' },
      { value: 'hide', label: '隐藏' },
    ],
  },
  ziweiColor: {
    title: '紫微星曜配色',
    options: [
      { value: 'element', label: '按五行' },
      { value: 'luck', label: '按吉凶' },
    ],
  },
}

const STORAGE_KEY = 'chroniq-settings'

export function loadSettings(): Settings {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}') as Partial<Settings>
    const merged = { ...DEFAULT_SETTINGS }
    for (const key of Object.keys(SETTING_OPTIONS) as (keyof Settings)[]) {
      const value = saved[key]
      if (SETTING_OPTIONS[key].options.some((o) => o.value === value)) (merged as Record<string, unknown>)[key] = value
    }
    return merged
  } catch {
    return DEFAULT_SETTINGS
  }
}

export function saveSettings(settings: Settings): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
  } catch {
    // Storage unavailable (private mode): settings last for this visit only.
  }
}

/** Apply the colour mode to <html>; "system" leaves it to prefers-color-scheme. */
export function applyTheme(theme: Settings['theme']): void {
  const root = document.documentElement
  if (theme === 'system') delete root.dataset.theme
  else root.dataset.theme = theme
}
