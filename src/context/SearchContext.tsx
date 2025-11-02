import { createContext, useContext, useState, useCallback } from 'react'
import type { ReactNode } from 'react'
import toast from 'react-hot-toast'
import type { FlightSearchParams, Flight, FlightFilters, SortOption } from '../types/flight'
import { searchFlights } from '../services/flightApi'
import { parseDuration } from '../utils/parseDuration'
import { calculatePriceRange } from '../utils/calculatePriceRange'
import { logger } from '../utils/logger'

interface SearchContextType {
  // Search state
  searchParams: FlightSearchParams | null
  flights: Flight[]
  isLoading: boolean
  error: string | null

  // Filters state
  filters: FlightFilters
  sortOption: SortOption

  // Actions
  setSearchParams: (params: FlightSearchParams | null) => void
  performSearch: (params: FlightSearchParams) => Promise<void>
  setFilters: (filters: Partial<FlightFilters>) => void
  setSortOption: (sort: SortOption) => void
  clearSearch: () => void
  clearFilters: () => void

  // Computed
  filteredFlights: Flight[]
}

const SearchContext = createContext<SearchContextType | undefined>(undefined)

// Default filters
const defaultFilters: FlightFilters = {
  priceRange: {
    min: 0,
    max: 10000,
  },
  stops: [],
  airlines: [],
  departureTimes: [],
  arrivalTimes: [],
  duration: 0,
}

/**
 * SearchContext provider component managing flight search state
 * Handles search execution, filtering, sorting, and results
 * @param children - Child components
 * @returns SearchContext provider with search state and actions
 */
