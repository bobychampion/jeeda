import { GoogleGenerativeAI } from '@google/generative-ai';
import { templatesService } from './firestoreService';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || 'AIzaSyB-1-mXWPngIAuxLCMOndoRGHp9Iz3CY44';
const GEMINI_BACKUP_API_KEY = 'AIzaSyCUfj8yx2azYKvuVB6x8vCImRRFlivTlQg';
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const genAIBackup = new GoogleGenerativeAI(GEMINI_BACKUP_API_KEY);

/**
 * Get an available Gemini model that supports generateContent
 * Tries with the provided API key
 */
const getAvailableModel = async (apiKey = GEMINI_API_KEY, isBackup = false) => {
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const data = await response.json();
    if (data.models) {
      // Filter models that support generateContent and are Gemini models
      // Also prioritize free models (usually flash models are free tier)
      const geminiModels = data.models.filter(m =>
        m.name &&
        m.name.includes('gemini') &&
        m.supportedGenerationMethods?.includes('generateContent')
      );

      if (geminiModels.length > 0) {
        // Prioritize 1.5-flash as it has the highest free tier limits
        const preferred = geminiModels.find(m => m.name.includes('1.5-flash')) ||
          geminiModels.find(m => m.name.includes('flash')) ||
          geminiModels.find(m => m.name.includes('pro')) ||
          geminiModels[0];

        // Extract the model name (remove 'models/' prefix if present)
        let modelName = preferred.name.replace(/^models\//, '');
        console.log(`Found available Gemini model${isBackup ? ' (backup API)' : ''}:`, modelName, '(full name:', preferred.name + ')');
        return { modelName, apiKey };
      }
    }
  } catch (error) {
    console.warn(`Could not list models${isBackup ? ' (backup API)' : ''}:`, error);
  }
  return null;
};

/**
 * Get template recommendations based on user query
 * Calls the backend API which now uses Hugging Face
 * @param {string} userQuery - User's description of what they want
 * @returns {Promise<{recommendations: string[], message: string, availableCategories: string[]}>}
 */
import { API_URL } from '../config/api.js';

export const getRecommendations = async (userQuery) => {
  try {

    const response = await fetch(`${API_URL}/api/ai/recommend`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: userQuery }),
    });

    if (!response.ok) {
      throw new Error('Failed to get recommendations from backend');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('AI API error:', error);

    // Fallback response
    const templates = await templatesService.getAll();
    const categories = [...new Set(templates.map(t => t.category))];

    return {
      recommendations: [],
      message: 'I apologize, but I encountered an error connecting to the server. Please try again later.',
      availableCategories: categories,
    };
  }
};

