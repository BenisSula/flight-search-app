interface HeroBackgroundProps {
  children: React.ReactNode
  minHeight?: 'short' | 'medium' | 'tall' | 'full'
}

/**
 * Reusable hero background component with flight.png image
 * Used across hero sections for consistent branding
 */
function HeroBackground({ children, minHeight = 'medium' }: HeroBackgroundProps) {
  const heightClasses = {
    short: 'min-h-[400px]',
    medium: 'min-h-[600px] md:min-h-[700px]',
    tall: 'min-h-[800px]',
    full: 'min-h-screen',
  }

  return (
    <section
      className={`relative w-full ${heightClasses[minHeight]} flex items-center justify-center overflow-hidden`}
      role="banner"
      aria-label="Hero section with flight search background"
    >
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url("/flight.png")',
        }}
        aria-hidden="true"
      />

      {/* Semi-transparent overlay */}
      <div className="absolute inset-0 bg-black/40" aria-hidden="true" />

      {/* Content Container */}
      <div className="relative z-20 w-full px-4 sm:px-6 lg:px-8 py-12 md:py-16">{children}</div>
    </section>
  )
}

export default HeroBackground
