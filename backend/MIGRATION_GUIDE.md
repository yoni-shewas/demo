# Database Migration Guide

## Schema Changes Summary

### Updates Required for Batch & Section Management

#### 1. Batch Model Changes
**Added Fields:**
- `type` (String) - Either "RCD" (Regular) or "ECD" (Extension)
- `year` (Int) - Ethiopian Calendar year

#### 2. Section Model Changes
**Removed Fields:**
- `semester` - No longer using term/semester field

**Modified Fields:**
- `instructorId` - Now optional (nullable)

#### 3. Student Model
**No changes required** - Already has `batchId` and `sectionId` fields

---

## Migration Steps

### Step 1: Generate Prisma Client
```bash
cd backend
yarn prisma:generate
```

### Step 2: Create Migration
```bash
yarn prisma migrate dev --name add_batch_type_and_year
```

This will:
- Add `type` and `year` columns to the `Batch` table
- Remove `semester` column from the `Section` table
- Make `instructorId` nullable in the `Section` table

### Step 3: Update Existing Data (if any)

If you have existing batches in the database, you'll need to update them with the new fields:

```sql
-- Example: Update existing batches with default values
UPDATE "Batch" 
SET "type" = 'RCD', "year" = 2017 
WHERE "type" IS NULL;

-- If you have sections with semester data, you may want to log it before removing
SELECT id, name, semester FROM "Section" WHERE semester IS NOT NULL;
```

### Step 4: Verify Migration
```bash
yarn prisma studio
```

Check that:
- Batch table has `type` and `year` columns
- Section table no longer has `semester` column
- Section table's `instructorId` is nullable

---

## API Endpoints Added

### Batch Management
- `GET /api/admin/batches` - Get all batches
- `GET /api/admin/batches/:id` - Get single batch
- `POST /api/admin/batches` - Create batch
- `PUT /api/admin/batches/:id` - Update batch
- `DELETE /api/admin/batches/:id` - Delete batch

### Section Management
- `GET /api/admin/sections` - Get all sections
- `GET /api/admin/sections/:id` - Get single section
- `POST /api/admin/sections` - Create section
- `PUT /api/admin/sections/:id` - Update section
- `DELETE /api/admin/sections/:id` - Delete section
- `POST /api/admin/sections/:id/assign` - Assign users to section

### User Creation Enhancement
- `POST /api/admin/users` - Now accepts `batchId` and `sectionId` for students

---

## Example API Calls

### Create a Batch
```bash
POST /api/admin/batches
Content-Type: application/json
Authorization: Bearer <admin_token>

{
  "name": "2024 RCD Batch",
  "type": "RCD",
  "year": 2017
}
```

### Create a Section
```bash
POST /api/admin/sections
Content-Type: application/json
Authorization: Bearer <admin_token>

{
  "name": "Section A",
  "batchId": "<batch_uuid>"
}
```

### Create a Student with Batch & Section
```bash
POST /api/admin/users
Content-Type: application/json
Authorization: Bearer <admin_token>

{
  "username": "student1",
  "email": "student1@university.edu",
  "password": "password123",
  "role": "STUDENT",
  "firstName": "John",
  "lastName": "Doe",
  "batchId": "<batch_uuid>",
  "sectionId": "<section_uuid>"
}
```

---

## Rollback (if needed)

If you need to rollback the migration:

```bash
# Reset database (WARNING: Deletes all data)
yarn prisma migrate reset

# Or manually revert the migration
yarn prisma migrate resolve --rolled-back <migration_name>
```

---

## Testing Checklist

After migration, test:
- [ ] Create a batch with RCD type
- [ ] Create a batch with ECD type
- [ ] Create a section under a batch
- [ ] Create a student assigned to batch and section
- [ ] Update a batch
- [ ] Update a section
- [ ] Delete a section (should require no students)
- [ ] Delete a batch (should require no sections)
- [ ] Assign instructor to section
- [ ] Assign students to section via assign endpoint

---

## Notes

- The Prisma warning about `datasource.url` is related to Prisma 7 migration. It can be ignored for now as we're using Prisma 5.22.
- All batch and section endpoints require ADMIN role
- Students can only be assigned to sections that belong to the selected batch
- Deleting a batch requires deleting all its sections first
- Deleting a section requires removing all enrolled students first
