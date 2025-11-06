# Role-Based Access Control (RBAC) Guide

## Overview

This application implements comprehensive Role-Based Access Control (RBAC) with three distinct user roles:
- **ADMIN**: Full system administration capabilities
- **INSTRUCTOR**: Course and assignment management
- **STUDENT**: Assignment submission and progress tracking

## Architecture

### Middleware Components

#### 1. Authentication Middleware (`authenticate`)
Located in: `/src/middlewares/authMiddleware.js`

Verifies JWT tokens from:
- HTTP-only cookies
- Authorization header (`Bearer <token>`)

**Usage:**
```javascript
router.get('/protected', authenticate, handler);
```

#### 2. Authorization Middleware (`authorize`)
Located in: `/src/middlewares/authMiddleware.js`

Checks if authenticated user has required role(s).

**Usage:**
```javascript
// Single role
router.get('/admin-only', authenticate, authorize('ADMIN'), handler);

// Multiple roles
router.get('/staff', authenticate, authorize('ADMIN', 'INSTRUCTOR'), handler);
```

## API Routes by Role

### 🔐 Authentication Routes
**Prefix:** `/api/auth`
**Access:** Public

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/login` | User login |
| POST | `/register` | Registration (disabled) |
| GET | `/me` | Get current user info (protected) |
| POST | `/logout` | Logout user (protected) |

---

### 👮 Admin Routes
**Prefix:** `/api/admin`
**Access:** ADMIN only

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/users` | Get all users with pagination |
| POST | `/users` | Create a new user |
| DELETE | `/users/:id` | Delete a user |
| POST | `/users/import/csv` | Import users from CSV |
| POST | `/users/import/sql` | Import users from SQL export |
| GET | `/users/export/csv` | Export all users to CSV |

**Example Request:**
```bash
curl -X GET http://localhost:3000/api/admin/users \
  -H "Authorization: Bearer <admin_token>"
```

---

### 👨‍🏫 Instructor Routes
**Prefix:** `/api/instructor`
**Access:** INSTRUCTOR only

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/profile` | Get instructor profile with sections |
| GET | `/sections` | Get all sections for the instructor |
| GET | `/assignments` | Get all assignments for instructor's sections |
| POST | `/assignments` | Create a new assignment |
| PUT | `/assignments/:assignmentId` | Update an assignment |
| DELETE | `/assignments/:assignmentId` | Delete an assignment |
| GET | `/assignments/:assignmentId/submissions` | Get all submissions for an assignment |

**Example: Create Assignment**
```bash
curl -X POST http://localhost:3000/api/instructor/assignments \
  -H "Authorization: Bearer <instructor_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Python Basics",
    "description": "Introduction to Python programming",
    "starterCode": {"language": "python", "code": "# Write your code here"},
    "dueDate": "2025-12-31T23:59:59Z",
    "sectionId": "section-uuid"
  }'
```

---

### 🎓 Student Routes
**Prefix:** `/api/student`
**Access:** STUDENT only

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/profile` | Get student profile with enrollment info |
| GET | `/assignments` | Get all assignments for student's section |
| GET | `/assignments/:assignmentId` | Get a specific assignment with submissions |
| POST | `/submissions` | Submit code for an assignment |
| GET | `/submissions` | Get all submissions for the student |
| GET | `/assignments/:assignmentId/submissions` | Get submissions for specific assignment |

**Example: Submit Assignment**
```bash
curl -X POST http://localhost:3000/api/student/submissions \
  -H "Authorization: Bearer <student_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "assignmentId": "assignment-uuid",
    "submittedCode": {"language": "python", "code": "print(\"Hello World\")"},
    "executionResult": {"status": "success", "output": "Hello World"}
  }'
```

---

## Role Verification Matrix

| Route | ADMIN | INSTRUCTOR | STUDENT | No Auth |
|-------|-------|------------|---------|---------|
| `/api/auth/login` | ✅ | ✅ | ✅ | ✅ |
| `/api/admin/*` | ✅ | ❌ 403 | ❌ 403 | ❌ 401 |
| `/api/instructor/*` | ❌ 403 | ✅ | ❌ 403 | ❌ 401 |
| `/api/student/*` | ❌ 403 | ❌ 403 | ✅ | ❌ 401 |

**Legend:**
- ✅ Allowed
- ❌ 401: Unauthorized (no token)
- ❌ 403: Forbidden (wrong role)

---

## Testing RBAC

### Automated Testing
Run the comprehensive RBAC test suite:

```bash
# Start the server first
npm run dev

# In another terminal, run RBAC tests
npm run test:rbac
```

The test script will verify:
- ✅ Each role can access their designated routes
- ✅ Each role is blocked from other roles' routes
- ✅ Unauthenticated requests are properly rejected
- ✅ Proper HTTP status codes (200, 401, 403)

### Manual Testing with cURL

#### 1. Login as different roles:
```bash
# Admin
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@school.edu", "password": "admin123"}'

# Instructor
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "teacher1@school.edu", "password": "password123"}'

# Student
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "student1@school.edu", "password": "password123"}'
```

#### 2. Test cross-role access:
```bash
# Try accessing admin route with student token (should get 403)
curl -X GET http://localhost:3000/api/admin/users \
  -H "Authorization: Bearer <student_token>"

# Try accessing instructor route with admin token (should get 403)
curl -X GET http://localhost:3000/api/instructor/profile \
  -H "Authorization: Bearer <admin_token>"
```

---

## Security Best Practices

### 1. Token Management
- Tokens are stored in HTTP-only cookies (immune to XSS)
- Tokens also accepted via Authorization header for API clients
- Token expiration: 2 hours (configurable via `JWT_EXPIRES_IN`)

### 2. Password Security
- Passwords hashed with bcrypt (10 salt rounds)
- Never returned in API responses
- Minimum security enforced at application level

### 3. Role Enforcement
- Role checked on EVERY protected route
- Roles stored in JWT payload
- Cannot be modified by client

### 4. Error Messages
- Generic error messages in production
- Detailed errors only in development mode
- No user enumeration vulnerabilities

---

## Implementation Details

### File Structure
```
src/
├── controllers/
│   ├── authController.js      # Authentication logic
│   ├── adminController.js     # Admin operations
│   ├── instructorController.js # Instructor operations
│   └── studentController.js    # Student operations
├── middlewares/
│   ├── authMiddleware.js      # authenticate & authorize
│   └── loggerMiddleware.js    # Request logging
├── routes/
│   ├── authRoutes.js          # Public auth routes
│   ├── adminRoutes.js         # Admin-only routes
│   ├── instructorRoutes.js    # Instructor-only routes
│   └── studentRoutes.js       # Student-only routes
└── utils/
    └── jwtUtils.js            # JWT creation & verification
```

### Adding New Protected Routes

**Example: Add instructor lesson route**

1. **Create controller function** (`instructorController.js`):
```javascript
export async function createLesson(req, res) {
  const userId = req.user.userId; // From authenticate middleware
  const role = req.user.role;     // From JWT payload
  // ... implementation
}
```

2. **Add route** (`instructorRoutes.js`):
```javascript
router.post('/lessons', createLesson);
// RBAC already applied via router.use(authenticate, authorize('INSTRUCTOR'))
```

3. **No additional RBAC needed** - already protected by route-level middleware!

---

## Troubleshooting

### Issue: Getting 401 Unauthorized
**Causes:**
- No token provided
- Token expired
- Invalid token signature

**Solutions:**
- Check if token is included in request
- Login again to get fresh token
- Verify JWT_SECRET matches between token creation and verification

### Issue: Getting 403 Forbidden
**Causes:**
- User has wrong role for the route
- User is authenticated but not authorized

**Solutions:**
- Verify user role: `GET /api/auth/me`
- Check if route requires different role
- Admin users cannot access student/instructor routes by design

### Issue: Token not working
**Causes:**
- JWT_SECRET changed after token was issued
- Token was generated with different secret

**Solutions:**
- Regenerate JWT_SECRET
- All users must login again
- Clear browser cookies

---

## Example Workflow

### Instructor Creating and Managing Assignments

1. **Login as instructor:**
```bash
POST /api/auth/login
Body: { "email": "teacher1@school.edu", "password": "password123" }
Response: { "token": "...", "user": {...} }
```

2. **Get instructor profile:**
```bash
GET /api/instructor/profile
Headers: { "Authorization": "Bearer <token>" }
Response: { instructor profile with sections }
```

3. **Create assignment:**
```bash
POST /api/instructor/assignments
Body: { "title": "...", "sectionId": "..." }
Response: { "success": true, "data": {...} }
```

4. **View submissions:**
```bash
GET /api/instructor/assignments/{id}/submissions
Response: [ array of student submissions ]
```

### Student Submitting Assignment

1. **Login as student:**
```bash
POST /api/auth/login
```

2. **View available assignments:**
```bash
GET /api/student/assignments
```

3. **Submit code:**
```bash
POST /api/student/submissions
Body: { "assignmentId": "...", "submittedCode": {...} }
```

4. **Check submission history:**
```bash
GET /api/student/submissions
```

---

## Next Steps

- ✅ Phase 3 Complete: RBAC fully implemented
- 🔄 Consider adding: Grade management for instructors
- 🔄 Consider adding: Real-time notifications
- 🔄 Consider adding: Assignment templates
- 🔄 Consider adding: Batch operations for admin

---

## Support

For issues or questions about RBAC implementation:
1. Check test output: `npm run test:rbac`
2. Review logs in `./logs/`
3. Verify database schema matches Prisma schema
4. Check `.env` configuration
