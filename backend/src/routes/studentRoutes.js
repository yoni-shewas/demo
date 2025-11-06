import express from 'express';
import {
  getProfile,
  getAssignments,
  getAssignment,
  submitAssignment,
  getSubmissions,
  getAssignmentSubmissions,
  getLessons,
  getLesson,
} from '../controllers/studentController.js';
import { authenticate, authorize } from '../middlewares/authMiddleware.js';
import { submissionUpload } from '../config/upload.js';

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

// Submission route moved below with file upload

/**
 * @route   GET /api/student/submissions
 * @desc    Get all submissions for the student
 * @access  Student only
 */
router.get('/submissions', getSubmissions);

/**
 * @route   GET /api/student/submissions/:assignmentId
 * @desc    Get submissions for a specific assignment
 * @access  Student only
 */
router.get('/submissions/:assignmentId', getAssignmentSubmissions);

/**
 * @route   POST /api/student/submissions
 * @desc    Submit assignment with file uploads
 * @access  Student only
 * @body    { assignmentId, submittedCode }
 * @files   Multiple files (max 10, 5MB each)
 */
router.post('/submissions', submissionUpload.array('files', 10), submitAssignment);

// ========== LESSON ROUTES ==========

/**
 * @route   GET /api/student/lessons
 * @desc    Get all lessons for student's section
 * @access  Student only
 */
router.get('/lessons', getLessons);

/**
 * @route   GET /api/student/lessons/:lessonId
 * @desc    Get a specific lesson
 * @access  Student only
 */
router.get('/lessons/:lessonId', getLesson);

export default router;
