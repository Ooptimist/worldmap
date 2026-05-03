import { useRef, useEffect } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { OrbitControls } from '@react-three/drei'
import { useEarthStore } from '@/stores/earthStore'
import { latLonToVector3 } from '@/utils/geo'

// 默认视角（以中国为中心，纬度35°N，经度105°E）
const INITIAL_POSITION = new THREE.Vector3(-0.636, 1.722, -2.373)
const INITIAL_TARGET = new THREE.Vector3(0, 0, 0)

// 省份模式：更近的视角，直视中国中心
const CHINA_CENTER = latLonToVector3(35, 105, 1) // 球面上的点
const CHINA_CAMERA_DISTANCE = 2.2
const CHINA_POSITION = latLonToVector3(35, 105, CHINA_CAMERA_DISTANCE)
const CHINA_TARGET = CHINA_CENTER.clone().multiplyScalar(0.5) // lookAt 略偏球心

type FlyState = 'idle' | 'to-china' | 'to-default'

export default function EarthControls() {
  const controlsRef = useRef<any>(null)
  const { camera } = useThree()

  const resetViewTrigger = useEarthStore((s) => s.resetViewTrigger)
  const showProvinceMode = useEarthStore((s) => s.showProvinceMode)

  // 飞行动画状态
  const flyState = useRef<FlyState>('idle')
  const flyProgress = useRef(0)
  const flyStartPos = useRef(new THREE.Vector3())
  const flyStartTarget = useRef(new THREE.Vector3())
  const flyEndPos = useRef(new THREE.Vector3())
  const flyEndTarget = useRef(new THREE.Vector3())

  // 监听重置触发
  useEffect(() => {
    if (controlsRef.current) {
      flyStartPos.current.copy(camera.position)
      flyStartTarget.current.copy(controlsRef.current.target)
      flyEndPos.current.copy(INITIAL_POSITION)
      flyEndTarget.current.copy(INITIAL_TARGET)
      flyProgress.current = 0
      flyState.current = 'to-default'
    }
  }, [resetViewTrigger]) // eslint-disable-line react-hooks/exhaustive-deps

  // 监听省份模式变化
  const prevProvinceMode = useRef(showProvinceMode)
  useEffect(() => {
    if (showProvinceMode === prevProvinceMode.current) return
    prevProvinceMode.current = showProvinceMode

    if (!controlsRef.current) return

    flyStartPos.current.copy(camera.position)
    flyStartTarget.current.copy(controlsRef.current.target)

    if (showProvinceMode) {
      // 飞向中国
      flyEndPos.current.copy(CHINA_POSITION)
      flyEndTarget.current.copy(CHINA_TARGET)
      flyState.current = 'to-china'
    } else {
      // 飞回默认
      flyEndPos.current.copy(INITIAL_POSITION)
      flyEndTarget.current.copy(INITIAL_TARGET)
      flyState.current = 'to-default'
    }
    flyProgress.current = 0
  }, [showProvinceMode]) // eslint-disable-line react-hooks/exhaustive-deps

  // 每帧平滑插值
  useFrame((_, delta) => {
    if (!controlsRef.current) return

    if (flyState.current !== 'idle') {
      flyProgress.current += delta * 1.0
      const t = Math.min(flyProgress.current, 1)

      // ease-in-out 缓动
      const eased = t < 0.5
        ? 2 * t * t
        : 1 - Math.pow(-2 * t + 2, 2) / 2

      camera.position.lerpVectors(flyStartPos.current, flyEndPos.current, eased)
      controlsRef.current.target.lerpVectors(flyStartTarget.current, flyEndTarget.current, eased)
      controlsRef.current.update()

      if (t >= 1) {
        flyState.current = 'idle'
      }
    }
  })

  // 飞行期间禁用用户交互
  const isFlying = flyState.current !== 'idle'

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
      enableRotate={!isFlying}
      enableZoom={!isFlying}
    />
  )
}
