import React, { useState } from 'react';
import { X, Send } from 'lucide-react';

export default function RequestAdjustments({ originalModifications, onSubmit, onClose }) {
  const [formData, setFormData] = useState({
    color: '',
    material: '',
    style: '',
    size: '',
    description: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Build modifications object (only include non-empty fields)
    const modifications = {};
    if (formData.color) modifications.color = formData.color;
    if (formData.material) modifications.material = formData.material;
    if (formData.style && formData.style !== 'Keep Original Style') modifications.style = formData.style;
    if (formData.size) modifications.size = formData.size;
    if (formData.description) modifications.description = formData.description;

    if (Object.keys(modifications).length === 0 && !formData.description) {
      alert('Please specify at least one adjustment or provide a description.');
      return;
    }

    setLoading(true);
    try {
      await onSubmit({
        modifications,
        description: formData.description || Object.entries(modifications)
          .map(([key, value]) => `${key}: ${value}`)
          .join(', '),
      });
    } catch (error) {
      console.error('Error submitting adjustments:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Request Adjustments</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            disabled={loading}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {originalModifications && Object.keys(originalModifications).length > 0 && (
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Original Modifications:</p>
              <div className="space-y-1">
                {Object.entries(originalModifications).map(([key, value]) => {
                  if (!value || value === '') return null;
                  return (
                    <p key={key} className="text-sm text-gray-600">
                      <span className="capitalize">{key}:</span> {value}
                    </p>
                  );
                })}
              </div>
            </div>
          )}

          <p className="text-gray-600 text-sm">
            Please specify what adjustments you'd like to make to the samples. You can change colors, materials, styles, sizes, or provide additional instructions.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="color" className="block text-sm font-medium text-gray-700 mb-2">
                New Color
              </label>
              <input
                type="text"
                id="color"
                name="color"
                value={formData.color}
                onChange={handleChange}
                placeholder="e.g., Red, Blue, Oak"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-green"
              />
            </div>

            <div>
              <label htmlFor="material" className="block text-sm font-medium text-gray-700 mb-2">
                New Material
              </label>
              <input
                type="text"
                id="material"
                name="material"
                value={formData.material}
                onChange={handleChange}
                placeholder="e.g., Walnut Wood, Marble"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-green"
              />
            </div>

            <div>
              <label htmlFor="style" className="block text-sm font-medium text-gray-700 mb-2">
                Style Update
              </label>
              <select
                id="style"
                name="style"
                value={formData.style}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-green"
              >
                <option value="">Keep Original Style</option>
                <option value="Modern">Modern</option>
                <option value="Traditional">Traditional</option>
                <option value="Minimalist">Minimalist</option>
                <option value="Industrial">Industrial</option>
                <option value="Scandinavian">Scandinavian</option>
              </select>
            </div>

            <div>
              <label htmlFor="size" className="block text-sm font-medium text-gray-700 mb-2">
                Size Adjustment
              </label>
              <input
                type="text"
                id="size"
                name="size"
                value={formData.size}
                onChange={handleChange}
                placeholder="e.g., larger, smaller, compact"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-green"
              />
            </div>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Additional Instructions
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              placeholder="Describe any other adjustments you'd like (e.g., 'make the legs thicker', 'add a drawer', 'change the finish')"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-green"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-primary-green text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              {loading ? 'Submitting...' : 'Submit Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

