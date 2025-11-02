import DestinationCard from './DestinationCard'
import { destinations } from '../data/destinations'

/**
 * Popular destinations section displaying featured cities
 * Responsive grid layout: 1 col mobile, 2 col tablet, 4 col desktop
 * @returns Section with destination cards in responsive grid
 */
function PopularDestinations() {
  return (
    <section
      className="py-12 md:py-16 lg:py-20 bg-gray-50 dark:bg-gray-900"
      aria-label="Popular destinations"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-text-dark dark:text-gray-100 mb-4">
            Popular Destinations
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Discover amazing places around the world with our best flight deals
          </p>
        </div>

        {/* Responsive Grid: 1-col mobile, 2-col tablet, 4-col desktop */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {destinations.map(destination => (
            <DestinationCard key={destination.id} destination={destination} />
          ))}
        </div>
      </div>
    </section>
  )
}

export default PopularDestinations
