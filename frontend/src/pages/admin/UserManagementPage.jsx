import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/common/Header';
import AdminSidebar from '../../components/admin/AdminSidebar';
import { userService } from '../../services/userService';
import { useAuth } from '../../context/AuthContext';
import { Search, Ban, CheckCircle, Download, Mail, User, X } from 'lucide-react';

export default function UserManagementPage() {
  const { userData } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [userOrders, setUserOrders] = useState([]);

  useEffect(() => {
    if (userData?.role !== 'admin') {
      navigate('/');
      return;
    }
    fetchUsers();
  }, [userData]);

  const fetchUsers = async () => {
    try {
      const data = await userService.getAll();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBlockUser = async (userId, currentlyBlocked) => {
    try {
      await userService.blockUser(userId, !currentlyBlocked);
      alert(`User ${!currentlyBlocked ? 'blocked' : 'unblocked'} successfully!`);
      fetchUsers();
    } catch (error) {
      alert('Failed to update user status.');
    }
  };

  const handleViewUser = async (userId) => {
    try {
      const [userDetails, orders] = await Promise.all([
        userService.getById(userId),
        userService.getUserOrders(userId),
      ]);
      setSelectedUser(userDetails);
      setUserOrders(orders);
    } catch (error) {
      alert('Failed to fetch user details.');
    }
  };

  const exportCustomerList = () => {
    const csv = [
      ['Name', 'Email', 'Role', 'Blocked', 'Created At', 'Last Activity'].join(','),
      ...users.map(user => [
        user.name || '',
        user.email || '',
        user.role || 'user',
        user.blocked ? 'Yes' : 'No',
        user.createdAt?.toDate?.()?.toLocaleDateString() || 'N/A',
        user.lastActivity?.toDate?.()?.toLocaleDateString() || 'N/A',
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `customers_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const filteredUsers = users.filter(user =>
    user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-text-dark flex items-center space-x-2">
              <User className="w-8 h-8" />
              <span>User Management</span>
            </h1>
            <button
              onClick={exportCustomerList}
              className="flex items-center space-x-2 px-4 py-2 bg-primary-green text-white rounded-lg hover:bg-green-600 transition"
            >
              <Download className="w-5 h-5" />
              <span>Export CSV</span>
            </button>
          </div>

          {/* Search */}
          <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search users by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-green"
              />
            </div>
          </div>

          {/* Users List */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold text-text-dark">All Customers ({filteredUsers.length})</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-background-light">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-text-dark">Name</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-text-dark">Email</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-text-dark">Role</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-text-dark">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-text-dark">Created</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-text-dark">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map((user) => (
                      <tr key={user.id} className="border-t hover:bg-background-light transition">
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-primary-green rounded-full flex items-center justify-center text-white font-semibold">
                              {user.name?.[0] || 'U'}
                            </div>
                            <span className="font-semibold text-text-dark">{user.name || 'N/A'}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">{user.email || 'N/A'}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 text-xs rounded ${
                            user.role === 'admin' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                          }`}>
                            {user.role || 'user'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 text-xs rounded ${
                            user.blocked ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                          }`}>
                            {user.blocked ? 'Blocked' : 'Active'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {user.createdAt?.toDate?.()?.toLocaleDateString() || 'N/A'}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleViewUser(user.id)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                              title="View Details"
                            >
                              <User className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleBlockUser(user.id, user.blocked)}
                              className={`p-2 rounded ${
                                user.blocked ? 'text-green-600 hover:bg-green-50' : 'text-red-600 hover:bg-red-50'
                              }`}
                              title={user.blocked ? 'Unblock User' : 'Block User'}
                            >
                              {user.blocked ? <CheckCircle className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="px-6 py-12 text-center text-gray-600">
                        No users found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* User Details Modal */}
          {selectedUser && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-text-dark">User Details</h2>
                  <button
                    onClick={() => {
                      setSelectedUser(null);
                      setUserOrders([]);
                    }}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="p-6 space-y-6">
                  {/* User Info */}
                  <div>
                    <h3 className="font-semibold text-text-dark mb-3">User Information</h3>
                    <div className="bg-background-light rounded-lg p-4 space-y-2">
                      <p className="text-sm">
                        <span className="font-medium">Name:</span> {selectedUser.name || 'N/A'}
                      </p>
                      <p className="text-sm">
                        <span className="font-medium">Email:</span> {selectedUser.email || 'N/A'}
                      </p>
                      <p className="text-sm">
                        <span className="font-medium">Role:</span> {selectedUser.role || 'user'}
                      </p>
                      <p className="text-sm">
                        <span className="font-medium">Status:</span>{' '}
                        <span className={selectedUser.blocked ? 'text-red-600' : 'text-green-600'}>
                          {selectedUser.blocked ? 'Blocked' : 'Active'}
                        </span>
                      </p>
                      <p className="text-sm">
                        <span className="font-medium">Created:</span>{' '}
                        {selectedUser.createdAt?.toDate?.()?.toLocaleString() || 'N/A'}
                      </p>
                      <p className="text-sm">
                        <span className="font-medium">Last Activity:</span>{' '}
                        {selectedUser.lastActivity?.toDate?.()?.toLocaleString() || 'N/A'}
                      </p>
                    </div>
                  </div>

                  {/* Order History */}
                  <div>
                    <h3 className="font-semibold text-text-dark mb-3">Order History ({userOrders.length})</h3>
                    {userOrders.length > 0 ? (
                      <div className="space-y-2">
                        {userOrders.map((order) => (
                          <div key={order.id} className="bg-background-light rounded-lg p-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-semibold text-text-dark">Order #{order.orderId || order.id}</p>
                                <p className="text-sm text-gray-600">
                                  {order.createdAt?.toDate?.()?.toLocaleDateString() || 'N/A'}
                                </p>
                                <p className="text-sm text-gray-600">₦{order.totalAmount?.toFixed(2) || '0.00'}</p>
                              </div>
                              <span className={`px-3 py-1 text-xs rounded ${
                                order.status === 'Delivered' ? 'bg-green-100 text-green-700' :
                                order.status === 'Processing' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-gray-100 text-gray-700'
                              }`}>
                                {order.status || 'Processing'}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-600 text-center py-4">No orders found</p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex justify-end space-x-4 pt-4 border-t">
                    <button
                      onClick={() => {
                        // Send promo message (UI only for now)
                        alert('Promo message feature coming soon!');
                      }}
                      className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg text-text-dark hover:bg-gray-100"
                    >
                      <Mail className="w-4 h-4" />
                      <span>Send Promo</span>
                    </button>
                    <button
                      onClick={() => {
                        setSelectedUser(null);
                        setUserOrders([]);
                      }}
                      className="px-6 py-2 bg-primary-green text-white rounded-lg hover:bg-green-600"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

