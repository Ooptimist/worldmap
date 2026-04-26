import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useEarthStore } from '@/stores/earthStore'
import EarthMaterial from './EarthMaterial'
import Atmosphere from './Atmosphere'
import Clouds from './Clouds'
import Stars from './Stars'

export default function Earth() {
  const earthRef = useRef<THREE.Mesh>(null)
  
  const { isRotating, rotationSpeed, showAtmosphere, showClouds } = useEarthStore()
  
  // 地球几何体
  const earthGeometry = useMemo(() => new THREE.SphereGeometry(1, 64, 64), [])
  
  // 动画循环
  useFrame((_, delta) => {
    if (isRotating && earthRef.current) {
      earthRef.current.rotation.y += delta * 0.1 * rotationSpeed
    }
  })
  
  return (
    <group>
      {/* 星空背景 */}
      <Stars />
      
      {/* 地球 */}
      <mesh ref={earthRef} geometry={earthGeometry}>
        <EarthMaterial />
      </mesh>
      
      {/* 云层 */}
      {showClouds && <Clouds />}
      
      {/* 大气层 */}
      {showAtmosphere && <Atmosphere />}
    </group>
  )
}
