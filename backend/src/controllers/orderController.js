import { db } from '../config/firebaseAdmin.js';
import { Order } from '../models/Order.js';
import { verifyAuth } from '../middleware/authMiddleware.js';
import PDFDocument from 'pdfkit';

/**
 * Create new order
 */
export async function createOrder(req, res) {
  try {
    await verifyAuth(req, res, async () => {
      const userId = req.user.uid;
      const orderData = req.body;

      const order = new Order({
        ...orderData,
        userId,
        status: 'Processing',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Generate order ID
      const orderId = order.generateOrderId();
      
      const docRef = await db.collection('orders').add({
        ...order.toFirestore(),
        orderId,
      });

      // Update custom request status if any items are custom requests
      if (orderData.items) {
        for (const item of orderData.items) {
          if (item.customRequestId) {
            try {
              await db.collection('customRequests').doc(item.customRequestId).update({
                status: 'in_cart',
                updatedAt: new Date(),
              });
            } catch (error) {
              console.error(`Error updating custom request ${item.customRequestId}:`, error);
              // Don't fail the order creation if custom request update fails
            }
          }
        }
      }

      // Clear cart after order creation
      await db.collection('cart').doc(userId).delete();

      res.status(201).json({ 
        id: docRef.id, 
        orderId,
        ...order.toFirestore() 
      });
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
}

/**
 * Get user orders
 */
export async function getUserOrders(req, res) {
  try {
    await verifyAuth(req, res, async () => {
      const userId = req.user.uid;
      const snapshot = await db.collection('orders')
        .where('userId', '==', userId)
        .orderBy('createdAt', 'desc')
        .get();

      const orders = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      res.json(orders);
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
}

/**
 * Get single order
 */
export async function getOrder(req, res) {
  try {
    await verifyAuth(req, res, async () => {
      const { id } = req.params;
      const doc = await db.collection('orders').doc(id).get();

      if (!doc.exists) {
        return res.status(404).json({ error: 'Order not found' });
      }

      const orderData = doc.data();
      
      // Check if user owns this order or is admin
      if (orderData.userId !== req.user.uid && req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Access denied' });
      }

      res.json({ id: doc.id, ...orderData });
    });
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
}

/**
 * Update order status (Admin only)
 */
export async function updateOrderStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['Processing', 'Out for Delivery', 'Delivered'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    await db.collection('orders').doc(id).update({
      status,
      updatedAt: new Date(),
    });

    const updated = await db.collection('orders').doc(id).get();
    res.json({ id: updated.id, ...updated.data() });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ error: 'Failed to update order status' });
  }
}

/**
 * Download order instructions PDF
 */
export async function downloadInstructions(req, res) {
  try {
    const { id } = req.params;
    const doc = await db.collection('orders').doc(id).get();

    if (!doc.exists) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const order = doc.data();
    
    // Create PDF
    const doc_pdf = new PDFDocument();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=order-${id}-instructions.pdf`);
    
    doc_pdf.pipe(res);
    
    // Add content
    doc_pdf.fontSize(20).text('Assembly Instructions', { align: 'center' });
    doc_pdf.moveDown();
    doc_pdf.fontSize(14).text(`Order ID: ${order.orderId || id}`);
    doc_pdf.moveDown();
    
    order.items?.forEach((item, index) => {
      doc_pdf.fontSize(16).text(`${index + 1}. ${item.name || 'Item'}`);
      doc_pdf.fontSize(12).text(`Color: ${item.color || 'N/A'}`);
      doc_pdf.text(`Material: ${item.material || 'N/A'}`);
      doc_pdf.moveDown();
    });
    
    doc_pdf.fontSize(12).text('Please follow the included assembly instructions carefully.');
    doc_pdf.end();
  } catch (error) {
    console.error('Error generating PDF:', error);
    res.status(500).json({ error: 'Failed to generate instructions' });
  }
}

