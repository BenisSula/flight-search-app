import { PlaneTakeoff, PlaneLanding } from 'lucide-react'
import type { TripType } from '../../types/flight'

interface TripTypeToggleProps {
  value: TripType
  onChange: (tripType: TripType) => void
  className?: string
}

/**
 * Radio group toggle for selecting round-trip or one-way flights
 * @param value - Current trip type selection
 * @param onChange - Callback when trip type changes
 * @param className - Additional CSS classes
 * @returns Trip type toggle with icons and labels
 */
function TripTypeToggle({ value, onChange, className = '' }: TripTypeToggleProps) {
  return (
    <div
      className={`flex gap-2 p-1 bg-gray-100 dark:bg-gray-700 rounded-lg ${className}`}
      role="radiogroup"
      aria-label="Trip type"
    >
      <button
        type="button"
        onClick={() => onChange('round-trip')}
        className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-md font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-blue focus:ring-offset-2 dark:focus:ring-offset-gray-800 ${
          value === 'round-trip'
            ? 'bg-primary-blue dark:bg-blue-600 text-white shadow-md'
            : 'text-gray-600 dark:text-gray-300 hover:text-text-dark dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-600'
        }`}
        aria-pressed={value === 'round-trip'}
        aria-label="Round trip"
      >
        <PlaneTakeoff className="h-4 w-4" aria-hidden="true" />
        <span>Round Trip</span>
      </button>
      <button
        type="button"
        onClick={() => onChange('one-way')}
        className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-md font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-blue focus:ring-offset-2 dark:focus:ring-offset-gray-800 ${
          value === 'one-way'
            ? 'bg-primary-blue dark:bg-blue-600 text-white shadow-md'
            : 'text-gray-600 dark:text-gray-300 hover:text-text-dark dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-600'
        }`}
        aria-pressed={value === 'one-way'}
        aria-label="One way"
      >
        <PlaneLanding className="h-4 w-4" aria-hidden="true" />
        <span>One Way</span>
      </button>
    </div>
  )
}

export default TripTypeToggle
