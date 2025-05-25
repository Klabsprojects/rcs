import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../services/api';

const groceryOptions = [
  "TOOR DAL", "BENGAL GRAM DAL", "URAD DAL", "MOONG DAL", "REFINED OIL",
  "TAMARIND", "CINNAMON", "CLOVES", "FENUGREEK", "MUSTARD", "PEPPERCORNS",
  "JEERA", "SOMPH", "CORAINDER POWDER", "TURMERIC POWDER", "SALT",
  "FRIED GRAM DAL", "RAVA", "ASAFOETIDA", "RED CHILLIES", "GARLIC", "DALDA",
  "WHEAT FLOUR", "SEMIYA", "PULSES", "SUKKU MALLI", "KARUPPU KATTY"
];

const DietPlanner = () => {
  const [userInfoList, setUserInfoList] = useState([]);
  const [selectedUserIndex, setSelectedUserIndex] = useState(null);
  const [expandedUserIndex, setExpandedUserIndex] = useState(null);
  const [formInputs, setFormInputs] = useState({ type: '', role: '', dietType: '' });
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [segments, setSegments] = useState([]);
  const [segmentsLoading, setSegmentsLoading] = useState(false);

  // Fetch segments on component mount using GET API
  useEffect(() => {
    fetchSegments();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormInputs({ ...formInputs, [name]: value });
  };

  // GET API call to fetch all segments
  const fetchSegments = async () => {
    try {
      setSegmentsLoading(true);
      setApiError('');
      
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        throw new Error('Authentication token not found. Please login again.');
      }

      const response = await fetch(`${API_BASE_URL}/segment`, {
        method: 'GET',
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Session expired. Please login again.');
        }
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.error === false) {
        setSegments(result.data || []);
        console.log('Segments fetched successfully:', result.data);
      } else {
        throw new Error(result.message || 'Failed to fetch segments');
      }
    } catch (error) {
      console.error('Error fetching segments:', error);
      setApiError(error.message);
    } finally {
      setSegmentsLoading(false);
    }
  };

  // POST API call to create/filter segment data
  const fetchSegmentData = async (category, role, diet) => {
    try {
      setLoading(true);
      setApiError('');
      
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        throw new Error('Authentication token not found. Please login again.');
      }

      const response = await fetch(`${API_BASE_URL}/segment`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          category: category,
          role: role,
          diet: diet
        })
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Session expired. Please login again.');
        }
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching segment data:', error);
      setApiError(error.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // NEW: POST API call to save diet plan to specific segment
  const savePlanToSegment = async (segmentId, planData) => {
    try {
      setLoading(true);
      setApiError('');
      
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        throw new Error('Authentication token not found. Please login again.');
      }

      const response = await fetch(`${API_BASE_URL}/segment/${segmentId}/plan`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(planData)
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Session expired. Please login again.');
        }
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      console.log('Plan saved successfully:', result);
      return result;
    } catch (error) {
      console.error('Error saving plan:', error);
      setApiError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleUserCreation = async () => {
    const { type, role, dietType } = formInputs;
    if (!type || !role || !dietType) {
      alert('Please fill all fields');
      return;
    }

    // Map dietType to API format
    const dietMapping = {
      'veg': 'Vegetarian',
      'non-veg': 'Non-Vegetarian'
    };

    const segmentData = await fetchSegmentData(type, role, dietMapping[dietType]);
    
    if (apiError || !segmentData) {
      alert(`Failed to fetch segment data: ${apiError || 'Unknown error'}`);
      return;
    }

    // Try to find segment ID from different possible locations in the response
    let segmentId = null;
    
    if (segmentData.data && Array.isArray(segmentData.data) && segmentData.data.length > 0) {
      // If data is an array, take the first segment's ID
      segmentId = segmentData.data[0].id;
    } else if (segmentData.data && segmentData.data.id) {
      // If data is an object with id
      segmentId = segmentData.data.id;
    } else if (segmentData.id) {
      // If id is directly in the response
      segmentId = segmentData.id;
    } else if (segmentData.user && segmentData.user.id) {
      // If the segment ID is in user.id (based on your response structure)
      segmentId = segmentData.user.id;
    }

    console.log('Segment data received:', segmentData);
    console.log('Extracted segment ID:', segmentId);

    const newUser = {
      ...formInputs,
      plans: [],
      segmentData: segmentData,
      segmentId: segmentId // Store segment ID for API calls
    };

    setUserInfoList([...userInfoList, newUser]);
    setFormInputs({ type: '', role: '', dietType: '' });
  };

  const handleSavePlan = async (plan) => {
    const user = userInfoList[selectedUserIndex];
    
    console.log('User data:', user);
    console.log('User segment ID:', user.segmentId);
    
    if (!user.segmentId) {
      alert('No segment ID found for this user. Please check the console for debug info and recreate the user.');
      console.error('User object:', user);
      console.error('Segment data:', user.segmentData);
      return;
    }

    // Transform plan data to match API format
    const planData = {
      name: `${plan.formType === 'per-day' ? 'Day' : plan.formType === 'per-week' ? 'Week' : 'Month'} Plan`,
      type: plan.formType === 'per-day' ? 'Day' : plan.formType === 'per-week' ? 'Week' : 'Month',
      items: plan.items.map(item => ({
        name: item.name,
        qty: parseInt(item.quantity) || 0,
        unit: item.unit === 'gram' ? 'Grams' : 
              item.unit === 'ml' ? 'Ml' : 
              item.unit === 'piece' ? 'Pcs' : 
              item.unit === 'kg' ? 'Kg' : 
              item.unit === 'L' ? 'L' : item.unit
      }))
    };

    // Add days if it's a weekly plan
    if (plan.formType === 'per-week' && plan.days) {
      planData.days = plan.days;
    }

    console.log('Plan data to be sent:', planData);
    console.log('Segment ID for API call:', user.segmentId);

    try {
      const result = await savePlanToSegment(user.segmentId, planData);
      
      // Update local state only if API call was successful
      const updatedList = [...userInfoList];
      updatedList[selectedUserIndex].plans.push({
        ...plan,
        userType: user.type,
        role: user.role,
        dietType: user.dietType,
        apiResponse: result // Store API response for reference
      });
      setUserInfoList(updatedList);
      
      alert('Plan saved successfully!');
    } catch (error) {
      alert(`Failed to save plan: ${error.message}`);
    }
  };

  const handleViewPlan = (userIndex) => {
    setExpandedUserIndex(expandedUserIndex === userIndex ? null : userIndex);
  };

  // Retry function for failed API calls
  const handleRetry = () => {
    setApiError('');
    fetchSegments();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Header with segments info */}
      <div className="mb-6 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Diet Planner</h1>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">
              Total Segments: {segmentsLoading ? 'Loading...' : segments.length}
            </span>
            {segmentsLoading && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            )}
          </div>
          {!segmentsLoading && (
            <button
              onClick={fetchSegments}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              Refresh Segments
            </button>
          )}
        </div>
      </div>

      {/* Form for creating users */}
      <div className="bg-sky-50 p-4 rounded shadow mb-6 flex gap-4 items-end">
        <div className="flex-1">
          <label className="block text-sm text-gray-700">User Type</label>
          <select
            name="type"
            value={formInputs.type}
            onChange={handleInputChange}
            className="w-full border px-3 py-2 rounded"
            disabled={loading}
          >
            <option value="">Select User Type</option>
            <option value="Class A Prisoner">Class A Prisoner</option>
            <option value="Class B Prisoner">Class B Prisoner</option>
          </select>
        </div>
        <div className="flex-1">
          <label className="block text-sm text-gray-700">Segment Role</label>
          <select
            name="role"
            value={formInputs.role}
            onChange={handleInputChange}
            className="w-full border px-3 py-2 rounded"
            disabled={loading}
          >
            <option value="">Select Segment Type</option>
            <option value="Labour">Labour</option>
            <option value="Non - Labour">Non - Labour</option>
          </select>
        </div>
        <div className="flex-1">
          <label className="block text-sm text-gray-700">Diet Type</label>
          <select
            name="dietType"
            value={formInputs.dietType}
            onChange={handleInputChange}
            className="w-full border px-3 py-2 rounded"
            disabled={loading}
          >
            <option value="">Select</option>
            <option value="veg">Vegetarian</option>
            <option value="non-veg">Non-Vegetarian</option>
          </select>
        </div>
        <button
          onClick={handleUserCreation}
          disabled={loading}
          className={`px-4 py-2 rounded text-white flex items-center space-x-2 ${
            loading 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-green-600 hover:bg-green-700'
          }`}
        >
          {loading && (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          )}
          <span>{loading ? 'Creating...' : 'Create'}</span>
        </button>
      </div>

      {/* Error Display */}
      {apiError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 flex items-center justify-between">
          <div>
            <strong>Error:</strong> {apiError}
          </div>
          <div className="flex space-x-2">
            <button
              onClick={handleRetry}
              className="text-sm bg-red-200 hover:bg-red-300 px-3 py-1 rounded"
            >
              Retry
            </button>
            <button
              onClick={() => setApiError('')}
              className="text-red-700 hover:text-red-900"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Segments Display */}
      {segments.length > 0 && (
        <div className="bg-white rounded shadow mb-6 p-4">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">Available Segments</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {segments.slice(0, 6).map((segment, index) => (
              <div key={segment.id || index} className="bg-gray-50 p-3 rounded border">
                <p className="text-sm font-medium text-gray-800">
                  {segment.clategory || 'N/A'} - {segment.role || 'N/A'}
                </p>
                <p className="text-xs text-gray-600">
                  Diet: {segment.diet || 'N/A'}
                </p>
                {segment.id && (
                  <p className="text-xs text-blue-600">ID: {segment.id}</p>
                )}
              </div>
            ))}
          </div>
          {segments.length > 6 && (
            <p className="text-sm text-gray-500 mt-2">
              And {segments.length - 6} more segments...
            </p>
          )}
        </div>
      )}

      {/* User List */}
      <div className="bg-white rounded shadow divide-y">
        {userInfoList.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No users created yet. Create a user to start planning diets.
          </div>
        ) : (
          userInfoList.map((user, index) => (
            <div key={index}>
              <div 
                className="p-4 hover:bg-gray-100 cursor-pointer flex justify-between"
                onClick={() => setSelectedUserIndex(index)}
              >
                <div>
                  <p className="font-semibold text-gray-800">{user.type} - {user.role} ({user.dietType})</p>
                  {user.segmentData && (
                    <p className="text-xs text-gray-500 mt-1">
                      API Data Loaded {user.segmentId && `(Segment ID: ${user.segmentId})`}
                    </p>
                  )}
                </div>
                <div className="flex items-center">
                  {user.plans.length > 0 ? (
                    <button
                      className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded hover:bg-blue-200"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewPlan(index);
                      }}
                    >
                      View Plan ({user.plans.length})
                    </button>
                  ) : (
                    <button
                      className="text-sm bg-green-100 text-green-700 px-3 py-1 rounded hover:bg-green-200"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedUserIndex(index);
                        setShowModal(true);
                      }}
                    >
                      Add Plan
                    </button>
                  )}
                </div>
              </div>
              
              {/* Expanded plan details */}
              {expandedUserIndex === index && user.plans.length > 0 && (
                <div className="bg-gray-50 p-4 border-t border-gray-200">
                  <PlanDetails plan={user.plans[0]} segmentData={user.segmentData} />
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Modal for creating diet plans */}
      {showModal && selectedUserIndex !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Create Diet Plan</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-800 text-xl"
              >
                ×
              </button>
            </div>
            <DietPlannerForm
              userInfo={userInfoList[selectedUserIndex]}
              onSavePlan={(plan) => {
                handleSavePlan(plan);
                setShowModal(false);
              }}
              loading={loading}
            />
          </div>
        </div>
      )}
    </div>
  );
};

