/**
 * Calculates price range from an array of flights
 * @param flightPrices - Array of flight prices
 * @returns Object with min and max prices rounded to nearest 100
 */
export function calculatePriceRange(flightPrices: number[]): { min: number; max: number } {
  const validPrices = flightPrices.filter(p => p > 0)
  if (validPrices.length === 0) {
    return { min: 0, max: 10000 }
  }

  const minPrice = Math.min(...validPrices)
  const maxPrice = Math.max(...validPrices)

  return {
    min: Math.max(0, Math.floor(minPrice / 100) * 100), // Round down to nearest 100
    max: Math.ceil(maxPrice / 100) * 100, // Round up to nearest 100
  }
}
