import { useNavigate } from 'react-router-dom'
import type { Destination } from '../types/flight'
import { formatPrice } from '../utils/formatPrice'
import { getFutureDate } from '../utils/formatDate'

interface DestinationCardProps {
  destination: Destination
}

/**
 * Destination card with image and price
 * @param destination - Destination object with city, country, image, and price
 * @returns Interactive destination card that navigates to search results
 */
function DestinationCard({ destination }: DestinationCardProps) {
  const navigate = useNavigate()

  const handleClick = () => {
    // Navigate to search with destination pre-filled
    // Default departure date: 14 days from now for popular destinations
    navigate('/flights', {
      state: {
        searchParams: {
          to: destination.city,
          departure: getFutureDate(14),
          return: '',
          passengers: '1',
          cabinClass: 'economy',
          tripType: 'round-trip',
        },
      },
    })
    // Removed toast - navigation and context will handle feedback
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleClick()
    }
  }

  return (
    <div
      className="group relative overflow-hidden rounded-lg shadow-md hover:shadow-2xl transition-all duration-300 transform hover:scale-105 cursor-pointer focus-within:ring-2 focus-within:ring-primary-blue focus-within:ring-offset-2 dark:focus-within:ring-offset-gray-900"
      role="article"
      tabIndex={0}
      aria-label={`${destination.city}, ${destination.country} - Starting from ${formatPrice(destination.price)}. Click to search flights.`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    >
      {/* Background Image */}
      <div className="relative h-64 md:h-80 overflow-hidden">
        <img
          src={destination.image}
          alt={`${destination.city}, ${destination.country}`}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
          loading="lazy"
        />

        {/* Dark Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/30 group-hover:from-black/90 group-hover:via-black/60 group-hover:to-black/40 transition-all duration-300" />

        {/* Content */}
        <div className="absolute inset-0 flex flex-col justify-end p-6 text-white">
          <div className="transform transition-transform duration-300 group-hover:translate-y-[-4px]">
            <h3 className="text-2xl md:text-3xl font-bold mb-1">{destination.city}</h3>
            <p className="text-white/90 text-sm md:text-base mb-3">{destination.country}</p>
            <div className="flex items-baseline gap-2">
              <span className="text-xs text-white/80">From</span>
              <span className="text-2xl md:text-3xl font-bold text-white">
                {formatPrice(destination.price)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DestinationCard
