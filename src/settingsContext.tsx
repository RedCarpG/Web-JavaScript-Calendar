import { createContext, useContext } from 'react'
import { DEFAULT_SETTINGS, type Settings } from './lib/settings'
import { toTrad } from './lib/trad'

export const SettingsContext = createContext<Settings>(DEFAULT_SETTINGS)

export const useSettings = () => useContext(SettingsContext)

/**
 * Returns t(term): the term in the chosen script. Use it only for proper nouns
 * (干支, 神煞, 十神, 节气 …); explanatory text stays as written. Literal
 * t('…') calls are picked up by scripts/terms.ts, so keep them on one line.
 */
export function useT(): (term: string) => string {
  const { script } = useSettings()
  return script === 'trad' ? toTrad : (s) => s
}
