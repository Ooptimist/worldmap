import { Suspense, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { Earth } from './Earth'
import { EarthControls } from './Controls'
import { CountryBorders, CountryLabels, ProvinceBorders, CityMarkers, GridLines } from './Layers'

function DynamicLighting() {
  const sunAngle = useRef(0)
  const dirLightRef = useRef<THREE.DirectionalLight>(null)

  useFrame((_, delta) => {
    sunAngle.current += delta * 0.05
    if (dirLightRef.current) {
      dirLightRef.current.position.set(
        Math.cos(sunAngle.current) * 5,
        1.5 + Math.sin(sunAngle.current * 0.3) * 0.5,
        Math.sin(sunAngle.current) * 5
      )
    }
  })

  return (
    <>
      <ambientLight intensity={0.35} />
      <directionalLight
        ref={dirLightRef}
        position={[5, 3, 5]}
        intensity={1.5}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <pointLight position={[-5, -3, -5]} intensity={0.2} />
    </>
  )
}

export default function Scene() {
  return (
    <div className="canvas-container">
      <Canvas
        camera={{
          position: [-0.636, 1.722, -2.373],
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
        <DynamicLighting />
        
        <Suspense fallback={null}>
          <Earth />
          <CountryBorders />
          <CountryLabels />
          <ProvinceBorders />
          <CityMarkers />
          <GridLines />
          <EarthControls />
        </Suspense>
      </Canvas>
    </div>
  )
}
