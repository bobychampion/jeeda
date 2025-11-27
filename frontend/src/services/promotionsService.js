import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';

export const promotionsService = {
  getAll: async (filters = {}) => {
    try {
      let q = collection(db, 'promotions');
      
      if (filters.active !== undefined) {
        const now = Timestamp.now();
        if (filters.active) {
          q = query(q, where('startDate', '<=', now), where('endDate', '>=', now));
        }
      }
      
      q = query(q, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error fetching promotions:', error);
      return [];
    }
  },

  getById: async (id) => {
    try {
      const docRef = doc(db, 'promotions', id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      }
      return null;
    } catch (error) {
      console.error('Error fetching promotion:', error);
      return null;
    }
  },

  getByCode: async (code) => {
    try {
      const promotionsRef = collection(db, 'promotions');
      const q = query(promotionsRef, where('code', '==', code.toUpperCase()));
      const snapshot = await getDocs(q);
      if (snapshot.empty) return null;
      const doc = snapshot.docs[0];
      const data = doc.data();
      
      // Check if promotion is active
      const now = Timestamp.now();
      if (data.startDate <= now && data.endDate >= now && data.active) {
        return { id: doc.id, ...data };
      }
      return null;
    } catch (error) {
      console.error('Error fetching promotion by code:', error);
      return null;
    }
  },

  create: async (data) => {
    try {
      const promotionsRef = collection(db, 'promotions');
      const promotionData = {
        ...data,
        code: data.code.toUpperCase(),
        active: data.active !== undefined ? data.active : true,
        usageCount: 0,
        maxUsage: data.maxUsage || null,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };
      
      const docRef = await addDoc(promotionsRef, promotionData);
      return { id: docRef.id, ...promotionData };
    } catch (error) {
      console.error('Error creating promotion:', error);
      throw error;
    }
  },

  update: async (id, data) => {
    try {
      const promotionRef = doc(db, 'promotions', id);
      await updateDoc(promotionRef, {
        ...data,
        code: data.code ? data.code.toUpperCase() : undefined,
        updatedAt: Timestamp.now(),
      });
      return { id, ...data };
    } catch (error) {
      console.error('Error updating promotion:', error);
      throw error;
    }
  },

  delete: async (id) => {
    try {
      const promotionRef = doc(db, 'promotions', id);
      await deleteDoc(promotionRef);
    } catch (error) {
      console.error('Error deleting promotion:', error);
      throw error;
    }
  },

  applyPromotion: async (code, orderData) => {
    try {
      const promotion = await promotionsService.getByCode(code);
      if (!promotion) {
        throw new Error('Invalid or expired promotion code');
      }

      // Check usage limits
      if (promotion.maxUsage && promotion.usageCount >= promotion.maxUsage) {
        throw new Error('Promotion limit reached');
      }

      let discount = 0;
      let discountType = promotion.type; // 'percentage', 'fixed', 'free_delivery', 'first_time'

      if (promotion.type === 'percentage') {
        discount = (orderData.subtotal * promotion.value) / 100;
      } else if (promotion.type === 'fixed') {
        discount = promotion.value;
      } else if (promotion.type === 'free_delivery') {
        discount = orderData.deliveryFee || 0;
      }

      // Increment usage count
      const promotionRef = doc(db, 'promotions', promotion.id);
      await updateDoc(promotionRef, {
        usageCount: (promotion.usageCount || 0) + 1,
        updatedAt: Timestamp.now(),
      });

      return {
        promotionId: promotion.id,
        code: promotion.code,
        discount,
        discountType,
        description: promotion.description,
      };
    } catch (error) {
      console.error('Error applying promotion:', error);
      throw error;
    }
  },
};

