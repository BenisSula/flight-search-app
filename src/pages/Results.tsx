import { useEffect, useState, useMemo } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import SortBar from '../components/SortBar'
import { useSearch } from '../context/SearchContext'
import ResultsList from '../features/results/ResultsList'
import FiltersPanel from '../features/results/FiltersPanel'
import PriceCalendar from '../features/search/PriceCalendar'
import type { TripType, Flight } from '../types/flight'
import { formatDate } from '../utils/formatDate'
import { Filter, Calendar as CalendarIcon } from 'lucide-react'
import { useStrictModeDeduplication } from '../hooks/useStrictModeDeduplication'

interface SearchParams {
  from?: string
  to?: string
  departure?: string
  return?: string
  passengers?: string
  cabinClass?: string
  originSkyId?: string
  destinationSkyId?: string
  originEntityId?: string
  destinationEntityId?: string
  currency?: string
  tripType?: TripType
}

/**
 * Flight results page displaying search results
 * Includes sort bar, filters panel, price calendar, and results list
 * @returns Results page with filtering, sorting, and flight cards
 */
function Results() {
  const location = useLocation()
  const navigate = useNavigate()
  const locationSearchParams = useMemo(
    () => (location.state?.searchParams as SearchParams) || {},
    [location.state]
  )
  const [showFilters, setShowFilters] = useState(true)
  const [showPriceCalendar, setShowPriceCalendar] = useState(false)
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<string | undefined>(undefined)

  const {
    searchParams,
    isLoading,
    error,
    filteredFlights,
    sortOption,
    setSortOption,
    performSearch,
    setFilters,
    clearFilters,
  } = useSearch()

  // Handle calendar date selection
  const handleCalendarDateSelect = (date: string, price: number) => {
    // Update price filter to match the selected calendar price with a small range
    const minPrice = Math.max(0, Math.floor(price * 0.95)) // 5% tolerance below
    const maxPrice = Math.ceil(price * 1.05) // 5% tolerance above

    setSelectedCalendarDate(date)
    setFilters({
      priceRange: {
        min: minPrice,
        max: maxPrice,
      },
    })
  }

  // Wrap clearFilters to also clear calendar selection
  const handleClearFilters = () => {
    clearFilters()
    setSelectedCalendarDate(undefined)
  }

  // Use hook to prevent duplicate calls in StrictMode
  const { shouldExecute, markExecuted, reset } = useStrictModeDeduplication()

  // If searchParams exist from location but not in context, trigger search
  useEffect(() => {
    // Skip if already searched for these exact params or if we don't have required params
    if (
      locationSearchParams.from &&
      locationSearchParams.to &&
      locationSearchParams.departure &&
      (!searchParams || searchParams.from !== locationSearchParams.from)
    ) {
      // Create a unique key for this search to prevent duplicates
      const currentSearchKey = `${locationSearchParams.from}-${locationSearchParams.to}-${locationSearchParams.departure}`

      // Prevent duplicate searches from StrictMode double mounting
      if (!shouldExecute(currentSearchKey)) {
        // Already performed this search, skip
        return
      }

      // Only perform search if we have the required API parameters from SearchForm
      // The Results page should not be calling performSearch without proper params from SearchForm
      if (
        locationSearchParams.originSkyId &&
        locationSearchParams.destinationSkyId &&
        locationSearchParams.originEntityId &&
        locationSearchParams.destinationEntityId
      ) {
        const params = {
          from: locationSearchParams.from,
          to: locationSearchParams.to,
          departure: locationSearchParams.departure,
          return: locationSearchParams.return,
          passengers: locationSearchParams.passengers || '1',
          cabinClass: locationSearchParams.cabinClass || 'economy',
          tripType: (locationSearchParams.return ? 'round-trip' : 'one-way') as TripType,
          originSkyId: locationSearchParams.originSkyId,
          destinationSkyId: locationSearchParams.destinationSkyId,
          originEntityId: locationSearchParams.originEntityId,
          destinationEntityId: locationSearchParams.destinationEntityId,
        }
        performSearch(params)
        markExecuted(currentSearchKey)
      }
    } else {
      // Reset when params change (user navigates with new search)
      reset()
    }
  }, [locationSearchParams, searchParams, performSearch, shouldExecute, markExecuted, reset])

  const handleSelectFlight = (flight: Flight) => {
    // Navigate to flight details page with flight object and search params
    navigate(`/flight/${flight.id}`, {
      state: {
        flight,
        searchParams: currentParams,
      },
    })
  }

  // Memoize current params to avoid unnecessary recalculations
  const currentParams = useMemo(
    () =>
      searchParams || {
        from: locationSearchParams.from,
        to: locationSearchParams.to,
        departure: locationSearchParams.departure,
        return: locationSearchParams.return,
        passengers: locationSearchParams.passengers,
        cabinClass: locationSearchParams.cabinClass,
        tripType: (locationSearchParams.return ? 'round-trip' : 'one-way') as TripType,
      },
    [searchParams, locationSearchParams]
  )

  return (
    <div className="py-8 md:py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <h1 className="text-3xl md:text-4xl font-bold text-text-dark dark:text-gray-100">
              Flight Results
            </h1>
            <div className="flex items-center gap-2">
              {/* Price Calendar Toggle */}
              {searchParams?.originSkyId &&
                searchParams?.destinationSkyId &&
                searchParams?.departure && (
                  <button
                    onClick={() => setShowPriceCalendar(!showPriceCalendar)}
                    className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-text-dark dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-blue focus:ring-offset-2 dark:focus:ring-offset-gray-900 transition-colors"
                    aria-label="Toggle price calendar"
                  >
                    <CalendarIcon className="h-5 w-5" />
                    <span className="hidden sm:inline">
                      {showPriceCalendar ? 'Hide' : 'Show'} Price Calendar
                    </span>
                  </button>
                )}
              {/* Mobile Filter Toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="md:hidden flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-text-dark dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-blue focus:ring-offset-2 dark:focus:ring-offset-gray-900 transition-colors"
                aria-label="Toggle filters"
              >
                <Filter className="h-5 w-5" />
                <span>Filters</span>
              </button>
            </div>
          </div>

          <div className="text-gray-600 dark:text-gray-400">
            {isLoading ? (
              <p className="mb-1">Searching for flights...</p>
            ) : error ? (
              <div className="mb-4">
                <p className="text-red-500 dark:text-red-400 mb-2">Error: {error}</p>
              </div>
            ) : (
              <p className="mb-1">
                {filteredFlights.length} flight{filteredFlights.length !== 1 ? 's' : ''} found
                {currentParams.from && currentParams.to && (
                  <span>
                    {' '}
                    from {currentParams.from} to {currentParams.to}
                  </span>
                )}
              </p>
            )}

            {currentParams.departure && (
              <div className="text-sm text-gray-500 dark:text-gray-400">
                <p>
                  Departure: {formatDate(currentParams.departure)}
                  {currentParams.return && <> • Return: {formatDate(currentParams.return)}</>}
                  {currentParams.passengers && (
                    <span>
                      {' '}
                      • {currentParams.passengers}{' '}
                      {currentParams.passengers === '1' ? 'passenger' : 'passengers'}
                    </span>
                  )}
                  {currentParams.cabinClass && (
                    <span>
                      {' '}
                      •{' '}
                      {currentParams.cabinClass.charAt(0).toUpperCase() +
                        currentParams.cabinClass.slice(1).replace('-', ' ')}
                    </span>
                  )}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Panel - Desktop: Always visible, Mobile: Toggle */}
          <div className={`${showFilters ? 'block' : 'hidden'} lg:block lg:col-span-1`}>
            <FiltersPanel clearFiltersOverride={handleClearFilters} />
          </div>

          {/* Results Section */}
          <div className="lg:col-span-3">
            {/* Price Calendar - Toggleable */}
            {showPriceCalendar &&
              searchParams?.originSkyId &&
              searchParams?.destinationSkyId &&
              searchParams?.departure && (
                <div className="mb-6">
                  <PriceCalendar
                    originSkyId={searchParams.originSkyId}
                    destinationSkyId={searchParams.destinationSkyId}
                    fromDate={searchParams.departure}
                    currency={searchParams.currency || 'USD'}
                    onDateSelect={handleCalendarDateSelect}
                    selectedDate={selectedCalendarDate}
                  />
                </div>
              )}

            {/* Sort Bar */}
            {!isLoading && filteredFlights.length > 0 && (
              <SortBar activeSort={sortOption} onSortChange={setSortOption} />
            )}

            {/* Results List */}
            <div className="mt-4">
              <ResultsList
                flights={filteredFlights}
                isLoading={isLoading}
                error={error}
                onSelectFlight={handleSelectFlight}
                onRetry={() => {
                  if (searchParams) {
                    performSearch(searchParams)
                  }
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Results
