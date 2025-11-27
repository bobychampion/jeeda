import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/common/Header';
import AdminSidebar from '../../components/admin/AdminSidebar';
import { deliveryService } from '../../services/deliveryService';
import { ordersService } from '../../services/firestoreService';
import { useAuth } from '../../context/AuthContext';
import { Plus, Edit, Trash2, X, Calendar, Truck, Users, Mail, Phone } from 'lucide-react';

export default function DeliveryManagementPage() {
  const { userData } = useAuth();
  const navigate = useNavigate();
  const [teams, setTeams] = useState([]);
  const [assemblyRequests, setAssemblyRequests] = useState([]);
  const [pendingOrders, setPendingOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTeamForm, setShowTeamForm] = useState(false);
  const [editingTeam, setEditingTeam] = useState(null);
  const [teamFormData, setTeamFormData] = useState({
    name: '',
    driverName: '',
    driverPhone: '',
    vehicleNumber: '',
    capacity: '',
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
      const [teamsData, requestsData, ordersData] = await Promise.all([
        deliveryService.getTeams(),
        deliveryService.getAssemblyRequests({ status: 'pending' }),
        ordersService.getAll(),
      ]);
      setTeams(teamsData);
      setAssemblyRequests(requestsData);
      setPendingOrders(ordersData.filter(o => 
        o.status === 'Ready for Delivery' || o.status === 'Out for Delivery'
      ));
    } catch (error) {
      console.error('Error fetching delivery data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTeamSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingTeam) {
        await deliveryService.updateTeam(editingTeam.id, teamFormData);
        alert('Team updated successfully!');
      } else {
        await deliveryService.createTeam(teamFormData);
        alert('Team created successfully!');
      }
      setShowTeamForm(false);
      setEditingTeam(null);
      resetTeamForm();
      fetchData();
    } catch (error) {
      alert('Failed to save team.');
    }
  };

  const handleDeleteTeam = async (id) => {
    if (!window.confirm('Are you sure you want to delete this team?')) return;
    try {
      await deliveryService.deleteTeam(id);
      fetchData();
    } catch (error) {
      alert('Failed to delete team.');
    }
  };

  const scheduleDelivery = async (orderId, deliveryDate, teamId) => {
    try {
      await deliveryService.scheduleDelivery(orderId, {
        deliveryDate,
        teamId,
        notes: '',
      });
      alert('Delivery scheduled successfully!');
      fetchData();
    } catch (error) {
      alert('Failed to schedule delivery.');
    }
  };

  const resetTeamForm = () => {
    setTeamFormData({
      name: '',
      driverName: '',
      driverPhone: '',
      vehicleNumber: '',
      capacity: '',
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
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-text-dark">Delivery & Assembly</h1>
            <button
              onClick={() => {
                resetTeamForm();
                setEditingTeam(null);
                setShowTeamForm(true);
              }}
              className="flex items-center space-x-2 px-4 py-2 bg-primary-green text-white rounded-lg hover:bg-green-600 transition"
            >
              <Plus className="w-5 h-5" />
              <span>Add Delivery Team</span>
            </button>
          </div>

          {/* Team Form Modal */}
          {showTeamForm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg max-w-md w-full">
                <div className="p-6 border-b flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-text-dark">
                    {editingTeam ? 'Edit Team' : 'Add Delivery Team'}
                  </h2>
                  <button onClick={() => { setShowTeamForm(false); setEditingTeam(null); resetTeamForm(); }} className="text-gray-500">
                    <X className="w-6 h-6" />
                  </button>
                </div>
                <form onSubmit={handleTeamSubmit} className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-text-dark mb-2">Team Name *</label>
                    <input
                      type="text"
                      value={teamFormData.name}
                      onChange={(e) => setTeamFormData({ ...teamFormData, name: e.target.value })}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-green"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-dark mb-2">Driver Name *</label>
                    <input
                      type="text"
                      value={teamFormData.driverName}
                      onChange={(e) => setTeamFormData({ ...teamFormData, driverName: e.target.value })}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-green"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-dark mb-2">Driver Phone *</label>
                    <input
                      type="tel"
                      value={teamFormData.driverPhone}
                      onChange={(e) => setTeamFormData({ ...teamFormData, driverPhone: e.target.value })}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-green"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-dark mb-2">Vehicle Number</label>
                    <input
                      type="text"
                      value={teamFormData.vehicleNumber}
                      onChange={(e) => setTeamFormData({ ...teamFormData, vehicleNumber: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-green"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-dark mb-2">Capacity</label>
                    <input
                      type="number"
                      value={teamFormData.capacity}
                      onChange={(e) => setTeamFormData({ ...teamFormData, capacity: e.target.value })}
                      placeholder="Number of items"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-green"
                    />
                  </div>
                  <div className="flex justify-end space-x-4 pt-4 border-t">
                    <button
                      type="button"
                      onClick={() => { setShowTeamForm(false); setEditingTeam(null); resetTeamForm(); }}
                      className="px-6 py-2 border border-gray-300 rounded-lg text-text-dark hover:bg-gray-100"
                    >
                      Cancel
                    </button>
                    <button type="submit" className="px-6 py-2 bg-primary-green text-white rounded-lg hover:bg-green-600">
                      {editingTeam ? 'Update' : 'Create'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Delivery Teams */}
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-6 border-b">
                <h2 className="text-xl font-bold text-text-dark flex items-center space-x-2">
                  <Truck className="w-5 h-5" />
                  <span>Delivery Teams</span>
                </h2>
              </div>
              <div className="p-6 space-y-4">
                {teams.length > 0 ? (
                  teams.map((team) => (
                    <div key={team.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-semibold text-text-dark">{team.name}</h3>
                          <p className="text-sm text-gray-600">{team.driverName}</p>
                          <p className="text-sm text-gray-600 flex items-center space-x-1">
                            <Phone className="w-3 h-3" />
                            <span>{team.driverPhone}</span>
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => {
                              setEditingTeam(team);
                              setTeamFormData(team);
                              setShowTeamForm(true);
                            }}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteTeam(team.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-600 text-center py-4">No delivery teams yet</p>
                )}
              </div>
            </div>

            {/* Pending Deliveries */}
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-6 border-b">
                <h2 className="text-xl font-bold text-text-dark flex items-center space-x-2">
                  <Calendar className="w-5 h-5" />
                  <span>Pending Deliveries</span>
                </h2>
              </div>
              <div className="p-6 space-y-4">
                {pendingOrders.length > 0 ? (
                  pendingOrders.map((order) => (
                    <div key={order.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-semibold text-text-dark">Order #{order.orderId || order.id}</h3>
                          <p className="text-sm text-gray-600">₦{order.totalAmount?.toFixed(2)}</p>
                        </div>
                      </div>
                      <div className="mt-3 space-y-2">
                        <select
                          onChange={(e) => {
                            if (e.target.value) {
                              const [teamId, date] = e.target.value.split('|');
                              scheduleDelivery(order.id, date, teamId);
                            }
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        >
                          <option value="">Schedule Delivery</option>
                          {teams.map(team => (
                            <option key={team.id} value={`${team.id}|${new Date().toISOString()}`}>
                              {team.name} - Today
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-600 text-center py-4">No pending deliveries</p>
                )}
              </div>
            </div>
          </div>

          {/* Assembly Requests */}
          <div className="mt-6 bg-white rounded-lg shadow-sm">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold text-text-dark flex items-center space-x-2">
                <Users className="w-5 h-5" />
                <span>Assembly Requests</span>
              </h2>
            </div>
            <div className="p-6">
              {assemblyRequests.length > 0 ? (
                <div className="space-y-4">
                  {assemblyRequests.map((request) => (
                    <div key={request.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-text-dark">Order #{request.orderId}</h3>
                          <p className="text-sm text-gray-600">Requested: {new Date(request.requestedDate?.toDate?.() || request.requestedDate).toLocaleDateString()}</p>
                        </div>
                        <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded text-sm">Pending</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600 text-center py-4">No assembly requests</p>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

