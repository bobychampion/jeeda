import { extractFurnitureTypeFromSKU, extractRoomTypesFromSKU } from '../utils/skuParser.js';

/**
 * Keyword-based template search service
 * Provides fast, reliable template matching without AI dependency
 */

// Common furniture type keywords
const FURNITURE_KEYWORDS = {
  'table': ['table', 'tbl', 'dining table', 'coffee table', 'side table', 'end table', 'console table'],
  'chair': ['chair', 'chr', 'seat', 'stool', 'barstool'],
  'shelf': ['shelf', 'shelving', 'bookshelf', 'bookcase', 'display shelf'],
  'tv console': ['tv console', 'tv', 'media console', 'entertainment center', 'console'],
  'desk': ['desk', 'workstation', 'writing desk', 'computer desk'],
  'decoration': ['decor', 'decoration', 'wall decor', 'art', 'display', 'ornament'],
  'cabinet': ['cabinet', 'storage', 'dresser', 'wardrobe', 'chest'],
  'bed': ['bed', 'headboard', 'bed frame'],
  'nightstand': ['nightstand', 'bedside table'],
  'bench': ['bench', 'ottoman', 'footstool'],
};

// Room type keywords
const ROOM_KEYWORDS = {
  'living room': ['living room', 'living', 'lounge', 'sitting room', 'family room', 'lr'],
  'bedroom': ['bedroom', 'bed room', 'master bedroom', 'guest room', 'br'],
  'kitchen': ['kitchen', 'kit', 'cooking area'],
  'bathroom': ['bathroom', 'bath', 'washroom', 'restroom'],
  'dining room': ['dining room', 'dining', 'dining area', 'dr'],
  'office': ['office', 'study', 'workspace', 'home office'],
  'kids room': ['kids room', 'children room', 'child room', 'nursery', 'playroom'],
  'laundry room': ['laundry room', 'laundry', 'utility room'],
  'entryway': ['entryway', 'entry', 'foyer', 'hallway'],
  'storage room': ['storage room', 'storage', 'storeroom', 'pantry', 'closet'],
  'basement': ['basement', 'cellar'],
  'outdoor': ['outdoor', 'patio', 'garden', 'balcony', 'terrace'],
};

/**
 * Extract keywords from user query
 * @param {string} query - User's search query
 * @returns {object} - Extracted keywords
 */
export function extractKeywords(query) {
  if (!query || typeof query !== 'string') {
    return { furnitureTypes: [], roomTypes: [], otherKeywords: [] };
  }

  const queryLower = query.toLowerCase();
  const furnitureTypes = [];
  const roomTypes = [];
  const otherKeywords = [];

  // Extract furniture types
  for (const [type, keywords] of Object.entries(FURNITURE_KEYWORDS)) {
    for (const keyword of keywords) {
      if (queryLower.includes(keyword)) {
        furnitureTypes.push(type);
        break; // Only add once per type
      }
    }
  }

  // Extract room types
  for (const [room, keywords] of Object.entries(ROOM_KEYWORDS)) {
    for (const keyword of keywords) {
      if (queryLower.includes(keyword)) {
        roomTypes.push(room);
        break; // Only add once per room
      }
    }
  }

  // Extract other keywords (words that might be in template names/descriptions)
  const words = queryLower
    .split(/\s+/)
    .filter(word => word.length > 2)
    .filter(word => {
      // Exclude common stop words
      const stopWords = ['the', 'for', 'and', 'with', 'my', 'a', 'an', 'i', 'want', 'need', 'looking', 'show', 'me'];
      return !stopWords.includes(word);
    });

  otherKeywords.push(...words);

  return {
    furnitureTypes: [...new Set(furnitureTypes)],
    roomTypes: [...new Set(roomTypes)],
    otherKeywords: [...new Set(otherKeywords)],
  };
}

