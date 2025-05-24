# Cross-Device Continue Watching Implementation

This document explains the enhanced "Continue Watching" functionality that syncs watch progress across devices when users are logged in.

## Overview

The system provides seamless continue watching experience by:

- Using localStorage for anonymous users
- Syncing data to user accounts when logged in
- Providing cross-device synchronization
- Auto-saving progress during playback
- Handling data migration when users sign in/out

## Architecture

### 1. Database Schema

```sql
-- watch_progress table
CREATE TABLE public.watch_progress (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    media_id TEXT NOT NULL, -- TMDB ID for movies/TV, MAL ID for anime
    media_type TEXT NOT NULL CHECK (media_type IN ('movie', 'tv', 'anime')),
    title TEXT NOT NULL,
    poster_path TEXT,
    backdrop_path TEXT,

    -- Main progress data
    watched_seconds NUMERIC(10,3) NOT NULL DEFAULT 0,
    duration_seconds NUMERIC(10,3) NOT NULL DEFAULT 0,

    -- TV show specific fields
    last_season_watched TEXT,
    last_episode_watched TEXT,

    -- Episode progress data (JSONB for flexibility)
    show_progress JSONB DEFAULT '{}',

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Ensure one record per user per media item
    UNIQUE(user_id, media_id, media_type)
);
```

### 2. Key Components

#### `useVidlinkProgress` Hook (Enhanced)

- **Primary Interface**: Main hook for accessing watch progress data
- **Smart Loading**: Loads from account if logged in, localStorage otherwise
- **Auto-sync**: Debounced saving to account during playback
- **Lifecycle Management**: Handles component unmount and page navigation
- **Cross-device Ready**: Seamlessly switches between localStorage and account data

#### `useWatchProgressSync` Hook

- **Data Conversion**: Converts between VidLink format and database format
- **Sync Operations**: Handles bidirectional sync between localStorage and database
- **Conflict Resolution**: Uses upsert with proper conflict handling
- **Error Handling**: Graceful error handling with fallbacks

#### `useWatchProgressManager` Hook

- **High-level Operations**: Provides user-friendly functions for common operations
- **Sign-in/out Handling**: Manages data during authentication state changes
- **Data Migration**: Handles merging localStorage data when user signs in

### 3. Data Flow

```
VidLink.pro → localStorage → Enhanced Hook → Database (if logged in)
                   ↓
              Continue Watching UI
```

## How It Works

### For Anonymous Users

1. VidLink.pro sends progress data via postMessage
2. Data is saved to localStorage
3. Continue watching displays localStorage data
4. No account sync occurs

### For Logged-in Users

1. VidLink.pro sends progress data via postMessage
2. Data is saved to localStorage (immediate)
3. Data is debounced and saved to user account (2-second delay)
4. Continue watching displays account data
5. Cross-device sync is automatic

### When User Signs In

1. System checks for existing localStorage data
2. If found, merges with account data using upsert
3. localStorage is cleared after successful sync
4. Future updates go to account

### When User Signs Out

1. Current progress is synced to account before sign out
2. localStorage data remains for offline access
3. Continue watching switches to localStorage source

## Implementation Details

### 1. Real-time Progress Tracking

```typescript
// VidLink.pro sends data via postMessage
window.addEventListener("message", (event) => {
  if (event.origin !== "https://vidlink.pro") return

  if (event.data?.type === "MEDIA_DATA") {
    const newMediaData = event.data.data
    // Save to localStorage immediately
    // Debounce save to account if logged in
  }
})
```

### 2. Auto-save on Navigation

```typescript
// Handle page unload/navigation
useEffect(() => {
  const handleBeforeUnload = () => {
    if (user && hasUnsavedChanges) {
      // Use sendBeacon for reliable saving
      navigator.sendBeacon("/api/save-progress", data)
    }
  }

  window.addEventListener("beforeunload", handleBeforeUnload)
  return () => window.removeEventListener("beforeunload", handleBeforeUnload)
}, [user, progressData])
```

### 3. Data Format Conversion

