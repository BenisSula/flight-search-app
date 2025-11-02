import type { Flight } from '../../types/flight'
import FlightCard from '../../components/FlightCard'
import { Loader, SkeletonLoader } from '../../components/common'
import { AlertCircle, Search, RefreshCw } from 'lucide-react'

interface ResultsListProps {
  flights: Flight[]
  isLoading?: boolean
  error?: string | null
  onSelectFlight?: (flight: Flight) => void
  onRetry?: () => void
}

/**
 * Results list component displaying flight search results
 * Shows loading skeletons, error states, empty states, and flight cards
 * @param flights - Array of flight results
 * @param isLoading - Loading state flag (default: false)
 * @param error - Error message to display
 * @param onSelectFlight - Callback when user selects a flight
 * @param onRetry - Callback for retry button in error state
 * @returns Results list with loading/error/empty states and flight cards
 */
function ResultsList({
  flights,
  isLoading = false,
  error = null,
  onSelectFlight,
  onRetry,
}: ResultsListProps) {
  if (isLoading) {
    return (
      <div className="py-8">
        <div className="mb-6 text-center">
          <Loader size="lg" variant="dots" message="Searching for flights..." />
        </div>
        <SkeletonLoader count={3} />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12 px-4">
        <div className="mb-6 flex justify-center">
          <div className="rounded-full bg-red-100 dark:bg-red-900/20 p-4">
            <AlertCircle className="h-12 w-12 text-red-500 dark:text-red-400" aria-hidden="true" />
          </div>
        </div>
        <h3 className="text-xl font-semibold text-text-dark dark:text-gray-200 mb-2">
          Unable to search flights
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
          {error || 'An unexpected error occurred while searching for flights.'}
        </p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary-blue text-white font-medium rounded-lg hover:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-primary-blue focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-colors"
            aria-label="Retry search"
          >
            <RefreshCw className="h-5 w-5" aria-hidden="true" />
            Try Again
          </button>
        )}
        <div className="mt-6 text-sm text-gray-500 dark:text-gray-400">
          <p>Suggestions:</p>
          <ul className="mt-2 space-y-1 text-left max-w-md mx-auto">
            <li>• Check your internet connection</li>
            <li>• Verify your search criteria</li>
            <li>• Try again in a few moments</li>
          </ul>
        </div>
      </div>
    )
  }

  if (flights.length === 0) {
    return (
      <div className="text-center py-12 px-4">
        <div className="mb-6 flex justify-center">
          <div className="rounded-full bg-gray-100 dark:bg-gray-800 p-4">
            <Search className="h-12 w-12 text-gray-400 dark:text-gray-500" aria-hidden="true" />
          </div>
        </div>
        <h3 className="text-xl font-semibold text-text-dark dark:text-gray-200 mb-2">
          No flights found
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4 max-w-md mx-auto">
          We couldn't find any flights matching your search criteria.
        </p>
        <div className="mt-6 text-sm text-gray-500 dark:text-gray-400">
          <p className="font-medium mb-2">Try adjusting:</p>
          <ul className="space-y-1 text-left max-w-md mx-auto">
            <li>• Your travel dates</li>
            <li>• Your origin or destination</li>
            <li>• Your filters (price range, stops, airlines)</li>
          </ul>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4" role="list" aria-label="Flight results">
      {flights.map((flight: Flight) => (
        <div key={flight.id} role="listitem">
          <FlightCard flight={flight} onSelect={onSelectFlight} />
        </div>
      ))}
    </div>
  )
}

export default ResultsList
