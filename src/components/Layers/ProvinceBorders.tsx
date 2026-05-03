import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Html, Line } from '@react-three/drei'
import { useEarthStore } from '@/stores/earthStore'
import { latLonToVector3 } from '@/utils/geo'
import * as THREE from 'three'

// 计算延伸线末端位置：向右倾斜，与地面夹角45度
// 用相机自身的右方向投影到切线平面，保证屏幕上所有省份统一朝右
function getLeaderLineEndpoint(center: THREE.Vector3, camera: THREE.Camera): THREE.Vector3 {
  const normal = center.clone().normalize()

  // 取相机局部 X 轴（世界空间）作为屏幕"右方"
  const cameraRight = new THREE.Vector3()
  camera.matrixWorld.extractBasis(cameraRight, new THREE.Vector3(), new THREE.Vector3())

  // 将相机右方向投影到球面切线平面：去除法线分量
  let right = cameraRight.clone()
    .sub(normal.clone().multiplyScalar(cameraRight.dot(normal)))
    .normalize()

  // 如果退化（相机右方向与法线平行，即正对极点），用 worldUp 兜底
  if (right.lengthSq() < 0.01) {
    right = new THREE.Vector3().crossVectors(new THREE.Vector3(0, 1, 0), normal).normalize()
    right.sub(normal.clone().multiplyScalar(right.dot(normal))).normalize()
  }

  // 夹角45度：法线分量 = totalLen * sin45, 切线分量 = totalLen * cos45
  const totalLen = 0.25
  const normalLen = totalLen * Math.sin(Math.PI / 4) // sin45° ≈ 0.707
  const tangentLen = totalLen * Math.cos(Math.PI / 4) // cos45° ≈ 0.707

  const endPoint = center.clone()
    .add(normal.clone().multiplyScalar(normalLen))
    .add(right.clone().multiplyScalar(tangentLen))

  return endPoint
}

interface ProvinceFeature {
  type: string
  properties: {
    name: string
    adcode: number
    center?: number[]
    centroid?: number[]
    [key: string]: unknown
  }
  geometry: {
    type: string
    coordinates: number[][][] | number[][][][]
  }
}

interface ProvinceGeoJSON {
  type: string
  features: ProvinceFeature[]
}

