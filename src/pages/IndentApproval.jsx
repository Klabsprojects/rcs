import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../services/api';

const IndentApproval = () => {
  const [indents, setIndents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [orderDetails, setOrderDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState('');

  useEffect(() => {
    // Fetch indents from API
    const fetchIndents = async () => {
      setLoading(true);
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
          setError('Failed to fetch indents');
        }
      } catch (err) {
        setError('Network error while fetching indents');
        console.error('Error fetching indents:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchIndents();
  }, []);

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
      } else {
        setDetailsError('Failed to fetch order details');
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
    if (expandedOrder === orderId) {
      // Collapse if already expanded
      setExpandedOrder(null);
      setOrderDetails(null);
    } else {
      // Expand and fetch details
      setExpandedOrder(orderId);
      fetchOrderDetails(orderId);
    }
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

  // Get status badge color
  const getStatusBadgeColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 bg-gray-50 rounded-lg">
      <div className="bg-white shadow rounded-lg p-6">
        <h1 className="text-xl font-semibold text-center mb-4 text-gray-800">Indent Approval</h1>
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-8">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading indents...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full table-auto border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-4 py-2 text-left">S.No</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Date</th>
                  <th className="border border-gray-300 px-4 py-2 text-center">Status</th>
                  <th className="border border-gray-300 px-4 py-2 text-center">Days</th>
                  <th className="border border-gray-300 px-4 py-2 text-center">Total</th>
                  <th className="border border-gray-300 px-4 py-2 text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {indents.length > 0 ? (
                  <>
                    {indents.map((indent, index) => (
                      <React.Fragment key={indent.id}>
                        {/* Main Row */}
                        <tr className="hover:bg-gray-50 transition-colors duration-150">
                          <td className="border border-gray-300 px-4 py-2">{index + 1}.</td>
                          <td className="border border-gray-300 px-4 py-2">{formatDate(indent.created)}</td>
                          <td className="border border-gray-300 px-4 py-2 text-center">
                            <span className={`px-2 py-1 rounded-full text-xs ${getStatusBadgeColor(indent.status)}`}>
                              {indent.status}
                            </span>
                          </td>
                          <td className="border border-gray-300 px-4 py-2 text-center">{indent.days}</td>
                          <td className="border border-gray-300 px-4 py-2 text-center">{calculateTotal(indent)}</td>
                          <td className="border border-gray-300 px-4 py-2 text-center">
                            <button 
                              onClick={() => handleToggleExpand(indent.id)}
                              className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition"
                            >
                              {expandedOrder === indent.id ? 'Hide' : 'View'}
                            </button>
                          </td>
                        </tr>

                        {/* Expanded Details Row */}
                        {expandedOrder === indent.id && (
                          <tr>
                            <td colSpan="6" className="border border-gray-300 p-0">
                              <div className="bg-gray-50 p-6">
                                {detailsError && (
                                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">
                                    {detailsError}
                                  </div>
                                )}

                                {detailsLoading ? (
                                  <div className="text-center py-8">
                                    <div className="w-6 h-6 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                                    <p className="mt-2 text-gray-600 text-sm">Loading order details...</p>
                                  </div>
                                ) : orderDetails ? (
                                  <div className="space-y-4">
                                    {/* Items - Updated for actual API response structure */}
                                    {orderDetails.items && orderDetails.items.length > 0 ? (
                                      <div className="bg-white rounded-lg p-4 border border-gray-200">
                                        <h3 className="text-lg font-medium text-gray-900 mb-3">Items</h3>
                                        <div className="overflow-x-auto">
                                          <table className="w-full table-auto border-collapse border border-gray-300">
                                            <thead>
                                              <tr className="bg-gray-100">
                                                <th className="border border-gray-300 px-4 py-2 text-left">S.No</th>
                                                <th className="border border-gray-300 px-4 py-2 text-left">Item Name</th>
                                                <th className="border border-gray-300 px-4 py-2 text-center">Required</th>
                                                <th className="border border-gray-300 px-4 py-2 text-center">Stock</th>
                                                <th className="border border-gray-300 px-4 py-2 text-center">Buffer</th>
                                                <th className="border border-gray-300 px-4 py-2 text-center">Orders</th>
                                                <th className="border border-gray-300 px-4 py-2 text-center">Unit</th>
                                              </tr>
                                            </thead>
                                            <tbody>
                                              {orderDetails.items.map((item, itemIndex) => (
                                                <tr key={item.id} className="hover:bg-gray-50">
                                                  <td className="border border-gray-300 px-4 py-2">{itemIndex + 1}.</td>
                                                  <td className="border border-gray-300 px-4 py-2">{item.name}</td>
                                                  <td className="border border-gray-300 px-4 py-2 text-center">{item.required}</td>
                                                  <td className="border border-gray-300 px-4 py-2 text-center">{item.stock}</td>
                                                  <td className="border border-gray-300 px-4 py-2 text-center">{item.buffer}</td>
                                                  <td className="border border-gray-300 px-4 py-2 text-center">{item.order}</td>
                                                  <td className="border border-gray-300 px-4 py-2 text-center">{item.unit}</td>
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

                                    {/* Approve/Reject Buttons - Moved here */}
                                    <div className="flex justify-center gap-4 mt-6">
                                      <button className="px-6 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition flex items-center gap-2">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                        </svg>
                                        Approve
                                      </button>
                                      <button className="px-6 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition flex items-center gap-2">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                        Reject
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="text-center py-8 text-gray-500">
                                    <p>No detailed information available</p>
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </>
                ) : (
                  <tr>
                    <td colSpan="6" className="border border-gray-300 px-4 py-8 text-center text-gray-500">
                      No indents found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default IndentApproval;