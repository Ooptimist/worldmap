import { useRef, useEffect } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { OrbitControls } from '@react-three/drei'
import { useEarthStore } from '@/stores/earthStore'

// 以中国为中心的初始视角（纬度35°N，经度105°E）
// 由 latLonToVector3(35, 105) 计算得出方向，乘以距离3
const INITIAL_POSITION = new THREE.Vector3(-0.636, 1.722, -2.373)
const INITIAL_TARGET = new THREE.Vector3(0, 0, 0)

export default function EarthControls() {
  const controlsRef = useRef<any>(null)
  const { camera } = useThree()
  
  const resetViewTrigger = useEarthStore((s) => s.resetViewTrigger)

  // 平滑重置状态
  const isResetting = useRef(false)
  const resetProgress = useRef(0)
  const lastTrigger = useRef(0)
  const startPos = useRef(new THREE.Vector3())
  const startTarget = useRef(new THREE.Vector3())

  // 监听重置触发
  useEffect(() => {
    if (resetViewTrigger !== lastTrigger.current && controlsRef.current) {
      lastTrigger.current = resetViewTrigger
      startPos.current.copy(camera.position)
      startTarget.current.copy(controlsRef.current.target)
      resetProgress.current = 0
      isResetting.current = true
    }
  }, [resetViewTrigger, camera])

  // 每帧平滑插值
  useFrame((_, delta) => {
    if (!isResetting.current || !controlsRef.current) return

    resetProgress.current += delta * 1.2
    const t = Math.min(resetProgress.current, 1)

    // ease-in-out 缓动
    const eased = t < 0.5
      ? 2 * t * t
      : 1 - Math.pow(-2 * t + 2, 2) / 2

    camera.position.lerpVectors(startPos.current, INITIAL_POSITION, eased)
    controlsRef.current.target.lerpVectors(startTarget.current, INITIAL_TARGET, eased)
    controlsRef.current.update()

    if (t >= 1) {
      isResetting.current = false
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
