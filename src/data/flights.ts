import type { Flight } from '../types/flight'

/**
 * Generates mock flight data for a given route
 * Creates multiple flight options with varying times, prices, and stops
 */
function generateMockFlightsForRoute(
  origin: string,
  destination: string,
  basePrice: number,
  baseDuration: string
): Flight[] {
  const airlines = [
    'American Airlines',
    'Delta Airlines',
    'United Airlines',
    'JetBlue',
    'Southwest',
    'Alaska Airlines',
    'Spirit Airlines',
    'Frontier Airlines',
    'British Airways',
    'Lufthansa',
    'Air France',
    'Japan Airlines',
    'Emirates',
    'Singapore Airlines',
  ]
  const stopsOptions = [0, 1]
  const departures = ['06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00']

  return Array.from({ length: 8 }, (_, i) => {
    const stops = stopsOptions[Math.floor(i / 4) % stopsOptions.length]
    const airline = airlines[i % airlines.length]
    const departure = departures[i % departures.length]
    // Parse duration string like "5h 30m" or "7h 15m"
    const durationMatch = baseDuration.match(/(\d+)h\s*(\d*)m?/)
    const durationHours = durationMatch ? parseInt(durationMatch[1]) : parseInt(baseDuration)
    const durationMins = durationMatch && durationMatch[2] ? parseInt(durationMatch[2]) : 0

    const [hours, mins] = departure.split(':').map(Number)
    const totalMinutes = hours * 60 + mins + durationHours * 60 + durationMins
    const arrivalHours = Math.floor(totalMinutes / 60) % 24
    const arrivalMinutes = totalMinutes % 60
    const arrival = `${arrivalHours.toString().padStart(2, '0')}:${arrivalMinutes.toString().padStart(2, '0')}`

    // Price variation based on stops and time
    const priceMultiplier = stops === 0 ? 1 : 0.85
    const timeMultiplier = i < 4 ? 1.15 : i < 6 ? 1.0 : 0.9
    const price = Math.round(basePrice * priceMultiplier * timeMultiplier)

    return {
      id: `${origin}-${destination}-${i + 1}`,
      airline,
      departureTime: departure,
      arrivalTime: arrival,
      departureAirport: origin,
      arrivalAirport: destination,
      duration: baseDuration,
      stops,
      price,
      best: i === 0 && stops === 0,
    }
  })
}

export const mockFlights: Flight[] = [
  // JFK to LAX routes
  ...generateMockFlightsForRoute('JFK', 'LAX', 385, '5h 30m'),
  // JFK to LHR routes
  ...generateMockFlightsForRoute('JFK', 'LHR', 420, '7h 15m'),
  // JFK to CDG routes
  ...generateMockFlightsForRoute('JFK', 'CDG', 450, '7h 30m'),
  // LAX to NRT routes
  ...generateMockFlightsForRoute('LAX', 'NRT', 650, '10h 45m'),
  // LAX to DXB routes
  ...generateMockFlightsForRoute('LAX', 'DXB', 799, '15h 30m'),
  // LAX to SIN routes
  ...generateMockFlightsForRoute('LAX', 'SIN', 750, '17h 00m'),
  // ORD (Chicago) routes for deals
  ...generateMockFlightsForRoute('ORD', 'LHR', 420, '7h 45m'),
  // MIA (Miami) routes for deals
  ...generateMockFlightsForRoute('MIA', 'BCN', 480, '8h 30m'),
  // SFO (San Francisco) routes for deals
  ...generateMockFlightsForRoute('SFO', 'DXB', 799, '16h 00m'),
  // BOS (Boston) routes for deals
  ...generateMockFlightsForRoute('BOS', 'FCO', 590, '8h 00m'),
  // LHR to FRA routes
  ...generateMockFlightsForRoute('LHR', 'FRA', 280, '1h 30m'),
  // CDG to FRA routes
  ...generateMockFlightsForRoute('CDG', 'FRA', 250, '1h 20m'),
  // FRA to DXB routes
  ...generateMockFlightsForRoute('FRA', 'DXB', 580, '6h 30m'),
  // DXB to SIN routes
  ...generateMockFlightsForRoute('DXB', 'SIN', 420, '7h 15m'),
  // Return routes
  ...generateMockFlightsForRoute('LAX', 'JFK', 385, '5h 30m'),
  ...generateMockFlightsForRoute('LHR', 'JFK', 420, '7h 15m'),
  ...generateMockFlightsForRoute('CDG', 'JFK', 450, '7h 30m'),
  ...generateMockFlightsForRoute('NRT', 'LAX', 650, '10h 45m'),
  ...generateMockFlightsForRoute('DXB', 'LAX', 799, '15h 30m'),
  ...generateMockFlightsForRoute('SIN', 'LAX', 750, '17h 00m'),
  ...generateMockFlightsForRoute('LHR', 'ORD', 420, '7h 45m'),
  ...generateMockFlightsForRoute('BCN', 'MIA', 480, '8h 30m'),
  ...generateMockFlightsForRoute('DXB', 'SFO', 799, '16h 00m'),
  ...generateMockFlightsForRoute('FCO', 'BOS', 590, '8h 00m'),
  ...generateMockFlightsForRoute('FRA', 'LHR', 280, '1h 30m'),
  ...generateMockFlightsForRoute('FRA', 'CDG', 250, '1h 20m'),
  ...generateMockFlightsForRoute('DXB', 'FRA', 580, '6h 30m'),
  ...generateMockFlightsForRoute('SIN', 'DXB', 420, '7h 15m'),
]
