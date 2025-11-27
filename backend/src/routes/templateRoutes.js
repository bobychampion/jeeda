import express from 'express';
import {
  getTemplates,
  getTemplate,
  getTemplatesByCategory,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  assignTemplatesToRooms,
} from '../controllers/templateController.js';
import { verifyAuth, verifyAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.get('/', getTemplates);
router.get('/:id', getTemplate);
router.get('/category/:category', getTemplatesByCategory);

// Admin routes
router.post('/', verifyAuth, verifyAdmin, createTemplate);
router.post('/assign-categories', verifyAuth, verifyAdmin, assignTemplatesToRooms);
router.put('/:id', verifyAuth, verifyAdmin, updateTemplate);
router.delete('/:id', verifyAuth, verifyAdmin, deleteTemplate);

export default router;

