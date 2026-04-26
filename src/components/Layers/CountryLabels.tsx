import { useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import { useEarthStore } from '@/stores/earthStore'
import { latLonToVector3 } from '@/utils/geo'

interface CountryLabel {
  name: string
  nameEn: string
  lat: number
  lon: number
  population: number
}

// 主要国家数据
const majorCountries: CountryLabel[] = [
  { name: '中国', nameEn: 'China', lat: 35.8617, lon: 104.1954, population: 1400000000 },
  { name: '美国', nameEn: 'USA', lat: 37.0902, lon: -95.7129, population: 331000000 },
  { name: '俄罗斯', nameEn: 'Russia', lat: 61.5240, lon: 105.3188, population: 146000000 },
  { name: '加拿大', nameEn: 'Canada', lat: 56.1304, lon: -106.3468, population: 38000000 },
  { name: '巴西', nameEn: 'Brazil', lat: -14.2350, lon: -51.9253, population: 213000000 },
  { name: '澳大利亚', nameEn: 'Australia', lat: -25.2744, lon: 133.7751, population: 26000000 },
  { name: '印度', nameEn: 'India', lat: 20.5937, lon: 78.9629, population: 1380000000 },
  { name: '阿根廷', nameEn: 'Argentina', lat: -38.4161, lon: -63.6167, population: 45000000 },
  { name: '哈萨克斯坦', nameEn: 'Kazakhstan', lat: 48.0196, lon: 66.9237, population: 19000000 },
  { name: '阿尔及利亚', nameEn: 'Algeria', lat: 28.0339, lon: 1.6596, population: 44000000 },
  { name: '刚果(金)', nameEn: 'DR Congo', lat: -4.0383, lon: 21.7587, population: 90000000 },
  { name: '沙特阿拉伯', nameEn: 'Saudi Arabia', lat: 23.8859, lon: 45.0792, population: 35000000 },
  { name: '墨西哥', nameEn: 'Mexico', lat: 23.6345, lon: -102.5528, population: 130000000 },
  { name: '印度尼西亚', nameEn: 'Indonesia', lat: -0.7893, lon: 113.9213, population: 274000000 },
  { name: '日本', nameEn: 'Japan', lat: 36.2048, lon: 138.2529, population: 126000000 },
  { name: '德国', nameEn: 'Germany', lat: 51.1657, lon: 10.4515, population: 83000000 },
  { name: '英国', nameEn: 'UK', lat: 55.3781, lon: -3.4360, population: 68000000 },
  { name: '法国', nameEn: 'France', lat: 46.2276, lon: 2.2137, population: 67000000 },
  { name: '意大利', nameEn: 'Italy', lat: 41.8719, lon: 12.5674, population: 60000000 },
  { name: '韩国', nameEn: 'South Korea', lat: 35.9078, lon: 127.7669, population: 52000000 },
  { name: '西班牙', nameEn: 'Spain', lat: 40.4637, lon: -3.7492, population: 47000000 },
  { name: '南非', nameEn: 'South Africa', lat: -30.5595, lon: 22.9375, population: 60000000 },
  { name: '埃及', nameEn: 'Egypt', lat: 26.8206, lon: 30.8025, population: 102000000 },
  { name: '土耳其', nameEn: 'Turkey', lat: 38.9637, lon: 35.2433, population: 84000000 },
  { name: '伊朗', nameEn: 'Iran', lat: 32.4279, lon: 53.6880, population: 84000000 },
]

export default function CountryLabels() {
  const { showLabels } = useEarthStore()
  const { camera } = useThree()
  const [visibleLabels, setVisibleLabels] = useState<CountryLabel[]>([])
  
  // 根据相机距离和人口过滤显示的标签
  useFrame(() => {
    const distance = camera.position.length()
    let filtered: CountryLabel[] = []
    
    if (distance < 3) {
      // 近距离显示所有主要国家
      filtered = majorCountries
    } else if (distance < 5) {
      // 中距离显示人口较多的国家
      filtered = majorCountries.filter((c) => c.population > 100000000)
    } else {
      // 远距离只显示超大国家
      filtered = majorCountries.filter((c) => c.population > 500000000)
    }
    
    setVisibleLabels(filtered)
  })
  
  if (!showLabels) {
    return null
  }
  
  return (
    <group>
      {visibleLabels.map((country) => {
        const position = latLonToVector3(country.lat, country.lon, 1.02)
        
        return (
          <Html
            key={country.nameEn}
            position={position}
            center
            distanceFactor={5}
            style={{
              pointerEvents: 'none',
              userSelect: 'none',
            }}
          >
            <div
              style={{
                background: 'rgba(0, 0, 0, 0.7)',
                color: 'white',
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '12px',
                whiteSpace: 'nowrap',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                backdropFilter: 'blur(4px)',
              }}
            >
              <div style={{ fontWeight: 'bold' }}>{country.name}</div>
              <div style={{ fontSize: '10px', opacity: 0.8 }}>
                {country.nameEn}
              </div>
            </div>
          </Html>
        )
      })}
    </group>
  )
}
