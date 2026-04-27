import { useState, useEffect } from 'react'
import Scene from './components/Scene'
import { SearchPanel, InfoPanel, Toolbar, QuizPanel, MeasurePanel } from './components/UI'
import { useEarthStore } from './stores/earthStore'
import './styles/global.css'

export default function App() {
  const [isLoading, setIsLoading] = useState(true)
  const [isQuizOpen, setIsQuizOpen] = useState(false)
  const [isMeasureOpen, setIsMeasureOpen] = useState(false)
  const { selectedCountry } = useEarthStore()
  
  // 模拟加载
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1500)
    
    return () => clearTimeout(timer)
  }, [])
  
  return (
    <div className="app-container">
      {/* 加载界面 */}
      {isLoading && (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
          <div className="loading-text">加载地球仪...</div>
        </div>
      )}
      
      {/* 3D 场景 */}
      <Scene />
      
      {/* UI 覆盖层 */}
      <div className="ui-overlay">
        {/* 搜索面板 */}
        <SearchPanel />
        
        {/* 信息面板 */}
        {selectedCountry && <InfoPanel />}
        
        {/* 问答面板 */}
        <QuizPanel isOpen={isQuizOpen} onClose={() => setIsQuizOpen(false)} />
        
        {/* 测量工具 */}
        <MeasurePanel isOpen={isMeasureOpen} onClose={() => setIsMeasureOpen(false)} />
        
        {/* 工具栏 */}
        <Toolbar
          onQuizClick={() => setIsQuizOpen(true)}
          onMeasureClick={() => setIsMeasureOpen(true)}
        />
      </div>
    </div>
  )
}
