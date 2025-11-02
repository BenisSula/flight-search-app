import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { SearchProvider } from './context/SearchContext'
import { AppStatusProvider } from './context/AppStatusContext'
import { Navbar, Footer } from './components/layout'
import HeroSection from './components/HeroSection'
import PopularDestinations from './components/PopularDestinations'
import { Loader, ErrorBoundary } from './components/common'

// Lazy load pages for better performance
const Results = lazy(() => import('./pages/Results'))
const Deals = lazy(() => import('./pages/Deals'))
const FlightDetails = lazy(() => import('./pages/FlightDetails'))

/**
 * Home page component with hero section and popular destinations
 * @returns Home page layout
 */
function HomePage() {
  return (
    <>
      <HeroSection />
      <PopularDestinations />
    </>
  )
}

/**
 * Main App component with routing and providers
 * Sets up React Router, context providers, and lazy-loaded pages
 * @returns App with routing, navbar, main content, and footer
 */
function App() {
  return (
    <ErrorBoundary>
      <AppStatusProvider>
        <SearchProvider>
          <BrowserRouter>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
              <Navbar />
              <main className="flex-1">
                <Suspense
                  fallback={
                    <div className="flex items-center justify-center min-h-[60vh]">
                      <Loader size="lg" message="Loading..." />
                    </div>
                  }
                >
                  <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/flights" element={<Results />} />
                    <Route path="/flight/:id" element={<FlightDetails />} />
                    <Route path="/deals" element={<Deals />} />
                  </Routes>
                </Suspense>
              </main>
              <Footer />
            </div>
          </BrowserRouter>
        </SearchProvider>
      </AppStatusProvider>
    </ErrorBoundary>
  )
}

export default App
