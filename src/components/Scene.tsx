import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { Earth } from './Earth'
import { EarthControls } from './Controls'
import { CountryBorders, CountryLabels, ProvinceBorders, GridLines } from './Layers'

export default function Scene() {
  return (
    <div className="canvas-container">
      <Canvas
        camera={{
          position: [0, 0, 3],
          fov: 45,
          near: 0.1,
          far: 1000,
        }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
          preserveDrawingBuffer: true,
        }}
        dpr={[1, 2]}
      >
        {/* 环境光 */}
        <ambientLight intensity={0.4} />
        
        {/* 主光源（太阳光） */}
        <directionalLight
          position={[5, 3, 5]}
          intensity={1.5}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        
        {/* 补光 */}
        <pointLight position={[-5, -3, -5]} intensity={0.3} />
        
        <Suspense fallback={null}>
          <Earth />
          <CountryBorders />
          <CountryLabels />
          <ProvinceBorders />
          <GridLines />
          <EarthControls />
        </Suspense>
      </Canvas>
    </div>
  )
}
