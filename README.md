# 🎓 SMU Code Platform

> **A Complete Coding & Learning Management System Built for Educational Institutions**

[![Status](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)]()
[![Version](https://img.shields.io/badge/Version-1.0.0-blue)]()
[![License](https://img.shields.io/badge/License-Educational-yellow)]()

---

## 📋 Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [System Architecture](#system-architecture)
- [Technology Stack](#technology-stack)
- [Quick Start](#quick-start)
- [Documentation](#documentation)
- [User Roles](#user-roles)
- [Security Features](#security-features)
- [Deployment](#deployment)
- [Support](#support)

---

## 🌟 Overview

SMU Code Platform is a **full-stack, offline-capable Learning Management System (LMS)** designed specifically for coding education in campus environments. Built to run entirely on a **local area network (LAN)**, it provides a fast, secure, and reliable platform for students, instructors, and administrators.

### Why SMU Code Platform?

- 🌐 **Offline-First**: Runs entirely on campus LAN, no internet required
- ⚡ **Fast Execution**: Optimized code execution engine with Judge0 integration
- 🎨 **Modern UI**: Beautiful, responsive interface with glassmorphism design
- 🔒 **Secure**: Role-based access control with manual authentication
- 📱 **Responsive**: Works seamlessly on desktop, tablet, and mobile devices
- 🚀 **Production-Ready**: Load-tested, security-hardened, fully documented

---

## ✨ Key Features

### For Students
- 💻 **Monaco Code Editor** - Professional-grade code editor with syntax highlighting
- 📚 **Structured Lessons** - Access PDFs, tutorials, and learning materials
- 📝 **Assignment Submission** - Submit code and track submission history
- 🎯 **Progress Tracking** - Monitor completion rates and grades
- 🏆 **Multi-Language Support** - Python, JavaScript, Java, C++, C, and more

### For Instructors
- 📖 **Lesson Management** - Upload and organize educational content
- ✏️ **Assignment Creation** - Create coding assignments with deadlines
- 📊 **Submission Review** - Grade and provide feedback on student work
- 👥 **Class Management** - Manage sections and student enrollments
- 📈 **Analytics Dashboard** - Track class performance and engagement

### For Administrators
- 👤 **User Management** - Create users individually or via CSV import
- 🏫 **Batch Management** - Organize students into cohorts and sections
- 📦 **Bulk Operations** - Import/export users in CSV format
- 🔧 **System Configuration** - Full platform control and oversight
- 📊 **Comprehensive Dashboard** - System-wide analytics and monitoring

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend Layer                            │
│  React 19 + Vite + TailwindCSS + Monaco Editor                  │
│  • Landing Page      • Dashboards       • Code Editor           │
│  • Lessons           • Assignments      • Submissions           │
└─────────────────────────────────────────────────────────────────┘
                              ↓ REST API
┌─────────────────────────────────────────────────────────────────┐
│                        Backend Layer                             │
│  Node.js + Express + Prisma ORM                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Security & Authentication                               │   │
│  │  • JWT Authentication    • RBAC                        │   │
│  │  • Rate Limiting        • CORS                         │   │
│  │  • Helmet Security      • Error Handling               │   │
│  └─────────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ API Endpoints                                           │   │
│  │  • /api/auth           • /api/admin                    │   │
│  │  • /api/instructor     • /api/student                  │   │
│  │  • /api/code           • /api/lessons                  │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                    ↓                           ↓
      ┌────────────────────────┐    ┌────────────────────────┐
      │   PostgreSQL Database   │    │   Judge0 Engine        │
      │   • Users & Roles       │    │   • Code Execution     │
      │   • Courses & Sections  │    │   • 18+ Languages      │
      │   • Assignments         │    │   • Sandboxed          │
      │   • Submissions         │    │   • Docker-based       │
      │   • Lessons & Progress  │    └────────────────────────┘
      └────────────────────────┘
```

---

## 🛠️ Technology Stack

### Frontend
- **Framework**: React 19.2.0 with React Router DOM
- **Build Tool**: Vite 7.2.2
- **Styling**: TailwindCSS 4.1.17
- **Code Editor**: Monaco Editor (VS Code engine)
- **PDF Viewer**: React-PDF
- **Icons**: Lucide React
- **HTTP Client**: Axios
- **Notifications**: React Toastify

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express 4.19.2
- **Database**: PostgreSQL 14+
- **ORM**: Prisma 5.22.0
- **Authentication**: JWT (Manual implementation)
- **Password Hashing**: bcrypt
- **File Upload**: Multer
- **CSV Processing**: csv-parse & csv-stringify
- **Security**: Helmet, CORS, Rate Limiting
- **Logging**: Winston & Morgan

### Code Execution
- **Engine**: Judge0 CE (Community Edition)
- **Containerization**: Docker
- **Languages Supported**: 18+ including Python, JavaScript, Java, C++, C, Go, Rust

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** v18 or higher
- **PostgreSQL** v14 or higher
- **Yarn** package manager
- **Docker** (for Judge0 code execution)

### Installation

#### 1. Clone the Repository
```bash
git clone <repository-url>
cd codeLan
```

#### 2. Setup Backend
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

Backend will run on: **http://localhost:3000**

#### 3. Setup Frontend
```bash
cd ../frontend

# Install dependencies
yarn install

# Configure environment (if needed)
cp .env.example .env

# Start development server
yarn dev
```

Frontend will run on: **http://localhost:5173**

#### 4. Setup Judge0 (Optional)
```bash
cd ../backend/docker
docker-compose up -d
```

Judge0 will run on: **http://localhost:2358**

### 🎉 You're Ready!

Visit **http://localhost:5173** to access the platform.

**Default Admin Credentials:**
- Email: `admin@school.edu`
- Password: `admin123`

---

## 📚 Documentation

### Main Documentation
- **[Backend Documentation](./BACKEND.md)** - Complete backend API reference
- **[Frontend Documentation](./FRONTEND.md)** - Frontend architecture and components
- **[API Documentation](./backend/docs/SYSTEM_OVERVIEW.md)** - Detailed API endpoints

### Additional Resources
- **[Setup Guide](./backend/docs/SETUP_COMPLETE.md)** - Complete setup instructions
- **[Security Guide](./backend/docs/RBAC_GUIDE.md)** - RBAC and security features
- **[Deployment Guide](./backend/docs/IMPLEMENTATION_SUMMARY.md)** - Production deployment
- **[Logging Guide](./backend/docs/LOGGING_GUIDE.md)** - System monitoring
- **[Postman Collection](./backend/docs/POSTMAN_QUICK_START.md)** - API testing

---

## 👥 User Roles

### 🔴 ADMIN
**Full System Control**
- Create and manage all user accounts
- Import/export users via CSV
- Create and manage batches and sections
- Oversee entire platform operation
- Access to all administrative tools

### 🟠 INSTRUCTOR
**Course Management**
- Create and manage lessons
- Design and assign coding assignments
- Review and grade student submissions
- Manage assigned class sections
- Track student progress and performance

### 🟢 STUDENT
**Learning & Practice**
- Access assigned lessons and materials
- Complete coding assignments
- Submit code for evaluation
- Track personal progress and grades
- Use integrated code editor workspace

---

## 🔒 Security Features

### Authentication & Authorization
- ✅ **JWT-based Authentication** - Secure token-based auth
- ✅ **httpOnly Cookies** - XSS protection
- ✅ **Role-Based Access Control (RBAC)** - Granular permissions
- ✅ **Password Hashing** - bcrypt with 10 salt rounds
- ✅ **Session Management** - Token expiration and refresh

### Security Hardening
- ✅ **Helmet** - Security headers configuration
- ✅ **CORS** - Cross-origin resource sharing control
- ✅ **Rate Limiting** - 5-tier protection system
- ✅ **Input Validation** - Request sanitization
- ✅ **SQL Injection Prevention** - Parameterized queries via Prisma
- ✅ **XSS Protection** - Content security policies

### Data Protection
- ✅ **Manual User Management** - No public registration
- ✅ **Automated Backups** - Daily database backups
- ✅ **Secure File Uploads** - Type and size validation
- ✅ **Error Handling** - No sensitive data exposure

---

## 🌐 Deployment

### Development
```bash
# Backend
cd backend && yarn dev

# Frontend
cd frontend && yarn dev
```

### Production

#### Backend
```bash
cd backend
yarn prisma:generate
yarn prisma:migrate
NODE_ENV=production yarn start
```

#### Frontend
```bash
cd frontend
yarn build
# Serve the dist/ folder with nginx or similar
```

### Docker Deployment (Recommended)
```bash
# Full stack with docker-compose
docker-compose up -d
```

### Environment Variables

**Backend (.env)**
```env
DATABASE_URL="postgresql://user:password@localhost:5432/codelan"
NODE_ENV=production
PORT=3000
JWT_SECRET=your_super_secret_key_here
JWT_EXPIRES_IN=7d
JUDGE0_API_URL=http://localhost:2358
```

**Frontend (.env)**
```env
VITE_API_URL=http://localhost:3000
```

---

## 📊 System Requirements

### Minimum Requirements
- **CPU**: 2 cores
- **RAM**: 4GB
- **Storage**: 20GB
- **Network**: Local LAN

### Recommended Requirements
- **CPU**: 4+ cores
- **RAM**: 8GB+
- **Storage**: 50GB SSD
- **Network**: Gigabit LAN

---

## 🧪 Testing

### Backend Tests
```bash
cd backend
yarn test:rbac          # Test role-based access control
yarn test:integration   # Integration tests
yarn test:load          # Load testing
```

### Frontend Tests
```bash
cd frontend
yarn test               # Run unit tests
yarn test:e2e           # End-to-end tests
```

---

## 📈 Performance

- ✅ **Load Tested**: 99%+ success rate under concurrent load
- ✅ **Code Execution**: < 5s average execution time
- ✅ **API Response**: < 200ms average response time
- ✅ **Database Queries**: Optimized with Prisma
- ✅ **File Uploads**: Chunked uploads for large files

---

## 🤝 Contributing

This is an educational platform. For contributions or suggestions:
1. Review existing documentation
2. Test your changes thoroughly
3. Follow the established code style
4. Document new features

---

## 📄 License

**Educational Use License**

This software is designed for educational purposes within academic institutions. 

---

## 🆘 Support

### Getting Help
- **Documentation**: Check the docs/ folder for detailed guides
- **Issues**: Report bugs via your institution's IT support
- **Email**: Contact your system administrator

### Common Issues
- **Database Connection**: Verify PostgreSQL is running and DATABASE_URL is correct
- **Port Conflicts**: Change PORT in .env if 3000 or 5173 are in use
- **JWT Errors**: Regenerate JWT_SECRET in .env
- **Code Execution**: Ensure Judge0 Docker containers are running

---

## 🎯 Roadmap

### Completed ✅
- User authentication and authorization
- Role-based access control
- Code editor with multi-language support
- Assignment submission system
- Lesson management
- Admin, instructor, and student dashboards
- Responsive design
- Security hardening

### Future Enhancements 🔮
- Real-time collaboration
- Live code execution preview
- Video lesson support
- Automated testing for assignments
- Plagiarism detection
- Mobile native apps
- Advanced analytics dashboard

---

## 🙏 Acknowledgments

Built with modern web technologies and best practices for educational excellence.

- **React Team** - For the amazing React framework
- **Vercel** - For Vite and Next.js
- **Prisma** - For the excellent ORM
- **Judge0** - For code execution engine
- **Tailwind Labs** - For TailwindCSS

---

## 📞 Contact

**SMU Code Platform Team**

For institutional deployment inquiries, contact your IT department.

---

<div align="center">

**Made with ❤️ for Education**

*Empowering the next generation of developers*

</div>
