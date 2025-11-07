# Admin API Documentation

## Overview
Admin-only endpoints for user management with flexible CSV/SQL import capabilities.

**Base URL:** `http://localhost:4000`

**Authentication:** All admin endpoints require:
- Valid JWT token (cookie or Bearer token)
- ADMIN role

---

## 🔐 Authentication

### Login as Admin
First, create an admin user or login with existing admin credentials:

```bash
POST /api/auth/login
{
  "email": "admin@example.com",
  "password": "admin_password"
}
```

---

## 👥 User Management

### 1. Create Single User
**POST** `/api/admin/users`

**Headers:**
```
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**Body:**
```json
{
  "username": "john_doe",
  "email": "john@school.edu",
  "password": "securePass123",
  "role": "STUDENT",
  "firstName": "John",
  "lastName": "Doe",
  "studentId": "STU2024001"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "User created successfully",
  "user": {
    "id": "uuid",
    "username": "john_doe",
    "email": "john@school.edu",
    "role": "STUDENT",
    "firstName": "John",
    "lastName": "Doe",
    "createdAt": "2024-11-06T...",
    "studentProfile": {
      "studentId": "STU2024001"
    }
  }
}
```

---

### 2. Get All Users (Paginated)
**GET** `/api/admin/users?page=1&limit=50&role=STUDENT`

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 50)
- `role` (optional): Filter by role (ADMIN, INSTRUCTOR, STUDENT)

**Response (200):**
```json
{
  "success": true,
  "users": [
    {
      "id": "uuid",
      "username": "john_doe",
      "email": "john@school.edu",
      "role": "STUDENT",
      "firstName": "John",
      "lastName": "Doe",
      "createdAt": "2024-11-06T...",
      "studentProfile": {
        "studentId": "STU2024001",
        "batchId": null,
        "sectionId": null
      }
    }
  ],
  "pagination": {
    "total": 150,
    "page": 1,
    "limit": 50,
    "pages": 3
  }
}
```

---

### 3. Delete User
**DELETE** `/api/admin/users/:id`

**Response (200):**
```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

**Note:** Cannot delete yourself

---

## 📥 Import Users

### 1. Import from CSV
**POST** `/api/admin/users/import/csv`

**Headers:**
```
Authorization: Bearer <admin_token>
Content-Type: multipart/form-data
```

**Body:** Form data with file field named `file`

**CSV Format (Flexible):**
The system automatically detects and maps common field names (case-insensitive):

**Example CSV 1 (Full format):**
```csv
username,email,password,role,firstName,lastName,studentId
john_doe,john@school.edu,pass123,STUDENT,John,Doe,STU001
jane_smith,jane@school.edu,pass456,INSTRUCTOR,Jane,Smith,
```

**Example CSV 2 (Minimal format - passwords auto-generated):**
```csv
email,role,first_name,last_name,student_id
student1@school.edu,STUDENT,Alice,Brown,2024001
student2@school.edu,STUDENT,Bob,Green,2024002
```

**Example CSV 3 (Very minimal):**
```csv
email,id_number
student1@school.edu,STU001
student2@school.edu,STU002
```

**Field Mapping:**
- Email: `email` ✅ **Required**
- Username: `username` (auto-generated from email if missing)
- Password: `password` (auto-generated if missing)
- Role: `role` (defaults to STUDENT)
- First Name: `firstname`, `first_name`, `firstName`
- Last Name: `lastname`, `last_name`, `lastName`
- Student ID: `studentid`, `student_id`, `id_number`, `studentId`

**Response (200):**
```json
{
  "success": true,
  "message": "Imported 45 out of 50 users",
  "results": {
    "total": 50,
    "successful": [
      {
        "id": "uuid",
        "email": "john@school.edu",
        "username": "john_doe",
        "role": "STUDENT",
        "generatedPassword": "aB3!xY9zK2pQ"
      }
    ],
    "failed": [
      {
        "record": { "email": "duplicate@school.edu", "role": "STUDENT" },
        "error": "User already exists"
      }
    ]
  }
}
```

**⚠️ Important:** Save the `generatedPassword` values for users without provided passwords!

---

### 2. Import from SQL Export (JSON)
**POST** `/api/admin/users/import/sql`

