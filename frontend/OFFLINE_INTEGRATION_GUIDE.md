# Quick Integration Guide - Offline Features

## Step 1: Add OfflineIndicator to App.jsx

```javascript
// src/App.jsx
import OfflineIndicator from './components/OfflineIndicator';

function App() {
  const handleSync = async () => {
    // Force reload data from all services
    window.location.reload();
  };

  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* All your routes */}
        </Routes>
        
        {/* Toast Container */}
        <ToastContainer />
        
        {/* Add Offline Indicator */}
        <OfflineIndicator onSync={handleSync} />
      </BrowserRouter>
    </AuthProvider>
  );
}
```

## Step 2: Update Student Lessons Page (Example)

```javascript
// src/pages/student/Lessons.jsx
import { useOfflineData } from '../hooks/useOfflineData';
import * as studentService from '../services/studentService';
import { Alert } from '../components/ui';

const StudentLessons = () => {
  // Replace useState and useEffect with useOfflineData
  const { 
    data: lessons, 
    loading, 
    error, 
    isOffline, 
    refresh 
  } = useOfflineData(
    studentService.getLessons,
    'lessons',
    60 // Cache for 60 minutes
  );

  return (
    <div className="space-y-6">
      {/* Show offline alert */}
      {isOffline && (
        <Alert variant="warning">
          Viewing cached data. Connect to network for latest updates.
        </Alert>
      )}

      {/* Rest of your component */}
      {loading ? <Skeleton /> : <LessonsList lessons={lessons || []} />}
    </div>
  );
};
```

## Step 3: Use LazyImage for Better Performance

```javascript
// Replace regular <img> tags
import LazyImage from '../components/LazyImage';

// Before:
<img src="/path/to/image.jpg" alt="Lesson" className="w-full" />

// After:
<LazyImage 
  src="/path/to/image.jpg" 
  alt="Lesson" 
  className="w-full"
  placeholder="/placeholder.png"
/>
```

## Step 4: Build for Production

```bash
# Build with PWA support
yarn build

# Preview production build
yarn preview
```

## Step 5: Test Offline Mode

### In Chrome DevTools:
1. Open DevTools (F12)
2. Go to Network tab
3. Change "Online" to "Offline"
4. Reload page
5. Check that cached content loads
6. Yellow "Offline Mode" badge should appear

### Check Service Worker:
1. Open DevTools (F12)
2. Go to Application tab
3. Click "Service Workers"
4. Should see registered service worker

### Check IndexedDB:
1. Open DevTools (F12)
2. Go to Application tab
3. Click "IndexedDB"
4. Should see "CodeLanDB" with stores

## Manual Cache Management (Optional)

```javascript
import { 
  cacheLessons, 
  getCachedLessons,
  clearCache 
} from '../utils/offlineStorage';

// Save after API call
const lessons = await api.getLessons();
await cacheLessons(lessons);

// Retrieve from cache
const cached = await getCachedLessons();

// Clear specific cache
await clearCache('lessons');
```

## Testing Checklist

- [ ] Build production version
- [ ] Service worker registers
- [ ] App works online
- [ ] Disconnect network
- [ ] Offline badge appears
- [ ] Cached content loads
- [ ] Reconnect network
- [ ] Online badge with sync button
- [ ] Click sync button
- [ ] Data refreshes

## PWA Installation

### Desktop (Chrome):
1. Look for install icon in address bar
2. Click to install
3. App opens in standalone window

### Mobile:
1. Open in mobile browser
2. "Add to Home Screen" prompt
3. App installs like native app

---

**That's it!** Your app now works offline! 🎉
