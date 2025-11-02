export type TripType = 'round-trip' | 'one-way'

export interface Flight {
  id: string
  airline: string
  departureTime: string
  arrivalTime: string
  departureAirport: string
  arrivalAirport: string
  duration: string
  stops: number
  price: number
  best?: boolean
  aircraft?: string
  flightNumber?: string
  cabinClass?: string
  baggage?: {
    carryOn?: boolean
    checked?: number
  }
  layover?: {
    airport: string
    duration: string
  }[]
  // API Metadata for flight details lookup
  originSkyId?: string
  destinationSkyId?: string
  departureDate?: string // ISO date string (YYYY-MM-DD)
  returnDate?: string // ISO date string (YYYY-MM-DD) for round-trip flights
}

export interface FlightSearchParams {
  // Legacy support - will be converted to skyId/entityId
  from: string
  to: string
  departure: string
  return?: string
  passengers: string
  cabinClass: string
  tripType: TripType
  // Sky Scrapper API specific fields
  originSkyId?: string
  destinationSkyId?: string
  originEntityId?: string
  destinationEntityId?: string
  adults?: number
  currency?: string
  market?: string
  countryCode?: string
  locale?: string
}

export interface FlightFilters {
  priceRange: {
    min: number
    max: number
  }
  stops: number[]
  airlines: string[]
  departureTimes: string[]
  arrivalTimes: string[]
  duration: number
}

export type SortOption = 'best' | 'cheapest' | 'fastest' | 'duration' | 'departure'

// Price Calendar Types
export interface PriceCalendarDay {
  date: string // ISO date string (YYYY-MM-DD)
  price: number
  isCheapest?: boolean
  isMostExpensive?: boolean
  isUnavailable?: boolean
}

export interface PriceCalendarData {
  origin: string
  destination: string
  currency: string
  calendar: PriceCalendarDay[]
  minPrice: number
  maxPrice: number
  cheapestDate: string // ISO date string
}

// Deal and Destination Types
export type Deal = {
  id: string
  origin: string
  destination: string
  originalPrice: number
  discountedPrice: number
  savings: number
  savingsPercent: number
  airline: string
  image: string
  validUntil: string
  category: 'last-minute' | 'best-savings' | 'weekend' | 'seasonal'
}

export type Destination = {
  id: string
  city: string
  country: string
  image: string
  price: number
}

// API Status and Configuration Types
export interface Locale {
  code: string
  name: string
  nativeName: string
}

export interface ServerConfig {
  version: string
  features: string[]
  limits?: {
    requestRate?: number
    concurrency?: number
  }
}

export interface HealthStatus {
  isOnline: boolean
  timestamp: number
  message?: string
}
