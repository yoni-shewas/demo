# Role-Based Dashboard Features

## Overview
The CodeLan LMS now features comprehensive role-based dashboards that dynamically adjust based on user roles (Admin, Instructor, Student).

## Features Implemented

### 🎯 Shared Components
- **Dynamic Routing**: `Dashboard.jsx` automatically routes to role-specific dashboards
- **Role-Based Sidebar**: Navigation menu adapts to show relevant options per role
- **API Services**: Separate service modules for Admin, Instructor, and Student operations

### 👑 Admin Dashboard (`/dashboard` - ADMIN role)

#### Features:
1. **User Management**
   - View all users in a comprehensive table
   - Create new users (Students, Instructors, Admins)
   - Edit user details inline (name, email, role)
   - Delete users with confirmation
   - User role badges with color coding

2. **Statistics Overview**
   - Total Users count
   - Instructors count
   - Students count
   - Admins count

3. **Data Export**
   - Export users to CSV format
   - Export users to SQL format
   - Automatic file download with timestamps

4. **User Registration Modal**
   - Full user creation form
   - Fields: Username, First Name, Last Name, Email, Password, Role
   - Form validation
   - Real-time feedback

#### API Endpoints Used:
- `GET /api/admin/users` - Fetch all users
- `POST /api/admin/users` - Create new user
- `PUT /api/admin/users/:id` - Update user
- `DELETE /api/admin/users/:id` - Delete user
- `GET /api/admin/users/export/csv` - Export CSV
- `GET /api/admin/users/export/sql` - Export SQL
- `GET /api/admin/stats` - Dashboard statistics

### 👨‍🏫 Instructor Dashboard (`/dashboard` - INSTRUCTOR role)

#### Features:
1. **Statistics Overview**
   - Total Lessons count
   - Active Assignments count
   - Total Assignments count

2. **Recent Lessons**
   - Display last 5 lessons
   - Quick edit access
   - Creation date display
   - Empty state with create button

3. **Upcoming Assignments**
   - Grid view of active assignments
   - Due date display
   - Assignment descriptions
   - Status badges

4. **Quick Links**
   - Create New Lesson
   - Create Assignment
   - View Students

#### API Endpoints Used:
- `GET /api/instructor/profile` - Instructor profile
- `GET /api/instructor/lessons` - All lessons
- `POST /api/instructor/lessons` - Create lesson
- `GET /api/instructor/assignments` - All assignments
- `POST /api/instructor/assignments` - Create assignment
- `GET /api/instructor/stats` - Dashboard statistics

### 👨‍🎓 Student Dashboard (`/dashboard` - STUDENT role)

#### Features:
1. **Statistics Overview**
   - Total Assignments count
   - Pending Assignments count
   - Completed Assignments count
   - Total Submissions count

2. **Pending Assignments**
   - List of incomplete assignments
   - Due date countdown
   - Urgency indicators (due in 2 days or less)
   - Quick start button

3. **Recent Submissions**
   - Table view of last 5 submissions
   - Submission dates
   - Grading status
   - Grade display

4. **Progress Tracking**
   - Overall completion rate percentage
   - Visual progress bar
   - Dynamic calculation

5. **Quick Links**
   - Start Coding
   - View Assignments
   - My Submissions

#### API Endpoints Used:
- `GET /api/student/profile` - Student profile
- `GET /api/student/lessons` - Enrolled lessons
- `GET /api/student/assignments` - All assignments
- `GET /api/student/submissions` - Submission history
- `POST /api/student/submissions` - Submit assignment
- `GET /api/student/stats` - Dashboard statistics

## File Structure

```
frontend/src/
├── pages/
│   ├── Dashboard.jsx           # Main router for role-based dashboards
│   ├── AdminDashboard.jsx      # Admin-specific dashboard
│   ├── InstructorDashboard.jsx # Instructor-specific dashboard
│   └── StudentDashboard.jsx    # Student-specific dashboard
├── services/
│   ├── adminService.js         # Admin API calls
│   ├── instructorService.js    # Instructor API calls
│   └── studentService.js       # Student API calls
├── components/
│   └── Sidebar.jsx             # Updated with role-based navigation
└── context/
    └── AuthContext.jsx         # User authentication and role management
```

## Navigation Structure

### Admin Navigation:
- Dashboard
- User Management
- Code Editor
- Assignments
- Submissions
- Students
- Sections

### Instructor Navigation:
- Dashboard
- Lessons
- Assignments
- Students
- Sections

### Student Navigation:
- Dashboard
- Code Editor
- Assignments
- My Submissions

## Authentication Flow

1. User logs in via `/login`
2. `AuthContext` calls `/api/auth/me` to verify token
3. User role is retrieved and stored in context
4. Dashboard routes to appropriate role-specific view
5. Sidebar displays role-appropriate navigation

## Usage Examples

### Creating a User (Admin)
```javascript
// Click "Register User" button
// Fill in the modal form
// Submit creates user via POST /api/admin/users
```

### Exporting Data (Admin)
```javascript
// Click "Export Users CSV" or "Export Users SQL"
// File downloads automatically with timestamp
```

### Viewing Progress (Student)
```javascript
// Dashboard automatically calculates:
// - Pending assignments (not yet submitted)
// - Completed assignments (with grades)
// - Completion percentage
```

## Error Handling

All dashboards include:
- Loading states
- Error boundaries
- Graceful degradation if API endpoints return errors
- User-friendly error messages
- Confirmation dialogs for destructive actions

## Future Enhancements

Potential additions:
- [ ] Bulk user import via CSV
- [ ] Advanced user filtering and search
- [ ] Real-time notifications
- [ ] Analytics and reporting
- [ ] Assignment deadline notifications
- [ ] Grade analytics for students
- [ ] Performance metrics for instructors
- [ ] System-wide settings for admins

## Notes

- The `@theme` CSS warning in `index.css` is cosmetic (IDE linting issue with Tailwind v4)
- All dashboards are fully responsive
- Data is loaded asynchronously with loading states
- Export functions handle blob downloads client-side
