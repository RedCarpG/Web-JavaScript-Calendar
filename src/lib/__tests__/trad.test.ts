import { describe, expect, it } from 'vitest'
import { expectedTrad } from '../../../scripts/opencc'
import { collectTerms } from '../../../scripts/terms'
import { toTrad } from '../trad'

describe('繁體 terms', () => {
  // A short year span keeps this fast; name tables are still complete.
  // If this fails after adding UI terms, run `npm run gen:trad`.
  const terms = collectTerms([2024, 2025])

  it('matches OpenCC (plus overrides) for every displayed term', () => {
    const wrong = terms.filter((term) => toTrad(term) !== expectedTrad(term)).map((term) => `${term} → ${toTrad(term)} (expected ${expectedTrad(term)})`)
    expect(wrong).toEqual([])
  })

  it('keeps 干支 and 命理 usage', () => {
    expect(toTrad('丑午相害')).toBe('丑午相害')
    expect(toTrad('子午相冲')).toBe('子午相沖')
    expect(toTrad('藏干')).toBe('藏干')
    expect(toTrad('天后')).toBe('天后')
    expect(toTrad('益后')).toBe('益後')
    expect(toTrad('时契')).toBe('時契')
    expect(toTrad('天乙贵人')).toBe('天乙貴人')
  })
})
