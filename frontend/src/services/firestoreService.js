import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  setDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';

// Templates Service
export const templatesService = {
  getAll: async (filters = {}) => {
    try {
      let q = collection(db, 'templates');
      
      if (filters.category) {
        q = query(q, where('category', '==', filters.category));
      }
      if (filters.difficulty) {
        q = query(q, where('difficulty', '==', filters.difficulty));
      }
      if (filters.material) {
        q = query(q, where('availableMaterials', 'array-contains', filters.material));
      }
      
      const snapshot = await getDocs(q);
      let templates = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      // Filter by room type (client-side since Firestore doesn't support array-contains-any easily)
      if (filters.roomType) {
        const roomTypeLower = filters.roomType.toLowerCase();
        templates = templates.filter(t => {
          const roomTypes = (t.roomTypes || []).map(rt => rt.toLowerCase());
          return roomTypes.includes(roomTypeLower);
        });
      }
      
      // Filter by price range (client-side)
      if (filters.minPrice || filters.maxPrice) {
        templates = templates.filter(t => {
          const price = t.basePrice || 0;
          if (filters.minPrice && price < parseFloat(filters.minPrice)) return false;
          if (filters.maxPrice && price > parseFloat(filters.maxPrice)) return false;
          return true;
        });
      }
      
      return templates;
    } catch (error) {
      console.error('Error fetching templates:', error);
      return [];
    }
  },

  getById: async (id) => {
    try {
      const docRef = doc(db, 'templates', id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      }
      return null;
    } catch (error) {
      console.error('Error fetching template:', error);
      return null;
    }
  },

  getByCategory: async (category) => {
    try {
      const templatesRef = collection(db, 'templates');
      const q = query(templatesRef, where('category', '==', category));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error fetching templates by category:', error);
      return [];
    }
  },

  create: async (data) => {
    try {
      const templatesRef = collection(db, 'templates');
      const docRef = await addDoc(templatesRef, {
        ...data,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
      return { id: docRef.id, ...data };
    } catch (error) {
      console.error('Error creating template:', error);
      throw error;
    }
  },

  update: async (id, data) => {
    try {
      const templateRef = doc(db, 'templates', id);
      await updateDoc(templateRef, {
        ...data,
        updatedAt: Timestamp.now(),
      });
      return { id, ...data };
    } catch (error) {
      console.error('Error updating template:', error);
      throw error;
    }
  },

  delete: async (id) => {
    try {
      const templateRef = doc(db, 'templates', id);
      await deleteDoc(templateRef);
    } catch (error) {
      console.error('Error deleting template:', error);
      throw error;
    }
  },
};

// Orders Service
export const ordersService = {
  getUserOrders: async (userId) => {
    try {
      const ordersRef = collection(db, 'orders');
      const q = query(ordersRef, where('userId', '==', userId), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error fetching user orders:', error);
      return [];
    }
  },

  getAll: async (filters = {}) => {
    try {
      let q = collection(db, 'orders');
      
      if (filters.status) {
        q = query(q, where('status', '==', filters.status));
      }
      
      q = query(q, orderBy('createdAt', 'desc'));
      if (filters.limit) {
        q = query(q, limit(parseInt(filters.limit)));
      }
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error fetching orders:', error);
      return [];
    }
  },

  getById: async (id) => {
    try {
      const docRef = doc(db, 'orders', id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      }
      return null;
    } catch (error) {
      console.error('Error fetching order:', error);
      return null;
    }
  },

  create: async (userId, orderData) => {
    try {
      const ordersRef = collection(db, 'orders');
      const orderId = `RC-${Date.now()}`;
      const docRef = await addDoc(ordersRef, {
        ...orderData,
        userId,
        orderId,
        status: 'Processing',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
      return { id: docRef.id, orderId, ...orderData };
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  },

  updateStatus: async (id, status) => {
    try {
      const orderRef = doc(db, 'orders', id);
      await updateDoc(orderRef, {
        status,
        updatedAt: Timestamp.now(),
      });
    } catch (error) {
      console.error('Error updating order status:', error);
      throw error;
    }
  },
};

// Inventory Service
export const inventoryService = {
  getAll: async () => {
    try {
      const inventoryRef = collection(db, 'inventory');
      const snapshot = await getDocs(inventoryRef);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error fetching inventory:', error);
      return [];
    }
  },

  getById: async (id) => {
    try {
      const docRef = doc(db, 'inventory', id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      }
      return null;
    } catch (error) {
      console.error('Error fetching inventory item:', error);
      return null;
    }
  },

  create: async (data) => {
    try {
      const inventoryRef = collection(db, 'inventory');
      const docRef = await addDoc(inventoryRef, {
        ...data,
        quantity: parseFloat(data.quantity) || 0,
        minStock: parseFloat(data.minStock) || 0,
        cost: parseFloat(data.cost) || 0,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
      return { id: docRef.id, ...data };
    } catch (error) {
      console.error('Error creating inventory item:', error);
      throw error;
    }
  },

  update: async (id, data) => {
    try {
      const itemRef = doc(db, 'inventory', id);
      await updateDoc(itemRef, {
        ...data,
        quantity: parseFloat(data.quantity) || 0,
        minStock: parseFloat(data.minStock) || 0,
        cost: parseFloat(data.cost) || 0,
        updatedAt: Timestamp.now(),
      });
      return { id, ...data };
    } catch (error) {
      console.error('Error updating inventory item:', error);
      throw error;
    }
  },

  delete: async (id) => {
    try {
      const itemRef = doc(db, 'inventory', id);
      await deleteDoc(itemRef);
    } catch (error) {
      console.error('Error deleting inventory item:', error);
      throw error;
    }
  },
};

// Cart Service
export const cartService = {
  get: async (userId) => {
    try {
      const cartRef = doc(db, 'cart', userId);
      const cartSnap = await getDoc(cartRef);
      if (cartSnap.exists()) {
        return cartSnap.data();
      }
      return { items: [] };
    } catch (error) {
      console.error('Error fetching cart:', error);
      return { items: [] };
    }
  },

  addItem: async (userId, item) => {
    try {
      const cartRef = doc(db, 'cart', userId);
      const cartSnap = await getDoc(cartRef);
      
      if (cartSnap.exists()) {
        const cartData = cartSnap.data();
        const items = cartData.items || [];
        items.push({
          ...item,
          addedAt: Timestamp.now(),
        });
        await updateDoc(cartRef, { items });
      } else {
        await setDoc(cartRef, { 
          userId, 
          items: [{
            ...item,
            addedAt: Timestamp.now(),
          }] 
        });
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      throw error;
    }
  },

  updateItem: async (userId, itemId, updates) => {
    try {
      const cartRef = doc(db, 'cart', userId);
      const cartSnap = await getDoc(cartRef);
      
      if (cartSnap.exists()) {
        const cartData = cartSnap.data();
        const items = cartData.items || [];
        const index = items.findIndex(item => item.templateId === itemId);
        if (index !== -1) {
          items[index] = { ...items[index], ...updates };
          await updateDoc(cartRef, { items });
        }
      }
    } catch (error) {
      console.error('Error updating cart item:', error);
      throw error;
    }
  },

  removeItem: async (userId, itemId) => {
    try {
      const cartRef = doc(db, 'cart', userId);
      const cartSnap = await getDoc(cartRef);
      
      if (cartSnap.exists()) {
        const cartData = cartSnap.data();
        const items = (cartData.items || []).filter(item => item.templateId !== itemId);
        await updateDoc(cartRef, { items });
      }
    } catch (error) {
      console.error('Error removing from cart:', error);
      throw error;
    }
  },

  clear: async (userId) => {
    try {
      const cartRef = doc(db, 'cart', userId);
      await deleteDoc(cartRef);
    } catch (error) {
      console.error('Error clearing cart:', error);
      throw error;
    }
  },
};

// Statistics Service
export const statsService = {
  getDashboardStats: async () => {
    try {
      const [ordersSnap, templatesSnap, usersSnap] = await Promise.all([
        getDocs(collection(db, 'orders')),
        getDocs(collection(db, 'templates')),
        getDocs(collection(db, 'users')),
      ]);

      const orders = ordersSnap.docs.map(doc => doc.data());
      
      return {
        totalOrders: orders.length,
        totalRevenue: orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0),
        totalTemplates: templatesSnap.size,
        totalUsers: usersSnap.size,
        ordersByStatus: {
          Processing: orders.filter(o => o.status === 'Processing').length,
          'Out for Delivery': orders.filter(o => o.status === 'Out for Delivery').length,
          Delivered: orders.filter(o => o.status === 'Delivered').length,
        },
      };
    } catch (error) {
      console.error('Error fetching stats:', error);
      return {
        totalOrders: 0,
        totalRevenue: 0,
        totalTemplates: 0,
        totalUsers: 0,
        ordersByStatus: {
          Processing: 0,
          'Out for Delivery': 0,
          Delivered: 0,
        },
      };
    }
  },
};

// Custom Requests Service
export const customRequestsService = {
  create: async (data) => {
    try {
      const requestsRef = collection(db, 'customRequests');
      const docRef = await addDoc(requestsRef, {
        ...data,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
      return { id: docRef.id, ...data };
    } catch (error) {
      console.error('Error creating custom request:', error);
      throw error;
    }
  },

  getUserRequests: async (userId) => {
    try {
      const requestsRef = collection(db, 'customRequests');
      const q = query(
        requestsRef,
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error fetching user custom requests:', error);
      return [];
    }
  },

  getById: async (id) => {
    try {
      const docRef = doc(db, 'customRequests', id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      }
      return null;
    } catch (error) {
      console.error('Error fetching custom request:', error);
      return null;
    }
  },

  update: async (id, data) => {
    try {
      const requestRef = doc(db, 'customRequests', id);
      await updateDoc(requestRef, {
        ...data,
        updatedAt: Timestamp.now(),
      });
      return { id, ...data };
    } catch (error) {
      console.error('Error updating custom request:', error);
      throw error;
    }
  },

  getAll: async (filters = {}) => {
    try {
      let q = collection(db, 'customRequests');
      
      if (filters.status) {
        q = query(q, where('status', '==', filters.status));
      }
      
      q = query(q, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error fetching custom requests:', error);
      return [];
    }
  },
};

