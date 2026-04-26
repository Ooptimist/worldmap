import { useMemo } from 'react'
import * as THREE from 'three'
import { useEarthStore } from '@/stores/earthStore'

export default function GridLines() {
  const { showGrid } = useEarthStore()
  
  // 创建经纬线几何体
  const { meridians, parallels } = useMemo(() => {
    const radius = 1.003 // 稍微高于地球表面
    const meridians: THREE.Vector3[][] = []
    const parallels: THREE.Vector3[][] = []
    
    // 经线（每隔15度）
    for (let lon = 0; lon < 360; lon += 15) {
      const points: THREE.Vector3[] = []
      const lonRad = (lon * Math.PI) / 180
      
      for (let lat = -90; lat <= 90; lat += 3) {
        const latRad = (lat * Math.PI) / 180
        const x = radius * Math.cos(latRad) * Math.cos(lonRad)
        const y = radius * Math.sin(latRad)
        const z = radius * Math.cos(latRad) * Math.sin(lonRad)
        points.push(new THREE.Vector3(x, y, z))
      }
      
      meridians.push(points)
    }
    
    // 纬线（每隔15度，不包括极点）
    for (let lat = -75; lat <= 75; lat += 15) {
      const points: THREE.Vector3[] = []
      const latRad = (lat * Math.PI) / 180
      
      for (let lon = 0; lon <= 360; lon += 3) {
        const lonRad = (lon * Math.PI) / 180
        const x = radius * Math.cos(latRad) * Math.cos(lonRad)
        const y = radius * Math.sin(latRad)
        const z = radius * Math.cos(latRad) * Math.sin(lonRad)
        points.push(new THREE.Vector3(x, y, z))
      }
      
      parallels.push(points)
    }
    
    return { meridians, parallels }
  }, [])
  
  if (!showGrid) return null
  
  return (
    <group>
      {/* 经线 */}
      {meridians.map((points, index) => (
        <line key={`meridian-${index}`}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={points.length}
              array={new Float32Array(points.flatMap(p => [p.x, p.y, p.z]))}
              itemSize={3}
            />
          </bufferGeometry>
          <lineBasicMaterial color={0x888888} transparent opacity={0.3} />
        </line>
      ))}
      
      {/* 纬线 */}
      {parallels.map((points, index) => (
        <line key={`parallel-${index}`}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={points.length}
              array={new Float32Array(points.flatMap(p => [p.x, p.y, p.z]))}
              itemSize={3}
            />
          </bufferGeometry>
          <lineBasicMaterial color={0x888888} transparent opacity={0.3} />
        </line>
      ))}
    </group>
  )
}
