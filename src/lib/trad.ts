import { TRAD_CHARS } from './tradChars'
import { TRAD_TERMS } from './tradOverrides'

/** 简体 → 繁體 for proper nouns (干支, 神煞, 节气 …), using the generated map. */
export function toTrad(s: string): string {
  const whole = TRAD_TERMS[s]
  if (whole) return whole
  let out = ''
  for (const c of s) out += TRAD_CHARS[c] ?? c
  return out
}
