import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import type { ReactNode } from 'react'
import { checkServer } from '../services/flightApi'
import type { HealthStatus, ServerConfig } from '../types/flight'
import { logger } from '../utils/logger'

interface AppStatusContextType {
  // Health status
  health: HealthStatus
  isHealthy: boolean

  // Server config
  config: ServerConfig | null

  // Actions
  refreshHealth: () => Promise<void>
  refreshConfig: () => Promise<void>
}

const AppStatusContext = createContext<AppStatusContextType | undefined>(undefined)

/**
 * AppStatusContext provider component managing API health and configuration
 * Performs periodic health checks and monitors server status
 * @param children - Child components
 * @returns AppStatusContext provider with health status and config
 */
export function AppStatusProvider({ children }: { children: ReactNode }) {
  const [health, setHealth] = useState<HealthStatus>({
    isOnline: false,
    timestamp: Date.now(),
    message: 'Checking server status...',
  })
  const [config, setConfig] = useState<ServerConfig | null>(null)

  // Refresh health status
  const refreshHealth = useCallback(async () => {
    const status = await checkServer()
    setHealth(status)
  }, [])

  // Refresh server configuration
  // Disabled: /v1/config endpoint doesn't exist in the API
  const refreshConfig = useCallback(async () => {
    // Endpoint /v1/config doesn't exist - skip config fetch
    // Uncomment if endpoint becomes available in the future
    // const serverConfig = await getConfig()
    // setConfig(serverConfig)
    setConfig(null)
  }, [])

  // Initial health check on mount
  useEffect(() => {
    // In development, skip health checks and assume online
    // This prevents hitting rate limits during development
    // In production, perform health checks to monitor API connectivity
    if (!import.meta.env.PROD) {
      // Development mode: assume online
      setHealth({
        isOnline: true,
        timestamp: Date.now(),
        message: 'Development mode - health checks disabled',
      })
      return
    }

    // Production mode: run health checks
    // Run regular health check (will handle rate limits gracefully)
    refreshHealth()

    // Set up periodic health checks every 30 minutes (increased to avoid rate limits)
    // Skip if already offline due to rate limit
    const interval = setInterval(
      () => {
        // Only check if not offline due to rate limit
        setHealth(currentHealth => {
          if (
            currentHealth.isOnline === false &&
            currentHealth.message &&
            (currentHealth.message.includes('Rate limit exceeded') ||
              currentHealth.message.includes('429'))
          ) {
            // Don't check again if rate limited - wait until next hour/reset
            // Skip this check completely to avoid hitting rate limits again
            return currentHealth
          }
          refreshHealth()
          return currentHealth
        })
      },
      30 * 60 * 1000
    ) // 30 minutes (increased from 10 to significantly reduce API calls)

    return () => clearInterval(interval)
  }, [refreshHealth])

  // Initial config fetch
  useEffect(() => {
    refreshConfig()
  }, [refreshConfig])

  const value: AppStatusContextType = {
    health,
    isHealthy: health.isOnline,
    config,
    refreshHealth,
    refreshConfig,
  }

  return <AppStatusContext.Provider value={value}>{children}</AppStatusContext.Provider>
}

/**
 * Creates default context value for graceful fallback
 * Called fresh each time to avoid stale closures during Fast Refresh
 */
function getDefaultContextValue(): AppStatusContextType {
  return {
    health: {
      isOnline: true,
      timestamp: Date.now(),
      message: 'Initializing...',
    },
    isHealthy: true,
    config: null,
    refreshHealth: async () => {},
    refreshConfig: async () => {},
  }
}

/**
 * Hook to access AppStatusContext from components
 * Returns default values if context is not available (e.g., during React Fast Refresh)
 * @returns AppStatusContext with health status, config, and refresh actions
 */
export function useAppStatus() {
  const context = useContext(AppStatusContext)
  // Return default values instead of throwing to handle React Fast Refresh gracefully
  // This prevents errors during hot reload in development
  if (context === undefined) {
    logger.warn('useAppStatus', 'AppStatusProvider not available, using default values', {
      note: 'Likely React Fast Refresh',
    })
    return getDefaultContextValue()
  }
  return context
}
