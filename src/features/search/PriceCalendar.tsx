import { useEffect, useState, useMemo } from 'react'
import { Calendar as CalendarIcon, TrendingDown, TrendingUp } from 'lucide-react'
import type { PriceCalendarData, PriceCalendarDay } from '../../types/flight'
import { getPriceCalendar } from '../../services/flightApi'
import { Loader } from '../../components/common'
import { formatPrice } from '../../utils/formatPrice'
import { formatDate } from '../../utils/formatDate'
import { logger } from '../../utils/logger'

interface PriceCalendarProps {
  originSkyId: string
  destinationSkyId: string
  fromDate: string
  currency?: string
  onDateSelect?: (date: string, price: number) => void
  selectedDate?: string
}

/**
 * Price calendar component displaying fare trends by date
 * Shows price variations across dates with cheapest/most expensive highlights
 * @param originSkyId - Origin airport skyId
 * @param destinationSkyId - Destination airport skyId
 * @param fromDate - Starting date for calendar display
 * @param currency - Currency code (default: 'USD')
 * @param onDateSelect - Callback when user selects a date (receives date and price)
 * @param selectedDate - Currently selected date
 * @returns Price calendar with grouped monthly view and legend
 */
function PriceCalendar({
  originSkyId,
  destinationSkyId,
  fromDate,
  currency = 'USD',
  onDateSelect,
  selectedDate,
}: PriceCalendarProps) {
  const [calendarData, setCalendarData] = useState<PriceCalendarData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCalendar = async () => {
      if (!originSkyId || !destinationSkyId || !fromDate) {
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      setError(null)

      try {
        const data = await getPriceCalendar(originSkyId, destinationSkyId, fromDate, currency)
        setCalendarData(data)
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to load price calendar. Please try again.'
        setError(errorMessage)
        logger.error('PriceCalendar', 'Error fetching price calendar', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchCalendar()
  }, [originSkyId, destinationSkyId, fromDate, currency])

  // Group calendar days by month for better display
  const groupedByMonth = useMemo(() => {
    if (!calendarData || calendarData.calendar.length === 0) return []

    const groups: { month: string; days: PriceCalendarDay[] }[] = []
    let currentMonth = ''

    calendarData.calendar.forEach(day => {
      const date = new Date(day.date)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      const monthLabel = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

      if (monthKey !== currentMonth) {
        currentMonth = monthKey
        groups.push({ month: monthLabel, days: [] })
      }

      groups[groups.length - 1].days.push(day)
    })

    return groups
  }, [calendarData])

  // Calculate savings if selected date is not cheapest
  const savings = useMemo(() => {
    if (!calendarData || !selectedDate) return 0
    const selectedDay = calendarData.calendar.find(day => day.date === selectedDate)
    if (selectedDay && calendarData.minPrice > 0) {
      return selectedDay.price - calendarData.minPrice
    }
    return 0
  }, [calendarData, selectedDate])

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="flex items-center justify-center py-12">
          <Loader message="Loading price calendar..." />
        </div>
      </div>
    )
  }

  if (error || !calendarData || calendarData.calendar.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6">
        <div className="flex items-center gap-2 mb-3 sm:mb-4">
          <CalendarIcon className="h-5 w-5 text-primary-blue" />
          <h3 className="text-base sm:text-lg font-semibold text-text-dark dark:text-gray-100">
            Price Calendar
          </h3>
        </div>
        <div className="flex items-start gap-2 text-sm sm:text-base text-gray-600 dark:text-gray-400">
          <CalendarIcon className="h-4 w-4 text-gray-400 dark:text-gray-500 mt-0.5 flex-shrink-0" />
          <p>{error || 'Price calendar data not available for this route.'}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-3">
        <div className="flex items-center gap-2">
          <CalendarIcon className="h-5 w-5 text-primary-blue" />
          <h3 className="text-lg font-semibold text-text-dark dark:text-gray-100">
            Price Calendar
          </h3>
        </div>
        {calendarData.minPrice > 0 && calendarData.maxPrice > 0 && (
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm">
            <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
              <TrendingDown className="h-4 w-4" />
              <span>
                Lowest: <span className="font-bold">{formatPrice(calendarData.minPrice)}</span>
              </span>
            </div>
            {savings > 0 && (
              <div className="flex items-center gap-1 text-orange-600 dark:text-orange-400">
                <TrendingUp className="h-4 w-4" />
                <span>
                  Save: <span className="font-bold">{formatPrice(savings)}</span>
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="space-y-6 md:space-y-8">
        {groupedByMonth.map((group, groupIndex) => (
          <div key={groupIndex}>
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 px-1">
              {group.month}
            </h4>
            <div className="grid grid-cols-7 gap-1 sm:gap-2">
              {/* Day headers */}
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                <div
                  key={day}
                  className="text-center text-xs font-semibold text-gray-500 dark:text-gray-400 py-1 px-1"
                >
                  <span className="hidden sm:inline">{day}</span>
                  <span className="sm:hidden">{day[0]}</span>
                </div>
              ))}

              {/* Calendar days */}
              {group.days.map(day => {
                const isSelected = selectedDate === day.date
                const dateObj = new Date(day.date)
                const dayNumber = dateObj.getDate()

                // Color coding based on price
                let dayClass =
                  'text-center py-1.5 sm:py-2 px-0.5 sm:px-1 rounded-md sm:rounded-lg transition-all cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 border-2 text-xs sm:text-sm '
                if (day.isUnavailable) {
                  dayClass +=
                    'bg-gray-100 dark:bg-gray-800 text-gray-400 border-gray-200 dark:border-gray-700 cursor-not-allowed'
                } else if (day.isCheapest) {
                  dayClass += isSelected
                    ? 'bg-green-600 border-green-600 text-white'
                    : 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700 text-green-700 dark:text-green-400 font-bold'
                } else if (day.isMostExpensive) {
                  dayClass += isSelected
                    ? 'bg-red-600 border-red-600 text-white'
                    : 'bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-700 text-red-700 dark:text-red-400'
                } else if (isSelected) {
                  dayClass += 'bg-primary-blue border-primary-blue text-white'
                } else {
                  dayClass +=
                    'bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300'
                }

                return (
                  <button
                    key={day.date}
                    onClick={() =>
                      !day.isUnavailable && onDateSelect && onDateSelect(day.date, day.price)
                    }
                    disabled={day.isUnavailable || !onDateSelect}
                    className={dayClass}
                    aria-label={`Select ${formatDate(day.date)} for ${formatPrice(day.price)}`}
                  >
                    <div className="text-xs sm:text-sm font-semibold mb-0.5 sm:mb-1">
                      {dayNumber}
                    </div>
                    <div className="text-[10px] sm:text-xs leading-tight">
                      {day.isUnavailable ? (
                        <span className="text-gray-400">—</span>
                      ) : (
                        <span className="font-bold">{formatPrice(day.price)}</span>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-200 dark:border-gray-700">
        <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs text-gray-600 dark:text-gray-400">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 sm:w-4 sm:h-4 bg-green-50 border-2 border-green-300 rounded"></div>
            <span>Cheapest</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 sm:w-4 sm:h-4 bg-red-50 border-2 border-red-300 rounded"></div>
            <span>Most Expensive</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 sm:w-4 sm:h-4 bg-gray-100 border-2 border-gray-200 rounded"></div>
            <span>Unavailable</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PriceCalendar
