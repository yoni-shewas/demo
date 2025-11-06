# Browser Coding Platform - Backend

A Node.js + Express + Prisma backend for a browser-based coding education platform with admin-managed user system.

## 🚀 Features

- ✅ **Manual JWT Authentication** (using Node.js crypto)
- ✅ **Admin-Only User Management** (public registration/signup disabled)
- ✅ **Flexible CSV Import** (auto-detects column formats)
- ✅ **SQL/JSON Import** support
- ✅ **Student ID Management** (school-assigned IDs)
- ✅ **Role-Based Access Control** (Admin, Instructor, Student)
- ✅ **User Export** (CSV format)
- ✅ **PostgreSQL Database** with Prisma ORM

## 📋 Prerequisites

- Node.js v18+ 
- PostgreSQL 14+
- Yarn package manager

## 🛠️ Installation

### 1. Install Dependencies
```bash
yarn install
```

### 2. Configure Environment
```bash
cp .env.example .env
# Edit .env and update DATABASE_URL and JWT settings
```

### 3. Setup Database
```bash
# Generate Prisma client
yarn prisma:generate

# Run migrations
yarn prisma:migrate

# Optionally: Open Prisma Studio to view data
yarn prisma:studio
```

### 4. Create First Admin User
```bash
# Default admin (admin@school.edu / admin123)
yarn create-admin

# Or specify custom credentials
yarn create-admin custom@email.com customPassword customUsername
```

### 5. Start Server
```bash
yarn dev
```

Server will start on port specified in `.env` (default: 3000)

## 📚 API Documentation

- **Authentication API:** See [API_TESTING.md](./API_TESTING.md)
- **Admin API:** See [ADMIN_API_DOCS.md](./ADMIN_API_DOCS.md)

## 🔑 Quick Start

### 1. Login as Admin
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@school.edu",
    "password": "admin123"
  }'
```

### 2. Create a Single User
```bash
TOKEN="<your_token_from_login>"

curl -X POST http://localhost:3000/api/admin/users \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "student1",
    "email": "student1@school.edu",
    "password": "student123",
    "role": "STUDENT",
    "firstName": "John",
    "lastName": "Doe",
    "studentId": "STU2024001"
  }'
```

### 3. Import Users from CSV
```bash
# Prepare CSV file (email is required, other fields flexible)
# Example: test_students.csv

curl -X POST http://localhost:3000/api/admin/users/import/csv \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@test_students.csv"
```

### 4. Export Users
```bash
curl -X GET http://localhost:3000/api/admin/users/export/csv \
  -H "Authorization: Bearer $TOKEN" \
  -o users_export.csv
```

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/           # Configuration files
│   ├── controllers/      # Route controllers
│   │   ├── authController.js
│   │   └── adminController.js
│   ├── middlewares/      # Custom middleware
│   │   └── authMiddleware.js
│   ├── models/           # Data models (Prisma schema)
│   ├── routes/           # API routes
│   │   ├── authRoutes.js
│   │   └── adminRoutes.js
│   ├── services/         # Business logic
│   └── utils/            # Helper functions
│       └── jwtUtils.js   # Manual JWT implementation
├── prisma/
│   ├── schema.prisma     # Database schema
│   └── migrations/       # Migration history
├── scripts/
│   └── createAdmin.js    # Admin creation utility
├── server.js             # Express server entry point
├── .env                  # Environment variables
├── package.json
├── API_TESTING.md        # Authentication API docs
├── ADMIN_API_DOCS.md     # Admin API docs
└── README.md
```

## 🗃️ Database Schema

### Core Models
- **User** - Base user with email, password, role
- **Admin** - Admin profile (1:1 with User)
- **Instructor** - Instructor profile (1:1 with User)
- **Student** - Student profile with optional `studentId` (1:1 with User)
- **Batch** - Student cohorts
- **Section** - Class sections within batches
- **Lesson** - Learning content
- **Assignment** - Coding assignments
- **Submission** - Student assignment submissions
- **Session** - JWT session tracking

## 🔒 Security Features

- Passwords hashed with bcrypt (10 salt rounds)
- httpOnly cookies for JWT storage
- Manual JWT with HMAC-SHA256 signature
- Token expiration checking
- Role-based access control (RBAC)
- Public registration disabled

## 🎯 User Roles

### ADMIN
- Full system access
- Create/delete users
- Import/export users
- Manage batches, sections, assignments

### INSTRUCTOR
- Manage assigned sections
- Create/grade assignments
- View student submissions

### STUDENT
- View assigned lessons
- Submit assignments
- View grades

## 📥 CSV Import Format

The system flexibly handles various CSV formats. **Email is the only required field.**

### Example 1: Full Format
```csv
username,email,password,role,firstName,lastName,studentId
john_doe,john@school.edu,pass123,STUDENT,John,Doe,STU001
```

### Example 2: Minimal (auto-generates username & password)
```csv
email,student_id
student1@school.edu,STU001
student2@school.edu,STU002
```

### Supported Field Names (case-insensitive)
- Email: `email` ✅ **Required**
- Username: `username` (auto-generated from email if missing)
- Password: `password` (auto-generated if missing)
- Role: `role` (defaults to STUDENT)
- First Name: `firstname`, `first_name`, `firstName`
- Last Name: `lastname`, `last_name`, `lastName`
- Student ID: `studentid`, `student_id`, `id_number`, `studentId`

## 🧪 Testing

Sample test files are included:
- `test_students.csv` - Example CSV import
- `test_users.json` - Example JSON import

Test with Postman or cURL using examples in documentation.

## 📝 Environment Variables

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/dbname?schema=public"

# Application
NODE_ENV=development
PORT=4000

# JWT
JWT_SECRET=your_secret_key_here
JWT_EXPIRES_IN=1d
```

## 🚫 Public Registration

Public registration via `/api/auth/register` is **disabled**. Users must be created by administrators through:
- Single user creation API
- CSV import
- SQL/JSON import

## 📦 Dependencies

### Production
- express - Web framework
- @prisma/client - Database ORM
- bcrypt - Password hashing
- cookie-parser - Cookie handling
- csv-parse - CSV parsing
- csv-stringify - CSV generation
- multer - File upload handling
- dotenv - Environment variables

### Development
- prisma - Database toolkit

## 🔧 Scripts

```bash
yarn dev                 # Start development server
yarn start               # Start production server
yarn prisma:generate     # Generate Prisma client
yarn prisma:migrate      # Run database migrations
yarn prisma:studio       # Open Prisma Studio (DB GUI)
yarn create-admin        # Create admin user
```

## 🐛 Troubleshooting

### Database Connection Issues
```bash
# Check PostgreSQL is running
sudo systemctl status postgresql

# Verify DATABASE_URL in .env
# Ensure PostgreSQL user has proper permissions
```

### Migration Errors
```bash
# Reset database (WARNING: deletes all data)
yarn prisma migrate reset

# Then recreate admin
yarn create-admin
```

### Port Already in Use
```bash
# Change PORT in .env
# Or kill existing process
pkill -f "node server.js"
```

## 📖 Additional Resources

- [Prisma Documentation](https://www.prisma.io/docs)
- [Express Documentation](https://expressjs.com/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

## 📄 License

Private - Educational Use

## 👥 Support

For issues or questions, contact your system administrator.
