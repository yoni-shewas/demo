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

// Skip auth in development with LOAD_TEST mode for performance testing
router.use((req, res, next) => {
  if (process.env.NODE_ENV === 'development' && process.env.LOAD_TEST === 'true') {
    req.user = {
      userId: 999,
      email: 'loadtest@test.com',
      role: 'ADMIN',
    };
    return next();
  }
  return authenticate(req, res, next);
});

// POST /api/code/run
router.post('/run', executeCode);

// GET /api/code/languages
router.get('/languages', getSupportedLanguagesList);

// GET /api/code/health
router.get('/health', checkServiceHealth);

// GET /api/code/examples
router.get('/examples', getCodeExamples);

// GET /api/code/queue-stats
router.get('/queue-stats', getQueueStats);

export default router;
