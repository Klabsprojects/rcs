import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../services/api';

const AttendanceCreation = () => {
  const [segments, setSegments] = useState([
    { segmentId: '', category: '', diet: '', nos: '' }
  ]);
  
  const [segmentOptions, setSegmentOptions] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [selectedAttendance, setSelectedAttendance] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [attendanceDetails, setAttendanceDetails] = useState([]);
  const [showAttendanceDetails, setShowAttendanceDetails] = useState(false);

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
      setError('Please add at least one valid segment with attendance count');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('authToken');
      const payload = {
        date: editableDate,
        segment: validSegments.map(seg => ({
          id: parseInt(seg.segmentId),
          persons: parseInt(seg.nos)
        }))
      };

      // Using the same API endpoint as indent for now - you can change this to attendance-specific endpoint
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
        alert('Attendance saved successfully!');
        // Set the attendance details from API response
        setAttendanceDetails(result.data || []);
        setShowAttendanceDetails(true);
        // Reset form to initial state
        setSegments([{ segmentId: '', category: '', diet: '', nos: '' }]);
        setError('');
      } else {
        setError(result.message || 'Failed to save attendance');
      }
    } catch (err) {
      setError('Network error while saving');
      console.error('Error saving attendance:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleString('default', { month: 'short' });
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const currentTotal = segments.reduce((sum, item) => sum + (parseInt(item.nos) || 0), 0);

  return (
    <div className="max-w-7xl mx-auto p-6 bg-gray-50 rounded-lg">
      <div className="flex justify-center mb-8">
        {/* Attendance Creation - Full Width */}
        <div className="w-full max-w-4xl">
          <div className="bg-white shadow rounded-lg p-6 h-full flex flex-col">
            {!showAttendanceDetails ? (
              <>
                <h1 className="text-xl font-semibold text-center mb-4 text-gray-800">Attendance Creation</h1>
            
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
                  <p className="text-sm font-medium text-gray-700">Total Attendance: {currentTotal}</p>
                </div>

                <div className="flex-grow overflow-auto">
                  <table className="w-full table-auto border-collapse border border-gray-300">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border border-gray-300 px-4 py-2 text-left">S.No</th>
                        <th className="border border-gray-300 px-4 py-2 text-left">Prisoner Segment</th>
                        <th className="border border-gray-300 px-4 py-2 text-left">Attendance Count</th>
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
                    {loading ? 'Saving...' : 'Save Attendance'}
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="flex justify-between items-center mb-6">
                  <h1 className="text-xl font-semibold text-gray-800">Attendance Details</h1>
                  <button
                    onClick={() => {
                      setShowAttendanceDetails(false);
                      setAttendanceDetails([]);
                    }}
                    className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition"
                  >
                    Create New Attendance
                  </button>
                </div>
                
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-700">
                    Date: {formatDate(editableDate)}
                  </p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <table className="w-full table-auto border-collapse border border-gray-300">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border border-gray-300 px-4 py-2 text-left">S.No</th>
                        <th className="border border-gray-300 px-4 py-2 text-left">Segment</th>
                        <th className="border border-gray-300 px-4 py-2 text-left">Category</th>
                        <th className="border border-gray-300 px-4 py-2 text-center">Attendance Count</th>
                      </tr>
                    </thead>
                    <tbody>
                      {attendanceDetails.map((item, index) => (
                        <tr key={index} className="hover:bg-white transition-colors duration-150">
                          <td className="border border-gray-300 px-4 py-2">{index + 1}.</td>
                          <td className="border border-gray-300 px-4 py-2 font-medium">
                            {item.category} - {item.diet || 'N/A'}
                          </td>
                          <td className="border border-gray-300 px-4 py-2">{item.category}</td>
                          <td className="border border-gray-300 px-4 py-2 text-center font-semibold">
                            {item.persons}
                          </td>
                        </tr>
                      ))}
                      <tr className="bg-gray-100 font-bold">
                        <td colSpan="3" className="border border-gray-300 px-4 py-2 text-right">
                          Total Attendance:
                        </td>
                        <td className="border border-gray-300 px-4 py-2 text-center">
                          {attendanceDetails.reduce((sum, item) => sum + (item.persons || 0), 0)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendanceCreation;