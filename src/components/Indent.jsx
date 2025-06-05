import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../services/api';

const IndentCreation = () => {
  const [segments, setSegments] = useState([
    { segmentId: '', category: '', diet: '', nos: '' }
  ]);
  
  const [segmentOptions, setSegmentOptions] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [indentDetails, setIndentDetails] = useState([]);
  const [showIndentDetails, setShowIndentDetails] = useState(false);

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

  const handleSave = async () => {
    // Validate that all rows have required data
    const validSegments = segments.filter(seg => seg.segmentId && seg.nos);
    
    if (validSegments.length === 0) {
      setError('Please add at least one valid segment with quantity');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('authToken');
      const payload = {
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
        // Set the indent details from API response
        setIndentDetails(result.data || []);
        setShowIndentDetails(true);
        // Reset form to initial state
        setSegments([{ segmentId: '', category: '', diet: '', nos: '' }]);
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
        <div className="w-full max-w-4xl">
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
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700">Date:</span>
                <input
                  type="date"
                  value={editableDate}
                  onChange={(e) => setEditableDate(e.target.value)}
                  className="text-sm px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <p className="text-sm font-medium text-gray-700">Total: {currentTotal}</p>
            </div>

            <div className="flex-grow overflow-auto">
              <table className="w-full table-auto border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 px-4 py-2 text-left">S.No</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">Prisoner Segment</th>
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
                <div className="flex justify-between items-center mb-6">
                  <h1 className="text-xl font-semibold text-gray-800">Indent Details</h1>
                  <button
                    onClick={() => {
                      setShowIndentDetails(false);
                      setIndentDetails([]);
                    }}
                    className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition"
                  >
                    Create New Indent
                  </button>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <table className="w-full table-auto border-collapse border border-gray-300">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border border-gray-300 px-4 py-2 text-left">S.No</th>
                        <th className="border border-gray-300 px-4 py-2 text-left">Item Name</th>
                        <th className="border border-gray-300 px-4 py-2 text-center">Quantity</th>
                        <th className="border border-gray-300 px-4 py-2 text-center">Unit</th>
                      </tr>
                    </thead>
                    <tbody>
                      {indentDetails.map((item, index) => (
                        <tr key={index} className="hover:bg-white transition-colors duration-150">
                          <td className="border border-gray-300 px-4 py-2">{index + 1}.</td>
                          <td className="border border-gray-300 px-4 py-2 font-medium">{item.name}</td>
                          <td className="border border-gray-300 px-4 py-2 text-center">{item.qty}</td>
                          <td className="border border-gray-300 px-4 py-2 text-center">{item.unit}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
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