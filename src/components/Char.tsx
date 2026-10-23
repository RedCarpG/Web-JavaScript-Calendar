import type { Glyph } from '../lib/bazi'

/** A 天干/地支 character coloured by its 五行. */
export function Char({ g, small }: { g: Glyph; small?: boolean }) {
  return (
    <span className={`char el-${g.element}${small ? ' small' : ''}`} title={g.element}>
      {g.char}
    </span>
  )
}
