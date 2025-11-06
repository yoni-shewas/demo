import express from 'express';
import {
  getProfile,
  getSections,
  createAssignment,
  getAssignments,
  getAssignmentSubmissions,
  updateAssignment,
  deleteAssignment,
} from '../controllers/instructorController.js';
import { authenticate, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

// All routes require authentication and INSTRUCTOR role
router.use(authenticate, authorize('INSTRUCTOR'));

/**
 * @route   GET /api/instructor/profile
 * @desc    Get instructor profile with sections
 * @access  Instructor only
 */
router.get('/profile', getProfile);

/**
 * @route   GET /api/instructor/sections
 * @desc    Get all sections for the instructor
 * @access  Instructor only
 */
router.get('/sections', getSections);

/**
 * @route   POST /api/instructor/assignments
 * @desc    Create a new assignment
 * @access  Instructor only
 * @body    { title, description, starterCode, dueDate, sectionId }
 */
router.post('/assignments', createAssignment);

/**
 * @route   GET /api/instructor/assignments
 * @desc    Get all assignments for instructor's sections
 * @access  Instructor only
 */
router.get('/assignments', getAssignments);

/**
 * @route   PUT /api/instructor/assignments/:assignmentId
 * @desc    Update an assignment
 * @access  Instructor only
 */
router.put('/assignments/:assignmentId', updateAssignment);

/**
 * @route   DELETE /api/instructor/assignments/:assignmentId
 * @desc    Delete an assignment
 * @access  Instructor only
 */
router.delete('/assignments/:assignmentId', deleteAssignment);

/**
 * @route   GET /api/instructor/assignments/:assignmentId/submissions
 * @desc    Get all submissions for a specific assignment
 * @access  Instructor only
 */
router.get('/assignments/:assignmentId/submissions', getAssignmentSubmissions);

export default router;
