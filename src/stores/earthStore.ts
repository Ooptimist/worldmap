import { create } from 'zustand'
import { Country, Province, SearchResult, TooltipInfo } from '@/types'

interface EarthStore {
  // 地球状态
  isRotating: boolean
  rotationSpeed: number
  showAtmosphere: boolean
  showClouds: boolean
  showBorders: boolean
  showLabels: boolean
  showGrid: boolean
  
  // 选中状态
  selectedCountry: Country | null
  selectedProvince: Province | null
  hoveredCountry: Country | null
  
  // 搜索状态
  searchQuery: string
  searchResults: SearchResult[]
  isSearching: boolean
  
  // 提示状态
  tooltip: TooltipInfo
  
  // 视角状态
  cameraPosition: [number, number, number]
  cameraTarget: [number, number, number]
  
  // 动作
  setIsRotating: (isRotating: boolean) => void
  setRotationSpeed: (speed: number) => void
  setShowAtmosphere: (show: boolean) => void
  setShowClouds: (show: boolean) => void
  setShowBorders: (show: boolean) => void
  setShowLabels: (show: boolean) => void
  setShowGrid: (show: boolean) => void
  setSelectedCountry: (country: Country | null) => void
  setSelectedProvince: (province: Province | null) => void
  setHoveredCountry: (country: Country | null) => void
  setSearchQuery: (query: string) => void
  setSearchResults: (results: SearchResult[]) => void
  setIsSearching: (isSearching: boolean) => void
  setTooltip: (tooltip: TooltipInfo) => void
  setCameraPosition: (position: [number, number, number]) => void
  setCameraTarget: (target: [number, number, number]) => void
  resetView: () => void
}

export const useEarthStore = create<EarthStore>((set) => ({
  // 初始状态
  isRotating: true,
  rotationSpeed: 1,
  showAtmosphere: true,
  showClouds: true,
  showBorders: true,
  showLabels: false,
  showGrid: false,
  selectedCountry: null,
  selectedProvince: null,
  hoveredCountry: null,
  searchQuery: '',
  searchResults: [],
  isSearching: false,
  tooltip: {
    visible: false,
    position: { x: 0, y: 0 },
    content: '',
    type: 'country',
  },
  cameraPosition: [0, 0, 3],
  cameraTarget: [0, 0, 0],
  
  // 动作
  setIsRotating: (isRotating) => set({ isRotating }),
  setRotationSpeed: (rotationSpeed) => set({ rotationSpeed }),
  setShowAtmosphere: (showAtmosphere) => set({ showAtmosphere }),
  setShowClouds: (showClouds) => set({ showClouds }),
  setShowBorders: (showBorders) => set({ showBorders }),
  setShowLabels: (showLabels) => set({ showLabels }),
  setShowGrid: (showGrid) => set({ showGrid }),
  setSelectedCountry: (selectedCountry) => set({ selectedCountry }),
  setSelectedProvince: (selectedProvince) => set({ selectedProvince }),
  setHoveredCountry: (hoveredCountry) => set({ hoveredCountry }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setSearchResults: (searchResults) => set({ searchResults }),
  setIsSearching: (isSearching) => set({ isSearching }),
  setTooltip: (tooltip) => set({ tooltip }),
  setCameraPosition: (cameraPosition) => set({ cameraPosition }),
  setCameraTarget: (cameraTarget) => set({ cameraTarget }),
  resetView: () => set({
    cameraPosition: [0, 0, 3],
    cameraTarget: [0, 0, 0],
    selectedCountry: null,
    selectedProvince: null,
  }),
}))
