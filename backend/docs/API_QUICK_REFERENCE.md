# API Quick Reference Card

## 🔐 Authentication

### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}

Response: { "token": "jwt_token", "user": {...} }
```

### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <token>

Response: { "userId": "...", "email": "...", "role": "..." }
```

---

## 👮 Admin Endpoints

**Base URL**: `/api/admin`  
**Required Role**: `ADMIN`  
**Auth Header**: `Authorization: Bearer <admin_token>`

```http
# List Users
GET /api/admin/users?page=1&limit=10&role=STUDENT

# Create User
POST /api/admin/users
Body: { "email": "...", "username": "...", "password": "...", "role": "STUDENT" }

# Delete User
DELETE /api/admin/users/:userId

# Import CSV
POST /api/admin/users/import/csv
Content-Type: multipart/form-data
Body: file=@users.csv

# Export CSV
GET /api/admin/users/export/csv
```

---

## 👨‍🏫 Instructor Endpoints

**Base URL**: `/api/instructor`  
**Required Role**: `INSTRUCTOR`  
**Auth Header**: `Authorization: Bearer <instructor_token>`

```http
# Get Profile
GET /api/instructor/profile

# Get Sections
GET /api/instructor/sections

# Get All Assignments
GET /api/instructor/assignments

# Create Assignment
POST /api/instructor/assignments
Body: {
  "title": "Assignment Title",
  "description": "Description",
  "starterCode": { "language": "python", "code": "..." },
  "dueDate": "2025-12-31T23:59:59Z",
  "sectionId": "section-uuid"
}

# Update Assignment
PUT /api/instructor/assignments/:assignmentId
Body: { "title": "...", "description": "...", "dueDate": "..." }

# Delete Assignment
DELETE /api/instructor/assignments/:assignmentId

# Get Assignment Submissions
GET /api/instructor/assignments/:assignmentId/submissions
```

---

## 🎓 Student Endpoints

**Base URL**: `/api/student`  
**Required Role**: `STUDENT`  
**Auth Header**: `Authorization: Bearer <student_token>`

```http
# Get Profile
GET /api/student/profile

# Get Available Assignments
GET /api/student/assignments

# Get Specific Assignment
GET /api/student/assignments/:assignmentId

# Submit Assignment
POST /api/student/submissions
Body: {
  "assignmentId": "assignment-uuid",
  "submittedCode": { "language": "python", "code": "..." },
  "executionResult": { "status": "success", "output": "..." }
}

# Get All Submissions
GET /api/student/submissions

# Get Assignment Submissions
GET /api/student/assignments/:assignmentId/submissions
```

---

## 📋 Response Codes

| Code | Meaning | Description |
|------|---------|-------------|
| 200 | OK | Request successful |
| 201 | Created | Resource created successfully |
| 400 | Bad Request | Invalid request data |
| 401 | Unauthorized | No token or invalid token |
| 403 | Forbidden | Valid token but wrong role |
| 404 | Not Found | Resource not found |
| 500 | Server Error | Internal server error |

---

## 🔑 Test Credentials

### Admin
- Email: `admin@school.edu`
- Password: `admin123`

### Instructor
- Email: `teacher1@school.edu`
- Password: `password123`

### Student
- Email: `student1@school.edu`
- Password: `password123`

---

## 🧪 Testing Commands

```bash
# Start server
npm run dev

# Run RBAC tests (in new terminal)
npm run test:rbac

# Check database users
node scripts/checkUsers.js

# Create admin
npm run create-admin
```

---

## 📝 Example Workflows

### Creating an Assignment (Instructor)

1. **Login**:
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"teacher1@school.edu","password":"password123"}'
```

2. **Get Section ID**:
```bash
curl http://localhost:3000/api/instructor/sections \
  -H "Authorization: Bearer <token>"
```

3. **Create Assignment**:
```bash
curl -X POST http://localhost:3000/api/instructor/assignments \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Python Basics",
    "description": "Learn Python fundamentals",
    "sectionId": "section-uuid-from-step-2"
  }'
```

### Submitting Assignment (Student)

1. **Login**:
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"student1@school.edu","password":"password123"}'
```

2. **Get Assignments**:
```bash
curl http://localhost:3000/api/student/assignments \
  -H "Authorization: Bearer <token>"
```

3. **Submit Code**:
```bash
curl -X POST http://localhost:3000/api/student/submissions \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "assignmentId": "assignment-uuid-from-step-2",
    "submittedCode": {
      "language": "python",
      "code": "print(\"Hello World\")"
    }
  }'
```

---

## 🔒 Security Notes

- All protected routes require JWT token
- Tokens expire after 2 hours (configurable)
- Tokens stored in HTTP-only cookies + Authorization header
- Passwords are bcrypt-hashed
- Role checked on every request
- Cross-role access is blocked (403)

---

## 📚 Documentation

- **Full Guide**: `RBAC_GUIDE.md`
- **Phase 3 Summary**: `PHASE3_COMPLETE.md`
- **Admin API**: `ADMIN_API_DOCS.md`
- **Testing**: `API_TESTING.md`
