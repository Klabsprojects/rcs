import React, { useState } from 'react';

const UserCreation = () => {
  // State for form fields
  const [formData, setFormData] = useState({
    username: '',

    role: 'user',
    department: '',
    contactNumber: '',
    isActive: true
  });

  // State for created users
  const [users, setUsers] = useState([]);

  // State for form submission and validation
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.username.trim()) newErrors.username = 'Username is required';
    

    
    if (!formData.department.trim()) newErrors.department = 'Department is required';
    
    if (!formData.contactNumber.trim()) {
      newErrors.contactNumber = 'Contact number is required';
    } else if (!/^\d{10}$/.test(formData.contactNumber)) {
      newErrors.contactNumber = 'Contact number must be 10 digits';
    }
    
    return newErrors;
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }
    
    setIsSubmitting(true);
    setErrors({});
    
    // Simulate API call
    setTimeout(() => {
      const newUser = {
        ...formData,
        id: users.length + 1,
        createdAt: new Date().toISOString(),
      };
      
      setUsers([...users, newUser]);
      setIsSubmitting(false);
      setSubmitSuccess(true);
      
      // Reset form after successful submission
      setTimeout(() => {
        setFormData({
          username: '',
          
          role: 'user',
          department: '',
          contactNumber: '',
          isActive: true
        });
        setSubmitSuccess(false);
      }, 3000);
    }, 1000);
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

  // Get display name for department
  const getDepartmentName = (code) => {
    const departments = {
      'administration': 'Administration',
      'kitchen': 'Kitchen',
      'security': 'Security',
      'healthcare': 'Healthcare',
      'education': 'Education'
    };
    return departments[code] || code;
  };

  // Get display name for role
  const getRoleName = (code) => {
    const roles = {
      'admin': 'Administrator',
      'manager': 'Manager',
      'user': 'Regular User',
      'readonly': 'Read-only User'
    };
    return roles[code] || code;
  };

  return (
    <div className="bg-gray-50 min-h-screen py-6 px-4 sm:px-6 lg:px-8">
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-bold text-sky-900">User Management</h1>
   
      </div>

      {/* Success Message */}
      {submitSuccess && (
        <div className="max-w-7xl mx-auto mb-6 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Success!</strong>
          <span className="block sm:inline"> User has been created successfully.</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Side - User Creation Form */}
          <div className="w-full lg:w-1/3">
            <div className="bg-white shadow-md rounded-lg overflow-hidden">
              <div className="px-6 py-4 bg-sky-50 border-b border-sky-100">
                <h2 className="text-xl font-semibold text-sky-800">Create New User</h2>
              </div>
              
              <form onSubmit={handleSubmit} className="p-6">
                <div className="space-y-4">
                  {/* Username */}
                  <div>
                    <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                      Username *
                    </label>
                    <input
                      type="text"
                      id="username"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      className={`mt-1 block w-full rounded-md border ${
                        errors.username ? 'border-red-500' : 'border-gray-300'
                      } shadow-sm py-2 px-3 focus:outline-none focus:ring-sky-500 focus:border-sky-500`}
                    />
                    {errors.username && (
                      <p className="mt-1 text-sm text-red-600">{errors.username}</p>
                    )}
                  </div>


                  {/* Contact Number */}
                  <div>
                    <label htmlFor="contactNumber" className="block text-sm font-medium text-gray-700">
                      Contact Number *
                    </label>
                    <input
                      type="text"
                      id="contactNumber"
                      name="contactNumber"
                      value={formData.contactNumber}
                      onChange={handleChange}
                      className={`mt-1 block w-full rounded-md border ${
                        errors.contactNumber ? 'border-red-500' : 'border-gray-300'
                      } shadow-sm py-2 px-3 focus:outline-none focus:ring-sky-500 focus:border-sky-500`}
                      placeholder="10-digit number"
                    />
                    {errors.contactNumber && (
                      <p className="mt-1 text-sm text-red-600">{errors.contactNumber}</p>
                    )}
                  </div>

                  {/* Department */}
                  <div>
                    <label htmlFor="department" className="block text-sm font-medium text-gray-700">
                      Department *
                    </label>
                    <select
                      id="department"
                      name="department"
                      value={formData.department}
                      onChange={handleChange}
                      className={`mt-1 block w-full rounded-md border ${
                        errors.department ? 'border-red-500' : 'border-gray-300'
                      } shadow-sm py-2 px-3 focus:outline-none focus:ring-sky-500 focus:border-sky-500`}
                    >
                      <option value="">Select Department</option>
                      <option value="administration">Administration</option>
                      <option value="kitchen">Kitchen</option>
                      <option value="security">Security</option>
                      <option value="healthcare">Healthcare</option>
                      <option value="education">Education</option>
                    </select>
                    {errors.department && (
                      <p className="mt-1 text-sm text-red-600">{errors.department}</p>
                    )}
                  </div>

                  {/* User Role */}
                  <div>
                    <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                      User Role *
                    </label>
                    <select
                      id="role"
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 focus:outline-none focus:ring-sky-500 focus:border-sky-500"
                    >
                      <option value="admin">Administrator</option>
                      <option value="manager">Manager</option>
                      <option value="user">Regular User</option>
                      <option value="readonly">Read-only User</option>
                    </select>
                  </div>

        
                </div>

                {/* Action Buttons */}
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500"
                    onClick={() => {
                      setFormData({
                        username: '',
                        
                        role: 'user',
                        department: '',
                        contactNumber: '',
                        isActive: true
                      });
                      setErrors({});
                    }}
                  >
                    Clear
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white ${
                      isSubmitting ? 'bg-sky-400' : 'bg-sky-600 hover:bg-sky-700'
                    } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500`}
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </>
                    ) : (
                      'Create User'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
          
          {/* Right Side - Users Preview */}
          <div className="w-full lg:w-2/3">
            <div className="bg-white shadow-md rounded-lg overflow-hidden">
              <div className="px-6 py-4 bg-sky-50 border-b border-sky-100">
                <h2 className="text-xl font-semibold text-sky-800">Existing Users</h2>
              </div>
              
              <div className="overflow-x-auto">
              {users.length > 0 && (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Username
                      </th>
                   
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Role / Department
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Contact
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 bg-sky-100 rounded-full flex items-center justify-center">
                              <span className="text-sky-700 font-medium text-sm">
                                {user.username.substring(0, 2).toUpperCase()}
                              </span>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {user.username}
                              </div>
                            </div>
                          </div>
                        </td>
                      
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{getRoleName(user.role)}</div>
                          <div className="text-sm text-gray-500">{getDepartmentName(user.department)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{user.contactNumber}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(user.createdAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
              </div>
              
              {users.length === 0 && (
                <div className="py-16 px-6 text-center bg-gray-50">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No users</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Start by creating a new user with the form.
                  </p>
                </div>
              )}
              
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                <div className="text-sm text-gray-700">
                  Showing <span className="font-medium">{users.length}</span> users
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserCreation;