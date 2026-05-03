import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Html, Line } from '@react-three/drei'
import { useEarthStore } from '@/stores/earthStore'
import { latLonToVector3 } from '@/utils/geo'
import * as THREE from 'three'

// 模块级缓存：adcode → 原始 GeoJSON features（含几何数据）
const cityGeoCache = new Map<number, CityGeoFeature[]>()

// 城市数据 GeoJSON 的 feature 结构（含 geometry）
interface CityGeoFeature {
  properties: {
    name: string
    adcode: number
    center?: number[]
    centroid?: number[]
    level: string
    [key: string]: unknown
  }
  geometry: {
    type: string
    coordinates: number[][][] | number[][][][]
  }
}

// 将 GeoJSON 坐标转为 3D 线条点集
function cityToLines(
  geometry: CityGeoFeature['geometry'],
  radius: number
): THREE.Vector3[][] {
  const lines: THREE.Vector3[][] = []

  if (geometry.type === 'MultiPolygon') {
    const coords = geometry.coordinates as number[][][][]
    coords.forEach((polygon) => {
      polygon.forEach((ring) => {
        const points: THREE.Vector3[] = []
        ring.forEach((coord) => {
          points.push(latLonToVector3(coord[1], coord[0], radius))
        })
        if (points.length > 1) lines.push(points)
      })
    })
  } else if (geometry.type === 'Polygon') {
    const coords = geometry.coordinates as number[][][]
    coords.forEach((ring) => {
      const points: THREE.Vector3[] = []
      ring.forEach((coord) => {
        points.push(latLonToVector3(coord[1], coord[0], radius))
      })
      if (points.length > 1) lines.push(points)
    })
  }

  return lines
}

// 为城市创建填充几何体（不可见，仅用于鼠标交互检测）
function createCityFillGeometry(
  lines: THREE.Vector3[][],
  center: THREE.Vector3
): THREE.BufferGeometry | null {
  const positions: number[] = []

  for (const ring of lines) {
    for (let i = 0; i < ring.length - 1; i++) {
      positions.push(
        center.x, center.y, center.z,
        ring[i].x, ring[i].y, ring[i].z,
        ring[i + 1].x, ring[i + 1].y, ring[i + 1].z
      )
    }
  }

  if (positions.length === 0) return null

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  geometry.computeVertexNormals()
  return geometry
}

const CITY_BORDER_RADIUS = 1.005

export default function CityMarkers() {
  const showCityMode = useEarthStore((s) => s.showCityMode)
  const selectedProvinceAdcode = useEarthStore((s) => s.selectedProvinceAdcode)
  const selectedCityAdcode = useEarthStore((s) => s.selectedCityAdcode)
  const setSelectedCity = useEarthStore((s) => s.setSelectedCity)
  const setCityData = useEarthStore((s) => s.setCityData)
  const setIsLoadingCities = useEarthStore((s) => s.setIsLoadingCities)

  const [opacity, setOpacity] = useState(0)
  const opacityRef = useRef(0)
  const [rawFeatures, setRawFeatures] = useState<CityGeoFeature[]>([])

  // 悬停城市名称
  const [hoveredCityAdcode, setHoveredCityAdcode] = useState<number | null>(null)

  // 加载城市数据
  const loadingAdcodeRef = useRef<number | null>(null)

  useEffect(() => {
    if (!showCityMode || !selectedProvinceAdcode) {
      return
    }

    // 省份变化时：先清除旧数据 + 选中状态，防止闪一下
    setRawFeatures([])
    setSelectedCity(null)
    setHoveredCityAdcode(null)
    opacityRef.current = 0
    setOpacity(0)

    loadingAdcodeRef.current = selectedProvinceAdcode

    const cached = cityGeoCache.get(selectedProvinceAdcode)
    if (cached) {
      if (loadingAdcodeRef.current !== selectedProvinceAdcode) return
      setRawFeatures(cached)
      setCityData(
        cached
          .filter((f) => f.properties.center || f.properties.centroid)
          .map((f) => ({
            name: f.properties.name,
            adcode: f.properties.adcode,
            center: (f.properties.center || f.properties.centroid) as [number, number],
            level: f.properties.level,
          }))
      )
      return
    }

    setIsLoadingCities(true)
    const currentAdcode = selectedProvinceAdcode
    const loadCityData = async () => {
      try {
        const url = `https://geo.datav.aliyun.com/areas_v3/bound/${currentAdcode}_full.json`
        const response = await fetch(url)
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
        const data = await response.json()
        const features = data.features as CityGeoFeature[]

        if (loadingAdcodeRef.current !== currentAdcode) return

        cityGeoCache.set(currentAdcode, features)
        setRawFeatures(features)
        setCityData(
          features
            .filter((f) => f.properties.center || f.properties.centroid)
            .map((f) => ({
              name: f.properties.name,
              adcode: f.properties.adcode,
              center: (f.properties.center || f.properties.centroid) as [number, number],
              level: f.properties.level,
            }))
        )
      } catch (err) {
        console.error('[CityMarkers] Failed to load city data:', err)
        if (loadingAdcodeRef.current === currentAdcode) {
          setRawFeatures([])
          setCityData([])
        }
      }
    }
    loadCityData()
  }, [showCityMode, selectedProvinceAdcode]) // eslint-disable-line react-hooks/exhaustive-deps

  // 淡入淡出
  const hasDataRef = useRef(false)
  hasDataRef.current = rawFeatures.length > 0

  useFrame((_, delta) => {
    const target = showCityMode && hasDataRef.current ? 1 : 0
    const speed = 4
    opacityRef.current += (target - opacityRef.current) * Math.min(delta * speed, 1)
    if (Math.abs(opacityRef.current - opacity) > 0.01) {
      setOpacity(opacityRef.current)
    }
  })

  // 退出城市模式时重置
  useEffect(() => {
    if (!showCityMode) {
      opacityRef.current = 0
      setOpacity(0)
      setRawFeatures([])
      setSelectedCity(null)
      setHoveredCityAdcode(null)
    }
  }, [showCityMode]) // eslint-disable-line react-hooks/exhaustive-deps

  // 处理城市数据：分界线 + 填充网格 + 中心点
  const cityRenderData = useMemo(() => {
    return rawFeatures
      .filter((f) => f.properties.center || f.properties.centroid)
      .map((feature) => {
        const lines = cityToLines(feature.geometry, CITY_BORDER_RADIUS)
        const centerCoord = feature.properties.center || feature.properties.centroid!
        const center = latLonToVector3(centerCoord[1], centerCoord[0], 1.005)
        const fillGeometry = createCityFillGeometry(lines, center)
        return {
          name: feature.properties.name,
          adcode: feature.properties.adcode,
          lines,
          center,
          fillGeometry,
        }
      })
  }, [rawFeatures])

  // 悬停处理
  const handlePointerOver = useCallback((adcode: number) => {
    setHoveredCityAdcode(adcode)
    document.body.style.cursor = 'pointer'
  }, [])

  const handlePointerOut = useCallback(() => {
    setHoveredCityAdcode(null)
    document.body.style.cursor = 'auto'
  }, [])

  // 点击处理：选中城市显示名称
  const handleCityClick = useCallback((adcode: number) => {
    setSelectedCity(selectedCityAdcode === adcode ? null : adcode)
  }, [selectedCityAdcode, setSelectedCity])

  if (!showCityMode || rawFeatures.length === 0 || opacity < 0.01) return null

  return (
    <group>
      {cityRenderData.map((city) => {
        const isHovered = hoveredCityAdcode === city.adcode
        const isSelected = selectedCityAdcode === city.adcode
        const isHighlighted = isHovered || isSelected
        const lineColor = isHighlighted ? '#79c0ff' : '#58a6ff'
        const lineOpacity = isHighlighted ? opacity * 0.7 : opacity * 0.25
        const lineWidth = isHighlighted ? 1.5 : 0.8

        return (
          <group key={city.adcode}>
            {/* 城市分界线 */}
            {city.lines.map((points, idx) => (
              <Line
                key={idx}
                points={points}
                color={lineColor}
                lineWidth={lineWidth}
                transparent
                opacity={lineOpacity}
                depthTest={false}
              />
            ))}

            {/* 不可见填充网格（用于鼠标交互检测） */}
            {city.fillGeometry && (
              <mesh
                geometry={city.fillGeometry}
                renderOrder={-1}
                onPointerOver={(e) => {
                  e.stopPropagation()
                  handlePointerOver(city.adcode)
                }}
                onPointerOut={(e) => {
                  e.stopPropagation()
                  handlePointerOut()
                }}
                onClick={(e) => {
                  e.stopPropagation()
                  handleCityClick(city.adcode)
                }}
              >
                <meshBasicMaterial
                  transparent
                  opacity={0.001}
                  depthWrite={false}
                  depthTest={false}
                  side={THREE.DoubleSide}
                  color="#000000"
                />
              </mesh>
            )}

            {/* 悬停或选中时显示标注（跟省份逻辑一致） */}
            {isHighlighted && (
              <CityLabel
                center={city.center}
                name={city.name}
                lineOpacity={opacity}
                isSelected={isSelected}
              />
            )}
          </group>
        )
      })}
    </group>
  )
}

