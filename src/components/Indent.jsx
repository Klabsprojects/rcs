import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../services/api';

const IndentCreation = () => {
  const [segments, setSegments] = useState([
    { segmentId: '', category: '', diet: '', nos: '' }
  ]);
  
  const [segmentOptions, setSegmentOptions] = useState([]);
  const [inventoryData, setInventoryData] = useState(null);
  const [indentForDays, setIndentForDays] = useState('');
  const [recentOrders, setRecentOrders] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [indentDetails, setIndentDetails] = useState([]);
  const [showIndentDetails, setShowIndentDetails] = useState(false);
  const [userInfo, setUserInfo] = useState(null);

  // New states for order submission
  const [orderLoading, setOrderLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderError, setOrderError] = useState('');
  const [savedSegments, setSavedSegments] = useState([]); // Store segments from the saved indent
  const [savedDays, setSavedDays] = useState(0); // Store days from the saved indent

  const [editableDate, setEditableDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });

  // Fetch segment options from API
  useEffect(() => {
    const fetchSegments = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`${API_BASE_URL}/segment`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        const result = await response.json();
        
        if (response.ok && !result.error) {
          setSegmentOptions(result.data || []);
        } else {
          setError('Failed to fetch segments');
        }
      } catch (err) {
        setError('Network error while fetching segments');
        console.error('Error fetching segments:', err);
      }
    };

    fetchSegments();
  }, []);

  // Fetch inventory data from API
  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`${API_BASE_URL}/master/inventory`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        const result = await response.json();
        
        if (response.ok && !result.error) {
          setInventoryData(result);
          // Prefill the indent for days with the order value from the first item
          if (result.data && result.data.length > 0) {
            setIndentForDays(result.data[0].order.toString());
          }
        } else {
          setError('Failed to fetch inventory');
        }
      } catch (err) {
        setError('Network error while fetching inventory');
        console.error('Error fetching inventory:', err);
      }
    };

    fetchInventory();
  }, []);

  // Generate mock recent orders (you can replace this with actual API call)
  useEffect(() => {
    const generateRecentOrders = () => {
      const orders = [];
      const today = new Date();

      for (let i = 1; i <= 8; i++) {
        const orderDate = new Date(today);
        orderDate.setDate(today.getDate() - i);

        // Use actual segment data if available
        const segmentData = segmentOptions.slice(0, 4).map(option => ({
          segment: `${option.category} - ${option.diet || 'N/A'}`,
          nos: Math.floor(Math.random() * 50) + 20
        }));

        const total = segmentData.reduce((sum, item) => sum + item.nos, 0);

        orders.push({
          date: orderDate,
          total: total,
          segments: segmentData
        });
      }

      return orders;
    };

    if (segmentOptions.length > 0) {
      setRecentOrders(generateRecentOrders());
    }
  }, [segmentOptions]);

  const handleSegmentChange = (index, selectedSegmentId) => {
    const selectedSegment = segmentOptions.find(option => option.id.toString() === selectedSegmentId);
    const updated = [...segments];
    
    if (selectedSegment) {
      updated[index] = {
        ...updated[index],
        segmentId: selectedSegmentId,
        category: selectedSegment.category,
        diet: selectedSegment.diet || ''
      };
    } else {
      updated[index] = {
        ...updated[index],
        segmentId: '',
        category: '',
        diet: ''
      };
    }
    
    setSegments(updated);
  };

  const handleNosChange = (index, newNos) => {
    const updated = [...segments];
    updated[index].nos = newNos;
    setSegments(updated);
  };

  const addRow = () => {
    setSegments([...segments, { segmentId: '', category: '', diet: '', nos: '' }]);
  };

  const removeRow = (index) => {
    if (segments.length > 1) {
      const updated = segments.filter((_, i) => i !== index);
      setSegments(updated);
    }
  };

  // Handle editable order change
  const handleEditableOrderChange = (index, newValue) => {
    const updated = [...indentDetails];
    updated[index].editableOrder = newValue;
    setIndentDetails(updated);
  };

  // Process indent details to add calculated columns
  const processIndentDetails = (data) => {
    return data.map(item => {
      const stock = parseFloat(item.stock) || 0;
      const buffer = parseFloat(item.buffer) || 0;
      const required = parseFloat(item.required) || 0;
      
      const exDf = stock - buffer;
      const order = required - exDf;
      
      return {
        ...item,
        exDf: exDf.toFixed(3),
        order: order.toFixed(3),
        editableOrder: order.toFixed(3) // Initialize editable order with calculated value
      };
    });
  };

  const handleSave = async () => {
    // Validate that all rows have required data
    const validSegments = segments.filter(seg => seg.segmentId && seg.nos);
    
    if (validSegments.length === 0) {
      setError('Please add at least one valid segment with quantity');
      return;
    }

    if (!indentForDays || indentForDays.trim() === '') {
      setError('Please enter indent for days');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('authToken');
      
      const payload = {
        days: parseInt(indentForDays),
        segment: validSegments.map(seg => ({
          id: parseInt(seg.segmentId),
          persons: parseInt(seg.nos)
        }))
      };

      const response = await fetch(`${API_BASE_URL}/indent/users`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (response.ok && !result.error) {
        alert('Indent saved successfully!');
        // Process and set the indent details from API response
        const processedDetails = processIndentDetails(result.data || []);
        setIndentDetails(processedDetails);
        setUserInfo(result.user); // Store user info
        
        // Save the segments and days for order submission
        setSavedSegments(validSegments.map(seg => ({
          id: parseInt(seg.segmentId),
          persons: parseInt(seg.nos)
        })));
        setSavedDays(parseInt(indentForDays));
        
        setShowIndentDetails(true);
        // Reset form to initial state
        setSegments([{ segmentId: '', category: '', diet: '', nos: '' }]);
        setIndentForDays(inventoryData && inventoryData.data && inventoryData.data.length > 0 ? inventoryData.data[0].order.toString() : '');
        setError('');
      } else {
        setError(result.message || 'Failed to save indent');
      }
    } catch (err) {
      setError('Network error while saving');
      console.error('Error saving indent:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle order submission
  const handleSubmitOrder = async () => {
    setOrderLoading(true);
    setOrderError('');
    setOrderSuccess(false);

    try {
      const token = localStorage.getItem('authToken');
      
      // Prepare items object from editable orders
      const items = {};
      indentDetails.forEach(item => {
        const editableOrderValue = parseFloat(item.editableOrder) || 0;
        if (editableOrderValue > 0) {
          items[item.id.toString()] = editableOrderValue.toFixed(3);
        }
      });

      // Validate that at least one item has quantity
      if (Object.keys(items).length === 0) {
        setOrderError('Please add quantities for at least one item');
        setOrderLoading(false);
        return;
      }

      const orderPayload = {
        days: savedDays,
        segment: savedSegments,
        items: items
      };

      console.log('Submitting order with payload:', orderPayload);

      const response = await fetch(`${API_BASE_URL}/order/indent`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderPayload)
      });

      const result = await response.json();

      if (response.ok && !result.error) {
        setOrderSuccess(true);
        alert('Order submitted successfully!');
        
        // Auto-hide success message after 3 seconds
        setTimeout(() => {
          setOrderSuccess(false);
        }, 3000);
      } else {
        setOrderError(result.message || 'Failed to submit order');
      }
    } catch (err) {
      setOrderError('Network error while submitting order');
      console.error('Error submitting order:', err);
    } finally {
      setOrderLoading(false);
    }
  };

  const formatOrderDate = (date) => {
    const day = date.getDate();
    const month = date.toLocaleString('default', { month: 'short' });
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const openOrderDetails = (order) => {
    setSelectedOrder(order);
    setShowPopup(true);
  };
  
  const closePopup = () => {
    setShowPopup(false);
    setSelectedOrder(null);
  };

  const currentTotal = segments.reduce((sum, item) => sum + (parseInt(item.nos) || 0), 0);

  return (
    <div className="max-w-7xl mx-auto p-6 bg-gray-50 rounded-lg">
      <div className="flex justify-center mb-8">
        {/* Indent Creation - Full Width */}
        <div className="w-full max-w-6xl">
          <div className="bg-white shadow rounded-lg p-6 h-full flex flex-col">
            {!showIndentDetails ? (
              <>
                <h1 className="text-xl font-semibold text-center mb-4 text-gray-800">Indent Creation</h1>
            
                {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">
                    {error}
                  </div>
                )}

                <div className="mb-4 flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-700">Order Date:</span>
                      <input
                        type="date"
                        value={editableDate}
                        onChange={(e) => setEditableDate(e.target.value)}
                        className="text-sm px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-700">Indent For:</span>
                      <input
                        type="number"
                        value={indentForDays}
                        onChange={(e) => setIndentForDays(e.target.value)}
                        className="text-sm px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 w-20"
                        placeholder="Days"
                      />
                      <span className="text-sm text-gray-500"></span>
                    </div>
                  </div>
                  <p className="text-sm font-medium text-gray-700">Total: {currentTotal}</p>
                </div>

                <div className="flex-grow overflow-auto">
                  <table className="w-full table-auto border-collapse border border-gray-300">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border border-gray-300 px-4 py-2 text-left">S.No</th>
                        <th className="border border-gray-300 px-4 py-2 text-left">Resident Segment</th>
                        <th className="border border-gray-300 px-4 py-2 text-left">Nos</th>
                        <th className="border border-gray-300 px-4 py-2 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {segments.map((item, index) => (
                        <tr key={index} className="hover:bg-gray-50 transition-colors duration-150">
                          <td className="border border-gray-300 px-4 py-2">{index + 1}.</td>
                          <td className="border border-gray-300 px-4 py-2">
                            <select
                              className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                              value={item.segmentId}
                              onChange={(e) => handleSegmentChange(index, e.target.value)}
                            >
                              <option value="">Select Segment</option>
                              {segmentOptions.map((option) => (
                                <option key={option.id} value={option.id}>
                                  {option.category} - {option.diet || 'N/A'}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="border border-gray-300 px-4 py-2">
                            <input
                              type="number"
                              className="w-24 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                              value={item.nos || ''}
                              onChange={(e) => handleNosChange(index, e.target.value)}
                              placeholder="0"
                            />
                          </td>
                          <td className="border border-gray-300 px-4 py-2 text-center">
                            {index === segments.length - 1 ? (
                              <button
                                onClick={addRow}
                                className="text-green-600 hover:text-green-800 font-bold text-lg"
                                title="Add Row"
                              >
                                +
                              </button>
                            ) : (
                              <button
                                onClick={() => removeRow(index)}
                                className="text-red-600 hover:text-red-800 font-bold text-lg"
                                title="Remove Row"
                              >
                                ×
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="mt-4 flex justify-end">
                  <button 
                    onClick={handleSave}
                    disabled={loading}
                    className="px-4 py-2 bg-sky-600 text-white rounded hover:bg-sky-700 transition disabled:opacity-50"
                  >
                    {loading ? 'Saving...' : 'Save'}
                  </button>
                </div>
              </>
            ) : (
              <>
         

                {/* Order Success Message */}
                {orderSuccess && (
                  <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md text-green-600 text-sm">
                    Order submitted successfully!
                  </div>
                )}

                {/* Order Error Message */}
                {orderError && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">
                    {orderError}
                  </div>
                )}

                {/* User Information Section - Only showing department, location, and contact */}
                {userInfo && userInfo.detail && (
                  <div className="bg-blue-50 rounded-lg p-4 mb-6 border border-blue-200">
                    <h3 className="text-lg font-semibold text-blue-800 mb-2">User Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-700">Department:</span>
                        <span className="ml-2 text-gray-600">{userInfo.detail.department}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Location:</span>
                        <span className="ml-2 text-gray-600">{userInfo.detail.location}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Contact:</span>
                        <span className="ml-2 text-gray-600">{userInfo.detail.contact}</span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="bg-gray-50 rounded-lg p-4 overflow-x-auto">
                  <table className="w-full table-auto border-collapse border border-gray-300 min-w-max">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border border-gray-300 px-3 py-2 text-left">S.No</th>
                        <th className="border border-gray-300 px-3 py-2 text-left">Item Name</th>
                        <th className="border border-gray-300 px-3 py-2 text-center">Required</th>
                        <th className="border border-gray-300 px-3 py-2 text-center">Stock</th>
                        <th className="border border-gray-300 px-3 py-2 text-center">Buffer</th>
                        <th className="border border-gray-300 px-3 py-2 text-center">Ex/Df</th>
                        <th className="border border-gray-300 px-3 py-2 text-center">Order</th>
                        <th className="border border-gray-300 px-3 py-2 text-center">Order (Edit)</th>
                        <th className="border border-gray-300 px-3 py-2 text-center">Unit</th>
                      </tr>
                    </thead>
                    <tbody>
                      {indentDetails.map((item, index) => (
                        <tr key={index} className="hover:bg-white transition-colors duration-150">
                          <td className="border border-gray-300 px-3 py-2">{index + 1}.</td>
                          <td className="border border-gray-300 px-3 py-2 font-medium">{item.name}</td>
                          <td className="border border-gray-300 px-3 py-2 text-center">{item.required}</td>
                          <td className="border border-gray-300 px-3 py-2 text-center">{item.stock}</td>
                          <td className="border border-gray-300 px-3 py-2 text-center">{item.buffer}</td>
                          <td className="border border-gray-300 px-3 py-2 text-center font-medium">
                            <span className={parseFloat(item.exDf) >= 0 ? 'text-green-600' : 'text-red-600'}>
                              {item.exDf}
                            </span>
                          </td>
                          <td className="border border-gray-300 px-3 py-2 text-center">{item.order}</td>
                          <td className="border border-gray-300 px-3 py-2 text-center">
                            <input
                              type="number"
                              step="0.001"
                              value={item.editableOrder}
                              onChange={(e) => handleEditableOrderChange(index, e.target.value)}
                              className="w-20 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-center text-sm"
                            />
                          </td>
                          <td className="border border-gray-300 px-3 py-2 text-center">{item.unit}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Submit Order Button */}
                <div className="mt-6 flex justify-end">
                  <button 
                    onClick={handleSubmitOrder}
                    disabled={orderLoading || orderSuccess}
                    className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    {orderLoading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Submitting Order...</span>
                      </>
                    ) : orderSuccess ? (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                        <span>Order Submitted</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                        <span>Submit Order</span>
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Order Details Popup */}
      {showPopup && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-lg w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Order Details: {formatOrderDate(selectedOrder.date)}</h3>
              <button onClick={closePopup} className="text-gray-500 hover:text-gray-700">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <table className="w-full table-auto border-collapse mb-4">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-4 py-2 text-left">Prisoner Segment</th>
                  <th className="border border-gray-300 px-4 py-2 text-right">Count</th>
                </tr>
              </thead>
              <tbody>
                {selectedOrder.segments.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="border border-gray-300 px-4 py-2">{item.segment}</td>
                    <td className="border border-gray-300 px-4 py-2 text-right">{item.nos}</td>
                  </tr>
                ))}
                <tr className="bg-gray-100 font-medium">
                  <td className="border border-gray-300 px-4 py-2">Total</td>
                  <td className="border border-gray-300 px-4 py-2 text-right">{selectedOrder.total}</td>
                </tr>
              </tbody>
            </table>
            <div className="flex justify-end">
              <button onClick={closePopup} className="px-4 py-2 bg-sky-600 text-white rounded hover:bg-sky-700 transition">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IndentCreation;