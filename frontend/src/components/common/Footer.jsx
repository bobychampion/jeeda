import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          {/* Logo and Copyright */}
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <div className="w-6 h-6 bg-black rounded flex items-center justify-center">
              <div className="w-3 h-3 bg-white rounded"></div>
            </div>
            <span className="text-sm text-text-dark">
              © 2024 Jeeda. All rights reserved.
            </span>
          </div>

          {/* Footer Links */}
          <nav className="flex space-x-6">
            <Link to="/about" className="text-sm text-text-dark hover:text-primary-green transition">
              About
            </Link>
            <Link to="/support" className="text-sm text-text-dark hover:text-primary-green transition">
              Support
            </Link>
            <Link to="/privacy" className="text-sm text-text-dark hover:text-primary-green transition">
              Privacy
            </Link>
            <Link to="/terms" className="text-sm text-text-dark hover:text-primary-green transition">
              Terms
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}

