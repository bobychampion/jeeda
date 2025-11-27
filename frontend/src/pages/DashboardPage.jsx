import { useState, useEffect } from 'react';
import Header from '../components/common/Header';
import Sidebar from '../components/common/Sidebar';
import StatusBadge from '../components/ui/StatusBadge';
import { Search, Download } from 'lucide-react';
import { ordersService } from '../services/firestoreService';
import { generateInstructionsPDF } from '../services/pdfService';
import { useAuth } from '../context/AuthContext';

export default function DashboardPage() {
  const { userData } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('orders');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      if (userData?.uid) {
        const ordersData = await ordersService.getUserOrders(userData.uid);
        setOrders(ordersData);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const downloadInstructions = async (orderId) => {
    try {
      const order = await ordersService.getById(orderId);
      if (order) {
        await generateInstructionsPDF(order);
      }
    } catch (error) {
      console.error('Error downloading instructions:', error);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  const filteredOrders = orders.filter((order) =>
    order.orderId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.id?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background-light">
      <Header />
      <div className="flex">
        <Sidebar type="dashboard" />
        <main className="flex-1 p-8">
          <h1 className="text-3xl font-bold text-text-dark mb-2">
            Welcome back, {userData?.name || 'User'}!
          </h1>
          <p className="text-gray-600 mb-8">
            Here's a summary of your recent activity and saved projects.
          </p>

          {/* Tabs */}
          <div className="flex space-x-4 border-b mb-6">
            <button
              onClick={() => setActiveTab('orders')}
              className={`pb-4 px-2 font-semibold ${
                activeTab === 'orders'
                  ? 'text-primary-green border-b-2 border-primary-green'
                  : 'text-gray-600'
              }`}
            >
              Order History
            </button>
            <button
              onClick={() => setActiveTab('saved')}
              className={`pb-4 px-2 font-semibold ${
                activeTab === 'saved'
                  ? 'text-primary-green border-b-2 border-primary-green'
                  : 'text-gray-600'
              }`}
            >
              Saved Items
            </button>
          </div>

          {activeTab === 'orders' && (
            <>
              {/* Search */}
              <div className="mb-6 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search your orders..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-green"
                />
              </div>

              {/* Orders Table */}
              {loading ? (
                <div className="text-center py-12">Loading...</div>
              ) : filteredOrders.length > 0 ? (
                <div className="bg-white rounded-lg overflow-hidden shadow-sm">
                  <table className="w-full">
                    <thead className="bg-background-light">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-text-dark">Order ID</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-text-dark">Date</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-text-dark">Total Price</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-text-dark">Status</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-text-dark">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredOrders.map((order) => (
                        <tr key={order.id} className="border-t">
                          <td className="px-6 py-4 text-sm text-text-dark">
                            #{order.orderId || order.id}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {order.createdAt
                              ? new Date(order.createdAt.seconds * 1000).toLocaleDateString()
                              : 'N/A'}
                          </td>
                          <td className="px-6 py-4 text-sm font-semibold text-text-dark">
                            ₦{order.totalAmount?.toFixed(2) || '0.00'}
                          </td>
                          <td className="px-6 py-4">
                            <StatusBadge status={order.status || 'Processing'} />
                          </td>
                          <td className="px-6 py-4">
                            <button
                              onClick={() => downloadInstructions(order.id)}
                              className="flex items-center space-x-2 text-primary-green hover:text-green-600"
                            >
                              <Download className="w-4 h-4" />
                              <span className="text-sm">Download Instructions</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="bg-white rounded-lg p-12 text-center">
                  <p className="text-gray-600">No orders found.</p>
                </div>
              )}
            </>
          )}

          {activeTab === 'saved' && (
            <div className="bg-white rounded-lg p-12 text-center">
              <p className="text-gray-600">No saved items yet.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

