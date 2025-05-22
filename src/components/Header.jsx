import React, { useState, useEffect } from 'react';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Get user data from localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    localStorage.removeItem('loginResponse');
    window.location.href = '/';
  };

  return (
    <header className="bg-gradient-to-r from-white to-sky-50 border-b border-sky-100 shadow-lg backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          
          {/* Logo and Title Section */}
          <div className="flex items-center space-x-4">
            <img 
              src="images/logo.png"
              alt="RCS Logo"
              className="h-14 w-14 object-contain"
            />
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-sky-900 to-blue-800 bg-clip-text text-transparent">
                RCS Demand Management System
              </h1>
              <p className="text-sm text-sky-600 font-medium">
                Diet Planning and Management Portal
              </p>
            </div>
          </div>

          {/* Right Section - Welcome Message & Navigation */}
          <div className="flex items-center space-x-6">
            
            {/* Welcome Message */}
            {user && (
              <div className="hidden md:flex items-center space-x-3 bg-white rounded-xl px-4 py-2 shadow-md border border-sky-100">
                <div className="w-10 h-10 bg-gradient-to-br from-sky-400 to-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">
                    {user.name?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Welcome back,</p>
                  <p className="text-sm font-semibold text-sky-900">{user.name || 'User'}</p>
                </div>
              </div>
            )}

            {/* Dashboard Link */}
            <a
              href="/dashboard"
              className="hidden md:flex items-center space-x-2 px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-all duration-300 hover:shadow-lg font-medium"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6H8V5z" />
              </svg>
              <span>Dashboard</span>
            </a>

            {/* Menu Dropdown */}
            <div className="relative">
              <button
                onClick={toggleMenu}
                className="flex items-center justify-center w-10 h-10 bg-white border border-sky-200 text-sky-700 hover:text-sky-900 hover:bg-sky-50 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>

              {/* Enhanced Dropdown Menu */}
              {isMenuOpen && (
                <div className="absolute right-0 mt-3 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 backdrop-blur-sm">
                  
                  {/* Mobile Welcome Message */}
                  {user && (
                    <div className="md:hidden px-4 py-3 border-b border-gray-100">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-sky-400 to-blue-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-semibold text-xs">
                            {user.name?.charAt(0).toUpperCase() || 'U'}
                          </span>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Welcome back,</p>
                          <p className="text-sm font-semibold text-sky-900">{user.name || 'User'}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Mobile Dashboard Link */}
                  <a
                    href="/dashboard"
                    className="md:hidden flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-sky-50 hover:text-sky-900 transition-colors duration-200"
                    onClick={toggleMenu}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                    </svg>
                    <span className="font-medium">Dashboard</span>
                  </a>

                  {/* Menu Items */}
                  <a
                    href="/create"
                    className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-sky-50 hover:text-sky-900 transition-colors duration-200"
                    onClick={toggleMenu}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <span className="font-medium">User Segment</span>
                  </a>

                  <a
                    href="/indent"
                    className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-sky-50 hover:text-sky-900 transition-colors duration-200"
                    onClick={toggleMenu}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span className="font-medium">Indent</span>
                  </a>

                  <a
                    href="/user-creation"
                    className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-sky-50 hover:text-sky-900 transition-colors duration-200"
                    onClick={toggleMenu}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                    <span className="font-medium">User Creation</span>
                  </a>

                  {/* Divider */}
                  <div className="border-t border-gray-100 my-2"></div>

                  {/* Logout Button */}
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-3 px-4 py-3 text-red-600 hover:bg-red-50 transition-colors duration-200"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span className="font-medium">Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;