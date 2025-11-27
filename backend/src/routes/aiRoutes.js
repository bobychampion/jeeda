import express from 'express';
import {
  getAIRecommendations,
  enhanceTemplateData,
  getPromptSettings,
  updatePromptSettings,
  checkTemplatesStatus,
} from '../controllers/aiController.js';

const router = express.Router();

// AI Chat Recommendation routes
router.post('/recommend', getAIRecommendations);

// AI Template Enhancement route (for admin template form)
router.post('/enhance-template', enhanceTemplateData);

// Diagnostic endpoint
router.get('/status', checkTemplatesStatus);

// Admin routes for prompt settings
router.get('/prompt-settings', getPromptSettings);
router.post('/prompt-settings', updatePromptSettings);

export default router;

