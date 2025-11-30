# 🔧 Backend Documentation - SMU Code Platform

> **Complete API Reference and Backend Architecture Guide**

[![Node.js](https://img.shields.io/badge/Node.js-18+-green)]()
[![Express](https://img.shields.io/badge/Express-4.19-lightgrey)]()
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14+-blue)]()
[![Prisma](https://img.shields.io/badge/Prisma-5.22-purple)]()

---

## 📋 Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Configuration](#configuration)
- [Database Schema](#database-schema)
- [API Endpoints](#api-endpoints)
- [Authentication](#authentication)
- [Role-Based Access Control](#role-based-access-control)
- [Code Execution](#code-execution)
- [File Management](#file-management)
- [Error Handling](#error-handling)
- [Security](#security)
- [Testing](#testing)
- [Deployment](#deployment)

---

## 🌟 Overview

The backend is a **RESTful API server** built with Node.js and Express, providing secure authentication, role-based access control, and comprehensive learning management features.

### Key Capabilities

- 🔐 **JWT Authentication** - Secure token-based authentication
- 👥 **User Management** - Admin-controlled user creation and management
- 📚 **Course Management** - Lessons, assignments, and submissions
- 💻 **Code Execution** - Multi-language code execution via Judge0
- 📤 **File Uploads** - Secure file handling with Multer
- 📊 **CSV Import/Export** - Bulk user operations
- 🔒 **RBAC** - Three-tier role system (Admin, Instructor, Student)
- 📝 **Logging** - Comprehensive logging with Winston
- 🛡️ **Security** - Rate limiting, CORS, Helmet protection

---

## 🏗️ Architecture

### Layered Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Client Layer                             │
│              (Frontend React Application)                    │
└─────────────────────────────────────────────────────────────┘
                            ↓ HTTP/HTTPS
┌─────────────────────────────────────────────────────────────┐
│                  Security Middleware Layer                   │
│  • Helmet (Headers)    • CORS           • Rate Limiting     │
│  • Error Handler       • Request Logger                     │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│               Authentication Middleware Layer                │
│  • JWT Verification    • Token Validation                   │
│  • Role Authorization  • Session Management                 │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                      Route Layer                             │
│  /api/auth  /api/admin  /api/instructor  /api/student       │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                   Controller Layer                           │
│  • Business Logic      • Input Validation                   │
│  • Data Processing     • Response Formatting                │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    Service Layer                             │
│  • Database Operations • External API Calls                 │
│  • File Operations    • Code Execution                      │
└─────────────────────────────────────────────────────────────┘
                    ↓               ↓
      ┌─────────────────┐  ┌────────────────┐
      │  PostgreSQL DB  │  │  Judge0 API    │
      │  (via Prisma)   │  │  (Docker)      │
      └─────────────────┘  └────────────────┘
```

---

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/                    # Configuration files
│   │   ├── database.js           # Database connection
│   │   ├── logger.js             # Winston logger setup
│   │   └── rateLimit.js          # Rate limiting configs
│   │
│   ├── controllers/               # Request handlers
│   │   ├── authController.js     # Authentication logic
│   │   ├── adminController.js    # Admin operations
│   │   ├── instructorController.js
│   │   ├── studentController.js
│   │   └── codeController.js     # Code execution
│   │
│   ├── middlewares/               # Express middlewares
│   │   ├── authMiddleware.js     # JWT verification
│   │   ├── roleMiddleware.js     # RBAC enforcement
│   │   └── errorMiddleware.js    # Global error handler
│   │
│   ├── routes/                    # API routes
│   │   ├── authRoutes.js         # /api/auth/*
│   │   ├── adminRoutes.js        # /api/admin/*
│   │   ├── instructorRoutes.js   # /api/instructor/*
│   │   ├── studentRoutes.js      # /api/student/*
│   │   └── codeRoutes.js         # /api/code/*
│   │
│   ├── services/                  # Business logic
│   │   ├── authService.js        # Auth operations
│   │   ├── userService.js        # User CRUD
│   │   └── codeExecutionService.js
│   │
│   └── utils/                     # Helper utilities
│       ├── jwtUtils.js           # JWT creation/validation
│       ├── fileUtils.js          # File operations
│       └── csvUtils.js           # CSV processing
│
├── prisma/
│   ├── schema.prisma             # Database schema
│   ├── migrations/               # Database migrations
│   └── seed.js                   # Database seeder
│
├── scripts/
│   ├── createAdmin.js            # Admin creation
│   ├── testRBAC.js              # RBAC testing
│   └── testIntegration.js        # Integration tests
│
├── docker/                        # Docker configs
│   └── docker-compose.yml        # Judge0 setup
│
├── docs/                          # Documentation
│   ├── SYSTEM_OVERVIEW.md
│   ├── API_TESTING.md
│   ├── ADMIN_API_DOCS.md
│   └── RBAC_GUIDE.md
│
├── uploads/                       # File uploads
├── temp_code/                     # Temporary code files
├── logs/                          # Application logs
├── backups/                       # Database backups
│
├── server.js                      # Entry point
├── package.json                   # Dependencies
├── .env                           # Environment variables
└── README.md                      # Backend README
```

---

## 🚀 Installation

### Prerequisites

- Node.js v18 or higher
- PostgreSQL v14 or higher
- Yarn package manager
- Docker (for Judge0)

### Step-by-Step Setup

#### 1. Install Dependencies

```bash
cd backend
yarn install
```

#### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/codelan?schema=public"

# Server
NODE_ENV=development
PORT=3000

# JWT Authentication
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRES_IN=7d

# Judge0 Code Execution
JUDGE0_API_URL=http://localhost:2358

# File Upload
MAX_FILE_SIZE=10485760  # 10MB in bytes
UPLOAD_DIR=./uploads

# Rate Limiting
ENABLE_RATE_LIMIT=true

# Logging
LOG_LEVEL=info
```

#### 3. Setup Database

```bash
# Generate Prisma client
yarn prisma:generate

# Run migrations
yarn prisma:migrate

# Optional: Seed with test data
yarn prisma:seed
```

#### 4. Create Admin User

```bash
# Default admin (admin@school.edu / admin123)
yarn create-admin

# Or custom credentials
yarn create-admin custom@email.com password123 customusername
```

#### 5. Setup Judge0 (Optional)

```bash
cd docker
docker-compose up -d
```

#### 6. Start Server

```bash
# Development mode
yarn dev

# Production mode
yarn start
```

Server will be running at **http://localhost:3000**

---

## ⚙️ Configuration

### Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `DATABASE_URL` | PostgreSQL connection string | - | ✅ |
| `NODE_ENV` | Environment (development/production) | development | ✅ |
| `PORT` | Server port | 3000 | ✅ |
| `JWT_SECRET` | Secret for JWT signing | - | ✅ |
| `JWT_EXPIRES_IN` | Token expiration time | 7d | ✅ |
| `JUDGE0_API_URL` | Judge0 API endpoint | http://localhost:2358 | ❌ |
| `MAX_FILE_SIZE` | Max upload size in bytes | 10485760 | ❌ |
| `ENABLE_RATE_LIMIT` | Enable rate limiting | true | ❌ |
| `LOG_LEVEL` | Logging level | info | ❌ |

### Rate Limiting Tiers

```javascript
// Tier 1: Authentication (Strictest)
- Login: 5 requests per 15 minutes
- Register: 3 requests per 15 minutes

// Tier 2: Write Operations (Strict)
- Create/Update/Delete: 30 requests per minute

// Tier 3: Read Operations (Moderate)
- GET requests: 100 requests per minute

// Tier 4: Code Execution (Special)
- Code runs: 10 requests per minute

// Tier 5: General (Lenient)
- Other endpoints: 200 requests per minute
```

---

## 🗄️ Database Schema

### Core Models

#### User Model
```prisma
model User {
  id            String    @id @default(uuid())
  email         String    @unique
  username      String    @unique
  password      String
  role          Role      @default(STUDENT)
  firstName     String?
  lastName      String?
  isActive      Boolean   @default(true)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  // Relations
  admin         Admin?
  instructor    Instructor?
  student       Student?
  sessions      Session[]
}

enum Role {
  ADMIN
  INSTRUCTOR
  STUDENT
}
```

#### Student Model
```prisma
model Student {
  id           String       @id @default(uuid())
  userId       String       @unique
  studentId    String?      @unique  // School-assigned ID
  sectionId    String?
  
  user         User         @relation(fields: [userId], references: [id])
  section      Section?     @relation(fields: [sectionId], references: [id])
  submissions  Submission[]
  lessonViews  LessonView[]
}
```

#### Instructor Model
```prisma
model Instructor {
  id           String       @id @default(uuid())
  userId       String       @unique
  department   String?
  
  user         User         @relation(fields: [userId], references: [id])
  sections     Section[]
  lessons      Lesson[]
  assignments  Assignment[]
}
```

#### Section Model
```prisma
model Section {
  id           String       @id @default(uuid())
  name         String
  code         String       @unique
  semester     String
  year         Int
  instructorId String?
  batchId      String?
  
  instructor   Instructor?  @relation(fields: [instructorId], references: [id])
  batch        Batch?       @relation(fields: [batchId], references: [id])
  students     Student[]
  assignments  Assignment[]
  lessons      Lesson[]
}
```

#### Assignment Model
```prisma
model Assignment {
  id           String       @id @default(uuid())
  title        String
  description  String
  dueDate      DateTime
  maxPoints    Int          @default(100)
  sectionId    String
  instructorId String
  language     String?
  solutionCode String?
  
  section      Section      @relation(fields: [sectionId], references: [id])
  instructor   Instructor   @relation(fields: [instructorId], references: [id])
  submissions  Submission[]
  
  createdAt    DateTime     @default(now())
  updatedAt    DateTime     @updatedAt
}
```

#### Submission Model
```prisma
model Submission {
  id           String       @id @default(uuid())
  assignmentId String
  studentId    String
  code         String
  language     String
  output       String?
  status       SubmissionStatus @default(PENDING)
  score        Int?
  feedback     String?
  
  assignment   Assignment   @relation(fields: [assignmentId], references: [id])
  student      Student      @relation(fields: [studentId], references: [id])
  
  submittedAt  DateTime     @default(now())
}

enum SubmissionStatus {
  PENDING
  GRADED
  LATE
}
```

#### Lesson Model
```prisma
model Lesson {
  id           String       @id @default(uuid())
  title        String
  content      String
  filePath     String?
  sectionId    String?
  instructorId String
  order        Int          @default(0)
  
  section      Section?     @relation(fields: [sectionId], references: [id])
  instructor   Instructor   @relation(fields: [instructorId], references: [id])
  views        LessonView[]
  
  createdAt    DateTime     @default(now())
  updatedAt    DateTime     @updatedAt
}
```

### Relationships

```
User (1) ─── (1) Admin
User (1) ─── (1) Instructor
User (1) ─── (1) Student

Instructor (1) ─── (N) Section
Instructor (1) ─── (N) Lesson
Instructor (1) ─── (N) Assignment

Section (1) ─── (N) Student
Section (1) ─── (N) Assignment
Section (1) ─── (N) Lesson

Student (1) ─── (N) Submission
Assignment (1) ─── (N) Submission

Batch (1) ─── (N) Section
```

---

## 🔌 API Endpoints

### Authentication Routes (`/api/auth`)

#### POST `/api/auth/login`
Login with email and password.

**Request:**
```json
{
  "email": "admin@school.edu",
  "password": "admin123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "id": "uuid",
    "email": "admin@school.edu",
    "username": "admin",
    "role": "ADMIN",
    "firstName": "Admin",
    "lastName": "User"
  },
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

#### GET `/api/auth/me`
Get current user profile (requires authentication).

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "email": "admin@school.edu",
    "role": "ADMIN",
    "profile": {...}
  }
}
```

#### POST `/api/auth/logout`
Logout current user.

**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

### Admin Routes (`/api/admin`)

**All routes require ADMIN role**

#### User Management

##### POST `/api/admin/users`
Create a new user.

**Request:**
```json
{
  "username": "student1",
  "email": "student1@school.edu",
  "password": "student123",
  "role": "STUDENT",
  "firstName": "John",
  "lastName": "Doe",
  "studentId": "STU2024001"
}
```

##### GET `/api/admin/users`
Get all users with pagination.

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 50)
- `role`: Filter by role (ADMIN, INSTRUCTOR, STUDENT)
- `search`: Search by name, email, or username

**Response:**
```json
{
  "success": true,
  "users": [...],
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 50,
    "pages": 2
  }
}
```

##### PUT `/api/admin/users/:id`
Update user information.

##### DELETE `/api/admin/users/:id`
Delete a user (soft delete).

#### Bulk Operations

##### POST `/api/admin/users/import/csv`
Import users from CSV file.

**Request:** `multipart/form-data`
```
file: <CSV file>
```

**CSV Format:**
```csv
email,username,password,role,firstName,lastName,studentId
student1@school.edu,student1,pass123,STUDENT,John,Doe,STU001
```

**Response:**
```json
{
  "success": true,
  "message": "50 users imported successfully",
  "imported": 50,
  "failed": 0,
  "errors": []
}
```

##### GET `/api/admin/users/export/csv`
Export all users to CSV format.

**Response:** CSV file download

#### Batch Management

##### POST `/api/admin/batches`
Create a new batch.

```json
{
  "name": "Batch 2024",
  "year": 2024,
  "startDate": "2024-01-15",
  "endDate": "2024-12-15"
}
```

##### GET `/api/admin/batches`
Get all batches.

##### PUT `/api/admin/batches/:id`
Update batch information.

##### DELETE `/api/admin/batches/:id`
Delete a batch.

#### Lesson Management

##### POST `/api/admin/lessons`
Create a new lesson (with file upload).

**Request:** `multipart/form-data`
```
title: Introduction to Python
content: Lesson description
file: <PDF file>
sectionId: <section-uuid>
```

##### GET `/api/admin/lessons`
Get all lessons.

##### DELETE `/api/admin/lessons/:id`
Delete a lesson.

---

### Instructor Routes (`/api/instructor`)

**All routes require INSTRUCTOR role**

#### Lesson Management

##### POST `/api/instructor/lessons`
Create a lesson for instructor's section.

##### GET `/api/instructor/lessons`
Get instructor's lessons.

##### PUT `/api/instructor/lessons/:id`
Update lesson content.

#### Assignment Management

##### POST `/api/instructor/assignments`
Create a new assignment.

```json
{
  "title": "Python Basics Assignment",
  "description": "Complete the following tasks...",
  "dueDate": "2024-12-31T23:59:59Z",
  "maxPoints": 100,
  "sectionId": "<section-uuid>",
  "language": "python",
  "solutionCode": "def solution():\n    return 42"
}
```

##### GET `/api/instructor/assignments`
Get instructor's assignments.

##### PUT `/api/instructor/assignments/:id`
Update assignment details.

#### Submission Management

##### GET `/api/instructor/submissions`
Get submissions for instructor's assignments.

**Query Parameters:**
- `assignmentId`: Filter by assignment
- `status`: Filter by status (PENDING, GRADED, LATE)

##### PUT `/api/instructor/submissions/:id/grade`
Grade a student submission.

```json
{
  "score": 95,
  "feedback": "Excellent work! Consider optimizing the loop."
}
```

---

### Student Routes (`/api/student`)

**All routes require STUDENT role**

#### View Content

##### GET `/api/student/lessons`
Get assigned lessons.

##### GET `/api/student/lessons/:id`
Get specific lesson details.

##### GET `/api/student/assignments`
Get assigned assignments.

```json
{
  "success": true,
  "assignments": [
    {
      "id": "uuid",
      "title": "Python Basics",
      "description": "...",
      "dueDate": "2024-12-31T23:59:59Z",
      "maxPoints": 100,
      "submitted": false
    }
  ]
}
```

#### Submit Work

##### POST `/api/student/submissions`
Submit assignment solution.

```json
{
  "assignmentId": "<assignment-uuid>",
  "code": "def solution():\n    return 42",
  "language": "python"
}
```

##### GET `/api/student/submissions`
Get student's submissions.

##### GET `/api/student/submissions/:id`
Get specific submission details.

#### Profile

##### GET `/api/student/profile`
Get student profile with stats.

```json
{
  "success": true,
  "profile": {
    "id": "uuid",
    "studentId": "STU2024001",
    "section": {...},
    "stats": {
      "totalAssignments": 10,
      "completed": 8,
      "pending": 2,
      "averageScore": 87.5
    }
  }
}
```

---

### Code Execution Routes (`/api/code`)

**Available to all authenticated users**

#### POST `/api/code/run`
Execute code in specified language.

**Request:**
```json
{
  "language": "python",
  "sourceCode": "print('Hello, World!')",
  "input": ""
}
```

**Response:**
```json
{
  "success": true,
  "result": {
    "stdout": "Hello, World!\n",
    "stderr": "",
    "compile_output": "",
    "message": "Accepted",
    "status": {
      "id": 3,
      "description": "Accepted"
    },
    "time": "0.01",
    "memory": 3456
  }
}
```

**Supported Languages:**
- `python` - Python 3
- `javascript` - Node.js
- `java` - Java 11
- `cpp` - C++ 17
- `c` - C (GCC)
- And 13+ more...

---

## 🔐 Authentication

### JWT Token System

#### Token Generation

```javascript
// Token payload
{
  "userId": "uuid",
  "role": "STUDENT",
  "email": "student@school.edu",
  "iat": 1234567890,
  "exp": 1234654290
}
```

#### Token Storage

- **httpOnly Cookie**: Stored in `token` cookie (secure, XSS-protected)
- **Authorization Header**: `Bearer <token>` (for API clients)

#### Token Validation

```javascript
// Middleware automatically validates:
1. Token signature
2. Token expiration
3. User exists and is active
4. Role permissions for endpoint
```

### Protected Routes

```javascript
// Public routes (no auth required)
POST /api/auth/login
POST /api/auth/register (disabled)

// Authenticated routes (any logged-in user)
GET /api/auth/me
POST /api/auth/logout
POST /api/code/run

// Role-specific routes
ADMIN: /api/admin/*
INSTRUCTOR: /api/instructor/*
STUDENT: /api/student/*
```

---

## 🛡️ Role-Based Access Control

### Permission Matrix

| Resource | ADMIN | INSTRUCTOR | STUDENT |
|----------|-------|------------|---------|
| **Users** |
| Create Users | ✅ | ❌ | ❌ |
| View All Users | ✅ | ❌ | ❌ |
| Update Users | ✅ | ❌ | ❌ |
| Delete Users | ✅ | ❌ | ❌ |
| **Batches/Sections** |
| Create Batch/Section | ✅ | ❌ | ❌ |
| View All Batches | ✅ | ✅ (assigned) | ❌ |
| Manage Batch | ✅ | ❌ | ❌ |
| **Lessons** |
| Create Lesson | ✅ | ✅ | ❌ |
| View Lessons | ✅ | ✅ (own) | ✅ (assigned) |
| Update Lesson | ✅ | ✅ (own) | ❌ |
| Delete Lesson | ✅ | ✅ (own) | ❌ |
| **Assignments** |
| Create Assignment | ✅ | ✅ | ❌ |
| View Assignments | ✅ | ✅ (own) | ✅ (assigned) |
| Grade Submissions | ✅ | ✅ | ❌ |
| **Submissions** |
| Submit Assignment | ❌ | ❌ | ✅ |
| View Own Submissions | ❌ | ❌ | ✅ |
| View All Submissions | ✅ | ✅ (own assignments) | ❌ |
| **Code Execution** |
| Run Code | ✅ | ✅ | ✅ |

### Middleware Implementation

```javascript
// Require authentication
router.use(authenticateJWT);

// Require specific role
router.use(requireRole(['ADMIN']));

// Require any of multiple roles
router.use(requireRole(['ADMIN', 'INSTRUCTOR']));
```

---

## 💻 Code Execution

### Judge0 Integration

The platform uses **Judge0 CE** for secure, sandboxed code execution.

#### Supported Languages

| Language | ID | Version |
|----------|----|---------| 
| JavaScript | 63 | Node.js 16+ |
| Python | 71 | Python 3.10+ |
| Java | 62 | OpenJDK 11 |
| C++ | 54 | GCC 9.2+ |
| C | 50 | GCC 9.2+ |
| Go | 60 | Go 1.16+ |
| Rust | 73 | Rust 1.50+ |

#### Execution Flow

```
1. User submits code
2. Code saved to temp file
3. Request sent to Judge0 API
4. Judge0 executes in container
5. Results returned
6. Temp file cleaned up
```

#### Safety Features

- ✅ **Sandboxed Execution** - Isolated Docker containers
- ✅ **Time Limits** - Max execution time: 5 seconds
- ✅ **Memory Limits** - Max memory: 128MB
- ✅ **File System Isolation** - No access to host system
- ✅ **Network Isolation** - No external network access
- ✅ **Rate Limiting** - 10 executions per minute per user

#### Example Request

```javascript
const executeCode = async (language, sourceCode, input) => {
  const response = await axios.post(`${JUDGE0_URL}/submissions`, {
    language_id: languageIds[language],
    source_code: sourceCode,
    stdin: input,
    cpu_time_limit: 5,
    memory_limit: 131072 // 128MB in KB
  });
  
  return response.data;
};
```

---

## 📤 File Management

### File Upload System

#### Supported File Types

- **Documents**: PDF, TXT, MD
- **Code**: PY, JS, JAVA, CPP, C, GO, RS
- **Data**: CSV, JSON

#### Upload Limits

- **Max File Size**: 10MB (configurable)
- **Max Files per Request**: 5
- **Storage**: Local file system (`./uploads/`)

#### Security Measures

```javascript
const upload = multer({
  storage: multer.diskStorage({
    destination: './uploads/',
    filename: (req, file, cb) => {
      const uniqueName = `${Date.now()}-${uuid()}-${file.originalname}`;
      cb(null, uniqueName);
    }
  }),
  limits: {
    fileSize: MAX_FILE_SIZE
  },
  fileFilter: (req, file, cb) => {
    // Validate file type
    const allowedTypes = ['application/pdf', 'text/plain', ...];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
});
```

### File Structure

```
uploads/
├── lessons/           # Lesson materials
│   └── 1234567890-uuid-lesson.pdf
├── submissions/       # Student submissions
│   └── 1234567891-uuid-assignment.py
└── imports/          # CSV imports
    └── 1234567892-uuid-users.csv

temp_code/            # Temporary execution files
└── exec_uuid.py
```

---

## ⚠️ Error Handling

### Error Response Format

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {
      "field": "email",
      "issue": "Email already exists"
    }
  }
}
```

### Error Codes

| Code | Status | Description |
|------|--------|-------------|
| `VALIDATION_ERROR` | 400 | Invalid request data |
| `UNAUTHORIZED` | 401 | Authentication required |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `CONFLICT` | 409 | Resource already exists |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Server error |

### Global Error Handler

```javascript
app.use((err, req, res, next) => {
  logger.error(err);
  
  res.status(err.status || 500).json({
    success: false,
    error: {
      code: err.code || 'INTERNAL_ERROR',
      message: err.message,
      ...(process.env.NODE_ENV === 'development' && {
        stack: err.stack
      })
    }
  });
});
```

---

## 🔒 Security

### Security Headers (Helmet)

```javascript
helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'"],
    styleSrc: ["'self'", "'unsafe-inline'"],
    imgSrc: ["'self'", "data:", "https:"]
  }
})
```

### CORS Configuration

```javascript
cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
})
```

### Input Validation

- ✅ Request body validation
- ✅ Query parameter sanitization
- ✅ File upload validation
- ✅ SQL injection prevention (Prisma)
- ✅ XSS protection

### Password Security

```javascript
// Hashing (during registration)
const hashedPassword = await bcrypt.hash(password, 10);

// Verification (during login)
const isValid = await bcrypt.compare(password, user.password);
```

---

## 🧪 Testing

### Unit Tests

```bash
# Test RBAC
yarn test:rbac

# Test integration
yarn test:integration
```

### Load Testing

```bash
# Test under load
yarn test:load
```

### Manual Testing

Use the included **Postman Collection**:

```bash
# Import collection
CodeLan_API_Collection.postman_collection.json
```

**Test Flow:**
1. Login as Admin → Get token
2. Create users
3. Import CSV
4. Test instructor endpoints
5. Test student submissions
6. Test code execution

---

## 🚀 Deployment

### Production Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Use strong `JWT_SECRET`
- [ ] Configure production database
- [ ] Enable HTTPS
- [ ] Set up database backups
- [ ] Configure log rotation
- [ ] Set up process manager (PM2)
- [ ] Enable rate limiting
- [ ] Configure firewall
- [ ] Set up monitoring

### PM2 Deployment

```bash
# Install PM2
npm install -g pm2

# Start application
pm2 start server.js --name codelan-api

# Auto-restart on reboot
pm2 startup
pm2 save

# Monitor
pm2 monit

# View logs
pm2 logs codelan-api
```

### Nginx Reverse Proxy

```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Database Backup

```bash
# Automated daily backup (cron)
0 2 * * * pg_dump codelan > /backups/codelan_$(date +\%Y\%m\%d).sql

# Manual backup
yarn backup:db
```

---

## 📊 Monitoring & Logging

### Winston Logger

```javascript
// Log levels
logger.error('Critical error');
logger.warn('Warning message');
logger.info('Info message');
logger.debug('Debug info');
```

### Log Files

```
logs/
├── error.log       # Error level logs
├── combined.log    # All logs
└── access.log      # HTTP access logs
```

### Health Check Endpoint

```bash
GET /api/health

Response:
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00Z",
  "database": "connected",
  "uptime": 86400
}
```

---

## 🔧 Troubleshooting

### Common Issues

**Database Connection Failed**
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Verify DATABASE_URL
echo $DATABASE_URL

# Test connection
psql $DATABASE_URL
```

**JWT Token Invalid**
```bash
# Regenerate secret
JWT_SECRET=$(openssl rand -base64 32)

# Update .env
echo "JWT_SECRET=$JWT_SECRET" >> .env
```

**Port Already in Use**
```bash
# Find process
lsof -i :3000

# Kill process
kill -9 <PID>

# Or change port
PORT=4000 yarn dev
```

**Judge0 Not Responding**
```bash
# Check containers
docker ps

# Restart Judge0
cd docker
docker-compose restart

# View logs
docker-compose logs judge0-server
```

---

## 📞 Support

For backend-specific issues:
- Check logs in `./logs/`
- Review error messages carefully
- Consult API documentation
- Contact system administrator

---

<div align="center">

**Backend powered by Node.js, Express, and Prisma**

*Built for performance, security, and scalability*

</div>
