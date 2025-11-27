import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/common/Header';
import AdminSidebar from '../../components/admin/AdminSidebar';
import { inventoryService } from '../../services/firestoreService';
import { useAuth } from '../../context/AuthContext';
import { Plus, Edit, Trash2, X, Download, AlertTriangle, Package, ShoppingCart } from 'lucide-react';
import { collection, getDocs, addDoc, doc, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from '../../config/firebase';

export default function InventoryManagementPage() {
  const { userData } = useAuth();
  const navigate = useNavigate();
  const [inventory, setInventory] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showSupplierForm, setShowSupplierForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    category: 'General',
    quantity: '',
    unit: 'pcs',
    minStock: '',
    cost: '',
    supplierId: '',
    reorderLevel: '',
  });
  const [supplierFormData, setSupplierFormData] = useState({
    name: '',
    contactPerson: '',
    email: '',
    phone: '',
    address: '',
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
      const [inventoryData, suppliersData] = await Promise.all([
        inventoryService.getAll(),
        fetchSuppliers(),
      ]);
      setInventory(inventoryData);
      setSuppliers(suppliersData);
    } catch (error) {
      console.error('Error fetching inventory:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSuppliers = async () => {
    try {
      const suppliersRef = collection(db, 'suppliers');
      const snapshot = await getDocs(suppliersRef);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error fetching suppliers:', error);
      return [];
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const submitData = {
        ...formData,
        quantity: parseFloat(formData.quantity),
        minStock: parseFloat(formData.minStock),
        cost: parseFloat(formData.cost) || 0,
        reorderLevel: parseFloat(formData.reorderLevel) || parseFloat(formData.minStock),
      };
      
      if (editingItem) {
        await inventoryService.update(editingItem.id, submitData);
        alert('Inventory item updated successfully!');
      } else {
        await inventoryService.create(submitData);
        alert('Inventory item created successfully!');
      }
      setShowForm(false);
      setEditingItem(null);
      resetForm();
      fetchData();
    } catch (error) {
      alert('Failed to save inventory item.');
    }
  };

  const handleSupplierSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingSupplier) {
        const supplierRef = doc(db, 'suppliers', editingSupplier.id);
        await updateDoc(supplierRef, supplierFormData);
        alert('Supplier updated successfully!');
      } else {
        const suppliersRef = collection(db, 'suppliers');
        await addDoc(suppliersRef, {
          ...supplierFormData,
          createdAt: Timestamp.now(),
        });
        alert('Supplier created successfully!');
      }
      setShowSupplierForm(false);
      setEditingSupplier(null);
      resetSupplierForm();
      fetchData();
    } catch (error) {
      alert('Failed to save supplier.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    try {
      await inventoryService.delete(id);
      fetchData();
      alert('Item deleted successfully!');
    } catch (error) {
      alert('Failed to delete item.');
    }
  };

  const exportStockReport = () => {
    const csv = [
      ['Item Name', 'Category', 'Quantity', 'Unit', 'Min Stock', 'Status', 'Cost', 'Supplier'].join(','),
      ...inventory.map(item => {
        const supplier = suppliers.find(s => s.id === item.supplierId);
        const isLowStock = item.quantity <= item.minStock;
        return [
          item.name || '',
          item.category || '',
          item.quantity || 0,
          item.unit || '',
          item.minStock || 0,
          isLowStock ? 'Low Stock' : 'In Stock',
          item.cost || 0,
          supplier?.name || 'N/A',
        ].join(',');
      })
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `inventory_report_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      category: 'General',
      quantity: '',
      unit: 'pcs',
      minStock: '',
      cost: '',
      supplierId: '',
      reorderLevel: '',
    });
  };

  const resetSupplierForm = () => {
    setSupplierFormData({
      name: '',
      contactPerson: '',
      email: '',
      phone: '',
      address: '',
    });
  };

  const lowStockItems = inventory.filter(item => item.quantity <= item.minStock);

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
              <Package className="w-8 h-8" />
              <span>Inventory Management</span>
            </h1>
            <div className="flex space-x-2">
              <button
                onClick={exportStockReport}
                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg text-text-dark hover:bg-gray-100"
              >
                <Download className="w-5 h-5" />
                <span>Export Report</span>
              </button>
              <button
                onClick={() => {
                  resetSupplierForm();
                  setEditingSupplier(null);
                  setShowSupplierForm(true);
                }}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                <Plus className="w-5 h-5" />
                <span>Add Supplier</span>
              </button>
              <button
                onClick={() => {
                  resetForm();
                  setEditingItem(null);
                  setShowForm(true);
                }}
                className="flex items-center space-x-2 px-4 py-2 bg-primary-green text-white rounded-lg hover:bg-green-600"
              >
                <Plus className="w-5 h-5" />
                <span>Add Item</span>
              </button>
            </div>
          </div>

          {/* Low Stock Alerts */}
          {lowStockItems.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-center space-x-2 mb-2">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <h3 className="font-semibold text-red-800">Low Stock Alert</h3>
              </div>
              <p className="text-sm text-red-700 mb-2">
                {lowStockItems.length} item(s) are below minimum stock level:
              </p>
              <div className="flex flex-wrap gap-2">
                {lowStockItems.map(item => (
                  <span key={item.id} className="px-3 py-1 bg-red-100 text-red-700 rounded text-sm">
                    {item.name} ({item.quantity} {item.unit})
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Supplier Form Modal */}
          {showSupplierForm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg max-w-md w-full">
                <div className="p-6 border-b flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-text-dark">
                    {editingSupplier ? 'Edit Supplier' : 'Add Supplier'}
                  </h2>
                  <button onClick={() => { setShowSupplierForm(false); setEditingSupplier(null); resetSupplierForm(); }} className="text-gray-500">
                    <X className="w-6 h-6" />
                  </button>
                </div>
                <form onSubmit={handleSupplierSubmit} className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-text-dark mb-2">Supplier Name *</label>
                    <input
                      type="text"
                      value={supplierFormData.name}
                      onChange={(e) => setSupplierFormData({ ...supplierFormData, name: e.target.value })}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-green"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-dark mb-2">Contact Person</label>
                    <input
                      type="text"
                      value={supplierFormData.contactPerson}
                      onChange={(e) => setSupplierFormData({ ...supplierFormData, contactPerson: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-green"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-dark mb-2">Email</label>
                    <input
                      type="email"
                      value={supplierFormData.email}
                      onChange={(e) => setSupplierFormData({ ...supplierFormData, email: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-green"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-dark mb-2">Phone</label>
                    <input
                      type="tel"
                      value={supplierFormData.phone}
                      onChange={(e) => setSupplierFormData({ ...supplierFormData, phone: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-green"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-dark mb-2">Address</label>
                    <textarea
                      value={supplierFormData.address}
                      onChange={(e) => setSupplierFormData({ ...supplierFormData, address: e.target.value })}
                      rows={2}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-green"
                    />
                  </div>
                  <div className="flex justify-end space-x-4 pt-4 border-t">
                    <button
                      type="button"
                      onClick={() => { setShowSupplierForm(false); setEditingSupplier(null); resetSupplierForm(); }}
                      className="px-6 py-2 border border-gray-300 rounded-lg text-text-dark hover:bg-gray-100"
                    >
                      Cancel
                    </button>
                    <button type="submit" className="px-6 py-2 bg-primary-green text-white rounded-lg hover:bg-green-600">
                      {editingSupplier ? 'Update' : 'Create'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Inventory Form Modal */}
          {showForm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-text-dark">
                    {editingItem ? 'Edit Inventory Item' : 'Add Inventory Item'}
                  </h2>
                  <button
                    onClick={() => {
                      setShowForm(false);
                      setEditingItem(null);
                      resetForm();
                    }}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-text-dark mb-2">Item Name *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-green"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-text-dark mb-2">Category *</label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-green"
                      >
                        <option value="General">General</option>
                        <option value="MDF">MDF</option>
                        <option value="HDF">HDF</option>
                        <option value="Ply">Ply</option>
                        <option value="Marine Board">Marine Board</option>
                        <option value="Hardware">Hardware</option>
                        <option value="Finishing">Finishing</option>
                        <option value="Tools">Tools</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-dark mb-2">Unit *</label>
                      <select
                        value={formData.unit}
                        onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                        required
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
                      <label className="block text-sm font-medium text-text-dark mb-2">Quantity *</label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.quantity}
                        onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-green"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-dark mb-2">Min Stock *</label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.minStock}
                        onChange={(e) => setFormData({ ...formData, minStock: e.target.value })}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-green"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-dark mb-2">Reorder Level</label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.reorderLevel}
                        onChange={(e) => setFormData({ ...formData, reorderLevel: e.target.value })}
                        placeholder="Auto = Min Stock"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-green"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-text-dark mb-2">Cost per Unit (₦)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.cost}
                        onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-green"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-dark mb-2">Supplier</label>
                      <select
                        value={formData.supplierId}
                        onChange={(e) => setFormData({ ...formData, supplierId: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-green"
                      >
                        <option value="">Select Supplier</option>
                        {suppliers.map(supplier => (
                          <option key={supplier.id} value={supplier.id}>{supplier.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-4 pt-4 border-t">
                    <button
                      type="button"
                      onClick={() => {
                        setShowForm(false);
                        setEditingItem(null);
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
                      {editingItem ? 'Update Item' : 'Add Item'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Inventory List */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold text-text-dark">All Inventory Items</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-background-light">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-text-dark">Item Name</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-text-dark">Category</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-text-dark">Quantity</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-text-dark">Min Stock</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-text-dark">Cost</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-text-dark">Supplier</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-text-dark">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-text-dark">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {inventory.length > 0 ? (
                    inventory.map((item) => {
                      const isLowStock = item.quantity <= item.minStock;
                      const supplier = suppliers.find(s => s.id === item.supplierId);
                      return (
                        <tr key={item.id} className={`border-t ${isLowStock ? 'bg-red-50' : ''}`}>
                          <td className="px-6 py-4 text-sm font-semibold text-text-dark">{item.name}</td>
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
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {supplier ? (
                              <div>
                                <span>{supplier.name}</span>
                                {supplier.phone && (
                                  <button
                                    onClick={() => window.open(`tel:${supplier.phone}`)}
                                    className="ml-2 text-primary-green hover:underline"
                                    title="Call supplier"
                                  >
                                    <ShoppingCart className="w-4 h-4 inline" />
                                  </button>
                                )}
                              </div>
                            ) : (
                              'N/A'
                            )}
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
                                  setEditingItem(item);
                                  setFormData({
                                    name: item.name || '',
                                    category: item.category || 'General',
                                    quantity: item.quantity?.toString() || '',
                                    unit: item.unit || 'pcs',
                                    minStock: item.minStock?.toString() || '',
                                    cost: item.cost?.toString() || '',
                                    supplierId: item.supplierId || '',
                                    reorderLevel: item.reorderLevel?.toString() || item.minStock?.toString() || '',
                                  });
                                  setShowForm(true);
                                }}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(item.id)}
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
                      <td colSpan="8" className="px-6 py-12 text-center text-gray-600">
                        No inventory items found. Click "Add Item" to create one.
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

