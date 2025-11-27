/**
 * Role service for managing admin roles and permissions
 * Currently supports Super Admin only, but structured for future role expansion
 */

export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  INVENTORY_MANAGER: 'inventory_manager',
  ORDERS_MANAGER: 'orders_manager',
  CONTENT_ADMIN: 'content_admin',
  USER: 'user',
};

export const PERMISSIONS = {
  // Template Management
  MANAGE_TEMPLATES: 'manage_templates',
  VIEW_TEMPLATES: 'view_templates',
  
  // Category Management
  MANAGE_CATEGORIES: 'manage_categories',
  VIEW_CATEGORIES: 'view_categories',
  
  // Inventory
  MANAGE_INVENTORY: 'manage_inventory',
  VIEW_INVENTORY: 'view_inventory',
  
  // Orders
  MANAGE_ORDERS: 'manage_orders',
  VIEW_ORDERS: 'view_orders',
  UPDATE_ORDER_STATUS: 'update_order_status',
  
  // Delivery
  MANAGE_DELIVERY: 'manage_delivery',
  VIEW_DELIVERY: 'view_delivery',
  
  // AI
  MANAGE_AI_SETTINGS: 'manage_ai_settings',
  VIEW_AI_LOGS: 'view_ai_logs',
  
  // Users
  MANAGE_USERS: 'manage_users',
  VIEW_USERS: 'view_users',
  BLOCK_USERS: 'block_users',
  
  // Promotions
  MANAGE_PROMOTIONS: 'manage_promotions',
  VIEW_PROMOTIONS: 'view_promotions',
  
  // Analytics
  VIEW_ANALYTICS: 'view_analytics',
  
  // Instructions
  MANAGE_INSTRUCTIONS: 'manage_instructions',
  VIEW_INSTRUCTIONS: 'view_instructions',
  
  // Settings
  MANAGE_SETTINGS: 'manage_settings',
  MANAGE_ADMINS: 'manage_admins',
};

// Role to permissions mapping
const ROLE_PERMISSIONS = {
  [ROLES.SUPER_ADMIN]: Object.values(PERMISSIONS), // All permissions
  [ROLES.INVENTORY_MANAGER]: [
    PERMISSIONS.VIEW_TEMPLATES,
    PERMISSIONS.MANAGE_INVENTORY,
    PERMISSIONS.VIEW_INVENTORY,
    PERMISSIONS.VIEW_ORDERS,
  ],
  [ROLES.ORDERS_MANAGER]: [
    PERMISSIONS.VIEW_TEMPLATES,
    PERMISSIONS.VIEW_INVENTORY,
    PERMISSIONS.MANAGE_ORDERS,
    PERMISSIONS.VIEW_ORDERS,
    PERMISSIONS.UPDATE_ORDER_STATUS,
    PERMISSIONS.MANAGE_DELIVERY,
    PERMISSIONS.VIEW_DELIVERY,
  ],
  [ROLES.CONTENT_ADMIN]: [
    PERMISSIONS.MANAGE_TEMPLATES,
    PERMISSIONS.VIEW_TEMPLATES,
    PERMISSIONS.MANAGE_CATEGORIES,
    PERMISSIONS.VIEW_CATEGORIES,
    PERMISSIONS.MANAGE_INSTRUCTIONS,
    PERMISSIONS.VIEW_INSTRUCTIONS,
  ],
  [ROLES.USER]: [], // No admin permissions
};

export const roleService = {
  hasPermission: (userRole, permission) => {
    if (!userRole) return false;
    const permissions = ROLE_PERMISSIONS[userRole] || [];
    return permissions.includes(permission);
  },

  hasAnyPermission: (userRole, permissionList) => {
    return permissionList.some(permission => roleService.hasPermission(userRole, permission));
  },

  hasAllPermissions: (userRole, permissionList) => {
    return permissionList.every(permission => roleService.hasPermission(userRole, permission));
  },

  getPermissions: (userRole) => {
    return ROLE_PERMISSIONS[userRole] || [];
  },

  isSuperAdmin: (userRole) => {
    return userRole === ROLES.SUPER_ADMIN || userRole === 'admin'; // Support legacy 'admin' role
  },
};

