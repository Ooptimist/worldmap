import { useEarthStore } from '@/stores/earthStore'

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
    resetView 
  } = useEarthStore()
  
  return (
    <div className="toolbar">
      <button
        className={`toolbar-btn ${isRotating ? 'active' : ''}`}
        onClick={() => setIsRotating(!isRotating)}
        title={isRotating ? '停止旋转' : '开始旋转'}
      >
        {isRotating ? '⏸' : '▶'}
      </button>
      
      <button
        className={`toolbar-btn ${showClouds ? 'active' : ''}`}
        onClick={() => setShowClouds(!showClouds)}
        title={showClouds ? '隐藏云层' : '显示云层'}
      >
        ☁
      </button>
      
      <button
        className={`toolbar-btn ${showBorders ? 'active' : ''}`}
        onClick={() => setShowBorders(!showBorders)}
        title={showBorders ? '隐藏边界' : '显示边界'}
      >
        🗺
      </button>
      
      <button
        className={`toolbar-btn ${showLabels ? 'active' : ''}`}
        onClick={() => setShowLabels(!showLabels)}
        title={showLabels ? '隐藏标签' : '显示标签'}
      >
        🏷
      </button>
      
      <button
        className={`toolbar-btn ${showGrid ? 'active' : ''}`}
        onClick={() => setShowGrid(!showGrid)}
        title={showGrid ? '隐藏经纬线' : '显示经纬线'}
      >
        📐
      </button>
      
      <button
        className="toolbar-btn"
        onClick={onQuizClick}
        title="地理知识问答"
      >
        📚
      </button>
      
      <button
        className="toolbar-btn"
        onClick={onMeasureClick}
        title="距离测量"
      >
        📏
      </button>
      
      <button
        className="toolbar-btn"
        onClick={resetView}
        title="重置视角"
      >
        🏠
      </button>
    </div>
  )
}
