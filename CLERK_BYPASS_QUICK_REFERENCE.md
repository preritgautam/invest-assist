# Clerk Bypass - Quick Reference

## Mock Credentials for Testing

**Sign-In Form:**
- Email: any email
- Password: any password
- Action: Submitting redirects to home (no validation)

**Sign-Up Form:**
- First Name: any name
- Last Name: any name
- Email: any email
- Password: any password (min 8 chars)
- Confirm Password: must match password
- Action: Submitting redirects to home

**Default User Data:**
- Name: John Doe
- Email: john.doe@example.com
- Phone: +1 (555) 000-0000
- Mock User ID: `user_bypass_12345`

## API Behavior

All API routes using Clerk auth have been updated to use `user_bypass_12345` as a mock user ID:

- `/api/health` - Returns health status with mock user ID
- `/api/documents/list` - Returns documents for mock user
- `/api/documents/[processId]` - Returns specific document for mock user
- `/api/documents/store` - Stores document under mock user
- `/api/documents/update` - Updates document for mock user

## Pages & Components

### Public Pages (No auth required)
- `/` - Home page
- `/sign-in` - Custom login form
- `/sign-up` - Custom signup form
- `/forgot-password` - Password reset form

### Protected Pages (Now accessible to all)
- `/user` - User profile
- `/settings` - Settings page
- `/properties/*` - Property pages
- All other routes

### Logout
- User dropdown → Logout → Redirects to `/`
- Clears nothing (mock auth has no state)

## Files Modified

\`\`\`
middleware.ts
app/layout.tsx
app/page.tsx (commented out Clerk code)
app/sign-in/[[...sign-in]]/page.tsx
app/sign-up/[[...sign-up]]/page.tsx
app/forgot-password/[[...forgot-password]]/page.tsx
app/user/page.tsx
app/settings/page.tsx
app/api/health/route.ts
app/api/documents/[processId]/route.ts
app/api/documents/list/route.ts
app/api/documents/store/route.ts
app/api/documents/update/route.ts
components/user-profile-dropdown.tsx
\`\`\`

## Notes

- All Clerk dependencies are still in `package.json` (but not used)
- Can uninstall Clerk packages when confirmed working
- No environment variables needed
- All routes are now public
- Mock user ID is hardcoded for development

## Environment Variables

Remove these from `.env.local` (no longer needed):
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `NEXT_PUBLIC_CLERK_SIGN_IN_URL`
- `NEXT_PUBLIC_CLERK_SIGN_UP_URL`
- `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL`