// 将 GeoJSON 坐标转为 3D 线条点集
function provinceToLines(geometry: ProvinceFeature['geometry'], radius: number): THREE.Vector3[][] {
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

// 计算省份中心点的3D位置
function getProvinceCenter(feature: ProvinceFeature): THREE.Vector3 {
  const center = feature.properties.center || feature.properties.centroid
  if (center && center.length >= 2) {
    return latLonToVector3(center[1], center[0], 1.005)
  }
  // 回退：取第一个多边形的第一个点的平均值
  const lines = provinceToLines(feature.geometry, 1.005)
  if (lines.length > 0 && lines[0].length > 0) {
    const sum = new THREE.Vector3()
    let count = 0
    lines[0].forEach((p) => { sum.add(p); count++ })
    return sum.divideScalar(count)
  }
  return new THREE.Vector3(0, 0, 1.005)
}

// 为省份创建填充几何体（不可见，仅用于鼠标交互检测）
function createProvinceFillGeometry(
  lines: THREE.Vector3[][],
  center: THREE.Vector3
): THREE.BufferGeometry | null {
  const positions: number[] = []

  for (const ring of lines) {
    for (let i = 0; i < ring.length - 1; i++) {
      // 三角形扇面：center → ring[i] → ring[i+1]
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

const BORDER_RADIUS = 1.004 // 略高于国界线 1.002

export default function ProvinceBorders() {
  const showProvinceMode = useEarthStore((s) => s.showProvinceMode)
  const hoveredProvince = useEarthStore((s) => s.hoveredProvince)
  const setHoveredProvince = useEarthStore((s) => s.setHoveredProvince)
  const showCityMode = useEarthStore((s) => s.showCityMode)
  const enterCityMode = useEarthStore((s) => s.enterCityMode)
  const [geoData, setGeoData] = useState<ProvinceGeoJSON | null>(null)
  const [opacity, setOpacity] = useState(0)
  const opacityRef = useRef(0)
  const { camera } = useThree()

  // 加载中国省份数据
  useEffect(() => {
    const loadProvinces = async () => {
      try {
        const response = await fetch(
          'https://geo.datav.aliyun.com/areas_v3/bound/100000_full.json'
        )
        const data = await response.json()
        setGeoData(data)
      } catch (err) {
        console.error('Failed to load province data:', err)
        // 尝试本地文件
        try {
          const localResponse = await fetch('/data/china-provinces.json')
          const localData = await localResponse.json()
          setGeoData(localData)
        } catch (localErr) {
          console.error('Failed to load local province data:', localErr)
        }
      }
    }
    loadProvinces()
  }, [])

  // 预计算省份线条和中心
  const provinceData = useMemo(() => {
    if (!geoData) return []

    return geoData.features.map((feature) => {
      const lines = provinceToLines(feature.geometry, BORDER_RADIUS)
      const center = getProvinceCenter(feature)
      const normal = center.clone().normalize()
      const fillGeometry = createProvinceFillGeometry(lines, center)
      // 保留原始中心坐标用于飞行动画和 API 请求
      const rawCenter = feature.properties.center || feature.properties.centroid
      return {
        name: feature.properties.name,
        adcode: feature.properties.adcode,
        rawCenter: rawCenter && rawCenter.length >= 2
          ? [rawCenter[0], rawCenter[1]] as [number, number]
          : null,
        lines,
        center,
        normal,
        fillGeometry,
      }
    })
  }, [geoData])

  // 悬停处理
  const handlePointerOver = useCallback((name: string) => {
    setHoveredProvince(name)
  }, [setHoveredProvince])

  const handlePointerOut = useCallback(() => {
    setHoveredProvince(null)
  }, [setHoveredProvince])

  // opacity 渐入渐出动画
  useFrame((_, delta) => {
    const target = showProvinceMode ? 1 : 0
    const speed = 3 // 渐变速度
    opacityRef.current += (target - opacityRef.current) * Math.min(delta * speed, 1)

    // 只在变化超过阈值时更新状态
    if (Math.abs(opacityRef.current - opacity) > 0.01) {
      setOpacity(opacityRef.current)
    }
  })

  // 点击省份处理
  const handleProvinceClick = useCallback((province: { name: string; adcode: number; rawCenter: [number, number] | null }) => {
    if (!province.rawCenter) return
    enterCityMode(province.adcode, province.rawCenter, province.name)
  }, [enterCityMode])

  // 不渲染条件
  if (!geoData || opacity < 0.01) return null

  const isHovered = (name: string) => hoveredProvince === name

  return (
    <group>
      {provinceData.map((province) => {
        const hovered = isHovered(province.name)
        const lineColor = hovered ? '#79c0ff' : '#58a6ff'
        const lineOpacity = hovered ? opacity * 0.95 : opacity * 0.35
        const lineWidth = hovered ? 2.5 : 1.2

        return (
          <group key={province.name}>
            {/* 省份边界线 */}
            {province.lines.map((points, lineIdx) => (
              <Line
                key={`${province.name}-${lineIdx}`}
                points={points}
                color={lineColor}
                lineWidth={lineWidth}
                transparent
                opacity={lineOpacity}
                depthTest={false}
              />
            ))}

            {/* 不可见填充网格（用于鼠标交互检测，覆盖整个省份区域） */}
            {province.fillGeometry && (
              <mesh
                geometry={province.fillGeometry}
                renderOrder={-1}
                onPointerOver={(e) => {
                  e.stopPropagation()
                  handlePointerOver(province.name)
                }}
                onPointerOut={(e) => {
                  e.stopPropagation()
                  handlePointerOut()
                }}
                onClick={(e) => {
                  e.stopPropagation()
                  handleProvinceClick(province)
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

            {/* 悬停时显示延伸线+省份名称（城市模式下隐藏） */}
            {hovered && !showCityMode && (
              <ProvinceLabel
                center={province.center}
                camera={camera}
                lineOpacity={opacity}
                name={province.name}
              />
            )}
          </group>
        )
      })}
    </group>
  )
}

// 省份标注组件：制图标注风格 — 立体球 → 引线 → 立体球+文字
function ProvinceLabel({
  center,
  camera,
  lineOpacity,
  name,
}: {
  center: THREE.Vector3
  camera: THREE.Camera
  lineOpacity: number
  name: string
}) {
  // 延伸线终点（依赖相机方向确定"右"）
  const endPoint = useMemo(() => getLeaderLineEndpoint(center, camera), [center, camera])

  // 引线起/终点：从球体表面出发，到末端球体表面结束
  const lineStart = useMemo(() => {
    const dir = endPoint.clone().sub(center).normalize()
    return center.clone().add(dir.multiplyScalar(0.007))
  }, [center, endPoint])

  const lineEnd = useMemo(() => {
    const dir = center.clone().sub(endPoint).normalize()
    return endPoint.clone().add(dir.multiplyScalar(0.007))
  }, [center, endPoint])

  // 脉冲动画 ref
  const dotRef = useRef<THREE.Mesh>(null)
  const pulseRef = useRef(0)

  useFrame((_, delta) => {
    pulseRef.current += delta * 5
    if (dotRef.current) {
      const scale = 1 + Math.sin(pulseRef.current) * 0.15
      dotRef.current.scale.setScalar(scale)
    }
  })

  return (
    <group>
      {/* 锚点立体球 — 贴在地球表面，带脉冲 */}
      <mesh ref={dotRef} position={center}>
        <sphereGeometry args={[0.007, 16, 16]} />
        <meshStandardMaterial
          color="#79c0ff"
          emissive="#58a6ff"
          emissiveIntensity={0.6}
          transparent
          opacity={lineOpacity * 0.95}
          depthTest={false}
          roughness={0.3}
          metalness={0.1}
        />
      </mesh>

      {/* 锚点底部投影 — 增加空间感 */}
      <mesh position={center} rotation={[0, 0, 0]}>
        <ringGeometry args={[0.008, 0.016, 16]} />
        <meshBasicMaterial
          color="#58a6ff"
          transparent
          opacity={lineOpacity * 0.15}
          depthTest={false}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* 引线：锚点球面 → 末端球面 */}
      <Line
        points={[lineStart, lineEnd]}
        color="#58a6ff"
        lineWidth={2.0}
        transparent
        opacity={lineOpacity * 0.7}
        depthTest={false}
      />

      {/* 末端立体球 — 悬浮在外侧 */}
      <mesh position={endPoint}>
        <sphereGeometry args={[0.006, 16, 16]} />
        <meshStandardMaterial
          color="#79c0ff"
          emissive="#58a6ff"
          emissiveIntensity={0.8}
          transparent
          opacity={lineOpacity * 0.95}
          depthTest={false}
          roughness={0.3}
          metalness={0.1}
        />
      </mesh>

      {/* 末端球体光晕 — 比锚点更亮，暗示离相机更近 */}
      <mesh position={endPoint}>
        <ringGeometry args={[0.008, 0.015, 16]} />
        <meshBasicMaterial
          color="#79c0ff"
          transparent
          opacity={lineOpacity * 0.3}
          depthTest={false}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* 末端文字标签 */}
      <Html
        position={endPoint}
        distanceFactor={4.5}
        style={{ pointerEvents: 'none', userSelect: 'none' }}
        zIndexRange={[100, 0]}
      >
        <div className="province-annotation">
          <span className="province-annotation-name">{name}</span>
        </div>
      </Html>
    </group>
  )
}
