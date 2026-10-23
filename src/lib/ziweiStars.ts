// 星曜属性: 五行 and 吉凶 category, used to colour stars on the board.
import type { ElementName } from './bazi'

/**
 * 五行 of the 14 主星 and the 14 main 辅星, following the common
 * 《紫微斗数全书》 table. Stars with two elements list the primary one
 * (贪狼 阳木/阴水 → 木, 七杀 阴金/阳火 → 金, 巨门 阴水/阴土 → 水).
 */
export const STAR_ELEMENT: Record<string, ElementName> = {
  紫微: '土', 天机: '木', 太阳: '火', 武曲: '金', 天同: '水', 廉贞: '火', 天府: '土',
  太阴: '水', 贪狼: '木', 巨门: '水', 天相: '水', 天梁: '土', 七杀: '金', 破军: '水',
  左辅: '土', 右弼: '水', 文昌: '金', 文曲: '水', 天魁: '火', 天钺: '火', 禄存: '土',
  天马: '火', 擎羊: '金', 陀罗: '金', 火星: '火', 铃星: '火', 地空: '火', 地劫: '火',
}

/** iztro star types → 吉凶 category used for colouring. */
export type StarLuck = 'major' | 'good' | 'bad' | 'neutral'

export function starLuck(type: string): StarLuck {
  switch (type) {
    case 'major':
      return 'major'
    case 'soft': // 六吉: 左辅 右弼 文昌 文曲 天魁 天钺
    case 'lucun': // 禄存
    case 'tianma': // 天马
      return 'good'
    case 'tough': // 六煞: 擎羊 陀罗 火星 铃星 地空 地劫
      return 'bad'
    default:
      return 'neutral'
  }
}
