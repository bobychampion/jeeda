import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/common/Header';
import AdminSidebar from '../../components/admin/AdminSidebar';
import { promotionsService } from '../../services/promotionsService';
import { categoryService } from '../../services/categoryService';
import { useAuth } from '../../context/AuthContext';
import { Plus, Edit, Trash2, X, Tag, Calendar, Percent, DollarSign } from 'lucide-react';

export default function PromotionsPage() {
  const { userData } = useAuth();
  const navigate = useNavigate();
  const [promotions, setPromotions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState(null);
  const [formData, setFormData] = useState({
    code: '',
    type: 'percentage', // percentage, fixed, free_delivery, first_time
    value: '',
    description: '',
    startDate: '',
    endDate: '',
    maxUsage: '',
    active: true,
    categoryId: '',
    minPurchaseAmount: '',
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
      const [promotionsData, categoriesData] = await Promise.all([
        promotionsService.getAll(),
        categoryService.getAll(),
      ]);
      setPromotions(promotionsData);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error fetching promotions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const promotionData = {
        ...formData,
        value: parseFloat(formData.value) || 0,
        maxUsage: formData.maxUsage ? parseInt(formData.maxUsage) : null,
        minPurchaseAmount: formData.minPurchaseAmount ? parseFloat(formData.minPurchaseAmount) : null,
        startDate: new Date(formData.startDate),
        endDate: new Date(formData.endDate),
      };
      
      if (editingPromotion) {
        await promotionsService.update(editingPromotion.id, promotionData);
        alert('Promotion updated successfully!');
      } else {
        await promotionsService.create(promotionData);
        alert('Promotion created successfully!');
      }
      setShowForm(false);
      setEditingPromotion(null);
      resetForm();
      fetchData();
    } catch (error) {
      alert('Failed to save promotion.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this promotion?')) return;
    try {
      await promotionsService.delete(id);
      fetchData();
      alert('Promotion deleted successfully!');
    } catch (error) {
      alert('Failed to delete promotion.');
    }
  };

  const resetForm = () => {
    setFormData({
      code: '',
      type: 'percentage',
      value: '',
      description: '',
      startDate: '',
      endDate: '',
      maxUsage: '',
      active: true,
      categoryId: '',
      minPurchaseAmount: '',
    });
  };

  const isActive = (promotion) => {
    const now = new Date();
    const start = promotion.startDate?.toDate?.() || new Date(promotion.startDate);
    const end = promotion.endDate?.toDate?.() || new Date(promotion.endDate);
    return promotion.active && now >= start && now <= end;
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
            <h1 className="text-3xl font-bold text-text-dark flex items-center space-x-2">
              <Tag className="w-8 h-8" />
              <span>Promotions & Discounts</span>
            </h1>
            <button
              onClick={() => {
                resetForm();
                setEditingPromotion(null);
                setShowForm(true);
              }}
              className="flex items-center space-x-2 px-4 py-2 bg-primary-green text-white rounded-lg hover:bg-green-600 transition"
            >
              <Plus className="w-5 h-5" />
              <span>Create Promotion</span>
            </button>
          </div>

          {/* Form Modal */}
          {showForm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-text-dark">
                    {editingPromotion ? 'Edit Promotion' : 'Create New Promotion'}
                  </h2>
                  <button
                    onClick={() => {
                      setShowForm(false);
                      setEditingPromotion(null);
                      resetForm();
                    }}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-text-dark mb-2">Promotion Code *</label>
                    <input
                      type="text"
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                      required
                      placeholder="SUMMER2024"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-green"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-dark mb-2">Promotion Type *</label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-green"
                    >
                      <option value="percentage">Percentage Discount</option>
                      <option value="fixed">Fixed Amount Discount</option>
                      <option value="free_delivery">Free Delivery</option>
                      <option value="first_time">First-Time Buyer Discount</option>
                    </select>
                  </div>

                  {formData.type !== 'free_delivery' && formData.type !== 'first_time' && (
                    <div>
                      <label className="block text-sm font-medium text-text-dark mb-2">
                        Discount Value * {formData.type === 'percentage' ? '(%)' : '(₦)'}
                      </label>
                      <input
                        type="number"
                        value={formData.value}
                        onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                        required
                        min="0"
                        max={formData.type === 'percentage' ? '100' : undefined}
                        step={formData.type === 'percentage' ? '1' : '0.01'}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-green"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-text-dark mb-2">Description</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-green"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-text-dark mb-2">Start Date *</label>
                      <input
                        type="datetime-local"
                        value={formData.startDate}
                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-green"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-dark mb-2">End Date *</label>
                      <input
                        type="datetime-local"
                        value={formData.endDate}
                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-green"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-text-dark mb-2">Max Usage (optional)</label>
                      <input
                        type="number"
                        value={formData.maxUsage}
                        onChange={(e) => setFormData({ ...formData, maxUsage: e.target.value })}
                        min="1"
                        placeholder="Unlimited if empty"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-green"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-dark mb-2">Min Purchase Amount (₦)</label>
                      <input
                        type="number"
                        value={formData.minPurchaseAmount}
                        onChange={(e) => setFormData({ ...formData, minPurchaseAmount: e.target.value })}
                        min="0"
                        step="0.01"
                        placeholder="No minimum"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-green"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-dark mb-2">Category (optional)</label>
                    <select
                      value={formData.categoryId}
                      onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-green"
                    >
                      <option value="">All Categories</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>

                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.active}
                      onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                      className="w-4 h-4 text-primary-green focus:ring-primary-green"
                    />
                    <span className="text-sm text-text-dark">Active</span>
                  </label>

                  <div className="flex justify-end space-x-4 pt-4 border-t">
                    <button
                      type="button"
                      onClick={() => {
                        setShowForm(false);
                        setEditingPromotion(null);
                        resetForm();
                      }}
                      className="px-6 py-2 border border-gray-300 rounded-lg text-text-dark hover:bg-gray-100"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2 bg-primary-green text-white rounded-lg hover:bg-green-600"
                    >
                      {editingPromotion ? 'Update Promotion' : 'Create Promotion'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Promotions List */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold text-text-dark">All Promotions</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-background-light">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-text-dark">Code</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-text-dark">Type</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-text-dark">Value</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-text-dark">Period</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-text-dark">Usage</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-text-dark">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-text-dark">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {promotions.length > 0 ? (
                    promotions.map((promotion) => {
                      const active = isActive(promotion);
                      return (
                        <tr key={promotion.id} className="border-t">
                          <td className="px-6 py-4">
                            <span className="font-mono font-semibold text-primary-green">{promotion.code}</span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600 capitalize">
                            {promotion.type?.replace('_', ' ')}
                          </td>
                          <td className="px-6 py-4">
                            {promotion.type === 'percentage' ? (
                              <span className="font-semibold">{promotion.value}%</span>
                            ) : promotion.type === 'fixed' ? (
                              <span className="font-semibold">₦{promotion.value}</span>
                            ) : (
                              <span className="text-gray-500">-</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            <div className="flex items-center space-x-1">
                              <Calendar className="w-3 h-3" />
                              <span>
                                {promotion.startDate?.toDate?.()?.toLocaleDateString() || 'N/A'} - {' '}
                                {promotion.endDate?.toDate?.()?.toLocaleDateString() || 'N/A'}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {promotion.usageCount || 0} / {promotion.maxUsage || '∞'}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 text-xs rounded ${
                              active
                                ? 'bg-green-100 text-green-700'
                                : 'bg-gray-100 text-gray-700'
                            }`}>
                              {active ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => {
                                  setEditingPromotion(promotion);
                                  setFormData({
                                    code: promotion.code || '',
                                    type: promotion.type || 'percentage',
                                    value: promotion.value?.toString() || '',
                                    description: promotion.description || '',
                                    startDate: promotion.startDate?.toDate?.()?.toISOString().slice(0, 16) || '',
                                    endDate: promotion.endDate?.toDate?.()?.toISOString().slice(0, 16) || '',
                                    maxUsage: promotion.maxUsage?.toString() || '',
                                    active: promotion.active !== undefined ? promotion.active : true,
                                    categoryId: promotion.categoryId || '',
                                    minPurchaseAmount: promotion.minPurchaseAmount?.toString() || '',
                                  });
                                  setShowForm(true);
                                }}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(promotion.id)}
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
                        No promotions found. Click "Create Promotion" to add one.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

