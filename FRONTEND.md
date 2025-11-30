# Frontend Documentation

React 19 + Vite application with TailwindCSS and Monaco Editor.

## Setup

```bash
cd frontend
yarn install
cp .env.example .env
yarn dev
```

Application runs on http://localhost:5173

## Project Structure

```
frontend/
├── src/
│   ├── components/       # Reusable components
│   ├── pages/           # Page components
│   │   ├── admin/       # Admin pages
│   │   ├── instructor/  # Instructor pages
│   │   └── student/     # Student pages
│   ├── context/         # React Context (Auth)
│   ├── services/        # API service functions
│   ├── utils/           # Helper functions
│   ├── App.jsx          # Main app component
│   └── main.jsx         # Entry point
├── public/              # Static assets
└── index.html
```

## Environment Variables

```env
VITE_API_URL=http://localhost:3000
```

## Technology Stack

- React 19.2.0
- Vite 7.2.2
- React Router DOM 7.1.3
- TailwindCSS 4.1.17
- Monaco Editor
- Axios
- React-PDF
- Lucide React (icons)
- React Toastify (notifications)

## Key Features

### Authentication
- JWT-based auth with 24-hour session
- Persists across page refreshes
- Auto-logout on token expiry
- Context-based state management

### Role-Based Routing
- Protected routes based on user role
- Automatic redirects
- Role-specific dashboards

### Pages

**Public**
- Landing page
- Login

**Admin**
- Dashboard
- User management (CRUD, CSV import/export)
- Batch management
- Section management
- Lessons overview
- Submissions overview

**Instructor**
- Dashboard
- Assigned sections
- Lesson management (create, edit, delete)
- Assignment management (create, edit, delete)
- Submission review and grading

**Student**
- Dashboard
- Lessons list
- Assignments list
- Code workspace (Monaco editor)
- Submission history

## Components

**Layout Components**
- `DashboardLayout` - Main layout with sidebar
- `Navbar` - Navigation bar
- `Sidebar` - Role-based navigation
- `ProtectedRoute` - Route guards

**UI Components**
- `Button`, `Input`, `Card` - Base components
- `Modal` - Modal dialogs
- `Table` - Data tables
- `FileUpload` - File upload component

## Services

**API Services** (`src/services/`)
- `adminService.js` - Admin API calls
- `instructorService.js` - Instructor API calls
- `studentService.js` - Student API calls

**API Client** (`src/utils/apiClient.js`)
- Axios instance with interceptors
- Auto-attaches JWT token
- Handles 401 errors

## State Management

**AuthContext** (`src/context/AuthContext.jsx`)
- User authentication state
- Login/logout functions
- Token verification
- 24-hour session persistence

```javascript
import { useAuth } from './context/AuthContext';

const { user, login, logout, loading } = useAuth();
```

## Routing

```javascript
/ - Landing page
/login - Login page
/admin/* - Admin routes
/instructor/* - Instructor routes  
/student/* - Student routes
```

Protected routes redirect to login if not authenticated.

## Monaco Editor Integration

Code editor with multi-language support:

```javascript
import Editor from '@monaco-editor/react';

<Editor
  height="400px"
  language="python"
  value={code}
  onChange={setCode}
  theme="vs-dark"
/>
```

## PDF Viewer

```javascript
import { Document, Page } from 'react-pdf';

<Document file={pdfUrl}>
  <Page pageNumber={pageNumber} />
</Document>
```

## Form Handling

Forms use controlled components with state:

```javascript
const [formData, setFormData] = useState({
  name: '',
  email: ''
});

const handleChange = (e) => {
  setFormData({
    ...formData,
    [e.target.name]: e.target.value
  });
};
```

## API Integration

```javascript
import * as adminService from '../services/adminService';

// Get users
const users = await adminService.getAllUsers();

// Create user
await adminService.createUser(userData);
```

## Notifications

React Toastify for user feedback:

```javascript
import { toast } from 'react-toastify';

toast.success('Operation successful!');
toast.error('Operation failed!');
toast.info('Processing...');
```

## Styling

TailwindCSS utility classes:

```javascript
<div className="bg-white rounded-lg shadow-md p-6">
  <h1 className="text-2xl font-bold text-gray-900">Title</h1>
  <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
    Click Me
  </button>
</div>
```

## Build

```bash
# Development
yarn dev

# Production build
yarn build

# Preview production build
yarn preview
```

## Production Deployment

1. Build the application:
```bash
yarn build
```

2. Serve the `dist/` folder with nginx:

```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /path/to/frontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:3000\;
    }
}
```

## Common Issues

**API connection failed**: Check VITE_API_URL in .env

**Session lost on refresh**: Ensure token is in localStorage

**Monaco editor not loading**: Check internet connection (CDN)

**Build fails**: Clear node_modules and reinstall

## Performance

- Lazy loading for routes
- Code splitting with Vite
- Optimized images
- Memoized components where needed
