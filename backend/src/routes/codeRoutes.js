import express from 'express';
import {
  executeCode,
  getSupportedLanguagesList,
  checkServiceHealth,
  getCodeExamples,
  getQueueStats,
} from '../controllers/codeController.js';
import { authenticate } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Bypass authentication for load testing (only in development with TEST_MODE=true)
router.use((req, res, next) => {
  if (process.env.NODE_ENV === 'development' && process.env.TEST_MODE === 'true') {
    // Mock user for testing
    req.user = {
      userId: 999,
      email: 'loadtest@test.com',
      role: 'ADMIN',
    };
    return next();
  }
  // Normal authentication
  return authenticate(req, res, next);
});

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

/**
 * @route   GET /api/code/queue-stats
 * @desc    Get execution queue statistics and status
 * @access  Authenticated users
 */
router.get('/queue-stats', getQueueStats);

export default router;
