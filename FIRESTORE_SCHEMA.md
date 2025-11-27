# Firestore Database Schema

This document describes the Firestore collections and their structure for the Replique Crafts admin dashboard.

## Collections

### 1. categories
```javascript
{
  id: string (auto-generated),
  name: string,
  description: string,
  imageUrl: string,
  order: number,
  hidden: boolean,
  aiAllowed: boolean,
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

### 2. templates
```javascript
{
  id: string (auto-generated),
  name: string,
  category: string,
  description: string,
  basePrice: number,
  sku: string,
  availableColors: string[],
  availableMaterials: string[],
  dimensions: {
    min: { width: number, height: number, depth: number },
    max: { width: number, height: number, depth: number },
    default: { width: number, height: number, depth: number }
  },
  priceMultipliers: {
    material: number,
    size: number,
    finishing: number
  },
  images: string[],
  difficulty: string, // 'Beginner', 'Intermediate', 'Advanced'
  estimatedBuildTime: string,
  requiredInventory: array,
  instructionId: string (optional),
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

### 3. inventory
```javascript
{
  id: string (auto-generated),
  name: string,
  category: string, // 'MDF', 'HDF', 'Ply', 'Marine Board', 'Hardware', 'Finishing', 'Tools', 'General'
  quantity: number,
  unit: string, // 'pcs', 'kg', 'm', 'sqm', 'l'
  minStock: number,
  reorderLevel: number,
  cost: number,
  supplierId: string (optional),
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

### 4. suppliers
```javascript
{
  id: string (auto-generated),
  name: string,
  contactPerson: string,
  email: string,
  phone: string,
  address: string,
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

### 5. orders
```javascript
{
  id: string (auto-generated),
  orderId: string,
  userId: string,
  items: array,
  totalAmount: number,
  status: string, // 'Order Received', 'Awaiting Production', 'In Production', 'Quality Check', 'Ready for Delivery', 'Out for Delivery', 'Delivered', 'Completed'
  deliveryAddress: object,
  assignedCarpenter: string (optional),
  assignedDeliveryTeam: string (optional),
  deliveryDate: Timestamp (optional),
  internalNotes: string (optional),
  paymentStatus: string,
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

### 6. deliveryTeams
```javascript
{
  id: string (auto-generated),
  name: string,
  driverName: string,
  driverPhone: string,
  vehicleNumber: string,
  capacity: number,
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

### 7. assemblyRequests
```javascript
{
  id: string (auto-generated),
  orderId: string,
  requestedDate: Timestamp,
  status: string, // 'pending', 'scheduled', 'completed'
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

### 8. aiConfig
```javascript
{
  id: 'settings' (single document),
  allowedCategories: string[],
  allowedCustomizations: {
    colorChanges: boolean,
    materialChanges: boolean,
    dimensionChanges: boolean
  },
  dimensionRanges: {
    minWidth: number,
    maxWidth: number,
    minHeight: number,
    maxHeight: number,
    minDepth: number,
    maxDepth: number
  },
  prohibitedRequests: string[],
  aiTone: string, // 'professional', 'friendly', 'casual'
  responseStyle: string, // 'helpful', 'concise', 'detailed'
  keywordRedirects: array,
  updatedAt: Timestamp
}
```

### 9. aiLogs
```javascript
{
  id: string (auto-generated),
  query: string,
  message: string,
  recommendations: string[],
  availableCategories: string[],
  timestamp: Timestamp
}
```

### 10. users
```javascript
{
  id: string (user UID),
  email: string,
  name: string,
  role: string, // 'user', 'admin', 'super_admin', 'inventory_manager', 'orders_manager', 'content_admin'
  blocked: boolean,
  lastActivity: Timestamp (optional),
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

### 11. promotions
```javascript
{
  id: string (auto-generated),
  code: string,
  type: string, // 'percentage', 'fixed', 'free_delivery', 'first_time'
  value: number,
  description: string,
  startDate: Timestamp,
  endDate: Timestamp,
  maxUsage: number (optional),
  usageCount: number,
  active: boolean,
  categoryId: string (optional),
  minPurchaseAmount: number (optional),
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

### 12. instructions
```javascript
{
  id: string (auto-generated),
  templateId: string,
  templateName: string,
  title: string,
  materials: string[],
  tools: string[],
  steps: array, // [{ stepNumber: number, title: string, description: string, imageUrl: string }]
  tips: string[],
  warnings: string[],
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

## Firestore Security Rules

Update your Firestore security rules in the Firebase Console:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isAdmin() {
      return isAuthenticated() && 
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    function isSuperAdmin() {
      return isAuthenticated() && 
             (get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin' ||
              get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'super_admin');
    }
    
    // Users collection
    match /users/{userId} {
      allow read: if isAuthenticated();
      allow write: if isAuthenticated() && request.auth.uid == userId;
      allow create: if isAuthenticated();
      allow update, delete: if isSuperAdmin();
    }
    
    // Categories collection
    match /categories/{categoryId} {
      allow read: if true; // Public read
      allow write: if isSuperAdmin();
    }
    
    // Templates collection
    match /templates/{templateId} {
      allow read: if true; // Public read
      allow write: if isSuperAdmin();
    }
    
    // Inventory collection
    match /inventory/{itemId} {
      allow read: if isAuthenticated();
      allow write: if isSuperAdmin();
    }
    
    // Suppliers collection
    match /suppliers/{supplierId} {
      allow read: if isAuthenticated();
      allow write: if isSuperAdmin();
    }
    
    // Orders collection
    match /orders/{orderId} {
      allow read: if isAuthenticated() && 
                     (request.auth.uid == resource.data.userId || isSuperAdmin());
      allow create: if isAuthenticated();
      allow update: if isSuperAdmin();
    }
    
    // Delivery teams collection
    match /deliveryTeams/{teamId} {
      allow read: if isAuthenticated();
      allow write: if isSuperAdmin();
    }
    
    // Assembly requests collection
    match /assemblyRequests/{requestId} {
      allow read: if isAuthenticated();
      allow write: if isSuperAdmin();
    }
    
    // AI Config collection
    match /aiConfig/{configId} {
      allow read: if isAuthenticated();
      allow write: if isSuperAdmin();
    }
    
    // AI Logs collection
    match /aiLogs/{logId} {
      allow read: if isSuperAdmin();
      allow create: if isAuthenticated();
    }
    
    // Promotions collection
    match /promotions/{promotionId} {
      allow read: if true; // Public read for applying promotions
      allow write: if isSuperAdmin();
    }
    
    // Instructions collection
    match /instructions/{instructionId} {
      allow read: if true; // Public read
      allow write: if isSuperAdmin();
    }
    
    // Cart collection
    match /cart/{userId} {
      allow read, write: if isAuthenticated() && request.auth.uid == userId;
    }
  }
}
```

## Indexes Required

Create the following composite indexes in Firestore:

1. **categories**: `order` (ascending)
2. **orders**: `userId` (ascending), `createdAt` (descending)
3. **orders**: `status` (ascending), `createdAt` (descending)
4. **aiLogs**: `timestamp` (descending)
5. **promotions**: `startDate` (ascending), `endDate` (ascending)
6. **assemblyRequests**: `status` (ascending), `requestedDate` (descending)

## Notes

- All timestamps should use Firestore `Timestamp` type
- All prices are stored as numbers (in Naira)
- The `users` collection uses Firebase Auth UID as document ID
- The `aiConfig` collection has a single document with ID 'settings'
- Auto-deduction of inventory happens client-side when orders are placed (can be moved to Cloud Functions later)

