import { create } from 'zustand'
import { Country, Province, SearchResult, TooltipInfo, CityFeature } from '@/types'

interface EarthStore {
  // 地球状态
  isRotating: boolean
  rotationSpeed: number
  showClouds: boolean
  showBorders: boolean
  showLabels: boolean
  showGrid: boolean

  // 省份模式
  showProvinceMode: boolean
  hoveredProvince: string | null

  // 城市模式
  showCityMode: boolean
  selectedProvinceAdcode: number | null
  selectedProvinceCenter: [number, number] | null // [lng, lat]
  selectedProvinceName: string | null
  cityData: CityFeature[]
  isLoadingCities: boolean
  selectedCityAdcode: number | null

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
  
  // 视角重置触发器
  resetViewTrigger: number
  
  // 动作
  setIsRotating: (isRotating: boolean) => void
  setRotationSpeed: (speed: number) => void
  setShowClouds: (show: boolean) => void
  setShowBorders: (show: boolean) => void
  setShowLabels: (show: boolean) => void
  setShowGrid: (show: boolean) => void
  setShowProvinceMode: (show: boolean) => void
  setHoveredProvince: (name: string | null) => void
  enterCityMode: (adcode: number, center: [number, number], name: string) => void
  exitCityMode: () => void
  setCityData: (data: CityFeature[]) => void
  setIsLoadingCities: (loading: boolean) => void
  setSelectedCity: (adcode: number | null) => void
  setSelectedCountry: (country: Country | null) => void
  setSelectedProvince: (province: Province | null) => void
  setHoveredCountry: (country: Country | null) => void
  setSearchQuery: (query: string) => void
  setSearchResults: (results: SearchResult[]) => void
  setIsSearching: (isSearching: boolean) => void
  setTooltip: (tooltip: TooltipInfo) => void
  resetView: () => void
}

export const useEarthStore = create<EarthStore>((set) => ({
  // 初始状态
  isRotating: true,
  rotationSpeed: 1,
  showClouds: true,
  showBorders: true,
  showLabels: false,
  showGrid: false,
  showProvinceMode: false,
  hoveredProvince: null,
  showCityMode: false,
  selectedProvinceAdcode: null,
  selectedProvinceCenter: null,
  selectedProvinceName: null,
  cityData: [],
  isLoadingCities: false,
  selectedCityAdcode: null,
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
  resetViewTrigger: 0,
  
  // 动作
  setIsRotating: (isRotating) => set({ isRotating }),
  setRotationSpeed: (rotationSpeed) => set({ rotationSpeed }),
  setShowClouds: (showClouds) => set({ showClouds }),
  setShowBorders: (showBorders) => set({ showBorders }),
  setShowLabels: (showLabels) => set({ showLabels }),
  setShowGrid: (showGrid) => set({ showGrid }),
  setShowProvinceMode: (showProvinceMode) => set({ showProvinceMode, hoveredProvince: null }),
  setHoveredProvince: (hoveredProvince) => set({ hoveredProvince }),
  enterCityMode: (adcode, center, name) => set({
    showCityMode: true,
    selectedProvinceAdcode: adcode,
    selectedProvinceCenter: center,
    selectedProvinceName: name,
    cityData: [],
    isLoadingCities: false,
    selectedCityAdcode: null,
  }),
  exitCityMode: () => set({
    showCityMode: false,
    selectedProvinceAdcode: null,
    selectedProvinceCenter: null,
    selectedProvinceName: null,
    cityData: [],
    isLoadingCities: false,
    selectedCityAdcode: null,
  }),
  setCityData: (cityData) => set({ cityData, isLoadingCities: false }),
  setIsLoadingCities: (isLoadingCities) => set({ isLoadingCities }),
  setSelectedCity: (selectedCityAdcode) => set({ selectedCityAdcode }),
  setSelectedCountry: (selectedCountry) => set({ selectedCountry }),
  setSelectedProvince: (selectedProvince) => set({ selectedProvince }),
  setHoveredCountry: (hoveredCountry) => set({ hoveredCountry }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setSearchResults: (searchResults) => set({ searchResults }),
  setIsSearching: (isSearching) => set({ isSearching }),
  setTooltip: (tooltip) => set({ tooltip }),
  resetView: () => set((state) => ({
    resetViewTrigger: state.resetViewTrigger + 1,
    selectedCountry: null,
    selectedProvince: null,
    showProvinceMode: false,
    hoveredProvince: null,
    showCityMode: false,
    selectedProvinceAdcode: null,
    selectedProvinceCenter: null,
    selectedProvinceName: null,
    cityData: [],
    isLoadingCities: false,
    selectedCityAdcode: null,
  })),
}))
