import { extractFurnitureTypeFromSKU } from '../utils/skuParser.js';

/**
 * Template Indexing Service
 * Caches and indexes template metadata for fast searches
 */

let templateCache = null;
let indexCache = null;
let lastCacheUpdate = null;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Index templates by various fields for fast lookup
 * @param {Array} templates - Array of template objects
 * @returns {object} - Indexed template data
 */
export function indexTemplates(templates) {
  const index = {
    byCategory: {},
    byRoomType: {},
    byFurnitureType: {},
    byKeyword: {},
    bySKU: {},
    all: templates,
  };

  templates.forEach(template => {
    const id = template.id;
    
    // Index by category
    const category = (template.category || 'Uncategorized').toLowerCase();
    if (!index.byCategory[category]) {
      index.byCategory[category] = [];
    }
    index.byCategory[category].push(id);

    // Index by room types
    if (template.roomTypes && Array.isArray(template.roomTypes)) {
      template.roomTypes.forEach(roomType => {
        const room = roomType.toLowerCase();
        if (!index.byRoomType[room]) {
          index.byRoomType[room] = [];
        }
        index.byRoomType[room].push(id);
      });
    }

    // Index by furniture type (from SKU)
    const furnitureType = extractFurnitureTypeFromSKU(template.sku);
    if (furnitureType) {
      if (!index.byFurnitureType[furnitureType]) {
        index.byFurnitureType[furnitureType] = [];
      }
      index.byFurnitureType[furnitureType].push(id);
    }

    // Index by search keywords
    if (template.searchKeywords && Array.isArray(template.searchKeywords)) {
      template.searchKeywords.forEach(keyword => {
        const kw = keyword.toLowerCase();
        if (!index.byKeyword[kw]) {
          index.byKeyword[kw] = [];
        }
        index.byKeyword[kw].push(id);
      });
    }

    // Index by SKU pattern
    if (template.sku) {
      const skuUpper = template.sku.toUpperCase();
      if (!index.bySKU[skuUpper]) {
        index.bySKU[skuUpper] = [];
      }
      index.bySKU[skuUpper].push(id);
    }
  });

  return index;
}

/**
 * Get cached templates or fetch from Firestore
 * @param {object} db - Firestore database instance
 * @param {boolean} forceRefresh - Force refresh cache
 * @returns {Promise<Array>} - Array of templates
 */
export async function getCachedTemplates(db, forceRefresh = false) {
  const now = Date.now();
  
  // Return cache if valid and not forcing refresh
  if (!forceRefresh && templateCache && indexCache && lastCacheUpdate) {
    const cacheAge = now - lastCacheUpdate;
    if (cacheAge < CACHE_TTL) {
      console.log(`Using cached templates (age: ${Math.round(cacheAge / 1000)}s)`);
      return { templates: templateCache, index: indexCache };
    }
  }

  // Fetch fresh templates
  console.log('Fetching templates from Firestore and updating cache...');
  try {
    if (!db) {
      throw new Error('Firestore database instance is not available');
    }
    
    const templatesSnapshot = await db.collection('templates').get();
    
    if (!templatesSnapshot || !templatesSnapshot.docs) {
      throw new Error('Invalid response from Firestore query');
    }
    
    const templates = templatesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    console.log(`Fetched ${templates.length} templates from Firestore`);

    // Update cache
    templateCache = templates;
    indexCache = indexTemplates(templates);
    lastCacheUpdate = now;

    console.log(`Cached ${templates.length} templates`);
    return { templates: templateCache, index: indexCache };
  } catch (error) {
    console.error('Error fetching templates for cache:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      stack: error.stack?.split('\n').slice(0, 3).join('\n')
    });
    
    // Return stale cache if available
    if (templateCache && indexCache) {
      console.warn('Using stale cache due to fetch error');
      return { templates: templateCache, index: indexCache };
    }
    
    throw error;
  }
}

/**
 * Invalidate cache (call when templates are updated)
 */
export function invalidateCache() {
  templateCache = null;
  indexCache = null;
  lastCacheUpdate = null;
  console.log('Template cache invalidated');
}

/**
 * Get cache statistics
 * @returns {object} - Cache statistics
 */
export function getCacheStats() {
  return {
    cached: templateCache !== null,
    templateCount: templateCache ? templateCache.length : 0,
    lastUpdate: lastCacheUpdate ? new Date(lastCacheUpdate).toISOString() : null,
    age: lastCacheUpdate ? Date.now() - lastCacheUpdate : null,
  };
}

