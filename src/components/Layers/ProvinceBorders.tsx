import { useState, useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useEarthStore } from '@/stores/earthStore'
import { latLonToVector3 } from '@/utils/geo'
import * as THREE from 'three'

// 中国省份数据（简化）
const chinaProvinces = [
  { name: '北京市', lat: 39.9042, lon: 116.4074 },
  { name: '上海市', lat: 31.2304, lon: 121.4737 },
  { name: '广东省', lat: 23.1317, lon: 113.2664 },
  { name: '江苏省', lat: 32.0617, lon: 118.7778 },
  { name: '浙江省', lat: 30.2741, lon: 120.1551 },
  { name: '山东省', lat: 36.6683, lon: 116.9972 },
  { name: '河南省', lat: 34.7657, lon: 113.7536 },
  { name: '四川省', lat: 30.5723, lon: 104.0665 },
  { name: '湖北省', lat: 30.5928, lon: 114.3055 },
  { name: '湖南省', lat: 28.2282, lon: 112.9388 },
  { name: '河北省', lat: 38.0428, lon: 114.5149 },
  { name: '安徽省', lat: 31.8612, lon: 117.2830 },
  { name: '福建省', lat: 26.0745, lon: 119.2965 },
  { name: '江西省', lat: 28.6820, lon: 115.8922 },
  { name: '辽宁省', lat: 41.8057, lon: 123.4315 },
  { name: '陕西省', lat: 34.2658, lon: 108.9541 },
  { name: '重庆市', lat: 29.4316, lon: 106.9123 },
  { name: '天津市', lat: 39.3434, lon: 117.3616 },
  { name: '云南省', lat: 25.0406, lon: 102.7123 },
  { name: '广西壮族自治区', lat: 22.8170, lon: 108.3665 },
  { name: '山西省', lat: 37.8706, lon: 112.5489 },
  { name: '内蒙古自治区', lat: 40.8183, lon: 111.7655 },
  { name: '贵州省', lat: 26.6470, lon: 106.6302 },
  { name: '吉林省', lat: 43.8380, lon: 125.3245 },
  { name: '黑龙江省', lat: 45.7420, lon: 126.6610 },
  { name: '甘肃省', lat: 36.0611, lon: 103.8343 },
  { name: '海南省', lat: 19.2000, lon: 109.9900 },
  { name: '宁夏回族自治区', lat: 38.4872, lon: 106.2309 },
  { name: '青海省', lat: 36.6171, lon: 101.7782 },
  { name: '西藏自治区', lat: 29.6500, lon: 91.1000 },
  { name: '新疆维吾尔自治区', lat: 43.7930, lon: 87.6271 },
  { name: '台湾省', lat: 23.6978, lon: 120.9605 },
  { name: '香港特别行政区', lat: 22.3193, lon: 114.1694 },
  { name: '澳门特别行政区', lat: 22.1987, lon: 113.5439 },
]

// 预计算省份标记的法线（用于背面剔除）
const provinceData = chinaProvinces.map((p) => ({
  ...p,
  position: latLonToVector3(p.lat, p.lon, 1.005),
  normal: latLonToVector3(p.lat, p.lon, 1).normalize(),
}))

export default function ProvinceBorders() {
  const { selectedCountry, showBorders } = useEarthStore()
  const { camera } = useThree()
  const [showProvinces, setShowProvinces] = useState(false)
  const [visibleProvinces, setVisibleProvinces] = useState<Set<string>>(new Set())
  const prevVisibleRef = useRef<Set<string>>(new Set())
  const frameCount = useRef(0)

  // 当选中中国时显示省份
  useEffect(() => {
    if (selectedCountry?.id === 'CHN') {
      setShowProvinces(true)
    } else {
      setShowProvinces(false)
    }
  }, [selectedCountry])

  // 背面剔除：只显示正对相机的省份标记
  useFrame(() => {
    if (!showProvinces) return

    const toCamera = camera.position.clone().normalize()
    const newVisible = new Set<string>()

    for (const province of provinceData) {
      const dot = province.normal.dot(toCamera)
      if (dot > 0.2) {
        newVisible.add(province.name)
      }
    }

    // 每3帧检测一次
    frameCount.current++
    if (frameCount.current % 3 !== 0) return

    // 只在变化时更新
    const prev = prevVisibleRef.current
    if (prev.size !== newVisible.size) {
      prevVisibleRef.current = newVisible
      setVisibleProvinces(newVisible)
      return
    }
    for (const key of newVisible) {
      if (!prev.has(key)) {
        prevVisibleRef.current = newVisible
        setVisibleProvinces(newVisible)
        return
      }
    }
  })

  if (!showProvinces || !showBorders) {
    return null
  }

  return null
}
