import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../services/api';

const UserManagement = () => {
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

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) newErrors.name = 'Department name is required';
    if (!formData.username.trim()) newErrors.username = 'Name is required';
    if (!formData.password.trim()) newErrors.password = 'Password is required';
    if (!formData.role.trim()) newErrors.role = 'Role is required';
    
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
      
      const response = await fetch(`${API_BASE_URL}/user`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
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

return (
    <div className="bg-gray-50 min-h-screen py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-sky-900">User Management</h1>
          
          {/* Create Button - Only show when form is not visible */}
          {!showForm && (
            <button
              onClick={handleCreateClick}
              className="px-6 py-3 bg-gradient-to-r from-sky-600 to-blue-600 text-white rounded-xl font-medium transition-all duration-300 hover:shadow-lg hover:scale-105 flex items-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span>Create User</span>
            </button>
          )}
        </div>

        {/* Success Message */}
        {submitSuccess && (
          <div className="mb-6 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">Success!</strong>
            <span className="block sm:inline"> User has been created successfully.</span>
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
                <path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"/>
              </svg>
            </button>
          </div>
        )}

        {/* Main Content - Dynamic Layout */}
        <div className={`grid grid-cols-1 transition-all duration-500 ease-in-out ${showForm ? 'lg:grid-cols-5' : 'lg:grid-cols-1'} gap-8`}>
          
          {/* Left Side - Departments List */}
          <div className={`transition-all duration-500 ease-in-out ${showForm ? 'lg:col-span-3' : 'lg:col-span-1'}`}>
            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-sky-800 mb-4">Departments</h2>
            </div>
            
            {loading ? (
              <div className="py-16 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading departments...</p>
              </div>
            ) : getDepartments().length > 0 ? (
              <div className="space-y-4">
                {getDepartments().map((department)  => (
                  <div
                    key={department.id}
                    onClick={() => handleDepartmentClick(department)}
                    className="bg-white hover:bg-sky-50 border border-gray-200 hover:border-sky-300 rounded-xl p-6 cursor-pointer transition-all duration-300 hover:shadow-lg"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0 h-12 w-12 bg-gradient-to-br from-sky-400 to-blue-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-semibold text-lg">
                            {department.name?.charAt(0)?.toUpperCase() || 'D'}
                          </span>
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900">{department.name}</h3>
                          <p className="text-sm text-gray-600">{department.userCount} users</p>
                        </div>
                      </div>
                      <div className="text-sky-600">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                        </svg>
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
                <h3 className="mt-2 text-sm font-medium text-gray-900">No departments found</h3>
              </div>
            )}
          </div>

          {/* Right Side - User Creation Form (Animated) */}
          <div className={`transition-all duration-500 ease-in-out transform ${
            showForm 
              ? 'lg:col-span-2 translate-x-0 opacity-100' 
              : 'lg:col-span-0 translate-x-full opacity-0 overflow-hidden w-0'
          } ${showForm ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white shadow-xl rounded-2xl overflow-hidden h-fit">
              <div className="px-6 py-4 bg-gradient-to-r from-sky-50 to-blue-50 border-b border-sky-100 flex justify-between items-center">
                <h2 className="text-xl font-semibold text-sky-800">Create New User</h2>
                <button
                  onClick={handleCancelForm}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
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
                        <h3 className="text-sm font-medium text-red-800">Error Creating User</h3>
                        <p className="mt-1 text-sm text-red-600">{errors.general}</p>
                      </div>
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Department Name */}
                  <div>
                    <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-3">
                      Department Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border-2 ${
                        errors.name ? 'border-red-500' : 'border-gray-200'
                      } rounded-xl focus:border-sky-500 focus:ring-4 focus:ring-sky-100 outline-none transition-all duration-300`}
                      placeholder="Enter department name"
                    />
                    {errors.name && (
                      <p className="mt-2 text-sm text-red-600">{errors.name}</p>
                    )}
                  </div>

                  {/* Name */}
                  <div>
                    <label htmlFor="username" className="block text-sm font-semibold text-gray-700 mb-3">
                      Name *
                    </label>
                    <input
                      type="text"
                      id="username"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border-2 ${
                        errors.username ? 'border-red-500' : 'border-gray-200'
                      } rounded-xl focus:border-sky-500 focus:ring-4 focus:ring-sky-100 outline-none transition-all duration-300`}
                      placeholder="Enter full name"
                    />
                    {errors.username && (
                      <p className="mt-2 text-sm text-red-600">{errors.username}</p>
                    )}
                  </div>

                  {/* Password */}
                  <div>
                    <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-3">
                      Password *
                    </label>
                    <input
                      type="password"
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border-2 ${
                        errors.password ? 'border-red-500' : 'border-gray-200'
                      } rounded-xl focus:border-sky-500 focus:ring-4 focus:ring-sky-100 outline-none transition-all duration-300`}
                      placeholder="Enter password"
                    />
                    {errors.password && (
                      <p className="mt-2 text-sm text-red-600">{errors.password}</p>
                    )}
                  </div>

                  {/* Role */}
                  <div>
                    <label htmlFor="role" className="block text-sm font-semibold text-gray-700 mb-3">
                      Role *
                    </label>
                    <input
                      type="text"
                      id="role"
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border-2 ${
                        errors.role ? 'border-red-500' : 'border-gray-200'
                      } rounded-xl focus:border-sky-500 focus:ring-4 focus:ring-sky-100 outline-none transition-all duration-300`}
                      placeholder="Enter role"
                    />
                    {errors.role && (
                      <p className="mt-2 text-sm text-red-600">{errors.role}</p>
                    )}
                  </div>

                  {/* Mobile */}
                  <div>
                    <label htmlFor="mobile" className="block text-sm font-semibold text-gray-700 mb-3">
                      Mobile Number *
                    </label>
                    <input
                      type="text"
                      id="mobile"
                      name="mobile"
                      value={formData.mobile}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border-2 ${
                        errors.mobile ? 'border-red-500' : 'border-gray-200'
                      } rounded-xl focus:border-sky-500 focus:ring-4 focus:ring-sky-100 outline-none transition-all duration-300`}
                      placeholder="Enter 10-digit mobile number"
                    />
                    {errors.mobile && (
                      <p className="mt-2 text-sm text-red-600">{errors.mobile}</p>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-end space-x-3 pt-6">
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
                      className="px-6 py-2.5 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-300 font-medium text-sm"
                    >
                      Clear Form
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className={`px-6 py-2.5 bg-gradient-to-r from-sky-600 to-blue-600 text-white rounded-lg font-medium transition-all duration-300 hover:shadow-lg hover:scale-105 disabled:opacity-70 disabled:hover:scale-100 disabled:cursor-not-allowed flex items-center space-x-2 text-sm`}
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
                          <span>Create User</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>

        {/* Modal for Department Users */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[80vh] overflow-hidden">
              {/* Modal Header */}
              <div className="px-6 py-4 bg-gradient-to-r from-sky-50 to-blue-50 border-b border-sky-100 flex justify-between items-center">
                <h2 className="text-xl font-semibold text-sky-800">
                  {selectedDepartment?.name} Department - Users ({departmentUsers.length})
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              {/* Modal Body */}
              <div className="p-6 overflow-y-auto max-h-[calc(80vh-120px)]">
                {departmentUsers.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            User Info
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Username
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Role
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Mobile
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {departmentUsers.map((user) => (
                          <tr key={user.id} className="hover:bg-gray-50 transition-colors duration-200">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-br from-sky-400 to-blue-500 rounded-full flex items-center justify-center">
                                  <span className="text-white font-semibold text-sm">
                                    {user.name?.charAt(0)?.toUpperCase() || 'U'}
                                  </span>
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">
                                    {user.name}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{user.username}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="inline-flex px-3 py-1 text-xs font-semibold rounded-full bg-sky-100 text-sky-800">
                                {user.role}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{user.mobile}</div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="py-16 text-center">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No users in this department</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Start by creating users for this department.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserManagement;