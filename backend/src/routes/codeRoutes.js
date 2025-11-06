import express from 'express';
import {
  executeCode,
  getSupportedLanguagesList,
  checkServiceHealth,
  getCodeExamples,
} from '../controllers/codeController.js';
import { authenticate } from '../middlewares/authMiddleware.js';

const router = express.Router();

// All routes require authentication (students and instructors can execute code)
router.use(authenticate);

/**
 * @route   POST /api/code/run
 * @desc    Execute code using Judge0 engine
 * @access  Authenticated users (students, instructors, admins)
 * @body    { language, sourceCode, input?, options? }
 */
router.post('/run', executeCode);

/**
 * @route   GET /api/code/languages
 * @desc    Get list of supported programming languages
 * @access  Authenticated users
 */
router.get('/languages', getSupportedLanguagesList);

/**
 * @route   GET /api/code/health
 * @desc    Check Judge0 service health and availability
 * @access  Authenticated users
 */
router.get('/health', checkServiceHealth);

/**
 * @route   GET /api/code/examples
 * @desc    Get code examples for different languages
 * @access  Authenticated users
 */
router.get('/examples', getCodeExamples);

export default router;
