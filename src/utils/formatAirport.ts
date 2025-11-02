import type { Airport } from '../types/airport'

/**
 * Formats an airport for display in autocomplete and forms
 * @param airport - Airport object to format
 * @returns Formatted string (e.g., "New York (JFK)" or "Los Angeles (LAX)")
 */
export function formatAirportDisplay(airport: Airport): string {
  // Use IATA code if available
  if (airport.iata && airport.city) {
    return `${airport.city} (${airport.iata})`
  }
  // Fallback to skyId if it looks like an airport code
  if (airport.skyId && airport.skyId.match(/^[A-Z]{3}$/) && airport.city) {
    return `${airport.city} (${airport.skyId})`
  }
  // Use name with city
  if (airport.iata) {
    return `${airport.name} (${airport.iata})`
  }
  // Default to city and country
  return `${airport.city}, ${airport.country}`
}

/**
 * Formats an airport with detailed information
 * @param airport - Airport object to format
 * @returns Formatted string with full details (e.g., "John F. Kennedy International, New York, United States")
 */
export function formatAirportDetail(airport: Airport): string {
  return `${airport.name}, ${airport.city}, ${airport.country}`
}

/**
 * Formats an airport with just city and country
 * @param airport - Airport object to format
 * @returns Formatted string (e.g., "New York, United States")
 */
export function formatAirportLocation(airport: Airport): string {
  return `${airport.city}, ${airport.country}`
}

/**
 * Extracts IATA code from formatted airport display string
 * @param displayString - Formatted airport string (e.g., "Los Angeles (LAX)" or "LAX")
 * @returns IATA code or original string if no match
 */
export function extractIATACode(displayString: string): string {
  if (!displayString) {
    return ''
  }
  // Try to extract IATA from parentheses format: "Los Angeles (LAX)" (case-insensitive)
  const parenMatch = displayString.match(/\(([A-Z]{3})\)/i)
  if (parenMatch) {
    return parenMatch[1].toUpperCase()
  }
  // If string is just 3 letters (case-insensitive), return uppercase version
  if (displayString.match(/^[A-Z]{3}$/i)) {
    return displayString.toUpperCase()
  }
  // Return original if no pattern matches
  return displayString
}
