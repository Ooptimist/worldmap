import { useState, useEffect } from 'react'
import { GeoFeature } from '@/types'

interface GeoDataState {
  countries: GeoFeature[]
  isLoading: boolean
  error: string | null
}

export function useGeoData() {
  const [state, setState] = useState<GeoDataState>({
    countries: [],
    isLoading: true,
    error: null,
  })
  
  useEffect(() => {
    const loadCountries = async () => {
      try {
        setState((prev) => ({ ...prev, isLoading: true, error: null }))
        
        const response = await fetch(
          'https://unpkg.com/world-atlas@2/countries-110m.json'
        )
        
        if (!response.ok) {
          throw new Error('Failed to load country data')
        }
        
        const data = await response.json()
        
        // 动态导入 topojson-client
        const topojson = await import('topojson-client')
        const geojson = topojson.feature(data, data.objects.countries)
        
        setState({
          countries: (geojson as any).features as GeoFeature[],
          isLoading: false,
          error: null,
        })
      } catch (error) {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        }))
      }
    }
    
    loadCountries()
  }, [])
  
  return state
}

export function useCountryData(countryId: string) {
  const [data, setData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  
  useEffect(() => {
    if (!countryId) return
    
    const loadCountryData = async () => {
      setIsLoading(true)
      
      // 这里可以调用 API 获取国家详细信息
      // 示例使用静态数据
      const mockData: Record<string, any> = {
        CHN: {
          name: '中国',
          nameEn: 'China',
          capital: '北京',
          population: 1400000000,
          area: 9597000,
          continent: '亚洲',
        },
        USA: {
          name: '美国',
          nameEn: 'United States',
          capital: '华盛顿',
          population: 331000000,
          area: 9834000,
          continent: '北美洲',
        },
      }
      
      // 模拟 API 延迟
      await new Promise((resolve) => setTimeout(resolve, 300))
      
      setData(mockData[countryId] || null)
      setIsLoading(false)
    }
    
    loadCountryData()
  }, [countryId])
  
  return { data, isLoading }
}
