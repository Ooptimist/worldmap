import { Vector3 } from 'three'
import { GeoFeature, SearchResult } from '@/types'

// 将经纬度转换为3D坐标
export function latLonToVector3(lat: number, lon: number, radius: number = 1): Vector3 {
  const phi = (90 - lat) * (Math.PI / 180)
  const theta = (lon + 180) * (Math.PI / 180)
  
  const x = -(radius * Math.sin(phi) * Math.cos(theta))
  const y = radius * Math.cos(phi)
  const z = radius * Math.sin(phi) * Math.sin(theta)
  
  return new Vector3(x, y, z)
}

// 将3D坐标转换为经纬度
export function vector3ToLatLon(v: Vector3): { lat: number; lon: number } {
  const radius = v.length()
  const phi = Math.acos(v.y / radius)
  const theta = Math.atan2(v.z, -v.x)
  
  const lat = 90 - (phi * 180) / Math.PI
  const lon = (theta * 180) / Math.PI - 180
  
  return { lat, lon }
}

// 计算两个经纬度之间的距离（km）
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371 // 地球半径（km）
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

// 格式化数字
export function formatNumber(num: number): string {
  if (num >= 1000000000) {
    return (num / 1000000000).toFixed(1) + 'B'
  }
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  return num.toString()
}

// 格式化面积
export function formatArea(area: number): string {
  if (area >= 1000000) {
    return (area / 1000000).toFixed(2) + ' 百万 km²'
  }
  if (area >= 1000) {
    return (area / 1000).toFixed(2) + ' 千 km²'
  }
  return area.toFixed(2) + ' km²'
}

// 中英文国家名映射（覆盖主要国家，支持中文搜索）
const COUNTRY_ZH_MAP: Record<string, string> = {
  'China': '中国',
  'United States of America': '美国',
  'Russia': '俄罗斯',
  'Canada': '加拿大',
  'Brazil': '巴西',
  'Australia': '澳大利亚',
  'India': '印度',
  'Argentina': '阿根廷',
  'Kazakhstan': '哈萨克斯坦',
  'Algeria': '阿尔及利亚',
  'Dem. Rep. Congo': '刚果(金)',
  'Saudi Arabia': '沙特阿拉伯',
  'Mexico': '墨西哥',
  'Indonesia': '印度尼西亚',
  'Japan': '日本',
  'Germany': '德国',
  'United Kingdom': '英国',
  'France': '法国',
  'Italy': '意大利',
  'South Korea': '韩国',
  'Spain': '西班牙',
  'South Africa': '南非',
  'Egypt': '埃及',
  'Turkey': '土耳其',
  'Iran': '伊朗',
  'Mongolia': '蒙古',
  'Peru': '秘鲁',
  'Chad': '乍得',
  'Niger': '尼日尔',
  'Angola': '安哥拉',
  'Mali': '马里',
  'Sudan': '苏丹',
  'Ukraine': '乌克兰',
  'Madagascar': '马达加斯加',
  'Botswana': '博茨瓦纳',
  'Pakistan': '巴基斯坦',
  'Afghanistan': '阿富汗',
  'Thailand': '泰国',
  'Vietnam': '越南',
  'Malaysia': '马来西亚',
  'Philippines': '菲律宾',
  'Myanmar': '缅甸',
  'Cambodia': '柬埔寨',
  'Bangladesh': '孟加拉国',
  'Nepal': '尼泊尔',
  'Sri Lanka': '斯里兰卡',
  'Uzbekistan': '乌兹别克斯坦',
  'Iraq': '伊拉克',
  'Syria': '叙利亚',
  'Jordan': '约旦',
  'Israel': '以色列',
  'Lebanon': '黎巴嫩',
  'Yemen': '也门',
  'Oman': '阿曼',
  'United Arab Emirates': '阿联酋',
  'Qatar': '卡塔尔',
  'Kuwait': '科威特',
  'Bahrain': '巴林',
  'Greece': '希腊',
  'Portugal': '葡萄牙',
  'Poland': '波兰',
  'Romania': '罗马尼亚',
  'Netherlands': '荷兰',
  'Belgium': '比利时',
  'Czech Rep.': '捷克',
  'Hungary': '匈牙利',
  'Sweden': '瑞典',
  'Norway': '挪威',
  'Finland': '芬兰',
  'Denmark': '丹麦',
  'Switzerland': '瑞士',
  'Austria': '奥地利',
  'Ireland': '爱尔兰',
  'New Zealand': '新西兰',
  'Colombia': '哥伦比亚',
  'Venezuela': '委内瑞拉',
  'Chile': '智利',
  'Ecuador': '厄瓜多尔',
  'Bolivia': '玻利维亚',
  'Paraguay': '巴拉圭',
  'Uruguay': '乌拉圭',
  'Cuba': '古巴',
  'Guatemala': '危地马拉',
  'Honduras': '洪都拉斯',
  'Dominican Rep.': '多米尼加',
  'Haiti': '海地',
  'Nicaragua': '尼加拉瓜',
  'El Salvador': '萨尔瓦多',
  'Costa Rica': '哥斯达黎加',
  'Panama': '巴拿马',
  'Jamaica': '牙买加',
  'Morocco': '摩洛哥',
  'Ethiopia': '埃塞俄比亚',
  'Tanzania': '坦桑尼亚',
  'Kenya': '肯尼亚',
  'Nigeria': '尼日利亚',
  'Ghana': '加纳',
  'Cameroon': '喀麦隆',
  'Côte d\'Ivoire': '科特迪瓦',
  'Senegal': '塞内加尔',
  'Zimbabwe': '津巴布韦',
  'Mozambique': '莫桑比克',
  'Uganda': '乌干达',
  'Tunisia': '突尼斯',
  'Libya': '利比亚',
  'Somalia': '索马里',
  'Congo': '刚果(布)',
  'Gabon': '加蓬',
  'Namibia': '纳米比亚',
  'Zambia': '赞比亚',
  'Malawi': '马拉维',
  'Mauritania': '毛里塔尼亚',
  'Benin': '贝宁',
  'Togo': '多哥',
  'Sierra Leone': '塞拉利昂',
  'Liberia': '利比里亚',
  'Guinea': '几内亚',
  'Burkina Faso': '布基纳法索',
  'Eritrea': '厄立特里亚',
  'Rwanda': '卢旺达',
  'Burundi': '布隆迪',
  'Dem. Rep. Korea': '朝鲜',
  'Korea': '韩国',
  'N. Korea': '朝鲜',
  'Taiwan': '台湾',
  'Papua New Guinea': '巴布亚新几内亚',
  'Greenland': '格陵兰',
  'Iceland': '冰岛',
  'Croatia': '克罗地亚',
  'Serbia': '塞尔维亚',
  'Bulgaria': '保加利亚',
  'Slovakia': '斯洛伐克',
  'Slovenia': '斯洛文尼亚',
  'Lithuania': '立陶宛',
  'Latvia': '拉脱维亚',
  'Estonia': '爱沙尼亚',
  'Belarus': '白俄罗斯',
  'Moldova': '摩尔多瓦',
  'Albania': '阿尔巴尼亚',
  'North Macedonia': '北马其顿',
  'Montenegro': '黑山',
  'Bosnia and Herz.': '波黑',
  'Kosovo': '科索沃',
  'Georgia': '格鲁吉亚',
  'Armenia': '亚美尼亚',
  'Azerbaijan': '阿塞拜疆',
  'Turkmenistan': '土库曼斯坦',
  'Kyrgyzstan': '吉尔吉斯斯坦',
  'Tajikistan': '塔吉克斯坦',
  'Cyprus': '塞浦路斯',
  'Luxembourg': '卢森堡',
  'Malta': '马耳他',
  'Bhutan': '不丹',
  'Laos': '老挝',
  'Timor-Leste': '东帝汶',
  'Brunei': '文莱',
  'Singapore': '新加坡',
  'Fiji': '斐济',
  'W. Sahara': '西撒哈拉',
}

