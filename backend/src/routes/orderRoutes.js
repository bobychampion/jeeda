import express from 'express';
import {
  createOrder,
  getUserOrders,
  getOrder,
  updateOrderStatus,
  downloadInstructions,
} from '../controllers/orderController.js';
import { verifyAuth, verifyAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// User routes
router.post('/', verifyAuth, createOrder);
router.get('/', verifyAuth, getUserOrders);
router.get('/:id', verifyAuth, getOrder);
router.get('/:id/instructions', verifyAuth, downloadInstructions);

// Admin routes
router.put('/:id/status', verifyAuth, verifyAdmin, updateOrderStatus);

export default router;

