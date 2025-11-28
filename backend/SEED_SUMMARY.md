# Database Seeding Summary

## Changes Made

### 1. Schema Updates
- **Added `startDate` field** to the `Assignment` model
- This allows tracking when assignments become available to students
- Migration applied: `20251128162825_add_assignment_start_date`

### 2. Database Seeded with Ethiopian Names

#### Batches (2)
- Batch 2024
- Batch 2025

#### Instructors (5)
All assigned to teach specific sections:
1. **Abebe Tadesse** - Section A - Web Development
   - Email: abebe.tadesse@codelan.et
   
2. **Chaltu Bekele** - Section B - Data Science
   - Email: chaltu.bekele@codelan.et
   
3. **Dawit Haile** - Section C - Mobile Development
   - Email: dawit.haile@codelan.et
   
4. **Emebet Girma** - Section D - AI & ML
   - Email: emebet.girma@codelan.et
   
5. **Fikadu Mengistu** - Section E - Cybersecurity
   - Email: fikadu.mengistu@codelan.et

#### Students (25)
Distributed across all 5 sections (5 students per section):

**Section A - Web Development:**
- Amanuel Tesfaye (STD0001)
- Gelila Worku (STD0006)
- Mahlet Yohannes (STD0011)
- Tewodros Abera (STD0016)
- Meron Tadesse (STD0021)

**Section B - Data Science:**
- Bethlehem Kebede (STD0002)
- Henok Asfaw (STD0007)
- Natnael Getachew (STD0012)
- Tigest Lemma (STD0017)
- Eyob Gebeyehu (STD0022)

**Section C - Mobile Development:**
- Dagim Mulugeta (STD0003)
- Haben Gebru (STD0008)
- Nardos Assefa (STD0013)
- Yared Wolde (STD0018)
- Hana Negussie (STD0023)

**Section D - AI & ML:**
- Eden Alemu (STD0004)
- Kalkidan Solomon (STD0009)
- Robel Mekonnen (STD0014)
- Yordanos Shiferaw (STD0019)
- Samuel Bekele (STD0024)

**Section E - Cybersecurity:**
- Fasika Desta (STD0005)
- Liya Tessema (STD0010)
- Selamawit Woldemariam (STD0015)
- Zelalem Fikre (STD0020)
- Ruth Hailu (STD0025)

All student emails follow pattern: `[username]@student.codelan.et`

#### Assignments (10)
Each section has 2 assignments:

**Assignment 1** - Introduction to Programming
- Started: 3 days ago
- Due: 7 days from now
- Status: PENDING
- Includes starter code for JavaScript and Python

**Assignment 2** - Data Structures
- Starts: 2 days from now
- Due: 14 days from now
- Status: PENDING
- Includes starter code for JavaScript and Python

#### Lessons (5)
One introductory lesson per section covering the fundamentals of that section's topic.

## Login Credentials

**Default Password for all users:** `password123`

### Example Logins:

**Instructor:**
```
Username: abebe.tadesse
Password: password123
```

**Student:**
```
Username: amanuel.tesfaye
Password: password123
```

## How to Re-run the Seed

If you need to reseed the database:

```bash
cd backend
node prisma/seed-ethiopian.js
```

**Note:** This will:
- Clear all existing instructors, students, sections, assignments, lessons, and submissions
- Preserve admin accounts
- Create fresh data with Ethiopian names

## Database Schema

The Assignment model now includes:
```prisma
model Assignment {
  id          String   @id @default(uuid())
  title       String
  description String?
  starterCode Json?
  startDate   DateTime?  // NEW: When assignment becomes available
  dueDate     DateTime?  // When assignment is due
  // ... other fields
}
```

This allows for:
- Future-dated assignments (not yet available)
- Currently active assignments (started but not due)
- Past assignments (already due)
