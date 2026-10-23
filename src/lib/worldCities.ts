// Overseas birthplaces for 星盘: major cities with coordinates and the IANA
// zone their local times are recorded in. Coordinates are city centres,
// rounded to 0.01°; latitude north / longitude east positive.
import type { City } from './solarTime'

type WorldCity = Required<City>

const c = (name: string, latitude: number, longitude: number, timeZone: string): WorldCity => ({
  name,
  latitude,
  longitude,
  timeZone,
})

export const WORLD_CITIES: { region: string; cities: WorldCity[] }[] = [
  {
    region: '亚洲',
    cities: [
      c('东京', 35.68, 139.69, 'Asia/Tokyo'),
      c('大阪', 34.69, 135.5, 'Asia/Tokyo'),
      c('首尔', 37.57, 126.98, 'Asia/Seoul'),
      c('乌兰巴托', 47.89, 106.91, 'Asia/Ulaanbaatar'),
      c('新加坡', 1.35, 103.82, 'Asia/Singapore'),
      c('吉隆坡', 3.14, 101.69, 'Asia/Kuala_Lumpur'),
      c('曼谷', 13.76, 100.5, 'Asia/Bangkok'),
      c('河内', 21.03, 105.85, 'Asia/Ho_Chi_Minh'),
      c('胡志明市', 10.82, 106.63, 'Asia/Ho_Chi_Minh'),
      c('马尼拉', 14.6, 120.98, 'Asia/Manila'),
      c('雅加达', -6.21, 106.85, 'Asia/Jakarta'),
      c('新德里', 28.61, 77.21, 'Asia/Kolkata'),
      c('孟买', 19.08, 72.88, 'Asia/Kolkata'),
      c('迪拜', 25.2, 55.27, 'Asia/Dubai'),
    ],
  },
  {
    region: '欧洲',
    cities: [
      c('伦敦', 51.51, -0.13, 'Europe/London'),
      c('都柏林', 53.35, -6.26, 'Europe/Dublin'),
      c('巴黎', 48.86, 2.35, 'Europe/Paris'),
      c('柏林', 52.52, 13.4, 'Europe/Berlin'),
      c('法兰克福', 50.11, 8.68, 'Europe/Berlin'),
      c('慕尼黑', 48.14, 11.58, 'Europe/Berlin'),
      c('阿姆斯特丹', 52.37, 4.9, 'Europe/Amsterdam'),
      c('布鲁塞尔', 50.85, 4.35, 'Europe/Brussels'),
      c('苏黎世', 47.38, 8.54, 'Europe/Zurich'),
      c('维也纳', 48.21, 16.37, 'Europe/Vienna'),
      c('罗马', 41.9, 12.5, 'Europe/Rome'),
      c('米兰', 45.46, 9.19, 'Europe/Rome'),
      c('马德里', 40.42, -3.7, 'Europe/Madrid'),
      c('巴塞罗那', 41.39, 2.17, 'Europe/Madrid'),
      c('里斯本', 38.72, -9.14, 'Europe/Lisbon'),
      c('斯德哥尔摩', 59.33, 18.07, 'Europe/Stockholm'),
      c('哥本哈根', 55.68, 12.57, 'Europe/Copenhagen'),
      c('奥斯陆', 59.91, 10.75, 'Europe/Oslo'),
      c('赫尔辛基', 60.17, 24.94, 'Europe/Helsinki'),
      c('华沙', 52.23, 21.01, 'Europe/Warsaw'),
      c('布拉格', 50.08, 14.44, 'Europe/Prague'),
      c('雅典', 37.98, 23.73, 'Europe/Athens'),
      c('伊斯坦布尔', 41.01, 28.98, 'Europe/Istanbul'),
      c('莫斯科', 55.76, 37.62, 'Europe/Moscow'),
    ],
  },
  {
    region: '北美',
    cities: [
      c('纽约', 40.71, -74.01, 'America/New_York'),
      c('波士顿', 42.36, -71.06, 'America/New_York'),
      c('华盛顿', 38.91, -77.04, 'America/New_York'),
      c('多伦多', 43.65, -79.38, 'America/Toronto'),
      c('蒙特利尔', 45.5, -73.57, 'America/Toronto'),
      c('芝加哥', 41.88, -87.63, 'America/Chicago'),
      c('休斯敦', 29.76, -95.37, 'America/Chicago'),
      c('丹佛', 39.74, -104.99, 'America/Denver'),
      c('凤凰城', 33.45, -112.07, 'America/Phoenix'),
      c('洛杉矶', 34.05, -118.24, 'America/Los_Angeles'),
      c('旧金山', 37.77, -122.42, 'America/Los_Angeles'),
      c('西雅图', 47.61, -122.33, 'America/Los_Angeles'),
      c('温哥华', 49.28, -123.12, 'America/Vancouver'),
      c('檀香山', 21.31, -157.86, 'Pacific/Honolulu'),
      c('墨西哥城', 19.43, -99.13, 'America/Mexico_City'),
    ],
  },
  {
    region: '南美',
    cities: [
      c('圣保罗', -23.55, -46.63, 'America/Sao_Paulo'),
      c('里约热内卢', -22.91, -43.17, 'America/Sao_Paulo'),
      c('布宜诺斯艾利斯', -34.6, -58.38, 'America/Argentina/Buenos_Aires'),
      c('利马', -12.05, -77.04, 'America/Lima'),
      c('圣地亚哥', -33.45, -70.67, 'America/Santiago'),
    ],
  },
  {
    region: '大洋洲',
    cities: [
      c('悉尼', -33.87, 151.21, 'Australia/Sydney'),
      c('墨尔本', -37.81, 144.96, 'Australia/Melbourne'),
      c('布里斯班', -27.47, 153.03, 'Australia/Brisbane'),
      c('珀斯', -31.95, 115.86, 'Australia/Perth'),
      c('奥克兰', -36.85, 174.76, 'Pacific/Auckland'),
    ],
  },
  {
    region: '非洲',
    cities: [
      c('开罗', 30.04, 31.24, 'Africa/Cairo'),
      c('约翰内斯堡', -26.2, 28.05, 'Africa/Johannesburg'),
      c('内罗毕', -1.29, 36.82, 'Africa/Nairobi'),
      c('拉各斯', 6.52, 3.38, 'Africa/Lagos'),
    ],
  },
]

/** Every IANA zone the browser knows, for custom places (falls back to the zones above). */
export function allTimeZones(): string[] {
  try {
    return Intl.supportedValuesOf('timeZone')
  } catch {
    return [...new Set(['Asia/Shanghai', ...WORLD_CITIES.flatMap((r) => r.cities.map((x) => x.timeZone))])].sort()
  }
}
