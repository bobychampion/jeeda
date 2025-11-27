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

export const deliveryService = {
  // Delivery Teams
  getTeams: async () => {
    try {
      const teamsRef = collection(db, 'deliveryTeams');
      const snapshot = await getDocs(teamsRef);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error fetching delivery teams:', error);
      return [];
    }
  },

  createTeam: async (data) => {
    try {
      const teamsRef = collection(db, 'deliveryTeams');
      const docRef = await addDoc(teamsRef, {
        ...data,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
      return { id: docRef.id, ...data };
    } catch (error) {
      console.error('Error creating delivery team:', error);
      throw error;
    }
  },

  updateTeam: async (id, data) => {
    try {
      const teamRef = doc(db, 'deliveryTeams', id);
      await updateDoc(teamRef, {
        ...data,
        updatedAt: Timestamp.now(),
      });
    } catch (error) {
      console.error('Error updating delivery team:', error);
      throw error;
    }
  },

  deleteTeam: async (id) => {
    try {
      const teamRef = doc(db, 'deliveryTeams', id);
      await deleteDoc(teamRef);
    } catch (error) {
      console.error('Error deleting delivery team:', error);
      throw error;
    }
  },

  // Assembly Requests
  getAssemblyRequests: async (filters = {}) => {
    try {
      let q = collection(db, 'assemblyRequests');
      if (filters.status) {
        q = query(q, where('status', '==', filters.status));
      }
      q = query(q, orderBy('requestedDate', 'desc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error fetching assembly requests:', error);
      return [];
    }
  },

  createAssemblyRequest: async (data) => {
    try {
      const requestsRef = collection(db, 'assemblyRequests');
      const docRef = await addDoc(requestsRef, {
        ...data,
        status: 'pending',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
      return { id: docRef.id, ...data };
    } catch (error) {
      console.error('Error creating assembly request:', error);
      throw error;
    }
  },

  updateAssemblyRequest: async (id, data) => {
    try {
      const requestRef = doc(db, 'assemblyRequests', id);
      await updateDoc(requestRef, {
        ...data,
        updatedAt: Timestamp.now(),
      });
    } catch (error) {
      console.error('Error updating assembly request:', error);
      throw error;
    }
  },

  // Schedule Delivery
  scheduleDelivery: async (orderId, deliveryData) => {
    try {
      const orderRef = doc(db, 'orders', orderId);
      await updateDoc(orderRef, {
        deliveryDate: deliveryData.deliveryDate,
        assignedDeliveryTeam: deliveryData.teamId,
        assignedDriver: deliveryData.driverId,
        deliveryNotes: deliveryData.notes,
        updatedAt: Timestamp.now(),
      });
    } catch (error) {
      console.error('Error scheduling delivery:', error);
      throw error;
    }
  },
};