const PlanDetails = ({ plan, segmentData }) => {
  return (
    <div>
      <div className="mb-3">
        <h3 className="font-semibold text-lg">{plan.userType} - {plan.role} ({plan.dietType})</h3>
        <p className="text-sm text-gray-700">Plan Frequency: {plan.formType}</p>
        {plan.days && plan.days.length > 0 && (
          <p className="text-sm text-gray-700">Days: {plan.days.join(', ')}</p>
        )}
        {plan.apiResponse && (
          <p className="text-xs text-green-600 mt-1">✓ Saved to server successfully</p>
        )}
      </div>
      
      <div className="mt-4">
        <h4 className="font-medium text-gray-800 mb-2">Items Required:</h4>
        <div className="overflow-hidden rounded border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {plan.items.map((item, i) => (
                <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                  <td className="px-4 py-3 text-sm text-gray-900">{item.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{item.quantity}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{item.unit}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const DietPlannerForm = ({ userInfo, onSavePlan, loading }) => {
  const [formType, setFormType] = useState('per-day');
  const [items, setItems] = useState([{ name: '', quantity: '', unit: 'gram' }]);
  const [days, setDays] = useState([]);

  const handleItemChange = (index, e) => {
    const { name, value } = e.target;
    const newItems = [...items];
    newItems[index][name] = value;
    setItems(newItems);
  };

  const addItem = () => setItems([...items, { name: '', quantity: '', unit: 'gram' }]);
  const removeItem = (index) => setItems(items.filter((_, i) => i !== index));

  const toggleDay = (day) => {
    setDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const handleSave = () => {
    if (items.some(item => !item.name || !item.quantity)) {
      alert('Please fill all item fields');
      return;
    }
    if (formType === 'per-week' && days.length === 0) {
      alert('Select at least one day');
      return;
    }
    
    // Validate quantities are numbers
    if (items.some(item => isNaN(parseInt(item.quantity)) || parseInt(item.quantity) <= 0)) {
      alert('Please enter valid quantities (numbers greater than 0)');
      return;
    }
    
    const plan = { formType, items, ...(formType === 'per-week' && { days }) };
    onSavePlan(plan);
    setItems([{ name: '', quantity: '', unit: 'gram' }]);
    setDays([]);
  };

  const allDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  return (
    <div>
      {/* Display user segment data in form */}
      {userInfo.segmentData && (
        <div className="mb-4 p-3 bg-green-50 rounded border border-green-200">
          <h4 className="font-medium text-green-800 mb-2">User Segment Data:</h4>
          <p className="text-sm text-green-700">
            {userInfo.type} - {userInfo.role} ({userInfo.dietType === 'veg' ? 'Vegetarian' : 'Non-Vegetarian'})
          </p>
          {userInfo.segmentId && (
            <p className="text-xs text-green-600 mt-1">Segment ID: {userInfo.segmentId}</p>
          )}
          {userInfo.segmentData.error === false && (
            <p className="text-xs text-green-600 mt-1">✓ Segment data loaded successfully</p>
          )}
        </div>
      )}

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Select Plan Type</label>
        <div className="flex gap-4">
          <label className="flex items-center gap-2">
            <input 
              type="radio" 
              value="per-day" 
              checked={formType === 'per-day'} 
              onChange={() => setFormType('per-day')}
              disabled={loading}
            /> 
            Per Day
          </label>
          <label className="flex items-center gap-2">
            <input 
              type="radio" 
              value="per-week" 
              checked={formType === 'per-week'} 
              onChange={() => setFormType('per-week')}
              disabled={loading}
            /> 
            Per Week
          </label>
          <label className="flex items-center gap-2">
            <input 
              type="radio" 
              value="per-month" 
              checked={formType === 'per-month'} 
              onChange={() => setFormType('per-month')}
              disabled={loading}
            /> 
            Per Month
          </label>
        </div>
      </div>

      {formType === 'per-week' && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Select Days</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {allDays.map((day) => (
              <label key={day} className="flex items-center">
                <input
                  type="checkbox"
                  checked={days.includes(day)}
                  onChange={() => toggleDay(day)}
                  className="mr-2"
                  disabled={loading}
                />
                {day}
              </label>
            ))}
          </div>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Items Required per Person</label>
        {items.map((item, index) => (
          <div key={index} className="flex gap-2 mb-2 text-sm">
            <select
              name="name"
              value={item.name}
              onChange={(e) => handleItemChange(index, e)}
              className="w-1/3 border px-2 py-1 rounded"
              disabled={loading}
            >
              <option value="">Select item</option>
              {groceryOptions.map((option, idx) => (
                <option key={idx} value={option}>{option}</option>
              ))}
            </select>
            <input
              type="number"
              name="quantity"
              value={item.quantity}
              onChange={(e) => handleItemChange(index, e)}
              placeholder="Qty"
              className="w-1/4 border px-2 py-1 rounded"
              min="1"
              disabled={loading}
            />
            <select
              name="unit"
              value={item.unit}
              onChange={(e) => handleItemChange(index, e)}
              className="w-1/4 border px-2 py-1 rounded"
              disabled={loading}
            >
              <option value="gram">Grams</option>
              <option value="ml">Ml</option>
              <option value="piece">Pcs</option>
              <option value="kg">Kg</option>
              <option value="L">L</option>
            </select>
            {index > 0 && (
              <button 
                onClick={() => removeItem(index)} 
                className="bg-red-500 text-white px-2 rounded hover:bg-red-600 disabled:opacity-50"
                disabled={loading}
              >
                ×
              </button>
            )}
          </div>
        ))}
        <button
          onClick={addItem}
          className="mt-2 bg-blue-500 text-white px-4 py-1 rounded hover:bg-blue-600 disabled:opacity-50"
          disabled={loading}
        >
          Add Item
        </button>
      </div>

      <div className="mt-6 flex justify-end space-x-3">
        <button
          onClick={() => {
            setItems([{ name: '', quantity: '', unit: 'gram' }]);
            setDays([]);
          }}
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 disabled:opacity-50"
          disabled={loading}
        >
          Reset
        </button>
        <button
          onClick={handleSave}
          className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 disabled:opacity-50 flex items-center space-x-2"
          disabled={loading}
        >
          {loading && (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          )}
          <span>{loading ? 'Saving...' : 'Create Plan'}</span>
        </button>
      </div>
    </div>
  );
};

export default DietPlanner;