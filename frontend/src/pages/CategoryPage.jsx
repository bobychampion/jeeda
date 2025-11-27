import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Header from '../components/common/Header';
import Sidebar from '../components/common/Sidebar';
import TemplateCard from '../components/cards/TemplateCard';
import { templatesService } from '../services/firestoreService';
import { categoryService } from '../services/categoryService';

export default function CategoryPage() {
  const { categoryId } = useParams();
  const [templates, setTemplates] = useState([]);
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    sortBy: 'popular',
    difficulty: '',
    priceRange: '',
    material: '',
  });

  useEffect(() => {
    fetchCategory();
    fetchTemplates();
  }, [categoryId, filters]);

  const fetchCategory = async () => {
    if (categoryId && categoryId !== 'all') {
      try {
        const cat = await categoryService.getById(categoryId);
        setCategory(cat);
      } catch (error) {
        console.error('Error fetching category:', error);
      }
    }
  };

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const filterParams = {};
      
      // Check if this is a room category or furniture category
      if (categoryId && categoryId !== 'all') {
        if (category?.type === 'room') {
          // Filter by room type
          filterParams.roomType = category.name.toLowerCase();
        } else {
          // Filter by furniture category
          filterParams.category = categoryId;
        }
      }
      
      if (filters.difficulty) filterParams.difficulty = filters.difficulty;
      if (filters.material) filterParams.material = filters.material;
      if (filters.priceRange) {
        const [min, max] = filters.priceRange.split('-');
        if (min) filterParams.minPrice = min === '0' ? 0 : parseFloat(min);
        if (max && max !== '+') filterParams.maxPrice = parseFloat(max);
      }
      
      let templates = await templatesService.getAll(filterParams);
      
      // Client-side sorting
      if (filters.sortBy === 'price-low') {
        templates.sort((a, b) => (a.basePrice || 0) - (b.basePrice || 0));
      } else if (filters.sortBy === 'price-high') {
        templates.sort((a, b) => (b.basePrice || 0) - (a.basePrice || 0));
      }
      
      setTemplates(templates);
    } catch (error) {
      console.error('Error fetching templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const categoryName = category?.name || (categoryId === 'all' || !categoryId 
    ? 'All Templates' 
    : categoryId.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '));

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="flex">
        <Sidebar type="category" />
        <main className="flex-1 p-8">
          <h1 className="text-3xl font-bold text-text-dark mb-2">{categoryName}</h1>
          <p className="text-gray-600 mb-6">Find the perfect DIY template for your living space.</p>

          {/* Filter Bar */}
          <div className="flex flex-wrap gap-4 mb-8">
            <select
              value={filters.sortBy}
              onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="popular">Sort by: Most Popular</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
            <select
              value={filters.difficulty}
              onChange={(e) => setFilters({ ...filters, difficulty: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="">Difficulty</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
            <select
              value={filters.priceRange}
              onChange={(e) => setFilters({ ...filters, priceRange: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="">Price Range</option>
              <option value="0-5000">₦0 - ₦5,000</option>
              <option value="5000-10000">₦5,000 - ₦10,000</option>
              <option value="10000-20000">₦10,000 - ₦20,000</option>
              <option value="20000+">₦20,000+</option>
            </select>
            <select
              value={filters.material}
              onChange={(e) => setFilters({ ...filters, material: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="">Materials</option>
              <option value="Oak">Oak</option>
              <option value="Pine">Pine</option>
              <option value="Walnut">Walnut</option>
              <option value="Birch">Birch</option>
            </select>
          </div>

          {/* Product Grid */}
          {loading ? (
            <div className="text-center py-12">Loading...</div>
          ) : templates.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {templates.map((template) => (
                <TemplateCard key={template.id} template={template} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-600">No templates found.</div>
          )}

          {/* Pagination */}
          <div className="flex justify-center items-center space-x-2 mt-12">
            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100">
              &lt;
            </button>
            <button className="px-4 py-2 bg-primary-green text-white rounded-lg">1</button>
            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100">
              2
            </button>
            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100">
              3
            </button>
            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100">
              &gt;
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}

