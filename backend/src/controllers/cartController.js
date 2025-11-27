import { db } from '../config/firebaseAdmin.js';
import { verifyAuth } from '../middleware/authMiddleware.js';

/**
 * Get user cart
 */
export async function getCart(req, res) {
  try {
    const userId = req.user.uid;
    const cartDoc = await db.collection('cart').doc(userId).get();

    if (!cartDoc.exists) {
      return res.json({ items: [] });
    }

    res.json(cartDoc.data());
  } catch (error) {
    console.error('Error fetching cart:', error);
    res.status(500).json({ error: 'Failed to fetch cart' });
  }
}

/**
 * Add item to cart
 */
export async function addToCart(req, res) {
  try {
    const userId = req.user.uid;
    const { templateId, customizations, price, quantity = 1, name, image } = req.body;

    if (!templateId || !price) {
      return res.status(400).json({ error: 'Template ID and price are required' });
    }

    const cartRef = db.collection('cart').doc(userId);
    const cartDoc = await cartRef.get();

    const item = {
      templateId,
      name: name || 'Template',
      image: image || '',
      customizations: customizations || {},
      price,
      quantity,
      addedAt: new Date(),
    };

    if (!cartDoc.exists) {
      await cartRef.set({ userId, items: [item] });
    } else {
      const cartData = cartDoc.data();
      const items = cartData.items || [];
      items.push(item);
      await cartRef.update({ items });
    }

    res.json({ message: 'Item added to cart', item });
  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(500).json({ error: 'Failed to add item to cart' });
  }
}

/**
 * Update cart item
 */
export async function updateCartItem(req, res) {
  try {
    const userId = req.user.uid;
    const { itemId } = req.params;
    const updates = req.body;

    const cartRef = db.collection('cart').doc(userId);
    const cartDoc = await cartRef.get();

    if (!cartDoc.exists) {
      return res.status(404).json({ error: 'Cart not found' });
    }

    const cartData = cartDoc.data();
    const items = cartData.items || [];
    const itemIndex = items.findIndex(item => item.templateId === itemId);

    if (itemIndex === -1) {
      return res.status(404).json({ error: 'Item not found in cart' });
    }

    items[itemIndex] = { ...items[itemIndex], ...updates };
    await cartRef.update({ items });

    res.json({ message: 'Cart item updated', item: items[itemIndex] });
  } catch (error) {
    console.error('Error updating cart item:', error);
    res.status(500).json({ error: 'Failed to update cart item' });
  }
}

/**
 * Remove item from cart
 */
export async function removeFromCart(req, res) {
  try {
    const userId = req.user.uid;
    const { itemId } = req.params;

    const cartRef = db.collection('cart').doc(userId);
    const cartDoc = await cartRef.get();

    if (!cartDoc.exists) {
      return res.status(404).json({ error: 'Cart not found' });
    }

    const cartData = cartDoc.data();
    const items = (cartData.items || []).filter(item => item.templateId !== itemId);
    await cartRef.update({ items });

    res.json({ message: 'Item removed from cart' });
  } catch (error) {
    console.error('Error removing from cart:', error);
    res.status(500).json({ error: 'Failed to remove item from cart' });
  }
}

