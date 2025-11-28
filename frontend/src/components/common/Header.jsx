import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Heart, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Header() {
  const { currentUser, logout, userData } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-black rounded flex items-center justify-center">
              <div className="w-4 h-4 bg-white rounded"></div>
            </div>
            <span className="text-xl font-bold text-text-dark">Jeeda</span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/categories" className="text-text-dark hover:text-primary-green transition">
              Categories
            </Link>
            <Link to="/ai-assistant" className="text-text-dark hover:text-primary-green transition">
              AI Chat
            </Link>
            <Link to="/how-it-works" className="text-text-dark hover:text-primary-green transition">
              How it Works
            </Link>
          </nav>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            {currentUser ? (
              <>
                <Link to="/wishlist" className="p-2 text-text-dark hover:text-primary-green">
                  <Heart className="w-5 h-5" />
                </Link>
                <Link to="/cart" className="relative p-2 text-text-dark hover:text-primary-green">
                  <ShoppingBag className="w-5 h-5" />
                  <span className="absolute top-0 right-0 w-4 h-4 bg-primary-green text-white text-xs rounded-full flex items-center justify-center">
                    0
                  </span>
                </Link>
                <Link to="/dashboard" className="p-2 text-text-dark hover:text-primary-green">
                  <User className="w-5 h-5" />
                </Link>
                {userData?.role === 'admin' && (
                  <Link
                    to="/admin"
                    className="px-3 py-2 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition"
                  >
                    Admin
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 text-text-dark hover:text-primary-green"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 text-text-dark hover:text-primary-green transition"
                >
                  Log In
                </Link>
                <Link
                  to="/signup"
                  className="px-4 py-2 bg-primary-green text-white rounded-lg hover:bg-green-600 transition"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

