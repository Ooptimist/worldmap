import { useMemo } from 'react'
import { useEarthStore } from '@/stores/earthStore'
import { formatNumber, formatArea } from '@/utils/geo'
import { getCountryById } from '@/data/countries'

export default function InfoPanel() {
  const { selectedCountry, setSelectedCountry } = useEarthStore()
  
  // 获取国家详细信息
  const countryInfo = useMemo(() => {
    if (!selectedCountry) return null
    
    // 尝试从数据中获取
    const data = getCountryById(selectedCountry.id)
    if (data) {
      return data
    }
    
    // 返回默认数据
    return {
      name: selectedCountry.name,
      nameEn: selectedCountry.nameEn,
      capital: '未知',
      population: 0,
      area: 0,
      continent: '未知',
      region: '未知',
      languages: [],
      currency: '未知',
      timezone: '未知',
      gdp: 0,
      coordinates: { lat: 0, lon: 0 },
      description: '暂无详细信息',
      neighbors: [],
      climate: '未知',
      terrain: '未知',
      resources: [],
      government: '未知',
      independence: '未知',
      religion: '未知',
      literacy: '未知',
      lifeExpectancy: '未知',
      hdi: 0,
    }
  }, [selectedCountry])
  
  if (!selectedCountry || !countryInfo) {
    return null
  }
  
  return (
    <div className="info-panel">
      <div className="info-panel-header">
        <button 
          className="info-close-btn"
          onClick={() => setSelectedCountry(null)}
        >
          ✕
        </button>
        <div className="info-panel-title">{countryInfo.name}</div>
        <div className="info-panel-subtitle">{countryInfo.nameEn}</div>
      </div>
      
      <div className="info-panel-content">
        {/* 基本信息 */}
        <div className="info-section">
          <div className="info-section-title">基本信息</div>
          <div className="info-grid">
            <div className="info-item">
              <div className="info-item-label">首都</div>
              <div className="info-item-value">{countryInfo.capital}</div>
            </div>
            <div className="info-item">
              <div className="info-item-label">大洲</div>
              <div className="info-item-value">{countryInfo.continent}</div>
            </div>
            <div className="info-item">
              <div className="info-item-label">人口</div>
              <div className="info-item-value">
                {formatNumber(countryInfo.population)}
              </div>
            </div>
            <div className="info-item">
              <div className="info-item-label">面积</div>
              <div className="info-item-value">
                {formatArea(countryInfo.area)}
              </div>
            </div>
          </div>
        </div>
        
        {/* 地理信息 */}
        <div className="info-section">
          <div className="info-section-title">地理信息</div>
          <div className="info-grid">
            <div className="info-item">
              <div className="info-item-label">气候</div>
              <div className="info-item-value">{countryInfo.climate}</div>
            </div>
            <div className="info-item">
              <div className="info-item-label">地形</div>
              <div className="info-item-value">{countryInfo.terrain}</div>
            </div>
            <div className="info-item">
              <div className="info-item-label">坐标</div>
              <div className="info-item-value">
                {countryInfo.coordinates.lat.toFixed(2)}°N, {countryInfo.coordinates.lon.toFixed(2)}°E
              </div>
            </div>
            <div className="info-item">
              <div className="info-item-label">时区</div>
              <div className="info-item-value">{countryInfo.timezone}</div>
            </div>
          </div>
        </div>
        
        {/* 经济信息 */}
        <div className="info-section">
          <div className="info-section-title">经济信息</div>
          <div className="info-grid">
            <div className="info-item">
              <div className="info-item-label">GDP</div>
              <div className="info-item-value">
                ${formatNumber(countryInfo.gdp)}
              </div>
            </div>
            <div className="info-item">
              <div className="info-item-label">货币</div>
              <div className="info-item-value">{countryInfo.currency}</div>
            </div>
            <div className="info-item">
              <div className="info-item-label">语言</div>
              <div className="info-item-value">
                {countryInfo.languages?.join(', ') || '未知'}
              </div>
            </div>
            <div className="info-item">
              <div className="info-item-label">政府</div>
              <div className="info-item-value">{countryInfo.government}</div>
            </div>
          </div>
        </div>
        
        {/* 社会信息 */}
        <div className="info-section">
          <div className="info-section-title">社会信息</div>
          <div className="info-grid">
            <div className="info-item">
              <div className="info-item-label">识字率</div>
              <div className="info-item-value">{countryInfo.literacy}</div>
            </div>
            <div className="info-item">
              <div className="info-item-label">预期寿命</div>
              <div className="info-item-value">{countryInfo.lifeExpectancy}</div>
            </div>
            <div className="info-item">
              <div className="info-item-label">HDI</div>
              <div className="info-item-value">{countryInfo.hdi}</div>
            </div>
            <div className="info-item">
              <div className="info-item-label">宗教</div>
              <div className="info-item-value">{countryInfo.religion}</div>
            </div>
          </div>
        </div>
        
        {/* 资源 */}
        {countryInfo.resources && countryInfo.resources.length > 0 && (
          <div className="info-section">
            <div className="info-section-title">主要资源</div>
            <div style={{ 
              display: 'flex', 
              flexWrap: 'wrap', 
              gap: '8px' 
            }}>
              {countryInfo.resources.map((resource, index) => (
                <span
                  key={index}
                  style={{
                    background: 'var(--bg-tertiary)',
                    padding: '4px 12px',
                    borderRadius: '16px',
                    fontSize: '13px',
                    color: 'var(--text-secondary)',
                  }}
                >
                  {resource}
                </span>
              ))}
            </div>
          </div>
        )}
        
        {/* 邻国 */}
        {countryInfo.neighbors && countryInfo.neighbors.length > 0 && (
          <div className="info-section">
            <div className="info-section-title">邻国</div>
            <div style={{ 
              display: 'flex', 
              flexWrap: 'wrap', 
              gap: '8px' 
            }}>
              {countryInfo.neighbors.map((neighbor, index) => (
                <span
                  key={index}
                  style={{
                    background: 'var(--bg-tertiary)',
                    padding: '4px 12px',
                    borderRadius: '16px',
                    fontSize: '13px',
                    color: 'var(--text-secondary)',
                  }}
                >
                  {neighbor}
                </span>
              ))}
            </div>
          </div>
        )}
        
        {/* 简介 */}
        <div className="info-section">
          <div className="info-section-title">简介</div>
          <p style={{ 
            fontSize: '14px', 
            lineHeight: '1.6', 
            color: '#94a3b8' 
          }}>
            {countryInfo.description}
          </p>
        </div>
      </div>
    </div>
  )
}
