import express from 'express';
import {
  getAllOrders,
  getDashboardStats,
} from '../controllers/adminController.js';
import { uploadImageToCloudinary, uploadMiddleware } from '../controllers/uploadController.js';
import {
  getInventory,
  upsertInventoryItem,
  deleteInventoryItem,
  getTemplateInventory,
} from '../controllers/inventoryController.js';
import { verifyAuth, verifyAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// All admin routes require admin authentication
// Note: verifyAdmin already includes auth verification, so we don't need verifyAuth separately
router.get('/orders', verifyAdmin, getAllOrders);
router.get('/stats', verifyAdmin, getDashboardStats);
router.post('/upload-image', verifyAdmin, uploadMiddleware, uploadImageToCloudinary);

// Inventory routes
router.get('/inventory', verifyAdmin, getInventory);
router.post('/inventory', verifyAdmin, upsertInventoryItem);
router.delete('/inventory/:id', verifyAdmin, deleteInventoryItem);
router.get('/templates/:templateId/inventory', verifyAdmin, getTemplateInventory);

export default router;

