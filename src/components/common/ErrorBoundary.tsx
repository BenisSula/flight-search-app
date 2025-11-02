import { Component, type ReactNode, type ErrorInfo } from 'react'
import { AlertCircle, Home, RefreshCw } from 'lucide-react'
import Button from './Button'

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

/**
 * Error boundary component to catch and handle React component errors
 * Displays a user-friendly error UI instead of crashing the entire app
 * @param children - Child components to wrap
 * @param fallback - Custom fallback UI (optional)
 * @param onError - Error callback for logging (optional)
 * @returns Error boundary wrapper or fallback UI on error
 */
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
    }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error details for debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo)

    // Call optional error callback
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
    })
  }

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback
      }

      // Default error UI
      return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
          <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 text-center">
            {/* Error Icon */}
            <div className="mb-6 flex justify-center">
              <div className="rounded-full bg-red-100 dark:bg-red-900/20 p-4">
                <AlertCircle
                  className="h-12 w-12 text-red-500 dark:text-red-400"
                  aria-hidden="true"
                />
              </div>
            </div>

            {/* Error Message */}
            <h2 className="text-2xl font-bold text-text-dark dark:text-gray-100 mb-4">
              Something went wrong
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-2">
              We're sorry, but an unexpected error occurred.
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mb-8">
              {this.state.error?.message || 'Unknown error'}
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                onClick={this.handleReset}
                variant="primary"
                className="flex items-center justify-center gap-2"
                aria-label="Try again"
              >
                <RefreshCw className="h-5 w-5" aria-hidden="true" />
                Try Again
              </Button>
              <Button
                onClick={() => {
                  window.location.href = '/'
                }}
                variant="secondary"
                className="flex items-center justify-center gap-2"
                aria-label="Go to home page"
              >
                <Home className="h-5 w-5" aria-hidden="true" />
                Go Home
              </Button>
            </div>

            {/* Developer Info */}
            {import.meta.env.DEV && this.state.error && (
              <details className="mt-8 text-left">
                <summary className="text-sm text-gray-600 dark:text-gray-400 cursor-pointer hover:text-gray-800 dark:hover:text-gray-200 mb-2">
                  Error Details (Development Only)
                </summary>
                <pre className="text-xs bg-gray-100 dark:bg-gray-900 p-4 rounded overflow-auto max-h-48">
                  {this.state.error.stack}
                </pre>
              </details>
            )}
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
