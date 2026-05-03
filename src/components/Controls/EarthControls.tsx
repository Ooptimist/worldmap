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

// 城市模式：近距离直视省份中心
const CITY_CAMERA_DISTANCE = 1.3

type FlyState = 'idle' | 'to-china' | 'to-default' | 'to-province'

export default function EarthControls() {
  const controlsRef = useRef<any>(null)
  const { camera } = useThree()

  const resetViewTrigger = useEarthStore((s) => s.resetViewTrigger)
  const showProvinceMode = useEarthStore((s) => s.showProvinceMode)
  const showCityMode = useEarthStore((s) => s.showCityMode)
  const selectedProvinceCenter = useEarthStore((s) => s.selectedProvinceCenter)
  const exitCityMode = useEarthStore((s) => s.exitCityMode)

  // 记录城市模式进入前的相机状态，用于退出判断
  const cityModeStartDistance = useRef(0)
  // 跟踪飞向省份的动画是否已完成（防止 useFrame 在 useEffect 之前触发自动退出）
  const cityModeFlightDone = useRef(false)

  // 在渲染阶段同步追踪 showCityMode 变化（比 useEffect 更早执行）
  // 确保 cityModeStartDistance 和 cityModeFlightDone 在 useFrame 之前被正确设置
  const prevShowCityModeRender = useRef(showCityMode)
  if (showCityMode !== prevShowCityModeRender.current) {
    if (showCityMode) {
      cityModeStartDistance.current = camera.position.length()
      cityModeFlightDone.current = false
    }
    prevShowCityModeRender.current = showCityMode
  }

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

  // 监听城市模式变化 — 飞向选中省份
  const prevCityMode = useRef(showCityMode)
  useEffect(() => {
    if (showCityMode === prevCityMode.current) return
    prevCityMode.current = showCityMode

    if (!controlsRef.current) return

    flyStartPos.current.copy(camera.position)
    flyStartTarget.current.copy(controlsRef.current.target)

    if (showCityMode && selectedProvinceCenter) {
      // cityModeStartDistance 已在渲染阶段设置，此处无需再设
      // 飞向选中省份中心
      const [lng, lat] = selectedProvinceCenter
      const provinceSurfacePoint = latLonToVector3(lat, lng, 1)
      flyEndPos.current.copy(latLonToVector3(lat, lng, CITY_CAMERA_DISTANCE))
      flyEndTarget.current.copy(provinceSurfacePoint.clone().multiplyScalar(0.5))
      flyState.current = 'to-province'
    } else if (showProvinceMode) {
      // 退出城市模式但仍在省份模式 → 飞回中国概览
      flyEndPos.current.copy(CHINA_POSITION)
      flyEndTarget.current.copy(CHINA_TARGET)
      flyState.current = 'to-china'
    } else {
      flyEndPos.current.copy(INITIAL_POSITION)
      flyEndTarget.current.copy(INITIAL_TARGET)
      flyState.current = 'to-default'
    }
    flyProgress.current = 0
  }, [showCityMode]) // eslint-disable-line react-hooks/exhaustive-deps

  // 每帧平滑插值 + 自动退出城市模式检测 + 球面碰撞限制
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
        // 飞向省份动画完成，标记可进行自动退出检测
        if (flyState.current === 'to-province') {
          cityModeFlightDone.current = true
        }
        flyState.current = 'idle'
      }
    } else {
      // 动态限制：相机不能穿入球面（半径1.0），保持最小0.05间距
      const minSurfaceDist = 1.05
      const camDist = camera.position.length()
      if (camDist < minSurfaceDist) {
        camera.position.normalize().multiplyScalar(minSurfaceDist)
        controlsRef.current.update()
      }

      // 自动退出检测：仅在飞向省份动画完成后才检测
      // 用户手动缩放回去时，当距离接近进入城市模式前的距离时退出
      if (showCityMode && cityModeFlightDone.current) {
        const currentDist = camera.position.length()
        const startDist = cityModeStartDistance.current
        // 退出阈值：回到进入城市模式时距离的 90% 以上
        const exitThreshold = startDist * 0.9
        if (currentDist > exitThreshold) {
          exitCityMode()
          cityModeFlightDone.current = false
        }
      }
    }
  })

  // 飞行期间禁用用户交互
  const isFlying = flyState.current !== 'idle'

  // 城市模式下允许更近距离缩放，否则保持默认
  // target 在球体内部(~0.5半径)，球面半径=1.0，相机距原点至少1.0
  // minDistance = 1.0(球面) - 0.5(target偏移) + 0.05(余量) = 0.55
  const minDist = showCityMode ? 0.55 : 1.5

  return (
    <OrbitControls
      ref={controlsRef}
      enablePan={false}
      enableDamping={true}
      dampingFactor={0.05}
      rotateSpeed={0.5}
      zoomSpeed={1.2}
      minDistance={minDist}
      maxDistance={10}
      enableRotate={!isFlying}
      enableZoom={!isFlying}
    />
  )
}
