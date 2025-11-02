import type { InputHTMLAttributes, ReactNode } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
  icon?: ReactNode
  fullWidth?: boolean
}

/**
 * Reusable input component with label, error, and helper text support
 * @param label - Input label text
 * @param error - Error message to display
 * @param helperText - Helper text below input
 * @param icon - Optional icon on the left side
 * @param fullWidth - Makes input full width (default: false)
 * @returns Input component with optional label and error states
 */
function Input({
  label,
  error,
  helperText,
  icon,
  fullWidth = false,
  className = '',
  id,
  ...props
}: InputProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')

  const baseStyles =
    'px-4 py-3 border rounded-lg bg-white dark:bg-gray-700 text-text-dark dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent transition-all'

  const errorStyles = error
    ? 'border-red-500 dark:border-red-400 focus:ring-red-500'
    : 'border-gray-300 dark:border-gray-600'

  const iconStyles = icon ? 'pl-10' : ''

  const widthStyle = fullWidth ? 'w-full' : ''

  return (
    <div className={fullWidth ? 'w-full' : ''}>
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-text-dark dark:text-gray-200 mb-2"
        >
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500">
            {icon}
          </div>
        )}
        <input
          id={inputId}
          className={`${baseStyles} ${errorStyles} ${iconStyles} ${widthStyle} ${className}`}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={
            error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined
          }
          {...props}
        />
      </div>
      {error && (
        <p id={`${inputId}-error`} className="mt-1 text-sm text-red-500" role="alert">
          {error}
        </p>
      )}
      {helperText && !error && (
        <p id={`${inputId}-helper`} className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {helperText}
        </p>
      )}
    </div>
  )
}

export default Input
