import React, { useState, useEffect } from 'react';

const Header = () => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [userRole, setUserRole] = useState('');

  useEffect(() => {
    // Get user data from localStorage (matching your app's authentication pattern)
    const getUserData = () => {
      try {
        const userData = localStorage.getItem('user');
        const loginResponse = localStorage.getItem('loginResponse');

        // Try to get role from user data first
        if (userData) {
          const parsedUser = JSON.parse(userData);
          return parsedUser;
        }

        // Fallback to loginResponse if user data doesn't exist
        if (loginResponse) {
          const parsedResponse = JSON.parse(loginResponse);
          return parsedResponse;
        }

        return null;
      } catch (error) {
        console.error('Error parsing user data:', error);
        return null;
      }
    };

    const userData = getUserData();
    if (userData && userData.role) {
      setUserRole(userData.role);
    }
  }, []);

  const toggleProfile = () => {
    setIsProfileOpen(!isProfileOpen);
    setIsMobileMenuOpen(false); // Close mobile menu when profile opens
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    setIsProfileOpen(false); // Close profile when mobile menu opens
  };

  const handleLogout = () => {
    // Clear all authentication data
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    localStorage.removeItem('loginResponse');
    window.location.href = '/login';
    console.log('Logout functionality executed');
  };

  // Function to get navigation buttons based on role
  const getNavigationButtons = () => {
    const buttons = [];

    if (userRole === 'rcs-admin') {
      // For rcs-admin: show User and Indent Request
      buttons.push(
        <a
          key="user"
          href="/user-creation"
          className="flex items-center space-x-2 px-3 py-2 text-black hover:text-gray-700 hover:bg-sky-500 hover:bg-opacity-20 rounded-lg transition-all duration-200"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
          </svg>
          <span className="font-medium text-sm">User</span>
        </a>
      );

      buttons.push(
        <a
          key="indent-request"
          href="/indent-request"
          className="flex items-center space-x-2 px-3 py-2 text-black hover:text-gray-700 hover:bg-sky-500 hover:bg-opacity-20 rounded-lg transition-all duration-200"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <span className="font-medium text-sm">Indent</span>
        </a>
      );

    } else if (userRole === 'department') {
      // For department: show User, Masters, and Segment
      buttons.push(
        <a
          key="user"
          href="/user-creation"
          className="flex items-center space-x-2 px-3 py-2 text-black hover:text-gray-700 hover:bg-sky-500 hover:bg-opacity-20 rounded-lg transition-all duration-200"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
          </svg>
          <span className="font-medium text-sm">User</span>
        </a>
      );

      buttons.push(
        <a
          key="masters"
          href="/masters"
          className="flex items-center space-x-2 px-3 py-2 text-black hover:text-gray-700 hover:bg-sky-500 hover:bg-opacity-20 rounded-lg transition-all duration-200"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <span className="font-medium text-sm">Masters</span>
        </a>
      );

      buttons.push(
        <a
          key="segment"
          href="/create"
          className="flex items-center space-x-2 px-3 py-2 text-black hover:text-gray-700 hover:bg-sky-500 hover:bg-opacity-20 rounded-lg transition-all duration-200"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <span className="font-medium text-sm">Diet Plan</span>
        </a>
      );

    }

    // else if (userRole === 'indent') {
    //   // For indent: show Indent Raising and GRN
    //   buttons.push(
    //     <a
    //       key="indent-raising"
    //       href="/indent"
    //       className="flex items-center space-x-2 px-3 py-2 text-black hover:text-gray-700 hover:bg-sky-500 hover:bg-opacity-20 rounded-lg transition-all duration-200"
    //     >
    //       <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    //         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    //       </svg>
    //       <span className="font-medium text-sm">Indent Raising</span>
    //     </a>
    //   );

    //   buttons.push(
    //     <a
    //       key="grn"
    //       href="/grn"
    //       className="flex items-center space-x-2 px-3 py-2 text-black hover:text-gray-700 hover:bg-sky-500 hover:bg-opacity-20 rounded-lg transition-all duration-200"
    //     >
    //       <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    //         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
    //       </svg>
    //       <span className="font-medium text-sm">GRN</span>
    //     </a>
    //   );

    // } 
    else if (userRole === 'indent') {
      // For indent: show Indent Raising and Attendance
      buttons.push(
        <a
          key="indent-raising"
          href="/indent"
          className="flex items-center space-x-2 px-3 py-2 text-black hover:text-gray-700 hover:bg-sky-500 hover:bg-opacity-20 rounded-lg transition-all duration-200"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span className="font-medium text-sm">Indent Raising</span>
        </a>
      );

      buttons.push(
        <a
          key="attendance"
          href="/attendance"
          className="flex items-center space-x-2 px-3 py-2 text-black hover:text-gray-700 hover:bg-sky-500 hover:bg-opacity-20 rounded-lg transition-all duration-200"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3M3 11h18M5 19h14a2 2 0 002-2v-5H3v5a2 2 0 002 2z" />
          </svg>
          <span className="font-medium text-sm">Attendance</span>
        </a>
      );
    }


    else if (userRole === 'supply') {
      // For supply: show Indent Raising
      buttons.push(
        <a
          key="indent-raising"
          href="/indent-raising"
          className="flex items-center space-x-2 px-3 py-2 text-black hover:text-gray-700 hover:bg-sky-500 hover:bg-opacity-20 rounded-lg transition-all duration-200"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span className="font-medium text-sm">Indent Raising</span>
        </a>
      );

    } else if (userRole === 'payment') {
      // For payment: show Indent Ledger
      buttons.push(
        <a
          key="indent-ledger"
          href="/indent-ledger"
          className="flex items-center space-x-2 px-3 py-2 text-black hover:text-gray-700 hover:bg-sky-500 hover:bg-opacity-20 rounded-lg transition-all duration-200"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="font-medium text-sm">Indent Ledger</span>
        </a>
      );
    } else if (userRole === 'ind-apr') {
      // For ind-apr: show Indent List and GRN
      buttons.push(
        <a
          key="indent-list"
          href="/indent-approval"
          className="flex items-center space-x-2 px-3 py-2 text-black hover:text-gray-700 hover:bg-sky-500 hover:bg-opacity-20 rounded-lg transition-all duration-200"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span className="font-medium text-sm">Indent List</span>
        </a>
      );

      buttons.push(
        <a
          key="grn"
          href="/grn"
          className="flex items-center space-x-2 px-3 py-2 text-black hover:text-gray-700 hover:bg-sky-500 hover:bg-opacity-20 rounded-lg transition-all duration-200"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <span className="font-medium text-sm">GRN</span>
        </a>
      );

    } else {
      // For other roles: show default navigation
      buttons.push(
        <a
          key="segment"
          href="/create"
          className="flex items-center space-x-2 px-3 py-2 text-black hover:text-gray-700 hover:bg-sky-500 hover:bg-opacity-20 rounded-lg transition-all duration-200"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 515.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 919.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <span className="font-medium text-sm">Diet Plan</span>
        </a>
      );

      buttons.push(
        <a
          key="indent"
          href="/indent"
          className="flex items-center space-x-2 px-3 py-2 text-black hover:text-gray-700 hover:bg-sky-500 hover:bg-opacity-20 rounded-lg transition-all duration-200"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span className="font-medium text-sm">Indent</span>
        </a>
      );

      buttons.push(
        <a
          key="user"
          href="/user-creation"
          className="flex items-center space-x-2 px-3 py-2 text-black hover:text-gray-700 hover:bg-sky-500 hover:bg-opacity-20 rounded-lg transition-all duration-200"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
          </svg>
          <span className="font-medium text-sm">User</span>
        </a>
      );
    }

    return buttons;
  };

  return (
    <header className="bg-sky-400 border-b border-sky-300 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-4">

          {/* Logo and Title Section */}
          <div className="flex items-center space-x-3 sm:space-x-4 flex-1 min-w-0">
            {/* Government Logo - Left */}
            <div className="flex-shrink-0">
              <img
                src="images/logo.png"
                alt="Department Logo"
                className="h-10 w-10 sm:h-12 sm:w-12 lg:h-14 lg:w-14 object-contain rounded-md"
              />
            </div>

            {/* Title + Department Logo - Together */}
            <div className="flex items-center space-x-3 min-w-0 flex-1">
              <div className="min-w-0">
                <h1 className="text-sm sm:text-lg lg:text-xl xl:text-2xl font-bold text-white leading-tight">
                  கூட்டுறவுச் சங்கங்களின் பதிவாளர்
                </h1>
                <p className="text-xs sm:text-base lg:text-lg xl:text-xl text-white font-medium leading-tight">
                  REGISTRAR OF COOPERATIVE SOCIETIES
                </p>
              </div>

              {/* Department Logo - Right of Title */}
              <div className="flex-shrink-0">
                <img
                  src="images/newlogo.jpg"
                  alt="Government Logo"
                  className="h-10 w-10 sm:h-12 sm:w-12 lg:h-14 lg:w-14 object-contain rounded-md"
                />
              </div>
            </div>
          </div>




          {/* Right Section - Navigation Buttons and Profile */}
          <div className="flex items-center space-x-3 flex-shrink-0">

            {/* Navigation Buttons (Desktop) */}
            <div className="hidden md:flex items-center space-x-2">
              {getNavigationButtons()}
            </div>

            {/* Mobile Navigation Menu Button */}
            <div className="md:hidden">
              <button
                onClick={toggleMobileMenu}
                className="flex items-center justify-center w-9 h-9 bg-white bg-opacity-90 hover:bg-opacity-100 text-sky-600 hover:text-sky-700 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
                title="Menu"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>

              {/* Mobile Dropdown Menu */}
              {isMobileMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40 bg-black bg-opacity-25"
                    onClick={toggleMobileMenu}
                  ></div>

                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50">
                    {/* Mobile Navigation Items */}
                    <div className="px-2 space-y-1">
                      {getNavigationButtons().map((button) => (
                        <div key={button.key} className="block" onClick={toggleMobileMenu}>
                          {React.cloneElement(button, {
                            className: "flex items-center space-x-3 w-full px-4 py-3 text-gray-700 hover:bg-sky-50 hover:text-sky-700 transition-colors duration-200 rounded-lg"
                          })}
                        </div>
                      ))}
                    </div>

                    {/* Divider */}
                    <div className="border-t border-gray-200 my-2"></div>

                    {/* Logout Button for Mobile Menu */}
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center space-x-3 px-4 py-3 text-red-600 hover:bg-red-50 transition-colors duration-200"
                    >
                      <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      <span className="font-medium">Logout</span>
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Profile Icon with Dropdown (Desktop only) */}
            <div className="relative hidden md:block">
              <button
                onClick={toggleProfile}
                className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 bg-white bg-opacity-90 hover:bg-opacity-100 text-sky-600 hover:text-sky-700 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
                title="Profile"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </button>

              {/* Profile Dropdown (Desktop) */}
              {isProfileOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40 bg-black bg-opacity-25"
                    onClick={toggleProfile}
                  ></div>

                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 z-50">
                    <div className="px-4 py-3 text-sm text-gray-800 space-y-1">
                      <div className="font-semibold text-gray-900">
                        {JSON.parse(localStorage.getItem('user'))?.name || 'N/A'}
                      </div>
                      <div className="text-gray-700">
                        {JSON.parse(localStorage.getItem('user'))?.username || 'N/A'}
                      </div>
                    </div>

                    <div className="border-t border-gray-200"></div>

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center px-4 py-3 text-red-600 hover:bg-red-50 transition-colors duration-200 text-sm font-medium"
                    >
                      <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Logout
                    </button>
                  </div>
                </>
              )}




            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;