import { useState, useMemo } from 'react'
import { useEarthStore } from '@/stores/earthStore'
import { formatNumber, formatArea } from '@/utils/geo'
import { getCountryById } from '@/data/countries'

export default function InfoPanel() {
  const { selectedCountry, setSelectedCountry } = useEarthStore()
  const [expanded, setExpanded] = useState(false)

  const countryInfo = useMemo(() => {
    if (!selectedCountry) return null
    const data = getCountryById(selectedCountry.id)
    if (data) return data
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

  if (!selectedCountry || !countryInfo) return null

  // 核心信息：始终展示
  const coreItems = [
    { label: '首都', value: countryInfo.capital },
    { label: '大洲', value: countryInfo.continent },
    { label: '人口', value: formatNumber(countryInfo.population) },
    { label: '面积', value: formatArea(countryInfo.area) },
  ]

  // 详细信息：展开后展示
  const detailSections = [
    {
      title: '地理',
      items: [
        { label: '气候', value: countryInfo.climate },
        { label: '地形', value: countryInfo.terrain },
        { label: '坐标', value: `${countryInfo.coordinates.lat.toFixed(2)}°, ${countryInfo.coordinates.lon.toFixed(2)}°` },
        { label: '时区', value: countryInfo.timezone },
      ],
    },
    {
      title: '经济',
      items: [
        { label: 'GDP', value: `$${formatNumber(countryInfo.gdp)}` },
        { label: '货币', value: countryInfo.currency },
        { label: '语言', value: countryInfo.languages?.join(', ') || '未知' },
        { label: '政体', value: countryInfo.government },
      ],
    },
    {
      title: '社会',
      items: [
        { label: '识字率', value: countryInfo.literacy },
        { label: '预期寿命', value: countryInfo.lifeExpectancy },
        { label: 'HDI', value: `${countryInfo.hdi}` },
        { label: '宗教', value: countryInfo.religion },
      ],
    },
  ]

  return (
    <div className="info-panel">
      <div className="info-panel-header">
        <div>
          <div className="info-panel-title">{countryInfo.name}</div>
          <div className="info-panel-subtitle">{countryInfo.nameEn}</div>
        </div>
        <button className="info-close-btn" onClick={() => setSelectedCountry(null)}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="info-panel-content">
        {/* 核心：始终可见 */}
        <div className="info-grid">
          {coreItems.map((item) => (
            <div key={item.label} className="info-item">
              <div className="info-item-label">{item.label}</div>
              <div className="info-item-value">{item.value}</div>
            </div>
          ))}
        </div>

        {/* 展开/收起 */}
        <button
          onClick={() => setExpanded(!expanded)}
          style={{
            width: '100%',
            padding: '8px 0',
            margin: '10px 0',
            background: 'none',
            border: 'none',
            borderTop: '1px solid var(--border)',
            color: 'var(--text-muted)',
            fontSize: '11px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '4px',
          }}
        >
          {expanded ? '收起详情' : '查看详情'}
          <svg
            width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
            style={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }}
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </button>

        {/* 详细信息 */}
        {expanded && (
          <>
            {detailSections.map((section) => (
              <div key={section.title} className="info-section">
                <div className="info-section-title">{section.title}</div>
                <div className="info-grid">
                  {section.items.map((item) => (
                    <div key={item.label} className="info-item">
                      <div className="info-item-label">{item.label}</div>
                      <div className="info-item-value">{item.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {countryInfo.resources && countryInfo.resources.length > 0 && (
              <div className="info-section">
                <div className="info-section-title">主要资源</div>
                <div className="info-tags">
                  {countryInfo.resources.map((r) => (
                    <span key={r} className="info-tag">{r}</span>
                  ))}
                </div>
              </div>
            )}

            {countryInfo.neighbors && countryInfo.neighbors.length > 0 && (
              <div className="info-section">
                <div className="info-section-title">邻国</div>
                <div className="info-tags">
                  {countryInfo.neighbors.map((n) => (
                    <span key={n} className="info-tag">{n}</span>
                  ))}
                </div>
              </div>
            )}

            <div className="info-section">
              <div className="info-section-title">简介</div>
              <p className="info-description">{countryInfo.description}</p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
