import { db } from '../config/firebaseAdmin.js';

/**
 * Get all inventory items
 */
export async function getInventory(req, res) {
  try {
    const snapshot = await db.collection('inventory').get();
    const inventory = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.json(inventory);
  } catch (error) {
    console.error('Error fetching inventory:', error);
    res.status(500).json({ error: 'Failed to fetch inventory' });
  }
}

/**
 * Create or update inventory item
 */
export async function upsertInventoryItem(req, res) {
  try {
    const { id, name, category, quantity, unit, minStock, cost } = req.body;

    const itemData = {
      name,
      category: category || 'General',
      quantity: parseFloat(quantity) || 0,
      unit: unit || 'pcs',
      minStock: parseFloat(minStock) || 0,
      cost: parseFloat(cost) || 0,
      updatedAt: new Date(),
    };

    if (id) {
      // Update existing
      await db.collection('inventory').doc(id).update(itemData);
      const updated = await db.collection('inventory').doc(id).get();
      res.json({ id: updated.id, ...updated.data() });
    } else {
      // Create new
      itemData.createdAt = new Date();
      const docRef = await db.collection('inventory').add(itemData);
      res.status(201).json({ id: docRef.id, ...itemData });
    }
  } catch (error) {
    console.error('Error saving inventory item:', error);
    res.status(500).json({ error: 'Failed to save inventory item' });
  }
}

/**
 * Delete inventory item
 */
export async function deleteInventoryItem(req, res) {
  try {
    const { id } = req.params;
    await db.collection('inventory').doc(id).delete();
    res.json({ message: 'Inventory item deleted successfully' });
  } catch (error) {
    console.error('Error deleting inventory item:', error);
    res.status(500).json({ error: 'Failed to delete inventory item' });
  }
}

/**
 * Get inventory items needed for a template
 */
export async function getTemplateInventory(req, res) {
  try {
    const { templateId } = req.params;
    const templateDoc = await db.collection('templates').doc(templateId).get();
    
    if (!templateDoc.exists) {
      return res.status(404).json({ error: 'Template not found' });
    }

    const template = templateDoc.data();
    const inventoryItems = template.requiredInventory || [];

    res.json(inventoryItems);
  } catch (error) {
    console.error('Error fetching template inventory:', error);
    res.status(500).json({ error: 'Failed to fetch template inventory' });
  }
}

