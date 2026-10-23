import { useState } from 'react'
import type { BaziInput } from '../lib/bazi'
import type { SchoolSettings } from '../lib/schools'
import { CITIES } from '../lib/solarTime'
import { SavedCharts } from './SavedCharts'
import { SchoolSettingsPanel } from './Schools'

interface Props {
  input: BaziInput
  onChange: (input: BaziInput) => void
  schools: SchoolSettings
  onSchoolsChange: (schools: SchoolSettings) => void
}

const pad = (n: number) => String(n).padStart(2, '0')

/** Birth date/time, gender, 真太阳时, 流派设置 and saved charts — shared by 八字 and 紫微. */
export function BirthForm({ input, onChange, schools, onSchoolsChange }: Props) {
  const [showSchools, setShowSchools] = useState(false)
  const city = CITIES.find((c) => c.longitude === input.longitude)
  const dateValue = `${input.year}-${pad(input.month)}-${pad(input.day)}`
  const timeValue = `${pad(input.hour)}:${pad(input.minute)}`
  const change = (patch: Partial<BaziInput>) => onChange({ ...input, ...patch })

  return (
    <section className="card bazi-form">
      <label>
        出生日期
        <input
          type="date"
          min="1900-01-01"
          max="2100-12-31"
          value={dateValue}
          onChange={(e) => {
            const [y, m, d] = e.target.value.split('-').map(Number)
            if (y >= 1900 && y <= 2100) change({ year: y, month: m, day: d })
          }}
        />
      </label>
      <label>
        出生时间
        <input
          type="time"
          value={timeValue}
          onChange={(e) => {
            const [h, mi] = e.target.value.split(':').map(Number)
            if (!Number.isNaN(h)) change({ hour: h, minute: mi })
          }}
        />
      </label>
      <div className="seg" role="group" aria-label="性别">
        {(['男', '女'] as const).map((g, i) => (
          <button
            key={g}
            className={input.gender === 1 - i ? 'on' : undefined}
            onClick={() => change({ gender: (1 - i) as 0 | 1 })}
          >
            {g}
          </button>
        ))}
      </div>
      <label className="check">
        <input
          type="checkbox"
          checked={input.longitude != null}
          onChange={(e) => change({ longitude: e.target.checked ? CITIES[0].longitude : undefined })}
        />
        真太阳时
      </label>
      {input.longitude != null && (
        <>
          <label>
            出生地
            <select
              value={city?.name ?? ''}
              onChange={(e) => {
                const c = CITIES.find((x) => x.name === e.target.value)
                if (c) change({ longitude: c.longitude })
              }}
            >
              {!city && <option value="">自定义</option>}
              {CITIES.map((c) => (
                <option key={c.name} value={c.name}>{c.name}</option>
              ))}
            </select>
          </label>
          <label>
            东经
            <input
              type="number"
              className="narrow"
              min={73}
              max={135}
              step={0.01}
              value={input.longitude}
              onChange={(e) => {
                const v = Number(e.target.value)
                if (e.target.value !== '' && v >= -180 && v <= 180) change({ longitude: v })
              }}
            />
          </label>
        </>
      )}
      <button
        type="button"
        className={`ghost${showSchools ? ' on' : ''}`}
        aria-expanded={showSchools}
        onClick={() => setShowSchools((v) => !v)}
      >
        流派设置
      </button>
      {showSchools && <SchoolSettingsPanel settings={schools} onChange={onSchoolsChange} />}
      <SavedCharts input={input} onLoad={(next) => change(next)} />
    </section>
  )
}
