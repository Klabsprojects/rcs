
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

  // New states for preview
  const [previewData, setPreviewData] = useState([]);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState('');

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
            'Authorization': token,
            'Content-Type': 'application/json',
          },
        });

        const result = await response.json();

        if (response.ok && !result.error && result.data?.length) {
          setSegmentOptions(result.data || []);

          // Initialize all 6 segments with 0 count
          const defaultSegments = result.data.slice(0, 6).map(seg => ({
            segmentId: seg.id,
            category: seg.category,
            diet: seg.diet || '',
            nos: '0'
          }));

          setSegments(defaultSegments);
        }
      } catch (err) {
        setError('Network error while fetching segments');
        console.error('Error fetching segments:', err);
      }
    };

    fetchSegments();
  }, []);


  // Fetch attendance preview data
  const fetchAttendancePreview = async () => {
    try {
      setPreviewLoading(true);
      setPreviewError('');

      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/attendance`, {
        method: 'GET',
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (response.ok && !result.error) {
        // Transform data to show date and total count for each attendance record
        const transformedData = [];

        if (result.data && result.data.length > 0) {
          result.data.forEach(attendance => {
            // Calculate total count for each date
            const totalCount = Object.values(attendance.attendance).reduce((sum, count) => sum + count, 0);

            transformedData.push({
                id: attendance.id, // ✅ add this line
              date: attendance.att_date,
                attendance: attendance.attendance,  // ✅ store raw attendance object,
              totalCount: totalCount

            });
          });
        }

        setPreviewData(transformedData);
      } else {
        setPreviewError(result.message || 'No attendance data found');
        setPreviewData([]);
      }
    } catch (err) {
      setPreviewError('Network error while fetching attendance preview');
      setPreviewData([]);
      console.error('Error fetching attendance preview:', err);
    } finally {
      setPreviewLoading(false);
    }
  };

  // Fetch preview after segments are loaded
  useEffect(() => {
    fetchAttendancePreview();
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

      // Create attendance object with segment IDs as keys
      const attendanceObj = {};
      validSegments.forEach(seg => {
        attendanceObj[seg.segmentId] = parseInt(seg.nos);
      });

      const payload = {
        att_date: editableDate,
        attendance: attendanceObj
      };

      const response = await fetch(`${API_BASE_URL}/attendance`, {
        method: 'POST',
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (response.ok && !result.error) {
        alert('Attendance saved successfully!');
        // Reset form to initial state
        const defaultSegments = segmentOptions.slice(0, 6).map(seg => ({
  segmentId: seg.id,
  category: seg.category,
  diet: seg.diet || '',
  nos: '0'
}));
setSegments(defaultSegments);

        setError('');
        // Refresh preview data
        fetchAttendancePreview();
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

const loadAttendanceById = (record) => {
  const attendanceMap = record.attendance;

  const filledSegments = segmentOptions
    .filter(seg => attendanceMap.hasOwnProperty(seg.id.toString()))
    .map(seg => ({
      segmentId: seg.id,
      category: seg.category,
      diet: seg.diet || '',
      nos: attendanceMap[seg.id.toString()]?.toString() || '0',
    }));

  const fullSegments = segmentOptions.slice(0, 6).map(seg => {
    const match = filledSegments.find(f => f.segmentId === seg.id);
    return match || {
      segmentId: seg.id,
      category: seg.category,
      diet: seg.diet || '',
      nos: '0'
    };
  });

  setSegments(fullSegments);
  setEditableDate(record.date.split('T')[0]);
  setError('');
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
      <div className="flex gap-6">
        {/* Left Side - Attendance Creation */}
        <div className="flex-1">
          <div className="bg-white shadow rounded-lg p-6 h-full flex flex-col">
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
                    <th className="border border-gray-300 px-4 py-2 text-left">Resident Segment</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">Attendance Count</th>
                  </tr>
                </thead>

                {/* <tbody>
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
                </tbody> */}
                <tbody>
                  {segments.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50 transition-colors duration-150">
                      <td className="border border-gray-300 px-4 py-2">{index + 1}.</td>
                      <td className="border border-gray-300 px-4 py-2 text-sm text-gray-800">
                        {item.category} - {item.diet || 'N/A'}
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
          </div>
        </div>

        {/* Right Side - Preview */}
        <div className="w-96">
          <div className="bg-white shadow rounded-lg p-6 h-full">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Attendance Preview
            </h2>

            <div className="mb-3">
              <p className="text-sm text-gray-600">
                Attendance Records
              </p>
            </div>

            {previewLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-8 h-8 border-4 border-sky-200 border-t-sky-600 rounded-full animate-spin"></div>
              </div>
            ) : previewError ? (
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                <p className="text-sm text-yellow-700">{previewError}</p>
              </div>
            ) : previewData.length === 0 ? (
              <div className="bg-gray-50 border border-gray-200 rounded-md p-3">
                <p className="text-sm text-gray-600">No attendance data for this date</p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="bg-gray-50 rounded-lg p-3">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-300">
                        <th className="text-left py-2">Date</th>
                        <th className="text-right py-2">Total Count</th>
                        <th className="text-center py-2">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {previewData.map((item, index) => (
                        <tr key={index} className="border-b border-gray-200 last:border-b-0">
                          <td className="py-2 text-left">
                            {formatDate(item.date)}
                          </td>
                          <td className="py-2 text-right font-semibold">
                            {item.totalCount}
                          </td>
                          <td className="py-2 text-center">
                            <button
                              onClick={() => {
                                // TODO: Add refresh function for this row
                                // console.log('Refresh clicked for:', item.date);
                                loadAttendanceById(item)

                              }}
                              className="text-blue-600 hover:text-blue-800 text-lg"
                              title="Refresh"
                            >
                              🔄
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendanceCreation;