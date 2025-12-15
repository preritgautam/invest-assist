# Authentication & Middleware Setup

## Overview
Authentication middleware has been enabled to protect routes and ensure only logged-in users can access the application.

## How It Works

### 1. **Middleware** ([middleware.ts](middleware.ts))
- Checks for `authToken` cookie on every request
- **Public Routes** (no auth required):
  - `/sign-in`
  - `/sign-up`
  - `/forgot-password`
  - `/api/health`
- **Protected Routes** (auth required):
  - All other routes redirect to `/sign-in` if not logged in
- **Logged-in users** trying to access sign-in/sign-up pages are redirected to home (`/`)

### 2. **Authentication Utilities** ([lib/auth-utils.ts](lib/auth-utils.ts))
Provides helper functions:
- `isUserLoggedIn()` - Check if user has valid auth token
- `setAuthToken(email)` - Set auth token (called after sign-in/sign-up)
- `clearAuthToken()` - Clear auth token (called on logout)
- `getUserEmailFromToken()` - Get user's email from token

### 3. **Auth Hook** ([hooks/use-auth.ts](hooks/use-auth.ts))
React hook for client components:
```tsx
const { isLoggedIn, userEmail, isLoading } = useAuth(redirectIfNotLoggedIn)
```

### 4. **Sign-In/Sign-Up/Forgot Password**
When user successfully authenticates:
- Auth token is set in cookies
- User is redirected to home page
- All subsequent requests include auth token

### 5. **Logout**
In user profile dropdown:
- Auth token is cleared from cookies
- User is redirected to sign-in page

## Usage Examples

### Protect a Route with Redirect
```tsx
'use client'

import { useAuth } from '@/hooks/use-auth'

export default function ProtectedPage() {
  const { isLoggedIn, isLoading } = useAuth(true) // true = redirect if not logged in

  if (isLoading) return <div>Loading...</div>
  if (!isLoggedIn) return null

  return <div>Protected content</div>
}
```

### Get User Info
```tsx
'use client'

import { useAuth } from '@/hooks/use-auth'

export default function Profile() {
  const { isLoggedIn, userEmail } = useAuth()

  return <p>Welcome, {userEmail}</p>
}
```

### Manual Auth Check
```tsx
import { isUserLoggedIn, getUserEmailFromToken } from '@/lib/auth-utils'

if (isUserLoggedIn()) {
  const email = getUserEmailFromToken()
  console.log(`User logged in as: ${email}`)
}
```

## Flow Diagram

```
User visits website
    ↓
Middleware checks for authToken
    ↓
    ├─→ authToken exists? → Allow access to route
    │
    └─→ No authToken? 
         ├─→ Public route? → Allow access
         └─→ Protected route? → Redirect to /sign-in
    ↓
User signs in/signs up
    ↓
authToken set in cookies
    ↓
Redirected to home page
    ↓
Subsequent requests include authToken
    ↓
Can access all protected routes
    ↓
User clicks logout
    ↓
authToken cleared
    ↓
Redirected to /sign-in
```

## Cookie Details
- **Name**: `authToken`
- **Value**: Base64 encoded user email
- **Expiration**: 30 days from login
- **Path**: `/` (site-wide)

## Security Notes
⚠️ **Important**: This is a demonstration implementation for local development. For production:
- Use secure HTTP-only cookies
- Implement server-side session validation
- Hash/encrypt tokens
- Use CSRF protection
- Implement rate limiting on auth endpoints
- Consider using industry-standard solutions like NextAuth.js or Clerk
