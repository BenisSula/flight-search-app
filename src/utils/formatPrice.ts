/**
 * Formats a price value to currency format
 * @param price - The price value to format
 * @param currency - The currency code (default: 'USD')
 * @returns Formatted price string
 */
export function formatPrice(price: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price)
}

/**
 * Formats a large price number with abbreviation (e.g., 1000 -> 1K)
 * @param price - The price value to format
 * @returns Formatted price string
 */
export function formatPriceCompact(price: number): string {
  if (price >= 1000) {
    return `$${(price / 1000).toFixed(1)}K`
  }
  return `$${price}`
}
