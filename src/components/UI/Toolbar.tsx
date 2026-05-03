import { useEarthStore } from '@/stores/earthStore'

function Icon({ d, size = 18 }: { d: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  )
}

export default function Toolbar({ onQuizClick, onMeasureClick }: { onQuizClick: () => void; onMeasureClick: () => void }) {
  const { 
    isRotating, 
    setIsRotating, 
    showClouds,
    setShowClouds,
    showBorders,
    setShowBorders,
    showLabels,
    setShowLabels,
    showGrid,
    setShowGrid,
    showProvinceMode,
    setShowProvinceMode,
    resetView 
  } = useEarthStore()
  
  return (
    <div className="toolbar">
      {/* 播放控制 */}
      <button
        className={`toolbar-btn ${isRotating ? 'active' : ''}`}
        onClick={() => setIsRotating(!isRotating)}
        title={isRotating ? '停止旋转' : '开始旋转'}
      >
        {isRotating
          ? <Icon d="M6 4h4v16H6zM14 4h4v16h-4z" />
          : <Icon d="M5 3l14 9-14 9V3z" />
        }
      </button>

      <div className="toolbar-divider" />

      {/* 图层控制 */}
      <button
        className={`toolbar-btn ${showClouds ? 'active' : ''}`}
        onClick={() => setShowClouds(!showClouds)}
        title={showClouds ? '隐藏云层' : '显示云层'}
      >
        <Icon d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" />
      </button>
      
      <button
        className={`toolbar-btn ${showBorders ? 'active' : ''}`}
        onClick={() => setShowBorders(!showBorders)}
        title={showBorders ? '隐藏边界' : '显示边界'}
      >
        <Icon d="M3 7l6-4 6 4 6-4v14l-6 4-6-4-6 4V7z" />
      </button>
      
      <button
        className={`toolbar-btn ${showLabels ? 'active' : ''}`}
        onClick={() => setShowLabels(!showLabels)}
        title={showLabels ? '隐藏标签' : '显示标签'}
      >
        <Icon d="M4 7V4h16v3M9 20h6M12 4v16" />
      </button>
      
      <button
        className={`toolbar-btn ${showGrid ? 'active' : ''}`}
        onClick={() => setShowGrid(!showGrid)}
        title={showGrid ? '隐藏经纬线' : '显示经纬线'}
      >
        <Icon d="M3 3h18v18H3zM3 9h18M3 15h18M9 3v18M15 3v18" />
      </button>

      <button
        className={`toolbar-btn ${showProvinceMode ? 'active' : ''}`}
        onClick={() => setShowProvinceMode(!showProvinceMode)}
        title={showProvinceMode ? '关闭省份视图' : '中国省份'}
      >
        <Icon d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
      </button>

      <div className="toolbar-divider" />

      {/* 工具 */}
      <button
        className="toolbar-btn"
        onClick={onQuizClick}
        title="地理知识问答"
      >
        <Icon d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20M9 10h6M9 14h4" />
      </button>
      
      <button
        className="toolbar-btn"
        onClick={onMeasureClick}
        title="距离测量"
      >
        <Icon d="M2 12h5M17 12h5M12 2v5M12 17v5M4.93 4.93l3.54 3.54M15.54 15.54l3.54 3.54M4.93 19.07l3.54-3.54M15.54 8.46l3.54-3.54" />
      </button>

      <div className="toolbar-divider" />

      {/* 视角 */}
      <button
        className="toolbar-btn"
        onClick={resetView}
        title="重置视角"
      >
        <Icon d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8M3 3v5h5" />
      </button>
    </div>
  )
}
