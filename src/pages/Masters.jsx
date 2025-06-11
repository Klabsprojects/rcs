import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../services/api';

const MastersPage = () => {
  const [activeTab, setActiveTab] = useState('eater-type');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
const [editingInventory, setEditingInventory] = useState(false);
  // Eater Type State
  const [eaterTypes, setEaterTypes] = useState([]);
  const [newEaterType, setNewEaterType] = useState({ 
    name: '', 
    hasSub: false, 
    sub: [] 
  });
  const [subTypeName, setSubTypeName] = useState('');

  // Inventory Master State
  const [inventoryMaster, setInventoryMaster] = useState({
    stock: '',
    order: '',
    id: null
  });

  // Fetch data when component mounts or tab changes
  useEffect(() => {
    if (activeTab === 'eater-type') {
      fetchEaterTypes();
    } else if (activeTab === 'inventory-master') {
      fetchInventoryMaster();
    }
  }, [activeTab]);

  // Fetch Eater Types
  const fetchEaterTypes = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/master/eater-type`, {
        headers: {
          'Authorization': localStorage.getItem('authToken')
        }
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('Eater Types Response:', result);
        
        if (result.error === false && Array.isArray(result.data)) {
          setEaterTypes(result.data);
        } else {
          console.warn('Unexpected data format:', result);
          setEaterTypes([]);
        }
      } else {
    
      }
    } catch (err) {
      console.error('Error fetching eater types:', err);
      setError('Network error while fetching eater types');
      setEaterTypes([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch Inventory Master
  const fetchInventoryMaster = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/master/inventory`, {
        headers: {
          'Authorization': localStorage.getItem('authToken')
        }
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('Inventory Master Response:', result);
        
        if (result.error === false && Array.isArray(result.data) && result.data.length > 0) {
          const inventoryData = result.data[0]; // Get first item from array
          setInventoryMaster({
            stock: inventoryData.stock || '',
            order: inventoryData.order || '',
            id: inventoryData.id || null
          });
        }
      } else {
   
      }
    } catch (err) {
      console.error('Error fetching inventory master:', err);
      setError('Network error while fetching inventory master');
    } finally {
      setLoading(false);
    }
  };

  // Add Eater Type
  const handleAddEaterType = async (e) => {
    e.preventDefault();
    if (!newEaterType.name.trim()) {
      setError('Please enter eater type name');
      return;
    }

    // If hasSub is true but no sub items, show error
    if (newEaterType.hasSub && newEaterType.sub.length === 0) {
      setError('Please add at least one sub type');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const payload = {
        name: newEaterType.name
      };

      // Only add sub array if hasSub is true and there are sub items
      if (newEaterType.hasSub && newEaterType.sub.length > 0) {
        payload.sub = newEaterType.sub;
      }

      const response = await fetch(`${API_BASE_URL}/master/eater-type`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': localStorage.getItem('authToken')
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (response.ok && result.error === false) {
        setSuccess('Eater type added successfully!');
        setNewEaterType({ name: '', hasSub: false, sub: [] });
        setSubTypeName('');
        fetchEaterTypes();
      } else {
        setError(result.message || 'Failed to add eater type');
      }
    } catch (err) {
      setError('Network error while adding eater type');
    } finally {
      setLoading(false);
    }
  };

  // Update Inventory Master
const handleUpdateInventoryMaster = async (e) => {
  e.preventDefault();
  
if (!inventoryMaster.stock || !inventoryMaster.order) {
  setError('Please fill in all fields');
  return;
}

if (isNaN(Number(inventoryMaster.stock)) || isNaN(Number(inventoryMaster.order))) {
  setError('Please enter valid numbers');
  return;
}

  if (!inventoryMaster.id) {
    setError('Inventory ID not found. Please refresh and try again.');
    return;
  }

  try {
    setLoading(true);
    setError('');
    
    const payload = {
      stock: parseInt(inventoryMaster.stock),
      order: parseInt(inventoryMaster.order)
    };

    const response = await fetch(`${API_BASE_URL}/master/inventory/${inventoryMaster.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': localStorage.getItem('authToken')
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();

    if (response.ok && result.error === false) {
      setSuccess('Inventory master updated successfully!');
      setEditingInventory(false); // Exit edit mode
      fetchInventoryMaster(); // Refresh the data
    } else {
      setError(result.message || 'Failed to update inventory master');
    }
  } catch (err) {
    setError('Network error while updating inventory master');
  } finally {
    setLoading(false);
  }
};

  const addSubType = () => {
    if (!subTypeName.trim()) {
      setError('Please enter sub type name');
      return;
    }
    
    if (newEaterType.sub.includes(subTypeName.trim())) {
      setError('Sub type already exists');
      return;
    }

    setNewEaterType(prev => ({
      ...prev,
      sub: [...prev.sub, subTypeName.trim()]
    }));
    setSubTypeName('');
    setError('');
  };

  const removeSubType = (index) => {
    setNewEaterType(prev => ({
      ...prev,
      sub: prev.sub.filter((_, i) => i !== index)
    }));
  };

  // Clear messages
  const clearMessages = () => {
    setError('');
    setSuccess('');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => {
                  setActiveTab('eater-type');
                  clearMessages();
                }}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'eater-type'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Eater Types
              </button>
              <button
                onClick={() => {
                  setActiveTab('inventory-master');
                  clearMessages();
                }}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'inventory-master'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Inventory Master
              </button>
            </nav>
          </div>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-600 text-sm">
            {success}
          </div>
        )}

        {/* Eater Types Tab Content */}
        {activeTab === 'eater-type' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* List - LEFT SIDE */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Existing Eater Types
              </h2>
              
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  <span className="ml-2 text-gray-600">Loading...</span>
                </div>
              ) : (
                <div className="space-y-3">
                  {eaterTypes.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m13-8L9 9l4 4" />
                      </svg>
                      <p>No eater types found</p>
                      <p className="text-sm">Add your first eater type using the form</p>
                    </div>
                  ) : (
                    eaterTypes.map((item, index) => (
                      <div key={item.id || item._id || index} className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                        <div className="flex items-center mb-2">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                            <span className="text-blue-600 font-semibold text-sm">
                              {(index + 1).toString().padStart(2, '0')}
                            </span>
                          </div>
                          <span className="text-gray-900 font-medium">{item.name}</span>
                        </div>
                        
                        {/* Display sub types if they exist */}
                        {item.sub && item.sub.length > 0 && (
                          <div className="ml-11">
                            <p className="text-xs text-gray-600 mb-1">Sub Types:</p>
                            <div className="flex flex-wrap gap-1">
                              {item.sub.map((subType, subIndex) => (
                                <span key={subIndex} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                                  {subType}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Add Form - RIGHT SIDE */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Add New Eater Type
              </h2>
              
              <form onSubmit={handleAddEaterType}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Eater Type Name
                  </label>
                  <input
                    type="text"
                    value={newEaterType.name}
                    onChange={(e) => {
                      setNewEaterType(prev => ({ ...prev, name: e.target.value }));
                      clearMessages();
                    }}
                    placeholder="Enter eater type name"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                    required
                  />
                </div>

                {/* Has Sub Types Checkbox */}
                <div className="mb-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={newEaterType.hasSub}
                      onChange={(e) => {
                        setNewEaterType(prev => ({ 
                          ...prev, 
                          hasSub: e.target.checked,
                          sub: e.target.checked ? prev.sub : []
                        }));
                        if (!e.target.checked) {
                          setSubTypeName('');
                        }
                        clearMessages();
                      }}
                      className="mr-2"
                    />
                    <span className="text-sm font-medium text-gray-700">Has Sub Types</span>
                  </label>
                </div>

                {/* Sub Types Section */}
                {newEaterType.hasSub && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sub Types
                    </label>
                    
                    {/* Add Sub Type Input */}
                    <div className="flex gap-2 mb-3">
                      <input
                        type="text"
                        value={subTypeName}
                        onChange={(e) => {
                          setSubTypeName(e.target.value);
                          clearMessages();
                        }}
                        placeholder="Enter sub type name"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addSubType();
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={addSubType}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        Add
                      </button>
                    </div>

                    {/* Display Sub Types */}
                    {newEaterType.sub.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-sm text-gray-600">Added Sub Types:</p>
                        {newEaterType.sub.map((subType, index) => (
                          <div key={index} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-lg">
                            <span className="text-sm">{subType}</span>
                            <button
                              type="button"
                              onClick={() => removeSubType(index)}
                              className="text-red-600 hover:text-red-800 text-sm"
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:ring-4 focus:ring-blue-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Adding...
                    </div>
                  ) : (
                    'Add Eater Type'
                  )}
                </button>
              </form>
            </div>
          </div>
        )}


{/* Inventory Master Tab Content */}
{activeTab === 'inventory-master' && (
  <div className="max-w-2xl mx-auto">
    
    {/* Single Inventory Master Card */}
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">
        Inventory Master Settings
      </h2>
      
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="ml-2 text-gray-600">Loading...</span>
        </div>
      ) : (
        <div className="space-y-3">
          {inventoryMaster.id ? (
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-semibold text-sm">01</span>
                </div>
                <button
                  onClick={() => setEditingInventory(!editingInventory)}
                  className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                >
                  {editingInventory ? 'Cancel' : 'Edit'}
                </button>
              </div>
              
              <div className="space-y-4">
                {/* Stock Buffer */}
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm font-medium">Stock Buffer:</span>
                  {editingInventory ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={inventoryMaster.stock}
                        onChange={(e) => {
                          setInventoryMaster(prev => ({ ...prev, stock: e.target.value }));
                          clearMessages();
                        }}
                        className="w-20 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        min="0"
                      />
                      <span className="text-sm text-gray-500">Days</span>
                    </div>
                  ) : (
                    <span className="font-medium">{inventoryMaster.stock} Days</span>
                  )}
                </div>

                {/* Frequency Indent */}
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm font-medium">Frequency Indent:</span>
                  {editingInventory ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={inventoryMaster.order}
                        onChange={(e) => {
                          setInventoryMaster(prev => ({ ...prev, order: e.target.value }));
                          clearMessages();
                        }}
                        className="w-20 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        min="0"
                      />
                      <span className="text-sm text-gray-500">Days</span>
                    </div>
                  ) : (
                    <span className="font-medium">{inventoryMaster.order} Days</span>
                  )}
                </div>

                {/* Save Button - Only show when editing */}
                {editingInventory && (
                  <div className="pt-3 border-t border-gray-200">
                    <button
                      onClick={handleUpdateInventoryMaster}
                      disabled={loading}
                      className="w-full bg-green-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {loading ? (
                        <div className="flex items-center justify-center">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                          Saving...
                        </div>
                      ) : (
                        'Save Changes'
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m13-8L9 9l4 4" />
              </svg>
              <p>No inventory master found</p>
              <p className="text-sm">Configure your inventory settings</p>
            </div>
          )}
        </div>
      )}
    </div>
  </div>
)}
      </div>
    </div>
  );
};

export default MastersPage;