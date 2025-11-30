# Section Management Update

## Overview
Complete implementation of assign/unassign functionality for teachers and students in sections through the admin dashboard.

## Backend Changes

### 1. Section Controller (`backend/src/controllers/sectionController.js`)
Added new endpoints:
- **`removeInstructorFromSection`** - Remove instructor from a section
- **`removeStudentsFromSection`** - Remove one or more students from a section
- **`getAvailableInstructors`** - Get all instructors with their current section assignments
- **`getAvailableStudents`** - Get students filtered by batch (with optional batchId query param)

### 2. Section Routes (`backend/src/routes/sectionRoutes.js`)
New routes added:
- `GET /api/admin/sections/instructors/available` - List available instructors
- `GET /api/admin/sections/students/available?batchId=xxx` - List students by batch
- `DELETE /api/admin/sections/:id/instructor` - Remove instructor from section
- `POST /api/admin/sections/:id/remove-students` - Remove students (expects `{studentIds: []}`)

### 3. Admin Service (`frontend/src/services/adminService.js`)
New API functions:
- `getSectionById(sectionId)`
- `assignUsersToSection(sectionId, data)`
- `removeInstructorFromSection(sectionId)`
- `removeStudentsFromSection(sectionId, studentIds)`
- `getAvailableInstructors()`
- `getAvailableStudents(batchId)`

## Frontend Changes

### Admin Batches Page (`frontend/src/pages/admin/Batches.jsx`)
Complete overhaul with new features:

#### Features Added:
1. **Manage Users Modal** - Comprehensive modal for section management
   - Split-panel view: Instructors on left, Students on right
   - Real-time updates when assigning/removing users
   
2. **Instructor Management**
   - View current instructor with remove button
   - List of available instructors with current assignments
   - One-click assign new instructor
   - Shows which other sections each instructor teaches
   
3. **Student Management**
   - View all currently enrolled students
   - Individual remove buttons for each student
   - List of available students from same batch
   - Visual indicators if student is in another section
   - One-click add students
   
4. **Inline Actions in Section Cards**
   - Quick remove buttons next to instructor name
   - Remove buttons next to each student in the list
   - Better visual hierarchy and organization

#### UI Improvements:
- New icons: `UserMinus`, `XCircle` for remove actions
- Color-coded avatars (blue for current, green for available)
- Warning indicators for students already in other sections
- Confirmation dialogs for destructive actions
- Toast notifications for all operations
- Responsive grid layout for large modals

## Data Integrity Fix

### Seed File (`backend/prisma/seed.js`)
Fixed data consistency:
- **Section A** now properly assigned to `instructor1` (John Smith)
- Ensures all sections have instructor IDs linked to the correct batch
- Prevents orphaned sections without instructors

## API Flow

### Assign Instructor to Section:
```javascript
POST /api/admin/sections/:sectionId/assign
Body: { instructorId: "instructor-profile-id" }
```

### Remove Instructor from Section:
```javascript
DELETE /api/admin/sections/:sectionId/instructor
```

### Assign Students to Section:
```javascript
POST /api/admin/sections/:sectionId/assign
Body: { studentIds: ["student-id-1", "student-id-2"] }
// Also sets batchId automatically based on section's batch
```

### Remove Students from Section:
```javascript
POST /api/admin/sections/:sectionId/remove-students
Body: { studentIds: ["student-id-1", "student-id-2"] }
```

## Security
- All endpoints require authentication (`authenticate` middleware)
- All endpoints require ADMIN role (`authorize('ADMIN')` middleware)
- Proper validation of IDs before operations
- Confirmation dialogs for destructive actions

## Error Handling
- Backend validates all IDs exist before operations
- Returns appropriate HTTP status codes (400, 404, 500)
- Frontend displays user-friendly error messages via toast
- Automatic data refresh after successful operations

## Testing Recommendations
1. Create a batch and section
2. Assign an instructor to the section
3. Add multiple students to the section
4. Remove individual students
5. Remove the instructor
6. Reassign a different instructor
7. Verify batch ID consistency throughout all operations
8. Test with students from different batches
9. Verify assignments persist after page refresh

## Benefits
- **Complete Control**: Admins can now fully manage section rosters
- **Data Integrity**: All operations maintain proper relationships with batches
- **User Friendly**: Intuitive UI with visual feedback
- **Safe Operations**: Confirmations and proper error handling
- **Flexible**: Can assign/unassign without deleting users
- **Batch-Aware**: Student lists filtered by batch for logical grouping

## Next Steps (Optional Enhancements)
- Bulk student operations (select multiple students to remove)
- Import students directly into sections from CSV
- Section capacity limits
- Conflict detection (instructor teaching multiple sections at same time)
- Email notifications when students are assigned to sections
- Student self-enrollment with approval workflow
