import { useState } from 'react'
import type { BaziInput } from '../lib/bazi'
import { loadCharts, sameInput, saveCharts, upsertChart, type SavedChart } from '../lib/savedCharts'

/** Row of saved charts: name + 保存, then chips to load or delete. */
export function SavedCharts({ input, onLoad }: { input: BaziInput; onLoad: (input: BaziInput) => void }) {
  const [charts, setCharts] = useState<SavedChart[]>(loadCharts)
  const active = charts.find((c) => sameInput(c.input, input))
  const [name, setName] = useState('')

  const update = (next: SavedChart[]) => {
    setCharts(next)
    saveCharts(next)
  }
  const save = () => {
    const finalName = name.trim() || active?.name || `命盘${charts.length + 1}`
    update(upsertChart(charts, finalName, input))
    setName('')
  }

  return (
    <div className="saved-charts">
      <form
        className="saved-form"
        onSubmit={(e) => {
          e.preventDefault()
          save()
        }}
      >
        <input
          aria-label="命盘名称"
          placeholder={active ? `已保存为「${active.name}」` : '命盘名称（可选）'}
          maxLength={20}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button type="submit" className="ghost">
          {name.trim() && charts.some((c) => c.name === name.trim()) ? '更新' : '保存'}
        </button>
      </form>
      {charts.length > 0 && (
        <div className="chips" role="list" aria-label="已保存的命盘">
          {charts.map((c) => (
            <span key={c.id} role="listitem" className={`chip${c === active ? ' on' : ''}`}>
              <button type="button" className="chip-main" onClick={() => onLoad(c.input)} title={describe(c.input)}>
                {c.name}
              </button>
              <button
                type="button"
                className="chip-x"
                aria-label={`删除${c.name}`}
                onClick={() => update(charts.filter((x) => x !== c))}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}
      <small className="muted">命盘只保存在本机浏览器中，不会上传。</small>
    </div>
  )
}

const pad = (n: number) => String(n).padStart(2, '0')
const describe = (i: BaziInput) =>
  `${i.year}-${pad(i.month)}-${pad(i.day)} ${pad(i.hour)}:${pad(i.minute)} ${i.gender === 1 ? '男' : '女'}`
