import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../services/api';

const DispatchOrder = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dispatchData, setDispatchData] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  // Fetch order details
  useEffect(() => {
    const fetchOrderDetails = async () => {
      setLoading(true);
      
      try {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`${API_BASE_URL}/order/${id}/approved`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        const result = await response.json();
        
        if (response.ok && !result.error) {
          const details = result.data || result;
          setOrderDetails(details);
          
          // Initialize dispatch data with order quantities
          if (details && details.length > 0) {
            const initialDispatchData = details.map(item => ({
              id: item.id,
              name: item.name,
              orderQuantity: item.order,
              unit: item.unit,
              dispatchQuantity: '',
              remarks: ''
            }));
            setDispatchData(initialDispatchData);
          }
        }
      } catch (err) {
        console.error('Error fetching order details:', err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchOrderDetails();
    }
  }, [id]);

  // Handle dispatch quantity change
  const handleDispatchQuantityChange = (itemId, value) => {
    setDispatchData(prev => 
      prev.map(item => 
        item.id === itemId 
          ? { ...item, dispatchQuantity: value }
          : item
      )
    );
  };

  // Handle remarks change
  const handleRemarksChange = (itemId, value) => {
    setDispatchData(prev => 
      prev.map(item => 
        item.id === itemId 
          ? { ...item, remarks: value }
          : item
      )
    );
  };

  // Handle form submission
  const handleSubmitDispatch = async () => {
    // Validate dispatch quantities
    const hasEmptyQuantities = dispatchData.some(item => !item.dispatchQuantity || item.dispatchQuantity <= 0);
    
    if (hasEmptyQuantities) {
      alert('Please enter valid dispatch quantities for all items.');
      return;
    }

    setSubmitting(true);
    
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/order/${id}/dispatch`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: dispatchData.map(item => ({
            id: item.id,
            dispatchQuantity: parseInt(item.dispatchQuantity),
            remarks: item.remarks
          }))
        }),
      });

      const result = await response.json();
      
      if (response.ok && !result.error) {
        alert('Order dispatched successfully!');
        navigate('/indent-request');
      } else {
        alert(result.message || 'Error dispatching order');
      }
    } catch (err) {
      console.error('Error dispatching order:', err);
      alert('Error dispatching order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle back to orders list
  const handleBackToOrders = () => {
    navigate('/indent-request');
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6 bg-gray-50 rounded-lg">
        <div className="bg-white shadow rounded-lg p-6 h-full flex flex-col">
          <div className="text-center py-8">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading order details...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 bg-gray-50 rounded-lg">
      <div className="bg-white shadow rounded-lg p-6 h-full flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-800">Dispatch Order #{id}</h1>
          <button 
            onClick={handleBackToOrders}
            className="px-4 py-2 bg-sky-600 text-white rounded hover:bg-sky-700 transition flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Orders
          </button>
        </div>

        {/* Order Items Dispatch Table */}
        {orderDetails && orderDetails.length > 0 ? (
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Items to Dispatch</h3>
            <div className="overflow-x-auto">
              <table className="w-full table-auto border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 px-4 py-2 text-left">S.No</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">Item Name</th>
                    <th className="border border-gray-300 px-4 py-2 text-center">Order Qty</th>
                    <th className="border border-gray-300 px-4 py-2 text-center">Dispatch Qty</th>
                    <th className="border border-gray-300 px-4 py-2 text-center">Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {dispatchData.map((item, index) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="border border-gray-300 px-4 py-2">{index + 1}.</td>
                      <td className="border border-gray-300 px-4 py-2 font-medium">{item.name}</td>
                      <td className="border border-gray-300 px-4 py-2 text-center">{item.orderQuantity} {item.unit}</td>
                      <td className="border border-gray-300 px-4 py-2 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <input
                            type="number"
                            min="1"
                            max={item.orderQuantity}
                            value={item.dispatchQuantity}
                            onChange={(e) => handleDispatchQuantityChange(item.id, e.target.value)}
                            className="w-20 px-2 py-1 border border-gray-300 rounded text-center focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="0"
                          />
                          <span className="text-sm text-gray-600">{item.unit}</span>
                        </div>
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        <input
                          type="text"
                          value={item.remarks}
                          onChange={(e) => handleRemarksChange(item.id, e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Enter remarks (optional)"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg p-4 border border-gray-200 text-center text-gray-500 mb-6">
            <p>No items found for this order</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-center gap-4">
          <button
            onClick={handleBackToOrders}
            className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmitDispatch}
            disabled={submitting}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {submitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Dispatching...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                Confirm Dispatch
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DispatchOrder;