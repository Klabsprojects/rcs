import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="bg-sky-50 border-b-2 border-sky-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo and Title Section */}
          <div className="flex items-center space-x-4">
            <img 
              src="images/logo.png" 
              alt="Prison Diet Management Logo" 
              className="h-12 w-12 object-contain"
            />
            <div>
              <h1 className="text-2xl font-semibold text-sky-900">
                RCS Demand Management System
              </h1>
              <p className="text-sm text-sky-700">
                Diet Planning and Management
              </p>
            </div>
          </div>

          {/* Navigation Menu */}
          <div className="flex items-center space-x-4">
            <Link 
              to="/dashboard" 
              className="text-sky-800 hover:text-sky-600 font-medium"
            >
              Dashboard
            </Link>
            
            {/* Hamburger Menu Dropdown */}
            <div className="relative">
              <button 
                onClick={toggleMenu}
                className="flex items-center justify-center text-sky-800 hover:text-sky-600 focus:outline-none"
              >
                <svg 
                  className="w-6 h-6" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth="2" 
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
              
              {/* Dropdown Menu */}
              {isMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 border border-gray-200">
                  <Link 
                    to="/create" 
                    className="block px-4 py-2 text-gray-800 hover:bg-sky-50"
                    onClick={toggleMenu}
                  >
                    User Segment
                  </Link>
                  <Link 
                    to="/indent" 
                    className="block px-4 py-2 text-gray-800 hover:bg-sky-50"
                    onClick={toggleMenu}
                  >
                    Indent
                  </Link>
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