# World Map - 交互式地球仪

一个基于 Three.js 的交互式 3D 地球仪应用，用于学习世界地理知识。

## 功能特性

### 核心功能
- 🌍 3D 地球渲染（高清纹理、大气层、云层）
- 🔄 自动旋转动画
- 🖱️ 鼠标交互（旋转、缩放）
- 🔍 国家/地区搜索
- 📊 国家信息展示

### 视觉效果
- NASA 蓝色大理石纹理
- 大气层光晕效果
- 动态云层
- 星空背景
- 昼夜光照效果

### 地理信息
- 国家边界显示
- 国家标签（根据缩放级别动态显示）
- 中国省份标记点
- 25+ 个国家详细数据

### 学习功能
- 📚 地理知识问答（首都、人口、面积、大洲等）
- 📏 距离测量工具
- 🏆 得分统计和连对记录

### 交互功能
- 鼠标左键拖拽旋转
- 滚轮缩放
- 搜索框快速定位
- 点击国家查看详情
- 工具栏控制显示选项

## 项目结构

```
worldmap/
├── src/
│   ├── components/          # 组件目录
│   │   ├── Earth/           # 地球核心组件
│   │   │   ├── Earth.tsx    # 地球主组件
│   │   │   ├── EarthMaterial.tsx  # 地球材质
│   │   │   ├── Atmosphere.tsx     # 大气层
│   │   │   ├── Clouds.tsx         # 云层
│   │   │   ├── Stars.tsx          # 星空背景
│   │   │   └── index.ts
│   │   ├── Controls/        # 交互控制
│   │   │   ├── EarthControls.tsx  # 相机控制
│   │   │   └── index.ts
│   │   ├── Layers/          # 地理图层
│   │   │   ├── CountryBorders.tsx # 国家边界
│   │   │   ├── CountryLabels.tsx  # 国家标签
│   │   │   ├── ProvinceBorders.tsx # 省份边界
│   │   │   └── index.ts
│   │   ├── UI/              # 界面组件
│   │   │   ├── SearchPanel.tsx    # 搜索面板
│   │   │   ├── InfoPanel.tsx      # 信息面板
│   │   │   ├── Toolbar.tsx        # 工具栏
│   │   │   ├── QuizPanel.tsx      # 问答面板
│   │   │   ├── MeasurePanel.tsx   # 测量工具
│   │   │   └── index.ts
│   │   └── Scene.tsx        # 3D 场景
│   ├── hooks/               # 自定义 Hooks
│   │   └── useGeoData.ts   # 地理数据 Hook
│   ├── stores/              # 状态管理
│   │   └── earthStore.ts   # 地球状态 Store
│   ├── utils/               # 工具函数
│   │   └── geo.ts          # 地理计算工具
│   ├── data/                # 数据文件
│   │   └── countries.ts    # 国家详细数据
│   ├── types/               # 类型定义
│   │   └── index.ts
│   ├── styles/              # 样式文件
│   │   └── global.css
│   ├── App.tsx              # 主应用组件
│   └── main.tsx             # 入口文件
├── public/                  # 静态资源
│   ├── textures/            # 纹理贴图
│   └── data/                # 地理数据
├── package.json
├── tsconfig.json
├── vite.config.ts
└── index.html
```

## 技术栈

- **React 18** - UI 框架
- **Three.js** - 3D 渲染引擎
- **React Three Fiber** - React 3D 渲染器
- **Zustand** - 状态管理
- **TypeScript** - 类型安全
- **Vite** - 构建工具

## 快速开始

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3000

### 构建生产版本

```bash
npm run build
```

### 代码检查

```bash
npm run lint
```

## 使用说明

### 基本操作
- **旋转地球**：鼠标左键拖拽
- **缩放**：鼠标滚轮
- **搜索**：在左上角搜索框输入国家名称
- **查看详情**：点击感兴趣的国家

### 工具栏功能
- ⏯️ 播放/暂停旋转
- 🌫️ 显示/隐藏大气层
- ☁️ 显示/隐藏云层
- 🗺️ 显示/隐藏边界
- 🏷️ 显示/隐藏标签
- 🏠 重置视角
- 📚 地理知识问答
- 📏 距离测量

### 问答功能
- 测试你的地理知识
- 支持多种题型：首都、人口、面积、大洲
- 实时得分统计
- 答错可查看正确答案和国家详情

### 测量工具
- 输入两个地点的经纬度
- 计算两点间直线距离
- 提供常用城市快捷选择

## 数据来源

- 地球纹理：NASA Blue Marble
- 国家边界：Natural Earth
- 地理数据：World Atlas
- 国家信息：维基百科

## 开发计划

- [x] 基础 3D 地球渲染
- [x] 交互控制
- [x] 搜索功能
- [x] 信息面板
- [x] 国家边界显示
- [x] 国家标签
- [x] 中国省份标记
- [x] 地理知识问答
- [x] 距离测量工具
- [ ] 省份详细边界
- [ ] 时区显示
- [ ] 多语言支持
- [ ] 收藏功能

## 许可证

MIT License
