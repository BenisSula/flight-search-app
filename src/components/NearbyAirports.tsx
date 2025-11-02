import { useEffect, useState } from 'react'
import { MapPin, Navigation, AlertCircle } from 'lucide-react'
import { getNearByAirports } from '../services/flightApi'
import { useGeolocation } from '../hooks/useGeolocation'
import type { Airport } from '../types/airport'
import { formatAirportDisplay } from '../utils/formatAirport'
import { Loader } from './common'
import { logger } from '../utils/logger'

interface NearbyAirportsProps {
  onSelectAirport?: (airport: Airport) => void
  maxResults?: number
}

/**
 * NearbyAirports component that displays airports near user's location
 * Uses browser geolocation API and falls back gracefully to mock data
 * @param onSelectAirport - Callback when user selects an airport
 * @param maxResults - Maximum number of airports to display (default: 5)
 * @returns NearbyAirports component with loading, error, and success states
 */
function NearbyAirports({ onSelectAirport, maxResults = 5 }: NearbyAirportsProps) {
  const {
    latitude,
    longitude,
    error: geoError,
    status: geoStatus,
  } = useGeolocation({
    enableHighAccuracy: true,
    timeout: 10000,
  })

  const [airports, setAirports] = useState<Airport[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchNearbyAirports = async () => {
      // Only fetch if we have coordinates
      if (geoStatus === 'success' && latitude !== null && longitude !== null) {
        setIsLoading(true)
        setError(null)

        try {
          const nearbyAirports = await getNearByAirports(latitude, longitude)
          setAirports(nearbyAirports.slice(0, maxResults))
        } catch (err) {
          const errorMessage =
            err instanceof Error ? err.message : 'Failed to load nearby airports. Please try again.'
          setError(errorMessage)
          logger.error('NearbyAirports', 'Error fetching nearby airports', err)
        } finally {
          setIsLoading(false)
        }
      } else if (geoStatus === 'error') {
        // Geolocation failed, show error message
        setError(geoError || 'Unable to get your location')
        setIsLoading(false)
      }
    }

    fetchNearbyAirports()
  }, [latitude, longitude, geoStatus, geoError, maxResults])

  // Don't render if geolocation is not requested or still loading
  if (geoStatus === 'idle' || geoStatus === 'loading') {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="flex items-center gap-2 mb-4">
          <Navigation className="h-5 w-5 text-primary-blue" />
          <h3 className="text-lg font-semibold text-text-dark dark:text-gray-100">
            Nearby Airports
          </h3>
        </div>
        <div className="flex items-center justify-center py-8">
          <Loader message="Getting your location..." size="sm" />
        </div>
      </div>
    )
  }

  // Show error state
  if (geoStatus === 'error' || (error && airports.length === 0)) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="flex items-center gap-2 mb-4">
          <Navigation className="h-5 w-5 text-primary-blue" />
          <h3 className="text-lg font-semibold text-text-dark dark:text-gray-100">
            Nearby Airports
          </h3>
        </div>
        <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
          <AlertCircle className="h-5 w-5 text-yellow-500" />
          <p>{error || geoError || 'Unable to find nearby airports'}</p>
        </div>
      </div>
    )
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="flex items-center gap-2 mb-4">
          <Navigation className="h-5 w-5 text-primary-blue" />
          <h3 className="text-lg font-semibold text-text-dark dark:text-gray-100">
            Nearby Airports
          </h3>
        </div>
        <div className="flex items-center justify-center py-8">
          <Loader message="Finding nearby airports..." size="sm" />
        </div>
      </div>
    )
  }

  // Show empty state
  if (airports.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="flex items-center gap-2 mb-4">
          <Navigation className="h-5 w-5 text-primary-blue" />
          <h3 className="text-lg font-semibold text-text-dark dark:text-gray-100">
            Nearby Airports
          </h3>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400">No nearby airports found.</p>
      </div>
    )
  }

  // Show airports list
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <div className="flex items-center gap-2 mb-4">
        <Navigation className="h-5 w-5 text-primary-blue" />
        <h3 className="text-lg font-semibold text-text-dark dark:text-gray-100">Nearby Airports</h3>
      </div>

      <div className="space-y-2">
        {airports.map(airport => (
          <button
            key={`${airport.iata}-${airport.skyId}`}
            onClick={() => onSelectAirport?.(airport)}
            className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-blue focus:ring-offset-2 dark:focus:ring-offset-gray-800 text-left"
            aria-label={`Select airport ${formatAirportDisplay(airport)}`}
          >
            <MapPin className="h-5 w-5 text-primary-blue flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="font-medium text-text-dark dark:text-gray-200">
                {formatAirportDisplay(airport)}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 truncate">
                {airport.name}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

export default NearbyAirports
