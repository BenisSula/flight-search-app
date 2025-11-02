/**
 * Parses a duration string (e.g., "5h 30m") and converts it to minutes
 * @param duration - Duration string in format "Xh Ym" or "Xh"
 * @returns Duration in minutes, or 0 if parsing fails
 */
export function parseDuration(duration: string): number {
  const match = duration.match(/(\d+)h\s*(\d+)m?/)
  if (match) {
    return parseInt(match[1]) * 60 + parseInt(match[2] || '0')
  }
  return 0
}
