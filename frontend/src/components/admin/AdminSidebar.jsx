import { Link, useLocation } from 'react-router-dom';
import { 
  BarChart3, 
  Package, 
  ShoppingCart, 
  ClipboardList, 
  Truck, 
  Bot, 
  Users, 
  Tag, 
  FileText, 
  Settings,
  LogOut,
  Grid,
  FolderTree,
  Mail
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function AdminSidebar() {
  const location = useLocation();
  const { userData, logout } = useAuth();

  const menuItems = [
    { id: 'dashboard', name: 'Dashboard', icon: BarChart3, path: '/admin' },
    {
      id: 'products',
      name: 'Products',
      icon: Package,
      children: [
        { id: 'templates', name: 'Templates', path: '/admin/templates' },
        { id: 'categories', name: 'Categories', path: '/admin/categories' },
      ],
    },
    { id: 'inventory', name: 'Inventory', icon: ShoppingCart, path: '/admin/inventory' },
    { id: 'orders', name: 'Orders', icon: ClipboardList, path: '/admin/orders' },
    { id: 'custom-requests', name: 'Custom Requests', icon: Mail, path: '/admin/custom-requests' },
    { id: 'delivery', name: 'Delivery & Assembly', icon: Truck, path: '/admin/delivery' },
    { id: 'ai-settings', name: 'AI Settings', icon: Bot, path: '/admin/ai-settings' },
    { id: 'ai-logs', name: 'AI Logs', icon: FileText, path: '/admin/ai-logs' },
    { id: 'customers', name: 'Customers', icon: Users, path: '/admin/customers' },
    { id: 'promotions', name: 'Promotions', icon: Tag, path: '/admin/promotions' },
    { id: 'analytics', name: 'Reports & Analytics', icon: BarChart3, path: '/admin/analytics' },
    { id: 'instructions', name: 'Instructions', icon: FileText, path: '/admin/instructions' },
    { id: 'settings', name: 'Settings', icon: Settings, path: '/admin/settings' },
  ];

  const isActive = (path) => {
    if (path === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen flex flex-col">
      <div className="p-6 border-b">
        <div className="flex items-center space-x-2 mb-4">
          <div className="w-8 h-8 bg-black rounded flex items-center justify-center">
            <div className="w-4 h-4 bg-white rounded"></div>
          </div>
          <span className="text-lg font-bold text-text-dark">Jeeda</span>
        </div>
        {userData && (
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary-green rounded-full flex items-center justify-center text-white font-semibold">
              {userData.name?.[0] || 'A'}
            </div>
            <div>
              <p className="font-semibold text-text-dark text-sm">{userData.name || 'Admin'}</p>
              <p className="text-xs text-gray-600">Super Admin</p>
            </div>
          </div>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto p-4">
        <div className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path || item.children?.[0]?.path || '');

            if (item.children) {
              return (
                <div key={item.id} className="mb-2">
                  <div className="flex items-center space-x-3 px-3 py-2 text-gray-600 text-sm font-semibold uppercase tracking-wider">
                    <Icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </div>
                  <div className="ml-4 mt-1 space-y-1">
                    {item.children.map((child) => {
                      const ChildIcon = child.icon || Grid;
                      const childActive = isActive(child.path);
                      return (
                        <Link
                          key={child.id}
                          to={child.path}
                          className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition ${
                            childActive
                              ? 'bg-primary-green bg-opacity-20 text-primary-green font-medium'
                              : 'text-text-dark hover:bg-gray-100'
                          }`}
                        >
                          <ChildIcon className="w-4 h-4" />
                          <span className="text-sm">{child.name}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              );
            }

            return (
              <Link
                key={item.id}
                to={item.path}
                className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition ${
                  active
                    ? 'bg-primary-green bg-opacity-20 text-primary-green font-medium'
                    : 'text-text-dark hover:bg-gray-100'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-sm">{item.name}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      <div className="p-4 border-t">
        <button
          onClick={logout}
          className="flex items-center space-x-3 px-3 py-2 rounded-lg text-text-dark hover:bg-gray-100 transition w-full"
        >
          <LogOut className="w-5 h-5" />
          <span className="text-sm">Logout</span>
        </button>
      </div>
    </aside>
  );
}

