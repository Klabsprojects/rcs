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

  const [indentDetails, setIndentDetails] = useState([]);
  const [showIndentDetails, setShowIndentDetails] = useState(false);
  const [userInfo, setUserInfo] = useState(null);

  // New states for order submission
  const [orderLoading, setOrderLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderError, setOrderError] = useState('');
  const [savedSegments, setSavedSegments] = useState([]); // Store segments from the saved indent
  const [savedDays, setSavedDays] = useState(0); // Store days from the saved indent

  // New states for listing
  const [indents, setIndents] = useState([]);
  const [listLoading, setListLoading] = useState(false);
  const [listError, setListError] = useState('');
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [orderDetails, setOrderDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState('');
  const [showExpandedView, setShowExpandedView] = useState(false);

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

        }
      } catch (err) {

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

        }
      } catch (err) {

        console.error('Error fetching inventory:', err);
      }
    };

    fetchInventory();
  }, []);

  // Fetch indents list
  useEffect(() => {
    const fetchIndents = async () => {
      setListLoading(true);
      try {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`${API_BASE_URL}/order/indent/list`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        const result = await response.json();

        if (response.ok && !result.error) {
          setIndents(result.data || []);
        } else {

        }
      } catch (err) {
        setListError('Network error while fetching indents');
        console.error('Error fetching indents:', err);
      } finally {
        setListLoading(false);
      }
    };

    fetchIndents();
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

  // Fetch detailed order information
  const fetchOrderDetails = async (orderId) => {
    setDetailsLoading(true);
    setDetailsError('');
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/order/${orderId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (response.ok && !result.error) {
        setOrderDetails(result.data || result);
        if (result.user) {
          setUserInfo(result.user); // <-- Add this line to store user info for order
        }
      } else {

      }
    } catch (err) {
      setDetailsError('Network error while fetching order details');
      console.error('Error fetching order details:', err);
    } finally {
      setDetailsLoading(false);
    }
  };

  // Handle expand/collapse of order details
  const handleToggleExpand = (orderId) => {
    if (expandedOrder === orderId && showExpandedView) {
      // If already expanded and in expanded view, hide the expanded view
      setShowExpandedView(false);
      setExpandedOrder(null);
      setOrderDetails(null);
    } else {
      // Expand and fetch details, switch to expanded view
      setExpandedOrder(orderId);
      setShowExpandedView(true);
      fetchOrderDetails(orderId);
    }
  };

  // Handle create indent button click
  const handleCreateIndent = () => {
    setShowExpandedView(false);
    setExpandedOrder(null);
    setOrderDetails(null);
    setShowIndentDetails(false);
  };

  // Calculate total persons from segments (handle both 'segment' and 'segement' typo)
  const calculateTotal = (indent) => {
    const segments = indent.segment || indent.segement;
    if (segments && Array.isArray(segments)) {
      return segments.reduce((sum, seg) => sum + (seg.persons || 0), 0);
    }
    return 0;
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  // Get status indicator color
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
      case 'pending':
        return 'bg-yellow-400';
      case 'approved':
        return 'bg-green-400';
      case 'rejected':
        return 'bg-red-400';
      default:
        return 'bg-gray-400';
    }
  };

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

      return;
    }

    if (!indentForDays || indentForDays.trim() === '') {

      return;
    }

    setLoading(true);


    try {
      const token = localStorage.getItem('authToken');

     const payload = {
  days: parseInt(indentForDays),
  segment: validSegments
    .map(seg => {
      const id = parseInt(seg.segmentId);
      const persons = parseInt(seg.nos);
      return id && persons ? { id, persons } : null;
    })
    .filter(Boolean)
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


        // Refresh the indents list
        const fetchIndents = async () => {
          try {
            const token = localStorage.getItem('authToken');
            const response = await fetch(`${API_BASE_URL}/order/indent/list`, {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
            });

            const result = await response.json();

            if (response.ok && !result.error) {
              setIndents(result.data || []);
            }
          } catch (err) {
            console.error('Error refreshing indents:', err);
          }
        };

        fetchIndents();
      } else {

      }
    } catch (err) {

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
      <div className="flex gap-6">
        {/* Left Side - Indent Creation (75% width) */}
        <div className="w-3/4">
          <div className="bg-white shadow rounded-lg p-6 h-full flex flex-col">
            {!showIndentDetails && !showExpandedView ? (
              <>
                <h1 className="text-xl font-semibold text-center mb-4 text-gray-800">Indent Creation</h1>


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
            ) : showExpandedView ? (
              <>
                {/* Expanded Order Details View */}
                <div className="flex justify-between items-center mb-4">
                  <h1 className="text-xl font-semibold text-gray-800">Order Details</h1>
                  <button
                    onClick={handleCreateIndent}
                    className="px-4 py-2 bg-sky-600 text-white rounded hover:bg-sky-700 transition flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                    </svg>
                    Create Indent
                  </button>
                </div>



                {detailsLoading ? (
                  <div className="text-center py-8">
                    <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="mt-2 text-gray-600">Loading order details...</p>
                  </div>
                ) : orderDetails ? (
                  <div className="space-y-4">
                    {userInfo?.detail && (
                      <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                        <h3 className="text-sm font-semibold text-blue-800 mb-2">Indent Source</h3>
                        <div className="text-sm text-gray-700 grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <div><span className="font-medium">Branch:</span> {userInfo.detail.branch}</div>
                          <div><span className="font-medium">Location:</span> {userInfo.detail.location}</div>
                        </div>
                      </div>
                    )}

                    {/* Items */}
                    {orderDetails.items && orderDetails.items.length > 0 ? (
                      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <h3 className="text-lg font-medium text-gray-900 mb-3">Items</h3>
                        <div className="overflow-x-auto">
                          <table className="w-full table-auto border-collapse border border-gray-300">
                            <thead>
                              <tr className="bg-gray-100">
                                <th className="border border-gray-300 px-4 py-2 text-left">S.No</th>
                                <th className="border border-gray-300 px-4 py-2 text-left">Item Name</th>
                                <th className="border border-gray-300 px-4 py-2 text-center">Unit</th>
                                <th className="border border-gray-300 px-4 py-2 text-center">Required</th>
                                <th className="border border-gray-300 px-4 py-2 text-center">Stock</th>
                                <th className="border border-gray-300 px-4 py-2 text-center">Buffer</th>
                                <th className="border border-gray-300 px-4 py-2 text-center">Order</th>

                              </tr>
                            </thead>
                            <tbody>
                              {orderDetails.items.map((item, itemIndex) => (
                                <tr key={item.id} className="hover:bg-gray-50">
                                  <td className="border border-gray-300 px-4 py-2">{itemIndex + 1}.</td>
                                  <td className="border border-gray-300 px-4 py-2">{item.name}</td>
                                  <td className="border border-gray-300 px-4 py-2 text-center">{item.unit}</td>
                                  <td className="border border-gray-300 px-4 py-2 text-center">{item.required}</td>
                                  <td className="border border-gray-300 px-4 py-2 text-center">{item.stock}</td>
                                  <td className="border border-gray-300 px-4 py-2 text-center">{item.buffer}</td>
                                  <td className="border border-gray-300 px-4 py-2 text-center">{item.order}</td>

                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-white rounded-lg p-4 border border-gray-200 text-center text-gray-500">
                        <p>No items found for this order</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>No detailed information available</p>
                  </div>
                )}
              </>
            ) : (
              <>
                {/* Indent Details (after save) */}
                <div className="flex justify-between items-center mb-4">
                  <h1 className="text-xl font-semibold text-gray-800">Indent Details</h1>
                  <button
                    onClick={handleCreateIndent}
                    className="px-4 py-2 bg-sky-600 text-white rounded hover:bg-sky-700 transition flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                    </svg>
                    Create Indent
                  </button>
                </div>

                {/* Order Success Message */}
                {orderSuccess && (
                  <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md text-green-600 text-sm">
                    Order submitted successfully!
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

        {/* Right Side - Indents List (25% width) - Modified to match attendance style */}
        <div className="w-1/4">
          <div className="bg-white shadow rounded-lg p-4 h-full">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Previous Indents
            </h2>





            {listLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-8 h-8 border-4 border-sky-200 border-t-sky-600 rounded-full animate-spin"></div>
              </div>
            ) : indents.length === 0 ? (
              <div className="bg-gray-50 border border-gray-200 rounded-md p-3">
                <p className="text-sm text-gray-600">No indent records found</p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="bg-gray-50 rounded-lg p-3">
                  {indents.map((indent, index) => (
                    <div
                      key={indent.id}
                      onClick={() => handleToggleExpand(indent.id)}
                      className={`cursor-pointer border-b border-gray-200 last:border-b-0 py-3 px-2 rounded-md transition-colors duration-150 ${expandedOrder === indent.id && showExpandedView
                        ? 'bg-blue-100 border-blue-300'
                        : 'hover:bg-white'
                        }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm font-medium text-gray-900">
                              {formatDate(indent.created)}
                            </span>
                            <div className={`w-3 h-3 rounded-full ${getStatusColor(indent.status)}`}></div>
                          </div>
                          <div className="flex justify-between items-center text-xs text-gray-600">
                            <span>Days: {indent.days}</span>
                            <span className="font-semibold text-gray-900">
                              Total: {calculateTotal(indent)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
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