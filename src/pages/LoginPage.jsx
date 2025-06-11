import { useState } from 'react';
import { API_BASE_URL } from '../services/api';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Add keydown handler for Enter key
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSubmit(e);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.username || !formData.password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('loginResponse', JSON.stringify(data));
        
        const role = data.user?.role?.toLowerCase?.();

        // Route based on user role
        if (role === 'ind-apr') {
          window.location.replace('/indent-approval');
        } else if (['indent', 'supply', 'pay-cre', 'pay-ver', 'pay-apr'].includes(role)) {
          window.location.replace('/indent');
        } else {
          window.location.replace('/user-creation');
        }

      } else {
        setError(data.message || 'Login failed');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-5xl px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          
          {/* Form Section */}
          <div className="w-full max-w-md mx-auto lg:mx-0">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
              <div className="text-center mb-8">
                <div className="flex justify-center mb-6">
                  <img 
                    src="images/logo.png" 
                    alt="Logo" 
                    className="h-12 w-auto"
                  />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Welcome Back
                </h1>
                <p className="text-gray-500">
                  Sign in to continue to your account
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Username
                  </label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    placeholder="Enter your username"
                    className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl text-sm bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all duration-300"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Password
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    placeholder="Enter your password"
                    className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl text-sm bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all duration-300"
                    required
                  />
                </div>

                {error && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm text-center font-medium">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold transition-all duration-300 hover:from-blue-700 hover:to-blue-800 hover:shadow-lg hover:scale-105 disabled:opacity-70 disabled:hover:scale-100 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Signing in...
                    </div>
                  ) : (
                    'Sign In'
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Image Section */}
          <div className="hidden lg:block w-full">
            <div className="relative w-full">
              <img 
                src="/images/login.png"
                alt="Login illustration"
                className="w-full h-96 object-cover rounded-2xl shadow-2xl"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-2xl"></div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default LoginPage;