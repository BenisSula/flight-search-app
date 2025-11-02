import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import type { ReactNode } from 'react'
import { checkApiHealth, type ApiConnectionStatus } from '../utils/apiStatus'
import type { HealthStatus, ServerConfig } from '../types/flight'
import { logger } from '../utils/logger'

interface AppStatusContextType {
  // Health status
  health: HealthStatus
  isHealthy: boolean
  connectionStatus: ApiConnectionStatus

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
  const [connectionStatus, setConnectionStatus] = useState<ApiConnectionStatus>('offline')
  const [config, setConfig] = useState<ServerConfig | null>(null)

  // Refresh health status using new centralized health check
  const refreshHealth = useCallback(async () => {
    const result = await checkApiHealth()
    
    // Map ApiConnectionStatus to HealthStatus
    const healthStatus: HealthStatus = {
      isOnline: result.status === 'online' || result.status === 'mock',
      timestamp: result.timestamp,
      message: result.message,
    }
    
    setHealth(healthStatus)
    setConnectionStatus(result.status)
    
    logger.debug('AppStatusProvider', 'Health check completed', {
      status: result.status,
      message: result.message,
    })
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
    // In development, skip health checks and assume online with mock data
    // This prevents hitting rate limits during development
    if (!import.meta.env.PROD) {
      setHealth({
        isOnline: true,
        timestamp: Date.now(),
        message: 'Development mode - using mock data',
      })
      setConnectionStatus('mock')
      return
    }

    // Production mode: perform initial health check with caching
    // Cache prevents multiple API calls on hot reloads or re-renders
    refreshHealth()
  }, [refreshHealth])

  // Initial config fetch
  useEffect(() => {
    refreshConfig()
  }, [refreshConfig])

  const value: AppStatusContextType = {
    health,
    isHealthy: health.isOnline,
    connectionStatus,
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
    connectionStatus: 'mock',
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
