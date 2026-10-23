// 真太阳时 = 北京时间 + 经度差（每度 4 分钟，以东经 120° 为基准）+ 均时差.

export interface City {
  name: string
  longitude: number
}

export const CITIES: City[] = [
  { name: '北京', longitude: 116.41 },
  { name: '上海', longitude: 121.47 },
  { name: '天津', longitude: 117.2 },
  { name: '重庆', longitude: 106.55 },
  { name: '哈尔滨', longitude: 126.53 },
  { name: '长春', longitude: 125.32 },
  { name: '沈阳', longitude: 123.43 },
  { name: '呼和浩特', longitude: 111.75 },
  { name: '石家庄', longitude: 114.51 },
  { name: '太原', longitude: 112.55 },
  { name: '济南', longitude: 117.0 },
  { name: '郑州', longitude: 113.62 },
  { name: '西安', longitude: 108.94 },
  { name: '兰州', longitude: 103.83 },
  { name: '银川', longitude: 106.23 },
  { name: '西宁', longitude: 101.78 },
  { name: '乌鲁木齐', longitude: 87.62 },
  { name: '拉萨', longitude: 91.13 },
  { name: '成都', longitude: 104.07 },
  { name: '贵阳', longitude: 106.63 },
  { name: '昆明', longitude: 102.83 },
  { name: '南宁', longitude: 108.37 },
  { name: '武汉', longitude: 114.31 },
  { name: '长沙', longitude: 112.94 },
  { name: '南昌', longitude: 115.86 },
  { name: '合肥', longitude: 117.23 },
  { name: '南京', longitude: 118.8 },
  { name: '杭州', longitude: 120.16 },
  { name: '福州', longitude: 119.3 },
  { name: '广州', longitude: 113.26 },
  { name: '深圳', longitude: 114.06 },
  { name: '海口', longitude: 110.35 },
  { name: '香港', longitude: 114.17 },
  { name: '澳门', longitude: 113.54 },
  { name: '台北', longitude: 121.56 },
]

export interface WallTime {
  year: number
  month: number
  day: number
  hour: number
  minute: number
}

/** Equation of time in minutes (approximation accurate to about ±1 min). */
export function equationOfTime(year: number, month: number, day: number): number {
  const dayOfYear = (Date.UTC(year, month - 1, day) - Date.UTC(year, 0, 0)) / 86_400_000
  const b = (2 * Math.PI * (dayOfYear - 81)) / 364
  return 9.87 * Math.sin(2 * b) - 7.53 * Math.cos(b) - 1.5 * Math.sin(b)
}

/** Convert Beijing time (UTC+8) at the given longitude to apparent solar time. */
export function toTrueSolarTime(t: WallTime, longitude: number): { time: WallTime; offsetMinutes: number } {
  const offsetMinutes = (longitude - 120) * 4 + equationOfTime(t.year, t.month, t.day)
  // Work in UTC so the host time zone never interferes.
  const d = new Date(Date.UTC(t.year, t.month - 1, t.day, t.hour, t.minute) + Math.round(offsetMinutes) * 60_000)
  return {
    time: {
      year: d.getUTCFullYear(),
      month: d.getUTCMonth() + 1,
      day: d.getUTCDate(),
      hour: d.getUTCHours(),
      minute: d.getUTCMinutes(),
    },
    offsetMinutes,
  }
}
