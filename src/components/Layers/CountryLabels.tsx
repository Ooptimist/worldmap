import { useRef, useState, useCallback } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'
import { useEarthStore } from '@/stores/earthStore'
import { latLonToVector3 } from '@/utils/geo'

interface CountryLabel {
  name: string
  nameEn: string
  lat: number
  lon: number
  population: number
}

// 坐标为各国首都位置
const majorCountries: CountryLabel[] = [
  { name: '中国', nameEn: 'China', lat: 39.9042, lon: 116.4074, population: 1400000000 },         // 北京
  { name: '美国', nameEn: 'USA', lat: 38.9072, lon: -77.0369, population: 331000000 },             // 华盛顿
  { name: '俄罗斯', nameEn: 'Russia', lat: 55.7558, lon: 37.6173, population: 146000000 },         // 莫斯科
  { name: '加拿大', nameEn: 'Canada', lat: 45.4215, lon: -75.6972, population: 38000000 },         // 渥太华
  { name: '巴西', nameEn: 'Brazil', lat: -15.7975, lon: -47.8919, population: 213000000 },         // 巴西利亚
  { name: '澳大利亚', nameEn: 'Australia', lat: -35.2809, lon: 149.1300, population: 26000000 },   // 堪培拉
  { name: '印度', nameEn: 'India', lat: 28.6139, lon: 77.2090, population: 1380000000 },           // 新德里
  { name: '阿根廷', nameEn: 'Argentina', lat: -34.6037, lon: -58.3816, population: 45000000 },     // 布宜诺斯艾利斯
  { name: '哈萨克斯坦', nameEn: 'Kazakhstan', lat: 51.1280, lon: 71.4304, population: 19000000 },  // 阿斯塔纳
  { name: '阿尔及利亚', nameEn: 'Algeria', lat: 36.7538, lon: 3.0588, population: 44000000 },      // 阿尔及尔
  { name: '刚果(金)', nameEn: 'DR Congo', lat: -4.4419, lon: 15.2663, population: 90000000 },      // 金沙萨
  { name: '沙特阿拉伯', nameEn: 'Saudi Arabia', lat: 24.7136, lon: 46.6753, population: 35000000 },// 利雅得
  { name: '墨西哥', nameEn: 'Mexico', lat: 19.4326, lon: -99.1332, population: 130000000 },        // 墨西哥城
  { name: '印度尼西亚', nameEn: 'Indonesia', lat: -6.2088, lon: 106.8456, population: 274000000 }, // 雅加达
  { name: '日本', nameEn: 'Japan', lat: 35.6762, lon: 139.6503, population: 126000000 },           // 东京
  { name: '德国', nameEn: 'Germany', lat: 52.5200, lon: 13.4050, population: 83000000 },           // 柏林
  { name: '英国', nameEn: 'UK', lat: 51.5074, lon: -0.1278, population: 68000000 },               // 伦敦
  { name: '法国', nameEn: 'France', lat: 48.8566, lon: 2.3522, population: 67000000 },             // 巴黎
  { name: '意大利', nameEn: 'Italy', lat: 41.9028, lon: 12.4964, population: 60000000 },           // 罗马
  { name: '韩国', nameEn: 'South Korea', lat: 37.5665, lon: 126.9780, population: 52000000 },      // 首尔
  { name: '西班牙', nameEn: 'Spain', lat: 40.4168, lon: -3.7038, population: 47000000 },           // 马德里
  { name: '南非', nameEn: 'South Africa', lat: -25.7479, lon: 28.2293, population: 60000000 },     // 比勒陀利亚
  { name: '埃及', nameEn: 'Egypt', lat: 30.0444, lon: 31.2357, population: 102000000 },            // 开罗
  { name: '土耳其', nameEn: 'Turkey', lat: 39.9334, lon: 32.8597, population: 84000000 },          // 安卡拉
  { name: '伊朗', nameEn: 'Iran', lat: 35.6892, lon: 51.3890, population: 84000000 },              // 德黑兰
]

// 预计算标签的3D位置
const labelPositions = majorCountries.map((c) => ({
  ...c,
  position: latLonToVector3(c.lat, c.lon, 1.02),
  normal: latLonToVector3(c.lat, c.lon, 1).normalize(),
}))

export default function CountryLabels() {
  const { showLabels } = useEarthStore()
  const { camera } = useThree()
  const cameraDir = useRef(new THREE.Vector3())

  // 用 Set 记录当前可见标签，仅在变化时触发重渲染
  const [visibleSet, setVisibleSet] = useState<Set<string>>(() => new Set())
  const prevVisibleRef = useRef<Set<string>>(new Set())
  const frameCount = useRef(0)

  useFrame(() => {
    const distance = camera.position.length()
    camera.getWorldDirection(cameraDir.current)
    const toCamera = camera.position.clone().normalize()

    const newVisible = new Set<string>()

    for (const label of labelPositions) {
      // 距离过滤：远距离只显示人口大国
      if (distance >= 5 && label.population < 500000000) continue
      if (distance >= 3 && distance < 5 && label.population < 100000000) continue

      // 背面剔除：标签法线与相机方向的点积 > 0 才可见
      const dot = label.normal.dot(toCamera)
      if (dot < 0.6) continue // 标签接近球体边缘时淡出隐藏

      newVisible.add(label.nameEn)
    }

    // 每3帧检测一次，减少 setState 频率
    frameCount.current++
    if (frameCount.current % 3 !== 0) return

    // 只在可见集合真正变化时更新
    const prev = prevVisibleRef.current
    if (prev.size !== newVisible.size) {
      prevVisibleRef.current = newVisible
      setVisibleSet(newVisible)
      return
    }
    for (const key of newVisible) {
      if (!prev.has(key)) {
        prevVisibleRef.current = newVisible
        setVisibleSet(newVisible)
        return
      }
    }
  })

  if (!showLabels) return null

  return (
    <group>
      {labelPositions.map((label) => {
        const isVisible = visibleSet.has(label.nameEn)
        return (
          <Html
            key={label.nameEn}
            position={label.position}
            distanceFactor={8}
            className="globe-label-container"
            style={{ pointerEvents: 'none', userSelect: 'none' }}
          >
            <div
              className={`globe-label ${isVisible ? 'globe-label--visible' : 'globe-label--hidden'}`}
            >
              <div className="globe-label-dot" />
              <div className="globe-label-text">{label.name}</div>
              <div className="globe-label-sub">{label.nameEn}</div>
            </div>
          </Html>
        )
      })}
    </group>
  )
}
