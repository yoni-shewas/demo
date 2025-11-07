# 📬 Postman Collection Guide

## 📁 File: `CodeLan_API_Collection.postman_collection.json`

Complete API testing collection for the CodeLan Learning Management System.

## 🚀 Quick Start

### 1. Import Collection

**In Postman:**
1. Click **Import** button (top left)
2. Select **File** tab
3. Choose: `CodeLan_API_Collection.postman_collection.json`
4. Click **Import**

### 2. Configure Environment (Optional)

The collection uses collection variables (auto-configured), but you can change the base URL:

1. Right-click collection name
2. Select **Edit**
3. Go to **Variables** tab
4. Update `base_url` if needed (default: `http://localhost:3000/api`)

### 3. Run Tests

**Option A: Run Entire Collection**
```
1. Click collection name
2. Click "Run" button
3. Click "Run CodeLan API"
4. View results
```

**Option B: Run Individual Folders**
```
1. Expand collection
2. Select folder (e.g., "🔐 Auth")
3. Click "Run" button
```

**Option C: Individual Requests**
```
1. Click any request
2. Click "Send" button
```

## 📊 Collection Structure

### 🔐 Auth (4 requests)
- **Login Admin** - Get admin token (auto-saves)
- **Login Instructor** - Get instructor token (auto-saves)
- **Login Student** - Get student token (auto-saves)
- **Get Me** - Get current user info

### 👑 Admin (3 requests)
- **Create Instructor** - Create new instructor user
- **Get All Users** - List all users in system
- **Export CSV** - Export users to CSV

### 👨‍🏫 Instructor (6 requests)
- **Get Profile** - Get instructor profile (auto-saves section_id)
- **Create Lesson** - Create new lesson (auto-saves lesson_id)
- **Get Lessons** - List all lessons
- **Create Assignment** - Create new assignment (auto-saves assignment_id)
- **Get Assignments** - List all assignments
- **Get Submissions** - View student submissions

### 👨‍🎓 Student (5 requests)
- **Get Profile** - Get student profile
- **Get Lessons** - View available lessons
- **Get Assignments** - View assigned work
- **Submit Assignment** - Submit code for assignment
- **Get Submissions** - View own submissions

### ⚡ Code Execution (6 requests)
- **Get Languages** - List 18+ supported languages
- **Check Judge0 Health** - Check code execution service
- **Get Examples** - Get code examples
- **Execute Python** - Run Python code
- **Execute C++** - Run C++ code
- **Execute JavaScript** - Run JavaScript code

## 🔄 Workflow

### Recommended Test Order:

```
1. 🔐 Auth → Login Admin
   ↓
2. 👑 Admin → Create Instructor
   ↓
3. 🔐 Auth → Login Instructor
   ↓
4. 👨‍🏫 Instructor → Get Profile (saves section_id)
   ↓
5. 👨‍🏫 Instructor → Create Lesson
   ↓
6. 👨‍🏫 Instructor → Create Assignment
   ↓
7. 🔐 Auth → Login Student
   ↓
8. 👨‍🎓 Student → Get Lessons
   ↓
9. 👨‍🎓 Student → Get Assignments
   ↓
10. 👨‍🎓 Student → Submit Assignment
   ↓
11. ⚡ Code Execution → Execute Python
```

## 🧪 Stress Testing

### Method 1: Collection Runner

```
1. Click collection name
2. Click "Run"
3. Set "Iterations" to 10-100
4. Set "Delay" to 100-500ms
5. Click "Run CodeLan API"
```

### Method 2: Newman (CLI)

Install Newman:
```bash
npm install -g newman
```

Run collection:
```bash
# Basic run
newman run CodeLan_API_Collection.postman_collection.json

# With iterations
newman run CodeLan_API_Collection.postman_collection.json -n 10

# With delay
newman run CodeLan_API_Collection.postman_collection.json -n 10 --delay-request 100

# Generate HTML report
newman run CodeLan_API_Collection.postman_collection.json -n 10 --reporters cli,html
```

### Method 3: Parallel Stress Test

Create `stress-test.sh`:
```bash
#!/bin/bash

echo "Starting stress test..."

for i in {1..50}; do
  newman run CodeLan_API_Collection.postman_collection.json &
done

wait
echo "Stress test complete!"
```

Run:
```bash
chmod +x stress-test.sh
./stress-test.sh
```

## 📝 Variables Explained

### Collection Variables (Auto-Managed)

