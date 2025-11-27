import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';

export const userService = {
  getAll: async (filters = {}) => {
    try {
      let q = collection(db, 'users');
      
      if (filters.blocked !== undefined) {
        q = query(q, where('blocked', '==', filters.blocked));
      }
      
      q = query(q, orderBy('createdAt', 'desc'));
      
      if (filters.limit) {
        q = query(q, limit(parseInt(filters.limit)));
      }
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error fetching users:', error);
      return [];
    }
  },

  getById: async (id) => {
    try {
      const docRef = doc(db, 'users', id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      }
      return null;
    } catch (error) {
      console.error('Error fetching user:', error);
      return null;
    }
  },

  getUserOrders: async (userId) => {
    try {
      const ordersRef = collection(db, 'orders');
      const q = query(
        ordersRef, 
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error fetching user orders:', error);
      return [];
    }
  },

  blockUser: async (userId, blocked = true) => {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        blocked,
        updatedAt: Timestamp.now(),
      });
    } catch (error) {
      console.error('Error blocking user:', error);
      throw error;
    }
  },

  updateUser: async (userId, data) => {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        ...data,
        updatedAt: Timestamp.now(),
      });
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  },

  updateLastActivity: async (userId) => {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        lastActivity: Timestamp.now(),
      });
    } catch (error) {
      console.error('Error updating user activity:', error);
    }
  },
};

