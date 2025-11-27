import express from 'express';
import {
  createCustomRequest,
  getUserCustomRequests,
  getCustomRequest,
  updateCustomRequest,
  getAllCustomRequests,
} from '../controllers/customRequestController.js';
import { verifyAuth, verifyAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public route - anyone can create a custom request
router.post('/', createCustomRequest);

// User routes - require authentication
router.get('/my-requests', verifyAuth, getUserCustomRequests);
router.get('/:id', verifyAuth, getCustomRequest);
router.put('/:id', verifyAuth, updateCustomRequest);

// Admin routes - require admin role
router.get('/admin/all', verifyAuth, verifyAdmin, getAllCustomRequests); // Admin can see all, users see their own via /my-requests

export default router;

