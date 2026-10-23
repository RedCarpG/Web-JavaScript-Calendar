import { Suspense, lazy, useEffect, useState } from 'react'
import { CalendarView } from './components/CalendarView'
import { BaziView } from './components/BaziView'
import { AboutBadges } from './components/AboutBadges'
import { Logo } from './components/Logo'
import { SavedChartsDrawer } from './components/SavedCharts'
import { SettingsMenu } from './components/SettingsMenu'
import type { BaziInput } from './lib/bazi'
import { loadLastInput, saveLastInput } from './lib/savedCharts'
import { loadSchools, saveSchools, type SchoolSettings } from './lib/schools'
import { loadZiweiSchools, saveZiweiSchools, type ZiweiSchoolSettings } from './lib/ziweiSchools'
import {
  loadStarPlace,
  loadStarSettings,
  saveStarPlace,
  saveStarSettings,
  type StarPlace,
  type StarSettings,
} from './lib/starPrefs'
import { applyScale, applyTheme, loadSettings, saveSettings, type Settings } from './lib/settings'
import { toTrad } from './lib/trad'
import { SettingsContext } from './settingsContext'

type Tab = 'calendar' | 'bazi' | 'ziwei' | 'star'

// 紫微斗数 pulls in iztro (~150 KB gzip); load it only when the tab is opened.
const ZiweiView = lazy(() => import('./components/ZiweiView').then((m) => ({ default: m.ZiweiView })))
// 星盘 pulls in astronomy-engine; likewise only loaded when its tab opens.
const StarChartView = lazy(() => import('./components/StarChartView').then((m) => ({ default: m.StarChartView })))

export function App() {
  const [tab, setTab] = useState<Tab>('calendar')
  const [baziInput, setBaziInput] = useState<BaziInput>(() => {
    const last = loadLastInput()
    if (last) return last
    const now = new Date()
    return {
      year: now.getFullYear(),
      month: now.getMonth() + 1,
      day: now.getDate(),
      hour: now.getHours(),
      minute: now.getMinutes(),
      gender: 1,
    }
  })
  // Remember the latest birth data so the chart is back after a reload.
  useEffect(() => saveLastInput(baziInput), [baziInput])
  const [schools, setSchools] = useState<SchoolSettings>(loadSchools)
  const changeSchools = (next: SchoolSettings) => {
    setSchools(next)
    saveSchools(next)
  }
  // Loading a saved chart remounts the 八字 / 紫微 view so its 运 picks start fresh.
  const [loads, setLoads] = useState(0)
  const loadChart = (next: BaziInput) => {
    setBaziInput(next)
    setLoads((n) => n + 1)
  }
  const [starSettings, setStarSettings] = useState<StarSettings>(loadStarSettings)
  const changeStarSettings = (next: StarSettings) => {
    setStarSettings(next)
    saveStarSettings(next)
  }
  const [starPlace, setStarPlace] = useState<StarPlace>(() => loadStarPlace(baziInput.longitude))
  const changeStarPlace = (next: StarPlace) => {
    setStarPlace(next)
    saveStarPlace(next)
  }
  const [ziweiSchools, setZiweiSchools] = useState<ZiweiSchoolSettings>(loadZiweiSchools)
  const changeZiweiSchools = (next: ZiweiSchoolSettings) => {
    setZiweiSchools(next)
    saveZiweiSchools(next)
  }
  const [settings, setSettings] = useState<Settings>(loadSettings)
  const changeSettings = (next: Settings) => {
    setSettings(next)
    saveSettings(next)
  }
  useEffect(() => applyTheme(settings.theme), [settings.theme])
  useEffect(() => applyScale(settings.uiScale), [settings.uiScale])
  const term = settings.script === 'trad' ? toTrad : (s: string) => s

  return (
    <SettingsContext.Provider value={settings}>
      <div className="app">
        <header className="topbar">
          <h1>
            <Logo />
            星曆
            <span className="brand-en">ChroniQ</span>
          </h1>
          <div className="topbar-right">
            <nav className="tabs">
              <button className={tab === 'calendar' ? 'on' : undefined} onClick={() => setTab('calendar')}>
                {term('日历')}
              </button>
              <button className={tab === 'bazi' ? 'on' : undefined} onClick={() => setTab('bazi')}>
                {term('八字排盘')}
              </button>
              <button className={tab === 'ziwei' ? 'on' : undefined} onClick={() => setTab('ziwei')}>
                {term('紫微斗数')}
              </button>
              <button className={tab === 'star' ? 'on' : undefined} onClick={() => setTab('star')}>
                {term('星盘')}
              </button>
            </nav>
            <SettingsMenu settings={settings} onChange={changeSettings} />
          </div>
        </header>
        <main>
          {tab === 'calendar' ? (
            <CalendarView
              onPickBazi={(day) => {
                setBaziInput((prev) => ({ ...prev, year: day.getYear(), month: day.getMonth(), day: day.getDay() }))
                setTab('bazi')
              }}
            />
          ) : tab === 'bazi' ? (
            <BaziView
              key={loads}
              input={baziInput}
              onChange={setBaziInput}
              schools={schools}
              onSchoolsChange={changeSchools}
            />
          ) : tab === 'star' ? (
            <Suspense fallback={<div className="card muted">正在加载星盘…</div>}>
              <StarChartView
                key={loads}
                input={baziInput}
                onChange={setBaziInput}
                place={starPlace}
                onPlaceChange={changeStarPlace}
                settings={starSettings}
                onSettingsChange={changeStarSettings}
              />
            </Suspense>
          ) : (
            <Suspense fallback={<div className="card muted">正在加载紫微斗数…</div>}>
              <ZiweiView
                key={loads}
                input={baziInput}
                onChange={setBaziInput}
                schools={ziweiSchools}
                onSchoolsChange={changeZiweiSchools}
              />
            </Suspense>
          )}
        </main>
        <footer className="muted">
          <span>
            历法数据由 <a href="https://github.com/6tail/tyme4ts">tyme4ts</a> 提供 · 仅供参考
          </span>
          <AboutBadges />
        </footer>
      </div>
      {/* Outside .app: the drawer is fixed to the screen edge and takes the zoom itself */}
      {tab !== 'calendar' && <SavedChartsDrawer input={baziInput} onLoad={loadChart} />}
    </SettingsContext.Provider>
  )
}
