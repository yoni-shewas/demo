# CodeLan LMS - Quick Start Guide

## 🚀 **Starting the Application**

### Frontend:
```bash
cd /home/vorlox/Desktop/codeLan/frontend
yarn dev
```
**URL:** http://localhost:5173/

### Backend:
```bash
cd /home/vorlox/Desktop/codeLan/backend
npm run dev
```
**URL:** http://localhost:3000/

---

## 🔑 **Login Credentials**

### Admin Account:
```
Email: admin@school.edu
Password: admin123
```

### Instructor Account:
```
Email: teacher1@school.edu
Password: ohF4&62VBaA$
```

### Student Account:
```
Email: student@test.com
Password: test123
```

---

## 🎯 **Feature Access Guide**

### **Admin Dashboard** (http://localhost:5173/admin/dashboard)
After login as admin:

#### **View All Users with Passwords:**
1. Click "Users" in sidebar
2. **Passwords are now visible** in the table
3. Edit any user to change password
4. Export users to CSV/SQL

#### **Manage Batches & Sections:**
1. Click "Batches" in sidebar
2. Create new batch/section
3. Assign instructors
4. Add students to batches

#### **View All Lessons:**
1. Click "Lessons" in sidebar
2. See lessons from all sections
3. Filter by section
4. Search lessons

---

### **Instructor Portal** (http://localhost:5173/instructor/lessons)
After login as instructor:

#### **Create Lessons:**
1. Click "Lessons" tab
2. Click "Create Lesson"
3. Upload PDF files
4. Assign to section
5. Save

#### **Create Assignments:**
1. Click "Assignments" tab
2. Click "Create Assignment"
3. Set title, description, due date
4. Set max points
5. Add starter code (optional)
6. Save

#### **Grade Submissions:**
1. Click "Submissions" tab
2. Filter by assignment
3. View student code
4. Enter score and feedback
5. Click "Grade"

---

### **Student Portal** (http://localhost:5173/student/code)
After login as student:

#### **View Lessons:**
1. Click "Lessons" tab
2. Browse available lessons
3. Click "View PDF" to open lesson
4. Navigate pages
5. Download if needed

#### **Complete Assignments:**
1. Click "Code" tab
2. Select language (Python, C++, Java, JS)
3. Write code in Monaco Editor
4. Click "Run Code" to test
5. Click "Save Submission" when done

#### **Check Grades:**
1. Click "Submissions" tab
2. View all submissions
3. See scores and feedback
4. Click to view submitted code

---

### **Public Code Editor** (NO LOGIN REQUIRED)
**URL:** http://localhost:5173/code

#### **Features:**
- ✅ Open to anyone (no account needed)
- ✅ Multi-language support
- ✅ Run code directly
- ✅ Copy/Download/Share code
- ✅ Theme switching

#### **How to Use:**
1. Visit http://localhost:5173/code
2. Select language from dropdown
3. Write code
4. Enter input (if needed)
5. Click "Run Code"
6. See output in right panel

#### **Sharing Code:**
1. Click share button
2. Link is copied to clipboard
3. Send link to others
4. They can view and run your code

---

## 📱 **PWA Installation**

### Desktop (Chrome):
1. Visit the site
2. Look for install icon in address bar
3. Click "Install CodeLan"
4. App opens in standalone window

### Mobile:
1. Visit site in mobile browser
2. Tap "Add to Home Screen"
3. App installs like native app

---

## 📴 **Offline Mode Testing**

### Enable Offline Mode:
1. Open DevTools (F12)
2. Go to Network tab
3. Change "Online" to "Offline"
4. Reload page

### What Works Offline:
- ✅ View cached lessons
- ✅ View cached assignments
- ✅ Browse previously loaded pages
- ✅ View submitted code
- ✅ All static assets

### When Back Online:
1. Yellow badge changes to green
2. Click "Click to Sync"
3. Fresh data loads
4. Cache updates

---

## 🎨 **Admin Features**

### **Password Display** (NEW!):
- Navigate to Admin > Users
- **All passwords are visible in the table**
- Click Edit to change password
- Useful for password recovery

### **Bulk Import Users:**
1. Go to Admin > Users
2. Click "Import" button
3. Upload CSV or JSON file
4. Users created automatically

