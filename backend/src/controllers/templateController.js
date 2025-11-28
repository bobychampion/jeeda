import { db } from '../config/firebaseAdmin.js';
import { Template } from '../models/Template.js';
import { invalidateCache } from '../services/templateIndexService.js';
import { Timestamp } from 'firebase-admin/firestore';

/**
 * Get all templates with optional filters
 */
export async function getTemplates(req, res) {
  try {
    if (!db) {
      console.error('Firestore database instance is not available');
      return res.status(500).json({ 
        error: 'Database connection not available',
        details: 'Firebase Admin SDK may not be properly initialized'
      });
    }

    const { category, difficulty, minPrice, maxPrice, material } = req.query;
    let query = db.collection('templates');

    if (category) {
      query = query.where('category', '==', category);
    }
    if (difficulty) {
      query = query.where('difficulty', '==', difficulty);
    }
    if (material) {
      query = query.where('availableMaterials', 'array-contains', material);
    }

    const snapshot = await query.get();
    let templates = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Filter by price range (client-side for now)
    if (minPrice || maxPrice) {
      templates = templates.filter(t => {
        const price = t.basePrice || 0;
        if (minPrice && price < parseFloat(minPrice)) return false;
        if (maxPrice && price > parseFloat(maxPrice)) return false;
        return true;
      });
    }

    console.log(`Fetched ${templates.length} templates from Firestore`);
    res.json(templates);
  } catch (error) {
    console.error('Error fetching templates:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      stack: error.stack?.split('\n').slice(0, 3).join('\n')
    });
    res.status(500).json({ 
      error: 'Failed to fetch templates',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

/**
 * Get single template by ID
 */
export async function getTemplate(req, res) {
  try {
    const { id } = req.params;
    const doc = await db.collection('templates').doc(id).get();

    if (!doc.exists) {
      return res.status(404).json({ error: 'Template not found' });
    }

    res.json({ id: doc.id, ...doc.data() });
  } catch (error) {
    console.error('Error fetching template:', error);
    res.status(500).json({ error: 'Failed to fetch template' });
  }
}

/**
 * Get templates by category
 */
export async function getTemplatesByCategory(req, res) {
  try {
    const { category } = req.params;
    const snapshot = await db.collection('templates')
      .where('category', '==', category)
      .get();

    const templates = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.json(templates);
  } catch (error) {
    console.error('Error fetching templates by category:', error);
    res.status(500).json({ error: 'Failed to fetch templates' });
  }
}

/**
 * Create new template (Admin only)
 */
export async function createTemplate(req, res) {
  try {
    const template = new Template(req.body);
    template.createdAt = new Date();
    template.updatedAt = new Date();

    const docRef = await db.collection('templates').add(template.toFirestore());
    
    // Invalidate cache when template is created
    invalidateCache();
    
    res.status(201).json({ id: docRef.id, ...template.toFirestore() });
  } catch (error) {
    console.error('Error creating template:', error);
    res.status(500).json({ error: 'Failed to create template' });
  }
}

/**
 * Update template (Admin only)
 */
export async function updateTemplate(req, res) {
  try {
    const { id } = req.params;
    const templateData = req.body;
    templateData.updatedAt = new Date();

    await db.collection('templates').doc(id).update(templateData);
    
    // Invalidate cache when template is updated
    invalidateCache();
    
    const updated = await db.collection('templates').doc(id).get();
    res.json({ id: updated.id, ...updated.data() });
  } catch (error) {
    console.error('Error updating template:', error);
    res.status(500).json({ error: 'Failed to update template' });
  }
}

/**
 * Delete template (Admin only)
 */
export async function deleteTemplate(req, res) {
  try {
    const { id } = req.params;
    await db.collection('templates').doc(id).delete();
    
    // Invalidate cache when template is deleted
    invalidateCache();
    
    res.json({ message: 'Template deleted successfully' });
  } catch (error) {
    console.error('Error deleting template:', error);
    res.status(500).json({ error: 'Failed to delete template' });
  }
}

/**
 * Randomly assign all templates to room categories (Admin only)
 */
export async function assignTemplatesToRooms(req, res) {
  try {
    // Fetch all room categories
    const categoriesSnapshot = await db.collection('categories')
      .where('type', '==', 'room')
      .get();
    
    if (categoriesSnapshot.empty) {
      return res.status(400).json({ 
        error: 'No room categories found. Please create room categories first.' 
      });
    }

    const roomCategories = categoriesSnapshot.docs.map(doc => doc.data().name);
    const categoryNames = roomCategories;

    // Fetch all templates
    const templatesSnapshot = await db.collection('templates').get();
    
    if (templatesSnapshot.empty) {
      return res.json({ 
        updated: 0, 
        skipped: 0, 
        distribution: {},
        message: 'No templates found' 
      });
    }

    const templates = templatesSnapshot.docs;
    let updated = 0;
    let skipped = 0;
    const distribution = {};

    // Initialize distribution counter
    categoryNames.forEach(name => {
      distribution[name] = 0;
    });

    // Batch update templates
    const batch = db.batch();
    const batchSize = 500; // Firestore batch limit
    let batchCount = 0;

    for (const templateDoc of templates) {
      const template = templateDoc.data();
      
      // Skip if template already has a valid room category
      const hasValidRoomCategory = categoryNames.includes(template.category);
      
      if (hasValidRoomCategory) {
        skipped++;
        distribution[template.category]++;
        continue;
      }

      // Randomly select a room category
      const randomIndex = Math.floor(Math.random() * categoryNames.length);
      const selectedCategory = categoryNames[randomIndex];

      // Add to batch
      const templateRef = db.collection('templates').doc(templateDoc.id);
      batch.update(templateRef, {
        category: selectedCategory,
        updatedAt: Timestamp.now(),
      });

      distribution[selectedCategory]++;
      updated++;
      batchCount++;

      // Commit batch if it reaches the limit
      if (batchCount >= batchSize) {
        await batch.commit();
        batchCount = 0;
      }
    }

    // Commit remaining updates
    if (batchCount > 0) {
      await batch.commit();
    }

    // Invalidate cache
    invalidateCache();

    res.json({
      updated,
      skipped,
      distribution,
      message: `Successfully assigned ${updated} templates to room categories`
    });
  } catch (error) {
    console.error('Error assigning templates to rooms:', error);
    res.status(500).json({ 
      error: 'Failed to assign templates to room categories',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

