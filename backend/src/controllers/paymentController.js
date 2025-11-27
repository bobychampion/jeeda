import { initializePayment, verifyPayment } from '../services/paystackService.js';
import { db } from '../config/firebaseAdmin.js';
import { verifyAuth } from '../middleware/authMiddleware.js';

/**
 * Initialize Paystack payment
 */
export async function initializePaystackPayment(req, res) {
  try {
    await verifyAuth(req, res, async () => {
      const { amount, email, orderId, metadata } = req.body;

      if (!amount || !email) {
        return res.status(400).json({ error: 'Amount and email are required' });
      }

      const reference = `RC-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      const paymentData = {
        amount,
        email,
        reference,
        metadata: {
          orderId,
          userId: req.user.uid,
          ...metadata,
        },
      };

      const result = await initializePayment(paymentData);

      // Store payment reference
      if (orderId) {
        await db.collection('orders').doc(orderId).update({
          paymentId: reference,
        });
      }

      res.json(result);
    });
  } catch (error) {
    console.error('Error initializing payment:', error);
    res.status(500).json({ error: 'Failed to initialize payment' });
  }
}

/**
 * Verify Paystack payment
 */
export async function verifyPaystackPayment(req, res) {
  try {
    const { reference } = req.body;

    if (!reference) {
      return res.status(400).json({ error: 'Payment reference is required' });
    }

    const verification = await verifyPayment(reference);

    if (verification.status) {
      // Update order status
      const ordersSnapshot = await db.collection('orders')
        .where('paymentId', '==', reference)
        .get();

      if (!ordersSnapshot.empty) {
        const orderDoc = ordersSnapshot.docs[0];
        await orderDoc.ref.update({
          status: 'Processing',
          updatedAt: new Date(),
        });
      }
    }

    res.json(verification);
  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({ error: 'Failed to verify payment' });
  }
}

