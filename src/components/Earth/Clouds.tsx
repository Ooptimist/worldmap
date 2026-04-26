import { useMemo } from 'react'
import * as THREE from 'three'
import { createCloudTexture } from './EarthMaterial'

export default function Clouds() {
  // 云层纹理
  const cloudTexture = useMemo(() => createCloudTexture(), [])
  
  return (
    <meshPhongMaterial
      map={cloudTexture}
      transparent={true}
      opacity={0.4}
      depthWrite={false}
      side={THREE.DoubleSide}
    />
  )
}