**Headers:**
```
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**Body:**
```json
{
  "users": [
    {
      "email": "student1@school.edu",
      "username": "student1",
      "password": "pass123",
      "role": "STUDENT",
      "firstName": "Alice",
      "lastName": "Brown",
      "studentId": "STU001"
    },
    {
      "email": "teacher1@school.edu",
      "role": "INSTRUCTOR",
      "first_name": "Bob",
      "last_name": "Smith"
    }
  ]
}
```

**Response:** Same as CSV import

---

## 📤 Export Users

### Export to CSV
**GET** `/api/admin/users/export/csv`

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Response:** CSV file download
```csv
id,username,email,role,firstName,lastName,studentId,createdAt
uuid,john_doe,john@school.edu,STUDENT,John,Doe,STU001,2024-11-06T...
```

---

## 🧪 Testing Examples

### cURL Examples

#### 1. Login as Admin
```bash
# First login to get token
TOKEN=$(curl -s -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin_password"}' \
  | jq -r '.token')

echo "Token: $TOKEN"
```

#### 2. Create Single User
```bash
curl -X POST http://localhost:4000/api/admin/users \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "new_student",
    "email": "newstudent@school.edu",
    "password": "student123",
    "role": "STUDENT",
    "firstName": "New",
    "lastName": "Student",
    "studentId": "STU2024999"
  }'
```

#### 3. Import CSV
```bash
curl -X POST http://localhost:4000/api/admin/users/import/csv \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@students.csv"
```

#### 4. Import SQL/JSON
```bash
curl -X POST http://localhost:4000/api/admin/users/import/sql \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d @users.json
```

#### 5. Get All Users
```bash
curl -X GET "http://localhost:4000/api/admin/users?page=1&limit=20&role=STUDENT" \
  -H "Authorization: Bearer $TOKEN"
```

#### 6. Export CSV
```bash
curl -X GET http://localhost:4000/api/admin/users/export/csv \
  -H "Authorization: Bearer $TOKEN" \
  -o users_export.csv
```

#### 7. Delete User
```bash
curl -X DELETE http://localhost:4000/api/admin/users/USER_ID_HERE \
  -H "Authorization: Bearer $TOKEN"
```

---

## 📝 Sample CSV Files

### students.csv (Full)
```csv
username,email,password,role,firstName,lastName,studentId
alice_brown,alice@school.edu,pass123,STUDENT,Alice,Brown,STU001
bob_green,bob@school.edu,pass456,STUDENT,Bob,Green,STU002
charlie_white,charlie@school.edu,pass789,STUDENT,Charlie,White,STU003
```

### teachers.csv (Minimal)
```csv
email,role,first_name,last_name
teacher1@school.edu,INSTRUCTOR,David,Johnson
teacher2@school.edu,INSTRUCTOR,Emma,Williams
```

### bulk_students.csv (Auto-generated passwords)
```csv
email,student_id
student001@school.edu,2024001
student002@school.edu,2024002
student003@school.edu,2024003
```

---

## 🔒 Public Registration Status

**Public registration is DISABLED.** The `/api/auth/register` endpoint will return:

```json
{
  "success": false,
  "message": "Public registration is disabled. Please contact your administrator to create an account."
}
```

Only admins can create users through:
- Single user creation endpoint
- CSV import
- SQL/JSON import

---

## ⚠️ Error Responses

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Authentication required. No token provided."
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "Access denied. Required role(s): ADMIN"
}
```

### 400 Bad Request
```json
{
  "success": false,
  "message": "CSV file is required"
}
```

### 409 Conflict
```json
{
  "success": false,
  "message": "User with this email or username already exists"
}
```

---

## 📊 Features

✅ **Flexible CSV Import** - Auto-detects column names  
✅ **Auto-generate Passwords** - If not provided in CSV  
✅ **Auto-generate Usernames** - From email if not provided  
✅ **Batch Import** - Import hundreds of users at once  
✅ **Error Reporting** - Detailed success/failure reports  
✅ **Student ID Support** - School-assigned student IDs  
✅ **Multiple Roles** - ADMIN, INSTRUCTOR, STUDENT  
✅ **Export Functionality** - Download all users as CSV  
✅ **Public Registration Disabled** - Admin-only user creation  

---

## 🚀 Next Steps

1. Create your first admin user (via database or initial setup)
2. Login as admin to get JWT token
3. Import your student/teacher lists via CSV or JSON
4. Use the generated passwords for first-time logins
5. Users can change their passwords after login (implement password change endpoint)
