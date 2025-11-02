import type { SortOption } from '../types/flight'

interface SortBarProps {
  activeSort: SortOption
  onSortChange: (sort: SortOption) => void
}

/**
 * Sort bar with buttons for Best, Cheapest, and Fastest options
 * @param activeSort - Currently selected sort option
 * @param onSortChange - Callback when sort option changes
 * @returns Sort bar toolbar with toggle buttons
 */
function SortBar({ activeSort, onSortChange }: SortBarProps) {
  const sortOptions: { value: SortOption; label: string }[] = [
    { value: 'best', label: 'Best' },
    { value: 'cheapest', label: 'Cheapest' },
    { value: 'fastest', label: 'Fastest' },
  ]

  return (
    <div
      className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-6"
      role="toolbar"
      aria-label="Sort flights"
    >
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-sm font-medium text-text-dark dark:text-gray-200 mr-2">Sort by:</span>
        {sortOptions.map(option => (
          <button
            key={option.value}
            onClick={() => onSortChange(option.value)}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-blue focus:ring-offset-2 dark:focus:ring-offset-gray-800 ${
              activeSort === option.value
                ? 'bg-primary-blue dark:bg-blue-600 text-white shadow-md'
                : 'bg-gray-100 dark:bg-gray-700 text-text-dark dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
            aria-label={`Sort by ${option.label}`}
            aria-pressed={activeSort === option.value}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  )
}

export default SortBar
