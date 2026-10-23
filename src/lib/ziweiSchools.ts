// 紫微斗数流派设置, separate from the 八字 ones. Each option maps onto an
// iztro config value (see buildZiwei). Sources are summarised in docs/schools.md.

export interface ZiweiSchoolSettings {
  /** 安星法 */
  algorithm: 'default' | 'zhongzhou'
  /** 命盘年份分界 */
  yearDivide: 'normal' | 'exact'
  /** 运限年份分界 */
  horoscopeDivide: 'normal' | 'exact'
  /** 小限分界 */
  ageDivide: 'normal' | 'birthday'
  /** 晚子时 */
  dayDivide: 'current' | 'forward'
  /** 庚年四化 */
  mutagenGeng: 'yangWuYinTong' | 'yangWuTongYin' | 'yangWuFuTong'
  /** 戊年四化 */
  mutagenWu: 'tanYinBiJi' | 'tanYinYangJi'
  /** 壬年四化 */
  mutagenRen: 'liangZiZuoWu' | 'liangZiFuWu'
  /** 天马: by birth-year branch (年马) or by lunar birth month (月马) */
  tianma: 'year' | 'month'
}

export type ZiweiSchoolKey = keyof ZiweiSchoolSettings

export const DEFAULT_ZIWEI_SCHOOLS: ZiweiSchoolSettings = {
  algorithm: 'default',
  yearDivide: 'normal',
  horoscopeDivide: 'normal',
  ageDivide: 'normal',
  // iztro defaults to forward; we keep 晚子时 on the same day, like the 八字 default
  dayDivide: 'current',
  mutagenGeng: 'yangWuYinTong',
  mutagenWu: 'tanYinBiJi',
  mutagenRen: 'liangZiZuoWu',
  tianma: 'year',
}

export interface ZiweiSchoolInfo<K extends ZiweiSchoolKey = ZiweiSchoolKey> {
  title: string
  summary: string
  options: { value: ZiweiSchoolSettings[K]; label: string; source: string }[]
}

export const ZIWEI_SCHOOLS: { [K in ZiweiSchoolKey]: ZiweiSchoolInfo<K> } = {
  algorithm: {
    title: '安星法',
    summary: '通行版与中州派在命主、部分杂曜和个别安星规则上不同，主星位置相同。',
    options: [
      { value: 'default', label: '通行版', source: '《紫微斗数全书》系，多数排盘软件采用' },
      { value: 'zhongzhou', label: '中州派', source: '王亭之所传中州派：命主按年支，部分杂曜安法不同' },
    ],
  },
  yearDivide: {
    title: '命盘年份分界',
    summary: '出生在正月初一与立春之间时，生年干支按哪一天换年。',
    options: [
      { value: 'normal', label: '正月初一', source: '紫微斗数传统按农历年，iztro 默认' },
      { value: 'exact', label: '立春', source: '与八字一致，以立春换年' },
    ],
  },
  horoscopeDivide: {
    title: '运限年份分界',
    summary: '流年、小限等运限在正月初一还是立春换年。',
    options: [
      { value: 'normal', label: '正月初一', source: '按农历年，iztro 默认' },
      { value: 'exact', label: '立春', source: '以立春换年' },
    ],
  },
  ageDivide: {
    title: '小限分界',
    summary: '小限按年份交替，还是按每年生日交替。',
    options: [
      { value: 'normal', label: '按年份', source: '以年份交替，iztro 默认' },
      { value: 'birthday', label: '按生日', source: '以每年生日交替' },
    ],
  },
  dayDivide: {
    title: '晚子时',
    summary: '23:00–24:00 出生时，日期算当天还是次日。',
    options: [
      { value: 'current', label: '算当天', source: '区分早晚子时，与本站八字默认一致' },
      { value: 'forward', label: '算次日', source: '子时一到即换日，iztro 默认' },
    ],
  },
  tianma: {
    title: '天马',
    summary: '天马按生年地支还是按农历生月安。口诀相同：寅午戌马在申，申子辰马在寅，巳酉丑马在亥，亥卯未马在巳。',
    options: [
      { value: 'year', label: '按生年支（年马）', source: '《紫微斗数全书》「寅午戌人马居申」，中州派、天纪同，iztro 默认' },
      { value: 'month', label: '按生月（月马）', source: '部分门派及「安月系诸星诀」：以农历月份为准，不论节气；文墨天机等软件可选' },
    ],
  },
  mutagenGeng: {
    title: '庚年四化',
    summary: '庚干四化是最有争议的一组，主要分歧在化科、化忌落在哪颗星。',
    options: [
      { value: 'yangWuYinTong', label: '阳武阴同（太阴科、天同忌）', source: '《紫微斗数全书》通行，iztro 默认' },
      { value: 'yangWuTongYin', label: '阳武同阴（天同科、太阴忌）', source: '一说，如中州派' },
      { value: 'yangWuFuTong', label: '阳武府同（天府科、天同忌）', source: '一说' },
    ],
  },
  mutagenWu: {
    title: '戊年四化',
    summary: '戊干化科有右弼与太阳两说。',
    options: [
      { value: 'tanYinBiJi', label: '贪阴弼机（右弼科）', source: '《紫微斗数全书》通行，iztro 默认' },
      { value: 'tanYinYangJi', label: '贪阴阳机（太阳科）', source: '一说' },
    ],
  },
  mutagenRen: {
    title: '壬年四化',
    summary: '壬干化科有左辅与天府两说。',
    options: [
      { value: 'liangZiZuoWu', label: '梁紫左武（左辅科）', source: '《紫微斗数全书》通行，iztro 默认' },
      { value: 'liangZiFuWu', label: '梁紫府武（天府科）', source: '一说' },
    ],
  },
}

/** 四化 overrides for iztro: 禄、权、科、忌 star names per 天干. */
export function mutagenTable(s: ZiweiSchoolSettings): Partial<Record<string, string[]>> {
  return {
    庚: {
      yangWuYinTong: ['太阳', '武曲', '太阴', '天同'],
      yangWuTongYin: ['太阳', '武曲', '天同', '太阴'],
      yangWuFuTong: ['太阳', '武曲', '天府', '天同'],
    }[s.mutagenGeng],
    戊: { tanYinBiJi: ['贪狼', '太阴', '右弼', '天机'], tanYinYangJi: ['贪狼', '太阴', '太阳', '天机'] }[s.mutagenWu],
    壬: { liangZiZuoWu: ['天梁', '紫微', '左辅', '武曲'], liangZiFuWu: ['天梁', '紫微', '天府', '武曲'] }[s.mutagenRen],
  }
}

const STORAGE_KEY = 'chroniq-ziwei-schools'

export function loadZiweiSchools(): ZiweiSchoolSettings {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}') as Partial<ZiweiSchoolSettings>
    const merged = { ...DEFAULT_ZIWEI_SCHOOLS }
    for (const key of Object.keys(ZIWEI_SCHOOLS) as ZiweiSchoolKey[]) {
      const value = saved[key]
      if (ZIWEI_SCHOOLS[key].options.some((o) => o.value === value)) (merged as Record<string, unknown>)[key] = value
    }
    return merged
  } catch {
    return DEFAULT_ZIWEI_SCHOOLS
  }
}

export function saveZiweiSchools(settings: ZiweiSchoolSettings): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
  } catch {
    // Storage unavailable (private mode): settings last for this visit only.
  }
}
