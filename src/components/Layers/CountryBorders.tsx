import { useState, useEffect, useMemo } from 'react'
import * as THREE from 'three'
import { useEarthStore } from '@/stores/earthStore'
import { latLonToVector3 } from '@/utils/geo'

interface BorderData {
  type: string
  features: Array<{
    type: string
    properties: {
      name: string
      iso_a2?: string
      iso_a3?: string
    }
    geometry: {
      type: string
      coordinates: number[][][] | number[][][][]
    }
  }>
}

export default function CountryBorders() {
  const { showBorders } = useEarthStore()
  const [borderData, setBorderData] = useState<BorderData | null>(null)
  
  // 加载边界数据
  useEffect(() => {
    const loadBorders = async () => {
      try {
        const response = await fetch(
          'https://unpkg.com/world-atlas@2/countries-110m.json'
        )
        const data = await response.json()
        
        // 动态导入 topojson-client
        const topojson = await import('topojson-client')
        const geojson = topojson.feature(data, data.objects.countries)
        setBorderData(geojson as unknown as BorderData)
      } catch (err) {
        console.error('Failed to load borders:', err)
      }
    }
    
    loadBorders()
  }, [])
  
  // 创建边界线几何体
  const borderLines = useMemo(() => {
    if (!borderData || !showBorders) return []
    
    const lines: THREE.BufferGeometry[] = []
    
    borderData.features.forEach((feature) => {
      if (feature.geometry.type === 'Polygon') {
        const coords = feature.geometry.coordinates as number[][][]
        coords.forEach((ring) => {
          const points: THREE.Vector3[] = []
          ring.forEach((coord) => {
            // 转换经纬度到3D坐标，稍微抬高一点避免z-fighting
            const point = latLonToVector3(coord[1], coord[0], 1.002)
            points.push(point)
          })
          
          if (points.length > 1) {
            const geometry = new THREE.BufferGeometry().setFromPoints(points)
            lines.push(geometry)
          }
        })
      } else if (feature.geometry.type === 'MultiPolygon') {
        const coords = feature.geometry.coordinates as number[][][][]
        coords.forEach((polygon) => {
          polygon.forEach((ring) => {
            const points: THREE.Vector3[] = []
            ring.forEach((coord) => {
              const point = latLonToVector3(coord[1], coord[0], 1.002)
              points.push(point)
            })
            
            if (points.length > 1) {
              const geometry = new THREE.BufferGeometry().setFromPoints(points)
              lines.push(geometry)
            }
          })
        })
      }
    })
    
    return lines
  }, [borderData, showBorders])
  
  if (!showBorders || !borderData) {
    return null
  }
  
  return (
    <group>
      {borderLines.map((geometry, index) => (
        <primitive key={index} object={new THREE.Line(geometry, new THREE.LineBasicMaterial({
          color: 0x888888,
          transparent: true,
          opacity: 0.6,
        }))} />
      ))}
    </group>
  )
}

