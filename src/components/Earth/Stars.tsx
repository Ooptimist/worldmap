import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export default function Stars() {
  const starsRef = useRef<THREE.Points>(null)
  
  // 创建星空粒子
  const { positions, colors, sizes } = useMemo(() => {
    const count = 10000
    const positions = new Float32Array(count * 3)
    const colors = new Float32Array(count * 3)
    const sizes = new Float32Array(count)
    
    for (let i = 0; i < count; i++) {
      // 随机分布在球面上
      const radius = 50 + Math.random() * 50
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      
      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta)
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta)
      positions[i * 3 + 2] = radius * Math.cos(phi)
      
      // 随机颜色（白色到淡蓝色）
      const color = new THREE.Color()
      color.setHSL(0.6 + Math.random() * 0.1, 0.2, 0.8 + Math.random() * 0.2)
      colors[i * 3] = color.r
      colors[i * 3 + 1] = color.g
      colors[i * 3 + 2] = color.b
      
      // 随机大小
      sizes[i] = Math.random() * 2 + 0.5
    }
    
    return { positions, colors, sizes }
  }, [])
  
  // 缓慢旋转
  useFrame((_, delta) => {
    if (starsRef.current) {
      starsRef.current.rotation.y += delta * 0.005
    }
  })
  
  return (
    <points ref={starsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={colors.length / 3}
          array={colors}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-size"
          count={sizes.length}
          array={sizes}
          itemSize={1}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.15}
        vertexColors={true}
        transparent={true}
        opacity={0.8}
        sizeAttenuation={true}
        depthWrite={false}
      />
    </points>
  )
}
