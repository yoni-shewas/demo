import express from 'express';
import {
  getAllSections,
  getSectionById,
  createSection,
  updateSection,
  deleteSection,
  assignUsersToSection,
  removeInstructorFromSection,
  removeStudentsFromSection,
  getAvailableInstructors,
  getAvailableStudents,
} from '../controllers/sectionController.js';
import { authenticate, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

// All section routes require authentication and ADMIN role
router.use(authenticate);
router.use(authorize('ADMIN'));

// GET /api/admin/sections - Get all sections
router.get('/', getAllSections);

// GET /api/admin/sections/instructors/available - Get available instructors
router.get('/instructors/available', getAvailableInstructors);

// GET /api/admin/sections/students/available - Get available students
router.get('/students/available', getAvailableStudents);

// GET /api/admin/sections/:id - Get single section
router.get('/:id', getSectionById);

// POST /api/admin/sections - Create new section
router.post('/', createSection);

// PUT /api/admin/sections/:id - Update section
router.put('/:id', updateSection);

// DELETE /api/admin/sections/:id - Delete section
router.delete('/:id', deleteSection);

// POST /api/admin/sections/:id/assign - Assign users to section
router.post('/:id/assign', assignUsersToSection);

// DELETE /api/admin/sections/:id/instructor - Remove instructor from section
router.delete('/:id/instructor', removeInstructorFromSection);

// POST /api/admin/sections/:id/remove-students - Remove students from section
router.post('/:id/remove-students', removeStudentsFromSection);

export default router;
