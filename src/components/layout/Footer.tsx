import { Link } from 'react-router-dom'
import { getCurrentYear } from '../../utils/formatDate'

/**
 * Footer component with company info, links, and copyright
 * Responsive grid layout with quick links and support section
 * @returns Footer with FlightSearch branding and navigation links
 */
function Footer() {
  return (
    <footer
      className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 mt-auto"
      role="contentinfo"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-lg font-bold text-text-dark dark:text-gray-100 mb-4">
              FlightSearch
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Your trusted platform for finding the best flight deals around the world. Search,
              compare, and book flights with ease.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold text-text-dark dark:text-gray-100 mb-4">
              Quick Links
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  to="/flights"
                  className="text-gray-600 dark:text-gray-400 hover:text-primary-blue dark:hover:text-blue-400 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-blue focus:ring-offset-2 dark:focus:ring-offset-gray-900 rounded-md px-1"
                  aria-label="Search flights"
                >
                  Search Flights
                </Link>
              </li>
              <li>
                <Link
                  to="/deals"
                  className="text-gray-600 dark:text-gray-400 hover:text-primary-blue dark:hover:text-blue-400 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-blue focus:ring-offset-2 dark:focus:ring-offset-gray-900 rounded-md px-1"
                  aria-label="View flight deals"
                >
                  Deals
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-sm font-semibold text-text-dark dark:text-gray-100 mb-4">
              Support
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="#"
                  className="text-gray-600 dark:text-gray-400 hover:text-primary-blue dark:hover:text-blue-400 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-blue focus:ring-offset-2 dark:focus:ring-offset-gray-900 rounded-md px-1"
                  aria-label="Help center (coming soon)"
                >
                  Help Center
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-600 dark:text-gray-400 hover:text-primary-blue dark:hover:text-blue-400 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-blue focus:ring-offset-2 dark:focus:ring-offset-gray-900 rounded-md px-1"
                  aria-label="Contact us (coming soon)"
                >
                  Contact Us
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
          <p className="text-center text-sm text-gray-600 dark:text-gray-400">
            © {getCurrentYear()} FlightSearch. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
