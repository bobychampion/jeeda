import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/common/Header';
import AdminSidebar from '../../components/admin/AdminSidebar';
import { analyticsService } from '../../services/analyticsService';
import { useAuth } from '../../context/AuthContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { BarChart3, TrendingUp, Package, DollarSign, Users, ShoppingCart } from 'lucide-react';

const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6'];

export default function AnalyticsPage() {
  const { userData } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    popularCategories: [],
    topTemplates: [],
    ordersThisWeek: [],
    ordersThisMonth: [],
    revenueTrends: [],
    materialConsumption: [],
    aiUsage: { totalQueries: 0, categoryBreakdown: [] },
    abandonedCarts: 0,
    growthInsights: [],
  });

  useEffect(() => {
    if (userData?.role !== 'admin') {
      navigate('/');
      return;
    }
    fetchAnalytics();
  }, [userData]);

  const fetchAnalytics = async () => {
    try {
      const [
        popularCategories,
        topTemplates,
        ordersThisWeek,
        ordersThisMonth,
        revenueTrends,
        materialConsumption,
        aiUsage,
        abandonedCarts,
        growthInsights,
      ] = await Promise.all([
        analyticsService.getPopularCategories(),
        analyticsService.getTopSellingTemplates(10),
        analyticsService.getOrdersByPeriod('week'),
        analyticsService.getOrdersByPeriod('month'),
        analyticsService.getRevenueTrends(30),
        analyticsService.getMaterialConsumption(),
        analyticsService.getAIUsageStats(),
        analyticsService.getAbandonedCarts(),
        analyticsService.getGrowthInsights(),
      ]);

      setMetrics({
        popularCategories: popularCategories.slice(0, 10),
        topTemplates,
        ordersThisWeek,
        ordersThisMonth,
        revenueTrends,
        materialConsumption: materialConsumption.slice(0, 10),
        aiUsage,
        abandonedCarts,
        growthInsights: Array.isArray(growthInsights) ? growthInsights : [growthInsights],
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-12 text-center">Loading...</div>
      </div>
    );
  }

  const totalRevenue = metrics.revenueTrends.reduce((sum, item) => sum + (item.revenue || 0), 0);
  const totalOrders = metrics.ordersThisMonth.length;

  return (
    <div className="min-h-screen bg-background-light">
      <Header />
      <div className="flex">
        <AdminSidebar />
        <main className="flex-1 p-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-text-dark flex items-center space-x-2">
              <BarChart3 className="w-8 h-8" />
              <span>Reports & Analytics</span>
            </h1>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm text-gray-600">Total Revenue</h3>
                <DollarSign className="w-5 h-5 text-primary-green" />
              </div>
              <p className="text-3xl font-bold text-text-dark">₦{totalRevenue.toFixed(2)}</p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm text-gray-600">Orders This Month</h3>
                <Package className="w-5 h-5 text-blue-500" />
              </div>
              <p className="text-3xl font-bold text-text-dark">{totalOrders}</p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm text-gray-600">AI Queries</h3>
                <TrendingUp className="w-5 h-5 text-purple-500" />
              </div>
              <p className="text-3xl font-bold text-text-dark">{metrics.aiUsage.totalQueries}</p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm text-gray-600">Abandoned Carts</h3>
                <ShoppingCart className="w-5 h-5 text-red-500" />
              </div>
              <p className="text-3xl font-bold text-text-dark">{metrics.abandonedCarts}</p>
            </div>
          </div>

          {/* Growth Insights */}
          {metrics.growthInsights.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h2 className="text-xl font-bold text-text-dark mb-4">Growth Insights</h2>
              <div className="space-y-2">
                {metrics.growthInsights.map((insight, index) => (
                  <div key={index} className="bg-background-light rounded-lg p-4">
                    <p className="text-text-dark">{insight}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Popular Categories */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold text-text-dark mb-4">Most Popular Categories</h2>
              {metrics.popularCategories.length > 0 ? (
                <BarChart width={400} height={300} data={metrics.popularCategories}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#10B981" />
                </BarChart>
              ) : (
                <p className="text-gray-600 text-center py-8">No data available</p>
              )}
            </div>

            {/* Top Selling Templates */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold text-text-dark mb-4">Top Selling Templates</h2>
              <div className="space-y-3">
                {metrics.topTemplates.length > 0 ? (
                  metrics.topTemplates.map((template, index) => (
                    <div key={template.id} className="flex items-center justify-between p-3 bg-background-light rounded-lg">
                      <div className="flex items-center space-x-3">
                        <span className="font-bold text-primary-green">#{index + 1}</span>
                        <span className="text-text-dark">{template.name}</span>
                      </div>
                      <span className="font-semibold text-primary-green">{template.count} sold</span>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-600 text-center py-8">No data available</p>
                )}
              </div>
            </div>
          </div>

          {/* Revenue Trends */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-xl font-bold text-text-dark mb-4">Revenue Trends (Last 30 Days)</h2>
            {metrics.revenueTrends.length > 0 ? (
              <LineChart width={800} height={300} data={metrics.revenueTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="#10B981" strokeWidth={2} />
              </LineChart>
            ) : (
              <p className="text-gray-600 text-center py-8">No data available</p>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Material Consumption */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold text-text-dark mb-4">Material Consumption</h2>
              {metrics.materialConsumption.length > 0 ? (
                <BarChart width={400} height={300} data={metrics.materialConsumption}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="material" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="quantity" fill="#3B82F6" />
                </BarChart>
              ) : (
                <p className="text-gray-600 text-center py-8">No data available</p>
              )}
            </div>

            {/* AI Usage by Category */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold text-text-dark mb-4">AI Usage by Category</h2>
              {metrics.aiUsage.categoryBreakdown.length > 0 ? (
                <PieChart width={400} height={300}>
                  <Pie
                    data={metrics.aiUsage.categoryBreakdown}
                    cx={200}
                    cy={150}
                    labelLine={false}
                    label={({ category, percent }) => `${category} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {metrics.aiUsage.categoryBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              ) : (
                <p className="text-gray-600 text-center py-8">No data available</p>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

