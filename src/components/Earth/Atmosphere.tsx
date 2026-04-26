import { useMemo } from 'react'
import * as THREE from 'three'

export default function Atmosphere() {
  // 大气层着色器
  const atmosphereMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vPosition;
        
        void main() {
          vNormal = normalize(normalMatrix * normal);
          vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vNormal;
        varying vec3 vPosition;
        
        void main() {
          vec3 viewDirection = normalize(-vPosition);
          float intensity = pow(0.7 - dot(vNormal, viewDirection), 2.0);
          vec3 atmosphereColor = vec3(0.3, 0.6, 1.0);
          gl_FragColor = vec4(atmosphereColor, intensity * 0.6);
        }
      `,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      transparent: true,
      depthWrite: false,
    })
  }, [])
  
  return (
    <mesh material={atmosphereMaterial}>
      <sphereGeometry args={[1.15, 64, 64]} />
    </mesh>
  )
}
