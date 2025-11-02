import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import DealCard from '../components/DealCard'
import { featuredDeals } from '../data/deals'
import type { Deal } from '../types/flight'
import { getFutureDate } from '../utils/formatDate'
import { Tag, Sparkles } from 'lucide-react'

/**
 * City to Airport mapping for deals
 * Maps city names to airport information for deals navigation
 * This avoids API calls when clicking deals and prevents rate limits
 */
const cityToAirportMap: Record<
  string,
  { iata: string; skyId: string; entityId: string; city: string }
> = {
  'New York': { iata: 'JFK', skyId: 'JFK', entityId: '95565058', city: 'New York' },
  Paris: { iata: 'CDG', skyId: 'CDG', entityId: '95565061', city: 'Paris' },
  'Los Angeles': { iata: 'LAX', skyId: 'LAX', entityId: '95565060', city: 'Los Angeles' },
  Tokyo: { iata: 'NRT', skyId: 'NRT', entityId: '95565062', city: 'Tokyo' },
  Chicago: { iata: 'ORD', skyId: 'ORD', entityId: '95565066', city: 'Chicago' },
  London: { iata: 'LHR', skyId: 'LHR', entityId: '95565059', city: 'London' },
  Miami: { iata: 'MIA', skyId: 'MIA', entityId: '95565068', city: 'Miami' },
  Barcelona: { iata: 'BCN', skyId: 'BCN', entityId: '95565067', city: 'Barcelona' },
  'San Francisco': { iata: 'SFO', skyId: 'SFO', entityId: '95565069', city: 'San Francisco' },
  Dubai: { iata: 'DXB', skyId: 'DXB', entityId: '95565063', city: 'Dubai' },
  Boston: { iata: 'BOS', skyId: 'BOS', entityId: '95565070', city: 'Boston' },
  Rome: { iata: 'FCO', skyId: 'FCO', entityId: '95565071', city: 'Rome' },
}

/**
 * Deals page displaying featured flight deals
 * Includes category filter and deal cards with navigation
 * @returns Deals page with featured offers and category filtering
 */
function Deals() {
  const navigate = useNavigate()
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const categories = [
    { value: 'all', label: 'All Deals' },
    { value: 'last-minute', label: 'Last Minute' },
    { value: 'best-savings', label: 'Best Savings' },
    { value: 'weekend', label: 'Weekend' },
    { value: 'seasonal', label: 'Seasonal' },
  ]

  const filteredDeals =
    selectedCategory === 'all' || !selectedCategory
      ? featuredDeals
      : featuredDeals.filter(deal => deal.category === selectedCategory)

  const handleSelectDeal = (dealId: string) => {
    const deal = featuredDeals.find(d => d.id === dealId)
    if (deal) {
      // Get airport info from city mapping (no API call needed - avoids rate limits)
      const originAirport = cityToAirportMap[deal.origin]
      const destAirport = cityToAirportMap[deal.destination]

      // Navigate to search with deal parameters pre-filled
      // Default departure date: 7 days from now for deals
      // This will trigger a search automatically via the Results page useEffect
      navigate('/flights', {
        state: {
          searchParams: {
            from: originAirport ? `${originAirport.city} (${originAirport.iata})` : deal.origin,
            to: destAirport ? `${destAirport.city} (${destAirport.iata})` : deal.destination,
            departure: getFutureDate(7),
            return: '',
            passengers: '1',
            cabinClass: 'economy',
            tripType: 'round-trip',
            // Add API required parameters if airports found
            originSkyId: originAirport?.skyId,
            destinationSkyId: destAirport?.skyId,
            originEntityId: originAirport?.entityId,
            destinationEntityId: destAirport?.entityId,
            // Add deal context for potential special handling
            dealId: deal.id,
            dealPrice: deal.discountedPrice,
          },
        },
      })
      // Removed toast - navigation and context will handle feedback
    }
  }

  return (
    <div className="py-8 md:py-12 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="h-8 w-8 text-primary-blue dark:text-blue-400" />
            <h1 className="text-4xl md:text-5xl font-bold text-text-dark dark:text-gray-100">
              Flight Deals
            </h1>
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Discover amazing flight deals and save up to 40% on your next trip
          </p>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
          {categories.map(category => (
            <button
              key={category.value}
              onClick={() => setSelectedCategory(category.value === 'all' ? null : category.value)}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-blue focus:ring-offset-2 dark:focus:ring-offset-gray-900 ${
                selectedCategory === category.value ||
                (category.value === 'all' && !selectedCategory)
                  ? 'bg-primary-blue dark:bg-blue-600 text-white shadow-md'
                  : 'bg-white dark:bg-gray-800 text-text-dark dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
              aria-label={`Filter deals by ${category.label}`}
              aria-pressed={
                selectedCategory === category.value ||
                (category.value === 'all' && !selectedCategory)
              }
            >
              <Tag className="inline h-4 w-4 mr-2" />
              {category.label}
            </button>
          ))}
        </div>

        {/* Deals Count */}
        <div className="mb-6">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Showing{' '}
            <span className="font-semibold text-text-dark dark:text-gray-200">
              {filteredDeals.length}
            </span>{' '}
            {filteredDeals.length === 1 ? 'deal' : 'deals'}
          </p>
        </div>

        {/* Deals Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {filteredDeals.map((deal: Deal) => (
            <DealCard key={deal.id} deal={deal} onSelect={handleSelectDeal} />
          ))}
        </div>

        {/* No Results */}
        {filteredDeals.length === 0 && (
          <div className="text-center py-12">
            <p className="text-lg text-gray-600 dark:text-gray-400">
              No deals found in this category
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Deals
