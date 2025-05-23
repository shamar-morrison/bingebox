# Remember Me Authentication Implementation

This document explains the "Remember Me" functionality implemented in your Next.js 14 + Supabase application.

## Overview

The "Remember Me" feature allows users to choose whether their authentication session should persist for 30 days or end when they close their browser. This is implemented using a combination of localStorage, cookies, and Supabase session management.

## Implementation Details

### 1. Components

#### Login Page (`app/login/page.tsx`)

- Added a checkbox for "Remember me for 30 days"
- Uses the `useRememberMe` hook for state management
- Checkbox state is automatically saved to localStorage and cookies

#### Profile Page (`app/profile/page.tsx`)

- Added an Account Settings section
- Users can toggle their remember me preference
- Added a logout button that properly clears all session data

### 2. Custom Hooks

#### `useRememberMe` Hook (`lib/hooks/use-remember-me.ts`)

```typescript
const { rememberMe, setRememberMe, clearRememberMe } = useRememberMe()
```

Features:

- Reads initial preference from localStorage and cookies
- Provides methods to update the preference
- Automatically syncs between localStorage and cookies
- Handles cookie expiration (30 days for "remember me")

### 3. Enhanced Supabase Client (`lib/supabase/client.ts`)

The Supabase client now:

- Checks the user's remember me preference
- Configures session persistence accordingly:
  - **Remember Me = true**: Uses localStorage with `persistSession: true`
  - **Remember Me = false**: Uses sessionStorage with `persistSession: false`
- Auto-refresh is enabled/disabled based on preference

### 4. Middleware Updates (`middleware.ts`)

Enhanced to:

- Check remember me preference from cookies
- Adjust cookie options based on user preference
- Handle session cleanup for non-remember sessions

### 5. Auth Utilities (`lib/auth-utils.ts`)

Provides:

- `signOut()`: Properly clears all session data and preferences
- `getRememberMePreference()`: Utility to check current preference
- `setRememberMePreference()`: Utility to update preference

## How It Works

### Session Persistence Logic

1. **When "Remember Me" is checked**:

   - Session data is stored in localStorage
   - Cookies are set with 30-day expiration
   - `persistSession: true` in Supabase client
   - `autoRefreshToken: true` for automatic token refresh

2. **When "Remember Me" is unchecked**:
   - Session data is stored in sessionStorage
   - Cookies are session-only (no max-age)
   - `persistSession: false` in Supabase client
   - Sessions end when browser closes

### Storage Strategy

The implementation uses multiple storage methods for reliability:

1. **localStorage**: Primary storage for remember me preference
2. **Cookies**: Fallback and server-side access
3. **sessionStorage**: For temporary sessions when remember me is disabled

### Cookie Configuration

```javascript
// Remember me enabled (30 days)
document.cookie = `supabase-remember-me=true; max-age=${30 * 24 * 60 * 60}; path=/; secure; samesite=lax`

// Remember me disabled (session only)
document.cookie = "supabase-remember-me=false; path=/; secure; samesite=lax"
```

## Usage Examples

### In Login Component

```tsx
import { useRememberMe } from "@/lib/hooks/use-remember-me"

function LoginForm() {
  const { rememberMe, setRememberMe } = useRememberMe()

  return (
    <Checkbox
      checked={rememberMe}
      onCheckedChange={(checked: boolean) => setRememberMe(checked)}
    />
  )
}
```

### In Settings Component

```tsx
import { useRememberMe } from "@/lib/hooks/use-remember-me"

function UserSettings() {
  const { rememberMe, setRememberMe } = useRememberMe()

  return (
    <div>
      <Checkbox
        checked={rememberMe}
        onCheckedChange={(checked: boolean) => setRememberMe(checked)}
      />
      <p>
        {rememberMe
          ? "Your session will persist for 30 days even after closing the browser."
          : "Your session will end when you close the browser."}
      </p>
    </div>
  )
}
```

### Logout Implementation

```tsx
import { signOut } from "@/lib/auth-utils"

async function handleLogout() {
  const { error } = await signOut()
  if (!error) {
    // Redirect or update UI
  }
}
```

## Security Considerations

1. **Secure Cookies**: All cookies use `secure` and `samesite=lax` flags
2. **Client-Side Storage**: Sensitive data is handled by Supabase's secure token management
3. **Session Cleanup**: Proper cleanup on logout prevents data leaks
4. **Preference Isolation**: Remember me preference doesn't expose session data

## Testing the Implementation

1. **Test Remember Me Enabled**:

   - Check the "Remember me" checkbox during login
   - Close and reopen the browser
   - User should remain logged in

2. **Test Remember Me Disabled**:

   - Uncheck the "Remember me" checkbox during login
   - Close and reopen the browser
   - User should be logged out

3. **Test Preference Changes**:

   - Change the setting in the profile page
   - Verify the change affects future sessions

4. **Test Logout**:
   - Ensure logout clears all session data regardless of remember me setting

## Browser Compatibility

The implementation works across all modern browsers that support:

- localStorage
- sessionStorage
- Cookies with SameSite attribute
- ES6+ JavaScript features

## Troubleshooting

### Common Issues

1. **User stays logged in when remember me is disabled**:

   - Check if localStorage contains old session data
   - Clear browser storage and test again

2. **Remember me preference not persisting**:

   - Verify cookies are enabled in the browser
   - Check if localStorage is available

3. **Session not refreshing automatically**:
   - Ensure `autoRefreshToken` is properly configured based on remember me preference

### Debug Commands

```javascript
// Check current preference
localStorage.getItem("supabase-remember-me")

// Check cookies
document.cookie.split(";").find((c) => c.includes("supabase-remember-me"))

// Clear all auth data
localStorage.removeItem("supabase-remember-me")
// Clear all cookies with supabase prefix
```

## Future Enhancements

Potential improvements:

1. Custom session duration options (7 days, 14 days, etc.)
2. Device-specific remember me preferences
3. Security notifications for long-term sessions
4. Admin controls for maximum session duration
