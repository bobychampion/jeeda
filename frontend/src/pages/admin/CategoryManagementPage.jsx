import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/common/Header';
import AdminSidebar from '../../components/admin/AdminSidebar';
import { categoryService } from '../../services/categoryService';
import { uploadImage } from '../../services/storageService';
import { useAuth } from '../../context/AuthContext';
import { Plus, Edit, Trash2, X, Upload, Eye, EyeOff, GripVertical } from 'lucide-react';

export default function CategoryManagementPage() {
  const { userData } = useAuth();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    imageUrl: '',
    hidden: false,
    aiAllowed: true,
    type: 'furniture', // 'room' or 'furniture'
  });
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    if (userData?.role !== 'admin') {
      navigate('/');
      return;
    }
    fetchCategories();
  }, [userData]);

  const fetchCategories = async () => {
    try {
      const data = await categoryService.getAll();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (file) => {
    setUploadingImage(true);
    try {
      const url = await uploadImage(file, 'categories');
      setFormData({ ...formData, imageUrl: url });
      alert('Image uploaded successfully!');
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        await categoryService.update(editingCategory.id, formData);
        alert('Category updated successfully!');
      } else {
        await categoryService.create(formData);
        alert('Category created successfully!');
      }
      setShowForm(false);
      setEditingCategory(null);
      resetForm();
      fetchCategories();
    } catch (error) {
      console.error('Error saving category:', error);
      alert('Failed to save category.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    try {
      await categoryService.delete(id);
      fetchCategories();
      alert('Category deleted successfully!');
    } catch (error) {
      alert('Failed to delete category.');
    }
  };

  const handleToggleHidden = async (id, currentValue) => {
    try {
      await categoryService.update(id, { hidden: !currentValue });
      fetchCategories();
    } catch (error) {
      alert('Failed to update category.');
    }
  };

  const handleToggleAI = async (id, currentValue) => {
    try {
      await categoryService.update(id, { aiAllowed: !currentValue });
      fetchCategories();
    } catch (error) {
      alert('Failed to update category.');
    }
  };

  const handleReorder = async (newOrder) => {
    try {
      await categoryService.updateOrder(newOrder);
      setCategories(newOrder);
      alert('Category order updated!');
    } catch (error) {
      alert('Failed to update order.');
      fetchCategories();
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      imageUrl: '',
      hidden: false,
      aiAllowed: true,
      type: 'furniture',
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
            <h1 className="text-3xl font-bold text-text-dark">Category Management</h1>
            <button
              onClick={() => {
                resetForm();
                setEditingCategory(null);
                setShowForm(true);
              }}
              className="flex items-center space-x-2 px-4 py-2 bg-primary-green text-white rounded-lg hover:bg-green-600 transition"
            >
              <Plus className="w-5 h-5" />
              <span>Add Category</span>
            </button>
          </div>

          {/* Form Modal */}
          {showForm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-text-dark">
                    {editingCategory ? 'Edit Category' : 'Add New Category'}
                  </h2>
                  <button
                    onClick={() => {
                      setShowForm(false);
                      setEditingCategory(null);
                      resetForm();
                    }}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-text-dark mb-2">
                      Category Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-green"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-dark mb-2">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-green"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-dark mb-2">
                      Category Type *
                    </label>
                    <select
                      value={formData.type || 'furniture'}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-green"
                    >
                      <option value="furniture">Furniture Type (e.g., TV Consoles, Bookshelves)</option>
                      <option value="room">Room Type (e.g., Living Room, Bedroom, Kitchen)</option>
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                      Room categories help users find furniture by room. Furniture categories organize by product type.
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-dark mb-2">
                      Category Image
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) handleImageUpload(file);
                        }}
                        className="hidden"
                        id="category-image-upload"
                        disabled={uploadingImage}
                      />
                      <label
                        htmlFor="category-image-upload"
                        className={`cursor-pointer flex flex-col items-center ${uploadingImage ? 'opacity-50' : ''}`}
                      >
                        <Upload className="w-8 h-8 text-gray-400 mb-2" />
                        <span className="text-sm text-gray-600">
                          {uploadingImage ? 'Uploading...' : 'Click to upload'}
                        </span>
                      </label>
                    </div>
                    {formData.imageUrl && (
                      <img
                        src={formData.imageUrl}
                        alt="Category"
                        className="mt-4 w-32 h-32 object-cover rounded-lg"
                      />
                    )}
                  </div>

                  <div className="flex items-center space-x-6">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.hidden}
                        onChange={(e) => setFormData({ ...formData, hidden: e.target.checked })}
                        className="w-4 h-4 text-primary-green focus:ring-primary-green"
                      />
                      <span className="text-sm text-text-dark">Hide from users</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.aiAllowed}
                        onChange={(e) => setFormData({ ...formData, aiAllowed: e.target.checked })}
                        className="w-4 h-4 text-primary-green focus:ring-primary-green"
                      />
                      <span className="text-sm text-text-dark">Allow AI to recommend</span>
                    </label>
                  </div>

                  <div className="flex justify-end space-x-4 pt-4 border-t">
                    <button
                      type="button"
                      onClick={() => {
                        setShowForm(false);
                        setEditingCategory(null);
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
                      {editingCategory ? 'Update Category' : 'Create Category'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Categories List */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="p-6 border-b flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-text-dark">All Categories</h2>
                <p className="text-sm text-gray-600 mt-1">
                  {categories.filter(c => c.type === 'room').length} Room Categories, {categories.filter(c => c.type !== 'room').length} Furniture Categories
                </p>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-background-light">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-text-dark">Order</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-text-dark">Image</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-text-dark">Name</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-text-dark">Type</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-text-dark">Description</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-text-dark">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-text-dark">AI</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-text-dark">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.length > 0 ? (
                    categories.map((category, index) => (
                      <tr key={category.id} className="border-t">
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <GripVertical className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-600">{category.order || index + 1}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <img
                            src={category.imageUrl || '/placeholder.jpg'}
                            alt={category.name}
                            className="w-16 h-16 object-cover rounded"
                          />
                        </td>
                        <td className="px-6 py-4 text-sm font-semibold text-text-dark">
                          {category.name}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-2 py-1 text-xs rounded font-medium ${
                              category.type === 'room'
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-purple-100 text-purple-700'
                            }`}
                          >
                            {category.type === 'room' ? 'Room' : 'Furniture'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                          {category.description || 'No description'}
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => handleToggleHidden(category.id, category.hidden)}
                            className={`p-2 rounded ${
                              category.hidden ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
                            }`}
                          >
                            {category.hidden ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-2 py-1 text-xs rounded ${
                              category.aiAllowed
                                ? 'bg-green-100 text-green-700'
                                : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {category.aiAllowed ? 'Allowed' : 'Blocked'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => {
                                setEditingCategory(category);
                                setFormData({
                                  name: category.name || '',
                                  description: category.description || '',
                                  imageUrl: category.imageUrl || '',
                                  hidden: category.hidden || false,
                                  aiAllowed: category.aiAllowed !== undefined ? category.aiAllowed : true,
                                  type: category.type || 'furniture',
                                });
                                setShowForm(true);
                              }}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(category.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8" className="px-6 py-12 text-center text-gray-600">
                        No categories found. Click "Add Category" to create one.
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

