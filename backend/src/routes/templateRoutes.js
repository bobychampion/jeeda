import express from 'express';
import {
  getTemplates,
  getTemplate,
  getTemplatesByCategory,
  createTemplate,
  updateTemplate,
  deleteTemplate,
} from '../controllers/templateController.js';
import { verifyAuth, verifyAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.get('/', getTemplates);
router.get('/:id', getTemplate);
router.get('/category/:category', getTemplatesByCategory);

// Admin routes
router.post('/', verifyAuth, verifyAdmin, createTemplate);
// Removed: /assign-categories route - Random category assignment disabled
router.put('/:id', verifyAuth, verifyAdmin, updateTemplate);
router.delete('/:id', verifyAuth, verifyAdmin, deleteTemplate);

export default router;