/**
 * Score a template based on keyword matches
 * @param {object} template - Template object
 * @param {object} keywords - Extracted keywords
 * @returns {number} - Relevance score (higher = more relevant)
 */
export function scoreTemplate(template, keywords) {
  let score = 0;
  const templateName = (template.name || '').toLowerCase();
  const templateDesc = (template.description || '').toLowerCase();
  const templateCategory = (template.category || '').toLowerCase();
  const templateSKU = (template.sku || '').toUpperCase();
  const searchKeywords = (template.searchKeywords || []).map(k => k.toLowerCase());
  const roomTypes = (template.roomTypes || []).map(r => r.toLowerCase());
  const useCases = (template.useCases || []).map(u => u.toLowerCase());

  // High score matches (exact matches in important fields)
  // Furniture type matches
  for (const furnitureType of keywords.furnitureTypes) {
    if (templateName.includes(furnitureType)) score += 10;
    if (templateDesc.includes(furnitureType)) score += 8;
    if (templateCategory.includes(furnitureType)) score += 10;
    if (searchKeywords.some(k => k.includes(furnitureType))) score += 9;
    
    // Check SKU
    const skuFurnitureType = extractFurnitureTypeFromSKU(templateSKU);
    if (skuFurnitureType && skuFurnitureType.includes(furnitureType)) score += 10;
  }

  // Room type matches
  for (const roomType of keywords.roomTypes) {
    if (roomTypes.some(r => r.includes(roomType))) score += 10;
    if (templateName.includes(roomType)) score += 8;
    if (templateDesc.includes(roomType)) score += 7;
    if (searchKeywords.some(k => k.includes(roomType))) score += 8;
    
    // Check SKU
    const skuRoomTypes = extractRoomTypesFromSKU(templateSKU);
    if (skuRoomTypes.some(r => r.includes(roomType))) score += 10;
  }

  // Other keyword matches (partial matches)
  for (const keyword of keywords.otherKeywords) {
    if (templateName.includes(keyword)) score += 5;
    if (templateDesc.includes(keyword)) score += 3;
    if (searchKeywords.some(k => k.includes(keyword))) score += 4;
    if (useCases.some(u => u.includes(keyword))) score += 3;
  }

  // Category match bonus
  if (keywords.furnitureTypes.length > 0) {
    const furnitureType = keywords.furnitureTypes[0];
    if (templateCategory.includes(furnitureType)) score += 5;
  }

  return score;
}

/**
 * Search templates using keyword matching
 * @param {Array} templates - Array of template objects
 * @param {string} query - User's search query
 * @param {number} limit - Maximum number of results (default: 10)
 * @returns {Array} - Sorted array of templates with scores
 */
export function searchTemplates(templates, query, limit = 10) {
  if (!templates || templates.length === 0) {
    return [];
  }

  if (!query || query.trim().length === 0) {
    // If no query, return all templates (or random selection)
    return templates.slice(0, limit).map(t => ({ template: t, score: 0 }));
  }

  // Extract keywords from query
  const keywords = extractKeywords(query);

  // If no keywords extracted, return empty results
  if (keywords.furnitureTypes.length === 0 && 
      keywords.roomTypes.length === 0 && 
      keywords.otherKeywords.length === 0) {
    return [];
  }

  // Score all templates
  const scoredTemplates = templates.map(template => ({
    template,
    score: scoreTemplate(template, keywords),
  }));

  // Filter out zero-score templates and sort by score (descending)
  const filtered = scoredTemplates
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  return filtered;
}

/**
 * Get top matching templates (returns just template IDs)
 * @param {Array} templates - Array of template objects
 * @param {string} query - User's search query
 * @param {number} limit - Maximum number of results
 * @returns {Array} - Array of template IDs
 */
export function getTopMatchingTemplateIds(templates, query, limit = 10) {
  const results = searchTemplates(templates, query, limit);
  return results.map(item => item.template.id).filter(Boolean);
}

