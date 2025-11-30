import express from 'express';
import {
  getAllBatches,
  getBatchById,
  createBatch,
  updateBatch,
  deleteBatch,
} from '../controllers/batchController.js';
import { authenticate, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

// All batch routes require authentication and ADMIN role
router.use(authenticate);
router.use(authorize('ADMIN'));

// GET /api/admin/batches - Get all batches
router.get('/', getAllBatches);

// GET /api/admin/batches/:id - Get single batch
router.get('/:id', getBatchById);

// POST /api/admin/batches - Create new batch
router.post('/', createBatch);

// PUT /api/admin/batches/:id - Update batch
router.put('/:id', updateBatch);

// DELETE /api/admin/batches/:id - Delete batch
router.delete('/:id', deleteBatch);

export default router;
