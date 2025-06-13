import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../services/api';

const IndentListing = () => {
  const navigate = useNavigate();
  const [approvedOrders, setApprovedOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  const [expandedOrder, setExpandedOrder] = useState(null);
  const [orderDetails, setOrderDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  const [showExpandedView, setShowExpandedView] = useState(false);

  // Fetch approved orders from API
  useEffect(() => {
    const fetchApprovedOrders = async () => {
      setLoading(true);
      
      try {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`${API_BASE_URL}/order/approved/list`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        const result = await response.json();
        
        if (response.ok && !result.error) {
          setApprovedOrders(result.data || []);
        } 
      } catch (err) {
  
        console.error('Error fetching approved orders:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchApprovedOrders();
  }, []);

  // Fetch detailed order information
  const fetchOrderDetails = async (orderId) => {
    setDetailsLoading(true);
 
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/order/${orderId}/approved`, {
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
   
      console.error('Error fetching order details:', err);
    } finally {
      setDetailsLoading(false);
    }
  };

  // Handle expand/collapse of order details
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

  // Handle back to listing
  const handleBackToListing = () => {
    setShowExpandedView(false);
    setExpandedOrder(null);
    setOrderDetails(null);
  };

  // Handle dispatch order navigation
  const handleDispatchOrder = () => {
    if (expandedOrder) {
      navigate(`/dispatch-order/${expandedOrder}`);
    }
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

  // Handle PDF view
  const handleViewPdf = (order) => {
    if (order.pdf_url) {
      const pdfUrl = `https://rcs-dms.onlinetn.com/public/pdf/${order.pdf_url}`;
      window.open(pdfUrl, '_blank');
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 bg-gray-50 rounded-lg">
      <div className="bg-white shadow rounded-lg p-6 h-full flex flex-col">
        {!showExpandedView ? (
          <>
            <h1 className="text-xl font-semibold text-center mb-4 text-gray-800">Approved Orders</h1>
        
     

            {loading ? (
              <div className="text-center py-8">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading approved orders...</p>
              </div>
            ) : approvedOrders.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600">No approved orders found.</p>
              </div>
            ) : (
              <div className="flex-grow overflow-auto">
                <table className="w-full table-auto border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-gray-300 px-4 py-2 text-left">S.No</th>
                      <th className="border border-gray-300 px-4 py-2 text-left">Department</th>
                      <th className="border border-gray-300 px-4 py-2 text-left">Type</th>
                      <th className="border border-gray-300 px-4 py-2 text-left">Branch</th>
                      <th className="border border-gray-300 px-4 py-2 text-left">Date</th>
                      <th className="border border-gray-300 px-4 py-2 text-center">Status</th>
                      <th className="border border-gray-300 px-4 py-2 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {approvedOrders.map((order, index) => (
                      <tr key={order.id} className="hover:bg-gray-50 transition-colors duration-150">
                        <td className="border border-gray-300 px-4 py-2">{index + 1}.</td>
                        <td className="border border-gray-300 px-4 py-2">{order.depatment}</td>
                        <td className="border border-gray-300 px-4 py-2">{order.type}</td>
                        <td className="border border-gray-300 px-4 py-2">{order.branch}</td>
                        <td className="border border-gray-300 px-4 py-2">{formatDate(order.created)}</td>
                        <td className="border border-gray-300 px-4 py-2 text-center">
                          <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                            {order.status}
                          </span>
                        </td>
                        <td className="border border-gray-300 px-4 py-2 text-center">
                          <div className="flex justify-center gap-2">
                            <button
                              onClick={() => handleToggleExpand(order.id)}
                              className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 transition"
                            >
                              View
                            </button>
                            {order.pdf_url && (
                              <button
                                onClick={() => handleViewPdf(order)}
                                className="px-3 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700 transition"
                              >
                                PDF
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        ) : (
          <>
            {/* Expanded Order Details View */}
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-xl font-semibold text-gray-800">Order Details</h1>
              <button 
                onClick={handleBackToListing}
                className="px-4 py-2 bg-sky-600 text-white rounded hover:bg-sky-700 transition flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to List
              </button>
            </div>

   

            {detailsLoading ? (
              <div className="text-center py-8">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading order details...</p>
              </div>
            ) : orderDetails ? (
              <div className="space-y-4">
             

                {/* Items */}
                {orderDetails && orderDetails.length > 0 ? (
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900 mb-3">Items</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full table-auto border-collapse border border-gray-300">
                        <thead>
                          <tr className="bg-gray-100">
                            <th className="border border-gray-300 px-4 py-2 text-left">S.No</th>
                            <th className="border border-gray-300 px-4 py-2 text-left">Item Name</th>
                            <th className="border border-gray-300 px-4 py-2 text-center">Order Quantity</th>
                          </tr>
                        </thead>
                        <tbody>
                          {orderDetails.map((item, itemIndex) => (
                            <tr key={item.id} className="hover:bg-gray-50">
                              <td className="border border-gray-300 px-4 py-2">{itemIndex + 1}.</td>
                              <td className="border border-gray-300 px-4 py-2">{item.name}</td>
                              <td className="border border-gray-300 px-4 py-2 text-center">{item.order} {item.unit}</td>
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

                {/* Dispatch Order Button */}
                <div className="flex justify-center mt-6">
                  <button
                    onClick={handleDispatchOrder}
                    className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2 font-medium"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                    Proceed with Order
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No detailed information available</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default IndentListing;