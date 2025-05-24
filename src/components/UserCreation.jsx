import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../services/api';

const UserManagement = () => {
  // Get current user role from localStorage
  const getCurrentUserRole = () => {
    const userInfo = localStorage.getItem('user');
    if (userInfo) {
      try {
        const parsed = JSON.parse(userInfo);
        return parsed.role || 'user';
      } catch (error) {
        console.error('Error parsing user info:', error);
      }
    }
    return 'user';
  };

  const [currentUserRole] = useState(getCurrentUserRole());

  // State for form fields
  const [formData, setFormData] = useState({
    p_id: null,
    name: '',
    username: '',
    password: '',
    role: '',
    mobile: '',
  });

  // State for users list
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [departmentUsers, setDepartmentUsers] = useState([]);

  // State for form submission and validation
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // State for form visibility
  const [showForm, setShowForm] = useState(false);

  const [showUserFormModal, setShowUserFormModal] = useState(false);
  const [selectedDepartmentName, setSelectedDepartmentName] = useState('');
  const [userForm, setUserForm] = useState({ username: '', password: '', mobile: '' });
  const [userFormErrors, setUserFormErrors] = useState({});

  // Get the appropriate role for creation based on current user role
const getTargetRole = () => {
  switch (currentUserRole) {
    case 'rcs-admin':
      return 'department';
    case 'department':
      return 'division';
    case 'division':
      return 'accounts';
    default:
      return 'accounts';
  }
};
  // Get appropriate labels based on current user role
  const getLabels = () => {
    switch (currentUserRole) {
      case 'rcs-admin':
        return {
          entityName: 'Department',
          entityNamePlural: 'Departments',
          createButtonText: 'Create Department',
          formTitle: 'Create New Department',
          successMessage: 'Department has been created successfully.',
          nameLabel: 'Department Name',
          namePlaceholder: 'Enter department name'
        };
      case 'department':
        return {
          entityName: 'Division',
          entityNamePlural: 'Divisions',
          createButtonText: 'Create Division',
          formTitle: 'Create New Division',
          successMessage: 'Division has been created successfully.',
          nameLabel: 'Division Name',
          namePlaceholder: 'Enter division name'
        };
      case 'division':
        return {
          entityName: 'User',
          entityNamePlural: 'Users',
          createButtonText: 'Create User',
          formTitle: 'Create New User',
          successMessage: 'User has been created successfully.',
          nameLabel: 'User Name',
          namePlaceholder: 'Enter user name'
        };
      default:
        return {
          entityName: 'User',
          entityNamePlural: 'Users',
          createButtonText: 'Create User',
          formTitle: 'Create New User',
          successMessage: 'User has been created successfully.',
          nameLabel: 'User Name',
          namePlaceholder: 'Enter user name'
        };
    }
  };

  const labels = getLabels();

  // Enhanced error parsing function
  const parseApiError = (errorResponse) => {
    try {
      // If it's already a string, return it
      if (typeof errorResponse === 'string') {
        return errorResponse;
      }

      // If it has a message property
      if (errorResponse.message) {
        // Handle database errors with specific codes
        if (typeof errorResponse.message === 'object') {
          const { code, errno, sqlMessage, sqlState } = errorResponse.message;

          // Handle specific database error codes
          switch (code) {
            case 'ER_DUP_ENTRY':
              // Extract field name from SQL message if available
              if (sqlMessage && sqlMessage.includes('email')) {
                return 'This email/username is already registered. Please use a different email.';
              } else if (sqlMessage && sqlMessage.includes('mobile')) {
                return 'This mobile number is already registered. Please use a different mobile number.';
              } else {
                return 'This record already exists. Please check your input and try again.';
              }

            case 'ER_NO_REFERENCED_ROW_2':
              return 'Invalid reference data. Please check your input values.';

            case 'ER_DATA_TOO_LONG':
              return 'One or more fields exceed the maximum allowed length.';

            case 'ER_BAD_NULL_ERROR':
              return 'Required field is missing. Please fill all mandatory fields.';

            case 'ER_TRUNCATED_WRONG_VALUE':
              return 'Invalid data format. Please check your input values.';

            default:
              // Return the SQL message if available, otherwise a generic message
              return sqlMessage || `Database error (${code}): Please contact support if this persists.`;
          }
        } else {
          // If message is a string
          return errorResponse.message;
        }
      }

      // Fallback for unknown error structure
      return 'An unexpected error occurred. Please try again.';
    } catch (parseError) {
      console.error('Error parsing API error:', parseError);
      return 'An unexpected error occurred. Please try again.';
    }
  };

  // Fetch users on component mount
  useEffect(() => {
    fetchUsers();
  }, []);

  // Fetch users from API with enhanced error handling
  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('authToken');

      const response = await fetch(`${API_BASE_URL}/user`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (result.error === false) {
        setUsers(result.data);
      } else {
        const errorMessage = parseApiError(result);
        console.error('Failed to fetch users:', errorMessage);
        // You could set an error state here to show to users if needed
        setErrors({ fetch: errorMessage });
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setErrors({ fetch: 'Network error while loading users. Please check your connection.' });
    } finally {
      setLoading(false);
    }
  };

  // Get departments from users data
  const getDepartments = () => {
    const departmentMap = {};

    users.forEach(user => {
      const deptName = user.name; // This is the department name based on your original code
      if (departmentMap[deptName]) {
        departmentMap[deptName].userCount++;
      } else {
        departmentMap[deptName] = {
          id: Object.keys(departmentMap).length + 1,
          name: deptName,
          userCount: 1
        };
      }
    });

    return Object.values(departmentMap);
  };

  // Handle department click
  const handleDepartmentClick = (department) => {
    const usersInDept = users.filter(user => user.name === department.name);
    setSelectedDepartment(department);
    setDepartmentUsers(usersInDept);
    setShowModal(true);
  };

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });

    // Clear specific field error when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  // Validate form based on current user role
  const validateForm = () => {
    const newErrors = {};


    if (!formData.username.trim()) newErrors.username = 'Username is required';
    if (!formData.password.trim()) newErrors.password = 'Password is required';

    if (!formData.mobile.trim()) {
      newErrors.mobile = 'Mobile number is required';
    } else if (!/^\d{10}$/.test(formData.mobile)) {
      newErrors.mobile = 'Mobile number must be 10 digits';
    }

    return newErrors;
  };

  // Handle form submission with enhanced error handling
