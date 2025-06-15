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
  
  // New states for approve/reject functionality
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionSuccess, setActionSuccess] = useState('');
  const [pdfFileName, setPdfFileName] = useState({});

  useEffect(() => {
    // Fetch indents from API
    const fetchIndents = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`${API_BASE_URL}/indent/list`, {
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
      const response = await fetch(`${API_BASE_URL}/indent/${orderId}/detail`, {
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

      }
    } catch (err) {
      setDetailsError('Network error while fetching order details');
      console.error('Error fetching order details:', err);
    } finally {
      setDetailsLoading(false);
    }
  };

  // Handle approve action
  const handleApprove = async (orderId) => {
    setActionLoading(true);
    setActionSuccess('');
    setError('');
    
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/indent/${orderId}/detail`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: "Approve"
        })
      });

      const result = await response.json();
      
      if (response.ok && !result.error) {
        setActionSuccess('Order approved successfully!');
        
        // Update the indent status in local state
        setIndents(prevIndents => 
          prevIndents.map(indent => 
            indent.id === orderId 
              ? { ...indent, status: 'approved' }
              : indent
          )
        );
        
        // Store PDF filename for the approved order
        if (result.data && result.data.file_name) {
          setPdfFileName(prev => ({
            ...prev,
            [orderId]: result.data.file_name
          }));
          setActionSuccess('Order approved successfully! PDF generated.');
        }
        
        // Auto-hide success message after 3 seconds
        setTimeout(() => setActionSuccess(''), 3000);
      } else {
        setError(result.message || 'Failed to approve order');
      }
    } catch (err) {
      setError('Network error while approving order');
      console.error('Error approving order:', err);
    } finally {
      setActionLoading(false);
    }
  };

  // Handle reject action// Handle reject action
const handleReject = async () => {
  if (!rejectReason.trim()) {
    setError('Please provide a reason for rejection');
    return;
  }

  setActionLoading(true);
  setActionSuccess('');
  setError('');
  
  try {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${API_BASE_URL}/order/${selectedOrderId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        status: "Reject",
        remarks: rejectReason.trim()  // Changed from 'reason' to 'remarks'
      })
    });

    const result = await response.json();
    
    if (response.ok && !result.error) {
      setActionSuccess('Order rejected successfully!');
      // Update the indent status in local state
      setIndents(prevIndents => 
        prevIndents.map(indent => 
          indent.id === selectedOrderId 
            ? { ...indent, status: 'rejected' }
            : indent
        )
      );
      // Close modal and reset state
      setShowRejectModal(false);
      setRejectReason('');
      setSelectedOrderId(null);
      // Auto-hide success message after 3 seconds
      setTimeout(() => setActionSuccess(''), 3000);
    } else {
      setError(result.message || 'Failed to reject order');
    }
  } catch (err) {
    setError('Network error while rejecting order');
    console.error('Error rejecting order:', err);
  } finally {
    setActionLoading(false);
  }
};
  // Handle PDF view
  const handleViewPdf = (indent) => {
    const fileName = getPdfFileName(indent);
    if (fileName) {
      const pdfUrl = `https://rcs-dms.onlinetn.com/public/pdf/${fileName}`;
      window.open(pdfUrl, '_blank');
    }
  };

  // Open reject modal
  const openRejectModal = (orderId) => {
    setSelectedOrderId(orderId);
    setShowRejectModal(true);
    setRejectReason('');
    setError('');
  };

  // Close reject modal
  const closeRejectModal = () => {
    setShowRejectModal(false);
    setRejectReason('');
    setSelectedOrderId(null);
    setError('');
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

  // Check if order can be approved/rejected (not already processed)
  const canTakeAction = (status) => {
    const lowerStatus = status?.toLowerCase();
    return lowerStatus !== 'approved' && lowerStatus !== 'rejected';
  };

  // Check if PDF is available for an order
  const getPdfFileName = (indent) => {
    // First check if order has existing pdf_url from API
    if (indent.pdf_url) {
      return indent.pdf_url;
    }
    // Then check if we have a newly generated PDF filename
    return pdfFileName[indent.id];
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

        {actionSuccess && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md text-green-600 text-sm">
            {actionSuccess}
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
                            <div className="flex gap-2 justify-center">
                              <button 
                                onClick={() => handleToggleExpand(indent.id)}
                                className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition"
                              >
                                {expandedOrder === indent.id ? 'Hide' : 'View'}
                              </button>
                              {indent.status?.toLowerCase() === 'approved' && getPdfFileName(indent) && (
                    <button
  onClick={() => handleViewPdf(indent)}
  className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition flex items-center gap-1"
  title="View PDF"
>
  <svg className="w-3 h-3" fill="none" stroke="red" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
  PDF
</button>
                              )}
                            </div>
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

                                    {/* Approve/Reject Buttons */}
                                    {canTakeAction(indent.status) ? (
                                      <div className="flex justify-center gap-4 mt-6">
                                        <button 
                                          onClick={() => handleApprove(indent.id)}
                                          disabled={actionLoading}
                                          className="px-6 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                          {actionLoading ? (
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                          ) : (
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                            </svg>
                                          )}
                                          Approve
                                        </button>
                                        <button 
                                          onClick={() => openRejectModal(indent.id)}
                                          disabled={actionLoading}
                                          className="px-6 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                          </svg>
                                          Reject
                                        </button>
                                      </div>
                                    ) : null}
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

      {/* Reject Reason Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Reject Order</h2>
            <p className="text-gray-600 mb-4">Please provide a reason for rejecting this order:</p>
            
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Enter rejection reason..."
              className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
              rows="4"
            />
            
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={closeRejectModal}
                disabled={actionLoading}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={actionLoading || !rejectReason.trim()}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {actionLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : null}
                Reject Order
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IndentApproval;