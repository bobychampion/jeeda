import { db } from '../config/firebaseAdmin.js';

/**
 * Get all orders (Admin only)
 */
export async function getAllOrders(req, res) {
  try {
    const { status, limit = 50 } = req.query;
    let query = db.collection('orders').orderBy('createdAt', 'desc').limit(parseInt(limit));

    if (status) {
      query = query.where('status', '==', status);
    }

    const snapshot = await query.get();
    const orders = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
}

/**
 * Get dashboard statistics (Admin only)
 */
export async function getDashboardStats(req, res) {
  try {
    const ordersSnapshot = await db.collection('orders').get();
    const templatesSnapshot = await db.collection('templates').get();
    const usersSnapshot = await db.collection('users').get();

    const orders = ordersSnapshot.docs.map(doc => doc.data());
    
    const stats = {
      totalOrders: orders.length,
      totalRevenue: orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0),
      totalTemplates: templatesSnapshot.size,
      totalUsers: usersSnapshot.size,
      ordersByStatus: {
        Processing: orders.filter(o => o.status === 'Processing').length,
        'Out for Delivery': orders.filter(o => o.status === 'Out for Delivery').length,
        Delivered: orders.filter(o => o.status === 'Delivered').length,
      },
      recentOrders: ordersSnapshot.docs.slice(0, 10).map(doc => ({
        id: doc.id,
        ...doc.data(),
      })),
    };

    res.json(stats);
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
}

