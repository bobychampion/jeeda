import { db, isFirebaseInitialized, getInitializationError } from '../config/firebaseAdmin.js';
import { searchTemplates, getTopMatchingTemplateIds } from '../services/templateSearchService.js';
import { getCachedTemplates } from '../services/templateIndexService.js';

/**
 * Get AI recommendations using Hybrid approach: Keyword Search + AI Ranking
 * Phase 1: Pre-filter templates using fast keyword search
 * Phase 2: Send top results to AI for intelligent ranking (optional)
 * Phase 3: If AI fails, use keyword search results directly
 */
export async function getAIRecommendations(req, res) {
  try {
    const { query } = req.body;

    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }

    // Check if Firebase is initialized
    if (!isFirebaseInitialized() || !db) {
      const initError = getInitializationError();
      const errorMsg = initError?.message || 'Firebase Admin not initialized';
      console.error('❌ Firebase Admin not initialized:', errorMsg);
      
      return res.json({
        recommendations: [],
        message: "I'm currently unable to access the template database. This is likely because Firebase credentials are not configured on the server. Please contact support.",
        availableCategories: [],
        debug: process.env.NODE_ENV === 'development' ? {
          error: errorMsg,
          hint: 'Add FIREBASE_PROJECT_ID, FIREBASE_PRIVATE_KEY, and FIREBASE_CLIENT_EMAIL to Render environment variables'
        } : undefined
      });
    }

    // Fetch templates (using cache for performance)
    let templates = [];
    let categories = [];
    let fetchError = null;
    
    try {
      const { templates: cachedTemplates } = await getCachedTemplates(db);
      templates = cachedTemplates || [];

      // Extract unique categories from templates
      categories = [...new Set(templates.map(t => t.category).filter(Boolean))];
      
      console.log(`Using ${templates.length} templates (from cache or Firestore)`);
    } catch (firestoreError) {
      console.error('Error fetching templates:', firestoreError);
      fetchError = firestoreError;
      templates = [];
      categories = [];
    }

    // If no templates available, provide helpful diagnostic message
    if (templates.length === 0) {
      const errorDetails = fetchError 
        ? `Error: ${fetchError.message || fetchError.toString()}` 
        : 'No templates found in database.';
      
      console.error('No templates available:', errorDetails);
      
      // Try direct Firestore query as fallback
      try {
        console.log('Attempting direct Firestore query...');
        const directSnapshot = await db.collection('templates').limit(1).get();
        console.log(`Direct query result: ${directSnapshot.size} templates found`);
        
        if (directSnapshot.size === 0) {
          return res.json({
            recommendations: [],
            message: "No furniture templates are currently available in our database. Please contact support or check back later.",
            availableCategories: [],
            debug: process.env.NODE_ENV === 'development' ? errorDetails : undefined
          });
        } else {
          // If direct query works but cache doesn't, force refresh
          console.log('Direct query succeeded, forcing cache refresh...');
          const { templates: refreshedTemplates } = await getCachedTemplates(db, true);
          templates = refreshedTemplates || [];
          categories = [...new Set(templates.map(t => t.category).filter(Boolean))];
          
          if (templates.length === 0) {
            return res.json({
              recommendations: [],
              message: "I'm having trouble accessing the template database. Please try again in a moment.",
              availableCategories: [],
              debug: process.env.NODE_ENV === 'development' ? errorDetails : undefined
            });
          }
          // Continue with refreshed templates
        }
      } catch (directError) {
        console.error('Direct Firestore query also failed:', directError);
        return res.json({
          recommendations: [],
          message: "I apologize, but I'm currently unable to access our template database. Please try again later or contact support.",
          availableCategories: [],
          debug: process.env.NODE_ENV === 'development' ? `Cache error: ${errorDetails}, Direct error: ${directError.message}` : undefined
        });
      }
    }

    // PHASE 1: Pre-filter using keyword search (fast, reliable)
    console.log('Phase 1: Pre-filtering templates using keyword search...');
    const keywordResults = searchTemplates(templates, query, 30); // Get top 30 for AI ranking
    const preFilteredTemplates = keywordResults.map(item => item.template);
    const keywordRecommendations = keywordResults.slice(0, 10).map(item => item.template.id);

    console.log(`Keyword search found ${preFilteredTemplates.length} relevant templates`);

    // If keyword search found results, try AI ranking (optional enhancement)
    let aiRecommendations = [];
    let aiMessage = '';
    let useAIResults = false;

    if (preFilteredTemplates.length > 0) {
      try {
        // PHASE 2: Send top pre-filtered templates to AI for intelligent ranking
        console.log('Phase 2: Sending top templates to AI for ranking...');
        
        // Import Hugging Face service
        const { generateChatResponse } = await import('../services/huggingFaceService.js');

        // Build compact template list (only top 30 pre-filtered templates)
        const templateList = preFilteredTemplates.slice(0, 30).map(t => {
          const parts = [
            `ID:${t.id}`,
            `Name:${t.name}`,
            `Cat:${t.category || 'Uncategorized'}`,
          ];
          
          if (t.searchKeywords && t.searchKeywords.length > 0) {
            parts.push(`Kw:${t.searchKeywords.slice(0, 3).join(',')}`);
          }
          if (t.roomTypes && t.roomTypes.length > 0) {
            parts.push(`Rooms:${t.roomTypes.join(',')}`);
          }
          
          return parts.join('|');
        }).join('\n');

        // Optimized prompt - compact format, only pre-filtered templates
        const prompt = `<|system|>
You are a furniture recommendation assistant. Rank these pre-filtered templates by relevance to the user's query.

Templates (format: ID:xxx|Name:xxx|Cat:xxx|Kw:xxx|Rooms:xxx):
${templateList}

Rules:
1. Return ONLY valid template IDs from the list above
2. Rank by relevance (most relevant first)
3. Return 5-10 best matches
4. Return ONLY JSON: {"recommendations":["id1","id2"],"message":"brief explanation"}
</s>
<|user|>
${query}
</s>
<|assistant|>`;

        const responseText = await generateChatResponse(prompt);

        // Parse JSON with multiple strategies
        let jsonText = responseText.trim();
        
        // Strategy 1: Remove markdown code blocks
        if (jsonText.includes('```json')) {
          jsonText = jsonText.split('```json')[1].split('```')[0].trim();
        } else if (jsonText.includes('```')) {
          jsonText = jsonText.split('```')[1].split('```')[0].trim();
        }

        // Strategy 2: Extract JSON object using regex
        const jsonMatch = jsonText.match(/\{[\s\S]*"recommendations"[\s\S]*\}/);
        if (jsonMatch) {
          jsonText = jsonMatch[0];
        }

        // Strategy 3: Try to parse
        try {
          const parsed = JSON.parse(jsonText);
          if (parsed.recommendations && Array.isArray(parsed.recommendations)) {
            aiRecommendations = parsed.recommendations;
            aiMessage = parsed.message || '';
            useAIResults = true;
            console.log(`✓ AI successfully ranked ${aiRecommendations.length} templates`);
          }
        } catch (parseError) {
          // Strategy 4: Extract template IDs using regex (fallback)
          const idPattern = /ID:([a-zA-Z0-9_-]+)/g;
          const extractedIds = [];
          let match;
          while ((match = idPattern.exec(responseText)) !== null) {
            extractedIds.push(match[1]);
          }
          
          if (extractedIds.length > 0) {
            // Filter to only valid template IDs
            const validIds = preFilteredTemplates.map(t => t.id);
            aiRecommendations = extractedIds.filter(id => validIds.includes(id)).slice(0, 10);
            if (aiRecommendations.length > 0) {
              useAIResults = true;
              console.log(`✓ Extracted ${aiRecommendations.length} template IDs using regex fallback`);
            }
          }
        }
      } catch (aiError) {
        console.warn('AI ranking failed, using keyword search results:', aiError.message);
        // Continue with keyword search results
      }
    }

    // PHASE 3: Determine final recommendations
    let finalRecommendations = [];
    let finalMessage = '';

    if (useAIResults && aiRecommendations.length > 0) {
      // Use AI-ranked results, but merge with keyword results to ensure we have enough
      finalRecommendations = [...new Set([...aiRecommendations, ...keywordRecommendations])].slice(0, 10);
      finalMessage = aiMessage || `I found ${finalRecommendations.length} furniture options that match your request.`;
    } else {
      // Use keyword search results directly (reliable fallback)
      finalRecommendations = keywordRecommendations;
      
      if (finalRecommendations.length > 0) {
        finalMessage = `I found ${finalRecommendations.length} furniture ${finalRecommendations.length === 1 ? 'option' : 'options'} that match your request.`;
      } else {
        // No matches found - provide helpful message
        finalMessage = categories.length > 0
          ? `I couldn't find exact matches for "${query}". We have furniture in these categories: ${categories.slice(0, 5).join(', ')}. Try searching for a specific type like "table", "chair", or "shelf".`
          : `I couldn't find matches for "${query}". Please try a different search term.`;
      }
    }

    // Ensure we always return valid template IDs
    const validTemplateIds = templates.map(t => t.id);
    finalRecommendations = finalRecommendations.filter(id => validTemplateIds.includes(id));

    console.log(`Final recommendations: ${finalRecommendations.length} templates`);

    res.json({
      recommendations: finalRecommendations,
      message: finalMessage,
      availableCategories: categories,
    });
  } catch (error) {
    console.error('Error getting AI recommendations:', error);
    
    // Last resort: try keyword search only (using cache)
    try {
      const { templates: cachedTemplates } = await getCachedTemplates(db, true); // Force refresh on error
      
      const keywordResults = getTopMatchingTemplateIds(cachedTemplates, req.body.query || '', 10);
      const categories = [...new Set(cachedTemplates.map(t => t.category).filter(Boolean))];
      
      return res.json({
        recommendations: keywordResults,
        message: keywordResults.length > 0
          ? `I found ${keywordResults.length} furniture options for you.`
          : `I couldn't find matches. Available categories: ${categories.slice(0, 5).join(', ')}.`,
        availableCategories: categories,
      });
    } catch (fallbackError) {
      console.error('Fallback search also failed:', fallbackError);
      
      res.status(500).json({ 
        error: 'Failed to get recommendations. Please try again.',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
}

/**
 * Enhance template data using AI
 * This helps admins improve descriptions, suggest categories, keywords, room types, and use cases
 */
export async function enhanceTemplateData(req, res) {
  try {
    const { name, description, category, currentData } = req.body;

    if (!name && !description) {
      return res.status(400).json({ error: 'Template name or description is required' });
    }

    // Import Hugging Face service
    const { generateChatResponse } = await import('../services/huggingFaceService.js');

    // Fetch existing categories for suggestions (optional - continue even if it fails)
    let categories = [];
    try {
      if (db && typeof db.collection === 'function') {
        const categoriesSnapshot = await db.collection('categories').get();
        categories = categoriesSnapshot.docs.map(doc => doc.data().name).filter(Boolean);
      } else {
        console.warn('Firebase Admin not initialized, skipping category fetch');
      }
    } catch (error) {
      console.warn('Error fetching categories (continuing without them):', error.message);
      // Continue without categories - AI can still work
    }

    // Build prompt for AI enhancement
    const prompt = `<|system|>
You are a helpful assistant for Jeeda, a DIY furniture platform that helps users build custom furniture.

Available Categories: ${categories.length > 0 ? categories.join(', ') : 'None specified yet'}

Your task is to analyze furniture template information and provide enhanced, professional data.

Return ONLY a JSON object in this exact format (no markdown, no extra text):
{
  "description": "Enhanced, professional description (2-3 sentences, engaging and informative)",
  "category": "Best matching category from available list or suggest new one",
  "searchKeywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"],
  "roomTypes": ["room1", "room2", "room3"],
  "useCases": ["use1", "use2", "use3"],
  "difficulty": "Beginner" or "Intermediate" or "Advanced",
  "suggestedMaterials": ["material1", "material2"],
  "suggestedColors": ["color1", "color2", "color3"]
}
</s>
<|user|>
Furniture Template Information:
Name: ${name || 'Not provided'}
Current Description: ${description || 'Not provided'}
Current Category: ${category || 'Not provided'}
${currentData ? `Other Data: ${JSON.stringify(currentData)}` : ''}

Please enhance this template data. Make the description professional, engaging, and informative. Suggest appropriate category, search keywords, room types, use cases, difficulty level, materials, and colors based on the furniture type.
</s>
<|assistant|>`;

    console.log('Generating AI enhancement for template...');
    
    let responseText;
    try {
      responseText = await generateChatResponse(prompt);
    } catch (aiError) {
      console.error('AI service error:', aiError);
      // If AI fails, return a basic enhancement based on the input
      const fallbackResult = {
        description: description || `A beautiful ${name || 'furniture piece'} for your home. This custom piece combines functionality with style, perfect for enhancing your living space.`,
        category: category || 'Furniture',
        searchKeywords: name ? [name.toLowerCase(), ...name.toLowerCase().split(' ')] : [],
        roomTypes: category ? [category.toLowerCase()] : ['living room'],
        useCases: ['home decor', 'functional furniture'],
        difficulty: 'Beginner',
        suggestedMaterials: ['wood', 'metal'],
        suggestedColors: ['natural', 'white', 'black'],
      };
      return res.json(fallbackResult);
    }

    // Parse JSON from response
    let jsonText = responseText.trim();
    // Clean up if model adds markdown
    if (jsonText.includes('```json')) {
      jsonText = jsonText.split('```json')[1].split('```')[0].trim();
    } else if (jsonText.includes('```')) {
      jsonText = jsonText.split('```')[1].split('```')[0].trim();
    }

    let result;
    try {
      result = JSON.parse(jsonText);
    } catch (e) {
      console.error('Failed to parse AI enhancement response:', jsonText);
      // Fallback response
      result = {
        description: description || `A beautiful ${name || 'furniture piece'} for your home. This custom piece combines functionality with style, perfect for enhancing your living space.`,
        category: category || 'Furniture',
        searchKeywords: name ? [name.toLowerCase(), ...name.toLowerCase().split(' ')] : [],
        roomTypes: category ? [category.toLowerCase()] : ['living room'],
        useCases: ['home decor', 'functional furniture'],
        difficulty: 'Beginner',
        suggestedMaterials: ['wood', 'metal'],
        suggestedColors: ['natural', 'white', 'black'],
      };
    }

    res.json(result);
  } catch (error) {
    console.error('Error enhancing template data:', error);
    console.error('Error stack:', error.stack);
    
    // Provide a fallback response instead of failing completely
    const fallbackResult = {
      description: description || `A beautiful ${name || 'furniture piece'} for your home. This custom piece combines functionality with style, perfect for enhancing your living space.`,
      category: category || 'Furniture',
      searchKeywords: name ? [name.toLowerCase(), ...name.toLowerCase().split(' ').filter(w => w.length > 2)] : [],
      roomTypes: category ? [category.toLowerCase()] : ['living room'],
      useCases: ['home decor', 'functional furniture'],
      difficulty: 'Beginner',
      suggestedMaterials: ['wood', 'metal'],
      suggestedColors: ['natural', 'white', 'black'],
      _fallback: true, // Flag to indicate this is a fallback response
      _error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    };
    
    // Log the error but still return a useful response
    let errorMessage = 'AI enhancement unavailable';
    if (error.message?.includes('API key') || error.message?.includes('HUGGINGFACE_API_KEY')) {
      errorMessage = 'AI service not configured. Please add HUGGINGFACE_API_KEY to backend environment variables.';
      console.error('⚠️ HUGGINGFACE_API_KEY is missing in Render environment variables');
    } else if (error.message?.includes('rate limit') || error.message?.includes('429')) {
      errorMessage = 'AI service rate limit reached. Using basic enhancement.';
    } else if (error.message?.includes('loading') || error.message?.includes('503')) {
      errorMessage = 'AI model is loading. Using basic enhancement.';
    }
    
    // Return 200 with fallback data instead of 500 error
    // This way the UI can still use the basic enhancement
    res.status(200).json({
      ...fallbackResult,
      _message: errorMessage,
    });
  }
}

/**
 * Diagnostic endpoint to check template database status
 */
export async function checkTemplatesStatus(req, res) {
  try {
    // Try direct Firestore query
    const snapshot = await db.collection('templates').limit(10).get();
    const templateCount = snapshot.size;
    const totalSnapshot = await db.collection('templates').get();
    const totalCount = totalSnapshot.size;
    
    const templates = snapshot.docs.map(doc => ({
      id: doc.id,
      name: doc.data().name,
      category: doc.data().category,
    }));

    const { getCacheStats } = await import('../services/templateIndexService.js');
    const cacheStats = getCacheStats();

    res.json({
      status: 'ok',
      database: {
        connected: true,
        templateCount: totalCount,
        sampleTemplates: templates,
      },
      cache: cacheStats,
      message: totalCount > 0 
        ? `Database is accessible. Found ${totalCount} templates.`
        : 'Database is accessible but no templates found.',
    });
  } catch (error) {
    console.error('Template status check error:', error);
    res.status(500).json({
      status: 'error',
      database: {
        connected: false,
        error: error.message,
        code: error.code,
      },
      message: 'Unable to connect to template database.',
    });
  }
}

/**
 * Get current AI prompt settings (Admin)
 */
export async function getPromptSettings(req, res) {
  try {
    const { getPromptConfig } = await import('../services/huggingFaceService.js');
    res.json(getPromptConfig());
  } catch (error) {
    console.error('Error getting prompt settings:', error);
    res.status(500).json({ error: 'Failed to get prompt settings' });
  }
}

/**
 * Update AI prompt settings (Admin)
 */
export async function updatePromptSettings(req, res) {
  try {
    const newSettings = req.body;
    const { updatePromptConfig } = await import('../services/huggingFaceService.js');

    const updatedConfig = updatePromptConfig(newSettings);
    res.json({ success: true, config: updatedConfig });
  } catch (error) {
    console.error('Error updating prompt settings:', error);
    res.status(500).json({ error: 'Failed to update prompt settings' });
  }
}
