import { useState, useEffect, useRef, type KeyboardEvent } from 'react'
import { MapPin, X } from 'lucide-react'
import type { Airport } from '../../types/airport'
import { searchAirport } from '../../services/flightApi'
import useDebounce from '../../hooks/useDebounce'
import { Loader } from '../../components/common'
import { formatAirportDisplay, formatAirportDetail } from '../../utils/formatAirport'
import { logger } from '../../utils/logger'
import { useStrictModeDeduplication } from '../../hooks/useStrictModeDeduplication'

interface AutocompleteInputProps {
  label: string
  value: string
  onChange: (value: string) => void
  onSelect?: (airport: Airport | null) => void
  placeholder?: string
  error?: string
  icon?: React.ReactNode
  fullWidth?: boolean
  id?: string
  required?: boolean
}

/**
 * Airport autocomplete input with debounced API search
 * Features keyboard navigation, dropdown suggestions, and selection
 * @param label - Input label text
 * @param value - Current input value
 * @param onChange - Callback when input value changes
 * @param onSelect - Callback when airport is selected from dropdown
 * @param placeholder - Input placeholder text (default: 'City or airport')
 * @param error - Error message to display
 * @param icon - Optional icon on the left side
 * @param fullWidth - Makes input full width (default: true)
 * @param id - Input id attribute
 * @param required - Marks input as required
 * @returns Autocomplete input with airport suggestions dropdown
 */
