import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import type { Pillar } from '../lib/bazi'
import type { Relation } from '../lib/relations'

// Hover highlighting inside one chart section (原局 or 岁运盘): a 天干/地支
// lights up the pillars it 刑冲合会 with and those relation chips; a chip
// lights up its pillars; a 十神 lights up every 十神 of the same name.

type Part = 'stem' | 'branch'
export type Hover =
  | { kind: 'cell'; pillar: string; part: Part }
  | { kind: 'rel'; index: number }
  | { kind: 'star'; name: string }
  | null

interface HighlightState {
  hover: Hover
  setHover: (h: Hover) => void
  /** "pillarLabel|part" of every highlighted 干支 cell */
  cells: Set<string>
  /** Indexes into the scope's relations */
  rels: Set<number>
  star: string | null
}

const HighlightContext = createContext<HighlightState | null>(null)

/** Relations name natal pillars by their first character (年柱 → 年) and 岁运 columns in full. */
const relationLabel = (pillarLabel: string) => (pillarLabel.endsWith('柱') ? pillarLabel[0] : pillarLabel)

export function HighlightScope({ pillars, relations, children }: { pillars: Pillar[]; relations: Relation[]; children: ReactNode }) {
  const [hover, setHover] = useState<Hover>(null)

  const value = useMemo<HighlightState>(() => {
    const byRelLabel = new Map(pillars.map((p) => [relationLabel(p.label), p.label]))
    const cells = new Set<string>()
    const rels = new Set<number>()
    const addRel = (i: number) => {
      rels.add(i)
      for (const m of relations[i].members) {
        const label = byRelLabel.get(m)
        if (label) cells.add(`${label}|${relations[i].on}`)
      }
    }
    if (hover?.kind === 'cell') {
      cells.add(`${hover.pillar}|${hover.part}`)
      const own = relationLabel(hover.pillar)
      relations.forEach((r, i) => r.on === hover.part && r.members.includes(own) && addRel(i))
    } else if (hover?.kind === 'rel') {
      addRel(hover.index)
    }
    return { hover, setHover, cells, rels, star: hover?.kind === 'star' ? hover.name : null }
  }, [hover, pillars, relations])

  return <HighlightContext.Provider value={value}>{children}</HighlightContext.Provider>
}

const noop: HighlightState = { hover: null, setHover: () => {}, cells: new Set(), rels: new Set(), star: null }
export const useHighlight = () => useContext(HighlightContext) ?? noop

/**
 * Props that make an element a highlight trigger. Mouse: hover. Touch and
 * keyboard: focus (a tap focuses; tapping elsewhere blurs and clears).
 * There is deliberately no click handler: focus already fires on click, and
 * toggling there would undo it.
 */
export function useTrigger(target: Exclude<Hover, null>) {
  const { setHover } = useHighlight()
  return {
    tabIndex: 0,
    onPointerEnter: (e: React.PointerEvent) => e.pointerType === 'mouse' && setHover(target),
    onPointerLeave: (e: React.PointerEvent) => e.pointerType === 'mouse' && setHover(null),
    onFocus: () => setHover(target),
    onBlur: () => setHover(null),
  }
}
