import express from 'express';
import multer from 'multer';
import {
  createUser,
  updateUser,
  importUsersFromCSV,
  importUsersFromSQL,
  exportUsersToCSV,
  getAllUsers,
  deleteUser,
} from '../controllers/adminController.js';
import { authenticate, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Configure multer for file uploads (memory storage)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed'));
    }
  },
});

// All routes require authentication and ADMIN role
router.use(authenticate, authorize('ADMIN'));

/**
 * @route   POST /api/admin/users
 * @desc    Create a single user
 * @access  Admin only
 */
router.post('/users', createUser);

/**
 * @route   GET /api/admin/users
 * @desc    Get all users with pagination
 * @access  Admin only
 * @query   page, limit, role
 */
router.get('/users', getAllUsers);

/**
 * @route   PUT /api/admin/users/:id
 * @desc    Update a user
 * @access  Admin only
 */
router.put('/users/:id', updateUser);

/**
 * @route   DELETE /api/admin/users/:id
 * @desc    Delete a user
 * @access  Admin only
 */
router.delete('/users/:id', deleteUser);

/**
 * @route   POST /api/admin/users/import/csv
 * @desc    Import users from CSV file
 * @access  Admin only
 */
router.post('/users/import/csv', upload.single('file'), importUsersFromCSV);

/**
 * @route   POST /api/admin/users/import/sql
 * @desc    Import users from SQL export (JSON)
 * @access  Admin only
 */
router.post('/users/import/sql', importUsersFromSQL);

/**
 * @route   GET /api/admin/users/export/csv
 * @desc    Export all users to CSV
 * @access  Admin only
 */
router.get('/users/export/csv', exportUsersToCSV);

export default router;
