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
  
  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetch('https://unpkg.com/world-atlas@2/countries-110m.json')
        const data = await response.json()
        const topojson = await import('topojson-client')
        const geojson = topojson.feature(data, data.objects.countries)
        setCountries((geojson as any).features as GeoFeature[])
      } catch (err) {
        console.error('Failed to load countries:', err)
      }
    }
    loadData()
  }, [])
  
  const handleSearch = useCallback(
    (query: string) => {
      setSearchQuery(query)
      if (query.length >= 2) {
        setSearchResults(searchGeoFeatures(countries, query))
      } else {
        setSearchResults([])
      }
    },
    [countries, setSearchQuery, setSearchResults]
  )
  
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
  
  const showResults = isFocused && searchQuery.length >= 2
  const hasResults = searchResults.length > 0

  return (
    <div className="search-panel">
      <div className="search-input-wrapper">
        <span className="search-icon">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
        </span>
        <input
          type="text"
          className="search-input"
          placeholder="搜索国家..."
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 200)}
        />
      </div>
      
      {showResults && (
        <div className="search-results">
          {hasResults ? searchResults.map((result, index) => (
            <div
              key={index}
              className="search-result-item"
              onClick={() => handleSelectResult(result)}
            >
              <div className="search-result-name">{result.name}</div>
              <div className="search-result-subtitle">
                {result.type === 'country' ? '国家' : '地区'} · {result.nameEn}
              </div>
            </div>
          )) : (
            <div className="search-result-item">
              <div className="search-result-name" style={{ color: 'var(--text-muted)' }}>
                未找到结果
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
