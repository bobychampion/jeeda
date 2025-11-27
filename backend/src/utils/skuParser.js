/**
 * SKU Pattern Parser
 * Extracts furniture type and category information from SKU patterns
 */

// Common SKU patterns and their furniture types
const SKU_PATTERNS = {
  // Tables
  'TBL': 'table',
  'TABLE': 'table',
  'TAB': 'table',
  'COFFEE': 'coffee table',
  'DINING': 'dining table',
  'SIDE': 'side table',
  'END': 'end table',
  
  // Chairs
  'CHR': 'chair',
  'CHAIR': 'chair',
  'STOOL': 'stool',
  'SEAT': 'seat',
  
  // Shelves
  'SHELF': 'shelf',
  'SHLF': 'shelf',
  'SHELVING': 'shelf',
  'BOOKSHELF': 'bookshelf',
  'BOOK': 'bookshelf',
  
  // TV Consoles
  'TV': 'tv console',
  'TV-CNSL': 'tv console',
  'CONSOLE': 'console',
  'CNSL': 'console',
  'MEDIA': 'media console',
  'ENTERTAINMENT': 'entertainment center',
  
  // Desks
  'DESK': 'desk',
  'WORKSTATION': 'desk',
  
  // Decorations
  'DECO': 'decoration',
  'DECOR': 'decoration',
  'WALL': 'wall decor',
  'ART': 'art',
  'DISPLAY': 'display',
  
  // Storage
  'STORAGE': 'storage',
  'CABINET': 'cabinet',
  'DRESSER': 'dresser',
  'WARDROBE': 'wardrobe',
  
  // Bedroom
  'BED': 'bed',
  'HEADBOARD': 'headboard',
  'NIGHTSTAND': 'nightstand',
  
  // Other
  'BENCH': 'bench',
  'OTTOMAN': 'ottoman',
  'RACK': 'rack',
  'STAND': 'stand',
};

// Room type patterns in SKU
const ROOM_PATTERNS = {
  'LR': 'living room',
  'LIVING': 'living room',
  'BR': 'bedroom',
  'BEDROOM': 'bedroom',
  'KIT': 'kitchen',
  'KITCHEN': 'kitchen',
  'BATH': 'bathroom',
  'BATHROOM': 'bathroom',
  'OFFICE': 'office',
  'DINING': 'dining room',
  'DR': 'dining room',
  'OUTDOOR': 'outdoor',
  'PATIO': 'patio',
};

/**
 * Extract furniture type from SKU
 * @param {string} sku - The SKU string (e.g., "TBL-LR-001")
 * @returns {string|null} - Furniture type or null
 */
export function extractFurnitureTypeFromSKU(sku) {
  if (!sku || typeof sku !== 'string') return null;
  
  const skuUpper = sku.toUpperCase();
  
  // Check each pattern
  for (const [pattern, furnitureType] of Object.entries(SKU_PATTERNS)) {
    if (skuUpper.includes(pattern)) {
      return furnitureType;
    }
  }
  
  return null;
}

/**
 * Extract room type from SKU
 * @param {string} sku - The SKU string
 * @returns {string[]} - Array of room types
 */
export function extractRoomTypesFromSKU(sku) {
  if (!sku || typeof sku !== 'string') return [];
  
  const skuUpper = sku.toUpperCase();
  const roomTypes = [];
  
  for (const [pattern, roomType] of Object.entries(ROOM_PATTERNS)) {
    if (skuUpper.includes(pattern)) {
      roomTypes.push(roomType);
    }
  }
  
  return roomTypes;
}

/**
 * Parse SKU to extract all information
 * @param {string} sku - The SKU string
 * @returns {object} - Parsed SKU information
 */
export function parseSKU(sku) {
  return {
    furnitureType: extractFurnitureTypeFromSKU(sku),
    roomTypes: extractRoomTypesFromSKU(sku),
    original: sku,
  };
}

