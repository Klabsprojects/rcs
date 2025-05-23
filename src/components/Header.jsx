import React, { useState } from 'react';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogout = () => {
    // Note: localStorage not available in Claude.ai artifacts
    // In a real environment, uncomment these lines:
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    localStorage.removeItem('loginResponse');
    window.location.href = '/';
    console.log('Logout functionality would execute here');
  };

  return (
    <header className="border-b border-gray-300 shadow-lg backdrop-blur-sm" style={{ backgroundColor: '#1686b8' }}>
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
              <h1 className="text-2xl font-bold text-black">
                RCS Demand Management System
              </h1>
              <p className="text-sm text-black font-medium">
                Diet Planning and Management Portal
              </p>
            </div>
          </div>

          {/* Right Section - Home Icon & Menu */}
          <div className="flex items-center space-x-6">
            
            {/* Home Icon */}
            <a
              href="/"
              className="flex items-center justify-center w-10 h-10 bg-white border border-gray-300 text-black hover:text-gray-800 hover:bg-gray-50 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </a>

            {/* Menu Dropdown */}
            <div className="relative">
              <button
                onClick={toggleMenu}
                className="flex items-center justify-center w-10 h-10 bg-white border border-gray-300 text-black hover:text-gray-800 hover:bg-gray-50 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>

              {/* Dropdown Menu */}
              {isMenuOpen && (
                <div className="absolute right-0 mt-3 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 backdrop-blur-sm">
                  
                  {/* Menu Items */}
                  <a
                    href="/create"
                    className="flex items-center space-x-3 px-4 py-3 text-black hover:bg-gray-50 hover:text-gray-800 transition-colors duration-200"
                    onClick={toggleMenu}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <span className="font-medium">User Segment</span>
                  </a>

                  <a
                    href="/indent"
                    className="flex items-center space-x-3 px-4 py-3 text-black hover:bg-gray-50 hover:text-gray-800 transition-colors duration-200"
                    onClick={toggleMenu}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span className="font-medium">Indent</span>
                  </a>

                  <a
                    href="/user-creation"
                    className="flex items-center space-x-3 px-4 py-3 text-black hover:bg-gray-50 hover:text-gray-800 transition-colors duration-200"
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