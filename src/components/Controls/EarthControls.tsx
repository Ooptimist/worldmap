import { useRef, useEffect } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { useEarthStore } from '@/stores/earthStore'

export default function EarthControls() {
  const controlsRef = useRef<any>(null)
  const { camera } = useThree()
  
  const { 
    cameraPosition, 
    cameraTarget, 
    setCameraPosition, 
    setCameraTarget 
  } = useEarthStore()
  
  // 同步相机位置
  useEffect(() => {
    if (controlsRef.current) {
      camera.position.set(...cameraPosition)
      controlsRef.current.target.set(...cameraTarget)
      controlsRef.current.update()
    }
  }, [cameraPosition, cameraTarget, camera])
  
  // 更新相机位置到 store
  useFrame(() => {
    if (controlsRef.current) {
      const pos = camera.position
      const target = controlsRef.current.target
      
      setCameraPosition([pos.x, pos.y, pos.z])
      setCameraTarget([target.x, target.y, target.z])
    }
  })
  
  return (
    <OrbitControls
      ref={controlsRef}
      enablePan={false}
      enableDamping={true}
      dampingFactor={0.05}
      rotateSpeed={0.5}
      zoomSpeed={1.2}
      minDistance={1.5}
      maxDistance={10}
      enableRotate={true}
      enableZoom={true}
    />
  )
}
