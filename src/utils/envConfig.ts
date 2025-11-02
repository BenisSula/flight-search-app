import { logger } from './logger'

/**
 * Centralized environment configuration for API access
 * Provides type-safe access to environment variables throughout the application
 */

// API Configuration
export const RAPID_API_KEY = import.meta.env.VITE_RAPIDAPI_KEY || ''
export const RAPID_API_HOST = import.meta.env.VITE_RAPIDAPI_HOST || 'sky-scrapper.p.rapidapi.com'
export const RAPID_API_BASE_URL = `https://${RAPID_API_HOST}`

/**
 * Validates that required environment variables are configured
 * @returns true if API key is configured, false otherwise
 */
export function isApiConfigured(): boolean {
  return !!RAPID_API_KEY
}

/**
 * Gets environment configuration summary for debugging
 * @returns Configuration object with sanitized values
 */
export function getEnvConfig() {
  return {
    isConfigured: isApiConfigured(),
    host: RAPID_API_HOST,
    baseUrl: RAPID_API_BASE_URL,
    keyLength: RAPID_API_KEY.length,
    keyPrefix: RAPID_API_KEY.substring(0, 8) + '...', // Show first 8 chars for debugging
  }
}

// Log configuration status on import (only in development)
if (import.meta.env.DEV) {
  if (!isApiConfigured()) {
    logger.warn('EnvConfig', 'API key not configured', {
      message: 'VITE_RAPIDAPI_KEY is not set. Please add it to your .env file.',
    })
  } else {
    logger.info('EnvConfig', 'API configuration loaded', getEnvConfig())
  }
}
