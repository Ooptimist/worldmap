import { useMemo } from 'react'
import * as THREE from 'three'

// 创建纯海洋纹理
function createEarthTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = 1024
  canvas.height = 512
  const ctx = canvas.getContext('2d')!
  
  // 海洋渐变
  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height)
  gradient.addColorStop(0, '#0a2a4a')
  gradient.addColorStop(0.2, '#1a4a7a')
  gradient.addColorStop(0.4, '#2a6a9a')
  gradient.addColorStop(0.5, '#3a8aba')
  gradient.addColorStop(0.6, '#2a6a9a')
  gradient.addColorStop(0.8, '#1a4a7a')
  gradient.addColorStop(1, '#0a2a4a')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  return texture
}

export default function EarthMaterial() {
  const earthTexture = useMemo(() => createEarthTexture(), [])
  
  return (
    <meshStandardMaterial
      map={earthTexture}
      roughness={0.8}
      metalness={0.1}
    />
  )
}
