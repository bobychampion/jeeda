import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';

/**
 * Chat History Service
 * Manages user chat conversations with AI assistant
 */
export const chatService = {
  /**
   * Save a chat message to user's conversation history
   * @param {string} userId - User ID
   * @param {Object} message - Message object with type, text, recommendations, etc.
   * @param {string} conversationId - Optional conversation ID (creates new if not provided)
   * @returns {Promise<string>} - Conversation ID
   */
  saveMessage: async (userId, message, conversationId = null) => {
    try {
      if (!userId) {
        throw new Error('User ID is required');
      }

      const conversationsRef = collection(db, 'aiConversations');
      
      if (conversationId) {
        // Add message to existing conversation
        const conversationRef = doc(db, 'aiConversations', conversationId);
        const conversationDoc = await getDoc(conversationRef);
        
        if (conversationDoc.exists()) {
          const conversation = conversationDoc.data();
          await updateDoc(conversationRef, {
            messages: [...(conversation.messages || []), {
              ...message,
              timestamp: Timestamp.now(),
            }],
            updatedAt: Timestamp.now(),
          });
          return conversationId;
        }
      }

      // Create new conversation
      const newConversation = {
        userId,
        messages: [{
          ...message,
          timestamp: Timestamp.now(),
        }],
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      const docRef = await addDoc(conversationsRef, newConversation);
      return docRef.id;
    } catch (error) {
      console.error('Error saving chat message:', error);
      throw error;
    }
  },

  /**
   * Get user's conversation history
   * @param {string} userId - User ID
   * @param {string} conversationId - Optional specific conversation ID
   * @returns {Promise<Array>} - Array of conversations or single conversation
   */
  getConversations: async (userId, conversationId = null) => {
    try {
      if (!userId) {
        return [];
      }

      if (conversationId) {
        // Get specific conversation
        const conversationRef = doc(db, 'aiConversations', conversationId);
        const conversationDoc = await getDoc(conversationRef);
        
        if (conversationDoc.exists()) {
          const data = conversationDoc.data();
          // Verify it belongs to the user
          if (data.userId === userId) {
            return { id: conversationDoc.id, ...data };
          }
        }
        return null;
      }

      // Get all conversations for user
      const conversationsRef = collection(db, 'aiConversations');
      const q = query(
        conversationsRef,
        where('userId', '==', userId),
        orderBy('updatedAt', 'desc'),
        limit(50)
      );
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      console.error('Error fetching conversations:', error);
      return [];
    }
  },

  /**
   * Get the most recent conversation for a user
   * @param {string} userId - User ID
   * @returns {Promise<Object|null>} - Most recent conversation or null
   */
  getLatestConversation: async (userId) => {
    try {
      if (!userId) {
        return null;
      }

      const conversationsRef = collection(db, 'aiConversations');
      const q = query(
        conversationsRef,
        where('userId', '==', userId),
        orderBy('updatedAt', 'desc'),
        limit(1)
      );
      
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        const doc = snapshot.docs[0];
        return {
          id: doc.id,
          ...doc.data(),
        };
      }
      return null;
    } catch (error) {
      console.error('Error fetching latest conversation:', error);
      return null;
    }
  },

  /**
   * Update an existing conversation with new messages
   * @param {string} conversationId - Conversation ID
   * @param {Array} messages - Updated messages array
   * @returns {Promise<void>}
   */
  updateConversation: async (conversationId, messages) => {
    try {
      const conversationRef = doc(db, 'aiConversations', conversationId);
      await updateDoc(conversationRef, {
        messages,
        updatedAt: Timestamp.now(),
      });
    } catch (error) {
      console.error('Error updating conversation:', error);
      throw error;
    }
  },
};

