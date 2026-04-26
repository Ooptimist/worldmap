import { useState, useCallback, useEffect } from 'react'
import { useEarthStore } from '@/stores/earthStore'
import { searchGeoFeatures } from '@/utils/geo'
import { GeoFeature } from '@/types'

export default function SearchPanel() {
  const { 
    searchQuery, 
    setSearchQuery, 
    searchResults, 
    setSearchResults,
    setSelectedCountry 
  } = useEarthStore()
  
  const [isFocused, setIsFocused] = useState(false)
  const [countries, setCountries] = useState<GeoFeature[]>([])
  
  // 加载国家数据
  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetch('https://unpkg.com/world-atlas@2/countries-110m.json')
        const data = await response.json()
        
        // 动态导入 topojson-client
        const topojson = await import('topojson-client')
        const geojson = topojson.feature(data, data.objects.countries)
        setCountries((geojson as any).features as GeoFeature[])
      } catch (err) {
        console.error('Failed to load countries:', err)
      }
    }
    
    loadData()
  }, [])
  
  // 搜索处理
  const handleSearch = useCallback(
    (query: string) => {
      setSearchQuery(query)
      if (query.length >= 2) {
        const results = searchGeoFeatures(countries, query)
        setSearchResults(results)
      } else {
        setSearchResults([])
      }
    },
    [countries, setSearchQuery, setSearchResults]
  )
  
  // 选择搜索结果
  const handleSelectResult = useCallback(
    (result: any) => {
      setSelectedCountry({
        id: result.nameEn,
        name: result.name,
        nameEn: result.nameEn,
        capital: '',
        population: 0,
        area: 0,
        continent: '',
        coordinates: result.coordinates,
      })
      setSearchQuery(result.name)
      setSearchResults([])
      setIsFocused(false)
    },
    [setSelectedCountry, setSearchQuery, setSearchResults]
  )
  
  return (
    <div className="search-panel">
      <div className="search-input-wrapper">
        <span className="search-icon">🔍</span>
        <input
          type="text"
          className="search-input"
          placeholder="搜索国家、城市..."
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 200)}
        />
      </div>
      
      {isFocused && searchResults.length > 0 && (
        <div className="search-results">
          {searchResults.map((result, index) => (
            <div
              key={index}
              className="search-result-item"
              onClick={() => handleSelectResult(result)}
            >
              <div className="search-result-name">{result.name}</div>
              <div className="search-result-subtitle">
                {result.type === 'country' ? '国家' : '地区'} • {result.nameEn}
              </div>
            </div>
          ))}
        </div>
      )}
      
      {isFocused && searchQuery.length >= 2 && searchResults.length === 0 && (
        <div className="search-results">
          <div className="search-result-item">
            <div className="search-result-name" style={{ color: '#94a3b8' }}>
              未找到结果
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
