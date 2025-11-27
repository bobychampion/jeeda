import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/common/Header';
import AdminSidebar from '../../components/admin/AdminSidebar';
import StatusBadge from '../../components/ui/StatusBadge';
import { ordersService } from '../../services/firestoreService';
import { generateInstructionsPDF } from '../../services/pdfService';
import { useAuth } from '../../context/AuthContext';
import { doc, updateDoc, getDoc, Timestamp } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { Search, Download, X, User, Truck, Wrench, FileText } from 'lucide-react';

const WORKFLOW_STAGES = [
  'Order Received',
  'Awaiting Production',
  'In Production',
  'Quality Check',
  'Ready for Delivery',
  'Out for Delivery',
  'Delivered',
  'Completed',
];

export default function OrdersManagementPage() {
  const { userData } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    if (userData?.role !== 'admin') {
      navigate('/');
      return;
    }
    fetchOrders();
  }, [userData]);

  const fetchOrders = async () => {
    try {
      const data = await ordersService.getAll();
      setOrders(data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await ordersService.updateStatus(orderId, newStatus);
      fetchOrders();
      alert('Order status updated!');
    } catch (error) {
      alert('Failed to update order status.');
    }
  };

  const updateOrderAssignment = async (orderId, field, value) => {
    try {
      const orderRef = doc(db, 'orders', orderId);
      await updateDoc(orderRef, {
        [field]: value,
        updatedAt: Timestamp.now(),
      });
      setSelectedOrder({ ...selectedOrder, [field]: value });
      fetchOrders();
    } catch (error) {
      alert('Failed to update assignment.');
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.orderId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.deliveryAddress?.fullName?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const ordersByStage = WORKFLOW_STAGES.reduce((acc, stage) => {
    acc[stage] = filteredOrders.filter(o => o.status === stage || 
      (stage === 'Order Received' && o.status === 'Processing'));
    return acc;
  }, {});

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
            <h1 className="text-3xl font-bold text-text-dark">Orders Management</h1>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg p-4 mb-6 flex items-center space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search orders..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-green"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-green"
            >
              <option value="all">All Statuses</option>
              {WORKFLOW_STAGES.map(stage => (
                <option key={stage} value={stage}>{stage}</option>
              ))}
            </select>
          </div>

          {/* Kanban View */}
          <div className="grid grid-cols-8 gap-4 overflow-x-auto pb-4">
            {WORKFLOW_STAGES.map((stage) => (
              <div key={stage} className="min-w-[200px] bg-white rounded-lg p-4">
                <h3 className="font-semibold text-text-dark mb-3 text-sm">{stage}</h3>
                <div className="space-y-2">
                  {ordersByStage[stage]?.map((order) => (
                    <div
                      key={order.id}
                      className="bg-background-light rounded p-3 cursor-pointer hover:shadow-md transition"
                      onClick={() => setSelectedOrder(order)}
                    >
                      <div className="text-xs font-semibold text-text-dark mb-1">
                        #{order.orderId || order.id}
                      </div>
                      <div className="text-xs text-gray-600 mb-2">
                        ₦{order.totalAmount?.toFixed(2) || '0.00'}
                      </div>
                      <StatusBadge status={order.status || 'Processing'} />
                    </div>
                  ))}
                  {(!ordersByStage[stage] || ordersByStage[stage].length === 0) && (
                    <div className="text-xs text-gray-400 text-center py-4">No orders</div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Order Details Modal */}
          {selectedOrder && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-text-dark">
                    Order #{selectedOrder.orderId || selectedOrder.id}
                  </h2>
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="p-6 space-y-6">
                  {/* Customer Info */}
                  <div>
                    <h3 className="font-semibold text-text-dark mb-3 flex items-center space-x-2">
                      <User className="w-5 h-5" />
                      <span>Customer Information</span>
                    </h3>
                    <div className="bg-background-light rounded-lg p-4 space-y-2">
                      <p className="text-sm">
                        <span className="font-medium">Name:</span> {selectedOrder.deliveryAddress?.fullName || 'N/A'}
                      </p>
                      <p className="text-sm">
                        <span className="font-medium">Email:</span> {selectedOrder.userId || 'N/A'}
                      </p>
                      <p className="text-sm">
                        <span className="font-medium">Address:</span> {selectedOrder.deliveryAddress?.addressLine1 || 'N/A'}
                      </p>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div>
                    <h3 className="font-semibold text-text-dark mb-3">Order Items</h3>
                    <div className="space-y-2">
                      {selectedOrder.items?.map((item, index) => (
                        <div key={index} className="bg-background-light rounded-lg p-4 flex items-center space-x-4">
                          <img
                            src={item.image || '/placeholder.jpg'}
                            alt={item.name}
                            className="w-16 h-16 object-cover rounded"
                          />
                          <div className="flex-1">
                            <p className="font-semibold text-text-dark">{item.name}</p>
                            <p className="text-sm text-gray-600">
                              Qty: {item.quantity || 1} × ₦{item.price}
                            </p>
                          </div>
                          <p className="font-semibold">₦{(item.price * (item.quantity || 1)).toFixed(2)}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Workflow Status */}
                  <div>
                    <h3 className="font-semibold text-text-dark mb-3">Workflow Status</h3>
                    <select
                      value={selectedOrder.status || 'Processing'}
                      onChange={(e) => {
                        updateOrderStatus(selectedOrder.id, e.target.value);
                        setSelectedOrder({ ...selectedOrder, status: e.target.value });
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-green"
                    >
                      {WORKFLOW_STAGES.map(stage => (
                        <option key={stage} value={stage}>{stage}</option>
                      ))}
                    </select>
                  </div>

                  {/* Assignments */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-text-dark mb-2 flex items-center space-x-2">
                        <Wrench className="w-4 h-4" />
                        <span>Assign Carpenter</span>
                      </label>
                      <input
                        type="text"
                        value={selectedOrder.assignedCarpenter || ''}
                        onChange={(e) => updateOrderAssignment(selectedOrder.id, 'assignedCarpenter', e.target.value)}
                        placeholder="Carpenter name"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-green"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-dark mb-2 flex items-center space-x-2">
                        <Truck className="w-4 h-4" />
                        <span>Assign Delivery Team</span>
                      </label>
                      <input
                        type="text"
                        value={selectedOrder.assignedDeliveryTeam || ''}
                        onChange={(e) => updateOrderAssignment(selectedOrder.id, 'assignedDeliveryTeam', e.target.value)}
                        placeholder="Team name"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-green"
                      />
                    </div>
                  </div>

                  {/* Internal Notes */}
                  <div>
                    <label className="block text-sm font-medium text-text-dark mb-2 flex items-center space-x-2">
                      <FileText className="w-4 h-4" />
                      <span>Internal Notes</span>
                    </label>
                    <textarea
                      value={selectedOrder.internalNotes || ''}
                      onChange={(e) => updateOrderAssignment(selectedOrder.id, 'internalNotes', e.target.value)}
                      rows={3}
                      placeholder="Add internal notes for your team..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-green"
                    />
                  </div>

                  {/* Actions */}
                  <div className="flex justify-end space-x-4 pt-4 border-t">
                    <button
                      onClick={async () => {
                        try {
                          await generateInstructionsPDF(selectedOrder);
                        } catch (error) {
                          alert('Failed to generate PDF.');
                        }
                      }}
                      className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg text-text-dark hover:bg-gray-100"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download Instructions</span>
                    </button>
                    <button
                      onClick={() => setSelectedOrder(null)}
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

