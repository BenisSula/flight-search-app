import { RAPID_API_KEY } from './envConfig'
import { logger } from './logger'

/**
 * Generic wrapper for API calls with automatic mock data fallback
 * Handles missing API keys, API failures, and provides consistent fallback behavior
 *
 * @param apiCall - Function that makes the actual API call
 * @param getMockData - Function that returns mock data (can be async)
 * @param context - Context string for logging (e.g., "searchFlights", "getPriceCalendar")
 * @returns Promise with API data or mock data
 *
 * @example
 * ```typescript
 * const flights = await withMockFallback(
 *   () => searchFlightsApi(params),
 *   () => getMockFlights(),
 *   'searchFlights'
 * )
 * ```
 */
export async function withMockFallback<T>(
  apiCall: () => Promise<T>,
  getMockData: () => T | Promise<T>,
  context: string
): Promise<T> {
  // If API key is not configured, return mock data immediately
  if (!RAPID_API_KEY) {
    logger.debug(context, 'Using mock data (API key not configured)')
    return getMockData()
  }

  try {
    // Attempt API call
    const result = await apiCall()
    return result
  } catch (error) {
    // Check if this is due to missing API key (expected in development)
    if (error instanceof Error && error.name === 'NoApiKeyError') {
      logger.debug(context, 'API key not configured, using mock data')
      return getMockData()
    }

    // For any other API error, fall back to mock data
    logger.warn(context, 'API call failed, falling back to mock data', { error })
    return getMockData()
  }
}

/**
 * Simplified version that wraps API call with context-sensitive logging
 * Returns null on failure if no mock data is provided
 *
 * @param apiCall - Function that makes the actual API call
 * @param context - Context string for logging
 * @returns Promise with API data or null
 *
 * @example
 * ```typescript
 * const details = await withFallback(
 *   () => getFlightDetailsApi(legs),
 *   'getFlightDetails'
 * )
 * ```
 */
export async function withFallback<T>(
  apiCall: () => Promise<T>,
  context: string
): Promise<T | null> {
  // If API key is not configured, return null
  if (!RAPID_API_KEY) {
    logger.debug(context, 'API key not configured')
    return null
  }

  try {
    return await apiCall()
  } catch (error) {
    logger.error(context, 'API call failed', error)
    return null
  }
}
