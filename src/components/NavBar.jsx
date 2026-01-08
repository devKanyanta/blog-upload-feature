import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  PenSquare, 
  Home, 
  LogOut, 
  User, 
  Settings,
  LogIn,
  UserPlus,
  ChevronDown,
  Menu,
  X
} from 'lucide-react';
import { authApi } from '../api/authApi';
import toast from 'react-hot-toast';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isAuthenticated = !!localStorage.getItem('token');

  const handleLogout = () => {
    authApi.logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const navLinks = [
    { path: '/', icon: <Home className="h-4 w-4" />, label: 'Blogs' },
  ];

  // Add Create link only for authenticated users
  if (isAuthenticated && (user.role === 'admin' || user.role === 'editor' || user.role === 'author')) {
    navLinks.push({ 
      path: '/create', 
      icon: <PenSquare className="h-4 w-4" />, 
      label: 'Create' 
    });
  }

  const profileMenuItems = [
    { icon: <User className="h-4 w-4" />, label: 'Profile', onClick: () => {} },
    { icon: <Settings className="h-4 w-4" />, label: 'Settings', onClick: () => {} },
    { divider: true },
    { icon: <LogOut className="h-4 w-4" />, label: 'Logout', onClick: handleLogout, danger: true },
  ];

  const guestMenuItems = [
    { icon: <LogIn className="h-4 w-4" />, label: 'Login', onClick: () => navigate('/login') },
    { icon: <UserPlus className="h-4 w-4" />, label: 'Register', onClick: () => navigate('/register') },
  ];

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-lg hover:bg-gray-100 md:hidden"
            >
              {isMenuOpen ? (
                <X className="h-5 w-5 text-gray-600" />
              ) : (
                <Menu className="h-5 w-5 text-gray-600" />
              )}
            </button>
            
            <Link to="/" className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-lg bg-gray-900 flex items-center justify-center">
                <PenSquare className="h-4 w-4 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900 tracking-tight">BlogFlow</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  location.pathname === link.path
                    ? 'bg-gray-100 text-gray-900'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                {link.icon}
                <span className="font-medium">{link.label}</span>
              </Link>
            ))}
          </div>

          {/* User/Guest Section */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-gray-900 to-gray-700 flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {user.name?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  </div>
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-medium text-gray-900">{user.name || 'User'}</p>
                    <p className="text-xs text-gray-500 capitalize">{user.role || 'Author'}</p>
                  </div>
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                </button>

                {/* Profile Dropdown */}
                {isProfileOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setIsProfileOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl border border-gray-200 shadow-lg py-1 z-20">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900">{user.name || 'User'}</p>
                        <p className="text-xs text-gray-500">{user.email || 'user@example.com'}</p>
                      </div>
                      
                      {profileMenuItems.map((item, index) => (
                        item.divider ? (
                          <div key={index} className="border-t border-gray-100 my-1" />
                        ) : (
                          <button
                            key={index}
                            onClick={() => {
                              item.onClick();
                              setIsProfileOpen(false);
                            }}
                            className={`w-full flex items-center space-x-3 px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors ${
                              item.danger ? 'text-red-600' : 'text-gray-700'
                            }`}
                          >
                            {item.icon}
                            <span>{item.label}</span>
                          </button>
                        )
                      ))}
                    </div>
                  </>
                )}
              </div>
            ) : null}
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-3 border-t border-gray-200">
            <div className="space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    location.pathname === link.path
                      ? 'bg-gray-100 text-gray-900'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  {link.icon}
                  <span className="font-medium">{link.label}</span>
                </Link>
              ))}

              {/* Guest/Auth options for mobile */}
              <div className="pt-2 border-t border-gray-200">
                {isAuthenticated ? (
                  profileMenuItems.map((item, index) => (
                    item.divider ? null : (
                      <button
                        key={index}
                        onClick={() => {
                          item.onClick();
                          setIsMenuOpen(false);
                        }}
                        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors ${
                          item.danger ? 'text-red-600' : ''
                        }`}
                      >
                        {item.icon}
                        <span>{item.label}</span>
                      </button>
                    )
                  ))
                ) : null}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;