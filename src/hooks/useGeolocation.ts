import { useState, useEffect } from 'react'

/**
 * Geolocation status types
 */
type GeolocationStatus = 'idle' | 'loading' | 'success' | 'error'

/**
 * Geolocation result interface
 */
interface GeolocationResult {
  latitude: number | null
  longitude: number | null
  error: string | null
  status: GeolocationStatus
}

/**
 * Options for geolocation
 */
interface GeolocationOptions {
  enableHighAccuracy?: boolean
  timeout?: number
  maximumAge?: number
}

/**
 * Custom hook for browser geolocation API
 * Handles getting user's current location with proper error handling
 * @param options - Geolocation options (enableHighAccuracy, timeout, maximumAge)
 * @returns Geolocation result with coordinates, error, and status
 */
export function useGeolocation(options: GeolocationOptions = {}): GeolocationResult {
  const [result, setResult] = useState<GeolocationResult>({
    latitude: null,
    longitude: null,
    error: null,
    status: 'idle',
  })

  useEffect(() => {
    // Check if geolocation is supported
    if (!navigator.geolocation) {
      setResult({
        latitude: null,
        longitude: null,
        error: 'Geolocation is not supported by your browser',
        status: 'error',
      })
      return
    }

    // Request geolocation
    setResult(prev => ({ ...prev, status: 'loading' }))

    navigator.geolocation.getCurrentPosition(
      position => {
        setResult({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          error: null,
          status: 'success',
        })
      },
      error => {
        let errorMessage = 'Unable to get your location'
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied. Please enable location permissions.'
            break
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information is unavailable.'
            break
          case error.TIMEOUT:
            errorMessage = 'Location request timed out. Please try again.'
            break
          default:
            errorMessage = error.message || 'An unknown error occurred'
            break
        }
        setResult({
          latitude: null,
          longitude: null,
          error: errorMessage,
          status: 'error',
        })
      },
      {
        enableHighAccuracy: options.enableHighAccuracy ?? false,
        timeout: options.timeout ?? 10000,
        maximumAge: options.maximumAge ?? 0,
      }
    )
  }, [options.enableHighAccuracy, options.timeout, options.maximumAge])

  return result
}