| Variable | Purpose | Auto-Set By |
|----------|---------|-------------|
| `base_url` | API base URL | Manual (default: localhost:3000/api) |
| `auth_token` | Current active token | Login requests |
| `admin_token` | Admin JWT | Login Admin |
| `instructor_token` | Instructor JWT | Login Instructor |
| `student_token` | Student JWT | Login Student |
| `section_id` | Current section ID | Instructor Profile |
| `assignment_id` | Current assignment ID | Create Assignment |
| `lesson_id` | Current lesson ID | Create Lesson |

### How Variables Work

1. **Login requests** save tokens automatically
2. **Pre-request scripts** set the active token
3. **Test scripts** extract IDs from responses
4. **Subsequent requests** use saved variables

## 🔧 Customization

### Change User Credentials

Edit request body in:
- `🔐 Auth → Login Admin`
- `🔐 Auth → Login Instructor`
- `🔐 Auth → Login Student`

### Change API URL

1. Edit collection
2. Go to Variables tab
3. Update `base_url` value
4. Save

### Add New Requests

1. Right-click folder
2. Select "Add Request"
3. Configure request
4. Add pre-request script if needed:
```javascript
pm.collectionVariables.set('auth_token', pm.collectionVariables.get('student_token'));
```

## 📊 Response Validation

Each request includes automatic tests:

```javascript
// Status code check
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

// Token extraction
var jsonData = pm.response.json();
pm.collectionVariables.set("admin_token", jsonData.token);

// ID extraction
if (jsonData.lesson) {
    pm.collectionVariables.set("lesson_id", jsonData.lesson.id);
}
```

## 🎯 Testing Scenarios

### Scenario 1: Complete User Flow

```
1. Login Student
2. Get Lessons → View available content
3. Get Assignments → See what's due
4. Execute Python → Test code before submitting
5. Submit Assignment → Submit final work
6. Get Submissions → Check submission history
```

### Scenario 2: Instructor Workflow

```
1. Login Instructor
2. Get Profile → Verify sections
3. Create Lesson → Add new content
4. Create Assignment → Create homework
5. Get Submissions → Check student work
```

### Scenario 3: Admin Tasks

```
1. Login Admin
2. Create Instructor → Add new teacher
3. Create Student → Add new student
4. Get All Users → Verify users
5. Export CSV → Backup data
```

## 🚨 Troubleshooting

### "401 Unauthorized" Errors
```
→ Run the login request first
→ Check if token is saved in variables
→ Verify server is running
```

### "404 Not Found" Errors
```
→ Check if IDs are set (section_id, assignment_id)
→ Run prerequisite requests first
→ Verify data exists in database
```

### "500 Internal Server Error"
```
→ Check server logs
→ Verify database is connected
→ Check request body format
```

### Variables Not Saving
```
→ Check "Tests" tab in request
→ Verify auto-save scripts exist
→ Manually check Variables tab
```

## 📈 Performance Testing

### Load Test Configuration

**Light Load:**
- Iterations: 10
- Delay: 500ms
- Concurrent: 1

**Medium Load:**
- Iterations: 50
- Delay: 100ms
- Concurrent: 5

**Heavy Load:**
- Iterations: 100
- Delay: 50ms
- Concurrent: 10

### Monitor Metrics

```bash
# Server logs
tail -f backend/logs/app.log

# System resources
htop

# Database connections
docker ps
```

## 🎨 Best Practices

1. **Always run Auth first** - Get tokens before other requests
2. **Check Variables tab** - Verify IDs are saved correctly
3. **Run in sequence** - Some requests depend on previous ones
4. **Save collection** - After making changes
5. **Use folders** - Organize by feature area
6. **Add descriptions** - Document complex requests
7. **Use environments** - For dev/staging/prod

## 📚 Additional Resources

### Newman Documentation
https://learning.postman.com/docs/running-collections/using-newman-cli/command-line-integration-with-newman/

### Postman Learning Center
https://learning.postman.com/

### Collection Format
https://schema.getpostman.com/

## ✅ What's Included

- ✅ 24 API endpoints
- ✅ Auto token management
- ✅ Auto ID extraction
- ✅ Response validation
- ✅ All CRUD operations
- ✅ Code execution tests
- ✅ File upload examples (in original collection)
- ✅ Error handling tests
- ✅ Stress testing ready

## 🎉 Summary

This Postman collection provides:

✅ **Complete API Coverage** - All 24 endpoints  
✅ **Auto Authentication** - Tokens saved automatically  
✅ **Variable Management** - IDs extracted and reused  
✅ **Stress Testing Ready** - Newman compatible  
✅ **Organized Structure** - Grouped by feature  
✅ **Response Validation** - Automated tests  
✅ **Easy to Use** - Import and run  

**Import the collection and start testing immediately!** 🚀
