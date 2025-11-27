import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/common/Header';
import AdminSidebar from '../../components/admin/AdminSidebar';
import { categoryService } from '../../services/categoryService';
import { useAuth } from '../../context/AuthContext';
import { doc, getDoc, setDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { Bot, Save, X, Plus } from 'lucide-react';

export default function AIManagementPage() {
  const { userData } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [config, setConfig] = useState({
    allowedCategories: [],
    allowedCustomizations: {
      colorChanges: true,
      materialChanges: true,
      dimensionChanges: true,
    },
    dimensionRanges: {
      minWidth: 0,
      maxWidth: 500,
      minHeight: 0,
      maxHeight: 300,
      minDepth: 0,
      maxDepth: 200,
    },
    prohibitedRequests: [],
    aiTone: 'friendly',
    responseStyle: 'helpful',
    keywordRedirects: [],
  });
  const [newProhibited, setNewProhibited] = useState('');
  const [newKeyword, setNewKeyword] = useState({ keyword: '', templateId: '' });

  useEffect(() => {
    if (userData?.role !== 'admin') {
      navigate('/');
      return;
    }
    fetchData();
  }, [userData]);

  const fetchData = async () => {
    try {
      const [categoriesData, configDoc] = await Promise.all([
        categoryService.getAll(),
        getDoc(doc(db, 'aiConfig', 'settings')),
      ]);
      
      setCategories(categoriesData);
      
      if (configDoc.exists()) {
        setConfig({ ...config, ...configDoc.data() });
      }
    } catch (error) {
      console.error('Error fetching AI config:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveConfig = async () => {
    try {
      await setDoc(doc(db, 'aiConfig', 'settings'), {
        ...config,
        updatedAt: new Date(),
      });
      alert('AI settings saved successfully!');
    } catch (error) {
      alert('Failed to save settings.');
    }
  };

  const toggleCategory = (categoryId) => {
    const allowed = config.allowedCategories || [];
    if (allowed.includes(categoryId)) {
      setConfig({
        ...config,
        allowedCategories: allowed.filter(id => id !== categoryId),
      });
    } else {
      setConfig({
        ...config,
        allowedCategories: [...allowed, categoryId],
      });
    }
  };

  const addProhibitedRequest = () => {
    if (newProhibited.trim()) {
      setConfig({
        ...config,
        prohibitedRequests: [...(config.prohibitedRequests || []), newProhibited.trim()],
      });
      setNewProhibited('');
    }
  };

  const removeProhibitedRequest = (index) => {
    const updated = [...(config.prohibitedRequests || [])];
    updated.splice(index, 1);
    setConfig({ ...config, prohibitedRequests: updated });
  };

  const addKeywordRedirect = () => {
    if (newKeyword.keyword.trim() && newKeyword.templateId.trim()) {
      setConfig({
        ...config,
        keywordRedirects: [...(config.keywordRedirects || []), { ...newKeyword }],
      });
      setNewKeyword({ keyword: '', templateId: '' });
    }
  };

  const removeKeywordRedirect = (index) => {
    const updated = [...(config.keywordRedirects || [])];
    updated.splice(index, 1);
    setConfig({ ...config, keywordRedirects: updated });
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
              <Bot className="w-8 h-8" />
              <span>AI Management</span>
            </h1>
            <button
              onClick={saveConfig}
              className="flex items-center space-x-2 px-4 py-2 bg-primary-green text-white rounded-lg hover:bg-green-600 transition"
            >
              <Save className="w-5 h-5" />
              <span>Save Settings</span>
            </button>
          </div>

          <div className="space-y-6">
            {/* Allowed Categories */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold text-text-dark mb-4">Allowed Categories</h2>
              <p className="text-sm text-gray-600 mb-4">Select which categories the AI can recommend to users</p>
              <div className="space-y-2">
                {categories.map((category) => (
                  <label key={category.id} className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={(config.allowedCategories || []).includes(category.id)}
                      onChange={() => toggleCategory(category.id)}
                      className="w-4 h-4 text-primary-green focus:ring-primary-green"
                    />
                    <span className="text-text-dark">{category.name}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Allowed Customizations */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold text-text-dark mb-4">Allowed Customizations</h2>
              <div className="space-y-3">
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={config.allowedCustomizations?.colorChanges}
                    onChange={(e) => setConfig({
                      ...config,
                      allowedCustomizations: {
                        ...config.allowedCustomizations,
                        colorChanges: e.target.checked,
                      },
                    })}
                    className="w-4 h-4 text-primary-green focus:ring-primary-green"
                  />
                  <span className="text-text-dark">Allow Color Changes</span>
                </label>
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={config.allowedCustomizations?.materialChanges}
                    onChange={(e) => setConfig({
                      ...config,
                      allowedCustomizations: {
                        ...config.allowedCustomizations,
                        materialChanges: e.target.checked,
                      },
                    })}
                    className="w-4 h-4 text-primary-green focus:ring-primary-green"
                  />
                  <span className="text-text-dark">Allow Material Changes</span>
                </label>
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={config.allowedCustomizations?.dimensionChanges}
                    onChange={(e) => setConfig({
                      ...config,
                      allowedCustomizations: {
                        ...config.allowedCustomizations,
                        dimensionChanges: e.target.checked,
                      },
                    })}
                    className="w-4 h-4 text-primary-green focus:ring-primary-green"
                  />
                  <span className="text-text-dark">Allow Dimension Changes</span>
                </label>
              </div>
            </div>

            {/* Dimension Ranges */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold text-text-dark mb-4">Dimension Ranges (cm)</h2>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-dark mb-2">Width</label>
                  <div className="flex space-x-2">
                    <input
                      type="number"
                      value={config.dimensionRanges?.minWidth || 0}
                      onChange={(e) => setConfig({
                        ...config,
                        dimensionRanges: {
                          ...config.dimensionRanges,
                          minWidth: parseInt(e.target.value) || 0,
                        },
                      })}
                      placeholder="Min"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                    <input
                      type="number"
                      value={config.dimensionRanges?.maxWidth || 500}
                      onChange={(e) => setConfig({
                        ...config,
                        dimensionRanges: {
                          ...config.dimensionRanges,
                          maxWidth: parseInt(e.target.value) || 500,
                        },
                      })}
                      placeholder="Max"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-dark mb-2">Height</label>
                  <div className="flex space-x-2">
                    <input
                      type="number"
                      value={config.dimensionRanges?.minHeight || 0}
                      onChange={(e) => setConfig({
                        ...config,
                        dimensionRanges: {
                          ...config.dimensionRanges,
                          minHeight: parseInt(e.target.value) || 0,
                        },
                      })}
                      placeholder="Min"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                    <input
                      type="number"
                      value={config.dimensionRanges?.maxHeight || 300}
                      onChange={(e) => setConfig({
                        ...config,
                        dimensionRanges: {
                          ...config.dimensionRanges,
                          maxHeight: parseInt(e.target.value) || 300,
                        },
                      })}
                      placeholder="Max"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-dark mb-2">Depth</label>
                  <div className="flex space-x-2">
                    <input
                      type="number"
                      value={config.dimensionRanges?.minDepth || 0}
                      onChange={(e) => setConfig({
                        ...config,
                        dimensionRanges: {
                          ...config.dimensionRanges,
                          minDepth: parseInt(e.target.value) || 0,
                        },
                      })}
                      placeholder="Min"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                    <input
                      type="number"
                      value={config.dimensionRanges?.maxDepth || 200}
                      onChange={(e) => setConfig({
                        ...config,
                        dimensionRanges: {
                          ...config.dimensionRanges,
                          maxDepth: parseInt(e.target.value) || 200,
                        },
                      })}
                      placeholder="Max"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Prohibited Requests */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold text-text-dark mb-4">Prohibited Requests</h2>
              <div className="flex space-x-2 mb-4">
                <input
                  type="text"
                  value={newProhibited}
                  onChange={(e) => setNewProhibited(e.target.value)}
                  placeholder="Add prohibited keyword/phrase"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-green"
                  onKeyPress={(e) => e.key === 'Enter' && addProhibitedRequest()}
                />
                <button
                  onClick={addProhibitedRequest}
                  className="px-4 py-2 bg-primary-green text-white rounded-lg hover:bg-green-600"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-2">
                {(config.prohibitedRequests || []).map((item, index) => (
                  <div key={index} className="flex items-center justify-between bg-background-light p-3 rounded-lg">
                    <span className="text-text-dark">{item}</span>
                    <button
                      onClick={() => removeProhibitedRequest(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Tone & Style */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold text-text-dark mb-4">AI Tone & Response Style</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-dark mb-2">AI Tone</label>
                  <select
                    value={config.aiTone || 'friendly'}
                    onChange={(e) => setConfig({ ...config, aiTone: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-green"
                  >
                    <option value="professional">Professional</option>
                    <option value="friendly">Friendly</option>
                    <option value="casual">Casual</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-dark mb-2">Response Style</label>
                  <select
                    value={config.responseStyle || 'helpful'}
                    onChange={(e) => setConfig({ ...config, responseStyle: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-green"
                  >
                    <option value="helpful">Helpful</option>
                    <option value="concise">Concise</option>
                    <option value="detailed">Detailed</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Keyword Redirects */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold text-text-dark mb-4">Keyword to Template Redirects</h2>
              <div className="flex space-x-2 mb-4">
                <input
                  type="text"
                  value={newKeyword.keyword}
                  onChange={(e) => setNewKeyword({ ...newKeyword, keyword: e.target.value })}
                  placeholder="Keyword"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-green"
                />
                <input
                  type="text"
                  value={newKeyword.templateId}
                  onChange={(e) => setNewKeyword({ ...newKeyword, templateId: e.target.value })}
                  placeholder="Template ID"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-green"
                />
                <button
                  onClick={addKeywordRedirect}
                  className="px-4 py-2 bg-primary-green text-white rounded-lg hover:bg-green-600"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-2">
                {(config.keywordRedirects || []).map((item, index) => (
                  <div key={index} className="flex items-center justify-between bg-background-light p-3 rounded-lg">
                    <span className="text-text-dark">
                      <strong>{item.keyword}</strong> → {item.templateId}
                    </span>
                    <button
                      onClick={() => removeKeywordRedirect(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