**CSV Format:**
```csv
username,email,password,role,firstName,lastName
john123,john@test.com,pass123,STUDENT,John,Doe
```

### **Export Users:**
1. Go to Admin > Users
2. Click "CSV" or "SQL" button
3. File downloads with all users (including passwords)

---

## 🔧 **Backend API Testing**

### Using Postman:
1. Import `CodeLan_API_Collection.postman_collection.json`
2. Collection has all endpoints
3. Run "Login Admin" to get token
4. Token auto-saves for other requests
5. Test all features

### Key Endpoints:
```
Auth:
- POST /api/auth/login
- GET /api/auth/me

Admin:
- GET /api/admin/users (includes passwords)
- POST /api/admin/users
- GET /api/admin/sections
- POST /api/admin/sections

Instructor:
- GET /api/instructor/lessons
- POST /api/instructor/lessons
- GET /api/instructor/assignments
- POST /api/instructor/submissions/:id/grade

Student:
- GET /api/student/lessons
- GET /api/student/assignments
- POST /api/student/submissions

Code Execution:
- POST /api/code/run
- GET /api/code/languages
```

---

## 📊 **Database Access**

### View Database:
```bash
cd /home/vorlox/Desktop/codeLan/backend
npx prisma studio
```
Opens at: http://localhost:5555

### Reset Database:
```bash
npx prisma migrate reset
npx prisma db seed
```

---

## 🎯 **Complete Workflow Example**

### Scenario: Instructor Creates Assignment, Student Completes It

#### Step 1: Instructor Creates Assignment
1. Login as `teacher1@school.edu`
2. Go to Assignments tab
3. Click "Create Assignment"
4. Fill in:
   - Title: "Two Sum Problem"
   - Description: "Find indices of two numbers that sum to target"
   - Section: Select section
   - Due Date: Tomorrow
   - Max Points: 100
5. Save

#### Step 2: Student Completes Assignment
1. Login as `student@test.com`
2. Go to Assignments tab
3. See new assignment
4. Click "Open in Code Editor"
5. Select language: Python
6. Write code:
```python
def twoSum(nums, target):
    map = {}
    for i in range(len(nums)):
        complement = target - nums[i]
        if complement in map:
            return [map[complement], i]
        map[nums[i]] = i
    return []
```
7. Click "Run Code" to test
8. Click "Save Submission"

#### Step 3: Instructor Grades Submission
1. Login as `teacher1@school.edu`
2. Go to Submissions tab
3. Filter by assignment
4. See student submission
5. Review code
6. Enter score: 95
7. Add feedback: "Great work! Minor optimization possible"
8. Click "Grade"

#### Step 4: Student Checks Grade
1. Login as `student@test.com`
2. Go to Submissions tab
3. See grade: 95/100
4. Read feedback
5. View submitted code

---

## ✅ **All Features Summary**

### **What's Implemented:**
- ✅ Complete authentication system
- ✅ **Password display in admin dashboard**
- ✅ User management (CRUD)
- ✅ Batch and section management
- ✅ Lesson creation with PDF upload
- ✅ Assignment creation and management
- ✅ **Public code editor (no login)**
- ✅ Code execution (Python, C++, Java, JS, C)
- ✅ Submission and grading system
- ✅ PDF viewer for lessons
- ✅ Monaco Editor for coding
- ✅ Offline mode (PWA)
- ✅ Responsive design
- ✅ Toast notifications
- ✅ Loading states
- ✅ Error handling

---

## 🐛 **Troubleshooting**

### Frontend Won't Start:
```bash
cd frontend
rm -rf node_modules .yarn/cache
yarn install
yarn dev
```

### Backend Won't Start:
```bash
cd backend
npm install
npx prisma generate
npm run dev
```

### Database Issues:
```bash
cd backend
npx prisma migrate reset
npx prisma db seed
```

### Judge0 Not Working:
```bash
cd backend/docker/judge0
docker-compose up -d
```

---

## 📞 **Support**

**Dev Server URLs:**
- Frontend: http://localhost:5173/
- Backend: http://localhost:3000/
- Prisma Studio: http://localhost:5555/
- Judge0: http://localhost:2358/

**All features are working and tested!** 🎉
