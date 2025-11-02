export interface Airport {
  iata?: string // May not always be available
  icao?: string
  skyId: string // Required by Sky Scrapper API
  entityId: string // Required by Sky Scrapper API
  name: string
  city: string
  country: string
  countryCode?: string
  latitude?: number
  longitude?: number
  entityType?: 'AIRPORT' | 'CITY' // From API response
}

/**
 * Sky Scrapper API Airport Search Response
 */
export interface SkyScrapperAirportResponse {
  status: boolean
  timestamp: number
  data: SkyScrapperAirportItem[]
}

/**
 * Individual airport item from Sky Scrapper API
 */
export interface SkyScrapperAirportItem {
  skyId: string
  entityId: string
  presentation: {
    title: string
    suggestionTitle: string
    subtitle: string
  }
  navigation: {
    entityId: string
    entityType: 'AIRPORT' | 'CITY'
    localizedName: string
    relevantFlightParams: {
      skyId: string
      entityId: string
      flightPlaceType: 'AIRPORT' | 'CITY'
      localizedName: string
    }
    relevantHotelParams?: {
      entityId: string
      entityType: string
      localizedName: string
    }
  }
}

/**
 * Nearby airports response structure
 */
export interface SkyScrapperNearbyResponse {
  status: boolean
  timestamp: number
  data: {
    current?: SkyScrapperAirportItem
    nearby?: SkyScrapperAirportItem[]
    recent?: SkyScrapperAirportItem[]
  }
}