const handleSubmit = async (e) => {
  e.preventDefault();

  const formErrors = validateForm();
  if (Object.keys(formErrors).length > 0) {
    setErrors(formErrors);
    return;
  }

  setIsSubmitting(true);
  setErrors({});

  try {
    const token = localStorage.getItem('authToken');

    // Set the role based on current user's role
    const targetRole = getTargetRole();

    // Get parent ID from localStorage when needed
    const getUserParentId = () => {
      if (currentUserRole === 'rcs-admin') {
        return null; // Admin creates departments, no parent needed
      }
      
      const userInfo = localStorage.getItem('user');
      if (userInfo) {
        try {
          const parsed = JSON.parse(userInfo);
          return parsed.id || null; // Return the current user's ID as parent ID
        } catch (error) {
          console.error('Error parsing user info for parent ID:', error);
        }
      }
      return null;
    };

    const submitData = {
      ...formData,
      name: formData.username, // Use username as the name
      role: targetRole,
      p_id: getUserParentId() // Add parent ID based on current user
    };

    // Debug logs
    console.log('Creating entity with data:', submitData);
    console.log('Current user role:', currentUserRole);
    console.log('Parent ID being sent:', submitData.p_id);

    const response = await fetch(`${API_BASE_URL}/user`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(submitData)
    });

    const result = await response.json();

    if (response.ok && result.error === false) {
      setSubmitSuccess(true);

      // Reset form
      setFormData({
        p_id: null,
        name: '',
        username: '',
        password: '',
        role: '',
        mobile: '',
      });

      // Refresh users list
      await fetchUsers();

      // Hide success message after 3 seconds
      setTimeout(() => {
        setSubmitSuccess(false);
      }, 3000);
    } else {
      // Enhanced error handling
      const errorMessage = parseApiError(result);
      setErrors({ general: errorMessage });
    }
  } catch (error) {
    console.error('Network error:', error);
    setErrors({ general: 'Network error. Please check your connection and try again.' });
  } finally {
    setIsSubmitting(false);
  }
};

  // Handle create button click
  const handleCreateClick = () => {
    setShowForm(true);
  };

  // Handle cancel form
  const handleCancelForm = () => {
    setShowForm(false);
    setFormData({
      p_id: null,
      name: '',
      username: '',
      password: '',
      role: '',
      mobile: '',
    });
    setErrors({});
  };

  // Handle user form submission for add user to department modal