```typescript
// VidLink format → Database format
const convertFromVidLinkFormat = (vidLinkData) => {
  return Object.values(vidLinkData).map((item) => ({
    user_id: user.id,
    media_id: String(item.id),
    media_type: item.type,
    title: item.title,
    poster_path: item.poster_path || null,
    backdrop_path: item.backdrop_path || null,
    watched_seconds: item.progress?.watched || 0,
    duration_seconds: item.progress?.duration || 0,
    last_season_watched: item.last_season_watched || null,
    last_episode_watched: item.last_episode_watched || null,
    show_progress: item.show_progress || {},
  }))
}
```

## API Endpoints

### `/api/save-progress` (POST)

Handles sendBeacon requests for saving progress during page unload.

**Request Body:**

```json
{
  "action": "save_progress",
  "data": {
    /* VidLink progress data */
  },
  "userId": "user-uuid"
}
```

**Response:**

```json
{
  "success": true,
  "saved": 5
}
```

## Security & Privacy

### Row Level Security (RLS)

```sql
-- Users can only access their own watch progress
CREATE POLICY "Users can only access their own watch progress"
ON public.watch_progress
FOR ALL USING (auth.uid() = user_id);
```

### Data Protection

- All database operations require authentication
- User data is isolated via RLS policies
- No cross-user data leakage possible

## Performance Optimizations

### 1. Debounced Saving

- Progress updates are debounced (2-second delay)
- Prevents excessive database writes during playback
- Ensures final save on component unmount

### 2. Efficient Loading

- Smart data source selection (account vs localStorage)
- Single query for all user progress data
- Proper indexing on user_id and updated_at

### 3. Conflict Resolution

- Uses PostgreSQL UPSERT for atomic operations
- Handles concurrent updates gracefully
- Maintains data consistency

## Error Handling

### Network Failures

- Graceful fallback to localStorage
- Retry logic for critical operations
- User feedback for sync status

### Data Corruption

- JSON parsing error handling
- Automatic cleanup of corrupted data
- Fallback to empty state

### Authentication Issues

- Continues working in anonymous mode
- Automatic retry when auth is restored
- No data loss during auth transitions

## Testing Scenarios

### 1. Anonymous User

- [ ] Progress saves to localStorage
- [ ] Continue watching works offline
- [ ] No network requests made

### 2. Logged-in User

- [ ] Progress syncs to account
- [ ] Cross-device synchronization works
- [ ] Real-time updates during playback

### 3. Sign-in Flow

- [ ] localStorage data merges with account
- [ ] No data loss during sign-in
- [ ] Proper cleanup after sync

### 4. Sign-out Flow

- [ ] Progress saves before sign-out
- [ ] localStorage data preserved
- [ ] Seamless transition to offline mode

### 5. Edge Cases

- [ ] Page refresh during playback
- [ ] Network interruption during sync
- [ ] Multiple tabs playing different content
- [ ] Browser storage limits

## Future Enhancements

### 1. Sync Status Indicator

- Visual feedback for sync status
- Offline indicator when not synced
- Manual sync triggers

### 2. Data Export/Import

- Allow users to export their watch history
- Import from other platforms
- Backup and restore functionality

### 3. Analytics Integration

- Watch time analytics
- Most watched content
- Viewing patterns and insights

### 4. Advanced Sync Options

- Selective sync (choose what to sync)
- Sync frequency settings
- Conflict resolution preferences

## Troubleshooting

### Common Issues

1. **Progress not syncing**

   - Check user authentication status
   - Verify network connectivity
   - Check browser console for errors

2. **Data inconsistency across devices**

   - Force refresh to load latest data
   - Check for multiple active sessions
   - Verify database constraints

3. **localStorage quota exceeded**
   - Implement cleanup for old data
   - Compress data format
   - Move to account storage

### Debug Commands

```javascript
// Check localStorage data
JSON.parse(localStorage.getItem("vidLinkProgress"))

// Check sync status
// Look for console logs about sync operations

// Force sync
// Use dev tools to trigger manual sync
```

## Migration Guide

### From Legacy Implementation

1. Deploy database migration
2. Update TypeScript types
3. Deploy new hooks and components
4. Test with subset of users
5. Full rollout with monitoring

### Rollback Plan

1. Feature flag to disable account sync
2. Fall back to localStorage-only mode
3. Preserve existing localStorage data
4. No data loss during rollback
