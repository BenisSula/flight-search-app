/**
 * API Response Type Definitions
 * Defines interfaces for raw API responses before normalization
 */

import type {
  Airport,
  SkyScrapperAirportItem,
  SkyScrapperAirportResponse,
  SkyScrapperNearbyResponse,
} from './airport'
import type { Flight, PriceCalendarData, PriceCalendarDay } from './flight'

/**
 * Generic API response wrapper
 * Used by Sky Scrapper API for most endpoints
 */
export interface ApiResponse<T> {
  status: boolean
  timestamp: number
  data: T
}

/**
 * Raw flight object from API before normalization
 * Handles various possible field names from different API versions
 */
export interface RawFlightData {
  // Identity fields
  id?: string
  legId?: string
  itineraryId?: string

  // Airline fields
  airline?: string
  carrier?: {
    name?: string
    code?: string
  }
  carriers?: string[]
  marketingCarrier?: string

  // Time fields
  departureTime?: string
  arrivalTime?: string
  departure?: {
    time?: string
    airport?: string
    date?: string
  }
  arrival?: {
    time?: string
    airport?: string
    date?: string
  }
  outbound?: {
    departureTime?: string
    arrivalTime?: string
  }

  // Airport fields
  departureAirport?: string
  arrivalAirport?: string
  origin?: string
  destination?: string
  segments?: Array<{
    origin?: { code?: string; name?: string }
    destination?: { code?: string; name?: string }
    departure?: { time?: string; airport?: string }
    arrival?: { time?: string; airport?: string }
    airline?: { name?: string; code?: string }
  }>

  // Duration fields
  duration?: string
  totalDuration?: string
  time?: string
  journey?: {
    duration?: string
  }

  // Pricing fields
  price?: number | string
  amount?: number | string
  total?: number | string
  fare?: number | string

  // Stops fields
  stops?: number
  stopsCount?: number

  // Metadata fields
  best?: boolean
  recommended?: boolean
  isBest?: boolean

  // Aircraft fields
  aircraft?: string
  equipment?: string
  aircraftType?: string

  // Flight number fields
  flightNumber?: string
  number?: string
  flightNo?: string

  // Cabin class
  cabinClass?: string

  // Baggage fields
  carryOn?: boolean
  checkedBags?: number
  baggage?: {
    carryOn?: boolean
    checked?: number
  }
  baggageAllowance?: {
    checked?: number
  }

  // Layover fields
  layover?: Array<{
    airport: string
    duration: string
  }>
  layovers?: Array<{
    airport: string
    duration: string
  }>
}

/**
 * Raw price calendar item from API
 */
export interface RawPriceCalendarItem {
  date?: string
  DepartureDate?: string
  price?: number | string
  Price?: number | string
  amount?: number | string
  available?: boolean
  isCheapest?: boolean
  isMostExpensive?: boolean
}

/**
 * Alternative price calendar response structure
 */
export interface PriceCalendarResponse {
  origin?: string
  destination?: string
  currency?: string
  calendar?: RawPriceCalendarItem[]
  data?: RawPriceCalendarItem[]
}

/**
 * Flight details API response structure
 * Supports multiple possible response shapes from the API
 */
export interface FlightDetailsResponse {
  id?: string
  status?: string
  data?: RawFlightData
  flight?: RawFlightData
  result?: RawFlightData
  legs?: Array<{
    id?: string
    origin?: string
    destination?: string
    departure?: string
    arrival?: string
    duration?: string
    segments?: RawFlightData[]
    carriers?: string[]
  }>
  price?: {
    total?: number | string
    raw?: number | string
  }
  itinerary?: string
  carrier?: string
  cabinClass?: string
}

/**
 * Locale list item from API
 */
export interface RawLocaleItem {
  code?: string
  locale?: string
  language?: string
  name?: string
  displayName?: string
  nativeName?: string
}

/**
 * Config API response
 */
export interface ConfigResponse {
  version?: string
  supportedMarkets?: string[]
  supportedCurrencies?: string[]
  features?: string[]
  limits?: {
    rateLimit?: number
    maxResults?: number
    requestRate?: number
    concurrency?: number
  }
}

/**
 * Server health check response
 */
export interface HealthCheckResponse {
  status?: string
  timestamp?: number
  message?: string
}

// Re-export existing airport types for convenience
export type {
  Airport,
  SkyScrapperAirportItem,
  SkyScrapperAirportResponse,
  SkyScrapperNearbyResponse,
}

// Re-export existing flight types for convenience
export type { Flight, PriceCalendarData, PriceCalendarDay }
