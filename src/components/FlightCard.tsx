import type { Flight } from '../types/flight'
import { Clock, Plane } from 'lucide-react'
import { formatPrice } from '../utils/formatPrice'

interface FlightCardProps {
  flight: Flight
  onSelect?: (flight: Flight) => void
}

/**
 * Flight card component displaying flight information
 * @param flight - Flight object with details
 * @param onSelect - Callback when user selects the flight
 * @returns Flight card with airline, times, duration, price, and select button
 */
function FlightCard({ flight, onSelect }: FlightCardProps) {
  const handleSelect = () => {
    if (onSelect) {
      onSelect(flight)
    }
  }

  return (
    <div
      className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-xl transition-all duration-300 p-6 border border-gray-200 dark:border-gray-700"
      role="article"
      aria-label={`${flight.airline} flight from ${flight.departureAirport} to ${flight.arrivalAirport}`}
    >
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        {/* Left Section: Airline Info */}
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-4">
            <h3 className="text-lg font-semibold text-text-dark dark:text-gray-200">
              {flight.airline}
            </h3>
            {flight.best && (
              <span className="bg-accent-yellow text-text-dark text-xs font-bold px-2 py-1 rounded">
                BEST
              </span>
            )}
          </div>

          {/* Flight Times */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
            {/* Departure */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Clock className="h-4 w-4 text-primary-blue" />
                <span className="text-xs text-gray-500 dark:text-gray-400">Departure</span>
              </div>
              <p className="text-lg font-semibold text-text-dark dark:text-gray-200">
                {flight.departureTime}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">{flight.departureAirport}</p>
            </div>

            {/* Arrival */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Clock className="h-4 w-4 text-primary-blue" />
                <span className="text-xs text-gray-500">Arrival</span>
              </div>
              <p className="text-lg font-semibold text-text-dark dark:text-gray-200">
                {flight.arrivalTime}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">{flight.arrivalAirport}</p>
            </div>

            {/* Duration & Stops */}
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-1">
                <Plane className="h-4 w-4 text-primary-blue" />
                <span className="text-xs text-gray-500">Duration</span>
              </div>
              <p className="text-sm font-medium text-text-dark dark:text-gray-200">
                {flight.duration}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {flight.stops === 0
                  ? 'Non-stop'
                  : `${flight.stops} stop${flight.stops > 1 ? 's' : ''}`}
              </p>
            </div>
          </div>
        </div>

        {/* Right Section: Price & Select Button */}
        <div className="flex flex-col items-center md:items-end justify-between gap-4 border-t md:border-t-0 md:border-l border-gray-200 dark:border-gray-700 pt-4 md:pt-0 md:pl-6">
          <div className="text-center md:text-right">
            <p className="text-3xl font-bold text-primary-blue">{formatPrice(flight.price)}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">per person</p>
          </div>
          <button
            onClick={handleSelect}
            className="w-full md:w-auto bg-primary-blue dark:bg-blue-600 text-white font-semibold px-6 py-3 rounded-lg hover:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-primary-blue focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-all duration-200 shadow-md hover:shadow-lg"
            aria-label={`Select ${flight.airline} flight for ${formatPrice(flight.price)}`}
          >
            Select
          </button>
        </div>
      </div>
    </div>
  )
}

export default FlightCard