function AutocompleteInput({
  label,
  value,
  onChange,
  onSelect,
  placeholder = 'City or airport',
  error,
  icon,
  fullWidth = true,
  id,
  required = false,
}: AutocompleteInputProps) {
  const [suggestions, setSuggestions] = useState<Airport[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedAirport, setSelectedAirport] = useState<Airport | null>(null)
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const debouncedValue = useDebounce(value, 500)

  // Use hook to prevent duplicate searches in StrictMode
  const { shouldExecute, markExecuted } = useStrictModeDeduplication()
  const searchAbortRef = useRef<(() => void) | null>(null)

  // Search airports when debounced value changes
  useEffect(() => {
    let cancelled = false

    const fetchAirports = async () => {
      // Cancel any previous search
      if (searchAbortRef.current) {
        searchAbortRef.current()
      }

      // Reset state if input is too short
      if (!debouncedValue || debouncedValue.trim().length < 2) {
        setSuggestions([])
        setIsOpen(false)
        setHighlightedIndex(-1)
        searchAbortRef.current = null
        return
      }

      // Only skip search if the value exactly matches the selected airport display format
      // This allows re-searching if user edits the value
      const selectedDisplay = selectedAirport ? formatAirportDisplay(selectedAirport) : ''
      if (selectedAirport && debouncedValue.trim() === selectedDisplay) {
        // If value matches selected, keep suggestions but don't re-search
        return
      }

      // Prevent duplicate searches from StrictMode double mounting
      const currentSearchValue = debouncedValue.trim()
      if (!shouldExecute(currentSearchValue)) {
        // Already performing this search, skip
        return
      }

      // Mark as searching
      markExecuted(currentSearchValue)
      searchAbortRef.current = () => {
        cancelled = true
      }

      setIsLoading(true)
      try {
        const results = await searchAirport(debouncedValue.trim())
        // Check if search was cancelled before updating state
        if (cancelled) {
          return
        }
        setSuggestions(results)

        // Auto-select if there's exactly one match and it matches the input format
        if (results.length === 1) {
          const matchedAirport = results[0]
          const matchedDisplay = formatAirportDisplay(matchedAirport)
          const inputLower = debouncedValue.trim().toLowerCase()
          const displayLower = matchedDisplay.toLowerCase()

          // Check for exact match (case-insensitive) or if input contains IATA code from matched airport
          if (
            inputLower === displayLower ||
            (matchedAirport.iata && inputLower.includes(matchedAirport.iata.toLowerCase()))
          ) {
            setSelectedAirport(matchedAirport)
            if (onSelect) {
              onSelect(matchedAirport)
            }
            setIsOpen(false)
          } else {
            // Show dropdown with single result
            setIsOpen(true)
          }
        } else if (results.length > 1) {
          // Check if any result exactly matches the input (case-insensitive)
          const inputLower = debouncedValue.trim().toLowerCase()
          const exactMatch = results.find(apt => {
            const display = formatAirportDisplay(apt).toLowerCase()
            return (
              display === inputLower ||
              (apt.iata &&
                inputLower.includes(apt.iata.toLowerCase()) &&
                (inputLower.includes(apt.city.toLowerCase()) ||
                  inputLower.includes(apt.name.toLowerCase())))
            )
          })

          if (exactMatch) {
            logger.debug(
              'AutocompleteInput',
              'Auto-selecting exact match from multiple results',
              exactMatch
            )
            setSelectedAirport(exactMatch)
            if (onSelect) {
              onSelect(exactMatch)
            }
            setIsOpen(false)
          } else {
            // Show dropdown with multiple results
            logger.debug('AutocompleteInput', 'Opening dropdown', { resultsCount: results.length })
            setIsOpen(true)
          }
        } else if (debouncedValue.trim().length >= 2) {
          // Show "no results" message
          logger.debug('AutocompleteInput', 'Opening dropdown with "no results" message')
          setIsOpen(true)
        } else {
          setIsOpen(false)
        }
        setHighlightedIndex(-1)
      } catch (err) {
        logger.error('AutocompleteInput', 'Error fetching airports', err)
        setSuggestions([])
        // Show "no results" or close based on input length
        if (debouncedValue.trim().length >= 2) {
          setIsOpen(true)
        } else {
          setIsOpen(false)
        }
      } finally {
        setIsLoading(false)
      }
    }

    fetchAirports()

    // Cleanup: abort any pending search on unmount or new search
    return () => {
      if (searchAbortRef.current) {
        searchAbortRef.current()
      }
    }
  }, [debouncedValue, selectedAirport, onSelect, shouldExecute, markExecuted])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    onChange(newValue)

    // Clear selection if user starts typing and value doesn't match selected airport
    const selectedDisplay = selectedAirport ? formatAirportDisplay(selectedAirport) : ''
    if (selectedAirport && newValue !== selectedDisplay) {
      setSelectedAirport(null)
      if (onSelect) {
        onSelect(null)
      }
    }

    // If user is typing (value length >= 2), ensure dropdown can open
    // The useEffect will handle opening it when results arrive
    if (newValue.trim().length >= 2) {
      // Dropdown will open when suggestions are fetched
      // Don't close it here - let the useEffect handle it
    } else {
      // Close dropdown if input is too short
      setIsOpen(false)
      setSuggestions([])
      setSelectedAirport(null)
      if (onSelect) {
        onSelect(null)
      }
    }
  }

  const handleSelectAirport = (airport: Airport) => {
    const displayValue = formatAirportDisplay(airport)
    onChange(displayValue)
    setSelectedAirport(airport)
    setIsOpen(false)
    setSuggestions([])
    setHighlightedIndex(-1)

    if (onSelect) {
      onSelect(airport)
    }
  }

  const handleClear = () => {
    onChange('')
    setSelectedAirport(null)
    setIsOpen(false)
    setSuggestions([])
    if (onSelect) {
      onSelect(null)
    }
    inputRef.current?.focus()
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || suggestions.length === 0) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setHighlightedIndex(prev => (prev < suggestions.length - 1 ? prev + 1 : prev))
        break
      case 'ArrowUp':
        e.preventDefault()
        setHighlightedIndex(prev => (prev > 0 ? prev - 1 : -1))
        break
      case 'Enter':
        e.preventDefault()
        if (highlightedIndex >= 0 && highlightedIndex < suggestions.length) {
          handleSelectAirport(suggestions[highlightedIndex])
        }
        break
      case 'Escape':
        setIsOpen(false)
        setHighlightedIndex(-1)
        break
    }
  }

  const inputId = id || `autocomplete-${label.toLowerCase().replace(/\s+/g, '-')}`

  return (
    <div ref={containerRef} className={fullWidth ? 'w-full' : ''}>
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-text-dark dark:text-gray-200 mb-2"
        >
          {icon}
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        {/* Input Field */}
        <div className="relative">
          {!icon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500">
              <MapPin className="h-5 w-5" />
            </div>
          )}
          <input
            ref={inputRef}
            type="text"
            id={inputId}
            value={value}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              // If there are suggestions, show dropdown
              if (suggestions.length > 0) {
                setIsOpen(true)
              }
              // If value is long enough, trigger search to show dropdown
              else if (value.trim().length >= 2) {
                // The useEffect will handle fetching and opening
              }
            }}
            placeholder={placeholder}
            className={`w-full px-4 ${icon ? 'pl-4' : 'pl-10'} ${
              value ? 'pr-10' : 'pr-4'
            } py-3 border rounded-lg bg-white dark:bg-gray-700 text-text-dark dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent transition-all ${
              error ? 'border-red-500 dark:border-red-400' : 'border-gray-300 dark:border-gray-600'
            }`}
            aria-label={`${label} airport or city`}
            {...(error && { 'aria-invalid': true })}
            {...(error && { 'aria-describedby': `${inputId}-error` })}
            aria-autocomplete="list"
            {...(isOpen && { 'aria-expanded': true, 'aria-controls': `${inputId}-suggestions` })}
          />

          {/* Loading Indicator */}
          {isLoading && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <Loader size="sm" />
            </div>
          )}

          {/* Clear Button */}
          {value && !isLoading && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-blue rounded"
              aria-label={`Clear ${label}`}
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Dropdown Suggestions */}
        {isOpen && suggestions.length > 0 && (
          <div
            ref={dropdownRef}
            id={`${inputId}-suggestions`}
            className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto"
            role="listbox"
            aria-label={`${label} suggestions`}
          >
            {suggestions.map((airport, index) => (
              <button
                key={`${airport.iata}-${airport.city}-${index}`}
                type="button"
                onClick={() => handleSelectAirport(airport)}
                onMouseEnter={() => setHighlightedIndex(index)}
                className={`w-full px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:bg-gray-100 dark:focus:bg-gray-700 transition-colors ${
                  highlightedIndex === index ? 'bg-gray-100 dark:bg-gray-700' : ''
                }`}
                role="option"
                {...(highlightedIndex === index && { 'aria-selected': true })}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="font-semibold text-text-dark dark:text-gray-200">
                      {formatAirportDisplay(airport)}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {formatAirportDetail(airport)}
                    </div>
                  </div>
                  {airport.iata && (
                    <div className="ml-2 px-2 py-1 bg-primary-blue/10 dark:bg-blue-600/20 rounded text-xs font-semibold text-primary-blue dark:text-blue-400">
                      {airport.iata}
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}

        {/* No Results Message */}
        {isOpen && !isLoading && suggestions.length === 0 && debouncedValue.trim().length >= 2 && (
          <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
              No airports found for "{debouncedValue}"
            </p>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <p id={`${inputId}-error`} className="mt-1 text-sm text-red-500" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}

export default AutocompleteInput
