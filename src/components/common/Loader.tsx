interface LoaderProps {
  size?: 'sm' | 'md' | 'lg'
  fullScreen?: boolean
  message?: string
  variant?: 'spinner' | 'dots'
}

/**
 * Loading indicator component with spinner or dots animation
 * @param size - Loader size (default: 'md')
 * @param fullScreen - Renders over entire screen with backdrop (default: false)
 * @param message - Optional loading message to display
 * @param variant - Animation type: 'spinner' or 'dots' (default: 'spinner')
 * @returns Loader component with optional message
 */
function Loader({ size = 'md', fullScreen = false, message, variant = 'spinner' }: LoaderProps) {
  const sizeStyles = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  }

  const spinner = (
    <svg
      className={`animate-spin ${sizeStyles[size]} text-primary-blue`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  )

  const dots = (
    <div className="flex items-center gap-1.5">
      <div className={`${sizeStyles[size]} bg-primary-blue rounded-full animate-pulse-0`} />
      <div className={`${sizeStyles[size]} bg-primary-blue rounded-full animate-pulse-1`} />
      <div className={`${sizeStyles[size]} bg-primary-blue rounded-full animate-pulse-2`} />
    </div>
  )

  const loadingIndicator = variant === 'dots' ? dots : spinner

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center">
        {loadingIndicator}
        {message && (
          <p className="mt-4 text-lg font-medium text-gray-700 dark:text-gray-300">{message}</p>
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center py-8">
      {loadingIndicator}
      {message && (
        <p className="mt-4 text-sm font-medium text-gray-600 dark:text-gray-400">{message}</p>
      )}
    </div>
  )
}

export default Loader
