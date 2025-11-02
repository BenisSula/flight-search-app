import { logger } from './logger'

/**
 * Retry configuration for API requests
 */
interface RetryConfig {
  maxRetries?: number
  baseDelay?: number // Base delay in milliseconds
  maxDelay?: number // Maximum delay in milliseconds
  retryableStatusCodes?: number[] // HTTP status codes that should trigger retry
}

/**
 * Default retry configuration
 */
const DEFAULT_CONFIG: Required<RetryConfig> = {
  maxRetries: 2,
  baseDelay: 1000, // 1 second base delay
  maxDelay: 10000, // 10 seconds max delay
  retryableStatusCodes: [500, 502, 503, 504], // Retry on server errors only (NOT 429 - rate limits should not retry immediately)
}

/**
 * Checks if an error is retryable based on status code
 * Client errors (400-403, 429) should NOT be retried
 * Rate limits (429) should not be retried - they need time to reset
 * @param error - Error object with optional status property
 * @param retryableStatusCodes - List of status codes that should trigger retry
 * @returns true if the error is retryable, false otherwise
 */
function isRetryableError(
  error: unknown,
  retryableStatusCodes: number[] = DEFAULT_CONFIG.retryableStatusCodes
): boolean {
  // Network errors are always retryable
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return true
  }

  // Check if error has a status code
  if (error instanceof Error && 'status' in error) {
    const status = (error as Error & { status?: number }).status
    if (status === undefined) return true // Unknown status, retry

    // Client errors (400-403, 429) should NOT be retried
    // 429 = rate limit - retrying immediately won't help, need to wait
    if (status >= 400 && status <= 403) {
      return false
    }
    if (status === 429) {
      return false // Rate limit - don't retry immediately
    }

    // Check if status is in retryable list
    return retryableStatusCodes.includes(status)
  }

  // If no status code, assume it's retryable (network error)
  return true
}

/**
 * Calculates exponential backoff delay with jitter
 * @param attempt - Current attempt number (0-indexed)
 * @param baseDelay - Base delay in milliseconds
 * @param maxDelay - Maximum delay in milliseconds
 * @returns Delay in milliseconds
 */
function calculateDelay(attempt: number, baseDelay: number, maxDelay: number): number {
  // Exponential backoff: baseDelay * (2 ^ attempt)
  const exponentialDelay = baseDelay * Math.pow(2, attempt)
  // Add jitter (random 0-25% of delay) to prevent thundering herd
  const jitter = Math.random() * 0.25 * exponentialDelay
  const delay = exponentialDelay + jitter
  // Cap at maxDelay
  return Math.min(delay, maxDelay)
}

/**
 * Makes an API request with exponential retry logic
 * Retries on transient failures (network errors, rate limits, server errors)
 * Does NOT retry on client errors (400-403)
 * @param requestFn - Function that makes the API request and returns a Promise
 * @param config - Retry configuration
 * @returns Promise with the result of the API request
 * @throws Error if all retries are exhausted
 */
export async function apiRequestWithRetry<T>(
  requestFn: () => Promise<T>,
  config: RetryConfig = {}
): Promise<T> {
  const {
    maxRetries = DEFAULT_CONFIG.maxRetries,
    baseDelay = DEFAULT_CONFIG.baseDelay,
    maxDelay = DEFAULT_CONFIG.maxDelay,
    retryableStatusCodes = DEFAULT_CONFIG.retryableStatusCodes,
  } = config

  let lastError: unknown

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await requestFn()
    } catch (error) {
      lastError = error

      // Don't retry if we've exhausted all attempts
      if (attempt >= maxRetries) {
        break
      }

      // Don't retry if error is not retryable (client errors)
      if (!isRetryableError(error, retryableStatusCodes)) {
        break
      }

      // Calculate delay for exponential backoff
      const delay = calculateDelay(attempt, baseDelay, maxDelay)

      // Log retry attempt (only if not rate limit)
      const status =
        error instanceof Error && 'status' in error
          ? (error as Error & { status?: number }).status
          : 'unknown'

      // Don't log retry attempts for rate limits (429) - they're not retryable anyway
      if (status !== 429) {
        logger.warn('API Retry', `Request failed (attempt ${attempt + 1}/${maxRetries + 1})`, {
          status,
          delay: Math.round(delay),
        })
      }

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }

  // All retries exhausted or non-retryable error
  throw lastError
}
