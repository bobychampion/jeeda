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
  Timestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { getRecommendations } from './aiService';

export const instructionService = {
  getByTemplateId: async (templateId) => {
    try {
      const instructionsRef = collection(db, 'instructions');
      const q = query(instructionsRef, where('templateId', '==', templateId));
      const snapshot = await getDocs(q);
      if (snapshot.empty) return null;
      const doc = snapshot.docs[0];
      return { id: doc.id, ...doc.data() };
    } catch (error) {
      console.error('Error fetching instructions:', error);
      return null;
    }
  },

  getAll: async () => {
    try {
      const instructionsRef = collection(db, 'instructions');
      const snapshot = await getDocs(instructionsRef);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error fetching instructions:', error);
      return [];
    }
  },

  create: async (data) => {
    try {
      const instructionsRef = collection(db, 'instructions');
      const docRef = await addDoc(instructionsRef, {
        ...data,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
      return { id: docRef.id, ...data };
    } catch (error) {
      console.error('Error creating instructions:', error);
      throw error;
    }
  },

  update: async (id, data) => {
    try {
      const instructionRef = doc(db, 'instructions', id);
      await updateDoc(instructionRef, {
        ...data,
        updatedAt: Timestamp.now(),
      });
      return { id, ...data };
    } catch (error) {
      console.error('Error updating instructions:', error);
      throw error;
    }
  },

  delete: async (id) => {
    try {
      const instructionRef = doc(db, 'instructions', id);
      await deleteDoc(instructionRef);
    } catch (error) {
      console.error('Error deleting instructions:', error);
      throw error;
    }
  },

  generateAIDraft: async (templateData) => {
    try {
      const prompt = `Generate assembly instructions for a ${templateData.name} (${templateData.category}).
      
Template Details:
- Name: ${templateData.name}
- Category: ${templateData.category}
- Difficulty: ${templateData.difficulty || 'Beginner'}
- Estimated Build Time: ${templateData.estimatedBuildTime || 'N/A'}
- Materials: ${templateData.availableMaterials?.join(', ') || 'N/A'}

Create step-by-step assembly instructions in JSON format:
{
  "title": "Assembly Instructions for [Template Name]",
  "materials": ["list", "of", "materials"],
  "tools": ["list", "of", "tools"],
  "steps": [
    {
      "stepNumber": 1,
      "title": "Step title",
      "description": "Detailed instructions",
      "imageUrl": "optional"
    }
  ],
  "tips": ["tip1", "tip2"],
  "warnings": ["warning1", "warning2"]
}`;

      const response = await getRecommendations(prompt);
      // Parse the response to extract JSON
      let jsonText = response.message || '';
      if (jsonText.includes('{')) {
        const start = jsonText.indexOf('{');
        const end = jsonText.lastIndexOf('}') + 1;
        jsonText = jsonText.substring(start, end);
        return JSON.parse(jsonText);
      }
      throw new Error('Could not parse AI response');
    } catch (error) {
      console.error('Error generating AI draft:', error);
      // Return a basic template
      return {
        title: `Assembly Instructions for ${templateData.name}`,
        materials: templateData.availableMaterials || [],
        tools: ['Screwdriver', 'Hammer', 'Measuring Tape'],
        steps: [
          {
            stepNumber: 1,
            title: 'Prepare Materials',
            description: 'Gather all required materials and tools.',
          },
        ],
        tips: [],
        warnings: [],
      };
    }
  },
};

