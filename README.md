# 🛫 Flight Picker App

A modern, production-ready flight search application built with React 19, TypeScript, and Vite. Search flights with smart autocomplete, advanced filters, interactive price calendars, and fully responsive design.

![Deployment](https://img.shields.io/badge/deployment-vercel-black?style=for-the-badge&logo=vercel)
![TypeScript](https://img.shields.io/badge/typescript-5.0+-blue?style=for-the-badge&logo=typescript)
![React](https://img.shields.io/badge/react-19.1+-blue?style=for-the-badge&logo=react)
![License](https://img.shields.io/badge/license-MIT-green?style=for-the-badge)

## ✨ Features

- 🔍 **Smart Flight Search** - Search by origin, destination, dates with intelligent autocomplete
- 📊 **Price Calendar** - Interactive calendar showing fare trends by date
- 🎛️ **Advanced Filters** - Filter by price range, stops, airlines, departure/arrival times
- 🧭 **Nearby Airports** - Automatic geolocation to find airports near you
- 📱 **Fully Responsive** - Seamless experience on desktop, tablet, and mobile (320px-1920px+)
- ⚡ **Optimized Performance** - Code splitting, lazy loading, 94KB production bundle
- 🌙 **Dark Mode** - Automatic dark mode support
- ♿ **Accessible** - WCAG 2.1 AA compliant with keyboard navigation
- 🔄 **Graceful Degradation** - Automatic fallback to mock data when API unavailable
- 🎯 **Type-Safe** - Full TypeScript coverage with zero `any` types

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ and **npm**

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/BenisSula/flight-search-app.git
   cd flight-search-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables** (optional)
   
   Create a `.env` file in the root directory:
   ```env
   VITE_RAPIDAPI_KEY=your_api_key_here
   ```
   
   > **Note:** Without an API key, the app automatically uses mock data for development.

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open in browser**
   
   Visit [http://localhost:5173](http://localhost:5173)

## 🌐 Deployment

### Vercel (Recommended)

Deploy in minutes with zero configuration:

1. **Import from GitHub**
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New Project"
   - Import from GitHub: `BenisSula/flight-search-app`

2. **Add environment variables** (optional)
   - Settings → Environment Variables
   - Add: `VITE_RAPIDAPI_KEY=your_api_key_here`
   - Environment: Production

3. **Deploy**
   - Vercel auto-detects Vite settings
   - Deploys instantly on every push to `main`

**Live Demo:** [https://flight-search-app-steel.vercel.app](https://flight-search-app-steel.vercel.app)

## 🔑 API Configuration

This app uses the [Sky-Scrapper API](https://rapidapi.com/hub/sky-scrapper) via RapidAPI for flight data.

### Setting Up RapidAPI

1. **Create account**
   - Sign up at [RapidAPI](https://rapidapi.com)

2. **Subscribe to API**
   - Navigate to [Sky-Scrapper API](https://rapidapi.com/hub/sky-scrapper)
   - Choose a plan (Free tier: 500 requests/month)

3. **Get API key**
   - Copy your API key from RapidAPI Dashboard

4. **Configure**
   - Add to `.env` for local development
   - Add to Vercel for production deployment

### API Fallback System

The app includes intelligent fallback:
- ✅ **With API key**: Real-time flight data from RapidAPI
- ✅ **Without API key**: Mock data for development/testing
- ✅ **Rate limited**: Automatic fallback to mock data
- ✅ **Network issues**: Graceful degradation with cached results

**Result:** App always works, even without API! 🎉

## 📁 Project Structure

```
flight-picker-app/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── common/         # Buttons, Inputs, Loaders, etc.
│   │   ├── layout/         # Navbar, Footer
│   │   └── features/       # Feature-specific components
│   ├── context/            # React Context providers
│   │   ├── SearchContext   # Flight search state
│   │   └── AppStatusContext # API status
│   ├── data/               # Static data (deals, destinations)
│   ├── features/           # Feature modules
│   │   ├── results/        # Results page components
│   │   └── search/         # Search form components
│   ├── hooks/              # Custom React hooks
│   │   ├── useDebounce
│   │   ├── useGeolocation
│   │   └── useStrictModeDeduplication
│   ├── pages/              # Route pages
│   │   ├── Home
│   │   ├── Results
│   │   ├── FlightDetails
│   │   └── Deals
│   ├── services/           # API integration
│   │   └── flightApi.ts    # RapidAPI service
│   ├── types/              # TypeScript definitions
│   │   ├── flight.ts
│   │   ├── airport.ts
│   │   └── api.ts
│   └── utils/              # Utility functions
│       ├── apiStatus.ts    # Health checks with caching
│       ├── envConfig.ts    # Environment config
│       ├── withMockFallback.ts # Fallback utilities
│       ├── apiRetry.ts     # Retry logic
│       ├── handleApiError.ts
│       └── logger.ts       # Structured logging
├── public/                 # Static assets
├── docs/                   # Documentation
│   ├── troubleshooting.md  # Common issues & fixes
│   └── deployment-history.md
├── .env.example           # Environment template
├── vercel.json            # Vercel config
├── package.json
└── README.md
```

## 🛠️ Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint checks |
| `npm run lint:fix` | Auto-fix ESLint errors |
| `npm run format` | Format code with Prettier |
| `npm run format:check` | Check code formatting |
| `npm run type-check` | Run TypeScript checks |
| `npm run check` | Run all checks (type, lint, format) |

## 🏗️ Architecture Highlights

### 🎯 Design Principles

- **Modularity** - Feature-based organization
- **Type Safety** - Full TypeScript coverage
- **DRY** - Centralized utilities, no duplication
- **Separation of Concerns** - Clear boundaries
- **Error Resilience** - Graceful degradation

### 🧩 Core Systems

#### State Management
- **Context API** for global state
- **Custom Hooks** for reusable logic
- **Optimistic Updates** for better UX

#### API Integration
- **Centralized Service** (`flightApi.ts`)
- **Retry Logic** with exponential backoff
- **Intelligent Caching** (5-minute cache)
- **Mock Fallback** for development
- **Error Handling** with structured logging

#### Performance Optimization
- **Code Splitting** - Lazy loading all routes
- **Bundle Size** - 94KB gzipped
- **Debouncing** - Reduced API calls
- **Memoization** - Prevent unnecessary renders

### 🔒 Quality Assurance

- ✅ **TypeScript** - Strict mode, zero `any` types
- ✅ **ESLint** - Comprehensive linting rules
- ✅ **Prettier** - Consistent code formatting
- ✅ **Error Boundaries** - Graceful error recovery
- ✅ **Accessibility** - WCAG 2.1 AA compliant
- ✅ **Responsive** - Tested 320px-1920px+
- ✅ **Cross-browser** - Modern browser support

## 🎨 Tech Stack

| Category | Technology |
|----------|-----------|
| **Framework** | React 19.1.1 |
| **Language** | TypeScript 5.0+ |
| **Build Tool** | Vite 7 |
| **Styling** | Tailwind CSS |
| **Routing** | React Router v7 |
| **HTTP Client** | Fetch API |
| **State Management** | React Context API |
| **Validation** | Zod |
| **Notifications** | react-hot-toast |
| **Icons** | Lucide React |
| **Deployment** | Vercel |

## 📚 Development Guide

### Code Style

- **Format**: Prettier configuration in `.prettierrc`
- **Linting**: ESLint with `@eslint/js`
- **Type Safety**: Strict TypeScript mode
- **Comments**: JSDoc for complex functions

### Component Patterns

- Functional components with hooks
- Composition over inheritance
- Small, focused components
- Clear prop interfaces
- Extracted logic into custom hooks

### API Integration

Always use centralized utilities:
```typescript
// ✅ Correct: Use withMockFallback
const data = await withMockFallback(
  () => apiCall(),
  () => getMockData(),
  'context-name'
)

// ❌ Avoid: Direct try-catch
try {
  const data = await apiCall()
} catch (error) {
  return getMockData()
}
```

### Best Practices

- ✅ Always handle loading and error states
- ✅ Use TypeScript types consistently
- ✅ Add ARIA labels for accessibility
- ✅ Implement keyboard navigation
- ✅ Optimize images and assets
- ✅ Write self-documenting code

## 🔍 Troubleshooting

For common issues and detailed solutions, see **[Troubleshooting Guide](docs/troubleshooting.md)**

### Quick Fixes

**Offline Status?**
- Check if `VITE_RAPIDAPI_KEY` is set in Vercel
- Verify API key is valid in RapidAPI dashboard
- Redeploy after changing environment variables

**Rate Limited?**
- Free tier: 500 requests/month
- Upgrade plan or wait for reset
- App continues working with mock data

**Build Failing?**
```bash
npm run check  # Run all checks
npm install    # Reinstall dependencies
npm run build  # Test build locally
```

## 📈 Recent Improvements

- ✅ **Phase 1**: Eliminated duplicate code patterns
- ✅ **Phase 2**: Full TypeScript strict mode (0 `any` types)
- ✅ **Phase 3**: Centralized logging and error handling
- ✅ **Phase 4**: Shared mock fallback utilities
- ✅ **Phase 5**: Custom hooks for deduplication
- ✅ **Phase 6**: Responsive design audit (320px-1920px)
- ✅ **Phase 7**: WCAG 2.1 AA accessibility compliance
- ✅ **Phase 8**: Performance optimization (68% bundle reduction)
- ✅ **Phase 9**: API health checks with intelligent caching

See [docs/deployment-history.md](docs/deployment-history.md) for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- [RapidAPI](https://rapidapi.com) for Sky-Scrapper API
- [Vercel](https://vercel.com) for hosting platform
- [React](https://react.dev) team for the amazing framework
- [Tailwind CSS](https://tailwindcss.com) for utility-first styling
- [Lucide](https://lucide.dev) for beautiful icons

---

**Built with ❤️ by Benis Sula**

[Live Demo](https://flight-search-app-steel.vercel.app) • [GitHub](https://github.com/BenisSula/flight-search-app) • [Report Bug](https://github.com/BenisSula/flight-search-app/issues) • [Request Feature](https://github.com/BenisSula/flight-search-app/issues)
