import { 
  collection, 
  getDocs, 
  query, 
  where, 
  orderBy,
  Timestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { getRecommendations } from './aiService';

export const analyticsService = {
  getPopularCategories: async () => {
    try {
      const ordersRef = collection(db, 'orders');
      const snapshot = await getDocs(ordersRef);
      const orders = snapshot.docs.map(doc => doc.data());
      
      const categoryCount = {};
      orders.forEach(order => {
        order.items?.forEach(item => {
          if (item.category) {
            categoryCount[item.category] = (categoryCount[item.category] || 0) + (item.quantity || 1);
          }
        });
      });
      
      return Object.entries(categoryCount)
        .map(([category, count]) => ({ category, count }))
        .sort((a, b) => b.count - a.count);
    } catch (error) {
      console.error('Error getting popular categories:', error);
      return [];
    }
  },

  getTopSellingTemplates: async (limit = 10) => {
    try {
      const ordersRef = collection(db, 'orders');
      const snapshot = await getDocs(ordersRef);
      const orders = snapshot.docs.map(doc => doc.data());
      
      const templateCount = {};
      orders.forEach(order => {
        order.items?.forEach(item => {
          if (item.templateId) {
            templateCount[item.templateId] = {
              id: item.templateId,
              name: item.name || 'Unknown',
              count: (templateCount[item.templateId]?.count || 0) + (item.quantity || 1),
            };
          }
        });
      });
      
      return Object.values(templateCount)
        .sort((a, b) => b.count - a.count)
        .slice(0, limit);
    } catch (error) {
      console.error('Error getting top selling templates:', error);
      return [];
    }
  },

  getOrdersByPeriod: async (period = 'week') => {
    try {
      const ordersRef = collection(db, 'orders');
      const snapshot = await getDocs(ordersRef);
      const orders = snapshot.docs.map(doc => doc.data());
      
      const now = new Date();
      const periodStart = new Date();
      
      if (period === 'week') {
        periodStart.setDate(now.getDate() - 7);
      } else if (period === 'month') {
        periodStart.setMonth(now.getMonth() - 1);
      }
      
      return orders.filter(order => {
        const orderDate = order.createdAt?.toDate 
          ? order.createdAt.toDate() 
          : new Date(order.createdAt?.seconds * 1000 || order.createdAt);
        return orderDate >= periodStart;
      });
    } catch (error) {
      console.error('Error getting orders by period:', error);
      return [];
    }
  },

  getRevenueTrends: async (days = 30) => {
    try {
      const ordersRef = collection(db, 'orders');
      const snapshot = await getDocs(ordersRef);
      const orders = snapshot.docs.map(doc => doc.data());
      
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      
      const dailyRevenue = {};
      
      orders.forEach(order => {
        const orderDate = order.createdAt?.toDate 
          ? order.createdAt.toDate() 
          : new Date(order.createdAt?.seconds * 1000 || order.createdAt);
        
        if (orderDate >= startDate && order.totalAmount) {
          const dateKey = orderDate.toISOString().split('T')[0];
          dailyRevenue[dateKey] = (dailyRevenue[dateKey] || 0) + order.totalAmount;
        }
      });
      
      return Object.entries(dailyRevenue)
        .map(([date, revenue]) => ({ date, revenue }))
        .sort((a, b) => a.date.localeCompare(b.date));
    } catch (error) {
      console.error('Error getting revenue trends:', error);
      return [];
    }
  },

  getMaterialConsumption: async () => {
    try {
      const ordersRef = collection(db, 'orders');
      const snapshot = await getDocs(ordersRef);
      const orders = snapshot.docs.map(doc => doc.data());
      
      const materialUsage = {};
      
      orders.forEach(order => {
        order.items?.forEach(item => {
          if (item.requiredInventory) {
            item.requiredInventory.forEach(inv => {
              materialUsage[inv.name] = (materialUsage[inv.name] || 0) + (inv.quantity || 0) * (item.quantity || 1);
            });
          }
        });
      });
      
      return Object.entries(materialUsage)
        .map(([material, quantity]) => ({ material, quantity }))
        .sort((a, b) => b.quantity - a.quantity);
    } catch (error) {
      console.error('Error getting material consumption:', error);
      return [];
    }
  },

  getAIUsageStats: async () => {
    try {
      const aiLogsRef = collection(db, 'aiLogs');
      const snapshot = await getDocs(aiLogsRef);
      const logs = snapshot.docs.map(doc => doc.data());
      
      const categoryQueries = {};
      logs.forEach(log => {
        if (log.query) {
          const categories = log.availableCategories || [];
          categories.forEach(cat => {
            categoryQueries[cat] = (categoryQueries[cat] || 0) + 1;
          });
        }
      });
      
      return {
        totalQueries: logs.length,
        categoryBreakdown: Object.entries(categoryQueries)
          .map(([category, count]) => ({ category, count }))
          .sort((a, b) => b.count - a.count),
      };
    } catch (error) {
      console.error('Error getting AI usage stats:', error);
      return { totalQueries: 0, categoryBreakdown: [] };
    }
  },

  getAbandonedCarts: async () => {
    try {
      const cartRef = collection(db, 'cart');
      const snapshot = await getDocs(cartRef);
      const carts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      // Carts older than 24 hours with items
      const now = Date.now();
      const abandonedCarts = carts.filter(cart => {
        if (!cart.items || cart.items.length === 0) return false;
        const lastUpdated = cart.updatedAt?.toDate 
          ? cart.updatedAt.toDate().getTime()
          : (cart.updatedAt?.seconds * 1000 || 0);
        return (now - lastUpdated) > 24 * 60 * 60 * 1000;
      });
      
      return abandonedCarts.length;
    } catch (error) {
      console.error('Error getting abandoned carts:', error);
      return 0;
    }
  },

  getGrowthInsights: async () => {
    try {
      const [popularCategories, topTemplates, materialConsumption] = await Promise.all([
        analyticsService.getPopularCategories(),
        analyticsService.getTopSellingTemplates(5),
        analyticsService.getMaterialConsumption(),
      ]);
      
      // Use Gemini to generate insights
      const insightPrompt = `Based on this sales data, provide 3-5 actionable business insights in JSON format:
      
Popular Categories: ${JSON.stringify(popularCategories.slice(0, 5))}
Top Templates: ${JSON.stringify(topTemplates)}
Material Usage: ${JSON.stringify(materialConsumption.slice(0, 5))}

Return JSON: { "insights": ["insight1", "insight2", ...] }`;

      try {
        const response = await getRecommendations(insightPrompt);
        return response.message ? [response.message] : ['Analyzing trends...'];
      } catch (error) {
        // Fallback insights
        const insights = [];
        if (popularCategories.length > 0) {
          insights.push(`${popularCategories[0].category} is trending. Consider adding more variants.`);
        }
        if (topTemplates.length > 0) {
          insights.push(`${topTemplates[0].name} is your top seller. Promote it more.`);
        }
        return insights;
      }
    } catch (error) {
      console.error('Error getting growth insights:', error);
      return [];
    }
  },
};

