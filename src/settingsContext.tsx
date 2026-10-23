import { createContext, useContext } from 'react'
import { DEFAULT_SETTINGS, type Settings } from './lib/settings'
import { toTrad } from './lib/trad'

export const SettingsContext = createContext<Settings>(DEFAULT_SETTINGS)

export const useSettings = () => useContext(SettingsContext)

/**
 * Returns term(s): a proper noun (干支, 神煞, 十神, 节气 …) in the chosen script.
 * Proper nouns stay Chinese whatever the UI language; explanatory text does
 * not go through term(). Literal term('…') calls are picked up by
 * scripts/terms.ts, so keep each on one line.
 */
export function useTerm(): (term: string) => string {
  const { script } = useSettings()
  return script === 'trad' ? toTrad : (s) => s
}
