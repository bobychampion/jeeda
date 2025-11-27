import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import { db } from '../config/firebaseAdmin.js';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

/**
 * Get template recommendations based on user query
 * @param {string} userQuery - User's description of what they want
 * @returns {Promise<{recommendations: string[], message: string, availableCategories: string[]}>}
 */
export async function getRecommendations(userQuery) {
  try {
    // Fetch available templates and categories from Firestore
    const templatesSnapshot = await db.collection('templates').get();
    const categoriesSnapshot = await db.collection('categories').get();

    const templates = templatesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    const categories = categoriesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Build context for AI
    const templateList = templates.map(t => 
      `- ${t.name} (ID: ${t.id}): ${t.description || ''}, Category: ${t.category}, Difficulty: ${t.difficulty || 'N/A'}`
    ).join('\n');

    const categoryList = categories.map(c => c.name).join(', ');

    const prompt = `You are a helpful assistant for Jeeda, a DIY furniture platform.

Available Categories: ${categoryList}

Available Templates:
${templateList}

User Request: "${userQuery}"

Based on the user's request, recommend ONLY from the available templates above. 
If the request doesn't match any available templates, politely explain what categories we offer.

Return your response in this JSON format:
{
  "recommendations": ["template_id_1", "template_id_2"],
  "message": "Your helpful response message",
  "availableCategories": ["Category1", "Category2"]
}

If no templates match, set recommendations to an empty array and explain what we offer.`;

    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Parse JSON from response (handle markdown code blocks if present)
    let jsonText = text.trim();
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/```\n?/g, '');
    }

    const parsed = JSON.parse(jsonText);

    return {
      recommendations: parsed.recommendations || [],
      message: parsed.message || 'Here are some recommendations for you!',
      availableCategories: parsed.availableCategories || categories.map(c => c.name),
    };
  } catch (error) {
    console.error('Gemini API error:', error);
    
    // Fallback response
    const categoriesSnapshot = await db.collection('categories').get();
    const categories = categoriesSnapshot.docs.map(doc => doc.data().name);

    return {
      recommendations: [],
      message: 'I apologize, but I encountered an error. We currently offer these categories: ' + categories.join(', '),
      availableCategories: categories,
    };
  }
}