export function SearchProvider({ children }: { children: ReactNode }) {
  const [searchParams, setSearchParams] = useState<FlightSearchParams | null>(null)
  const [flights, setFlights] = useState<Flight[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFiltersState] = useState<FlightFilters>(defaultFilters)
  const [sortOption, setSortOption] = useState<SortOption>('best')

  // Helper function to calculate price range from flights
  const calculatePriceRangeFromFlights = useCallback(() => {
    if (flights.length > 0) {
      const prices = flights.map(f => f.price)
      return calculatePriceRange(prices)
    }
    return defaultFilters.priceRange
  }, [flights])

  // Perform flight search
  const performSearch = useCallback(async (params: FlightSearchParams) => {
    setIsLoading(true)
    setError(null)
    setSearchParams(params)

    try {
      const results = await searchFlights(params)
      setFlights(results)

      // Auto-update price range filter based on results
      if (results.length > 0) {
        const prices = results.map(f => f.price)
        const priceRange = calculatePriceRange(prices)
        setFiltersState(prev => ({
          ...prev,
          priceRange,
        }))
      }
      // Only show success toast for results found, silently handle empty results in UI
      if (results.length > 0) {
        toast.success(`Found ${results.length} flight${results.length !== 1 ? 's' : ''}`)
      }
      // Removed error toast for empty results - UI will display "No flights found" message
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to search flights'
      setError(errorMessage)
      setFlights([])
      logger.error('SearchContext', 'Flight search error', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Update filters
  const setFilters = useCallback((newFilters: Partial<FlightFilters>) => {
    setFiltersState(prev => ({
      ...prev,
      ...newFilters,
    }))
  }, [])

  // Clear search
  const clearSearch = useCallback(() => {
    setSearchParams(null)
    setFlights([])
    setError(null)
    setFiltersState(defaultFilters)
    setSortOption('best')
  }, [])

  // Clear filters - resets to default or recalculated price range
  const clearFilters = useCallback(() => {
    const priceRange = calculatePriceRangeFromFlights()
    setFiltersState({
      ...defaultFilters,
      priceRange,
    })
    setSortOption('best')
  }, [calculatePriceRangeFromFlights])

  // Apply filters and sorting
  const getFilteredFlights = useCallback((): Flight[] => {
    if (flights.length === 0) return []

    let filtered = [...flights]

    // Apply price range filter
    filtered = filtered.filter(
      flight => flight.price >= filters.priceRange.min && flight.price <= filters.priceRange.max
    )

    // Apply stops filter
    if (filters.stops.length > 0) {
      filtered = filtered.filter(flight => filters.stops.includes(flight.stops))
    }

    // Apply airline filter
    if (filters.airlines.length > 0) {
      filtered = filtered.filter(flight => filters.airlines.includes(flight.airline))
    }

    // Apply departure time filter
    if (filters.departureTimes.length > 0) {
      filtered = filtered.filter(flight => {
        const hour = parseInt(flight.departureTime.split(':')[0])
        return filters.departureTimes.some(timeRange => {
          if (timeRange === 'morning') return hour >= 6 && hour < 12
          if (timeRange === 'afternoon') return hour >= 12 && hour < 18
          if (timeRange === 'evening') return hour >= 18 && hour < 24
          if (timeRange === 'night') return hour >= 0 && hour < 6
          return false
        })
      })
    }

    // Apply arrival time filter
    if (filters.arrivalTimes.length > 0) {
      filtered = filtered.filter(flight => {
        const hour = parseInt(flight.arrivalTime.split(':')[0])
        return filters.arrivalTimes.some(timeRange => {
          if (timeRange === 'morning') return hour >= 6 && hour < 12
          if (timeRange === 'afternoon') return hour >= 12 && hour < 18
          if (timeRange === 'evening') return hour >= 18 && hour < 24
          if (timeRange === 'night') return hour >= 0 && hour < 6
          return false
        })
      })
    }

    // Apply duration filter (if set)
    if (filters.duration > 0) {
      filtered = filtered.filter(flight => parseDuration(flight.duration) <= filters.duration)
    }

    // Apply sorting
    switch (sortOption) {
      case 'cheapest':
        return filtered.sort((a, b) => a.price - b.price)
      case 'fastest':
        return filtered.sort((a, b) => parseDuration(a.duration) - parseDuration(b.duration))
      case 'best':
      default:
        // Best: prioritize non-stop flights marked as best, then by price
        return filtered.sort((a, b) => {
          if (a.best && !b.best) return -1
          if (!a.best && b.best) return 1
          if (a.stops === 0 && b.stops > 0) return -1
          if (a.stops > 0 && b.stops === 0) return 1
          return a.price - b.price
        })
    }
  }, [flights, filters, sortOption])

  const filteredFlights = getFilteredFlights()

  return (
    <SearchContext.Provider
      value={{
        searchParams,
        flights,
        isLoading,
        error,
        filters,
        sortOption,
        setSearchParams,
        performSearch,
        setFilters,
        setSortOption,
        clearSearch,
        clearFilters,
        filteredFlights,
      }}
    >
      {children}
    </SearchContext.Provider>
  )
}

/**
 * Creates default context value for graceful fallback
 * Used during React Fast Refresh or when context is not available
 * Called fresh each time to avoid stale closures during Fast Refresh
 */
function getDefaultSearchContextValue(): SearchContextType {
  return {
    searchParams: null,
    flights: [],
    isLoading: false,
    error: null,
    filters: defaultFilters,
    sortOption: 'best',
    filteredFlights: [],
    setSearchParams: () => {},
    performSearch: async () => {},
    setFilters: () => {},
    setSortOption: () => {},
    clearSearch: () => {},
    clearFilters: () => {},
  }
}

/**
 * Hook to access SearchContext from components
 * Returns default values if context is not available (e.g., during React Fast Refresh)
 * @returns SearchContext with search state and actions
 */
export function useSearch() {
  const context = useContext(SearchContext)
  // Return default values instead of throwing to handle React Fast Refresh gracefully
  // This prevents errors during hot reload in development
  if (context === undefined) {
    logger.warn('useSearch', 'Called outside SearchProvider, using default values', {
      note: 'May occur during React Fast Refresh',
    })
    return getDefaultSearchContextValue()
  }
  return context
}
