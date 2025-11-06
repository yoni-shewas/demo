import express from 'express';
import {
  getProfile,
  getAssignments,
  getAssignment,
  submitAssignment,
  getSubmissions,
  getAssignmentSubmissions,
} from '../controllers/studentController.js';
import { authenticate, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

// All routes require authentication and STUDENT role
router.use(authenticate, authorize('STUDENT'));

/**
 * @route   GET /api/student/profile
 * @desc    Get student profile with enrollment info
 * @access  Student only
 */
router.get('/profile', getProfile);

/**
 * @route   GET /api/student/assignments
 * @desc    Get all assignments for student's section
 * @access  Student only
 */
router.get('/assignments', getAssignments);

/**
 * @route   GET /api/student/assignments/:assignmentId
 * @desc    Get a specific assignment with student's submissions
 * @access  Student only
 */
router.get('/assignments/:assignmentId', getAssignment);

/**
 * @route   POST /api/student/submissions
 * @desc    Submit code for an assignment
 * @access  Student only
 * @body    { assignmentId, submittedCode, executionResult }
 */
router.post('/submissions', submitAssignment);

/**
 * @route   GET /api/student/submissions
 * @desc    Get all submissions for the student
 * @access  Student only
 */
router.get('/submissions', getSubmissions);

/**
 * @route   GET /api/student/assignments/:assignmentId/submissions
 * @desc    Get submissions for a specific assignment
 * @access  Student only
 */
router.get('/assignments/:assignmentId/submissions', getAssignmentSubmissions);

export default router;
