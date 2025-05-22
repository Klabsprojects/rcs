import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../services/api';

const UserCreation = () => {
  // State for form fields - updated to match API
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
  const [showForm, setShowForm] = useState(false);

  // State for form submission and validation
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Fetch users on component mount
  useEffect(() => {
    fetchUsers();
  }, []);

  // Fetch users from API
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
        console.error('Failed to fetch users:', result.message);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.username.trim()) newErrors.username = 'Username is required';
    if (!formData.password.trim()) newErrors.password = 'Password is required';
    if (!formData.role.trim()) newErrors.role = 'Role is required';

    
    if (!formData.mobile.trim()) {
      newErrors.mobile = 'Mobile number is required';
    } else if (!/^\d{10}$/.test(formData.mobile)) {
      newErrors.mobile = 'Mobile number must be 10 digits';
    }
    
    return newErrors;
  };

  // Handle form submission
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
        setShowForm(false);
        
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
        setErrors({ general: result.message || 'Failed to create user' });
      }
    } catch (error) {
      setErrors({ general: 'Network error. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="bg-gray-50 min-h-screen py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-sky-900">User Management</h1>
      
        </div>

        {/* Success Message */}
        {submitSuccess && (
          <div className="mb-6 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">Success!</strong>
            <span className="block sm:inline"> User has been created successfully.</span>
          </div>
        )}

        {/* Users List View */}
        {!showForm && (
          <div className="bg-white shadow-xl rounded-2xl overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-sky-50 to-blue-50 border-b border-sky-100 flex justify-between items-center">
          
              <button
                onClick={() => setShowForm(true)}
                className="bg-sky-600 hover:bg-sky-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300 hover:shadow-lg hover:scale-105 flex items-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span>Add New User</span>
              </button>
            </div>
            
            {loading ? (
              <div className="py-16 px-6 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading users...</p>
              </div>
            ) : users.length > 0 ? (
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
                    {users.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50 transition-colors duration-200">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-12 w-12 bg-gradient-to-br from-sky-400 to-blue-500 rounded-full flex items-center justify-center">
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
              <div className="py-16 px-6 text-center">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No users found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Start by creating your first user.
                </p>
              </div>
            )}
          </div>
        )}

        {/* User Creation Form */}
        {showForm && (
          <div className="bg-white shadow-xl rounded-2xl overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-sky-50 to-blue-50 border-b border-sky-100 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-sky-800">Create New User</h2>
              <button
                onClick={() => {
                  setShowForm(false);
                  setErrors({});
                  setFormData({
                    p_id: null,
                    name: '',
                    username: '',
                    password: '',
                    role: '',
                    mobile: '',
              
                    
                  });
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-8">
              {errors.general && (
                <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-600 text-sm">{errors.general}</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Name */}
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
                    placeholder="Enter full name"
                  />
                  {errors.name && (
                    <p className="mt-2 text-sm text-red-600">{errors.name}</p>
                  )}
                </div>

                {/* Username */}
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
                    placeholder="Enter username"
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
              </div>

              {/* Action Buttons */}
              <div className="mt-8 flex justify-end space-x-4">
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
                  className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-300 font-medium"
                >
                  Clear Form
                </button>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleSubmit}
                  className={`px-6 py-3 bg-gradient-to-r from-sky-600 to-blue-600 text-white rounded-xl font-medium transition-all duration-300 hover:shadow-lg hover:scale-105 disabled:opacity-70 disabled:hover:scale-100 disabled:cursor-not-allowed flex items-center space-x-2`}
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
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserCreation;