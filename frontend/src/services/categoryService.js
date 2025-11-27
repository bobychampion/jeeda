import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  query,
  orderBy,
  Timestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';

export const categoryService = {
  getAll: async (filters = {}) => {
    try {
      const categoriesRef = collection(db, 'categories');
      let q = query(categoriesRef, orderBy('order', 'asc'));
      
      // Filter by type if specified (room vs furniture)
      if (filters.type) {
        const { where } = await import('firebase/firestore');
        q = query(q, where('type', '==', filters.type));
      }
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error fetching categories:', error);
      return [];
    }
  },

  getRoomCategories: async () => {
    return categoryService.getAll({ type: 'room' });
  },

  getFurnitureCategories: async () => {
    try {
      const categoriesRef = collection(db, 'categories');
      const q = query(categoriesRef, orderBy('order', 'asc'));
      const snapshot = await getDocs(q);
      // Return categories that don't have type='room' or have type='furniture'
      return snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(cat => cat.type !== 'room');
    } catch (error) {
      console.error('Error fetching furniture categories:', error);
      return [];
    }
  },

  getById: async (id) => {
    try {
      const docRef = doc(db, 'categories', id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      }
      return null;
    } catch (error) {
      console.error('Error fetching category:', error);
      return null;
    }
  },

  create: async (data) => {
    try {
      const categoriesRef = collection(db, 'categories');
      const allCategories = await categoryService.getAll();
      const maxOrder = allCategories.length > 0 
        ? Math.max(...allCategories.map(c => c.order || 0))
        : 0;
      
      const docRef = await addDoc(categoriesRef, {
        ...data,
        order: maxOrder + 1,
        hidden: data.hidden || false,
        aiAllowed: data.aiAllowed !== undefined ? data.aiAllowed : true,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
      return { id: docRef.id, ...data };
    } catch (error) {
      console.error('Error creating category:', error);
      throw error;
    }
  },

  update: async (id, data) => {
    try {
      const categoryRef = doc(db, 'categories', id);
      await updateDoc(categoryRef, {
        ...data,
        updatedAt: Timestamp.now(),
      });
      return { id, ...data };
    } catch (error) {
      console.error('Error updating category:', error);
      throw error;
    }
  },

  updateOrder: async (categories) => {
    try {
      const updatePromises = categories.map((cat, index) => {
        const categoryRef = doc(db, 'categories', cat.id);
        return updateDoc(categoryRef, {
          order: index + 1,
          updatedAt: Timestamp.now(),
        });
      });
      await Promise.all(updatePromises);
    } catch (error) {
      console.error('Error updating category order:', error);
      throw error;
    }
  },

  delete: async (id) => {
    try {
      const categoryRef = doc(db, 'categories', id);
      await deleteDoc(categoryRef);
    } catch (error) {
      console.error('Error deleting category:', error);
      throw error;
    }
  },
};

