import { z } from 'zod'

/**
 * Validation schema for flight search parameters
 * Uses Zod for runtime type checking and validation
 */
export const searchValidationSchema = z.object({
  from: z.string().min(1, 'Origin airport is required'),
  to: z.string().min(1, 'Destination airport is required'),
  departure: z.string().min(1, 'Departure date is required'),
  return: z.string().optional(),
  passengers: z.string().refine(
    val => {
      const num = parseInt(val, 10)
      return !Number.isNaN(num) && num >= 1 && num <= 9
    },
    {
      message: 'Number of passengers must be between 1 and 9',
    }
  ),
  cabinClass: z.enum(['economy', 'premium-economy', 'business', 'first'], {
    message: 'Invalid cabin class selected',
  }),
  tripType: z.enum(['one-way', 'round-trip'], {
    message: 'Invalid trip type selected',
  }),
})

/**
 * Validates flight search parameters
 * @param data - Search form data to validate
 * @returns Validation result with success flag and errors
 */
export function validateSearchParams(data: unknown) {
  try {
    searchValidationSchema.parse(data)
    return {
      success: true,
      errors: {},
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      // Convert Zod errors to a simple object format
      const errors: Record<string, string> = {}
      error.issues.forEach((issue: z.ZodIssue) => {
        if (issue.path.length > 0) {
          errors[issue.path[0] as string] = issue.message
        }
      })
      return {
        success: false,
        errors,
      }
    }
    return {
      success: false,
      errors: { general: 'Validation failed' },
    }
  }
}

/**
 * Type for validated search parameters
 */
export type ValidatedSearchParams = z.infer<typeof searchValidationSchema>

/**
 * Additional validation for date logic
 * @param departure - Departure date string
 * @param returnDate - Return date string (optional)
 * @returns True if dates are valid, false otherwise
 */
export function validateDates(departure: string, returnDate?: string): boolean {
  try {
    const depDate = new Date(departure)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Departure date must be today or in the future
    if (depDate < today) {
      return false
    }

    // If return date is provided, it must be after departure
    if (returnDate && returnDate !== '') {
      const retDate = new Date(returnDate)
      if (retDate <= depDate) {
        return false
      }
    }

    return true
  } catch {
    return false
  }
}

/**
 * Additional validation for airport selection
 * Ensures origin and destination are different
 * @param from - Origin airport display string
 * @param to - Destination airport display string
 * @returns Error message if invalid, undefined if valid
 */
export function validateAirports(from: string, to: string): string | undefined {
  // Extract IATA codes if present (e.g., "Los Angeles (LAX)")
  const extractIATA = (str: string) => {
    const match = str.match(/\(([A-Z]{3})\)/)
    return match ? match[1] : str.trim().toUpperCase()
  }

  const fromCode = extractIATA(from)
  const toCode = extractIATA(to)

  if (fromCode === toCode) {
    return 'Origin and destination must be different'
  }

  return undefined
}

/**
 * Comprehensive validation function combining all checks
 * @param data - Search form data to validate
 * @returns Validation result with success flag and all errors
 */
export function validateFlightSearch(data: unknown) {
  // First, validate basic schema
  const schemaResult = validateSearchParams(data)
  if (!schemaResult.success) {
    return schemaResult
  }

  // Cast to validated type for additional checks
  const validated = data as ValidatedSearchParams

  // Check dates
  if (!validateDates(validated.departure, validated.return)) {
    return {
      success: false,
      errors: {
        ...schemaResult.errors,
        departure:
          validated.departure && new Date(validated.departure) < new Date()
            ? 'Departure date must be today or in the future'
            : validated.return && validated.return !== ''
              ? 'Return date must be after departure date'
              : 'Invalid date selection',
      },
    }
  }

  // Check airports
  const airportError = validateAirports(validated.from, validated.to)
  if (airportError) {
    return {
      success: false,
      errors: {
        ...schemaResult.errors,
        to: airportError,
      },
    }
  }

  return schemaResult
}
