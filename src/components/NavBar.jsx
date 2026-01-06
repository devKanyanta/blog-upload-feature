import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { PenSquare, Home } from 'lucide-react';

const Navbar = () => {
  const location = useLocation();

  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link to="/" className="flex items-center space-x-2">
              <PenSquare className="h-8 w-8 text-primary-600" />
              <span className="text-xl font-bold text-gray-900">Blog Admin</span>
            </Link>
            
            <div className="hidden md:flex space-x-6">
              <Link
                to="/"
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium ${
                  location.pathname === '/' 
                    ? 'bg-primary-100 text-primary-700' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Home className="h-4 w-4" />
                <span>Blogs</span>
              </Link>
            </div>
          </div>
          
          <Link
            to="/create"
            className="btn btn-primary flex items-center space-x-2"
          >
            <PenSquare className="h-4 w-4" />
            <span>Create New</span>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;