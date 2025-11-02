import { useMemo } from 'react'
import { X, DollarSign, Plane } from 'lucide-react'
import { useSearch } from '../../context/SearchContext'

interface FiltersPanelProps {
  isOpen?: boolean
  onClose?: () => void
  clearFiltersOverride?: () => void
}

/**
 * Filters panel component for refining flight search results
 * Includes price range, stops, and airline filters
 * @param isOpen - Panel visibility state (default: true)
 * @param onClose - Callback when panel is closed (mobile only)
 * @param clearFiltersOverride - Override function for clearing filters
 * @returns Filters panel with price, stops, and airline filters
 */
function FiltersPanel({ isOpen = true, onClose, clearFiltersOverride }: FiltersPanelProps) {
  const { flights, filters, setFilters, clearFilters } = useSearch()

  // Get unique airlines from flights
  const availableAirlines = useMemo(() => {
    const airlines = new Set<string>()
    flights.forEach(flight => airlines.add(flight.airline))
    return Array.from(airlines).sort()
  }, [flights])

  // Get unique stop counts
  const availableStops = useMemo(() => {
    const stops = new Set<number>()
    flights.forEach(flight => stops.add(flight.stops))
    return Array.from(stops).sort((a, b) => a - b)
  }, [flights])

  const handlePriceRangeChange = (type: 'min' | 'max', value: string) => {
    const numValue = parseInt(value) || 0
    setFilters({
      priceRange: {
        ...filters.priceRange,
        [type]: numValue,
      },
    })
  }

  const handleStopsToggle = (stops: number) => {
    const currentStops = filters.stops || []
    const newStops = currentStops.includes(stops)
      ? currentStops.filter(s => s !== stops)
      : [...currentStops, stops]
    setFilters({ stops: newStops })
  }

  const handleAirlineToggle = (airline: string) => {
    const currentAirlines = filters.airlines || []
    const newAirlines = currentAirlines.includes(airline)
      ? currentAirlines.filter(a => a !== airline)
      : [...currentAirlines, airline]
    setFilters({ airlines: newAirlines })
  }

  const hasActiveFilters =
    (filters.stops && filters.stops.length > 0) ||
    (filters.airlines && filters.airlines.length > 0) ||
    filters.priceRange.min > 0 ||
    filters.priceRange.max < 10000

  return (
    <div
      className={`${
        isOpen ? 'block' : 'hidden'
      } bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-text-dark dark:text-gray-200">Filters</h2>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-blue focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-colors"
            aria-label="Close filters"
          >
            <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          </button>
        )}
        {hasActiveFilters && (
          <button
            onClick={clearFiltersOverride || clearFilters}
            className="text-sm text-primary-blue hover:underline focus:outline-none focus:ring-2 focus:ring-primary-blue focus:ring-offset-2 dark:focus:ring-offset-gray-800 rounded-md px-1"
            aria-label="Clear all filters"
          >
            Clear all
          </button>
        )}
      </div>

      <div className="space-y-6">
        {/* Price Range Filter */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <DollarSign className="h-5 w-5 text-primary-blue" />
            <h3 className="font-medium text-text-dark dark:text-gray-200">Price Range</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-4">
              <label className="text-sm text-gray-600 dark:text-gray-400 min-w-[60px]">Min:</label>
              <input
                type="number"
                min="0"
                max={filters.priceRange.max}
                value={filters.priceRange.min}
                onChange={e => handlePriceRangeChange('min', e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-text-dark dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-blue"
                aria-label="Minimum price"
              />
              <span className="text-sm text-gray-500">$</span>
            </div>
            <div className="flex items-center gap-4">
              <label className="text-sm text-gray-600 dark:text-gray-400 min-w-[60px]">Max:</label>
              <input
                type="number"
                min={filters.priceRange.min}
                max="10000"
                value={filters.priceRange.max}
                onChange={e => handlePriceRangeChange('max', e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-text-dark dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-blue"
                aria-label="Maximum price"
              />
              <span className="text-sm text-gray-500">$</span>
            </div>
            {/* Range Slider */}
            <input
              type="range"
              min="0"
              max="10000"
              step="100"
              value={filters.priceRange.max}
              onChange={e => handlePriceRangeChange('max', e.target.value)}
              className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary-blue"
              aria-label="Price range slider"
            />
          </div>
        </div>

        {/* Stops Filter */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Plane className="h-5 w-5 text-primary-blue" />
            <h3 className="font-medium text-text-dark dark:text-gray-200">Stops</h3>
          </div>
          <div className="space-y-2">
            {availableStops.map(stops => {
              const stopLabel =
                stops === 0 ? 'Non-stop' : stops === 1 ? '1 stop' : `${stops}+ stops`
              const isChecked = filters.stops?.includes(stops) || false
              return (
                <label
                  key={stops}
                  className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 p-2 rounded transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => handleStopsToggle(stops)}
                    className="w-4 h-4 text-primary-blue border-gray-300 rounded focus:ring-primary-blue focus:ring-2"
                    aria-label={stopLabel}
                  />
                  <span className="text-sm text-text-dark dark:text-gray-200">{stopLabel}</span>
                  <span className="ml-auto text-xs text-gray-500 dark:text-gray-400">
                    ({flights.filter(f => f.stops === stops).length})
                  </span>
                </label>
              )
            })}
          </div>
        </div>

        {/* Airline Filter */}
        {availableAirlines.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Plane className="h-5 w-5 text-primary-blue" />
              <h3 className="font-medium text-text-dark dark:text-gray-200">Airlines</h3>
            </div>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {availableAirlines.map(airline => {
                const isChecked = filters.airlines?.includes(airline) || false
                const airlineCount = flights.filter(f => f.airline === airline).length
                return (
                  <label
                    key={airline}
                    className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 p-2 rounded transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => handleAirlineToggle(airline)}
                      className="w-4 h-4 text-primary-blue border-gray-300 rounded focus:ring-primary-blue focus:ring-2"
                      aria-label={`Filter by ${airline}`}
                    />
                    <span className="text-sm text-text-dark dark:text-gray-200 flex-1">
                      {airline}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      ({airlineCount})
                    </span>
                  </label>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default FiltersPanel
