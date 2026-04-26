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

// 搜索地理特征
export function searchGeoFeatures(
  features: GeoFeature[],
  query: string
): SearchResult[] {
  const lowerQuery = query.toLowerCase()
  const results: SearchResult[] = []
  
  features.forEach((feature) => {
    const name = feature.properties.name
    const nameLower = name.toLowerCase()
    
    if (nameLower.includes(lowerQuery)) {
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
          name: name,
          nameEn: feature.properties.iso_a2 || '',
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
