# Troubleshooting Guide

Common issues and solutions for the Flight Picker App.

## Table of Contents

- [Offline Status Indicator](#offline-status-indicator)
- [Missing API Key](#missing-api-key)
- [Rate Limiting](#rate-limiting)
- [App Not Loading in Production](#app-not-loading-in-production)
- [Build Errors](#build-errors)

---

## Offline Status Indicator

### Symptom
The app shows "Offline" or "Mock" in the navigation bar, even though functionality works.

### Possible Causes

1. **Missing API Key** (Most Common)
   - `VITE_RAPIDAPI_KEY` not set in Vercel environment variables
   - **Fix**: [See Missing API Key section](#missing-api-key)

2. **Rate Limit Exceeded**
   - Hit RapidAPI free tier limits (typically 500 requests/month)
   - **Fix**: [See Rate Limiting section](#rate-limiting)

3. **Network Issues**
   - Temporary connectivity problem
   - **Fix**: Usually resolves automatically. App continues working with mock data.

### Understanding Status Indicators

| Status | Meaning | Functionality |
|--------|---------|---------------|
| **Online** (Green) | Connected to RapidAPI | Real data from Sky-Scrapper API |
| **Mock** (Yellow) | Using mock data | All features work with sample data |
| **Offline** (Red) | API unavailable | All features work with sample data |

**Important**: The app always remains functional! Status is mostly informational.

---

## Missing API Key

### Symptom
- Status shows "Offline" or "Mock"
- All features use sample/mock data
- No real-time flight information

### Solution: Add API Key to Vercel

#### Step 1: Get Your RapidAPI Key

1. Go to [RapidAPI Dashboard](https://rapidapi.com/dashboard)
2. Sign up or log in
3. Subscribe to **Sky-Scrapper** API
4. Copy your API key from the dashboard

#### Step 2: Add to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project: **flight-search-app**
3. Click **Settings** (top right)
4. Click **Environment Variables** (left sidebar)
5. Click **Add New**
6. Fill in:
   - **Key**: `VITE_RAPIDAPI_KEY`
   - **Value**: Your RapidAPI key
   - **Environment**: Select "Production" (or "All Environments")
7. Click **Save**

#### Step 3: Redeploy

**Important**: Adding environment variables requires a redeploy!

**Option A: Redeploy from Dashboard**
1. Go to **Deployments** tab
2. Click **"..."** on the latest deployment
3. Click **Redeploy**

**Option B: Trigger via Git**
```bash
# Make a small change and push
git commit --allow-empty -m "chore: trigger redeploy"
git push origin main
```

#### Step 4: Verify

1. Wait 2-3 minutes for deployment
2. Visit your deployed app
3. Check if status changed from "Offline" to "Online"
4. Try searching for flights

### Quick Check

To verify your API key is being read:

1. Open browser console on deployed app
2. Run: `console.log(import.meta.env.VITE_RAPIDAPI_KEY?.length)`
3. Should show a number > 0 if configured correctly

---

## Rate Limiting

### Symptom
- Status shows "Offline" after working initially
- Error messages about "429" or "Too Many Requests"
- No API calls succeeding

### Understanding Rate Limits

**Free Tier** (Common):
- 500 requests per month
- ~16 requests per day
- Auto-resets monthly

**Basic Tier**:
- Varies by plan
- Usually 1000+ requests/month

### Why You Hit the Limit

- **Health checks**: Run on page loads (1 per visitor)
- **Multiple visitors**: Each page load = 1 API call
- **Development**: Testing increases usage

### Solutions

#### Option 1: Upgrade RapidAPI Plan (Best for Production)

1. Go to [RapidAPI Dashboard](https://rapidapi.com/dashboard)
2. Find **Sky-Scrapper** in your subscriptions
3. Click **Pricing** or **Upgrade**
4. Choose a higher tier (Basic/Mega)
5. Wait for limits to reset or immediate upgrade

#### Option 2: Wait for Reset

- Free tier resets monthly
- Check your usage dashboard for reset date
- App continues working with mock data

#### Option 3: Disable Health Checks (Temporary)

The app already minimizes health checks automatically. The new implementation:
- Caches results for 5 minutes
- Only runs once per session
- Doesn't retry on 429 errors

---

## App Not Loading in Production

### Symptom
- 404 errors when navigating to routes
- Blank page
- "Page not found" errors

### Cause
Missing `vercel.json` configuration for SPA routing.

### Solution: Ensure vercel.json Exists

**Check**: Your project should have `vercel.json`:

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

**If missing**: This should already be fixed. If still seeing 404s:
1. Verify file exists in root directory
2. Redeploy the app
3. Hard refresh browser (Ctrl+F5 or Cmd+Shift+R)

---

## Build Errors

### TypeScript Errors

**Symptom**: Build fails with TypeScript errors

**Solution**:
```bash
npm run type-check  # Check for errors
npm run type-check -- --noEmit  # Verify without building
```

**Common Issues**:
- Missing type definitions: `npm install @types/[package-name] --save-dev`
- Strict mode errors: Check `tsconfig.json` settings

### Linting Errors

**Symptom**: Build fails with ESLint errors

**Solution**:
```bash
npm run lint          # Check errors
npm run lint:fix      # Auto-fix errors
```

### Build Command Failed

**Symptom**: Vercel deployment fails during build

**Solution**:
1. Check build logs in Vercel dashboard
2. Test locally: `npm run build`
3. Common issues:
   - Missing dependencies: Run `npm install`
   - Outdated Node version: Check Vercel settings
   - Environment variable syntax errors

---

## Console Errors

### "Failed to fetch" or Network Errors

**Cause**: CORS or network connectivity issue

**Solution**:
- This is normal if API is unavailable
- App automatically uses mock data
- Check if RapidAPI service is down: [RapidAPI Status](https://status.rapidapi.com)

### "API key not configured"

**Cause**: Environment variable not set

**Solution**: [See Missing API Key section](#missing-api-key)

### Repeated 429 Errors

**Cause**: Rate limit hit

**Solution**: [See Rate Limiting section](#rate-limiting)

---

## Testing Locally

### Setup

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Add your API key to `.env`:
   ```
   VITE_RAPIDAPI_KEY=your_key_here
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Run development server:
   ```bash
   npm run dev
   ```

5. Open http://localhost:3000

### Expected Behavior

**With API Key**:
- Health check runs once on load
- Status shows "Online" (green)
- Real flight data from RapidAPI

**Without API Key**:
- Status shows "Mock" (yellow)
- Uses mock/sample data
- All features still work

**Both scenarios**: App should be fully functional!

---

## Still Having Issues?

### Get Help

1. **Check Browser Console**:
   - Open DevTools (F12)
   - Look for red errors
   - Share error messages

2. **Check Vercel Logs**:
   - Go to Vercel Dashboard → Deployments
   - Click on a deployment → View Function Logs

3. **Check RapidAPI Dashboard**:
   - Usage statistics
   - Quota remaining
   - API status

4. **GitHub Issues**:
   - Create an issue with:
     - Error messages
     - Steps to reproduce
     - Browser/OS info
     - Screenshots

### Diagnostic Commands

```bash
# Check TypeScript errors
npm run type-check

# Check linting errors
npm run lint

# Build production version locally
npm run build

# Preview production build
npm run preview

# Run all checks
npm run check
```

---

## Prevention Tips

### Development
- ✅ Use `.env` file for local development
- ✅ Never commit `.env` to git
- ✅ Use mock data during development
- ✅ Test with API key before deploying

### Production
- ✅ Add environment variables in Vercel before first deploy
- ✅ Redeploy after changing environment variables
- ✅ Monitor RapidAPI usage regularly
- ✅ Upgrade plan if exceeding free tier limits

### Best Practices
- ✅ Keep health checks minimal (already implemented)
- ✅ Use cached results when possible
- ✅ Graceful degradation (mock data fallback)
- ✅ Clear error messages for users

---

## Environment Variables Reference

| Variable | Required | Description | Default |
|----------|----------|-------------|---------|
| `VITE_RAPIDAPI_KEY` | ✅ Yes | Your RapidAPI key | None |
| `VITE_RAPIDAPI_HOST` | ❌ Optional | API host | `sky-scrapper.p.rapidapi.com` |

**Note**: All `VITE_` variables are exposed to the browser at build time.

---

## Quick Reference

### Status Colors
- 🟢 **Green**: API working perfectly
- 🟡 **Yellow**: Using mock data (still functional)
- 🔴 **Red**: API unavailable (still functional)

### When to Worry

❌ **Worry if**:
- App shows blank page
- JavaScript errors in console
- No functionality at all

✅ **Don't worry if**:
- Status shows "Mock" but app works
- Status shows "Offline" but you can search flights
- No real-time data but sample data appears

**Remember**: This app is designed to always work, even without API!

