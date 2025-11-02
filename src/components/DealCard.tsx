import type { Deal } from '../types/flight'
import { Tag, MapPin, Calendar, TrendingDown } from 'lucide-react'
import { formatDate } from '../utils/formatDate'
import { formatPrice } from '../utils/formatPrice'

interface DealCardProps {
  deal: Deal
  onSelect?: (dealId: string) => void
}

/**
 * Deal card component displaying flight deals with savings badge
 * @param deal - Deal object with origin, destination, pricing, and details
 * @param onSelect - Callback when user clicks "View Deal" button
 * @returns Deal card with savings badge, pricing comparison, and CTA
 */
function DealCard({ deal, onSelect }: DealCardProps) {
  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'last-minute':
        return 'Last Minute'
      case 'best-savings':
        return 'Best Savings'
      case 'weekend':
        return 'Weekend Deal'
      case 'seasonal':
        return 'Seasonal'
      default:
        return 'Special Offer'
    }
  }

  const handleSelect = () => {
    if (onSelect) {
      onSelect(deal.id)
    }
  }

  return (
    <div
      className="group relative bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200 dark:border-gray-700"
      role="article"
      aria-label={`Flight deal from ${deal.origin} to ${deal.destination} - Save ${deal.savingsPercent}%`}
    >
      {/* Image Section */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={deal.image}
          alt={`${deal.destination}`}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
          loading="lazy"
          decoding="async"
          fetchPriority="auto"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

        {/* Savings Badge */}
        <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1">
          <TrendingDown className="h-4 w-4" />
          Save {deal.savingsPercent}%
        </div>

        {/* Category Badge */}
        <div className="absolute top-4 left-4 bg-primary-blue dark:bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
          {getCategoryLabel(deal.category)}
        </div>
      </div>

      {/* Content Section */}
      <div className="p-6">
        {/* Route */}
        <div className="flex items-center gap-2 mb-3">
          <MapPin className="h-4 w-4 text-primary-blue" />
          <span className="font-semibold text-text-dark dark:text-gray-200">
            {deal.origin} → {deal.destination}
          </span>
        </div>

        {/* Airline */}
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{deal.airline}</p>

        {/* Pricing */}
        <div className="flex items-baseline gap-3 mb-4">
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 line-through">
              {formatPrice(deal.originalPrice)}
            </p>
            <p className="text-3xl font-bold text-primary-blue dark:text-blue-400">
              {formatPrice(deal.discountedPrice)}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">per person</p>
          </div>
          <div className="flex-1">
            <p className="text-sm text-green-600 dark:text-green-400 font-semibold">
              Save {formatPrice(deal.savings)}
            </p>
          </div>
        </div>

        {/* Valid Until */}
        <div className="flex items-center gap-2 mb-4 text-xs text-gray-500 dark:text-gray-400">
          <Calendar className="h-3 w-3" />
          <span>Valid until {formatDate(deal.validUntil, 'short')}</span>
        </div>

        {/* Select Button */}
        <button
          onClick={handleSelect}
          className="w-full bg-primary-blue dark:bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg hover:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-primary-blue focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
          aria-label={`View deal from ${deal.origin} to ${deal.destination} for ${formatPrice(deal.discountedPrice)}`}
        >
          <Tag className="h-4 w-4" />
          View Deal
        </button>
      </div>
    </div>
  )
}

export default DealCard
