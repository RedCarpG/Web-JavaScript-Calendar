import { SCHOOLS, optionLabel, type SchoolKey, type SchoolSettings } from '../lib/schools'

/** Small "!" that explains a result depends on a 流派 choice. Opens on hover / tap. */
export function SchoolMark({ school, settings }: { school: SchoolKey; settings: SchoolSettings }) {
  const info = SCHOOLS[school]
  return (
    <span className="school-mark">
      <button type="button" aria-label={`流派差异：${info.title}`}>!</button>
      <span className="school-pop" role="tooltip">
        <strong>{info.title}</strong>
        <span>{info.summary}</span>
        <span>
          当前：<b>{optionLabel(school, settings)}</b>（可在「流派设置」中更改）
        </span>
      </span>
    </span>
  )
}

interface SchoolRegistryEntry {
  title: string
  summary: string
  options: { value: string; label: string; source: string }[]
}

/**
 * Selects for every rule in a 流派 registry (八字 SCHOOLS by default, or the
 * 紫微 ZIWEI_SCHOOLS), each with its summary and the chosen option's source.
 */
export function SchoolSettingsPanel<S extends { [K in keyof S]: string }>({
  settings,
  onChange,
  registry = SCHOOLS as unknown as Record<keyof S, SchoolRegistryEntry>,
}: {
  settings: S
  onChange: (settings: S) => void
  registry?: Record<keyof S, SchoolRegistryEntry>
}) {
  return (
    <div className="school-panel">
      {(Object.keys(registry) as (keyof S & string)[]).map((key) => {
        const info = registry[key]
        const current = info.options.find((o) => o.value === settings[key])
        return (
          <label key={key} className="school-item">
            <span className="school-title">{info.title}</span>
            <select
              value={settings[key]}
              onChange={(e) => onChange({ ...settings, [key]: e.target.value })}
            >
              {info.options.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            <small className="muted">{info.summary}</small>
            {current && <small className="school-source">出处：{current.source}</small>}
          </label>
        )
      })}
    </div>
  )
}
