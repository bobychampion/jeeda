import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/common/Header';
import AdminSidebar from '../components/admin/AdminSidebar';
import StatusBadge from '../components/ui/StatusBadge';
import { inventoryService, ordersService, statsService } from '../services/firestoreService';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, X, ShoppingCart, BarChart3, Package, ArrowRight } from 'lucide-react';

export default function AdminDashboardPage() {
  const { userData } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);

  // Inventory form state
  const [showInventoryForm, setShowInventoryForm] = useState(false);
  const [editingInventory, setEditingInventory] = useState(null);
  const [inventoryFormData, setInventoryFormData] = useState({
    name: '',
    category: 'General',
    quantity: '',
    unit: 'pcs',
    minStock: '',
    cost: '',
  });

  useEffect(() => {
    if (userData?.role !== 'admin') {
      navigate('/');
      return;
    }
    fetchData();
  }, [userData]);

  const fetchData = async () => {
    try {
      const [stats, orders, inventory] = await Promise.all([
        statsService.getDashboardStats(),
        ordersService.getAll(),
        inventoryService.getAll(),
      ]);
      setStats(stats);
      setOrders(orders);
      setInventory(inventory);
    } catch (error) {
      console.error('Error fetching admin data:', error);
      setStats({
        totalOrders: 0,
        totalRevenue: 0,
        totalTemplates: 0,
        totalUsers: 0,
        ordersByStatus: { Processing: 0, 'Out for Delivery': 0, Delivered: 0 },
      });
      setOrders([]);
      setInventory([]);
    } finally {
      setLoading(false);
    }
  };


  const handleInventorySubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingInventory) {
        await inventoryService.update(editingInventory.id, inventoryFormData);
        alert('Inventory item updated successfully!');
      } else {
        await inventoryService.create(inventoryFormData);
        alert('Inventory item created successfully!');
      }

      setShowInventoryForm(false);
      setEditingInventory(null);
      resetInventoryForm();
      fetchData();
    } catch (error) {
      console.error('Error saving inventory:', error);
      alert('Failed to save inventory item. Please try again.');
    }
  };

  const deleteInventory = async (id) => {
    if (!window.confirm('Are you sure you want to delete this inventory item?')) return;
    try {
      await inventoryService.delete(id);
      fetchData();
      alert('Inventory item deleted successfully!');
    } catch (error) {
      alert('Failed to delete inventory item.');
    }
  };

  const resetInventoryForm = () => {
    setInventoryFormData({
      name: '',
      category: 'General',
      quantity: '',
      unit: 'pcs',
      minStock: '',
      cost: '',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-12 text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-light">
      <Header />
      <div className="flex">
        <AdminSidebar />
        <main className="flex-1 p-8">
          <h1 className="text-3xl font-bold text-text-dark mb-6">Admin Dashboard</h1>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Link
              to="/admin/templates"
              className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition border border-gray-200"
            >
              <div className="flex items-center space-x-3">
                <Package className="w-8 h-8 text-primary-green" />
                <div>
                  <h3 className="font-semibold text-text-dark">Manage Templates</h3>
                  <p className="text-sm text-gray-600">Create and edit product templates</p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400" />
            </Link>
            <Link
              to="/admin/orders"
              className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition border border-gray-200"
            >
              <div className="flex items-center space-x-3">
                <BarChart3 className="w-8 h-8 text-blue-500" />
                <div>
                  <h3 className="font-semibold text-text-dark">View All Orders</h3>
                  <p className="text-sm text-gray-600">Manage customer orders</p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400" />
            </Link>
            <Link
              to="/admin/inventory"
              className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition border border-gray-200"
            >
              <div className="flex items-center space-x-3">
                <ShoppingCart className="w-8 h-8 text-orange-500" />
                <div>
                  <h3 className="font-semibold text-text-dark">Manage Inventory</h3>
                  <p className="text-sm text-gray-600">Track stock levels</p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400" />
            </Link>
          </div>

          {/* Tabs */}
          <div className="flex space-x-4 border-b mb-6">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`pb-4 px-2 font-semibold flex items-center space-x-2 ${
                activeTab === 'dashboard'
                  ? 'text-primary-green border-b-2 border-primary-green'
                  : 'text-gray-600'
              }`}
            >
              <BarChart3 className="w-5 h-5" />
              <span>Dashboard</span>
            </button>
            <button
              onClick={() => setActiveTab('inventory')}
              className={`pb-4 px-2 font-semibold flex items-center space-x-2 ${
                activeTab === 'inventory'
                  ? 'text-primary-green border-b-2 border-primary-green'
                  : 'text-gray-600'
              }`}
            >
              <ShoppingCart className="w-5 h-5" />
              <span>Inventory</span>
            </button>
          </div>

          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && (
            <>
              {/* Statistics */}
              {stats && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                  <div className="bg-white rounded-lg p-6 shadow-sm">
                    <h3 className="text-sm text-gray-600 mb-2">Total Orders</h3>
                    <p className="text-3xl font-bold text-text-dark">{stats.totalOrders}</p>
                  </div>
                  <div className="bg-white rounded-lg p-6 shadow-sm">
                    <h3 className="text-sm text-gray-600 mb-2">Total Revenue</h3>
                    <p className="text-3xl font-bold text-primary-green">₦{stats.totalRevenue.toFixed(2)}</p>
                  </div>
                  <div className="bg-white rounded-lg p-6 shadow-sm">
                    <h3 className="text-sm text-gray-600 mb-2">Templates</h3>
                    <p className="text-3xl font-bold text-text-dark">{stats.totalTemplates}</p>
                  </div>
                  <div className="bg-white rounded-lg p-6 shadow-sm">
                    <h3 className="text-sm text-gray-600 mb-2">Users</h3>
                    <p className="text-3xl font-bold text-text-dark">{stats.totalUsers}</p>
                  </div>
                </div>
              )}

              {/* Orders by Status */}
              {stats && (
                <div className="bg-white rounded-lg p-6 shadow-sm mb-8">
                  <h2 className="text-xl font-bold text-text-dark mb-4">Orders by Status</h2>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <StatusBadge status="Processing" />
                      <p className="text-2xl font-bold mt-2">{stats.ordersByStatus.Processing}</p>
                    </div>
                    <div>
                      <StatusBadge status="Out for Delivery" />
                      <p className="text-2xl font-bold mt-2">{stats.ordersByStatus['Out for Delivery']}</p>
                    </div>
                    <div>
                      <StatusBadge status="Delivered" />
                      <p className="text-2xl font-bold mt-2">{stats.ordersByStatus.Delivered}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Recent Orders */}
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="p-6 border-b">
                  <h2 className="text-xl font-bold text-text-dark">Recent Orders</h2>
                </div>
                <div className="overflow-x-auto">
                  {orders.length > 0 ? (
                    <table className="w-full">
                      <thead className="bg-background-light">
                        <tr>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-text-dark">Order ID</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-text-dark">Date</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-text-dark">Amount</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-text-dark">Status</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-text-dark">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.slice(0, 10).map((order) => (
                          <tr key={order.id} className="border-t">
                            <td className="px-6 py-4 text-sm text-text-dark">
                              #{order.orderId || order.id}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600">
                              {order.createdAt
                                ? new Date(order.createdAt.seconds * 1000).toLocaleDateString()
                                : order.createdAt
                                ? new Date(order.createdAt).toLocaleDateString()
                                : 'N/A'}
                            </td>
                            <td className="px-6 py-4 text-sm font-semibold text-text-dark">
                              ₦{order.totalAmount?.toFixed(2) || '0.00'}
                            </td>
                            <td className="px-6 py-4">
                              <StatusBadge status={order.status || 'Processing'} />
                            </td>
                            <td className="px-6 py-4">
                              <select
                                value={order.status || 'Processing'}
                                onChange={async (e) => {
                                  try {
                                    await ordersService.updateStatus(order.id, e.target.value);
                                    fetchData();
                                  } catch (error) {
                                    alert('Failed to update status');
                                  }
                                }}
                                className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
                              >
                                <option value="Processing">Processing</option>
                                <option value="Out for Delivery">Out for Delivery</option>
                                <option value="Delivered">Delivered</option>
                              </select>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="p-12 text-center">
                      <p className="text-gray-600 mb-4">No orders found.</p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Templates Tab - Removed: Use /admin/templates page instead */}

          {/* Inventory Tab */}
          {activeTab === 'inventory' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-text-dark">Inventory Management</h2>
                <button
                  onClick={() => {
                    resetInventoryForm();
                    setEditingInventory(null);
                    setShowInventoryForm(true);
                  }}
                  className="flex items-center space-x-2 px-4 py-2 bg-primary-green text-white rounded-lg hover:bg-green-600 transition"
                >
                  <Plus className="w-5 h-5" />
                  <span>Add Inventory Item</span>
                </button>
              </div>

              {/* Inventory Form Modal */}
              {showInventoryForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                  <div className="bg-white rounded-lg max-w-2xl w-full">
                    <div className="p-6 border-b flex justify-between items-center">
                      <h2 className="text-2xl font-bold text-text-dark">
                        {editingInventory ? 'Edit Inventory Item' : 'Add Inventory Item'}
                      </h2>
                      <button
                        onClick={() => {
                          setShowInventoryForm(false);
                          setEditingInventory(null);
                          resetInventoryForm();
                        }}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        <X className="w-6 h-6" />
                      </button>
                    </div>

                    <form onSubmit={handleInventorySubmit} className="p-6 space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-text-dark mb-2">
                          Item Name *
                        </label>
                        <input
                          type="text"
                          value={inventoryFormData.name}
                          onChange={(e) => setInventoryFormData({ ...inventoryFormData, name: e.target.value })}
                          required
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-green"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-text-dark mb-2">
                            Category
                          </label>
                          <select
                            value={inventoryFormData.category}
                            onChange={(e) => setInventoryFormData({ ...inventoryFormData, category: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-green"
                          >
                            <option value="General">General</option>
                            <option value="Wood">Wood</option>
                            <option value="Hardware">Hardware</option>
                            <option value="Finishing">Finishing</option>
                            <option value="Tools">Tools</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-text-dark mb-2">
                            Unit
                          </label>
                          <select
                            value={inventoryFormData.unit}
                            onChange={(e) => setInventoryFormData({ ...inventoryFormData, unit: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-green"
                          >
                            <option value="pcs">Pieces</option>
                            <option value="kg">Kilograms</option>
                            <option value="m">Meters</option>
                            <option value="sqm">Square Meters</option>
                            <option value="l">Liters</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-text-dark mb-2">
                            Quantity *
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            value={inventoryFormData.quantity}
                            onChange={(e) => setInventoryFormData({ ...inventoryFormData, quantity: e.target.value })}
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-green"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-text-dark mb-2">
                            Min Stock *
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            value={inventoryFormData.minStock}
                            onChange={(e) => setInventoryFormData({ ...inventoryFormData, minStock: e.target.value })}
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-green"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-text-dark mb-2">
                            Cost per Unit (₦)
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            value={inventoryFormData.cost}
                            onChange={(e) => setInventoryFormData({ ...inventoryFormData, cost: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-green"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end space-x-4 pt-4 border-t">
                        <button
                          type="button"
                          onClick={() => {
                            setShowInventoryForm(false);
                            setEditingInventory(null);
                            resetInventoryForm();
                          }}
                          className="px-6 py-2 border border-gray-300 rounded-lg text-text-dark hover:bg-gray-100"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-6 py-2 bg-primary-green text-white rounded-lg hover:bg-green-600"
                        >
                          {editingInventory ? 'Update Item' : 'Add Item'}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* Inventory List */}
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-background-light">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-text-dark">Item Name</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-text-dark">Category</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-text-dark">Quantity</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-text-dark">Min Stock</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-text-dark">Cost</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-text-dark">Status</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-text-dark">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {inventory.length > 0 ? (
                        inventory.map((item) => {
                          const isLowStock = item.quantity <= item.minStock;
                          return (
                            <tr key={item.id} className="border-t">
                              <td className="px-6 py-4 text-sm font-semibold text-text-dark">
                                {item.name}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-600">{item.category}</td>
                              <td className="px-6 py-4 text-sm text-text-dark">
                                {item.quantity} {item.unit}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-600">
                                {item.minStock} {item.unit}
                              </td>
                              <td className="px-6 py-4 text-sm text-text-dark">
                                ₦{item.cost?.toFixed(2) || '0.00'}
                              </td>
                              <td className="px-6 py-4">
                                <span
                                  className={`px-2 py-1 text-xs rounded ${
                                    isLowStock
                                      ? 'bg-red-100 text-red-700'
                                      : 'bg-green-100 text-green-700'
                                  }`}
                                >
                                  {isLowStock ? 'Low Stock' : 'In Stock'}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex space-x-2">
                                  <button
                                    onClick={() => {
                                      setEditingInventory(item);
                                      setInventoryFormData({
                                        name: item.name || '',
                                        category: item.category || 'General',
                                        quantity: item.quantity || '',
                                        unit: item.unit || 'pcs',
                                        minStock: item.minStock || '',
                                        cost: item.cost || '',
                                      });
                                      setShowInventoryForm(true);
                                    }}
                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                                  >
                                    <Edit className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => deleteInventory(item.id)}
                                    className="p-2 text-red-600 hover:bg-red-50 rounded"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan="7" className="px-6 py-12 text-center text-gray-600">
                            No inventory items found. Click "Add Inventory Item" to create one.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
