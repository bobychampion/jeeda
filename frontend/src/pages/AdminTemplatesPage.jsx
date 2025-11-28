import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/common/Header';
import AdminSidebar from '../components/admin/AdminSidebar';
import { templatesService } from '../services/firestoreService';
import { categoryService } from '../services/categoryService';
import { uploadImage } from '../services/storageService';
import { getRecommendations } from '../services/aiService';
import { useAuth } from '../context/AuthContext';
import { Plus, Edit, Trash2, X, Bot, Sparkles, Upload, Loader2 } from 'lucide-react';
import { API_URL } from '../config/api.js';

export default function AdminTemplatesPage() {
  const { userData, currentUser } = useAuth();
  const navigate = useNavigate();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [roomCategories, setRoomCategories] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    description: '',
    basePrice: '',
    sku: '',
    availableColors: [],
    availableMaterials: [],
    dimensions: { 
      min: { width: '', height: '', depth: '' }, 
      max: { width: '', height: '', depth: '' }, 
      default: { width: '', height: '', depth: '' } 
    },
    priceMultipliers: {
      material: 1.0,
      size: 1.0,
      finishing: 0,
    },
    images: [],
    difficulty: 'Beginner',
    estimatedBuildTime: '4 Hours',
  });
  const [newColor, setNewColor] = useState('');
  const [newMaterial, setNewMaterial] = useState('');
  const [newKeyword, setNewKeyword] = useState('');
  const [newRoomType, setNewRoomType] = useState('');
  const [newUseCase, setNewUseCase] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [aiSuggesting, setAiSuggesting] = useState(false);
  const [aiEnhancing, setAiEnhancing] = useState(false);
  const [calculatedPrice, setCalculatedPrice] = useState(0);
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [creatingCategory, setCreatingCategory] = useState(false);
  const [assigningCategories, setAssigningCategories] = useState(false);

  useEffect(() => {
    if (userData?.role !== 'admin') {
      navigate('/');
      return;
    }
    fetchTemplates();
    fetchRoomCategories();
  }, [userData]);

  const fetchRoomCategories = async () => {
    try {
      const categories = await categoryService.getRoomCategories();
      setRoomCategories(categories);
    } catch (error) {
      console.error('Error fetching room categories:', error);
    }
  };

  const handleCreateNewCategory = async () => {
    if (!newCategoryName.trim()) {
      alert('Please enter a category name');
      return;
    }

    // Check if category already exists
    const exists = roomCategories.some(
      cat => cat.name.toLowerCase() === newCategoryName.trim().toLowerCase()
    );
    if (exists) {
      alert('This room category already exists');
      setNewCategoryName('');
      setShowNewCategoryInput(false);
      return;
    }

    setCreatingCategory(true);
    try {
      const newCategory = await categoryService.create({
        name: newCategoryName.trim(),
        description: `Furniture for ${newCategoryName.trim()}`,
        type: 'room',
        hidden: false,
        aiAllowed: true,
        imageUrl: '',
      });

      // Refresh categories list
      await fetchRoomCategories();
      
      // Select the new category
      setFormData({ ...formData, category: newCategory.name });
      
      // Reset form
      setNewCategoryName('');
      setShowNewCategoryInput(false);
      
      alert(`Room category "${newCategory.name}" created successfully!`);
    } catch (error) {
      console.error('Error creating category:', error);
      alert('Failed to create category. Please try again.');
    } finally {
      setCreatingCategory(false);
    }
  };

  const handleRandomAssignCategories = async () => {
    if (!window.confirm(
      'This will randomly assign all templates to room categories.\n\n' +
      'Templates that already have valid room categories will be skipped.\n\n' +
      'Do you want to continue?'
    )) {
      return;
    }

    setAssigningCategories(true);
    try {
      // Get auth token
      const token = currentUser ? await currentUser.getIdToken() : localStorage.getItem('authToken');
      
      if (!token) {
        throw new Error('You must be logged in to perform this action');
      }
      
      // API_URL is imported from config/api.js
      const response = await fetch(`${API_URL}/api/templates/assign-categories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to assign categories');
      }

      const result = await response.json();
      
      alert(
        `✅ Categories assigned successfully!\n\n` +
        `Updated: ${result.updated} templates\n` +
        `Skipped: ${result.skipped} templates\n\n` +
        `Distribution:\n${Object.entries(result.distribution)
          .map(([cat, count]) => `  ${cat}: ${count}`)
          .join('\n')}`
      );

      // Refresh templates list
      await fetchTemplates();
    } catch (error) {
      console.error('Error assigning categories:', error);
      alert(`Failed to assign categories: ${error.message}\n\nPlease run the script manually from the backend.`);
    } finally {
      setAssigningCategories(false);
    }
  };

  const fetchTemplates = async () => {
    try {
      const templatesData = await templatesService.getAll();
      setTemplates(templatesData);
    } catch (error) {
      console.error('Error fetching templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const submitData = {
        ...formData,
        basePrice: parseFloat(formData.basePrice),
        availableColors: formData.availableColors.filter(c => c.trim()),
        availableMaterials: formData.availableMaterials.filter(m => m.trim()),
        searchKeywords: formData.searchKeywords.filter(k => k.trim()),
        roomTypes: formData.roomTypes.filter(r => r.trim()),
        useCases: formData.useCases.filter(u => u.trim()),
      };

      if (editingTemplate) {
        await templatesService.update(editingTemplate.id, submitData);
      } else {
        await templatesService.create(submitData);
      }

      setShowForm(false);
      setEditingTemplate(null);
      resetForm();
      fetchTemplates();
      alert(editingTemplate ? 'Template updated successfully!' : 'Template created successfully!');
    } catch (error) {
      console.error('Error saving template:', error);
      alert('Failed to save template. Please try again.');
    }
  };

  const handleEdit = (template) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name || '',
      category: template.category || '',
      description: template.description || '',
      basePrice: template.basePrice || '',
      sku: template.sku || '',
      availableColors: template.availableColors || [],
      availableMaterials: template.availableMaterials || [],
      searchKeywords: template.searchKeywords || [],
      roomTypes: template.roomTypes || [],
      useCases: template.useCases || [],
      dimensions: template.dimensions || { 
        min: { width: '', height: '', depth: '' }, 
        max: { width: '', height: '', depth: '' }, 
        default: { width: '', height: '', depth: '' } 
      },
      priceMultipliers: template.priceMultipliers || {
        material: 1.0,
        size: 1.0,
        finishing: 0,
      },
      images: template.images || [],
      difficulty: template.difficulty || 'Beginner',
      estimatedBuildTime: template.estimatedBuildTime || '4 Hours',
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this template?')) {
      return;
    }

    try {
      await templatesService.delete(id);
      fetchTemplates();
      alert('Template deleted successfully!');
    } catch (error) {
      console.error('Error deleting template:', error);
      alert('Failed to delete template.');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      category: '',
      description: '',
      basePrice: '',
      sku: '',
      availableColors: [],
      availableMaterials: [],
      searchKeywords: [],
      roomTypes: [],
      useCases: [],
      dimensions: { 
        min: { width: '', height: '', depth: '' }, 
        max: { width: '', height: '', depth: '' }, 
        default: { width: '', height: '', depth: '' } 
      },
      priceMultipliers: {
        material: 1.0,
        size: 1.0,
        finishing: 0,
      },
      images: [],
      difficulty: 'Beginner',
      estimatedBuildTime: '4 Hours',
    });
    setNewColor('');
    setNewMaterial('');
    setCalculatedPrice(0);
    setShowNewCategoryInput(false);
    setNewCategoryName('');
  };

  const generateSKU = () => {
    if (!formData.category || !formData.name) {
      alert('Please enter category and name first');
      return;
    }
    const categoryCode = formData.category.substring(0, 3).toUpperCase();
    const dateCode = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const nameCode = formData.name.substring(0, 3).toUpperCase();
    const randomCode = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    const sku = `${categoryCode}-${dateCode}-${nameCode}-${randomCode}`;
    setFormData({ ...formData, sku });
  };

  const calculatePrice = () => {
    const base = parseFloat(formData.basePrice) || 0;
    const materialMultiplier = parseFloat(formData.priceMultipliers?.material) || 1.0;
    const sizeMultiplier = parseFloat(formData.priceMultipliers?.size) || 1.0;
    const finishing = parseFloat(formData.priceMultipliers?.finishing) || 0;
    const total = (base * materialMultiplier * sizeMultiplier) + finishing;
    setCalculatedPrice(total);
    return total;
  };

  const handleImageUpload = async (files) => {
    if (!files || files.length === 0) return;
    
    setUploadingImage(true);
    const uploadedUrls = [];
    
    try {
      // Upload all files
      for (const file of Array.from(files)) {
        try {
          const url = await uploadImage(file, 'templates');
          uploadedUrls.push(url);
        } catch (error) {
          console.error('Error uploading image:', error);
          alert(`Failed to upload ${file.name}. Please try again.`);
        }
      }
      
      if (uploadedUrls.length > 0) {
        setFormData({
          ...formData,
          images: [...formData.images, ...uploadedUrls],
        });
        alert(`${uploadedUrls.length} image(s) uploaded successfully!`);
      }
    } catch (error) {
      console.error('Error uploading images:', error);
      alert('Failed to upload images.');
    } finally {
      setUploadingImage(false);
    }
  };

  const getAICategorySuggestions = async () => {
    if (!formData.name && !formData.description) {
      alert('Please enter template name or description first');
      return;
    }
    setAiSuggesting(true);
    try {
      const query = `Based on this furniture template: Name: ${formData.name}, Description: ${formData.description}. Suggest the best category for this template. Return only the category name.`;
      const response = await getRecommendations(query);
      if (response.message) {
        const suggestedCategory = response.message.split('\n')[0].trim();
        setFormData({ ...formData, category: suggestedCategory });
        alert(`AI suggests: ${suggestedCategory}`);
      }
    } catch (error) {
      alert('Failed to get AI suggestions.');
    } finally {
      setAiSuggesting(false);
    }
  };

  const enhanceWithAI = async () => {
    if (!formData.name && !formData.description) {
      alert('Please enter at least a template name or description to enhance');
      return;
    }

    setAiEnhancing(true);
    try {
      // Get auth token (optional for this endpoint, but good practice)
      const token = currentUser ? await currentUser.getIdToken() : localStorage.getItem('authToken');
      
      const headers = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      // API_URL is imported from config/api.js
      const response = await fetch(`${API_URL}/api/ai/enhance-template`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          category: formData.category,
          currentData: {
            difficulty: formData.difficulty,
            availableMaterials: formData.availableMaterials,
            availableColors: formData.availableColors,
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to enhance template data');
      }

      const enhanced = await response.json();

      // Apply AI enhancements to form
      setFormData({
        ...formData,
        description: enhanced.description || formData.description,
        category: enhanced.category || formData.category,
        searchKeywords: enhanced.searchKeywords || formData.searchKeywords,
        roomTypes: enhanced.roomTypes || formData.roomTypes,
        useCases: enhanced.useCases || formData.useCases,
        difficulty: enhanced.difficulty || formData.difficulty,
        availableMaterials: enhanced.suggestedMaterials?.length > 0 
          ? [...new Set([...formData.availableMaterials, ...enhanced.suggestedMaterials])]
          : formData.availableMaterials,
        availableColors: enhanced.suggestedColors?.length > 0
          ? [...new Set([...formData.availableColors, ...enhanced.suggestedColors])]
          : formData.availableColors,
      });

      alert('Template data enhanced successfully! Review and adjust as needed.');
    } catch (error) {
      console.error('Error enhancing template:', error);
      alert('Failed to enhance template data. Please try again.');
    } finally {
      setAiEnhancing(false);
    }
  };

  const getColorPreviewUrl = (baseImageUrl, color) => {
    if (!baseImageUrl) return '';
    // Use Cloudinary transformation for color preview
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    if (baseImageUrl.includes('cloudinary.com')) {
      const parts = baseImageUrl.split('/upload/');
      if (parts.length === 2) {
        return `${parts[0]}/upload/e_tint:50:${encodeURIComponent(color)}/${parts[1]}`;
      }
    }
    return baseImageUrl;
  };

  const addColor = () => {
    if (newColor.trim()) {
      setFormData({
        ...formData,
        availableColors: [...formData.availableColors, newColor.trim()],
      });
      setNewColor('');
    }
  };

  const removeColor = (index) => {
    setFormData({
      ...formData,
      availableColors: formData.availableColors.filter((_, i) => i !== index),
    });
  };

  const addMaterial = () => {
    if (newMaterial.trim()) {
      setFormData({
        ...formData,
        availableMaterials: [...formData.availableMaterials, newMaterial.trim()],
      });
      setNewMaterial('');
    }
  };

  const removeMaterial = (index) => {
    setFormData({
      ...formData,
      availableMaterials: formData.availableMaterials.filter((_, i) => i !== index),
    });
  };

  const addKeyword = () => {
    if (newKeyword.trim()) {
      setFormData({
        ...formData,
        searchKeywords: [...formData.searchKeywords, newKeyword.trim()],
      });
      setNewKeyword('');
    }
  };

  const removeKeyword = (index) => {
    setFormData({
      ...formData,
      searchKeywords: formData.searchKeywords.filter((_, i) => i !== index),
    });
  };

  const addRoomType = () => {
    if (newRoomType.trim()) {
      setFormData({
        ...formData,
        roomTypes: [...formData.roomTypes, newRoomType.trim()],
      });
      setNewRoomType('');
    }
  };

  const removeRoomType = (index) => {
    setFormData({
      ...formData,
      roomTypes: formData.roomTypes.filter((_, i) => i !== index),
    });
  };

  const addUseCase = () => {
    if (newUseCase.trim()) {
      setFormData({
        ...formData,
        useCases: [...formData.useCases, newUseCase.trim()],
      });
      setNewUseCase('');
    }
  };

  const removeUseCase = (index) => {
    setFormData({
      ...formData,
      useCases: formData.useCases.filter((_, i) => i !== index),
    });
  };

  const removeImage = (index) => {
    setFormData({
      ...formData,
      images: formData.images.filter((_, i) => i !== index),
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
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-text-dark">Template Management</h1>
            <div className="flex space-x-3">
              <button
                onClick={handleRandomAssignCategories}
                disabled={assigningCategories}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
                title="Randomly assign all templates to room categories"
              >
                {assigningCategories ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Assigning...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    <span>Assign Categories</span>
                  </>
                )}
              </button>
              <button
                onClick={() => {
                  resetForm();
                  setEditingTemplate(null);
                  setShowForm(true);
                }}
                className="flex items-center space-x-2 px-4 py-2 bg-primary-green text-white rounded-lg hover:bg-green-600 transition"
              >
                <Plus className="w-5 h-5" />
                <span>Add New Template</span>
              </button>
            </div>
          </div>

          {/* Form Modal */}
          {showForm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-text-dark">
                    {editingTemplate ? 'Edit Template' : 'Add New Template'}
                  </h2>
                  <button
                    onClick={() => {
                      setShowForm(false);
                      setEditingTemplate(null);
                      resetForm();
                    }}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-text-dark mb-2">
                        Template Name *
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
                        Room Category *
                      </label>
                      {!showNewCategoryInput ? (
                        <div className="flex space-x-2">
                          <select
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            required
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-green"
                          >
                            <option value="">Select Room Category</option>
                            {roomCategories.map((category) => (
                              <option key={category.id} value={category.name}>
                                {category.name}
                              </option>
                            ))}
                          </select>
                          <button
                            type="button"
                            onClick={getAICategorySuggestions}
                            disabled={aiSuggesting}
                            className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50"
                            title="Get AI room category suggestion"
                          >
                            <Bot className="w-5 h-5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setShowNewCategoryInput(true)}
                            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                            title="Create new room category"
                          >
                            <Plus className="w-5 h-5" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex space-x-2">
                          <input
                            type="text"
                            value={newCategoryName}
                            onChange={(e) => setNewCategoryName(e.target.value)}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleCreateNewCategory();
                              } else if (e.key === 'Escape') {
                                setShowNewCategoryInput(false);
                                setNewCategoryName('');
                              }
                            }}
                            placeholder="Enter new room category name (e.g., Study Room)"
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-green"
                            autoFocus
                          />
                          <button
                            type="button"
                            onClick={handleCreateNewCategory}
                            disabled={creatingCategory || !newCategoryName.trim()}
                            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50"
                            title="Create category"
                          >
                            {creatingCategory ? (
                              <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                              <Plus className="w-5 h-5" />
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setShowNewCategoryInput(false);
                              setNewCategoryName('');
                            }}
                            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                            title="Cancel"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                      )}
                      <p className="text-xs text-gray-500 mt-1">
                        {showNewCategoryInput 
                          ? 'Enter a new room category name and press Enter or click the + button'
                          : 'Select the room where this furniture template is best suited, or create a new room category'}
                      </p>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-text-dark">
                        Description *
                      </label>
                      <button
                        type="button"
                        onClick={enhanceWithAI}
                        disabled={aiEnhancing || (!formData.name && !formData.description)}
                        className="flex items-center gap-2 px-3 py-1.5 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                        title="Use AI to enhance all template data (description, category, keywords, room types, use cases, etc.)"
                      >
                        {aiEnhancing ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Enhancing...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4" />
                            Enhance with AI
                          </>
                        )}
                      </button>
                    </div>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      required
                      rows={3}
                      placeholder="Enter a basic description, then click 'Enhance with AI' to improve it..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-green"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      💡 Tip: Write a basic description, then use "Enhance with AI" to automatically improve it and suggest categories, keywords, room types, and more!
                    </p>
                  </div>

                  {/* Price Calculator */}
                  <div className="bg-background-light rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-text-dark mb-4">Price Calculator</h3>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-text-dark mb-2">
                          Base Price (₦) *
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={formData.basePrice}
                          onChange={(e) => {
                            setFormData({ ...formData, basePrice: e.target.value });
                            setTimeout(calculatePrice, 100);
                          }}
                          required
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-green"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-text-dark mb-2">
                          Material Multiplier
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          value={formData.priceMultipliers?.material || 1.0}
                          onChange={(e) => {
                            setFormData({
                              ...formData,
                              priceMultipliers: {
                                ...formData.priceMultipliers,
                                material: parseFloat(e.target.value) || 1.0,
                              },
                            });
                            setTimeout(calculatePrice, 100);
                          }}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-green"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-text-dark mb-2">
                          Size Multiplier
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          value={formData.priceMultipliers?.size || 1.0}
                          onChange={(e) => {
                            setFormData({
                              ...formData,
                              priceMultipliers: {
                                ...formData.priceMultipliers,
                                size: parseFloat(e.target.value) || 1.0,
                              },
                            });
                            setTimeout(calculatePrice, 100);
                          }}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-green"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-text-dark mb-2">
                          Finishing Cost (₦)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={formData.priceMultipliers?.finishing || 0}
                          onChange={(e) => {
                            setFormData({
                              ...formData,
                              priceMultipliers: {
                                ...formData.priceMultipliers,
                                finishing: parseFloat(e.target.value) || 0,
                              },
                            });
                            setTimeout(calculatePrice, 100);
                          }}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-green"
                        />
                      </div>
                    </div>
                    <div className="bg-white rounded-lg p-4 border-2 border-primary-green">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-text-dark">Total Price:</span>
                        <span className="text-2xl font-bold text-primary-green">
                          ₦{calculatedPrice.toFixed(2) || calculatePrice().toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Dimensions */}
                  <div className="bg-background-light rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-text-dark mb-4">Dimensions (cm)</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-text-dark mb-2">Minimum Dimensions</label>
                        <div className="grid grid-cols-3 gap-2">
                          <input
                            type="number"
                            placeholder="Width"
                            value={formData.dimensions?.min?.width || ''}
                            onChange={(e) => setFormData({
                              ...formData,
                              dimensions: {
                                ...formData.dimensions,
                                min: { ...formData.dimensions?.min, width: e.target.value },
                              },
                            })}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-green"
                          />
                          <input
                            type="number"
                            placeholder="Height"
                            value={formData.dimensions?.min?.height || ''}
                            onChange={(e) => setFormData({
                              ...formData,
                              dimensions: {
                                ...formData.dimensions,
                                min: { ...formData.dimensions?.min, height: e.target.value },
                              },
                            })}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-green"
                          />
                          <input
                            type="number"
                            placeholder="Depth"
                            value={formData.dimensions?.min?.depth || ''}
                            onChange={(e) => setFormData({
                              ...formData,
                              dimensions: {
                                ...formData.dimensions,
                                min: { ...formData.dimensions?.min, depth: e.target.value },
                              },
                            })}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-green"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-text-dark mb-2">Maximum Dimensions</label>
                        <div className="grid grid-cols-3 gap-2">
                          <input
                            type="number"
                            placeholder="Width"
                            value={formData.dimensions?.max?.width || ''}
                            onChange={(e) => setFormData({
                              ...formData,
                              dimensions: {
                                ...formData.dimensions,
                                max: { ...formData.dimensions?.max, width: e.target.value },
                              },
                            })}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-green"
                          />
                          <input
                            type="number"
                            placeholder="Height"
                            value={formData.dimensions?.max?.height || ''}
                            onChange={(e) => setFormData({
                              ...formData,
                              dimensions: {
                                ...formData.dimensions,
                                max: { ...formData.dimensions?.max, height: e.target.value },
                              },
                            })}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-green"
                          />
                          <input
                            type="number"
                            placeholder="Depth"
                            value={formData.dimensions?.max?.depth || ''}
                            onChange={(e) => setFormData({
                              ...formData,
                              dimensions: {
                                ...formData.dimensions,
                                max: { ...formData.dimensions?.max, depth: e.target.value },
                              },
                            })}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-green"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-text-dark mb-2">Default Dimensions</label>
                        <div className="grid grid-cols-3 gap-2">
                          <input
                            type="number"
                            placeholder="Width"
                            value={formData.dimensions?.default?.width || ''}
                            onChange={(e) => setFormData({
                              ...formData,
                              dimensions: {
                                ...formData.dimensions,
                                default: { ...formData.dimensions?.default, width: e.target.value },
                              },
                            })}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-green"
                          />
                          <input
                            type="number"
                            placeholder="Height"
                            value={formData.dimensions?.default?.height || ''}
                            onChange={(e) => setFormData({
                              ...formData,
                              dimensions: {
                                ...formData.dimensions,
                                default: { ...formData.dimensions?.default, height: e.target.value },
                              },
                            })}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-green"
                          />
                          <input
                            type="number"
                            placeholder="Depth"
                            value={formData.dimensions?.default?.depth || ''}
                            onChange={(e) => setFormData({
                              ...formData,
                              dimensions: {
                                ...formData.dimensions,
                                default: { ...formData.dimensions?.default, depth: e.target.value },
                              },
                            })}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-green"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-text-dark mb-2">
                        SKU
                      </label>
                      <div className="flex space-x-2">
                        <input
                          type="text"
                          value={formData.sku}
                          onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-green"
                        />
                        <button
                          type="button"
                          onClick={generateSKU}
                          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                          title="Auto-generate SKU"
                        >
                          <Sparkles className="w-5 h-5" />
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-text-dark mb-2">
                        Difficulty
                      </label>
                      <select
                        value={formData.difficulty}
                        onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-green"
                      >
                        <option value="Beginner">Beginner</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Advanced">Advanced</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-dark mb-2">
                      Estimated Build Time
                    </label>
                    <input
                      type="text"
                      value={formData.estimatedBuildTime}
                      onChange={(e) => setFormData({ ...formData, estimatedBuildTime: e.target.value })}
                      placeholder="e.g., 4 Hours"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-green"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-dark mb-2">
                      Available Colors
                    </label>
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={newColor}
                        onChange={(e) => setNewColor(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addColor())}
                        placeholder="Add color (e.g., Oak, Walnut)"
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-green"
                      />
                      <button
                        type="button"
                        onClick={addColor}
                        className="px-4 py-2 bg-gray-200 text-text-dark rounded-lg hover:bg-gray-300"
                      >
                        Add
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.availableColors.map((color, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-3 py-1 bg-primary-green bg-opacity-20 text-primary-green rounded-full text-sm"
                        >
                          {color}
                          <button
                            type="button"
                            onClick={() => removeColor(index)}
                            className="ml-2 text-primary-green hover:text-green-700"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-dark mb-2">
                      Available Materials
                    </label>
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={newMaterial}
                        onChange={(e) => setNewMaterial(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addMaterial())}
                        placeholder="Add material (e.g., Oak, Pine)"
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-green"
                      />
                      <button
                        type="button"
                        onClick={addMaterial}
                        className="px-4 py-2 bg-gray-200 text-text-dark rounded-lg hover:bg-gray-300"
                      >
                        Add
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.availableMaterials.map((material, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                        >
                          {material}
                          <button
                            type="button"
                            onClick={() => removeMaterial(index)}
                            className="ml-2 text-blue-700 hover:text-blue-900"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Search Keywords */}
                  <div>
                    <label className="block text-sm font-medium text-text-dark mb-2">
                      Search Keywords <span className="text-gray-500 text-xs">(for AI matching)</span>
                    </label>
                    <p className="text-xs text-gray-600 mb-2">Add keywords that help users find this template (e.g., "wall decor", "art", "display", "shelf")</p>
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={newKeyword}
                        onChange={(e) => setNewKeyword(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addKeyword())}
                        placeholder="Add keyword (e.g., wall decor, art)"
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-green"
                      />
                      <button
                        type="button"
                        onClick={addKeyword}
                        className="px-4 py-2 bg-gray-200 text-text-dark rounded-lg hover:bg-gray-300"
                      >
                        Add
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.searchKeywords.map((keyword, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm"
                        >
                          {keyword}
                          <button
                            type="button"
                            onClick={() => removeKeyword(index)}
                            className="ml-2 text-purple-700 hover:text-purple-900"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Room Types */}
                  <div>
                    <label className="block text-sm font-medium text-text-dark mb-2">
                      Suitable Room Types <span className="text-gray-500 text-xs">(for AI matching)</span>
                    </label>
                    <p className="text-xs text-gray-600 mb-2">Specify which rooms this template is suitable for (e.g., "bedroom", "living room", "kitchen")</p>
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={newRoomType}
                        onChange={(e) => setNewRoomType(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addRoomType())}
                        placeholder="Add room type (e.g., bedroom, living room)"
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-green"
                      />
                      <button
                        type="button"
                        onClick={addRoomType}
                        className="px-4 py-2 bg-gray-200 text-text-dark rounded-lg hover:bg-gray-300"
                      >
                        Add
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.roomTypes.map((room, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm"
                        >
                          {room}
                          <button
                            type="button"
                            onClick={() => removeRoomType(index)}
                            className="ml-2 text-orange-700 hover:text-orange-900"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Use Cases */}
                  <div>
                    <label className="block text-sm font-medium text-text-dark mb-2">
                      Use Cases <span className="text-gray-500 text-xs">(for AI matching)</span>
                    </label>
                    <p className="text-xs text-gray-600 mb-2">Describe what this template is used for (e.g., "decoration", "storage", "display", "organization")</p>
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={newUseCase}
                        onChange={(e) => setNewUseCase(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addUseCase())}
                        placeholder="Add use case (e.g., decoration, storage)"
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-green"
                      />
                      <button
                        type="button"
                        onClick={addUseCase}
                        className="px-4 py-2 bg-gray-200 text-text-dark rounded-lg hover:bg-gray-300"
                      >
                        Add
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.useCases.map((useCase, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-3 py-1 bg-teal-100 text-teal-700 rounded-full text-sm"
                        >
                          {useCase}
                          <button
                            type="button"
                            onClick={() => removeUseCase(index)}
                            className="ml-2 text-teal-700 hover:text-teal-900"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-dark mb-2">
                      Images
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center mb-4">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const files = e.target.files;
                          if (files && files.length > 0) {
                            handleImageUpload(files);
                            // Reset input to allow uploading the same file again
                            e.target.value = '';
                          }
                        }}
                        className="hidden"
                        id="template-image-upload"
                        disabled={uploadingImage}
                        multiple
                      />
                      <label
                        htmlFor="template-image-upload"
                        className={`cursor-pointer flex flex-col items-center ${uploadingImage ? 'opacity-50' : ''}`}
                      >
                        <Upload className="w-8 h-8 text-gray-400 mb-2" />
                        <span className="text-sm text-gray-600">
                          {uploadingImage ? 'Uploading...' : 'Click to upload images or drag and drop'}
                        </span>
                        <span className="text-xs text-gray-500 mt-1">
                          PNG, JPG, GIF up to 10MB each. You can select multiple images.
                        </span>
                      </label>
                    </div>
                    {formData.images.length > 0 && (
                      <div className="grid grid-cols-3 gap-2">
                        {formData.images.map((url, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={url}
                              alt={`Template ${index + 1}`}
                              className="w-full h-24 object-cover rounded-lg"
                              onError={(e) => {
                                e.target.src = 'https://via.placeholder.com/150?text=Error';
                              }}
                            />
                            {/* Color Previews */}
                            {formData.availableColors.length > 0 && (
                              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                                <div className="flex space-x-1">
                                  {formData.availableColors.slice(0, 3).map((color, idx) => (
                                    <img
                                      key={idx}
                                      src={getColorPreviewUrl(url, color)}
                                      alt={color}
                                      className="w-8 h-8 rounded border border-white"
                                      title={color}
                                    />
                                  ))}
                                </div>
                              </div>
                            )}
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition"
                              title="Remove image"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end space-x-4 pt-4 border-t">
                    <button
                      type="button"
                      onClick={() => {
                        setShowForm(false);
                        setEditingTemplate(null);
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
                      {editingTemplate ? 'Update Template' : 'Create Template'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Templates List */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-background-light">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-text-dark">Image</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-text-dark">Name</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-text-dark">Room Category</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-text-dark">Price</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-text-dark">Difficulty</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-text-dark">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {templates.length > 0 ? (
                    templates.map((template) => (
                      <tr key={template.id} className="border-t">
                        <td className="px-6 py-4">
                          <img
                            src={template.images?.[0] || '/placeholder.jpg'}
                            alt={template.name}
                            className="w-16 h-16 object-cover rounded"
                            onError={(e) => {
                              e.target.src = 'https://via.placeholder.com/64?text=No+Image';
                            }}
                          />
                        </td>
                        <td className="px-6 py-4 text-sm font-semibold text-text-dark">
                          {template.name}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">{template.category}</td>
                        <td className="px-6 py-4 text-sm font-semibold text-text-dark">
                          ₦{template.basePrice?.toFixed(2) || '0.00'}
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                            {template.difficulty || 'N/A'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleEdit(template)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(template.id)}
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
                      <td colSpan="6" className="px-6 py-12 text-center text-gray-600">
                        No templates found. Click "Add New Template" to create one.
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

