import { logger } from './logger'

/**
 * Formats a date string to a user-friendly format
 * @param dateString - ISO date string (e.g., "2024-12-25")
 * @param format - Format style: 'short' | 'medium' | 'long' | 'full'
 * @returns Formatted date string
 */
export function formatDate(
  dateString: string,
  format: 'short' | 'medium' | 'long' | 'full' = 'medium'
): string {
  if (!dateString) return ''

  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) {
      return dateString // Return original if invalid
    }

    const formatOptionsMap: Record<string, Intl.DateTimeFormatOptions> = {
      short: { month: 'short', day: 'numeric' },
      medium: { month: 'short', day: 'numeric', year: 'numeric' },
      long: { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' },
      full: {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
      },
    }

    const formatOptions = formatOptionsMap[format] || formatOptionsMap.medium
    return date.toLocaleDateString('en-US', formatOptions)
  } catch (error) {
    logger.error('formatDate', 'Date formatting failed', error, { dateString, format })
    return dateString
  }
}

/**
 * Formats a date to a relative time string (e.g., "in 3 days", "yesterday")
 * @param dateString - ISO date string
 * @returns Relative time string
 */
export function formatDateRelative(dateString: string): string {
  if (!dateString) return ''

  try {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = date.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Tomorrow'
    if (diffDays === -1) return 'Yesterday'
    if (diffDays > 1 && diffDays <= 7) return `In ${diffDays} days`
    if (diffDays < -1 && diffDays >= -7) return `${Math.abs(diffDays)} days ago`

    return formatDate(dateString, 'medium')
  } catch {
    return dateString
  }
}

/**
 * Gets the minimum date (today) for date inputs
 * @returns ISO date string for today
 */
export function getTodayDate(): string {
  return getFutureDate(0)
}

/**
 * Validates if a return date is after departure date
 * @param departureDate - Departure date string
 * @param returnDate - Return date string
 * @returns true if return date is valid
 */
export function isValidReturnDate(departureDate: string, returnDate: string): boolean {
  if (!departureDate || !returnDate) return false

  try {
    const departure = new Date(departureDate)
    const returnDateObj = new Date(returnDate)
    return returnDateObj >= departure
  } catch {
    return false
  }
}

/**
 * Gets a future date by adding days to today
 * @param daysToAdd - Number of days to add (default: 0 for today)
 * @returns ISO date string (YYYY-MM-DD format)
 */
export function getFutureDate(daysToAdd = 0): string {
  const date = new Date()
  date.setDate(date.getDate() + daysToAdd)
  return date.toISOString().split('T')[0]
}

/**
 * Gets the current year (useful for copyright notices)
 * @returns Current year as number
 */
export function getCurrentYear(): number {
  return new Date().getFullYear()
}
