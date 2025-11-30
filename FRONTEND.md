# 🎨 Frontend Documentation - SMU Code Platform

[![React](https://img.shields.io/badge/React-19.2-blue)]()
[![Vite](https://img.shields.io/badge/Vite-7.2-purple)]()
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.1-cyan)]()

---

## 📋 Overview

Modern React application with Vite, featuring glassmorphism design, Monaco code editor, and role-based dashboards.

**Key Features:**
- 🎨 Glassmorphism UI with smooth animations
- ⚡ Vite-powered fast builds
- 📱 Fully responsive (mobile-first)
- 💻 Monaco Editor integration
- 🎯 Role-based interfaces
- 🔒 Protected routes

---

## 📁 Project Structure

```
frontend/
├── src/
│   ├── components/      # Reusable UI components
│   ├── pages/          # Page components
│   │   ├── admin/      # Admin pages
│   │   ├── instructor/ # Instructor pages
│   │   └── student/    # Student pages
│   ├── context/        # React Context (Auth)
│   ├── services/       # API services
│   ├── hooks/          # Custom hooks
│   └── utils/          # Utilities
├── public/
├── index.html
└── package.json
```

---

## 🚀 Installation

```bash
cd frontend
yarn install
cp .env.example .env
yarn dev
```

**Environment Variables:**
```env
VITE_API_URL=http://localhost:3000
VITE_APP_NAME=SMU Code Platform
```

---

## 🎯 Key Pages

### Public Pages
- **Landing Page** (`/`) - Marketing page with features
- **Login** (`/login`) - Authentication
- **Public Code Editor** (`/code`) - Try without login

### Protected Pages
- **Dashboard** - Role-specific dashboards
- **Admin Panel** - User/batch management
- **Instructor Portal** - Lessons/assignments
- **Student Workspace** - Code editor, submissions

---

## 🧩 Core Components

### Layout Components
```jsx
<Layout>           // Main wrapper
<Sidebar />        // Navigation
<Navbar />         // Header
<ProtectedRoute /> // Route guard
```

### UI Components
```jsx
<Button variant="primary" size="md" />
<Card />
<Modal />
<Table />
<Input />
<FileUpload />
```

---

## 🛣️ Routing

```jsx
Routes:
  / - Landing Page (public)
  /login - Login (public)
  /code - Public Code Editor (public)
  
  /dashboard - Dashboard (protected)
  /admin/* - Admin routes (ADMIN only)
  /instructor/* - Instructor routes (INSTRUCTOR only)
  /student/* - Student routes (STUDENT only)
```

---

## 🔐 Authentication

```jsx
// Usage
const { user, login, logout, isAuthenticated } = useAuth();

// Login
await login(email, password);

// Access user
console.log(user.role); // ADMIN, INSTRUCTOR, STUDENT

// Logout
await logout();
```

---

## 🌐 API Integration

```javascript
// services/api.js
const api = axios.create({
  baseURL: 'http://localhost:3000',
  withCredentials: true
});

// Auto-attach token
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
```

---

## 💻 Code Editor

**Monaco Editor Features:**
- Multi-language support (Python, JS, Java, C++, C)
- Syntax highlighting
- IntelliSense
- Theme selection
- Code execution
- Input/Output panels

```jsx
<Editor
  language={language}
  value={code}
  onChange={setCode}
  theme="vs-dark"
  options={{
    fontSize: 14,
    minimap: { enabled: true }
  }}
/>
```

---

## 📱 Responsive Design

**Breakpoints:**
```
sm: 640px  (mobile)
md: 768px  (tablet)
lg: 1024px (laptop)
xl: 1280px (desktop)
```

**Patterns:**
```jsx
// Responsive grid
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

// Responsive text
<h1 className="text-3xl sm:text-4xl lg:text-6xl">

// Hide on mobile
<div className="hidden lg:block">

// Mobile menu
<button className="lg:hidden">
```

---

## 🎨 Styling

**TailwindCSS + Glassmorphism:**
```jsx
<div className="backdrop-blur-xl bg-white/60 border border-white/40 rounded-2xl p-8 shadow-2xl">
```

**Global Styles:**
- Smooth scrolling
- Custom animations
- Fade-in effects
- Responsive utilities

---

## ⚡ Performance

**Optimizations:**
- Code splitting with lazy loading
- Memoization (useMemo, useCallback)
- Virtual scrolling for large lists
- Optimized bundle chunks

```jsx
// Lazy load
const AdminUsers = lazy(() => import('./pages/admin/Users'));

// Memoize
const sorted = useMemo(() => data.sort(), [data]);
```

---

## 🚀 Deployment

```bash
# Build
yarn build

# Preview
yarn preview
```

**Output:** `dist/` folder ready for deployment

**Deploy to:**
- Netlify / Vercel (automatic)
- Nginx / Apache (static)
- CDN

**Nginx Config:**
```nginx
location / {
    try_files $uri /index.html;
}
```

---

## 📦 Dependencies

**Core:**
- react, react-dom, react-router-dom
- vite
- axios
- @monaco-editor/react

**UI:**
- tailwindcss
- lucide-react (icons)
- react-toastify (notifications)

**Utilities:**
- class-variance-authority
- clsx, tailwind-merge

---

## 🔧 Scripts

```bash
yarn dev          # Development server
yarn build        # Production build
yarn preview      # Preview build
yarn lint         # Run ESLint
```

---

## 📞 Support

- Check browser console for errors
- Verify API URL in .env
- Clear cache if issues persist
- Review component documentation

---

<div align="center">

**Modern React Frontend**

*Fast • Responsive • Beautiful*

</div>
