import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../services/api';

const IndentCreation = () => {
  // Existing states
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
  const [orderDays, setOrderDays] = useState(null);
  const [orderLoading, setOrderLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderError, setOrderError] = useState('');
  const [savedSegments, setSavedSegments] = useState([]);
  const [savedDays, setSavedDays] = useState(0);
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

  // New states for Open Indent
  const [indentType, setIndentType] = useState('segment'); // 'segment' or 'open'
  const [groceryItems, setGroceryItems] = useState([]);
  const [groceryItemsLoading, setGroceryItemsLoading] = useState(false);
const [openIndentItems, setOpenIndentItems] = useState([
  { itemId: '', name: '', quantity: '', unit: 'Kg' }
]);
  // Fetch grocery items for open indent
  const fetchGroceryItems = async () => {
    try {
      setGroceryItemsLoading(true);
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        throw new Error('Authentication token not found. Please login again.');
      }

      const response = await fetch(`${API_BASE_URL}/segment/items`, {
        method: 'GET',
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.error === false) {
        setGroceryItems(result.data || []);
      }
    } catch (error) {
      console.error('Error fetching grocery items:', error);
    } finally {
      setGroceryItemsLoading(false);
    }
  };

  // Open indent item handlers
  const handleOpenIndentItemChange = (index, field, value) => {
    const updated = [...openIndentItems];
    updated[index][field] = value;
    
    // If changing item, update name and unit
    if (field === 'itemId') {
      const selectedItem = groceryItems.find(item => item.id.toString() === value);
if (selectedItem) {
  updated[index].name = selectedItem.name;
  updated[index].unit = selectedItem.indent;
} else {
  updated[index].name = '';
  updated[index].unit = 'Kg';
}
    }
    
    setOpenIndentItems(updated);
  };

  const addOpenIndentItem = () => {
setOpenIndentItems([...openIndentItems, { itemId: '', name: '', quantity: '', unit: 'Kg' }]);
  };

  const removeOpenIndentItem = (index) => {
    if (openIndentItems.length > 1) {
      const updated = openIndentItems.filter((_, i) => i !== index);
      setOpenIndentItems(updated);
    }
  };

  // Existing useEffects
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
        }
      } catch (err) {
        console.error('Error fetching segments:', err);
      }
    };

    fetchSegments();
    fetchGroceryItems(); // Fetch grocery items on component mount
  }, []);

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
          if (result.data && result.data.length > 0) {
            setIndentForDays(result.data[0].order.toString());
          }
        }
      } catch (err) {
        console.error('Error fetching inventory:', err);
      }
    };

    fetchInventory();
  }, []);

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

  useEffect(() => {
    const generateRecentOrders = () => {
      const orders = [];
      const today = new Date();

      for (let i = 1; i <= 8; i++) {
        const orderDate = new Date(today);
        orderDate.setDate(today.getDate() - i);

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

  // Existing functions (keeping all existing functionality)
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
          setUserInfo(result.user);
          setOrderDays(result.data?.days);
        }
      }
    } catch (err) {
      setDetailsError('Network error while fetching order details');
      console.error('Error fetching order details:', err);
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleToggleExpand = (orderId) => {
    if (expandedOrder === orderId && showExpandedView) {
      setShowExpandedView(false);
      setExpandedOrder(null);
      setOrderDetails(null);
    } else {
      setExpandedOrder(orderId);
      setShowExpandedView(true);
      fetchOrderDetails(orderId);
    }
  };

  const handleCreateIndent = () => {
    setShowExpandedView(false);
    setExpandedOrder(null);
    setOrderDetails(null);
    setShowIndentDetails(false);
  };

  const calculateTotal = (indent) => {
    const segments = indent.segment || indent.segement;
    if (segments && Array.isArray(segments)) {
      return segments.reduce((sum, seg) => sum + (seg.persons || 0), 0);
    }
    return 0;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

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

  const handleEditableOrderChange = (index, newValue) => {
    const updated = [...indentDetails];
    updated[index].editableOrder = newValue;
    setIndentDetails(updated);
  };

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
        editableOrder: order.toFixed(3)
      };
    });
  };

  // Modified handleSave to handle both indent types
  const handleSave = async () => {
    if (indentType === 'segment') {
      // Existing segment-based indent logic
      const validSegments = segments.filter(seg => seg.segmentId && seg.nos);

      if (validSegments.length === 0) {
        alert('Please add at least one segment with valid data');
        return;
      }

      if (!indentForDays || indentForDays.trim() === '') {
        alert('Please enter days for indent');
        return;
      }

      setLoading(true);

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
          const processedDetails = processIndentDetails(result.data || []);
          setIndentDetails(processedDetails);
          setUserInfo(result.user);

          setSavedSegments(validSegments.map(seg => ({
            id: parseInt(seg.segmentId),
            persons: parseInt(seg.nos)
          })));
          setSavedDays(parseInt(indentForDays));

          setShowIndentDetails(true);
          setSegments([{ segmentId: '', category: '', diet: '', nos: '' }]);
          setIndentForDays(inventoryData && inventoryData.data && inventoryData.data.length > 0 ? inventoryData.data[0].order.toString() : '');

          // Refresh indents list
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
          alert(result.message || 'Failed to save indent');
        }
      } catch (err) {
        alert('Network error while saving indent');
        console.error('Error saving indent:', err);
      } finally {
        setLoading(false);
      }
    } else {
      // New open indent logic
      const validItems = openIndentItems.filter(item => item.itemId && item.quantity);

      if (validItems.length === 0) {
        alert('Please add at least one item with valid data');
        return;
      }

      if (!indentForDays || indentForDays.trim() === '') {
        alert('Please enter days for indent');
        return;
      }

      // Validate quantities
      if (validItems.some(item => isNaN(parseFloat(item.quantity)) || parseFloat(item.quantity) <= 0)) {
        alert('Please enter valid quantities (numbers greater than 0)');
        return;
      }

      setLoading(true);

      try {
        const token = localStorage.getItem('authToken');

        // Prepare items object for open indent
        const items = {};
        validItems.forEach(item => {
          items[item.itemId] = parseFloat(item.quantity).toFixed(3);
        });

        const payload = {
          days: parseInt(indentForDays),
          items: items
        };

        console.log('Submitting open indent with payload:', payload);

        const response = await fetch(`${API_BASE_URL}/order/indent`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload)
        });

        const result = await response.json();

        if (response.ok && !result.error) {
          alert('Open indent submitted successfully!');
          
          // Reset form
          setOpenIndentItems([{ itemId: '', name: '', quantity: '', unit: 'gram' }]);
          setIndentForDays(inventoryData && inventoryData.data && inventoryData.data.length > 0 ? inventoryData.data[0].order.toString() : '');

          // Refresh indents list
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
          alert(result.message || 'Failed to submit open indent');
        }
      } catch (err) {
        alert('Network error while submitting open indent');
        console.error('Error submitting open indent:', err);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSubmitOrder = async () => {
    setOrderLoading(true);
    setOrderError('');
    setOrderSuccess(false);

    try {
      const token = localStorage.getItem('authToken');

      const items = {};
      indentDetails.forEach(item => {
        const editableOrderValue = parseFloat(item.editableOrder) || 0;
        if (editableOrderValue > 0) {
          items[item.id.toString()] = editableOrderValue.toFixed(3);
        }
      });

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
    <div className="w-full max-w-7xl mx-auto p-2 sm:p-4 lg:p-6 bg-gray-50 rounded-lg">
      <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
        {/* Left Side - Indent Creation (responsive width) */}
        <div className="w-full lg:w-3/4">
          <div className="bg-white shadow rounded-lg p-3 sm:p-4 lg:p-6 h-full flex flex-col">
            {!showIndentDetails && !showExpandedView ? (
              <>
                <h1 className="text-lg sm:text-xl font-semibold text-center mb-4 text-gray-800">Indent Creation</h1>

                {/* Indent Type Selection */}
                <div className="mb-4 flex justify-center">
                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-6">
                    <label className="flex items-center gap-2">
                      <input 
                        type="radio" 
                        value="segment" 
                        checked={indentType === 'segment'} 
                        onChange={() => setIndentType('segment')}
                        className="h-4 w-4"
                      /> 
                      <span className="text-sm font-medium">Segment Based Indent</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input 
                        type="radio" 
                        value="open" 
                        checked={indentType === 'open'} 
                        onChange={() => setIndentType('open')}
                        className="h-4 w-4"
                      /> 
                      <span className="text-sm font-medium">Open Indent</span>
                    </label>
                  </div>
                </div>

                <div className="mb-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-700 whitespace-nowrap">Order Date:</span>
                      <input
                        type="date"
                        value={editableDate}
                        onChange={(e) => setEditableDate(e.target.value)}
                        className="text-sm px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-700 whitespace-nowrap">Indent For:</span>
                      <input
                        type="number"
                        value={indentForDays}
                        onChange={(e) => setIndentForDays(e.target.value)}
                        className="text-sm px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 w-16 sm:w-20"
                        placeholder="Days"
                      />
                      <span className="text-sm text-gray-500">days</span>
                    </div>
                  </div>
                  {indentType === 'segment' && (
                    <p className="text-sm font-medium text-gray-700">Total: {currentTotal}</p>
                  )}
                </div>

                <div className="flex-grow overflow-auto">
                  {indentType === 'segment' ? (
                    // Existing segment-based table with responsive design
                    <div className="overflow-x-auto">
                      <table className="w-full table-auto border-collapse border border-gray-300 min-w-full">
                        <thead>
                          <tr className="bg-gray-100">
                            <th className="border border-gray-300 px-2 sm:px-4 py-2 text-left text-xs sm:text-sm">S.No</th>
                            <th className="border border-gray-300 px-2 sm:px-4 py-2 text-left text-xs sm:text-sm">Resident Segment</th>
                            <th className="border border-gray-300 px-2 sm:px-4 py-2 text-left text-xs sm:text-sm">Nos</th>
                            <th className="border border-gray-300 px-2 sm:px-4 py-2 text-center text-xs sm:text-sm">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {segments.map((item, index) => (
                            <tr key={index} className="hover:bg-gray-50 transition-colors duration-150">
                              <td className="border border-gray-300 px-2 sm:px-4 py-2 text-sm">{index + 1}.</td>
                              <td className="border border-gray-300 px-2 sm:px-4 py-2">
                                <select
                                  className="w-full px-1 sm:px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs sm:text-sm"
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
                              <td className="border border-gray-300 px-2 sm:px-4 py-2">
                                <input
                                  type="number"
                                  className="w-16 sm:w-24 px-1 sm:px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                                  value={item.nos || ''}
                                  onChange={(e) => handleNosChange(index, e.target.value)}
                                  placeholder="0"
                                />
                              </td>
                              <td className="border border-gray-300 px-2 sm:px-4 py-2 text-center">
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
                  ) : (
                    // New open indent table with responsive design
                    <div>
                      <h3 className="text-base sm:text-lg font-medium text-gray-800 mb-3">Select Items for Open Indent</h3>
                      {groceryItemsLoading ? (
                        <div className="text-center py-4">
                          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                          <p className="mt-2 text-sm text-gray-600">Loading items...</p>
                        </div>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full table-auto border-collapse border border-gray-300 min-w-full">
                            <thead>
                              <tr className="bg-gray-100">
                                <th className="border border-gray-300 px-2 sm:px-4 py-2 text-left text-xs sm:text-sm">S.No</th>
                                <th className="border border-gray-300 px-2 sm:px-4 py-2 text-left text-xs sm:text-sm">Item</th>
                                <th className="border border-gray-300 px-2 sm:px-4 py-2 text-left text-xs sm:text-sm">Quantity</th>
                
                                <th className="border border-gray-300 px-2 sm:px-4 py-2 text-center text-xs sm:text-sm">Action</th>
                              </tr>
                            </thead>
                            <tbody>
                              {openIndentItems.map((item, index) => (
                                <tr key={index} className="hover:bg-gray-50 transition-colors duration-150">
                                  <td className="border border-gray-300 px-2 sm:px-4 py-2 text-sm">{index + 1}.</td>
                                  <td className="border border-gray-300 px-2 sm:px-4 py-2">
                                    <select
                                      className="w-full px-1 sm:px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs sm:text-sm"
                                      value={item.itemId}
                                      onChange={(e) => handleOpenIndentItemChange(index, 'itemId', e.target.value)}
                                    >
                                      <option value="">Select Item</option>
                                      {groceryItems.map((groceryItem) => (
                                        <option key={groceryItem.id} value={groceryItem.id}>
                                          {groceryItem.name}
                                        </option>
                                      ))}
                                    </select>
                                  </td>
                   <td className="border border-gray-300 px-2 sm:px-4 py-2">
  <div className="flex items-center gap-2">
    <input
      type="number"
      step="0.001"
      className="w-20 sm:w-24 px-1 sm:px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs sm:text-sm"
      value={item.quantity || ''}
      onChange={(e) => handleOpenIndentItemChange(index, 'quantity', e.target.value)}
      placeholder="0.000"
    />
<span className="text-xs sm:text-sm text-gray-600 whitespace-nowrap">
  {item.unit === 'Kg' ? 'Kg' : 
   item.unit === 'Liter' ? 'Liter' : 
   item.unit === 'Pcs' ? 'Pcs' : 
   item.unit}
</span>
  </div>
</td>
                                  <td className="border border-gray-300 px-2 sm:px-4 py-2 text-center">
                                    {index === openIndentItems.length - 1 ? (
                                      <button
                                        onClick={addOpenIndentItem}
                                        className="text-green-600 hover:text-green-800 font-bold text-lg"
                                        title="Add Item"
                                      >
                                        +
                                      </button>
                                    ) : (
                                      <button
                                        onClick={() => removeOpenIndentItem(index)}
                                        className="text-red-600 hover:text-red-800 font-bold text-lg"
                                        title="Remove Item"
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
                      )}
                    </div>
                  )}
                </div>

                <div className="mt-4 flex justify-end">
                  <button
                    onClick={handleSave}
                    disabled={loading}
                    className="px-3 sm:px-4 py-2 bg-sky-600 text-white rounded hover:bg-sky-700 transition disabled:opacity-50 text-sm sm:text-base"
                  >
                    {loading ? 'Saving...' : (indentType === 'open' ? 'Submit Open Indent' : 'Save')}
                  </button>
                </div>
              </>
            ) : showExpandedView ? (
              <>
                {/* Expanded Order Details View */}
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-3">
                  <h1 className="text-lg sm:text-xl font-semibold text-gray-800">Order Details</h1>
                  <button
                    onClick={handleCreateIndent}
                    className="px-3 sm:px-4 py-2 bg-sky-600 text-white rounded hover:bg-sky-700 transition flex items-center gap-2 text-sm sm:text-base"
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
                      <div className="w-full bg-blue-50 border border-blue-200 rounded-md p-3 sm:p-4">
                        <h3 className="text-sm font-semibold text-blue-800 mb-2">Indent Source</h3>
                        <div className="text-sm text-gray-700 flex flex-col sm:flex-row sm:justify-between flex-wrap gap-2">
                          <div><span className="font-medium">Days:</span> {orderDays}</div>
                          <div><span className="font-medium">Branch:</span> {userInfo.detail.branch}</div>
                          <div><span className="font-medium">Location:</span> {userInfo.detail.location}</div>
                        </div>
                      </div>
                    )}

                    {/* Items */}
                    {orderDetails.items && orderDetails.items.length > 0 ? (
                      <div className="bg-gray-50 rounded-lg p-3 sm:p-4 border border-gray-200">
                        <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-3">Items</h3>
                        <div className="overflow-x-auto">
                          <table className="w-full table-auto border-collapse border border-gray-300 min-w-max">
                            <thead>
                              <tr className="bg-gray-100">
                                <th className="border border-gray-300 px-2 sm:px-4 py-2 text-left text-xs sm:text-sm">S.No</th>
                                <th className="border border-gray-300 px-2 sm:px-4 py-2 text-left text-xs sm:text-sm">Item Name</th>
  <th className="border border-gray-300 px-2 sm:px-4 py-2 text-center text-xs sm:text-sm">Required</th>
<th className="border border-gray-300 px-2 sm:px-4 py-2 text-center text-xs sm:text-sm">Stock</th>
<th className="border border-gray-300 px-2 sm:px-4 py-2 text-center text-xs sm:text-sm">Buffer</th>
<th className="border border-gray-300 px-2 sm:px-4 py-2 text-center text-xs sm:text-sm">Order</th>
                              </tr>
                            </thead>
                            <tbody>
                              {orderDetails.items.map((item, itemIndex) => (
                                <tr key={item.id} className="hover:bg-gray-50">
                                  <td className="border border-gray-300 px-2 sm:px-4 py-2 text-xs sm:text-sm">{itemIndex + 1}.</td>
                                  <td className="border border-gray-300 px-2 sm:px-4 py-2 text-xs sm:text-sm">{item.name}</td>
                          <td className="border border-gray-300 px-2 sm:px-4 py-2 text-center text-xs sm:text-sm">{item.required} {item.unit}</td>
<td className="border border-gray-300 px-2 sm:px-4 py-2 text-center text-xs sm:text-sm">{item.stock}</td>
<td className="border border-gray-300 px-2 sm:px-4 py-2 text-center text-xs sm:text-sm">{item.buffer}</td>
<td className="border border-gray-300 px-2 sm:px-4 py-2 text-center text-xs sm:text-sm">{item.order} {item.unit}</td>
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
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-3">
                  <h1 className="text-lg sm:text-xl font-semibold text-gray-800">Indent Details</h1>
                  <button
                    onClick={handleCreateIndent}
                    className="px-3 sm:px-4 py-2 bg-sky-600 text-white rounded hover:bg-sky-700 transition flex items-center gap-2 text-sm sm:text-base"
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

                {/* User Information Section */}
                {userInfo && userInfo.detail && (
                  <div className="bg-blue-50 rounded-lg p-3 sm:p-4 mb-6 border border-blue-200">
                    <h3 className="text-base sm:text-lg font-semibold text-blue-800 mb-2">User Information</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
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

                <div className="bg-gray-50 rounded-lg p-3 sm:p-4 overflow-x-auto">
                  <table className="w-full table-auto border-collapse border border-gray-300 min-w-max">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border border-gray-300 px-2 sm:px-3 py-2 text-left text-xs sm:text-sm">S.No</th>
                        <th className="border border-gray-300 px-2 sm:px-3 py-2 text-left text-xs sm:text-sm">Item Name</th>
                        <th className="border border-gray-300 px-2 sm:px-3 py-2 text-center text-xs sm:text-sm">Required</th>
                        <th className="border border-gray-300 px-2 sm:px-3 py-2 text-center text-xs sm:text-sm">Stock</th>
                        <th className="border border-gray-300 px-2 sm:px-3 py-2 text-center text-xs sm:text-sm">Buffer</th>
                        <th className="border border-gray-300 px-2 sm:px-3 py-2 text-center text-xs sm:text-sm">Ex/Df</th>
                        <th className="border border-gray-300 px-2 sm:px-3 py-2 text-center text-xs sm:text-sm">Order</th>
                     <th className="border border-gray-300 px-2 sm:px-3 py-2 text-center text-xs sm:text-sm">Order (Edit)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {indentDetails.map((item, index) => (
                        <tr key={index} className="hover:bg-white transition-colors duration-150">
                          <td className="border border-gray-300 px-2 sm:px-3 py-2 text-xs sm:text-sm">{index + 1}.</td>
                          <td className="border border-gray-300 px-2 sm:px-3 py-2 font-medium text-xs sm:text-sm">{item.name}</td>
                          <td className="border border-gray-300 px-2 sm:px-3 py-2 text-center text-xs sm:text-sm">{item.required}</td>
                          <td className="border border-gray-300 px-2 sm:px-3 py-2 text-center text-xs sm:text-sm">{item.stock}</td>
                          <td className="border border-gray-300 px-2 sm:px-3 py-2 text-center text-xs sm:text-sm">{item.buffer}</td>
                          <td className="border border-gray-300 px-2 sm:px-3 py-2 text-center font-medium text-xs sm:text-sm">
                            <span className={parseFloat(item.exDf) >= 0 ? 'text-green-600' : 'text-red-600'}>
                              {item.exDf}
                            </span>
                          </td>
<td className="border border-gray-300 px-2 sm:px-3 py-2 text-center text-xs sm:text-sm">{item.order} {item.unit}</td>
<td className="border border-gray-300 px-2 sm:px-3 py-2 text-center">
  <input
    type="number"
    step="0.001"
    value={item.editableOrder}
    onChange={(e) => handleEditableOrderChange(index, e.target.value)}
    className="w-16 sm:w-20 px-1 sm:px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-center text-xs sm:text-sm"
  />
</td>
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
                    className="px-4 sm:px-6 py-2 sm:py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 text-sm sm:text-base"
                  >
                    {orderLoading ? (
                      <>
                        <div className="w-4 sm:w-5 h-4 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Submitting Order...</span>
                      </>
                    ) : orderSuccess ? (
                      <>
                        <svg className="w-4 sm:w-5 h-4 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                        <span>Order Submitted</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-4 sm:w-5 h-4 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

        {/* Right Side - Indents List (responsive width) */}
        <div className="w-full lg:w-1/4">
          <div className="bg-white shadow rounded-lg p-3 sm:p-4 h-full">
            <h2 className="text-base sm:text-lg font-semibold text-gray-800 mb-4">
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
                <div className="bg-gray-50 rounded-lg p-2 sm:p-3">
                  {indents.map((indent, index) => (
                    <div
                      key={indent.id}
                      onClick={() => handleToggleExpand(indent.id)}
                      className={`cursor-pointer border-b border-gray-200 last:border-b-0 py-2 sm:py-3 px-2 rounded-md transition-colors duration-150 ${expandedOrder === indent.id && showExpandedView
                        ? 'bg-blue-100 border-blue-300'
                        : 'hover:bg-white'
                        }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-xs sm:text-sm font-medium text-gray-900">
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

      {/* Order Details Popup - Responsive */}
      {showPopup && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl p-4 sm:p-6 max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base sm:text-lg font-semibold">Order Details: {formatOrderDate(selectedOrder.date)}</h3>
              <button onClick={closePopup} className="text-gray-500 hover:text-gray-700">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full table-auto border-collapse mb-4 min-w-max">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 px-2 sm:px-4 py-2 text-left text-xs sm:text-sm">Prisoner Segment</th>
                    <th className="border border-gray-300 px-2 sm:px-4 py-2 text-right text-xs sm:text-sm">Count</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedOrder.segments.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="border border-gray-300 px-2 sm:px-4 py-2 text-xs sm:text-sm">{item.segment}</td>
                      <td className="border border-gray-300 px-2 sm:px-4 py-2 text-right text-xs sm:text-sm">{item.nos}</td>
                    </tr>
                  ))}
                  <tr className="bg-gray-100 font-medium">
                    <td className="border border-gray-300 px-2 sm:px-4 py-2 text-xs sm:text-sm">Total</td>
                    <td className="border border-gray-300 px-2 sm:px-4 py-2 text-right text-xs sm:text-sm">{selectedOrder.total}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="flex justify-end">
              <button onClick={closePopup} className="px-3 sm:px-4 py-2 bg-sky-600 text-white rounded hover:bg-sky-700 transition text-sm sm:text-base">
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