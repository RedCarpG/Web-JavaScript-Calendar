// Where 命理/黄历 usage differs from OpenCC's general-purpose conversion.

/** Per-character overrides, applied everywhere. */
export const TRAD_OVERRIDES: Record<string, string> = {
  // 相冲、六冲: 命理写作「沖」, OpenCC 一般转为「衝」
  冲: '沖',
  // 地支「丑」不作「醜」(OpenCC 会把「丑午相害」里的丑转成醜)
  丑: '丑',
  // 天干、藏干的「干」不作「幹」
  干: '干',
  // 上梁、作梁指房梁: 统一作「樑」
  梁: '樑',
  // 「后」按词处理, 见 TRAD_TERMS
  后: '后',
}

/** Whole-term overrides for characters that depend on the word. */
export const TRAD_TERMS: Record<string, string> = {
  益后: '益後', // 益及后代; 「天后」仍作「后」
}
