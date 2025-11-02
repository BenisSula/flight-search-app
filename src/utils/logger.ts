/**
 * Centralized Logging Utility
 * Provides structured logging with multiple log levels
 * All logging is automatically disabled in production builds
 */

// Check if we're in development mode
const isDevelopment = import.meta.env.DEV

/**
 * Log levels for structured logging
 */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error'

/**
 * Base logger configuration
 */
export interface LoggerConfig {
  level: LogLevel
  context: string
  message: string
  data?: unknown
  error?: Error | unknown
}

/**
 * Gets emoji for log level
 */
function getLogEmoji(level: LogLevel): string {
  switch (level) {
    case 'debug':
      return '🔍'
    case 'info':
      return 'ℹ️'
    case 'warn':
      return '⚠️'
    case 'error':
      return '❌'
    default:
      return '📝'
  }
}

/**
 * Creates a structured log message
 */
function createLogMessage(config: LoggerConfig): string {
  const { level, context, message } = config
  const emoji = getLogEmoji(level)
  return `${emoji} [${level.toUpperCase()}] ${context}: ${message}`
}

/**
 * Logs a structured message
 * Only logs in development mode
 * @param level - Log level (debug, info, warn, error)
 * @param context - Context/component name
 * @param message - Log message
 * @param data - Optional data to log
 * @param error - Optional error object
 */
export function log(
  level: LogLevel,
  context: string,
  message: string,
  data?: unknown,
  error?: unknown
): void {
  // Early return if not in development mode
  if (!isDevelopment) {
    return
  }

  try {
    const config: LoggerConfig = {
      level,
      context,
      message,
      data,
      error,
    }

    const logMessage = createLogMessage(config)

    // Use appropriate console method based on level
    switch (level) {
      case 'debug':
        console.debug(logMessage, ...(data ? [data] : []), ...(error ? [error] : []))
        break
      case 'info':
        console.info(logMessage, ...(data ? [data] : []))
        break
      case 'warn':
        console.warn(logMessage, ...(data ? [data] : []), ...(error ? [error] : []))
        break
      case 'error':
        console.error(logMessage, ...(data ? [data] : []), error || '')
        break
    }
  } catch {
    // Silently fail if logging itself fails
  }
}

/**
 * Convenience functions for common log levels
 */
export const logger = {
  debug: (context: string, message: string, data?: unknown) => log('debug', context, message, data),
  info: (context: string, message: string, data?: unknown) => log('info', context, message, data),
  warn: (context: string, message: string, data?: unknown, error?: unknown) =>
    log('warn', context, message, data, error),
  error: (context: string, message: string, error?: unknown, data?: unknown) =>
    log('error', context, message, data, error),
}

/**
 * Logs an API request with structured formatting
 * @param endpoint - API endpoint
 * @param method - HTTP method
 * @param params - Request parameters
 */
export function logApiRequest(
  endpoint: string,
  method = 'GET',
  params?: Record<string, unknown>
): void {
  if (!isDevelopment) return

  // Suppress noisy health checks
  const isHealthCheck = endpoint.includes('searchAirport') && params?.query === 'JFK'
  const isConfigEndpoint = endpoint.includes('/config')

  if (isConfigEndpoint || isHealthCheck) {
    return
  }

  logger.info('API Request', `🚀 ${method} ${endpoint}`, params || {})
}

/**
 * Logs an API response with structured formatting
 * @param endpoint - API endpoint
 * @param response - Response data
 * @param options - Additional options (method, params, responseTime)
 */
export function logApiResponse(
  endpoint: string,
  response: unknown,
  options: {
    method?: string
    params?: Record<string, unknown>
    responseTime?: number
  } = {}
): void {
  if (!isDevelopment) return

  const { method = 'GET', responseTime } = options

  try {
    // Get response structure info
    const responseInfo: Record<string, unknown> = { method }
    if (responseTime !== undefined) {
      responseInfo.responseTime = `${responseTime}ms`
    }

    if (response && typeof response === 'object') {
      if (Array.isArray(response)) {
        responseInfo.type = `Array[${response.length}]`
      } else {
        const keys = Object.keys(response as Record<string, unknown>)
        responseInfo.type = 'Object'
        responseInfo.keys = keys.slice(0, 10)
      }
    } else {
      responseInfo.type = typeof response
    }

    logger.info('API Response', `✅ ${endpoint}`, responseInfo)

    // Also log full response in debug
    if (import.meta.env.DEV) {
      console.debug('Full Response:', response)
    }
  } catch {
    // Silently fail
  }
}

/**
 * Logs an API error with structured formatting
 * @param endpoint - API endpoint
 * @param error - Error object
 * @param params - Request parameters
 */
export function logApiError(
  endpoint: string,
  error: unknown,
  params?: Record<string, unknown>
): void {
  if (!isDevelopment) return

  try {
    let status: number | undefined
    if (error instanceof Error && 'status' in error) {
      status = (error as Error & { status?: number }).status
    }

    // Suppress expected errors (429, 404) to avoid spam
    if (status === 429 || status === 404) {
      return
    }

    const errorInfo: Record<string, unknown> = { endpoint }
    if (status) errorInfo.status = status
    if (params) errorInfo.params = params

    logger.error('API Error', `❌ ${endpoint}`, error, errorInfo)
  } catch {
    // Silently fail
  }
}
