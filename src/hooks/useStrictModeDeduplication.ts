import { useRef } from 'react'

/**
 * Hook to prevent duplicate async operations in React StrictMode
 * React StrictMode intentionally double-invokes render and effects in development,
 * which can cause duplicate API calls, searches, or fetches
 *
 * This hook manages tracking state to prevent executing the same operation twice
 * when React StrictMode mounts components twice in development
 *
 * @returns Object with refs to track execution state
 *
 * @example
 * ```typescript
 * const { shouldExecute, markExecuted } = useStrictModeDeduplication()
 * const currentKey = `${from}-${to}-${date}`
 *
 * if (!shouldExecute(currentKey)) return
 * // Perform operation
 * markExecuted(currentKey)
 * ```
 */
export function useStrictModeDeduplication() {
  const hasExecutedRef = useRef(false)
  const lastKeyRef = useRef<string | null>(null)

  const shouldExecute = (key: string): boolean => {
    // Don't execute if we've already done this exact operation
    if (hasExecutedRef.current && lastKeyRef.current === key) {
      return false
    }
    return true
  }

  const markExecuted = (key: string) => {
    hasExecutedRef.current = true
    lastKeyRef.current = key
  }

  const reset = () => {
    hasExecutedRef.current = false
    lastKeyRef.current = null
  }

  return { shouldExecute, markExecuted, reset }
}
