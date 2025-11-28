import express from 'express';
import {
  getAIRecommendations,
  enhanceTemplateData,
  getPromptSettings,
  updatePromptSettings,
  checkTemplatesStatus,
  checkApiStatus,
} from '../controllers/aiController.js';

const router = express.Router();

// AI Chat Recommendation routes
router.post('/recommend', getAIRecommendations);

// AI Template Enhancement route (for admin template form)
router.post('/enhance-template', enhanceTemplateData);

// Diagnostic endpoints
router.get('/status', checkTemplatesStatus); // Legacy - template status only
router.get('/diagnostics', checkApiStatus); // Comprehensive API diagnostics

// Admin routes for prompt settings
router.get('/prompt-settings', getPromptSettings);
router.post('/prompt-settings', updatePromptSettings);

export default router;

