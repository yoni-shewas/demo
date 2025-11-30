# Backend Documentation

Node.js + Express RESTful API with PostgreSQL and Prisma ORM.

## Setup

```bash
cd backend
yarn install
cp .env.example .env
# Edit .env with database credentials

yarn prisma:generate
yarn prisma:migrate
yarn create-admin
yarn dev
```

Server runs on http://localhost:3000

## Project Structure

```
backend/
├── src/
│   ├── controllers/     # Request handlers
│   ├── middleware/      # Auth, RBAC, rate limiting
│   ├── routes/          # API routes
│   ├── services/        # Judge0, file handling
│   ├── utils/           # Helpers
│   └── server.js        # Entry point
├── prisma/
│   └── schema.prisma    # Database schema
├── uploads/             # File storage
└── logs/                # Application logs
```

## Environment Variables

```env
DATABASE_URL="postgresql://user:password@localhost:5432/codelan"
NODE_ENV=development
PORT=3000
JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=24h
JUDGE0_API_URL=http://localhost:2358
```

## API Endpoints

### Authentication
- POST `/api/auth/login` - User login
- POST `/api/auth/register` - Registration (admin only)
- GET `/api/auth/me` - Get current user

### Admin
- GET `/api/admin/users` - List all users
- POST `/api/admin/users` - Create user
- PUT `/api/admin/users/:id` - Update user
- DELETE `/api/admin/users/:id` - Delete user
- POST `/api/admin/users/import` - CSV import
- GET `/api/admin/users/export` - CSV export
- GET/POST/PUT/DELETE `/api/admin/batches` - Batch management
- GET/POST/PUT/DELETE `/api/admin/sections` - Section management

### Instructor
- GET `/api/instructor/profile` - Get profile with sections
- GET `/api/instructor/sections` - Get assigned sections
- GET/POST/PUT/DELETE `/api/instructor/lessons` - Lesson management
- GET/POST/PUT/DELETE `/api/instructor/assignments` - Assignment management
- GET `/api/instructor/submissions` - View submissions
- POST `/api/instructor/submissions/:id/grade` - Grade submission

### Student
- GET `/api/student/profile` - Get profile
- GET `/api/student/lessons` - Get lessons
- GET `/api/student/assignments` - Get assignments
- POST `/api/student/submissions` - Submit assignment
- GET `/api/student/submissions` - View own submissions

### Code Execution
- POST `/api/code/execute` - Execute code via Judge0

## Authentication

JWT-based authentication with httpOnly cookies. Token expires after 24 hours.

```javascript
// Login returns token
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "password"
}

// Token stored in localStorage
// Included in requests via Authorization header
Authorization: Bearer <token>
```

## Role-Based Access Control

Three roles: ADMIN, INSTRUCTOR, STUDENT

- ADMIN: Full access
- INSTRUCTOR: Manage assigned sections, lessons, assignments
- STUDENT: Access lessons, submit assignments

## Database Schema

Main tables:
- `User` - User accounts
- `StudentProfile` - Student-specific data
- `InstructorProfile` - Instructor-specific data
- `Batch` - Student cohorts
- `Section` - Class sections
- `Lesson` - Learning materials
- `Assignment` - Coding assignments
- `Submission` - Student submissions

## Security

- JWT authentication
- bcrypt password hashing (10 rounds)
- Rate limiting (100 req/15min per IP)
- Helmet security headers
- CORS configuration
- Input validation
- SQL injection prevention (Prisma)

## Code Execution

Judge0 CE for secure code execution. Supports 18+ languages.

```bash
cd backend/docker
docker-compose up -d
```

Judge0 runs on http://localhost:2358

## File Management

Multer for file uploads. Supports PDF files for lessons.

Max file size: 10MB
Allowed types: PDF
Storage: `uploads/` directory

## Logging

Winston logger with file and console transports.

- `logs/error.log` - Error logs
- `logs/combined.log` - All logs
- Console output in development

## Testing

```bash
yarn test:rbac         # RBAC tests
yarn test:integration  # Integration tests
yarn test:load         # Load tests
```

## Production Deployment

```bash
yarn prisma:generate
yarn prisma:migrate
NODE_ENV=production yarn start
```

Use PM2 for process management:

```bash
pm2 start src/server.js --name codelan-backend
pm2 save
pm2 startup
```

## Database Migrations

```bash
# Create migration
yarn prisma migrate dev --name migration_name

# Apply migrations
yarn prisma migrate deploy

# Reset database
yarn prisma migrate reset
```

## Common Issues

**Database connection failed**: Check DATABASE_URL in .env

**Port already in use**: Change PORT in .env

**JWT errors**: Regenerate JWT_SECRET

**Judge0 not working**: Ensure Docker containers are running
