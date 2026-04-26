import { Vector3 } from 'three'

export interface Country {
  id: string
  name: string
  nameEn: string
  capital: string
  population: number
  area: number
  continent: string
  coordinates: Vector3
  flag?: string
}

export interface Province {
  id: string
  countryId: string
  name: string
  nameEn: string
  capital: string
  population: number
  area: number
  coordinates: Vector3
}

export interface GeoFeature {
  type: string
  properties: {
    name: string
    iso_a2?: string
    iso_a3?: string
    admin?: string
    [key: string]: unknown
  }
  geometry: {
    type: string
    coordinates: number[][][] | number[][][][]
  }
}

export interface GeoData {
  type: string
  features: GeoFeature[]
}

export interface ViewState {
  target: Vector3
  zoom: number
  rotation: [number, number, number]
}

export interface EarthState {
  isRotating: boolean
  rotationSpeed: number
  showAtmosphere: boolean
  showClouds: boolean
  showBorders: boolean
  showLabels: boolean
  selectedCountry: Country | null
  hoveredCountry: Country | null
  viewState: ViewState
}

export interface SearchResult {
  type: 'country' | 'province' | 'city'
  name: string
  nameEn: string
  coordinates: Vector3
  country?: string
}

export interface TooltipInfo {
  visible: boolean
  position: { x: number; y: number }
  content: string
  type: 'country' | 'province' | 'city'
}
