# Deployment History

This document tracks all major fixes, improvements, and deployment issues resolved during the project lifecycle.

---

## Phase 4: Shared Mock Fallback Utility

**Objective**: Eliminate duplicate mock fallback patterns with a centralized utility.

**Created**:
- `src/utils/withMockFallback.ts` - Generic wrapper for API calls with automatic mock data fallback

**Impact**: Replaced repetitive try-catch blocks with a single reusable utility across all API calls.

---

## Phase 5: Custom Hooks for Deduplication

**Objective**: Eliminate duplicate strict mode deduplication logic.

**Created**:
- `src/hooks/useStrictModeDeduplication.ts` - Centralized React Strict Mode deduplication logic

---

## Phase 6: API Endpoint Fix

**Problem**: API requests failing on Vercel with 404 errors.

**Root Cause**: `flightApi.ts` was incorrectly prefixing all endpoints with `/api`, creating malformed URLs.

**Fix**: Removed erroneous endpoint construction logic:
```typescript
// Before (WRONG):
const apiEndpoint = endpoint.startsWith('/api/') ? endpoint : `/api${endpoint}`

// After (CORRECT):
const apiEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`
```

**File Changed**: `src/services/flightApi.ts` lines 75-78

---

## Phase 7: Vercel SPA Routing Fix

**Problem**: Direct navigation to routes (e.g., `/flights`, `/deals`) returned 404 on Vercel.

**Root Cause**: Missing `vercel.json` configuration for Single Page Application routing.

**Fix**: Created `vercel.json` with rewrite rules:
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

**File Created**: `vercel.json`

---

## Phase 8: Performance Optimization

**Problem**: Slow loading times on `/flights` and `/deals` pages.

**Root Cause**: Unoptimized external Unsplash images.

**Fixes Applied**:
1. **Image URLs**: Added `&q=80` quality parameter to all Unsplash URLs
2. **Component**: Added `decoding="async"` and `fetchPriority="auto"` to `<img>` tags in `DealCard.tsx`
3. **HTML**: Added DNS prefetch and preconnect hints in `index.html`:
   ```html
   <link rel="dns-prefetch" href="https://images.unsplash.com" />
   <link rel="preconnect" href="https://images.unsplash.com" crossorigin />
   ```

**Files Changed**:
- `src/data/deals.ts`
- `src/components/DealCard.tsx`
- `index.html`

---

## Phase 9: API Health Check Overhaul

**Problem**: "Offline" status showing even when app was functioning with mock data.

**Root Cause**: Old health check logic was confusing and didn't properly handle rate limits.

**Solution**: Created new centralized health check utility with intelligent caching.

**New File**: `src/utils/apiStatus.ts`

**Features**:
- 5-minute cache to prevent rate limits
- Three clear status states: `'online' | 'offline' | 'mock'`
- 5-second timeout protection
- Smart error differentiation (network vs rate limit vs config)
- Cache management utilities

**Removed Duplicates**:
- `checkServer()` from `flightApi.ts` (replaced by `checkApiHealth()`)
- `testApiConnectivity()` from `flightApi.ts` (unused)
- `isApiKeyConfigured()` from `apiStatus.ts` (duplicate of `isApiConfigured()`)
- `getConfig()` from `flightApi.ts` (unused)
- `getLocale()` from `flightApi.ts` (unused)

**Updated**:
- `src/context/AppStatusContext.tsx` - Now uses `checkApiHealth()` instead of `checkServer()`
- `src/components/layout/Navbar.tsx` - Added tooltip with detailed status messages

**Documentation Created**:
- `docs/troubleshooting.md` - Comprehensive troubleshooting guide
- `.env.example` - Environment variable template

---

## Repository Fix

**Problem**: Code was being pushed to `flight-picker-app` while deployment used `flight-search-app`.

**Fix**: Corrected Git remote to point to the deployed repository.

---

## Common Issues & Quick Fixes

### Missing API Key (95% of "Offline" issues)
**Symptom**: Application shows "Offline" status.

**Solution**:
1. Add `VITE_RAPIDAPI_KEY` to Vercel environment variables
2. Redeploy application

### Rate Limit (429 Error)
**Symptom**: API returns 429 status, app falls back to mock data.

**Solution**:
- Wait 5 minutes for rate limit reset
- Or upgrade RapidAPI subscription plan
- Health check now caches results for 5 minutes to reduce API calls

### Build Errors
**Check**: `docs/troubleshooting.md` for comprehensive troubleshooting guide.

---

## Current Architecture

### Health Check System
```
AppStatusContext → checkApiHealth() → RapidAPI
                   ↓ (cached for 5min)
                Status: 'online' | 'offline' | 'mock'
```

### Mock Fallback Pattern
```
API Call → withMockFallback() → Try API
                           ↓ (on failure)
                     Return Mock Data
```

### Environment Configuration
```
.env.local (local) → Vite Build
.env.production (Vercel) → Production Build
```

---

## Best Practices Implemented

1. ✅ Centralized environment configuration (`envConfig.ts`)
2. ✅ Centralized logging (`logger.ts`)
3. ✅ Centralized error handling (`handleApiError.ts`)
4. ✅ Centralized retry logic (`apiRetry.ts`)
5. ✅ Centralized health checks (`apiStatus.ts`)
6. ✅ Graceful degradation (mock data fallback)
7. ✅ Intelligent caching to prevent rate limits
8. ✅ Type-safe API interfaces
9. ✅ Comprehensive error logging
10. ✅ Developer-friendly debugging tools

---

For detailed troubleshooting information, see `docs/troubleshooting.md`.

