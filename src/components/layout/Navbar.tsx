import { PlaneTakeoff, Wifi, WifiOff } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { useAppStatus } from '../../context/AppStatusContext'

/**
 * Navigation bar component with logo, links, and API health indicator
 * Sticky header with backdrop blur effect
 * @returns Navbar with FlightSearch branding and navigation links
 */
function Navbar() {
  const location = useLocation()
  const { connectionStatus } = useAppStatus()

  // Determine status label and style based on connection status
  const getStatusInfo = () => {
    if (connectionStatus === 'online') {
      return {
        icon: Wifi,
        label: 'Online',
        className: 'text-green-700 dark:text-green-300',
        iconClassName: 'text-green-600 dark:text-green-400',
        message: 'Connected to RapidAPI',
      }
    } else if (connectionStatus === 'mock') {
      return {
        icon: Wifi,
        label: 'Mock',
        className: 'text-yellow-700 dark:text-yellow-300',
        iconClassName: 'text-yellow-600 dark:text-yellow-400',
        message: 'Using mock data temporarily',
      }
    } else {
      return {
        icon: WifiOff,
        label: 'Offline',
        className: 'text-red-700 dark:text-red-300',
        iconClassName: 'text-red-600 dark:text-red-400',
        message: 'API unavailable - using mock data',
      }
    }
  }

  const statusInfo = getStatusInfo()
  const StatusIcon = statusInfo.icon

  return (
    <header
      className="sticky top-0 z-50 w-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 shadow-sm"
      role="banner"
    >
      <nav
        className="container mx-auto px-4 sm:px-6 lg:px-8"
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="flex items-center justify-between h-16">
          {/* Logo Section */}
          <div className="flex items-center gap-2">
            <Link
              to="/"
              className="flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-primary-blue focus:ring-offset-2 rounded-lg px-2 py-1 transition-all"
              aria-label="FlightSearch home"
            >
              <PlaneTakeoff
                className="h-6 w-6 text-primary-blue dark:text-blue-400"
                aria-hidden="true"
              />
              <span className="text-xl font-bold text-primary-blue dark:text-blue-400">
                FlightSearch
              </span>
            </Link>

            {/* Health Indicator with Tooltip */}
            <div
              className="group relative flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium transition-all cursor-help"
              role="status"
              aria-live="polite"
              aria-label={`Connection status: ${statusInfo.label}`}
              title={statusInfo.message}
            >
              <StatusIcon
                className={`h-3.5 w-3.5 ${statusInfo.iconClassName}`}
                aria-hidden="true"
              />
              <span className={`hidden sm:inline ${statusInfo.className}`}>
                {statusInfo.label}
              </span>
              
              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 whitespace-nowrap z-50">
                {statusInfo.message}
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                  <div className="border-4 border-transparent border-t-gray-900 dark:border-t-gray-700"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="flex items-center gap-6" role="list">
            <Link
              to="/flights"
              role="listitem"
              className={`font-medium focus:outline-none focus:ring-2 focus:ring-primary-blue focus:ring-offset-2 dark:focus:ring-offset-gray-900 rounded-md px-3 py-2 transition-colors duration-200 relative group ${
                location.pathname === '/flights'
                  ? 'text-primary-blue dark:text-blue-400'
                  : 'text-text-dark dark:text-gray-200 hover:text-primary-blue dark:hover:text-blue-400'
              }`}
              aria-current={location.pathname === '/flights' ? 'page' : undefined}
            >
              Flights
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary-blue transition-all duration-200 group-hover:w-full"></span>
            </Link>
            <Link
              to="/deals"
              role="listitem"
              className={`font-medium focus:outline-none focus:ring-2 focus:ring-primary-blue focus:ring-offset-2 dark:focus:ring-offset-gray-900 rounded-md px-3 py-2 transition-colors duration-200 relative group ${
                location.pathname === '/deals'
                  ? 'text-primary-blue dark:text-blue-400'
                  : 'text-text-dark dark:text-gray-200 hover:text-primary-blue dark:hover:text-blue-400'
              }`}
              aria-label="View flight deals"
              aria-current={location.pathname === '/deals' ? 'page' : undefined}
            >
              Deals
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary-blue transition-all duration-200 group-hover:w-full"></span>
            </Link>
          </div>
        </div>
      </nav>
    </header>
  )
}

export default Navbar
