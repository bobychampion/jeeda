import { Link, useLocation } from 'react-router-dom';
import { Grid, Layout, BookOpen, Coffee, Monitor, Tv, LogOut, Package, Home, Bed, ChefHat, Briefcase, Baby, Droplet, Shirt, UtensilsCrossed, DoorOpen, TreePine, Wrench } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { categoryService } from '../../services/categoryService';
import { useState, useEffect } from 'react';

const categoryIcons = {
  'all': Grid,
  'living room': Home,
  'bedroom': Bed,
  'kitchen': ChefHat,
  'office': Briefcase,
  'kids room': Baby,
  'bathroom': Droplet,
  'laundry room': Shirt,
  'dining room': UtensilsCrossed,
  'entryway': DoorOpen,
  'outdoor': TreePine,
  'storage room': Wrench,
  'basement': Home,
};

export default function Sidebar({ type = 'category' }) {
  const location = useLocation();
  const { userData, logout } = useAuth();
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    if (type === 'category') {
      fetchCategories();
    }
  }, [type]);

  const fetchCategories = async () => {
    try {
      const roomCats = await categoryService.getRoomCategories();
      setCategories([
        { id: 'all', name: 'All Templates', icon: Grid },
        ...roomCats.map(cat => ({
          id: cat.id,
          name: cat.name,
          icon: categoryIcons[cat.name.toLowerCase()] || Grid,
        })),
      ]);
    } catch (error) {
      console.error('Error fetching categories:', error);
      // Fallback to default categories
      setCategories([
        { id: 'all', name: 'All Templates', icon: Grid },
        { id: 'living-room', name: 'Living Room', icon: Home },
        { id: 'bedroom', name: 'Bedroom', icon: Bed },
        { id: 'kitchen', name: 'Kitchen', icon: ChefHat },
        { id: 'office', name: 'Office', icon: Briefcase },
      ]);
    }
  };

  if (type === 'category') {

    return (
      <aside className="w-64 bg-background-light p-6 min-h-screen">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-text-dark mb-1">Categories</h2>
          <p className="text-sm text-gray-600">Refine your search</p>
        </div>
        <nav className="space-y-2">
          {categories.length > 0 ? (
            categories.map((category) => {
              const Icon = category.icon || Grid;
              const isActive = location.pathname.includes(category.id) || 
                             (category.id === 'all' && location.pathname === '/categories');
              return (
                <Link
                  key={category.id}
                  to={`/categories/${category.id}`}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition ${
                    isActive
                      ? 'bg-primary-green bg-opacity-20 text-primary-green'
                      : 'text-text-dark hover:bg-gray-200'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{category.name}</span>
                </Link>
              );
            })
          ) : (
            <div className="text-sm text-gray-500 px-4 py-2">Loading categories...</div>
          )}
        </nav>
      </aside>
    );
  }

  // Dashboard sidebar
  return (
    <aside className="w-64 bg-white border-r border-gray-200 p-6 min-h-screen">
      <div className="mb-6">
        <div className="flex items-center space-x-2 mb-4">
          <div className="w-8 h-8 bg-black rounded flex items-center justify-center">
            <div className="w-4 h-4 bg-white rounded"></div>
          </div>
          <span className="text-lg font-bold text-text-dark">Jeeda</span>
        </div>
        {userData && (
          <div className="flex items-center space-x-3 mb-4 pb-4 border-b">
            <div className="w-10 h-10 bg-primary-green rounded-full flex items-center justify-center text-white font-semibold">
              {userData.name?.[0] || 'U'}
            </div>
            <div>
              <p className="font-semibold text-text-dark">{userData.name || 'User'}</p>
              <p className="text-sm text-gray-600">{userData.email}</p>
            </div>
          </div>
        )}
      </div>
      <nav className="space-y-2">
        {userData?.role === 'admin' ? (
          <Link
            to="/admin"
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition ${
              location.pathname === '/admin'
                ? 'bg-blue-100 text-blue-700'
                : 'text-text-dark hover:bg-gray-100'
            }`}
          >
            <Grid className="w-5 h-5" />
            <span>Admin Dashboard</span>
          </Link>
        ) : (
          <Link
            to="/dashboard"
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition ${
              location.pathname === '/dashboard'
                ? 'bg-blue-100 text-blue-700'
                : 'text-text-dark hover:bg-gray-100'
            }`}
          >
            <Grid className="w-5 h-5" />
            <span>Dashboard</span>
          </Link>
        )}
        <Link
          to="/dashboard/profile"
          className="flex items-center space-x-3 px-4 py-3 rounded-lg text-text-dark hover:bg-gray-100 transition"
        >
          <Layout className="w-5 h-5" />
          <span>Profile</span>
        </Link>
        <Link
          to="/dashboard/help"
          className="flex items-center space-x-3 px-4 py-3 rounded-lg text-text-dark hover:bg-gray-100 transition"
        >
          <BookOpen className="w-5 h-5" />
          <span>Help</span>
        </Link>
        {userData?.role === 'admin' && (
          <Link
            to="/admin/templates"
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition ${
              location.pathname === '/admin/templates'
                ? 'bg-blue-100 text-blue-700'
                : 'text-text-dark hover:bg-gray-100'
            }`}
          >
            <Package className="w-5 h-5" />
            <span>Templates</span>
          </Link>
        )}
      </nav>
      <button
        onClick={logout}
        className="mt-8 flex items-center space-x-3 px-4 py-3 rounded-lg text-text-dark hover:bg-gray-100 transition w-full"
      >
        <LogOut className="w-5 h-5" />
        <span>Logout</span>
      </button>
    </aside>
  );
}

