import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Calendar, Users, Briefcase, Plane, ArrowLeftRight } from 'lucide-react'
import toast from 'react-hot-toast'
import type { Airport } from '../../types/airport'
import type { FlightSearchParams, TripType } from '../../types/flight'
import AutocompleteInput from './AutocompleteInput'
import TripTypeToggle from './TripTypeToggle'
import { Select } from '../../components/common'
import { Button } from '../../components/common'
import { formatAirportDisplay } from '../../utils/formatAirport'
import { getTodayDate, isValidReturnDate } from '../../utils/formatDate'
import { useSearch } from '../../context/SearchContext'
import { logger } from '../../utils/logger'

interface FormData {
  from: string
  to: string
  departure: string
  return: string
  passengers: string
  cabinClass: string
  tripType: TripType
}

interface AirportData {
  from: Airport | null
  to: Airport | null
}

/**
 * Main search form component for flight search
 * Includes airport autocomplete, date pickers, passenger/class selection, and trip type toggle
 * @returns Search form with validation and submission handling
 */
function SearchForm() {
  const navigate = useNavigate()
  const { performSearch, isLoading } = useSearch()
  const [formData, setFormData] = useState<FormData>({
    from: '',
    to: '',
    departure: '',
    return: '',
    passengers: '1',
    cabinClass: 'economy',
    tripType: 'round-trip',
  })

  const [airportData, setAirportData] = useState<AirportData>({
    from: null,
    to: null,
  })

  const [errors, setErrors] = useState<Partial<FormData>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSwapAirports = () => {
    setFormData(prev => ({
      ...prev,
      from: prev.to,
      to: prev.from,
    }))
    setAirportData(prev => ({
      from: prev.to,
      to: prev.from,
    }))
    // Clear errors when swapping
    setErrors(prev => ({
      ...prev,
      from: prev.to,
      to: prev.from,
    }))
  }

  const handleFromChange = (value: string) => {
    setFormData(prev => ({ ...prev, from: value }))
    if (errors.from) {
      setErrors(prev => ({ ...prev, from: undefined }))
    }
  }

  const handleToChange = (value: string) => {
    setFormData(prev => ({ ...prev, to: value }))
    if (errors.to) {
      setErrors(prev => ({ ...prev, to: undefined }))
    }
  }

  const handleAirportSelect = (field: 'from' | 'to') => (airport: Airport | null) => {
    setAirportData(prev => ({ ...prev, [field]: airport }))
    if (airport) {
      const displayValue = formatAirportDisplay(airport)
      setFormData(prev => ({ ...prev, [field]: displayValue }))
    } else {
      // Clear airport data when unselected
      setAirportData(prev => ({ ...prev, [field]: null }))
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => {
      const newData = { ...prev, [name]: value }

      // If departure date changes and return date is now invalid, clear return date
      if (name === 'departure' && prev.return && value) {
        if (!isValidReturnDate(value, prev.return)) {
          newData.return = ''
        }
      }

      return newData
    })

    // Clear error when user starts typing
    if (errors[name as keyof FormData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }))
    }
  }

  const handleTripTypeChange = (tripType: TripType) => {
    setFormData(prev => {
      const newData = { ...prev, tripType, return: tripType === 'one-way' ? '' : prev.return }
      return newData
    })
  }

  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {}

    if (!formData.from.trim()) {
      newErrors.from = 'Origin is required'
    }
    if (!formData.to.trim()) {
      newErrors.to = 'Destination is required'
    }
    if (formData.from.trim() === formData.to.trim()) {
      newErrors.to = 'Origin and destination must be different'
    }
    if (!formData.departure) {
      newErrors.departure = 'Departure date is required'
    }
    if (formData.tripType === 'round-trip' && !formData.return) {
      newErrors.return = 'Return date is required'
    }

    // Check if return date is before departure date
    if (formData.departure && formData.return) {
      if (!isValidReturnDate(formData.departure, formData.return)) {
        newErrors.return = 'Return date must be after departure date'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (isSubmitting || isLoading) {
      return // Prevent multiple submissions
    }

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      // Use airports that were already selected via AutocompleteInput
      // Removed duplicate searchAirport calls - AutocompleteInput handles all searching
      const fromAirport = airportData.from
      const toAirport = airportData.to

      // Validate that airports were found or selected
      if (!fromAirport || !toAirport) {
        setErrors({
          from: fromAirport ? undefined : 'Please select an airport from the suggestions',
          to: toAirport ? undefined : 'Please select an airport from the suggestions',
        })
        return
      }

      // Validate that airports have required skyId and entityId
      if (!fromAirport.skyId || !fromAirport.entityId || !toAirport.skyId || !toAirport.entityId) {
        logger.error('SearchForm', 'Selected airports missing skyId or entityId', {
          from: fromAirport,
          to: toAirport,
        })
        setErrors({
          from: 'Please select an airport from the suggestions',
          to: 'Please select an airport from the suggestions',
        })
        return
      }

      const searchParams: FlightSearchParams = {
        // Legacy fields for fallback
        from: fromAirport.iata || fromAirport.skyId || formData.from,
        to: toAirport.iata || toAirport.skyId || formData.to,
        departure: formData.departure,
        return: formData.tripType === 'round-trip' ? formData.return : undefined,
        passengers: formData.passengers,
        cabinClass: formData.cabinClass,
        tripType: formData.tripType,
        // Sky Scrapper API required fields
        originSkyId: fromAirport.skyId,
        destinationSkyId: toAirport.skyId,
        originEntityId: fromAirport.entityId,
        destinationEntityId: toAirport.entityId,
        adults: parseInt(formData.passengers, 10) || 1,
        currency: 'USD',
        market: 'en-US',
        countryCode: 'US',
        locale: 'en-US',
      }

      // Perform search and navigate to results page
      navigate('/flights')
      if (performSearch) {
        await performSearch(searchParams)
        // Removed success toast - context will handle result notifications
      } else {
        toast.error('Search service not available. Please try again.')
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to search flights. Please try again.'
      toast.error(errorMessage)
      logger.error('SearchForm', 'Search error', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Get minimum date (today) for date inputs - memoized
  const today = useMemo(() => getTodayDate(), [])

  // Memoize passenger options
  const passengerOptions = useMemo(
    () =>
      [1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => ({
        value: num.toString(),
        label: `${num} ${num === 1 ? 'Passenger' : 'Passengers'}`,
      })),
    []
  )

  // Memoize cabin class options
  const cabinClassOptions = useMemo(
    () => [
      { value: 'economy', label: 'Economy' },
      { value: 'premium-economy', label: 'Premium Economy' },
      { value: 'business', label: 'Business' },
      { value: 'first', label: 'First Class' },
    ],
    []
  )

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 md:p-8 w-full max-w-5xl"
      aria-label="Flight search form"
      noValidate
    >
      {/* Trip Type Toggle */}
      <div className="mb-6">
        <TripTypeToggle value={formData.tripType} onChange={handleTripTypeChange} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        {/* From Input with Autocomplete */}
        <div className="md:col-span-1">
          <AutocompleteInput
            label="From"
            value={formData.from}
            onChange={handleFromChange}
            onSelect={handleAirportSelect('from')}
            placeholder="City or airport"
            error={errors.from}
            icon={<Plane className="inline h-4 w-4 mr-1 text-primary-blue" />}
            id="from"
            required
          />
        </div>

        {/* To Input with Autocomplete */}
        <div className="md:col-span-1 relative">
          <AutocompleteInput
            label="To"
            value={formData.to}
            onChange={handleToChange}
            onSelect={handleAirportSelect('to')}
            placeholder="City or airport"
            error={errors.to}
            icon={<Plane className="inline h-4 w-4 mr-1 text-primary-blue" />}
            id="to"
            required
          />
          {/* Swap Button */}
          <button
            type="button"
            onClick={handleSwapAirports}
            className="absolute top-8 right-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-blue transition-colors"
            aria-label="Swap origin and destination"
            title="Swap origin and destination"
          >
            <ArrowLeftRight className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        {/* Departure Date */}
        <div className="md:col-span-1">
          <label
            htmlFor="departure"
            className="block text-sm font-medium text-text-dark dark:text-gray-200 mb-2"
          >
            <Calendar className="inline h-4 w-4 mr-1 text-primary-blue" />
            Departure
            <span className="text-red-500 ml-1">*</span>
          </label>
          <input
            type="date"
            id="departure"
            name="departure"
            value={formData.departure}
            onChange={handleChange}
            min={today}
            className={`w-full px-4 py-3 border rounded-lg bg-white dark:bg-gray-700 text-text-dark dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent transition-all ${
              errors.departure
                ? 'border-red-500 dark:border-red-400'
                : 'border-gray-300 dark:border-gray-600'
            }`}
            aria-label="Departure date"
            {...(errors.departure && { 'aria-invalid': true })}
            aria-describedby={errors.departure ? 'departure-error' : undefined}
            required
          />
          {errors.departure && (
            <p id="departure-error" className="mt-1 text-sm text-red-500" role="alert">
              {errors.departure}
            </p>
          )}
        </div>

        {/* Return Date (only show for round-trip) */}
        {formData.tripType === 'round-trip' && (
          <div className="md:col-span-1">
            <label
              htmlFor="return"
              className="block text-sm font-medium text-text-dark dark:text-gray-200 mb-2"
            >
              <Calendar className="inline h-4 w-4 mr-1 text-primary-blue" />
              Return
              <span className="text-red-500 ml-1">*</span>
            </label>
            <input
              type="date"
              id="return"
              name="return"
              value={formData.return}
              onChange={handleChange}
              min={formData.departure || today}
              className={`w-full px-4 py-3 border rounded-lg bg-white dark:bg-gray-700 text-text-dark dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent transition-all ${
                errors.return
                  ? 'border-red-500 dark:border-red-400'
                  : 'border-gray-300 dark:border-gray-600'
              }`}
              aria-label="Return date"
              {...(errors.return && { 'aria-invalid': true })}
              aria-describedby={errors.return ? 'return-error' : undefined}
              required
            />
            {errors.return && (
              <p id="return-error" className="mt-1 text-sm text-red-500" role="alert">
                {errors.return}
              </p>
            )}
          </div>
        )}

        {/* Passengers Dropdown */}
        <div className="md:col-span-1">
          <label
            htmlFor="passengers"
            className="block text-sm font-medium text-text-dark dark:text-gray-200 mb-2"
          >
            <Users className="inline h-4 w-4 mr-1 text-primary-blue" />
            Passengers
          </label>
          <Select
            name="passengers"
            value={formData.passengers}
            onChange={handleChange}
            options={passengerOptions}
            fullWidth
            id="passengers"
          />
        </div>

        {/* Cabin Class Dropdown */}
        <div className="md:col-span-1">
          <label
            htmlFor="cabinClass"
            className="block text-sm font-medium text-text-dark dark:text-gray-200 mb-2"
          >
            <Briefcase className="inline h-4 w-4 mr-1 text-primary-blue" />
            Cabin Class
          </label>
          <Select
            name="cabinClass"
            value={formData.cabinClass}
            onChange={handleChange}
            options={cabinClassOptions}
            fullWidth
            id="cabinClass"
          />
        </div>
      </div>

      {/* Submit Button */}
      <div className="mt-6 md:mt-8">
        <Button
          type="submit"
          fullWidth
          variant="primary"
          size="lg"
          isLoading={isSubmitting || isLoading}
          disabled={isSubmitting || isLoading}
          aria-label="Search for flights"
        >
          {isSubmitting || isLoading ? 'Searching...' : 'Search Flights'}
        </Button>
      </div>
    </form>
  )
}

export default SearchForm
