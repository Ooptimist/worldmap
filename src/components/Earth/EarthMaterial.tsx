import { useMemo } from 'react'
import * as THREE from 'three'

// 创建程序化地球纹理
function createEarthTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = 1024
  canvas.height = 512
  const ctx = canvas.getContext('2d')!
  
  // 海洋背景
  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height)
  gradient.addColorStop(0, '#1a5276')
  gradient.addColorStop(0.3, '#2980b9')
  gradient.addColorStop(0.5, '#3498db')
  gradient.addColorStop(0.7, '#2980b9')
  gradient.addColorStop(1, '#1a5276')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  
  // 绘制简化的大陆
  ctx.fillStyle = '#27ae60'
  
  // 北美洲
  ctx.beginPath()
  ctx.moveTo(150, 80)
  ctx.quadraticCurveTo(180, 100, 200, 120)
  ctx.quadraticCurveTo(220, 140, 210, 180)
  ctx.quadraticCurveTo(190, 200, 170, 190)
  ctx.quadraticCurveTo(150, 170, 140, 150)
  ctx.quadraticCurveTo(130, 120, 150, 80)
  ctx.fill()
  
  // 南美洲
  ctx.beginPath()
  ctx.moveTo(200, 220)
  ctx.quadraticCurveTo(220, 240, 230, 280)
  ctx.quadraticCurveTo(240, 320, 220, 360)
  ctx.quadraticCurveTo(200, 380, 190, 340)
  ctx.quadraticCurveTo(180, 300, 190, 260)
  ctx.quadraticCurveTo(195, 240, 200, 220)
  ctx.fill()
  
  // 欧洲
  ctx.fillStyle = '#2ecc71'
  ctx.beginPath()
  ctx.moveTo(480, 80)
  ctx.quadraticCurveTo(520, 90, 540, 110)
  ctx.quadraticCurveTo(550, 130, 530, 150)
  ctx.quadraticCurveTo(510, 160, 490, 140)
  ctx.quadraticCurveTo(470, 120, 480, 80)
  ctx.fill()
  
  // 非洲
  ctx.fillStyle = '#f39c12'
  ctx.beginPath()
  ctx.moveTo(500, 180)
  ctx.quadraticCurveTo(540, 200, 560, 240)
  ctx.quadraticCurveTo(570, 280, 550, 320)
  ctx.quadraticCurveTo(530, 340, 510, 320)
  ctx.quadraticCurveTo(490, 280, 480, 240)
  ctx.quadraticCurveTo(490, 200, 500, 180)
  ctx.fill()
  
  // 亚洲
  ctx.fillStyle = '#27ae60'
  ctx.beginPath()
  ctx.moveTo(600, 80)
  ctx.quadraticCurveTo(680, 100, 720, 140)
  ctx.quadraticCurveTo(750, 180, 730, 220)
  ctx.quadraticCurveTo(700, 240, 660, 220)
  ctx.quadraticCurveTo(620, 200, 600, 160)
  ctx.quadraticCurveTo(590, 120, 600, 80)
  ctx.fill()
  
  // 澳大利亚
  ctx.fillStyle = '#e74c3c'
  ctx.beginPath()
  ctx.moveTo(780, 300)
  ctx.quadraticCurveTo(820, 310, 840, 340)
  ctx.quadraticCurveTo(850, 370, 830, 380)
  ctx.quadraticCurveTo(800, 390, 780, 360)
  ctx.quadraticCurveTo(770, 330, 780, 300)
  ctx.fill()
  
  // 南极
  ctx.fillStyle = '#ecf0f1'
  ctx.beginPath()
  ctx.moveTo(0, 480)
  ctx.lineTo(canvas.width, 480)
  ctx.lineTo(canvas.width, 512)
  ctx.lineTo(0, 512)
  ctx.fill()
  
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  return texture
}

// 创建程序化云层纹理
function createCloudTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = 1024
  canvas.height = 512
  const ctx = canvas.getContext('2d')!
  
  // 透明背景
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  
  // 绘制云朵
  ctx.fillStyle = 'rgba(255, 255, 255, 0.6)'
  
  // 随机生成云朵
  for (let i = 0; i < 50; i++) {
    const x = Math.random() * canvas.width
    const y = Math.random() * canvas.height
    const radius = 20 + Math.random() * 60
    
    ctx.beginPath()
    ctx.arc(x, y, radius, 0, Math.PI * 2)
    ctx.fill()
    
    // 添加更多小云朵
    for (let j = 0; j < 3; j++) {
      const offsetX = (Math.random() - 0.5) * radius * 2
      const offsetY = (Math.random() - 0.5) * radius
      const smallRadius = radius * 0.5 + Math.random() * radius * 0.3
      
      ctx.beginPath()
      ctx.arc(x + offsetX, y + offsetY, smallRadius, 0, Math.PI * 2)
      ctx.fill()
    }
  }
  
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  return texture
}

export default function EarthMaterial() {
  // 创建地球纹理
  const earthTexture = useMemo(() => createEarthTexture(), [])
  
  return (
    <meshStandardMaterial
      map={earthTexture}
      roughness={0.8}
      metalness={0.1}
    />
  )
}

// 导出云层纹理创建函数
export { createCloudTexture }