// 反向映射：中文 → 英文
const ZH_TO_EN_MAP: Record<string, string> = {}
for (const [en, zh] of Object.entries(COUNTRY_ZH_MAP)) {
  ZH_TO_EN_MAP[zh] = en
}

// 搜索地理特征
export function searchGeoFeatures(
  features: GeoFeature[],
  query: string
): SearchResult[] {
  const lowerQuery = query.toLowerCase()
  const results: SearchResult[] = []
  
  features.forEach((feature) => {
    const nameEn = feature.properties.name
    const nameEnLower = nameEn.toLowerCase()
    const nameZh = COUNTRY_ZH_MAP[nameEn] || ''
    
    // 匹配英文名或中文名
    const matchEn = nameEnLower.includes(lowerQuery)
    const matchZh = nameZh && nameZh.includes(query)
    
    if (matchEn || matchZh) {
      // 计算中心点坐标
      const coords = feature.geometry.coordinates
      let centerLat = 0
      let centerLon = 0
      let count = 0
      
      if (feature.geometry.type === 'Polygon') {
        const polygon = coords as number[][][]
        polygon[0].forEach((coord) => {
          centerLon += coord[0]
          centerLat += coord[1]
          count++
        })
      } else if (feature.geometry.type === 'MultiPolygon') {
        const multiPolygon = coords as number[][][][]
        multiPolygon.forEach((polygon) => {
          polygon[0].forEach((coord) => {
            centerLon += coord[0]
            centerLat += coord[1]
            count++
          })
        })
      }
      
      if (count > 0) {
        centerLat /= count
        centerLon /= count
        
        results.push({
          type: 'country',
          name: nameZh || nameEn,
          nameEn: nameEn,
          coordinates: latLonToVector3(centerLat, centerLon),
          country: feature.properties.admin,
        })
      }
    }
  })
  
  return results.slice(0, 10) // 限制返回前10个结果
}

// 限制角度在 -PI 到 PI 之间
export function clampAngle(angle: number): number {
  while (angle > Math.PI) angle -= 2 * Math.PI
  while (angle < -Math.PI) angle += 2 * Math.PI
  return angle
}

// 平滑插值
export function lerp(start: number, end: number, t: number): number {
  return start + (end - start) * t
}

// 缓动函数
export function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}
