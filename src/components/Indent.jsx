import React, { useState, useEffect } from 'react';

const IndentCreation = () => {
  const [segments, setSegments] = useState([
    { segment: '', nos: '' },
    { segment: '', nos: '' },
    { segment: '', nos: '' },
    { segment: '', nos: '' },
  ]);

  const [recentOrders, setRecentOrders] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const [editableDate, setEditableDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0]; // format: YYYY-MM-DD
  });

  useEffect(() => {
    const generateRecentOrders = () => {
      const orders = [];
      const today = new Date();

      for (let i = 1; i <= 8; i++) {
        const orderDate = new Date(today);
        orderDate.setDate(today.getDate() - i);

        const segmentData = [
          { segment: 'Class A - Labour - Veg', nos: Math.floor(Math.random() * 30) + 60 },
          { segment: 'Class A - Labour - NonVeg', nos: Math.floor(Math.random() * 20) + 40 },
          { segment: 'Class A - Non Labour - Veg', nos: Math.floor(Math.random() * 100) + 520 },
          { segment: 'Class A - Non Labour - NonVeg', nos: Math.floor(Math.random() * 150) + 850 },
        ];

        const total = segmentData.reduce((sum, item) => sum + item.nos, 0);

        orders.push({
          date: orderDate,
          total: total,
          segments: segmentData
        });
      }

      return orders;
    };

    setRecentOrders(generateRecentOrders());
  }, []);

  const handleNosChange = (index, newNos) => {
    const updated = [...segments];
    updated[index].nos = newNos;
    setSegments(updated);
  };

  const handleSegmentChange = (index, newSegment) => {
    const updated = [...segments];
    updated[index].segment = newSegment;
    setSegments(updated);
  };

  const addRow = () => {
    setSegments([...segments, { segment: '', nos: '' }]);
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
      <div className="flex justify-between items-stretch mb-8 gap-6">
        {/* Indent Creation - 2/3 */}
        <div className="w-2/3">
          <div className="bg-white shadow rounded-lg p-6 h-full flex flex-col">
            <h1 className="text-xl font-semibold text-center mb-4 text-gray-800">Indent Creation</h1>
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
                  </tr>
                </thead>
                <tbody>
                  {segments.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50 transition-colors duration-150">
                      <td className="border border-gray-300 px-4 py-2">{index + 1}.</td>
                      <td className="border border-gray-300 px-4 py-2">
                        <input
                          type="text"
                          className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                          placeholder="Enter User"
                          value={item.segment}
                          onChange={(e) => handleSegmentChange(index, e.target.value)}
                        />
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        <input
                          type="number"
                          className="w-24 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                          value={item.nos || ''}
                          onChange={(e) => handleNosChange(index, e.target.value)}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 flex justify-end">
              <button className="px-4 py-2 bg-sky-600 text-white rounded hover:bg-sky-700 transition">
                Save
              </button>
            </div>
          </div>
        </div>

        {/* Recent Orders - 1/3 */}
        <div className="w-1/3">
          <div className="bg-white shadow rounded-lg p-6 h-full flex flex-col">
            <h2 className="text-xl font-semibold text-center mb-4 text-gray-800">Prior Residents Count</h2>
            <table className="w-full table-fixed text-sm">
              <thead>
                <tr className="text-left text-gray-600 border-b border-gray-200">
                  <th className="py-2">Date</th>
                  <th className="py-2 text-right">Total</th>
                  <th className="py-2 text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order, index) => (
                  <tr key={index} className="hover:bg-gray-50 border-b border-gray-100">
                    <td className="py-2">{formatOrderDate(order.date)}</td>
                    <td className="py-2 text-right">{order.total}</td>
                    <td className="py-2 flex justify-center items-center gap-3">
                      <button
                        onClick={() => openOrderDetails(order)}
                        title="View"
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7s-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => alert('Reverse functionality not implemented')}
                        title="Reverse"
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v6h6M20 20v-6h-6M5.636 18.364A9 9 0 105.636 5.636" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
