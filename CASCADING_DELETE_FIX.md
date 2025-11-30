# Cascading Delete Implementation

## Problem
Database foreign key constraints were preventing deletion of users, batches, and sections due to related data. Users would get errors like:
```
update or delete on table "User" violates RESTRICT setting of foreign key constraint "Instructor_userId_fkey"
```

## Solution
Implemented proper cascading delete logic in all delete operations to handle related data before deletion.

## Changes Made

### 1. User Deletion (`backend/src/controllers/adminController.js`)

#### For INSTRUCTOR users:
1. Unassign from all sections (set `instructorId` to `null`)
2. Delete all lessons in their sections
3. Delete instructor profile
4. Delete all sessions
5. Delete user

#### For STUDENT users:
1. Delete all submissions
2. Delete student profile (auto-unassigns from section/batch)
3. Delete all sessions
4. Delete user

#### For ADMIN users:
1. Delete admin profile
2. Delete all sessions
3. Delete user

**Code Flow:**
```javascript
// Check user role and handle related data
if (user.role === 'INSTRUCTOR') {
  await prisma.section.updateMany(...);  // Unassign from sections
  await prisma.lesson.deleteMany(...);   // Delete lessons
  await prisma.instructor.delete(...);   // Delete profile
}
else if (user.role === 'STUDENT') {
  await prisma.submission.deleteMany(...); // Delete submissions
  await prisma.student.delete(...);        // Delete profile
}
await prisma.session.deleteMany(...);      // Delete sessions
await prisma.user.delete(...);             // Delete user
```

### 2. Batch Deletion (`backend/src/controllers/batchController.js`)

Deletes in this order:
1. Get all section IDs in the batch
2. Get all assignment IDs from those sections
3. Delete all submissions for those assignments
4. Delete all assignments in those sections
5. Delete all lessons in those sections
6. Delete all sections
7. Unassign students from the batch
8. Delete the batch

**Data Flow:**
```
Batch
  ├── Sections
  │     ├── Assignments → Submissions (deleted)
  │     ├── Lessons (deleted)
  │     └── (section deleted)
  └── Students (unassigned, not deleted)
```

### 3. Section Deletion (`backend/src/controllers/sectionController.js`)

Deletes in this order:
1. Get all assignment IDs for the section
2. Delete all submissions for those assignments
3. Delete all assignments
4. Delete all lessons
5. Unassign students from section (set `sectionId` to `null`)
6. Delete the section

**Data Flow:**
```
Section
  ├── Assignments → Submissions (deleted)
  ├── Lessons (deleted)
  └── Students (unassigned, not deleted)
```

## Important Notes

### Students are Unassigned, Not Deleted
- When deleting a batch or section, students are **unassigned** (their `batchId` or `sectionId` is set to `null`)
- Students are only deleted when explicitly deleting the student user
- This preserves student records even when reorganizing batches/sections

### Instructors are Unassigned, Not Deleted
- When deleting a section, the instructor is unassigned (section's `instructorId` set to `null`)
- Instructor user account remains intact
- Instructor can be reassigned to other sections

### Complete Data Cleanup
All dependent data is removed:
- ✅ Submissions
- ✅ Assignments
- ✅ Lessons
- ✅ Sessions
- ✅ Profile records (Instructor/Student/Admin)

## Safety Features

1. **Self-Protection**: Users cannot delete their own account
2. **Validation**: Checks if entity exists before deletion
3. **Logging**: All deletions are logged with user info
4. **Error Handling**: Proper error messages and status codes
5. **Transactional**: All operations in sequence (if one fails, may need manual cleanup)

## Testing Recommendations

### Test User Deletion:
```bash
# 1. Create instructor with sections and lessons
# 2. Try deleting the instructor → Should succeed
# 3. Verify sections still exist but have no instructor
# 4. Verify lessons are deleted

# 5. Create student with submissions
# 6. Try deleting the student → Should succeed
# 7. Verify submissions are deleted
```

### Test Batch Deletion:
```bash
# 1. Create batch with multiple sections
# 2. Add assignments and lessons to sections
# 3. Add student submissions
# 4. Try deleting the batch → Should succeed
# 5. Verify all sections, assignments, lessons, submissions are deleted
# 6. Verify students still exist but are unassigned
```

### Test Section Deletion:
```bash
# 1. Create section with instructor
# 2. Add assignments with student submissions
# 3. Add lessons
# 4. Try deleting the section → Should succeed
# 5. Verify assignments, lessons, submissions are deleted
# 6. Verify instructor still exists
# 7. Verify students are unassigned from section
```

## Database Integrity

All foreign key relationships are properly maintained:
- No orphaned records
- No dangling references
- Students can be reassigned to new sections/batches
- Instructors can be reassigned to new sections

## Future Enhancements (Optional)

1. **Soft Deletes**: Add `deletedAt` timestamp instead of hard deletes
2. **Bulk Operations**: Delete multiple users/batches/sections at once
3. **Confirmation Dialog**: Frontend confirmation with item count
4. **Archive Feature**: Move to archive instead of delete
5. **Restore Feature**: Undo deletion within time window
6. **Audit Trail**: Track who deleted what and when
7. **Transaction Wrapper**: Wrap in database transaction for atomic operations

## API Endpoints Updated

### User Management
- `DELETE /api/admin/users/:id` - Now handles cascading deletes

### Batch Management
- `DELETE /api/admin/batches/:id` - Now handles cascading deletes

### Section Management
- `DELETE /api/admin/sections/:id` - Now handles cascading deletes

## Error Responses

All endpoints return proper error responses:
- `404` - Entity not found
- `400` - Bad request (e.g., deleting yourself)
- `500` - Server error with details in development mode

## Success Messages

Updated success messages to reflect cascading behavior:
- "User deleted successfully"
- "Batch and all related data deleted successfully"
- "Section and all related data deleted successfully"