// 城市标注组件：制图标注风格 — 立体球 → 引线 → 立体球+文字
// 与省份 ProvinceLabel 同风格但更小更紧凑
function CityLabel({
  center,
  name,
  lineOpacity,
  isSelected,
}: {
  center: THREE.Vector3
  name: string
  lineOpacity: number
  isSelected: boolean
}) {
  const { camera } = useThree()

  // 延伸线终点（每帧基于相机位置计算）
  const endPointRef = useRef(new THREE.Vector3())
  const lineStartRef = useRef(new THREE.Vector3())
  const lineEndRef = useRef(new THREE.Vector3())
  const labelOpacityRef = useRef(0)
  const scaleRef = useRef(1) // 根据相机距离动态缩放

  const [linePoints, setLinePoints] = useState<[THREE.Vector3, THREE.Vector3]>([
    new THREE.Vector3(),
    new THREE.Vector3(),
  ])
  const [labelOpacity, setLabelOpacity] = useState(0)
  const [endPointPos, setEndPointPos] = useState(new THREE.Vector3())
  const [visualScale, setVisualScale] = useState(1)

  // 脉冲动画
  const dotRef = useRef<THREE.Mesh>(null)
  const pulseRef = useRef(0)

  useFrame((_, delta) => {
    // 脉冲
    pulseRef.current += delta * 5
    if (dotRef.current) {
      const scale = 1 + Math.sin(pulseRef.current) * 0.12
      dotRef.current.scale.setScalar(scale)
    }

    // 计算引线终点
    const normal = center.clone().normalize()
    const cameraRight = new THREE.Vector3()
    camera.matrixWorld.extractBasis(cameraRight, new THREE.Vector3(), new THREE.Vector3())

    let right = cameraRight
      .clone()
      .sub(normal.clone().multiplyScalar(cameraRight.dot(normal)))
      .normalize()

    if (right.lengthSq() < 0.01) {
      right = new THREE.Vector3()
        .crossVectors(new THREE.Vector3(0, 1, 0), normal)
        .normalize()
      right.sub(normal.clone().multiplyScalar(right.dot(normal))).normalize()
    }

    // 引线长度根据相机距离动态缩放：近时短、远时长，确保标签始终可见
    const cameraDist = camera.position.distanceTo(center)
    const totalLen = Math.max(0.03, Math.min(0.2, cameraDist * 0.22))
    const normalLen = totalLen * Math.sin(Math.PI / 4)
    const tangentLen = totalLen * Math.cos(Math.PI / 4)

    // 动态缩放因子：近时更小、远时更大，保持视觉大小一致
    const newScale = Math.max(0.4, Math.min(2.0, cameraDist * 1.5))
    scaleRef.current = newScale

    const endPoint = center
      .clone()
      .add(normal.clone().multiplyScalar(normalLen))
      .add(right.clone().multiplyScalar(tangentLen))

    endPointRef.current.copy(endPoint)

    const dotSize = 0.005 * newScale
    const endDotSize = 0.004 * newScale
    const dir = endPoint.clone().sub(center).normalize()
    lineStartRef.current.copy(center).add(dir.clone().multiplyScalar(dotSize))
    lineEndRef.current.copy(endPoint).add(dir.clone().negate().multiplyScalar(endDotSize))

    // 淡入淡出
    const target = lineOpacity
    labelOpacityRef.current += (target - labelOpacityRef.current) * Math.min(delta * 8, 1)

    if (labelOpacityRef.current > 0.001) {
      setLinePoints([lineStartRef.current.clone(), lineEndRef.current.clone()])
      setLabelOpacity(labelOpacityRef.current)
      setEndPointPos(endPoint.clone())
      setVisualScale(newScale)
    } else if (labelOpacity > 0.001) {
      setLabelOpacity(0)
    }
  })

  if (labelOpacity < 0.01) return null

  const s = visualScale

  return (
    <group>
      {/* 锚点立体球 — 城市位置 */}
      <mesh ref={dotRef} position={center}>
        <sphereGeometry args={[0.005 * s, 12, 12]} />
        <meshStandardMaterial
          color={isSelected ? '#ffffff' : '#79c0ff'}
          emissive={isSelected ? '#58a6ff' : '#3b82f6'}
          emissiveIntensity={isSelected ? 1.0 : 0.6}
          transparent
          opacity={labelOpacity * 0.95}
          depthTest={false}
          roughness={0.3}
          metalness={0.1}
        />
      </mesh>

      {/* 锚点底部光晕 */}
      <mesh position={center}>
        <ringGeometry args={[0.006 * s, 0.012 * s, 12]} />
        <meshBasicMaterial
          color={isSelected ? '#ffffff' : '#58a6ff'}
          transparent
          opacity={labelOpacity * (isSelected ? 0.25 : 0.12)}
          depthTest={false}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* 引线 */}
      <Line
        points={linePoints}
        color="#58a6ff"
        lineWidth={1.5}
        transparent
        opacity={labelOpacity * 0.7}
        depthTest={false}
      />

      {/* 末端小球 */}
      <mesh position={endPointPos}>
        <sphereGeometry args={[0.004 * s, 12, 12]} />
        <meshStandardMaterial
          color="#ffffff"
          emissive="#58a6ff"
          emissiveIntensity={0.9}
          transparent
          opacity={labelOpacity * 0.95}
          depthTest={false}
          roughness={0.3}
          metalness={0.1}
        />
      </mesh>

      {/* 末端光晕 */}
      <mesh position={endPointPos}>
        <ringGeometry args={[0.006 * s, 0.011 * s, 12]} />
        <meshBasicMaterial
          color="#79c0ff"
          transparent
          opacity={labelOpacity * 0.3}
          depthTest={false}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* 城市名文字标签 — 固定像素大小，不随距离缩放容器 */}
      <Html
        position={endPointPos}
        style={{ pointerEvents: 'none', userSelect: 'none' }}
        zIndexRange={[100, 0]}
      >
        <div className="city-annotation">
          <span className="city-annotation-name">{name}</span>
        </div>
      </Html>
    </group>
  )
}
