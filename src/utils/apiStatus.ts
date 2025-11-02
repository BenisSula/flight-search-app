import { logger } from './logger'
import { RAPID_API_KEY, RAPID_API_HOST, RAPID_API_BASE_URL } from './envConfig'

/**
 * Health status type
 */
export type ApiConnectionStatus = 'online' | 'offline' | 'mock'

/**
 * Health check result
 */
export interface ApiHealthResult {
  status: ApiConnectionStatus
  message: string
  timestamp: number
  usingMockData: boolean
  apiKeyConfigured: boolean
}

/**
 * Cached health check result to avoid repeated API calls within a session
 */
let cachedHealthCheck: ApiHealthResult | null = null
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

/**
 * Checks if the cached health check is still valid
 * @returns true if cache is valid, false if expired
 */
function isCacheValid(cached: ApiHealthResult): boolean {
  const age = Date.now() - cached.timestamp
  return age < CACHE_DURATION
}

/**
 * Performs a lightweight health check against RapidAPI
 * Uses caching to avoid rate limits from repetitive checks
 * @param skipCache - If true, bypass cache and perform fresh check
 * @returns Health check result with status, message, and metadata
 */
export async function checkApiHealth(
  skipCache = false
): Promise<ApiHealthResult> {
  const timestamp = Date.now()

  // Check cache first
  if (!skipCache && cachedHealthCheck && isCacheValid(cachedHealthCheck)) {
    logger.debug('apiStatus', 'Returning cached health check result', {
      status: cachedHealthCheck.status,
      age: Date.now() - cachedHealthCheck.timestamp,
    })
    return cachedHealthCheck
  }

  // Check if API key is configured
  if (!RAPID_API_KEY || RAPID_API_KEY.trim() === '') {
    const result: ApiHealthResult = {
      status: 'mock',
      message: 'API key not configured - using mock data',
      timestamp,
      usingMockData: true,
      apiKeyConfigured: false,
    }
    cachedHealthCheck = result
    return result
  }

  // Try to connect to RapidAPI with a lightweight request
  try {
    const endpoint = '/v1/flights/searchAirport'
    const url = new URL(`${RAPID_API_BASE_URL}${endpoint}`)
    url.searchParams.append('query', 'JFK')
    url.searchParams.append('locale', 'en-US')

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000) // 5 second timeout

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'x-rapidapi-key': RAPID_API_KEY,
        'x-rapidapi-host': RAPID_API_HOST,
      },
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (response.ok) {
      const result: ApiHealthResult = {
        status: 'online',
        message: 'Connected to RapidAPI',
        timestamp,
        usingMockData: false,
        apiKeyConfigured: true,
      }
      cachedHealthCheck = result
      logger.info('apiStatus', 'API health check successful')
      return result
    } else if (response.status === 429) {
      // Rate limit - don't cache, return offline status
      logger.warn('apiStatus', 'Rate limit hit during health check')
      return {
        status: 'offline',
        message: 'Rate limit exceeded - using mock data',
        timestamp,
        usingMockData: true,
        apiKeyConfigured: true,
      }
    } else {
      // Other API error - assume available but use mock data as fallback
      const result: ApiHealthResult = {
        status: 'online',
        message: `API returned ${response.status} - mock data fallback active`,
        timestamp,
        usingMockData: true,
        apiKeyConfigured: true,
      }
      cachedHealthCheck = result
      return result
    }
  } catch (error) {
    // Network error, timeout, or fetch failed
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        logger.warn('apiStatus', 'Health check timeout')
      } else {
        logger.warn('apiStatus', 'Health check failed', { error: error.message })
      }
    }

    // Return mock status - API not available but app still works
    const result: ApiHealthResult = {
      status: 'mock',
      message: 'API unavailable - using mock data',
      timestamp,
      usingMockData: true,
      apiKeyConfigured: true,
    }
    cachedHealthCheck = result
    return result
  }
}

/**
 * Invalidates the cached health check result
 * Forces the next check to perform a fresh API call
 */
export function invalidateHealthCache(): void {
  cachedHealthCheck = null
  logger.debug('apiStatus', 'Health cache invalidated')
}

/**
 * Gets the current cached health status without making a new API call
 * Returns null if no cache exists
 * @returns Cached health result or null
 */
export function getCachedHealthStatus(): ApiHealthResult | null {
  if (cachedHealthCheck && isCacheValid(cachedHealthCheck)) {
    return cachedHealthCheck
  }
  return null
}

/**
 * Check if mock data is being used
 * @returns true if using mock data, false if using real API
 */
export function isUsingMockData(): boolean {
  return cachedHealthCheck?.usingMockData || !RAPID_API_KEY
}

/**
 * Check if API key is configured
 * @returns true if API key exists, false otherwise
 */
export function isApiKeyConfigured(): boolean {
  return !!RAPID_API_KEY && RAPID_API_KEY.trim() !== ''
}

