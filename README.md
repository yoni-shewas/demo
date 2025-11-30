# SMU Code Platform

A coding and learning management system for educational institutions.

## Quick Start

```bash
# 1. Clone and setup database
git clone <repository-url> && cd codeLan
cd backend
yarn install
cp .env.example .env
# Edit .env: Set DATABASE_URL to your PostgreSQL credentials

# 2. Initialize database and create admin
yarn prisma:generate
yarn prisma:migrate
yarn create-admin

# 3. Start Judge0 (optional - for code execution)
cd docker && docker-compose up -d && cd ..

# 4. Start backend
yarn dev  # Runs on http://localhost:3000

# 5. In new terminal: Start frontend
cd ../frontend
yarn install
yarn dev  # Runs on http://localhost:5173

# Login: admin@school.edu / admin123
```

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Full Installation](#full-installation)
- [User Roles](#user-roles)
- [Deployment](#deployment)

## Overview

SMU Code Platform is a full-stack LMS designed for coding education on campus networks. Runs offline on local area network with JWT authentication and role-based access control.

## Features

**Students**
- Monaco code editor with syntax highlighting
- Access lessons and materials (PDF support)
- Submit assignments and track submissions
- Multi-language support (Python, JavaScript, Java, C++, C, etc.)

**Instructors**
- Create and manage lessons
- Create assignments with deadlines
- Review and grade submissions
- Manage assigned sections

**Administrators**
- User management (manual creation or CSV import)
- Batch and section management
- CSV export for users
- System-wide dashboard

## Technology Stack

**Frontend**
- React 19 + Vite + React Router
- TailwindCSS
- Monaco Editor
- Axios, React-PDF, Lucide React

**Backend**
- Node.js 18+ + Express
- PostgreSQL 14+ with Prisma ORM
- JWT authentication, bcrypt
- Multer (file uploads), Winston (logging)
- Helmet, CORS, rate limiting

**Code Execution**
- Judge0 CE (Docker-based)
- Supports 18+ languages

## Full Installation

**Prerequisites**
- Node.js 18+
- PostgreSQL 14+
- Yarn
- Docker (optional, for code execution)

**Detailed Setup**

1. Clone repository:
```bash
git clone <repository-url>
cd codeLan
```

2. Backend setup:
```bash
cd backend

# Install dependencies
yarn install

# Configure environment
cp .env.example .env
# Edit .env with your database credentials

# Setup database
yarn prisma:generate
yarn prisma:migrate
yarn create-admin

# Start backend server
yarn dev
```

Backend runs on http://localhost:3000

3. Frontend setup:
```bash
cd ../frontend

# Install dependencies
yarn install

# Configure environment (if needed)
cp .env.example .env

# Start development server
yarn dev
```

Frontend runs on http://localhost:5173

4. Judge0 setup (optional):
```bash
cd ../backend/docker
docker-compose up -d
```

Judge0 runs on http://localhost:2358

Visit http://localhost:5173 to access the platform.

Default admin: `admin@school.edu` / `admin123`

## User Roles

**ADMIN** - Full system control, user management, batch/section management, CSV import/export

**INSTRUCTOR** - Create lessons/assignments, grade submissions, manage assigned sections

**STUDENT** - Access lessons, complete assignments, submit code, track progress

## Deployment

**Development**
```bash
# Backend
cd backend && yarn dev

# Frontend
cd frontend && yarn dev
```

**Production**

Backend:
```bash
cd backend
yarn prisma:generate
yarn prisma:migrate
NODE_ENV=production yarn start
```

Frontend:
```bash
cd frontend
yarn build
# Serve the dist/ folder with nginx or similar
```

Docker (recommended):
```bash
docker-compose up -d
```

**Environment Variables**

Backend `.env`:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/codelan"
NODE_ENV=production
PORT=3000
JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=24h
JUDGE0_API_URL=http://localhost:2358
```

Frontend `.env`:
```env
VITE_API_URL=http://localhost:3000
```

## System Requirements

**Minimum**: 2 CPU cores, 4GB RAM, 20GB storage

**Recommended**: 4+ CPU cores, 8GB+ RAM, 50GB SSD

## License

Educational use only.
