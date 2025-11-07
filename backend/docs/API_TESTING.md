# Authentication API Testing Guide

## Base URL
```
http://localhost:4000
```

## Endpoints

### 1. Register User
**POST** `/api/auth/register`

**Body (JSON):**
```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "securePassword123",
  "role": "STUDENT",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Valid Roles:** `ADMIN`, `INSTRUCTOR`, `STUDENT`

**Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "user": {
    "id": "uuid",
    "username": "john_doe",
    "email": "john@example.com",
    "role": "STUDENT",
    "firstName": "John",
    "lastName": "Doe",
    "createdAt": "2024-11-05T..."
  }
}
```

---

### 2. Login
**POST** `/api/auth/login`

**Body (JSON):**
```json
{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "id": "uuid",
    "username": "john_doe",
    "email": "john@example.com",
    "role": "STUDENT",
    "firstName": "John",
    "lastName": "Doe"
  },
  "token": "eyJhbGciOi..."
}
```

**Note:** Token is automatically set in httpOnly cookie. Also returned in response for Postman testing.

---

### 3. Get Current User (Protected)
**GET** `/api/auth/me`

**Authentication Required:** Yes (Cookie or Bearer token)

**Headers (if using Bearer token):**
```
Authorization: Bearer <your_jwt_token>
```

**Response (200):**
```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "username": "john_doe",
    "email": "john@example.com",
    "role": "STUDENT",
    "firstName": "John",
    "lastName": "Doe",
    "createdAt": "2024-11-05T...",
    "updatedAt": "2024-11-05T..."
  }
}
```

---

### 4. Logout
**POST** `/api/auth/logout`

**Authentication Required:** Yes

**Response (200):**
```json
{
  "success": true,
  "message": "Logout successful"
}
```

---

## Testing with Postman

### Using Cookies (Recommended)
1. **Register** a user using `/api/auth/register`
2. **Login** using `/api/auth/login`
   - Postman will automatically save the httpOnly cookie
3. **Test protected routes** like `/api/auth/me`
   - Cookie is sent automatically
4. **Logout** using `/api/auth/logout`

### Using Bearer Token
1. **Register** a user
2. **Login** and copy the `token` from the response
3. For protected routes, add header:
   ```
   Authorization: Bearer <paste_token_here>
   ```

---

## Testing with cURL

### Register
```bash
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "test_user",
    "email": "test@example.com",
    "password": "test123",
    "role": "STUDENT"
  }'
```

### Login
```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{
    "email": "test@example.com",
    "password": "test123"
  }'
```

### Get Current User (with cookie)
```bash
curl -X GET http://localhost:4000/api/auth/me \
  -b cookies.txt
```

### Get Current User (with Bearer token)
```bash
TOKEN="<your_token_from_login>"
curl -X GET http://localhost:4000/api/auth/me \
  -H "Authorization: Bearer $TOKEN"
```

### Logout
```bash
curl -X POST http://localhost:4000/api/auth/logout \
  -b cookies.txt
```

---

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Username, email, password, and role are required"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

### 409 Conflict
```json
{
  "success": false,
  "message": "User with this email or username already exists"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Internal server error"
}
```

---

## JWT Details

- **Algorithm:** HMAC-SHA256 (HS256)
- **Implementation:** Manual (using Node.js crypto, no external JWT library)
- **Claims:**
  - `userId`: User's unique ID
  - `email`: User's email
  - `role`: User's role (ADMIN, INSTRUCTOR, STUDENT)
  - `iat`: Issued at timestamp
  - `exp`: Expiration timestamp
- **Expiration:** Configurable via `JWT_EXPIRES_IN` env variable (default: 1d)
- **Storage:** httpOnly cookie (secure in production)

---

## Environment Variables Required

```env
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=1d
```
