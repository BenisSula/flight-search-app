import SearchForm from '../features/search/SearchForm'
import HeroBackground from './common/HeroBackground'

/**
 * Hero section component with flight search form
 * Displays main headline and SearchForm on hero background
 * @returns Hero section with flight search functionality
 */
function HeroSection() {
  return (
    <HeroBackground minHeight="medium">
      <div className="container mx-auto">
        {/* Hero Text */}
        <div className="text-center mb-8 md:mb-12">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
            Find Your Perfect Flight
          </h1>
          <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto">
            Search and compare flights from hundreds of airlines worldwide
          </p>
        </div>

        {/* Search Form Card */}
        <div className="flex justify-center">
          <SearchForm />
        </div>
      </div>
    </HeroBackground>
  )
}

export default HeroSection
