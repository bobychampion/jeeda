import express from 'express';
import {
  initializePaystackPayment,
  verifyPaystackPayment,
} from '../controllers/paymentController.js';
import { verifyAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/initialize', verifyAuth, initializePaystackPayment);
router.post('/verify', verifyPaystackPayment);

export default router;

