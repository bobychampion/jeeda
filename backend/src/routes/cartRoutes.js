import express from 'express';
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
} from '../controllers/cartController.js';
import { verifyAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

// All cart routes require authentication
router.get('/', verifyAuth, getCart);
router.post('/add', verifyAuth, addToCart);
router.put('/:itemId', verifyAuth, updateCartItem);
router.delete('/:itemId', verifyAuth, removeFromCart);

export default router;

