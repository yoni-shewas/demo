# ⚡ Postman Collection - Quick Start

## 📦 What You Got

**File:** `CodeLan_API_Collection.postman_collection.json` (27 KB)

Complete API testing collection with:
- ✅ **24 API endpoints** across 5 categories
- ✅ **Auto authentication** (tokens saved automatically)
- ✅ **Auto variable management** (IDs extracted from responses)
- ✅ **Response validation** (automated tests)
- ✅ **Stress testing ready** (Newman compatible)

## 🚀 3-Step Setup

### Step 1: Import in Postman

```
1. Open Postman
2. Click "Import" button (top left)
3. Drag & drop: CodeLan_API_Collection.postman_collection.json
4. Done!
```

### Step 2: Make Sure Server is Running

```bash
cd /home/vorlox/Desktop/codeLan/backend
yarn dev
```

### Step 3: Run Tests

```
1. Click "CodeLan API - Complete Test Suite"
2. Click "Run" button
3. Click "Run CodeLan API"
4. Watch tests execute!
```

## 📋 What's Included

### 🔐 Authentication (4 endpoints)
- Login Admin / Instructor / Student
- Get Current User

### 👑 Admin (3 endpoints)
- Create Users (Instructor/Student)
- List All Users
- Export to CSV

### 👨‍🏫 Instructor (6 endpoints)
- Get Profile & Sections
- Create/List Lessons
- Create/List Assignments

### 👨‍🎓 Student (5 endpoints)
- Get Profile
- View Lessons & Assignments
- Submit Assignments
- View Submissions

### ⚡ Code Execution (6 endpoints)
- List 18+ Languages
- Check Judge0 Health
- Get Code Examples
- Execute Python/C++/JavaScript

## 🧪 Quick Test

### Test Everything (30 seconds)

```
1. Import collection
2. Click "Run"
3. Set iterations: 1
4. Click "Run"
5. All 24 tests execute in order!
```

### Test Specific Feature

```
1. Expand collection
2. Click folder (e.g., "⚡ Code Execution")
3. Click "Run"
4. Only those tests run
```

### Test Single Endpoint

```
1. Expand folder
2. Click request
3. Click "Send"
4. View response
```

## 🔥 Stress Testing

### Option 1: Postman Runner

```
1. Click collection
2. Click "Run"
3. Set iterations: 100
4. Set delay: 100ms
5. Click "Run"
```

### Option 2: Newman CLI

Install:
```bash
npm install -g newman
```

Run:
```bash
# 10 iterations
newman run CodeLan_API_Collection.postman_collection.json -n 10

# 50 iterations with 100ms delay
newman run CodeLan_API_Collection.postman_collection.json -n 50 --delay-request 100

# Generate HTML report
newman run CodeLan_API_Collection.postman_collection.json -n 10 --reporters html
```

### Option 3: Parallel Stress

```bash
# Run 20 collections in parallel
for i in {1..20}; do
  newman run CodeLan_API_Collection.postman_collection.json &
done
wait
```

## 🎯 Smart Features

### Auto Token Management
```
✅ Login Admin → Saves admin_token
✅ Login Instructor → Saves instructor_token
✅ Login Student → Saves student_token
✅ Other requests automatically use correct token
```

### Auto ID Extraction
```
✅ Get Profile → Saves section_id
✅ Create Lesson → Saves lesson_id
✅ Create Assignment → Saves assignment_id
✅ Later requests use these IDs automatically
```

### Auto Validation
```
✅ Every request checks status code
✅ Important responses extract data
✅ Tests pass/fail automatically
✅ View results in Test Results tab
```

## 📊 Typical Test Results

```
Iterations: 1
Requests: 24
Duration: ~3-5 seconds
Tests: 24 passed

✅ Auth Tests: 4/4 passed
✅ Admin Tests: 3/3 passed
✅ Instructor Tests: 6/6 passed
✅ Student Tests: 5/5 passed
✅ Code Execution Tests: 6/6 passed
```

## 🎬 Recommended Workflow

### First Time Setup
```
1. Import collection
2. Run "🔐 Auth → Login Admin"
3. Run "👑 Admin → Create Instructor"
4. Run entire collection
5. View results
```

### Daily Development Testing
```
1. Run specific folder you're working on
2. Check responses
3. Verify functionality
4. Fix issues
5. Re-run tests
```

### Before Deployment
```
1. Run entire collection 10 times
2. Check for failures
3. Run stress test (50-100 iterations)
4. Monitor server performance
5. Deploy if all tests pass
```

## 🔧 Customization

### Change Server URL

```
1. Right-click collection
2. Select "Edit"
3. Go to "Variables" tab
4. Change base_url value
5. Save
```

### Change Credentials

```
1. Find login request
2. Click "Body" tab
3. Update email/password
4. Save
```

### Add Your Own Tests

```
1. Right-click folder
2. Select "Add Request"
3. Configure endpoint
4. Add pre-request script (if needed)
5. Add tests (if needed)
```

## 📈 Performance Benchmarks

### Expected Response Times

| Endpoint Type | Expected Time |
|---------------|---------------|
| Authentication | < 200ms |
| Simple GET | < 100ms |
| Complex GET | < 300ms |
| POST/PUT | < 250ms |
| Code Execution | < 3000ms* |

*Depends on Judge0 availability

### Stress Test Targets

| Metric | Target |
|--------|--------|
| Success Rate | > 99% |
| Avg Response | < 500ms |
| Max Response | < 5s |
| Errors | < 1% |

## 🚨 Common Issues

### "401 Unauthorized"
→ Run login request first

### "404 Not Found"
→ Check if IDs are set (run prerequisite requests)

### "Connection Refused"
→ Start server: `yarn dev`

### "Variables Not Saving"
→ Check Tests tab in request

## 📚 Full Documentation

See `POSTMAN_COLLECTION_GUIDE.md` for:
- Detailed endpoint descriptions
- Advanced stress testing
- Newman usage examples
- Troubleshooting guide
- Best practices

## ✅ Summary

**File:** `CodeLan_API_Collection.postman_collection.json`

**Contains:**
- 24 endpoints
- 5 categories
- Auto authentication
- Auto variable management
- Response validation
- Stress testing ready

**Usage:**
1. Import → Postman
2. Run → Collection
3. Done!

**Stress Test:**
```bash
newman run CodeLan_API_Collection.postman_collection.json -n 100
```

**Your complete API is now testable with one click!** 🚀
