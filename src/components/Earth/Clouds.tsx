import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// 云层顶点着色器
const cloudVertexShader = `
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vPosition;
  varying vec3 vWorldPosition;
  
  void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
    vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

// 云层片段着色器 - 使用3D坐标避免接缝
const cloudFragmentShader = `
  uniform float time;
  
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vPosition;
  varying vec3 vWorldPosition;
  
  // 3D噪声函数
  float hash(vec3 p) {
    p = fract(p * vec3(443.897, 441.423, 437.195));
    p += dot(p, p.yzx + 19.19);
    return fract((p.x + p.y) * p.z);
  }
  
  float noise3D(vec3 p) {
    vec3 i = floor(p);
    vec3 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    
    float a = hash(i);
    float b = hash(i + vec3(1.0, 0.0, 0.0));
    float c = hash(i + vec3(0.0, 1.0, 0.0));
    float d = hash(i + vec3(1.0, 1.0, 0.0));
    float e = hash(i + vec3(0.0, 0.0, 1.0));
    float f2 = hash(i + vec3(1.0, 0.0, 1.0));
    float g = hash(i + vec3(0.0, 1.0, 1.0));
    float h = hash(i + vec3(1.0, 1.0, 1.0));
    
    float k0 = a;
    float k1 = b - a;
    float k2 = c - a;
    float k3 = e - a;
    float k4 = a - b - c + d;
    float k5 = a - b - e + f2;
    float k6 = a - c - e + g;
    float k7 = -a + b + c - d + e - f2 - g + h;
    
    return k0 + k1 * f.x + k2 * f.y + k3 * f.z + k4 * f.x * f.y + k5 * f.x * f.z + k6 * f.y * f.z + k7 * f.x * f.y * f.z;
  }
  
  // 3D分形噪声
  float fbm3D(vec3 p) {
    float value = 0.0;
    float amplitude = 0.5;
    float frequency = 1.0;
    
    for (int i = 0; i < 5; i++) {
      value += amplitude * noise3D(p * frequency);
      amplitude *= 0.5;
      frequency *= 2.0;
    }
    
    return value;
  }
  
  void main() {
    // 使用世界坐标计算噪声，避免UV接缝问题
    vec3 pos = normalize(vWorldPosition);
    
    // 添加时间偏移实现动画
    vec3 animPos = pos + vec3(time * 0.02, time * 0.01, time * 0.015);
    
    // 多层噪声叠加
    float largeClouds = fbm3D(animPos * 2.0);
    float mediumClouds = fbm3D(animPos * 4.0);
    float smallClouds = fbm3D(animPos * 8.0);
    
    // 合并云层
    float cloudDensity = largeClouds * 0.5 + mediumClouds * 0.3 + smallClouds * 0.2;
    
    // 纬度影响（基于y坐标）
    float latEffect = sin(acos(pos.y)) * 0.3 + 0.7;
    cloudDensity *= latEffect;
    
    // 应用对比度曲线
    cloudDensity = pow(cloudDensity, 1.5);
    cloudDensity = smoothstep(0.3, 0.7, cloudDensity);
    
    // 云层颜色
    vec3 cloudColor = vec3(0.95, 0.96, 0.98);
    
    // 边缘淡化
    float fresnel = pow(1.0 - dot(vNormal, normalize(-vPosition)), 2.0);
    float alpha = cloudDensity * 0.6 * (1.0 - fresnel * 0.3);
    
    gl_FragColor = vec4(cloudColor, alpha);
  }
`

export default function Clouds() {
  const meshRef = useRef<THREE.Mesh>(null)
  
  // 创建着色器材质
  const shaderMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader: cloudVertexShader,
      fragmentShader: cloudFragmentShader,
      uniforms: {
        time: { value: 0 },
      },
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
    })
  }, [])
  
  // 更新时间uniform
  useFrame((state) => {
    if (shaderMaterial) {
      shaderMaterial.uniforms.time.value = state.clock.elapsedTime
    }
  })
  
  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[1.015, 48, 48]} />
      <primitive object={shaderMaterial} attach="material" />
    </mesh>
  )
}
