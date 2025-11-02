import { useEffect, useState } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { ArrowLeft, Clock, Plane, MapPin, Briefcase, Luggage } from 'lucide-react'
import { Button, Loader, HeroBackground } from '../components/common'
import { formatPrice } from '../utils/formatPrice'
import { formatDate } from '../utils/formatDate'
import { getFlightDetails } from '../services/flightApi'
import type { Flight } from '../types/flight'
import toast from 'react-hot-toast'
import { useStrictModeDeduplication } from '../hooks/useStrictModeDeduplication'

/**
 * Flight details page displaying comprehensive flight information
 * Shows itinerary, duration, pricing, baggage, and booking options
 * @returns Flight details page with hero background and detailed information
 */
function FlightDetails() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const [flight, setFlight] = useState<Flight | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Use hook to prevent duplicate fetches in StrictMode
  const { shouldExecute, markExecuted } = useStrictModeDeduplication()

  useEffect(() => {
    const fetchFlightDetails = async () => {
      if (!id) {
        setError('Flight ID is required')
        setIsLoading(false)
        return
      }

      // Prevent duplicate fetches from StrictMode double mounting
      if (!shouldExecute(id)) {
        return
      }

      // Mark as fetched
      markExecuted(id)

      setIsLoading(true)
      setError(null)

      try {
        // Get flight object and search params from location state
        const flightFromState = location.state?.flight
        const searchParams = location.state?.searchParams

        // Priority 1: Use flight metadata if available (most reliable) - for API calls
        if (
          flightFromState?.originSkyId &&
          flightFromState?.destinationSkyId &&
          flightFromState?.departureDate
        ) {
          const legs = [
            {
              origin: flightFromState.originSkyId,
              destination: flightFromState.destinationSkyId,
              date: flightFromState.departureDate,
            },
          ]

          // Add return leg if it's a round trip
          if (flightFromState.returnDate && flightFromState.returnDate !== '') {
            legs.push({
              origin: flightFromState.destinationSkyId,
              destination: flightFromState.originSkyId,
              date: flightFromState.returnDate,
            })
          }

          const flightDetails = await getFlightDetails(legs, {
            adults: parseInt(searchParams?.passengers || '1', 10),
            currency: searchParams?.currency || 'USD',
            locale: searchParams?.locale || 'en-US',
            market: searchParams?.market || 'en-US',
            cabinClass: searchParams?.cabinClass || 'economy',
            countryCode: searchParams?.countryCode || 'US',
          })

          if (flightDetails) {
            setFlight(flightDetails)
            setIsLoading(false)
            return
          }
        }

        // Priority 2: Fallback to searchParams if flight metadata not available
        if (
          searchParams?.originSkyId &&
          searchParams?.destinationSkyId &&
          searchParams?.departure
        ) {
          const legs = [
            {
              origin: searchParams.originSkyId,
              destination: searchParams.destinationSkyId,
              date: searchParams.departure,
            },
          ]

          // Add return leg if it's a round trip
          if (searchParams.return && searchParams.tripType === 'round-trip') {
            legs.push({
              origin: searchParams.destinationSkyId,
              destination: searchParams.originSkyId,
              date: searchParams.return,
            })
          }

          const flightDetails = await getFlightDetails(legs, {
            adults: parseInt(searchParams.passengers || '1', 10),
            currency: searchParams.currency || 'USD',
            locale: searchParams.locale || 'en-US',
            market: searchParams.market || 'en-US',
            cabinClass: searchParams.cabinClass || 'economy',
            countryCode: searchParams.countryCode || 'US',
          })

          if (flightDetails) {
            setFlight(flightDetails)
            setIsLoading(false)
            return
          }
        }

        // Priority 3: Use flight object directly (for mock data when no API key)
        if (flightFromState) {
          // Use the flight object from state directly without calling API
          setFlight(flightFromState)
          setIsLoading(false)
          return
        }

        // If all priorities fail, show error
        if (!flightFromState && !searchParams) {
          setError(
            'Unable to fetch flight details. Please go back and select a flight from search results.'
          )
        } else {
          setError(
            'Flight details not found. The flight may have expired or is no longer available.'
          )
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to load flight details. Please try again.'
        setError(errorMessage)
        toast.error(errorMessage)
      } finally {
        setIsLoading(false)
      }
    }

    fetchFlightDetails()
  }, [id, location.state, shouldExecute, markExecuted])

  const handleBookNow = () => {
    if (flight) {
      // In a real app, this would redirect to booking partner or open booking modal
      // For now, show a message that booking is not yet implemented
      // Could integrate with external booking API here
    }
  }

  const handleBack = () => {
    navigate(-1) // Go back to previous page (usually results)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Loader size="lg" message="Loading flight details..." />
      </div>
    )
  }

  if (error || !flight) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
        <div className="container mx-auto max-w-2xl">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-primary-blue dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-300 mb-6 focus:outline-none focus:ring-2 focus:ring-primary-blue focus:ring-offset-2 dark:focus:ring-offset-gray-900 rounded-lg px-2 py-1 transition-all"
            aria-label="Go back to search results"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Results</span>
          </button>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
            <Plane className="h-16 w-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-text-dark dark:text-gray-100 mb-2">
              Flight Not Found
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
            <Button onClick={handleBack} variant="primary">
              Back to Search Results
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <HeroBackground minHeight="full">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          {/* Back Button */}
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-white hover:text-blue-200 mb-6 transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 rounded-lg px-2 py-1"
            aria-label="Go back to search results"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Results</span>
          </button>

          {/* Flight Details Card */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl overflow-hidden max-w-4xl mx-auto">
            {/* Header */}
            <div className="bg-gradient-to-r from-primary-blue to-blue-600 px-6 py-8 text-white">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <h1 className="text-3xl font-bold mb-2">{flight.airline}</h1>
                  {flight.best && (
                    <span className="inline-block bg-accent-yellow text-text-dark text-sm font-bold px-3 py-1 rounded">
                      BEST OPTION
                    </span>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-4xl font-bold mb-1">{formatPrice(flight.price)}</p>
                  <p className="text-sm text-blue-100">per person</p>
                </div>
              </div>
            </div>

            {/* Flight Information */}
            <div className="p-6 md:p-8">
              {/* Route Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                {/* Departure */}
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <MapPin className="h-5 w-5 text-primary-blue" />
                    <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                      DEPARTURE
                    </span>
                  </div>
                  <p className="text-3xl font-bold text-text-dark dark:text-gray-100 mb-2">
                    {flight.departureTime}
                  </p>
                  <p className="text-lg text-gray-700 dark:text-gray-300 mb-1">
                    {flight.departureAirport}
                  </p>
                  {(flight.departureDate || location.state?.searchParams?.departure) && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(
                        flight.departureDate || location.state.searchParams.departure || '',
                        'long'
                      )}
                    </p>
                  )}
                </div>

                {/* Arrival */}
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <MapPin className="h-5 w-5 text-primary-blue" />
                    <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                      ARRIVAL
                    </span>
                  </div>
                  <p className="text-3xl font-bold text-text-dark dark:text-gray-100 mb-2">
                    {flight.arrivalTime}
                  </p>
                  <p className="text-lg text-gray-700 dark:text-gray-300 mb-1">
                    {flight.arrivalAirport}
                  </p>
                  {(flight.returnDate || location.state?.searchParams?.return) &&
                    (location.state?.searchParams?.tripType === 'round-trip' ||
                      location.state?.searchParams?.return) && (
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(
                          flight.returnDate || location.state.searchParams.return || '',
                          'long'
                        )}
                      </p>
                    )}
                </div>
              </div>

              {/* Flight Details */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-8">
                <h2 className="text-xl font-bold text-text-dark dark:text-gray-100 mb-6">
                  Flight Details
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Duration */}
                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-primary-blue mt-1" />
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Duration</p>
                      <p className="text-lg font-semibold text-text-dark dark:text-gray-100">
                        {flight.duration}
                      </p>
                    </div>
                  </div>

                  {/* Stops */}
                  <div className="flex items-start gap-3">
                    <Plane className="h-5 w-5 text-primary-blue mt-1" />
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Stops</p>
                      <p className="text-lg font-semibold text-text-dark dark:text-gray-100">
                        {flight.stops === 0
                          ? 'Non-stop'
                          : `${flight.stops} stop${flight.stops > 1 ? 's' : ''}`}
                      </p>
                    </div>
                  </div>

                  {/* Cabin Class */}
                  {flight.cabinClass && (
                    <div className="flex items-start gap-3">
                      <Briefcase className="h-5 w-5 text-primary-blue mt-1" />
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Cabin Class</p>
                        <p className="text-lg font-semibold text-text-dark dark:text-gray-100 capitalize">
                          {flight.cabinClass.replace('-', ' ')}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Baggage */}
                  {flight.baggage && (
                    <div className="flex items-start gap-3">
                      <Luggage className="h-5 w-5 text-primary-blue mt-1" />
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Baggage</p>
                        <p className="text-lg font-semibold text-text-dark dark:text-gray-100">
                          {flight.baggage.carryOn !== false ? 'Carry-on included' : 'No carry-on'}
                          {flight.baggage.checked !== undefined && flight.baggage.checked > 0
                            ? ` • ${flight.baggage.checked} checked bag${flight.baggage.checked > 1 ? 's' : ''}`
                            : ''}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Flight Number */}
                  {flight.flightNumber && (
                    <div className="flex items-start gap-3">
                      <Plane className="h-5 w-5 text-primary-blue mt-1" />
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Flight Number</p>
                        <p className="text-lg font-semibold text-text-dark dark:text-gray-100">
                          {flight.flightNumber}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Aircraft */}
                  {flight.aircraft && (
                    <div className="flex items-start gap-3">
                      <Plane className="h-5 w-5 text-primary-blue mt-1" />
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Aircraft</p>
                        <p className="text-lg font-semibold text-text-dark dark:text-gray-100">
                          {flight.aircraft}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Layovers */}
                {flight.layover && Array.isArray(flight.layover) && flight.layover.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-text-dark dark:text-gray-100 mb-4">
                      Layovers
                    </h3>
                    <div className="space-y-3">
                      {flight.layover.map((layover, index) => (
                        <div key={index} className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                          <p className="font-medium text-text-dark dark:text-gray-100">
                            {layover.airport}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Layover duration: {layover.duration}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Booking Button */}
              <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div>
                    <p className="text-2xl font-bold text-text-dark dark:text-gray-100 mb-1">
                      {formatPrice(flight.price)}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total per person</p>
                  </div>
                  <Button
                    onClick={handleBookNow}
                    variant="primary"
                    size="lg"
                    className="w-full sm:w-auto min-w-[200px]"
                  >
                    Book Now
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </HeroBackground>
    </div>
  )
}

export default FlightDetails
