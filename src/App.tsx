import { useState } from 'react'
import { CalendarView } from './components/CalendarView'
import { BaziView } from './components/BaziView'
import type { BaziInput } from './lib/bazi'
import { loadSchools, saveSchools, type SchoolSettings } from './lib/schools'

type Tab = 'calendar' | 'bazi'

export function App() {
  const [tab, setTab] = useState<Tab>('calendar')
  const [baziInput, setBaziInput] = useState<BaziInput>(() => {
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
  const [schools, setSchools] = useState<SchoolSettings>(loadSchools)
  const changeSchools = (next: SchoolSettings) => {
    setSchools(next)
    saveSchools(next)
  }

  return (
    <div className="app">
      <header className="topbar">
        <h1>
          时契<span className="brand-en">ChroniQ</span>
        </h1>
        <nav className="tabs">
          <button className={tab === 'calendar' ? 'on' : undefined} onClick={() => setTab('calendar')}>
            日历
          </button>
          <button className={tab === 'bazi' ? 'on' : undefined} onClick={() => setTab('bazi')}>
            八字排盘
          </button>
        </nav>
      </header>
      <main>
        {tab === 'calendar' ? (
          <CalendarView
            onPickBazi={(day) => {
              setBaziInput((prev) => ({ ...prev, year: day.getYear(), month: day.getMonth(), day: day.getDay() }))
              setTab('bazi')
            }}
          />
        ) : (
          <BaziView input={baziInput} onChange={setBaziInput} schools={schools} onSchoolsChange={changeSchools} />
        )}
      </main>
      <footer className="muted">
        历法数据由 <a href="https://github.com/6tail/tyme4ts">tyme4ts</a> 提供 · 仅供参考
      </footer>
    </div>
  )
}
