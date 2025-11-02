import { logger } from './logger'

/**
 * Handles API errors and returns a user-friendly error message
 * Uses centralized logging for error tracking
 * @param error - The error object from API call
 * @param context - Optional context for logging (e.g., function name)
 * @returns A user-friendly error message
 */
export function handleApiError(error: unknown, context?: string): string {
  // Log the error for debugging (in dev mode)
  const errorContext = context || 'API'

  // Handle Fetch API Response errors
  if (error instanceof Response) {
    logger.error(errorContext, 'Fetch API response error', error)
    return getHttpErrorMessage(error.status, error.statusText)
  }

  // Handle Error objects
  if (error instanceof Error) {
    // Check for network errors (failed fetch)
    if (error.message.includes('fetch') || error.message.includes('Network')) {
      logger.warn(errorContext, 'Network error', { message: error.message }, error)
      return 'Network error. Please check your internet connection and try again.'
    }

    // Check for timeout errors
    if (error.message.includes('timeout') || error.message.includes('Timeout')) {
      logger.warn(errorContext, 'Timeout error', { message: error.message }, error)
      return 'Request timeout. Please try again.'
    }

    // Check for abort errors
    if (error.message.includes('abort') || error.message.includes('Abort')) {
      logger.warn(errorContext, 'Request aborted', { message: error.message })
      return 'Request was cancelled. Please try again.'
    }

    // Check for API HTTP status errors
    if (error.message.match(/\b\d{3}\b/)) {
      const statusMatch = error.message.match(/\b(\d{3})\b/)
      if (statusMatch) {
        const status = parseInt(statusMatch[1], 10)
        logger.error(errorContext, `HTTP ${status} error`, error)
        return getHttpErrorMessage(status)
      }
    }

    // Check for specific error messages
    if (error.message.includes('401') || error.message.includes('Unauthorized')) {
      logger.error(errorContext, 'Unauthorized', error)
      return 'Authentication failed. Please check your API key.'
    }

    if (error.message.includes('403') || error.message.includes('Forbidden')) {
      logger.error(errorContext, 'Forbidden access', error)
      return 'Access denied. Please check your API subscription.'
    }

    if (error.message.includes('404') || error.message.includes('Not Found')) {
      logger.warn(errorContext, 'Resource not found', error)
      return 'Requested resource not found. Please check your search parameters.'
    }

    if (error.message.includes('429') || error.message.includes('Too Many Requests')) {
      logger.warn(errorContext, 'Rate limit exceeded', error)
      return 'Rate limit exceeded. Please wait and retry.'
    }

    if (error.message.includes('500') || error.message.includes('Internal Server Error')) {
      logger.error(errorContext, 'Server error', error)
      return 'Server error. Try again later.'
    }

    if (
      error.message.includes('502') ||
      error.message.includes('Bad Gateway') ||
      error.message.includes('503') ||
      error.message.includes('Service Unavailable')
    ) {
      logger.error(errorContext, 'Service unavailable', error)
      return 'Service temporarily unavailable. Please try again later.'
    }

    // Return the error message if it's user-friendly (not too long or technical)
    if (error.message && error.message.length < 150 && !error.message.includes('at ')) {
      return error.message
    }
  }

  // Handle unknown error types
  if (typeof error === 'string') {
    logger.error(errorContext, 'String error', { error })
    return error.length < 150 ? error : 'An error occurred. Please try again.'
  }

  // Default error message
  logger.error(errorContext, 'Unexpected error', error)
  return 'An unexpected error occurred. Please try again later.'
}

/**
 * Gets user-friendly HTTP error message based on status code
 * @param status - HTTP status code
 * @param statusText - HTTP status text (optional)
 * @returns User-friendly error message
 */
function getHttpErrorMessage(status: number, statusText?: string): string {
  switch (status) {
    case 400:
      return 'Invalid request. Please check your search parameters.'
    case 401:
      return 'Authentication failed. Please check your API key.'
    case 403:
      return 'Access denied. Please check your API subscription.'
    case 404:
      return 'Requested resource not found.'
    case 408:
      return 'Request timeout. Please try again.'
    case 429:
      return 'Rate limit exceeded. Please wait and retry.'
    case 500:
      return 'Server error. Try again later.'
    case 502:
      return 'Bad gateway. The server is temporarily unavailable.'
    case 503:
      return 'Service unavailable. Please try again later.'
    case 504:
      return 'Gateway timeout. Please try again.'
    default:
      return statusText
        ? `Error ${status}: ${statusText}`
        : `An error occurred (Status: ${status}). Please try again.`
  }
}

/**
 * Checks if an error is a network error
 * @param error - The error object
 * @returns True if it's a network error
 */
export function isNetworkError(error: unknown): boolean {
  if (error instanceof Error) {
    return (
      error.message.includes('fetch') ||
      error.message.includes('Network') ||
      error.message.includes('network')
    )
  }
  return false
}