const handleUserFormSubmit = async (e) => {
  e.preventDefault();
  const errors = {};
  if (!userForm.username.trim()) errors.username = 'Username is required';
  if (!userForm.password.trim()) errors.password = 'Password is required';
  if (!/^\d{10}$/.test(userForm.mobile)) errors.mobile = 'Valid 10-digit mobile number required';
  
  if (Object.keys(errors).length > 0) {
    setUserFormErrors(errors);
    return;
  }

  try {
    const token = localStorage.getItem('authToken');
    
    // Determine the role for the new user being added
    let newUserRole = 'user';
    if (currentUserRole === 'department') {
      newUserRole = 'division';
    } else if (currentUserRole === 'division') {
      newUserRole = 'user';
    }

    // Get parent ID for the modal form submission
    const getModalUserParentId = () => {
      const userInfo = localStorage.getItem('user');
      if (userInfo) {
        try {
          const parsed = JSON.parse(userInfo);
          return parsed.id || null; // Current user's ID becomes parent ID
        } catch (error) {
          console.error('Error parsing user info for parent ID:', error);
        }
      }
      return null;
    };

    const submitData = {
      p_id: getModalUserParentId(), // Set parent ID
      name: selectedDepartmentName,
      username: userForm.username,
      password: userForm.password,
      role: newUserRole,
      mobile: userForm.mobile,
    };

    // Debug logs
    console.log('Creating user/division with data:', submitData);
    console.log('Current user role:', currentUserRole);
    console.log('Parent ID being sent:', submitData.p_id);

    const response = await fetch(`${API_BASE_URL}/user`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(submitData)
    });

    const result = await response.json();

    if (response.ok && result.error === false) {
      // Success - refresh users and close modal
      await fetchUsers();
      setShowUserFormModal(false);
      setUserForm({ username: '', password: '', mobile: '' });
      setUserFormErrors({});
      
      // Show success message
      setSubmitSuccess(true);
      setTimeout(() => {
        setSubmitSuccess(false);
      }, 3000);
    } else {
      const errorMessage = parseApiError(result);
      setUserFormErrors({ general: errorMessage });
    }
  } catch (error) {
    console.error('Network error:', error);
    setUserFormErrors({ general: 'Network error. Please check your connection and try again.' });
  }
};

  return (
    <div className="bg-gray-50 min-h-screen py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{labels.entityNamePlural} Management</h1>
            <p className="text-gray-600 mt-1">Manage {labels.entityNamePlural.toLowerCase()} and their users</p>
          </div>
        </div>

        {/* Success Message */}
        {submitSuccess && (
          <div className="mb-6 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">Success!</strong>
            <span className="block sm:inline"> {labels.successMessage}</span>
          </div>
        )}

        {/* Global Error Message for Fetch Issues */}
        {errors.fetch && (
          <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">Error!</strong>
            <span className="block sm:inline"> {errors.fetch}</span>
            <button
              onClick={() => setErrors({ ...errors, fetch: '' })}
              className="absolute top-0 bottom-0 right-0 px-4 py-3"
            >
              <svg className="fill-current h-6 w-6 text-red-500" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <title>Close</title>
                <path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z" />
              </svg>
            </button>
          </div>
        )}

        {/* Main Content - Dynamic Layout */}
        <div className={`grid grid-cols-1 transition-all duration-500 ease-in-out ${showForm ? 'xl:grid-cols-5 lg:grid-cols-1' : 'lg:grid-cols-1'} gap-8`}>

          {/* Left Side - Departments List */}
          <div className={`transition-all duration-500 ease-in-out ${showForm ? 'xl:col-span-3 lg:col-span-1' : 'lg:col-span-1'}`}>
            <div className="mb-6 flex justify-between items-center">
              <h2 className="text-2xl font-semibold text-sky-800">{labels.entityNamePlural}</h2>
              {!showForm && (
                <button
                  onClick={handleCreateClick}
                  className="px-4 py-2.5 bg-gradient-to-r from-sky-600 to-blue-600 text-white rounded-xl font-medium transition-all duration-300 hover:shadow-lg hover:scale-105 flex items-center space-x-2 text-sm"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span>{labels.createButtonText}</span>
                </button>
              )}
            </div>

            {loading ? (
              <div className="py-16 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading {labels.entityNamePlural.toLowerCase()}...</p>
              </div>
            ) : getDepartments().length > 0 ? (
              <div className="space-y-4">
                {getDepartments().map((department) => (
                  <div
                    key={department.id}
                    className="bg-white hover:bg-sky-50 border border-gray-200 hover:border-sky-300 rounded-xl p-6 transition-all duration-300 hover:shadow-lg"
                  >
                    <div className="flex items-center justify-between w-full">
                      {/* Left: Icon + Department Name */}
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0 h-12 w-12 bg-gradient-to-br from-sky-400 to-blue-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-semibold text-sm">
                            {(() => {
                              const words = department.name?.trim().split(' ') || [];

                              if (words.length === 1) {
                                const name = words[0];
                                return (name.charAt(0) + name.charAt(name.length - 1)).toUpperCase();
                              } else if (words.length >= 2) {
                                return words
                                  .slice(0, 2)
                                  .map(word => word.charAt(0).toUpperCase())
                                  .join('');
                              } else {
                                return 'DE';
                              }
                            })()}
                          </span>
                        </div>

                        <h3 className="text-xl font-semibold text-gray-900">{department.name}</h3>
                      </div>

                      {/* Right: Clickable user count + static add icon */}
                      <div className="flex items-center space-x-4">
                        <button
                          onClick={() => handleDepartmentClick(department)}
                          className="text-sm text-gray-600 hover:underline focus:outline-none"
                        >
                          {department.userCount} {currentUserRole === 'rcs-admin' ? 'Departments' : currentUserRole === 'department' ? 'Divisions' : 'Users'}
                        </button>
                        {(currentUserRole === 'department' || currentUserRole === 'division') && (
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedDepartmentName(department.name);
                              setShowUserFormModal(true);
                              setUserForm({ username: '', password: '', mobile: '' });
                              setUserFormErrors({});
                            }}
                            className="text-sky-600 hover:text-blue-800 transition-colors"
                          >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-16 text-center">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No {labels.entityNamePlural.toLowerCase()} found</h3>
              </div>
            )}
          </div>

          {/* Right Side - User Creation Form (Animated) */}
          <div className={`transition-all duration-500 ease-in-out transform ${showForm
            ? 'xl:col-span-2 lg:col-span-1 translate-x-0 opacity-100 mt-8 xl:mt-0'
            : 'xl:col-span-0 lg:col-span-0 translate-x-full opacity-0 overflow-hidden w-0'
            } ${showForm ? 'block' : 'hidden xl:block'}`}>
            <div className="bg-white shadow-xl rounded-2xl overflow-hidden h-fit">
              <div className="px-6 py-4 bg-gradient-to-r from-sky-50 to-blue-50 border-b border-sky-100 flex justify-between items-center">
                <h2 className="text-lg sm:text-xl font-semibold text-sky-800">{labels.formTitle}</h2>
                <button
                  onClick={handleCancelForm}
                  className="text-gray-500 hover:text-gray-700 transition-colors p-1"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="p-6">
                {errors.general && (
                  <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-red-800">Error Creating {labels.entityName}</h3>
                        <p className="mt-1 text-sm text-red-600">{errors.general}</p>
                      </div>
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
     

                  {/* Username */}
                  <div>
                    <label htmlFor="username" className="block text-sm font-semibold text-gray-700 mb-2 sm:mb-3">
                      Username *
                    </label>
                    <input
                      type="text"
                      id="username"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      className={`w-full px-3 sm:px-4 py-2 sm:py-3 border-2 ${errors.username ? 'border-red-500' : 'border-gray-200'
                        } rounded-xl focus:border-sky-500 focus:ring-4 focus:ring-sky-100 outline-none transition-all duration-300 text-sm sm:text-base`}
                      placeholder="Enter username"
                    />
                    {errors.username && (
                      <p className="mt-2 text-sm text-red-600">{errors.username}</p>
                    )}
                  </div>

                  {/* Password */}
                  <div>
                    <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2 sm:mb-3">
                      Password *
                    </label>
                    <input
                      type="password"
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className={`w-full px-3 sm:px-4 py-2 sm:py-3 border-2 ${errors.password ? 'border-red-500' : 'border-gray-200'
                        } rounded-xl focus:border-sky-500 focus:ring-4 focus:ring-sky-100 outline-none transition-all duration-300 text-sm sm:text-base`}
                      placeholder="Enter password"
                    />
                    {errors.password && (
                      <p className="mt-2 text-sm text-red-600">{errors.password}</p>
                    )}
                  </div>

                  {/* Mobile */}
                  <div>
                    <label htmlFor="mobile" className="block text-sm font-semibold text-gray-700 mb-2 sm:mb-3">
                      Mobile Number *
                    </label>
                    <input
                      type="text"
                      id="mobile"
                      name="mobile"
                      value={formData.mobile}
                      onChange={handleChange}
                      className={`w-full px-3 sm:px-4 py-2 sm:py-3 border-2 ${errors.mobile ? 'border-red-500' : 'border-gray-200'
                        } rounded-xl focus:border-sky-500 focus:ring-4 focus:ring-sky-100 outline-none transition-all duration-300 text-sm sm:text-base`}
                      placeholder="Enter 10-digit mobile number"
                    />
                    {errors.mobile && (
                      <p className="mt-2 text-sm text-red-600">{errors.mobile}</p>
                    )}
                  </div>
                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3 pt-4 sm:pt-6">
                    <button
                      type="button"
                      onClick={() => {
                        setFormData({
                          p_id: null,
                          name: '',
                          username: '',
                          password: '',
                          role: '',
                          mobile: '',
                        });
                        setErrors({});
                      }}
                      className="w-full sm:w-auto px-4 sm:px-6 py-2.5 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-300 font-medium text-sm"
                    >
                      Clear Form
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className={`w-full sm:w-auto px-4 sm:px-6 py-2.5 bg-gradient-to-r from-sky-600 to-blue-600 text-white rounded-lg font-medium transition-all duration-300 hover:shadow-lg hover:scale-105 disabled:opacity-70 disabled:hover:scale-100 disabled:cursor-not-allowed flex items-center justify-center space-x-2 text-sm`}
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Creating...</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                          <span>{labels.createButtonText}</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>

        {/* User Details Modal */}
        {showModal && selectedDepartment && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
              <div className="px-6 py-4 bg-gradient-to-r from-sky-50 to-blue-50 border-b border-sky-100 flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-semibold text-sky-800">{selectedDepartment.name}</h2>
                  <p className="text-sm text-gray-600 mt-1">{departmentUsers.length} {currentUserRole === 'rcs-admin' ? 'Departments' : currentUserRole === 'department' ? 'Divisions' : 'Users'}</p>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-500 hover:text-gray-700 transition-colors p-1"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                {departmentUsers.length > 0 ? (
                  <div className="space-y-4">
                    {departmentUsers.map((user, index) => (
                      <div key={user.id || index} className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-sky-400 to-blue-500 rounded-full flex items-center justify-center">
                              <span className="text-white font-medium text-sm">
                                {user.username ? user.username.charAt(0).toUpperCase() : 'U'}
                              </span>
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900">{user.username}</h4>
                              <p className="text-sm text-gray-600">{user.role}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-600">{user.mobile}</p>
                            <p className="text-xs text-gray-500">Mobile</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No users found</h3>
                    <p className="mt-1 text-sm text-gray-500">This {labels.entityName.toLowerCase()} doesn't have any users yet.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Add User to Department Modal */}
        {showUserFormModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
              <div className="px-6 py-4 bg-gradient-to-r from-sky-50 to-blue-50 border-b border-sky-100 flex justify-between items-center">
                <h2 className="text-xl font-semibold text-sky-800">
                  Add {currentUserRole === 'department' ? 'Division' : ''} to {selectedDepartmentName}
                </h2>
                <button
                  onClick={() => {
                    setShowUserFormModal(false);
                    setUserForm({ username: '', password: '', mobile: '' });
                    setUserFormErrors({});
                  }}
                  className="text-gray-500 hover:text-gray-700 transition-colors p-1"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="p-6">
                {userFormErrors.general && (
                  <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-sm text-red-600">{userFormErrors.general}</p>
                  </div>
                )}

                <form onSubmit={handleUserFormSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="userUsername" className="block text-sm font-medium text-gray-700 mb-2">
                      Username *
                    </label>
                    <input
                      type="text"
                      id="userUsername"
                      value={userForm.username}
                      onChange={(e) => {
                        setUserForm({ ...userForm, username: e.target.value });
                        if (userFormErrors.username) {
                          setUserFormErrors({ ...userFormErrors, username: '' });
                        }
                      }}
                      className={`w-full px-3 py-2 border-2 ${
                        userFormErrors.username ? 'border-red-500' : 'border-gray-200'
                      } rounded-lg focus:border-sky-500 focus:ring-4 focus:ring-sky-100 outline-none transition-all`}
                      placeholder="Enter username"
                    />
                    {userFormErrors.username && (
                      <p className="mt-1 text-sm text-red-600">{userFormErrors.username}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="userPassword" className="block text-sm font-medium text-gray-700 mb-2">
                      Password *
                    </label>
                    <input
                      type="password"
                      id="userPassword"
                      value={userForm.password}
                      onChange={(e) => {
                        setUserForm({ ...userForm, password: e.target.value });
                        if (userFormErrors.password) {
                          setUserFormErrors({ ...userFormErrors, password: '' });
                        }
                      }}
                      className={`w-full px-3 py-2 border-2 ${
                        userFormErrors.password ? 'border-red-500' : 'border-gray-200'
                      } rounded-lg focus:border-sky-500 focus:ring-4 focus:ring-sky-100 outline-none transition-all`}
                      placeholder="Enter password"
                    />
                    {userFormErrors.password && (
                      <p className="mt-1 text-sm text-red-600">{userFormErrors.password}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="userMobile" className="block text-sm font-medium text-gray-700 mb-2">
                      Mobile Number *
                    </label>
                    <input
                      type="text"
                      id="userMobile"
                      value={userForm.mobile}
                      onChange={(e) => {
                        setUserForm({ ...userForm, mobile: e.target.value });
                        if (userFormErrors.mobile) {
                          setUserFormErrors({ ...userFormErrors, mobile: '' });
                        }
                      }}
                      className={`w-full px-3 py-2 border-2 ${
                        userFormErrors.mobile ? 'border-red-500' : 'border-gray-200'
                      } rounded-lg focus:border-sky-500 focus:ring-4 focus:ring-sky-100 outline-none transition-all`}
                      placeholder="Enter 10-digit mobile number"
                    />
                    {userFormErrors.mobile && (
                      <p className="mt-1 text-sm text-red-600">{userFormErrors.mobile}</p>
                    )}
                  </div>

                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowUserFormModal(false);
                        setUserForm({ username: '', password: '', mobile: '' });
                        setUserFormErrors({});
                      }}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-gradient-to-r from-sky-600 to-blue-600 text-white rounded-lg hover:shadow-lg transition-all"
                    >
                      Add {currentUserRole === 'department' ? 'Division' : 'User'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserManagement;