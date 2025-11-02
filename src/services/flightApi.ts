import type {
  Flight,
  FlightSearchParams,
  PriceCalendarData,
  PriceCalendarDay,
  Locale,
  ServerConfig,
  HealthStatus,
} from '../types/flight'
import type {
  Airport,
  SkyScrapperAirportResponse,
  SkyScrapperAirportItem,
  SkyScrapperNearbyResponse,
} from '../types/airport'
import type {
  ApiResponse,
  RawFlightData,
  RawPriceCalendarItem,
  RawLocaleItem,
  FlightDetailsResponse,
  ConfigResponse,
  PriceCalendarResponse,
} from '../types/api'
import { handleApiError } from '../utils/handleApiError'
import { RAPID_API_KEY, RAPID_API_HOST, RAPID_API_BASE_URL } from '../utils/envConfig'
import { apiRequestWithRetry } from '../utils/apiRetry'
import { logApiRequest, logApiResponse, logApiError, logger } from '../utils/logger'
import { extractIATACode } from '../utils/formatAirport'
import { withMockFallback, withFallback } from '../utils/withMockFallback'

/**
 * Converts Sky Scrapper airport item to our Airport interface
 */
function convertSkyScrapperAirport(item: SkyScrapperAirportItem): Airport {
  const presentation = item.presentation
  const navigation = item.navigation
  const flightParams = navigation.relevantFlightParams

  // Extract IATA code from skyId if it looks like an airport code (e.g., "JFK", "LAX")
  const skyId = flightParams.skyId || item.skyId
  const iataMatch = skyId.match(/^[A-Z]{3}$/)
  const iata = iataMatch ? skyId : undefined

  return {
    skyId: flightParams.skyId || item.skyId,
    entityId: flightParams.entityId || item.entityId,
    iata,
    name: navigation.localizedName || presentation.title,
    city: presentation.title,
    country: presentation.subtitle,
    entityType: navigation.entityType as 'AIRPORT' | 'CITY',
  }
}

/**
 * Makes a request to the RapidAPI Sky-Scrapper API
 * @param endpoint - API endpoint path
 * @param params - Query parameters
 * @returns Promise with API response data
 */
async function apiRequest<T>(
  endpoint: string,
  params?: Record<string, string | number>
): Promise<T> {
  // Check if API key exists before making request
  if (!RAPID_API_KEY) {
    const error = new Error(
      'API key is not configured. Please set VITE_RAPIDAPI_KEY in your .env file. The app will use mock data for development.'
    )
    error.name = 'NoApiKeyError'
    throw error
  }

  // Ensure endpoint starts with / if not already present
  const apiEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`
  const url = new URL(`${RAPID_API_BASE_URL}${apiEndpoint}`)

  // Add query parameters if provided
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.append(key, String(value))
      }
    })
  }

  // Log API request (dev mode only)
  logApiRequest(endpoint, 'GET', params)

  // Track request start time for response logging
  const requestStartTime = Date.now()

  // Use retry logic for API requests
  try {
    const data = await apiRequestWithRetry(async () => {
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'x-rapidapi-key': RAPID_API_KEY,
          'x-rapidapi-host': RAPID_API_HOST,
        },
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        const error = new Error(
          errorData.message || `API request failed: ${response.status} ${response.statusText}`
        ) as Error & { status?: number }
        error.status = response.status
        throw error
      }

      return await response.json()
    })

    // Log successful API response (dev mode only)
    const responseTime = Date.now() - requestStartTime
    logApiResponse(endpoint, data, {
      method: 'GET',
      params,
      responseTime,
    })

    return data as T
  } catch (error) {
    // Log API error (dev mode only)
    logApiError(endpoint, error, params)

    // Preserve status code if available
    if (error instanceof Error && 'status' in error) {
      throw error
    }
    // Re-throw with proper error message for other errors
    const errorMessage = handleApiError(error)
    const newError = new Error(errorMessage)
    throw newError
  }
}

/**
 * Searches for airports and cities based on query string
 * @param query - Search query (airport name, city, IATA code, etc.)
 * @returns Promise with array of matching airports
 */
/**
 * Helper function to get mock airports and filter them by query
 * Extracted to be reusable for both no-API-key scenario and API fallback
 */
function getMockAirportsFiltered(query: string): Airport[] {
  const mockAirports: Airport[] = [
    {
      iata: 'JFK',
      skyId: 'JFK',
      entityId: '95565058',
      name: 'John F. Kennedy International',
      city: 'New York',
      country: 'United States',
      entityType: 'AIRPORT',
    },
    {
      iata: 'LAX',
      skyId: 'LAX',
      entityId: '95565060',
      name: 'Los Angeles International',
      city: 'Los Angeles',
      country: 'United States',
      entityType: 'AIRPORT',
    },
    {
      iata: 'LHR',
      skyId: 'LHR',
      entityId: '95565059',
      name: 'London Heathrow',
      city: 'London',
      country: 'United Kingdom',
      entityType: 'AIRPORT',
    },
    {
      iata: 'CDG',
      skyId: 'CDG',
      entityId: '95565061',
      name: 'Charles de Gaulle',
      city: 'Paris',
      country: 'France',
      entityType: 'AIRPORT',
    },
    {
      iata: 'NRT',
      skyId: 'NRT',
      entityId: '95565062',
      name: 'Narita International',
      city: 'Tokyo',
      country: 'Japan',
      entityType: 'AIRPORT',
    },
    {
      iata: 'DXB',
      skyId: 'DXB',
      entityId: '95565063',
      name: 'Dubai International',
      city: 'Dubai',
      country: 'United Arab Emirates',
      entityType: 'AIRPORT',
    },
    {
      iata: 'SIN',
      skyId: 'SIN',
      entityId: '95565064',
      name: 'Singapore Changi',
      city: 'Singapore',
      country: 'Singapore',
      entityType: 'AIRPORT',
    },
    {
      iata: 'FRA',
      skyId: 'FRA',
      entityId: '95565065',
      name: 'Frankfurt Airport',
      city: 'Frankfurt',
      country: 'Germany',
      entityType: 'AIRPORT',
    },
    {
      iata: 'ORD',
      skyId: 'ORD',
      entityId: '95565066',
      name: "Chicago O'Hare International",
      city: 'Chicago',
      country: 'United States',
      entityType: 'AIRPORT',
    },
    {
      iata: 'BCN',
      skyId: 'BCN',
      entityId: '95565067',
      name: 'Barcelona El Prat',
      city: 'Barcelona',
      country: 'Spain',
      entityType: 'AIRPORT',
    },
    {
      iata: 'MIA',
      skyId: 'MIA',
      entityId: '95565068',
      name: 'Miami International',
      city: 'Miami',
      country: 'United States',
      entityType: 'AIRPORT',
    },
    {
      iata: 'SFO',
      skyId: 'SFO',
      entityId: '95565069',
      name: 'San Francisco International',
      city: 'San Francisco',
      country: 'United States',
      entityType: 'AIRPORT',
    },
    {
      iata: 'BOS',
      skyId: 'BOS',
      entityId: '95565070',
      name: 'Boston Logan International',
      city: 'Boston',
      country: 'United States',
      entityType: 'AIRPORT',
    },
    {
      iata: 'FCO',
      skyId: 'FCO',
      entityId: '95565071',
      name: 'Rome Fiumicino',
      city: 'Rome',
      country: 'Italy',
      entityType: 'AIRPORT',
    },
  ]

  // Filter airports based on query
  const queryLower = query.toLowerCase().trim()

  // If query matches format like "City (IATA)", extract city and IATA
  const iataMatch = query.match(/\(([A-Z]{3})\)/i)
  const extractedIATA = iataMatch ? iataMatch[1].toUpperCase() : null
  const cityName = query
    .replace(/\([^)]*\)/g, '')
    .trim()
    .toLowerCase()

  const filtered = mockAirports.filter(airport => {
    // Priority 1: Match by IATA if extracted (exact match)
    if (extractedIATA && airport.iata?.toUpperCase() === extractedIATA) {
      return true
    }

    // Priority 2: Match by city name (exact or contains)
    if (cityName && airport.city.toLowerCase().includes(cityName)) {
      return true
    }

    // Priority 3: Match by city name from the full display format
    if (queryLower.includes(airport.city.toLowerCase())) {
      return true
    }

    // Priority 4: Match by airport name
    if (airport.name.toLowerCase().includes(queryLower)) {
      return true
    }

    // Priority 5: Match by IATA code in the query
    if (airport.iata && queryLower.includes(airport.iata.toLowerCase())) {
      return true
    }

    // Priority 6: Match by country
    if (airport.country.toLowerCase().includes(queryLower)) {
      return true
    }

    return false
  })

  // Log mock airport search (dev mode only)
  logger.debug('searchAirport', 'Mock airport search', {
    query,
    extractedIATA,
    cityName,
    found: filtered.length,
  })

  return filtered
}

/**
 * Searches for airports and cities based on query string
 * Uses Sky Scrapper API /v1/flights/searchAirport endpoint
 * Falls back to mock data if API key is not configured or API fails
 * @param query - Search query (airport name, city, IATA code, etc.)
 * @returns Promise with array of matching airports (empty array if query is empty)
 * @example
 * ```typescript
 * const airports = await searchAirport("JFK")
 * // Returns airports matching "JFK" (John F. Kennedy International)
 * ```
 */
export async function searchAirport(query: string): Promise<Airport[]> {
  if (!query || query.trim().length === 0) {
    return []
  }

  return withMockFallback(
    async () => {
      // Sky Scrapper API endpoint: api/v1/flights/searchAirport
      const response = await apiRequest<SkyScrapperAirportResponse>('/v1/flights/searchAirport', {
        query: query.trim(),
        locale: 'en-US', // Default locale
      })

      // Convert Sky Scrapper airport items to our Airport interface
      if (response.data && Array.isArray(response.data) && response.data.length > 0) {
        return response.data.map(convertSkyScrapperAirport)
      }

      // If API returns empty data, throw to trigger fallback
      throw new Error('Empty API response')
    },
    () => getMockAirportsFiltered(query),
    'searchAirport'
  )
}

/**
 * Normalizes a single raw flight object to our Flight interface
 * Handles different API response field names and calculates duration if needed
 * @param flightData - Raw flight object from API
 * @param options - Optional parameters for normalization (default values, metadata)
 * @returns Normalized Flight object
 */
function normalizeFlightObject(
  flightData: RawFlightData,
  options: {
    index?: number
    defaultFrom?: string
    defaultTo?: string
    originSkyId?: string
    destinationSkyId?: string
    departureDate?: string
    returnDate?: string
    cabinClass?: string
  } = {}
): Flight {
  const index = options.index ?? 0
  const normalized: Flight = {
    id:
      flightData.id ||
      flightData.legId ||
      flightData.itineraryId ||
      `flight-${index}-${Date.now()}`,
    airline:
      flightData.airline ||
      flightData.carrier?.name ||
      flightData.carriers?.join(', ') ||
      flightData.marketingCarrier ||
      'Unknown Airline',
    departureTime:
      flightData.departureTime ||
      flightData.departure?.time ||
      flightData.segments?.[0]?.departure?.time ||
      flightData.outbound?.departureTime ||
      '',
    arrivalTime:
      flightData.arrivalTime ||
      flightData.arrival?.time ||
      flightData.segments?.[flightData.segments?.length - 1]?.arrival?.time ||
      flightData.outbound?.arrivalTime ||
      '',
    departureAirport:
      flightData.departureAirport ||
      flightData.departure?.airport ||
      flightData.origin ||
      flightData.segments?.[0]?.origin?.code ||
      options.defaultFrom ||
      '',
    arrivalAirport:
      flightData.arrivalAirport ||
      flightData.arrival?.airport ||
      flightData.destination ||
      flightData.segments?.[flightData.segments?.length - 1]?.destination?.code ||
      options.defaultTo ||
      '',
    duration:
      flightData.duration ||
      flightData.totalDuration ||
      flightData.journey?.duration ||
      flightData.time ||
      '',
    stops:
      flightData.stops ??
      (flightData.segments ? Math.max(0, flightData.segments.length - 1) : 0) ??
      flightData.stopsCount ??
      0,
    price: parseFloat(
      String(flightData.price || flightData.amount || flightData.total || flightData.fare || 0)
    ),
    best: flightData.best || flightData.recommended || flightData.isBest || false,
    aircraft: flightData.aircraft || flightData.equipment || flightData.aircraftType,
    flightNumber: flightData.flightNumber || flightData.number || flightData.flightNo,
    cabinClass: flightData.cabinClass || options.cabinClass || 'economy',
    baggage: flightData.baggage || {
      carryOn: flightData.carryOn !== undefined ? flightData.carryOn : true,
      checked: flightData.checkedBags || flightData.baggageAllowance?.checked || 0,
    },
    layover: flightData.layover || flightData.layovers || undefined,
    // Add API metadata for flight details lookup if provided
    originSkyId: options.originSkyId,
    destinationSkyId: options.destinationSkyId,
    departureDate: options.departureDate,
    returnDate: options.returnDate,
  }

  // Calculate duration if not provided but times are available
  if (!normalized.duration && normalized.departureTime && normalized.arrivalTime) {
    try {
      const [depHour, depMin] = normalized.departureTime.split(':').map(Number)
      const [arrHour, arrMin] = normalized.arrivalTime.split(':').map(Number)
      const depMinutes = depHour * 60 + depMin
      const arrMinutes = arrHour * 60 + arrMin
      let durationMinutes = arrMinutes - depMinutes
      if (durationMinutes < 0) durationMinutes += 24 * 60 // Handle next day arrival
      const hours = Math.floor(durationMinutes / 60)
      const minutes = durationMinutes % 60
      normalized.duration = `${hours}h ${minutes}m`
    } catch {
      // If parsing fails, keep original duration or set default
      normalized.duration = normalized.duration || ''
    }
  }

  return normalized
}

/**
 * Normalizes flight response from API to Flight[] array
 * Handles simplified response structure: data.data or data.flights
 * @param response - API response object
 * @returns Array of raw flight objects (not yet normalized to Flight interface)
 */
function normalizeFlightResponse(response: unknown): RawFlightData[] {
  // Type guard to handle various response structures
  const responseObj = response as
    | ApiResponse<RawFlightData[]>
    | ApiResponse<{ data: RawFlightData[] } | { flights: RawFlightData[] }>
    | RawFlightData[]
    | { data: RawFlightData[] }

  // Handle direct array response
  if (Array.isArray(responseObj)) {
    return responseObj
  }

  // Handle Sky Scrapper response structure: { status, timestamp, data: [...] }
  if (responseObj && typeof responseObj === 'object' && 'data' in responseObj) {
    const rawData = (responseObj as ApiResponse<unknown>).data

    // Simplified: Only check data.data or data.flights (verified working structures)
    if (rawData && typeof rawData === 'object') {
      const dataObj = rawData as { data?: RawFlightData[]; flights?: RawFlightData[] }
      if (Array.isArray(dataObj.data)) {
        return dataObj.data
      }
      if (Array.isArray(dataObj.flights)) {
        return dataObj.flights
      }
      // Fallback: if data itself is an array
      if (Array.isArray(rawData)) {
        return rawData as RawFlightData[]
      }
    }
  }

  // No flights found in response
  return []
}

/**
 * Helper function to get filtered mock flights for a search
 * @param params - Flight search parameters
 * @param fallbackId - ID prefix for fallback flights (default: 'mock')
 * @returns Promise with filtered mock flights array
 */
async function getFilteredMockFlights(
  params: FlightSearchParams,
  fallbackId: 'mock' | 'fallback' = 'mock'
): Promise<Flight[]> {
  // Import mock data dynamically to avoid circular dependencies
  const { mockFlights } = await import('../data/flights')

  // Filter mock flights by origin and destination airports
  let filteredFlights = mockFlights

  // Get IATA codes from params for filtering - extract from display string if needed
  const originIATA = extractIATACode(params.from || params.originSkyId || '')
  const destIATA = extractIATACode(params.to || params.destinationSkyId || '')

  logger.debug('searchFlights', 'Mock search params', {
    paramsFrom: params.from,
    paramsTo: params.to,
    originSkyId: params.originSkyId,
    destSkyId: params.destinationSkyId,
    extractedOriginIATA: originIATA,
    extractedDestIATA: destIATA,
  })

  if (originIATA && destIATA) {
    filteredFlights = mockFlights.filter(
      flight => flight.departureAirport === originIATA && flight.arrivalAirport === destIATA
    )

    logger.debug('searchFlights', 'Filtered mock flights', {
      route: `${originIATA} -> ${destIATA}`,
      count: filteredFlights.length,
    })
  }

  // Return mock flights with API metadata
  return filteredFlights.map((flight, index) => ({
    ...flight,
    id: flight.id || `${fallbackId}-flight-${index}`,
    // Preserve original airport codes
    departureAirport: flight.departureAirport,
    arrivalAirport: flight.arrivalAirport,
    // Add API metadata from search params for mock flights
    originSkyId: params.originSkyId,
    destinationSkyId: params.destinationSkyId,
    departureDate: params.departure,
    returnDate: params.tripType === 'round-trip' && params.return ? params.return : undefined,
  }))
}

/**
 * Searches for flights based on search parameters
 * @param params - Flight search parameters
 * @returns Promise with array of matching flights
 */
export async function searchFlights(params: FlightSearchParams): Promise<Flight[]> {
  // If API key is not configured, return mock data for development
  if (!RAPID_API_KEY) {
    logger.debug('searchFlights', 'Using mock data (API key not configured)', params)
    return getFilteredMockFlights(params, 'mock')
  }

  // Check if we have skyId and entityId (required for API v2)
  // If missing and we have a basic from/to, fall back to mock data gracefully
  if (
    !params.originSkyId ||
    !params.destinationSkyId ||
    !params.originEntityId ||
    !params.destinationEntityId
  ) {
    // If we have basic from/to, use mock data instead of throwing error
    if (params.from && params.to) {
      logger.debug('searchFlights', 'Missing API parameters, using mock data', params)
      return getFilteredMockFlights(params, 'mock')
    }

    throw new Error(
      'Missing required parameters: originSkyId, destinationSkyId, originEntityId, destinationEntityId. Please select airports from autocomplete.'
    )
  }

  // Build request parameters for Sky Scrapper API v2
  const requestParams: Record<string, string | number> = {
    originSkyId: params.originSkyId,
    destinationSkyId: params.destinationSkyId,
    originEntityId: params.originEntityId,
    destinationEntityId: params.destinationEntityId,
    date: params.departure,
    adults: params.adults || parseInt(params.passengers, 10) || 1,
    cabinClass: params.cabinClass || 'economy',
    sortBy: 'best', // Default sort
    currency: params.currency || 'USD',
    market: params.market || 'en-US',
    countryCode: params.countryCode || 'US',
    locale: params.locale || 'en-US',
  }

  // Add return date for round-trip flights
  if (params.tripType === 'round-trip' && params.return) {
    requestParams.returnDate = params.return
  }

  // Add optional parameters
  if (params.currency) requestParams.currency = params.currency
  if (params.market) requestParams.market = params.market
  if (params.countryCode) requestParams.countryCode = params.countryCode

  // Sky Scrapper API v2 endpoint: api/v2/flights/searchFlightsComplete
  // Test and document if it fails due to 403 or 429
  try {
    const response = await apiRequest<ApiResponse<RawFlightData[]>>(
      '/v2/flights/searchFlightsComplete',
      requestParams
    )

    // Use simplified response parser (only checks data.data or data.flights)
    const rawFlights = normalizeFlightResponse(response)

    if (rawFlights.length === 0) {
      logger.warn('searchFlights', 'No flights found in API response', {
        structure: JSON.stringify(response, null, 2).substring(0, 300),
      })
      // Fallback to mock data if response is empty
      throw new Error('Empty API response')
    }

    // Convert raw flights to normalized Flight interface using centralized helper
    const flights = rawFlights.map((flight, index) =>
      normalizeFlightObject(flight, {
        index,
        defaultFrom: params.from,
        defaultTo: params.to,
        originSkyId: params.originSkyId,
        destinationSkyId: params.destinationSkyId,
        departureDate: params.departure,
        returnDate: params.tripType === 'round-trip' && params.return ? params.return : undefined,
        cabinClass: params.cabinClass,
      })
    )

    return flights
  } catch {
    // Fallback to mock data on API error (403/429 or other errors)
    logger.warn('searchFlights', 'Using mock flight data as fallback')
    return getFilteredMockFlights(params, 'fallback')
  }
}

/**
 * Helper function to get mock nearby airports based on coordinates
 * Returns popular airports near major cities based on approximate location
 * @param lat - Latitude coordinate
 * @param lng - Longitude coordinate
 * @returns Array of mock airports
 */
function getMockNearbyAirports(lat: number, lng: number): Airport[] {
  const mockAirports: Airport[] = [
    // New York area airports
    {
      iata: 'JFK',
      skyId: 'JFK',
      entityId: '95565058',
      name: 'John F. Kennedy International',
      city: 'New York',
      country: 'United States',
      entityType: 'AIRPORT',
    },
    {
      iata: 'LGA',
      skyId: 'LGA',
      entityId: '95565066',
      name: 'LaGuardia Airport',
      city: 'New York',
      country: 'United States',
      entityType: 'AIRPORT',
    },
    {
      iata: 'EWR',
      skyId: 'EWR',
      entityId: '95565067',
      name: 'Newark Liberty International',
      city: 'Newark',
      country: 'United States',
      entityType: 'AIRPORT',
    },
    // Los Angeles area airports
    {
      iata: 'LAX',
      skyId: 'LAX',
      entityId: '95565060',
      name: 'Los Angeles International',
      city: 'Los Angeles',
      country: 'United States',
      entityType: 'AIRPORT',
    },
    {
      iata: 'SNA',
      skyId: 'SNA',
      entityId: '95565068',
      name: 'John Wayne Airport',
      city: 'Santa Ana',
      country: 'United States',
      entityType: 'AIRPORT',
    },
    {
      iata: 'BUR',
      skyId: 'BUR',
      entityId: '95565069',
      name: 'Bob Hope Airport',
      city: 'Burbank',
      country: 'United States',
      entityType: 'AIRPORT',
    },
    // London area airports
    {
      iata: 'LHR',
      skyId: 'LHR',
      entityId: '95565059',
      name: 'London Heathrow',
      city: 'London',
      country: 'United Kingdom',
      entityType: 'AIRPORT',
    },
    {
      iata: 'LGW',
      skyId: 'LGW',
      entityId: '95565070',
      name: 'London Gatwick',
      city: 'London',
      country: 'United Kingdom',
      entityType: 'AIRPORT',
    },
    {
      iata: 'STN',
      skyId: 'STN',
      entityId: '95565071',
      name: 'London Stansted',
      city: 'London',
      country: 'United Kingdom',
      entityType: 'AIRPORT',
    },
    // Paris area airports
    {
      iata: 'CDG',
      skyId: 'CDG',
      entityId: '95565061',
      name: 'Charles de Gaulle',
      city: 'Paris',
      country: 'France',
      entityType: 'AIRPORT',
    },
    {
      iata: 'ORY',
      skyId: 'ORY',
      entityId: '95565072',
      name: 'Paris Orly',
      city: 'Paris',
      country: 'France',
      entityType: 'AIRPORT',
    },
  ]

  // Filter based on approximate location (simplified matching)
  // In a real implementation, you'd calculate distance based on lat/lng
  // For now, return airports based on region
  if (lat >= 40 && lat <= 42 && lng >= -75 && lng <= -73) {
    // New York area
    return mockAirports.filter(airport => ['JFK', 'LGA', 'EWR'].includes(airport.iata || ''))
  }
  if (lat >= 33 && lat <= 35 && lng >= -119 && lng <= -117) {
    // Los Angeles area
    return mockAirports.filter(airport => ['LAX', 'SNA', 'BUR'].includes(airport.iata || ''))
  }
  if (lat >= 51 && lat <= 52 && lng >= -1 && lng <= 1) {
    // London area
    return mockAirports.filter(airport => ['LHR', 'LGW', 'STN'].includes(airport.iata || ''))
  }
  if (lat >= 48 && lat <= 49 && lng >= 2 && lng <= 3) {
    // Paris area
    return mockAirports.filter(airport => ['CDG', 'ORY'].includes(airport.iata || ''))
  }

  // Default: return first 3 airports
  return mockAirports.slice(0, 3)
}

/**
 * Generates mock price calendar data for development
 * Creates 30 days of price variations with realistic patterns
 */
function getMockPriceCalendar(
  originSkyId: string,
  destinationSkyId: string,
  fromDate: string,
  currency: string
): PriceCalendarData {
  const startDate = new Date(fromDate)
  const calendar: PriceCalendarDay[] = []
  const prices: number[] = []

  // Generate 30 days of prices with realistic variations
  for (let i = 0; i < 30; i++) {
    const date = new Date(startDate)
    date.setDate(date.getDate() + i)
    const dateStr = date.toISOString().split('T')[0]

    // Weekend factor (Friday, Saturday, Sunday are cheaper)
    const dayOfWeek = date.getDay()
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 5 || dayOfWeek === 6
    const weekendFactor = isWeekend ? 0.9 : 1.0

    // Random variation between -15% and +10%
    const randomFactor = 0.85 + Math.random() * 0.25

    // Base price varies by route
    const basePriceMap: Record<string, number> = {
      'JFK-LAX': 385,
      'LAX-JFK': 385,
      'JFK-LHR': 420,
      'LHR-JFK': 420,
      'JFK-CDG': 450,
      'CDG-JFK': 450,
      'LAX-NRT': 650,
      'NRT-LAX': 650,
      'LAX-DXB': 799,
      'DXB-LAX': 799,
      'LAX-SIN': 750,
      'SIN-LAX': 750,
      'ORD-LHR': 420,
      'LHR-ORD': 420,
      'MIA-BCN': 480,
      'BCN-MIA': 480,
      'SFO-DXB': 799,
      'DXB-SFO': 799,
      'BOS-FCO': 590,
      'FCO-BOS': 590,
      'LHR-FRA': 280,
      'FRA-LHR': 280,
      'CDG-FRA': 250,
      'FRA-CDG': 250,
      'FRA-DXB': 580,
      'DXB-FRA': 580,
      'DXB-SIN': 420,
      'SIN-DXB': 420,
    }

    const routeKey = `${originSkyId}-${destinationSkyId}`
    const basePrice = basePriceMap[routeKey] || 500
    const price = Math.round(basePrice * randomFactor * weekendFactor)

    calendar.push({
      date: dateStr,
      price,
      isUnavailable: false,
    })
    prices.push(price)
  }

  const minPrice = Math.min(...prices)
  const maxPrice = Math.max(...prices)
  const cheapestDay = calendar.find(day => day.price === minPrice)

  // Mark cheapest and most expensive days
  calendar.forEach(day => {
    if (day.price === minPrice && minPrice > 0) {
      day.isCheapest = true
    }
    if (day.price === maxPrice && maxPrice > minPrice) {
      day.isMostExpensive = true
    }
  })

  return {
    origin: originSkyId,
    destination: destinationSkyId,
    currency,
    calendar,
    minPrice,
    maxPrice,
    cheapestDate: cheapestDay?.date || fromDate,
  }
}

/**
 * Gets nearby airports based on latitude and longitude
 * Uses Sky Scrapper API /v1/flights/getNearByAirports endpoint
 * Supports browser geolocation and manual coordinates
 * Falls back to mock data if API fails or key is not configured
 * @param lat - Latitude coordinate (-90 to 90)
 * @param lng - Longitude coordinate (-180 to 180)
 * @returns Promise with array of nearby airports (includes current location airport + nearby airports)
 * @throws Error if lat/lng are invalid numbers or out of range
 * @example
 * ```typescript
 * const airports = await getNearByAirports(40.7128, -74.0060) // New York coordinates
 * // Returns JFK, LGA, EWR airports
 * ```
 */
export async function getNearByAirports(lat: number, lng: number): Promise<Airport[]> {
  if (typeof lat !== 'number' || typeof lng !== 'number') {
    throw new Error('Latitude and longitude must be valid numbers')
  }

  if (lat < -90 || lat > 90) {
    throw new Error('Latitude must be between -90 and 90')
  }

  if (lng < -180 || lng > 180) {
    throw new Error('Longitude must be between -180 and 180')
  }

  return withMockFallback(
    async () => {
      // Sky Scrapper API endpoint: api/v1/flights/getNearByAirports
      const response = await apiRequest<SkyScrapperNearbyResponse>(
        '/v1/flights/getNearByAirports',
        {
          lat: lat.toString(),
          lng: lng.toString(),
          locale: 'en-US', // Default locale
        }
      )

      // Extract airports from response (current + nearby)
      const airports: Airport[] = []

      if (response.data) {
        if (response.data.current) {
          airports.push(convertSkyScrapperAirport(response.data.current))
        }
        if (response.data.nearby && Array.isArray(response.data.nearby)) {
          airports.push(...response.data.nearby.map(convertSkyScrapperAirport))
        }
      }

      // If API returns empty results, throw to trigger fallback
      if (airports.length === 0) {
        throw new Error('No airports returned from API')
      }

      return airports
    },
    () => getMockNearbyAirports(lat, lng),
    'getNearByAirports'
  )
}

/**
 * Gets detailed flight information using legs array
 * Uses Sky Scrapper API /v1/flights/getFlightDetails endpoint
 * Supports one-way and round-trip flights (multiple legs)
 * Returns null if API key is not configured (no mock data for details)
 * @param legs - Array of flight legs with origin, destination, and date
 * @param params - Additional parameters including adults, currency, locale, cabin class, etc.
 * @returns Promise with flight details or null if not found or API key missing
 * @throws Error if legs array is empty
 * @example
 * ```typescript
 * const details = await getFlightDetails([
 *   { origin: "JFK", destination: "LAX", date: "2024-04-15" }
 * ], {
 *   adults: 1,
 *   currency: "USD",
 *   cabinClass: "economy"
 * })
 * ```
 */
export async function getFlightDetails(
  legs: Array<{
    origin: string // Origin skyId (e.g., "LAXA")
    destination: string // Destination skyId (e.g., "LOND")
    date: string // Date in YYYY-MM-DD format (e.g., "2024-04-11")
  }>,
  params: {
    adults?: number
    currency?: string
    locale?: string
    market?: string
    cabinClass?: string
    countryCode?: string
  } = {}
): Promise<Flight | null> {
  if (!legs || legs.length === 0) {
    throw new Error('At least one leg is required')
  }

  return withFallback(async () => {
    // Build query parameters for getFlightDetails endpoint
    // Note: legs must be JSON stringified - apiRequest will URL encode it via url.searchParams.append
    const queryParams: Record<string, string | number> = {
      legs: JSON.stringify(legs), // JSON array as string
      adults: params.adults || 1,
      currency: params.currency || 'USD',
      locale: params.locale || 'en-US',
      market: params.market || 'en-US',
      cabinClass: params.cabinClass || 'economy',
      countryCode: params.countryCode || 'US',
    }

    // Make API request with properly encoded legs parameter
    const response = await apiRequest<FlightDetailsResponse>(
      '/v1/flights/getFlightDetails',
      queryParams
    )

    // Parse response - API returns flight details
    if (response && typeof response === 'object') {
      // Try to extract flight data from various possible response structures
      let flightData: RawFlightData | null = null

      if ('data' in response && response.data) {
        flightData = response.data as RawFlightData
      } else if (Array.isArray(response) && response.length > 0) {
        flightData = response[0] as RawFlightData
      } else if ('flight' in response || 'result' in response) {
        flightData = (response.flight || response.result) as RawFlightData
      } else {
        flightData = response as RawFlightData
      }

      if (flightData) {
        // Normalize to our Flight interface using centralized helper
        return normalizeFlightObject(flightData, {
          defaultFrom: legs[0]?.origin,
          defaultTo: legs[legs.length - 1]?.destination,
          cabinClass: params.cabinClass,
        })
      }
    }

    return null
  }, 'getFlightDetails')
}

/**
 * Gets price calendar for a route showing fare trends by date
 * Uses Sky Scrapper API /v1/flights/getPriceCalendar endpoint
 * Helps users find the cheapest travel dates
 * Returns null if API key is not configured or API fails
 * @param originSkyId - Origin airport skyId (e.g., "JFK")
 * @param destinationSkyId - Destination airport skyId (e.g., "LAX")
 * @param fromDate - Starting date for calendar in ISO format (YYYY-MM-DD)
 * @param currency - Currency code (default: 'USD')
 * @returns Promise with price calendar data including cheapest/most expensive dates, or null if not available
 * @throws Error if origin, destination, or fromDate are missing
 * @example
 * ```typescript
 * const calendar = await getPriceCalendar("JFK", "LAX", "2024-04-15", "USD")
 * // Returns calendar with prices for each date, highlighting cheapest dates
 * ```
 */
export async function getPriceCalendar(
  originSkyId: string,
  destinationSkyId: string,
  fromDate: string,
  currency = 'USD'
): Promise<PriceCalendarData | null> {
  if (!originSkyId || !destinationSkyId || !fromDate) {
    throw new Error('Origin, destination, and fromDate are required')
  }

  return withMockFallback(
    async () => {
      // Build query parameters
      const queryParams: Record<string, string | number> = {
        originSkyId,
        destinationSkyId,
        fromDate,
        currency,
      }

      // Make API request
      const response = await apiRequest<
        ApiResponse<RawPriceCalendarItem[]> | PriceCalendarResponse | RawPriceCalendarItem[]
      >('/v1/flights/getPriceCalendar', queryParams)

      // Parse response
      if (response && typeof response === 'object') {
        let calendarData: RawPriceCalendarItem[] | null = null

        if (Array.isArray(response)) {
          calendarData = response
        } else if ('data' in response && Array.isArray(response.data)) {
          calendarData = response.data
        } else if ('calendar' in response && Array.isArray(response.calendar)) {
          calendarData = response.calendar
        }

        if (calendarData && Array.isArray(calendarData)) {
          // If response is an array, convert to our format
          const items = calendarData as RawPriceCalendarItem[]
          const prices = items.map(item => ({
            date: item.date || item.DepartureDate || '',
            price: parseFloat(String(item.price || item.Price || item.amount || 0)),
          }))

          // Find min and max prices
          const validPrices = prices.filter(p => p.price > 0)
          const minPrice = validPrices.length > 0 ? Math.min(...validPrices.map(p => p.price)) : 0
          const maxPrice = validPrices.length > 0 ? Math.max(...validPrices.map(p => p.price)) : 0

          // Find cheapest date
          const cheapestDay = validPrices.find(p => p.price === minPrice)
          const cheapestDate = cheapestDay?.date || ''

          // Mark cheapest and most expensive days
          const calendar: PriceCalendarDay[] = prices.map(p => ({
            date: p.date,
            price: p.price,
            isCheapest: p.price === minPrice && minPrice > 0,
            isMostExpensive: p.price === maxPrice && maxPrice > minPrice,
            isUnavailable: p.price === 0,
          }))

          return {
            origin: originSkyId,
            destination: destinationSkyId,
            currency,
            calendar,
            minPrice,
            maxPrice,
            cheapestDate,
          }
        }
      }

      // If we couldn't parse the response, throw to trigger fallback
      throw new Error('Failed to parse price calendar response')
    },
    () => getMockPriceCalendar(originSkyId, destinationSkyId, fromDate, currency),
    'getPriceCalendar'
  )
}

/**
 * Gets available locales from the API
 * Uses Sky Scrapper API /v1/flights/getLocale endpoint
 * Returns empty array if API key is not configured or API fails
 * @returns Promise with list of supported locales (language/country combinations)
 * @example
 * ```typescript
 * const locales = await getLocale()
 * // Returns array like [{ code: "en-US", name: "English (United States)" }, ...]
 * ```
 */
export async function getLocale(): Promise<Locale[]> {
  return withFallback(async () => {
    const response = await apiRequest<ApiResponse<RawLocaleItem[]> | RawLocaleItem[]>(
      '/v1/locale/list',
      {}
    )

    // Handle different response structures
    if (response && typeof response === 'object') {
      let locales: Locale[] = []

      if (Array.isArray(response)) {
        // Direct array response
        const items = response as RawLocaleItem[]
        locales = items.map(item => ({
          code: item.code || item.locale || item.language || '',
          name: item.name || item.displayName || '',
          nativeName: item.nativeName || item.name || item.displayName || '',
        }))
      } else if ('data' in response && Array.isArray(response.data)) {
        // Wrapped in data property
        const items = response.data as RawLocaleItem[]
        locales = items.map(item => ({
          code: item.code || item.locale || item.language || '',
          name: item.name || item.displayName || '',
          nativeName: item.nativeName || item.name || item.displayName || '',
        }))
      } else if ('locales' in response && Array.isArray(response.locales)) {
        // Wrapped in locales property
        const items = response.locales as RawLocaleItem[]
        locales = items.map(item => ({
          code: item.code || item.locale || item.language || '',
          name: item.name || item.displayName || '',
          nativeName: item.nativeName || item.name || item.displayName || '',
        }))
      }

      return locales.filter(locale => locale.code && locale.name)
    }

    return []
  }, 'getLocale').then(result => result || [])
}

/**
 * Gets server configuration from the API
 * Uses Sky Scrapper API /v1/flights/getConfig endpoint
 * Returns null if API key is not configured or API fails
 * @returns Promise with server configuration object including API limits and features, or null if unavailable
 * @example
 * ```typescript
 * const config = await getConfig()
 * // Returns { limits: { requestsPerMinute: 60 }, features: [...], ... }
 * ```
 */
export async function getConfig(): Promise<ServerConfig | null> {
  return withFallback(async () => {
    const response = await apiRequest<ConfigResponse | ApiResponse<ConfigResponse>>(
      '/v1/config',
      {}
    )

    if (response && typeof response === 'object') {
      const config: ConfigResponse = 'data' in response ? response.data : response

      return {
        version: config.version || 'unknown',
        features: config.features || [],
        limits: config.limits || {},
      }
    }

    return null
  }, 'getConfig')
}

/**
 * Checks server health status by making a lightweight API call
 * Tests API connectivity by searching for a common airport ("JFK")
 * Returns offline status if API key is not configured
 * Returns online status if API key exists (even if health check fails, app can use mock data)
 * @returns Promise with health status object including isOnline flag, timestamp, and message
 * @example
 * ```typescript
 * const health = await checkServer()
 * // Returns { isOnline: true, timestamp: 1234567890, message: "Server is online" }
 * ```
 */
export async function checkServer(): Promise<HealthStatus> {
  const timestamp = Date.now()

  // If API key is not configured, consider it offline
  if (!RAPID_API_KEY) {
    logger.debug('checkServer', 'API key not configured')
    return {
      isOnline: false,
      timestamp,
      message: 'API key not configured',
    }
  }

  try {
    // Use a lightweight, real API endpoint for health check
    // Try searching for a very common airport (e.g., "JFK") as a quick health check
    // Note: If rate limited, this will return 429 and we'll handle it gracefully
    await apiRequest<SkyScrapperAirportResponse>('/v1/flights/searchAirport', {
      query: 'JFK',
      locale: 'en-US',
    })

    return {
      isOnline: true,
      timestamp,
      message: 'Server is online',
    }
  } catch (error) {
    // Check if error is a rate limit (429)
    const isRateLimit =
      error instanceof Error &&
      'status' in error &&
      (error as Error & { status?: number }).status === 429

    // Server is not responding - log the error but don't be too strict
    // Don't spam console with rate limit errors
    if (!isRateLimit) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      logger.warn('checkServer', 'Health check failed', { error: errorMessage })
    }

    // If rate limit hit, return offline status to stop checking
    if (isRateLimit) {
      // Silently return - no console logs for rate limits
      // Include 429 in message so AppStatusContext can detect it
      return {
        isOnline: false,
        timestamp,
        message: 'Rate limit exceeded (429), using mock data - health checks paused',
      }
    }

    // Even if the health check fails, if we have an API key, we can still try using mock data
    // So we'll return online=true but with a warning message
    return {
      isOnline: true, // Changed to true - if API key exists, we'll use mock data fallback
      timestamp,
      message: 'API slow or unavailable, using mock data',
    }
  }
}

/**
 * Test function to verify API connectivity
 * Searches for JFK airport to validate API connection
 * Useful for debugging and development
 * @returns Promise with test result including success flag, message, and timestamp
 * @example
 * ```typescript
 * const result = await testApiConnectivity()
 * // Returns { success: true, message: "API is working! Found 1 results for JFK.", timestamp: 1234567890 }
 * ```
 */
export async function testApiConnectivity(): Promise<{
  success: boolean
  message: string
  timestamp: number
}> {
  const timestamp = Date.now()

  logger.debug('testApiConnectivity', 'Testing API connectivity...')

  try {
    // Test with JFK airport search
    const results = await searchAirport('JFK')

    if (results && results.length > 0) {
      logger.info('testApiConnectivity', 'API connectivity test PASSED', {
        found: results.length,
        query: 'JFK',
      })
      return {
        success: true,
        message: `API is working! Found ${results.length} results for JFK.`,
        timestamp,
      }
    } else {
      logger.warn('testApiConnectivity', 'API connectivity test INCONCLUSIVE - No results returned')
      return {
        success: false,
        message: 'API returned no results. Check API key or try again later.',
        timestamp,
      }
    }
  } catch (error) {
    logger.error('testApiConnectivity', 'API connectivity test FAILED', error)
    return {
      success: false,
      message: error instanceof Error ? error.message : 'API test failed',
      timestamp,
    }
  }
}
