# PWA Setup for BingeBox

Your BingeBox app is now configured as a Progressive Web App (PWA)! This means users can install it on their devices and use it like a native app.

## What's Been Added

### 1. Web App Manifest (`/public/manifest.json`)

- Defines how the app appears when installed
- Configures app name, colors, icons, and display mode
- Sets the app to run in standalone mode (like a native app)

### 2. Service Worker (`/public/sw.js`)

- Enables offline functionality
- Caches important resources for faster loading
- Provides fallback to offline page when network is unavailable

### 3. PWA Meta Tags

- Added to `app/layout.tsx` for iOS and Windows compatibility
- Configures theme colors and app behavior

### 4. Install Prompt Component

- Custom install prompt that appears for eligible users
- Provides a user-friendly way to install the app
- Located in `components/pwa-prompt.tsx`

### 5. Offline Page

- Custom offline experience at `/offline`
- Shows when users try to access uncached content while offline

## How It Works

1. **Installation**: When users visit your site on supported browsers, they'll see an install prompt
2. **Offline Support**: Previously visited pages work offline, and users see a helpful offline page for uncached content
3. **App-like Experience**: Once installed, the app opens in its own window without browser UI

## Browser Support

- **Chrome/Edge**: Full PWA support with install prompts
- **Safari**: Partial support (iOS devices can add to home screen)
- **Firefox**: Basic PWA support

## Customizing Icons

Currently using placeholder icons. To improve the user experience:

1. **Option 1**: Use an online generator

   - Visit https://realfavicongenerator.net/
   - Upload your logo/icon
   - Download and replace icons in `/public/icons/`

2. **Option 2**: Create manually
   - Design icons in these sizes: 72x72, 96x96, 128x128, 144x144, 152x152, 192x192, 384x384, 512x512
   - Save as PNG files in `/public/icons/`
   - Use your brand colors and ensure they work on different backgrounds

## Testing PWA Installation

### Desktop (Chrome/Edge):

1. Open your site
2. Look for install icon in address bar
3. Or use Chrome DevTools > Application > Manifest

### Mobile:

1. Open your site in mobile browser
2. Look for "Add to Home Screen" option in browser menu
3. The custom install prompt should also appear

### PWA Audit:

1. Open Chrome DevTools
2. Go to Lighthouse tab
3. Run PWA audit to check compliance

## Configuration Details

- **Theme Color**: `#e11d48` (matches your app's primary color)
- **Background Color**: `#000000` (dark theme)
- **Display Mode**: `standalone` (full-screen app experience)
- **Orientation**: `portrait-primary` (optimized for mobile)

## Next Steps

1. **Replace placeholder icons** with your actual brand icons
2. **Test installation** on different devices and browsers
3. **Monitor PWA metrics** in your analytics
4. **Consider adding more offline functionality** for specific pages

## Advanced Features (Optional)

- **Push Notifications**: Add web push for user engagement
- **Background Sync**: Queue actions when offline
- **App Shortcuts**: Add quick actions to the installed app
- **Share Target**: Allow other apps to share content to your PWA

Your PWA is now ready! Users can install BingeBox on their devices for a native app-like experience.
