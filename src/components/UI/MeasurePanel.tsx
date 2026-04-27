import { useState, useCallback } from 'react'
import { calculateDistance } from '@/utils/geo'

interface MeasurePoint {
  lat: number
  lon: number
  name?: string
}

interface MeasurePanelProps {
  isOpen: boolean
  onClose: () => void
}

export default function MeasurePanel({ isOpen, onClose }: MeasurePanelProps) {
  const [point1, setPoint1] = useState<MeasurePoint>({ lat: 0, lon: 0 })
  const [point2, setPoint2] = useState<MeasurePoint>({ lat: 0, lon: 0 })
  const [distance, setDistance] = useState<number | null>(null)
  
  const handleCalculate = useCallback(() => {
    setDistance(calculateDistance(point1.lat, point1.lon, point2.lat, point2.lon))
  }, [point1, point2])
  
  const handleClear = useCallback(() => {
    setPoint1({ lat: 0, lon: 0 })
    setPoint2({ lat: 0, lon: 0 })
    setDistance(null)
  }, [])
  
  const handlePreset = useCallback((preset: string) => {
    const presets: Record<string, { point1: MeasurePoint; point2: MeasurePoint }> = {
      '北京-上海': {
        point1: { lat: 39.9042, lon: 116.4074, name: '北京' },
        point2: { lat: 31.2304, lon: 121.4737, name: '上海' },
      },
      '北京-纽约': {
        point1: { lat: 39.9042, lon: 116.4074, name: '北京' },
        point2: { lat: 40.7128, lon: -74.0060, name: '纽约' },
      },
      '伦敦-巴黎': {
        point1: { lat: 51.5074, lon: -0.1278, name: '伦敦' },
        point2: { lat: 48.8566, lon: 2.3522, name: '巴黎' },
      },
      '东京-悉尼': {
        point1: { lat: 35.6762, lon: 139.6503, name: '东京' },
        point2: { lat: -33.8688, lon: 151.2093, name: '悉尼' },
      },
    }
    const data = presets[preset]
    if (data) {
      setPoint1(data.point1)
      setPoint2(data.point2)
      setDistance(null)
    }
  }, [])
  
  if (!isOpen) return null
  
  return (
    <>
      <div className="overlay" onClick={onClose} />
      <div className="measure-panel">
        <div className="measure-header">
          <div className="measure-title">距离测量</div>
          <button className="measure-close-btn" onClick={onClose}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="measure-content">
          <div className="measure-instructions">
            输入两点经纬度计算球面距离
          </div>
          
          <div className="measure-presets">
            {['北京-上海', '北京-纽约', '伦敦-巴黎', '东京-悉尼'].map((preset) => (
              <button
                key={preset}
                className="measure-preset-btn"
                onClick={() => handlePreset(preset)}
              >
                {preset}
              </button>
            ))}
          </div>
          
          <div className="measure-points">
            <div className="measure-point">
              <div className="measure-point-label">
                起点{point1.name ? ` · ${point1.name}` : ''}
              </div>
              <div className="measure-point-inputs">
                <input
                  type="number"
                  className="measure-input"
                  placeholder="纬度"
                  value={point1.lat || ''}
                  onChange={(e) => setPoint1({ ...point1, lat: parseFloat(e.target.value) || 0 })}
                  min={-90} max={90} step={0.0001}
                />
                <input
                  type="number"
                  className="measure-input"
                  placeholder="经度"
                  value={point1.lon || ''}
                  onChange={(e) => setPoint1({ ...point1, lon: parseFloat(e.target.value) || 0 })}
                  min={-180} max={180} step={0.0001}
                />
              </div>
            </div>
            
            <div className="measure-point">
              <div className="measure-point-label">
                终点{point2.name ? ` · ${point2.name}` : ''}
              </div>
              <div className="measure-point-inputs">
                <input
                  type="number"
                  className="measure-input"
                  placeholder="纬度"
                  value={point2.lat || ''}
                  onChange={(e) => setPoint2({ ...point2, lat: parseFloat(e.target.value) || 0 })}
                  min={-90} max={90} step={0.0001}
                />
                <input
                  type="number"
                  className="measure-input"
                  placeholder="经度"
                  value={point2.lon || ''}
                  onChange={(e) => setPoint2({ ...point2, lon: parseFloat(e.target.value) || 0 })}
                  min={-180} max={180} step={0.0001}
                />
              </div>
            </div>
          </div>
          
          {distance !== null && (
            <div className="measure-result">
              <div className="measure-result-label">球面距离</div>
              <div className="measure-result-value">
                {distance >= 1000 ? (distance / 1000).toFixed(2) : distance.toFixed(1)}
                <span className="measure-result-unit">
                  {distance >= 1000 ? '千公里' : '公里'}
                </span>
              </div>
            </div>
          )}
          
          <div className="measure-actions">
            <button className="measure-btn measure-btn-secondary" onClick={handleClear}>
              清除
            </button>
            <button className="measure-btn measure-btn-primary" onClick={handleCalculate}>
              计算
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
