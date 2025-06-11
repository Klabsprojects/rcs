import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../services/api';


const InlineSegmentDietPlannerForm = ({ segment, onSavePlan, onCancel, loading, groceryItems, getAllowedUnits, editingPlan = null, isEditing = false }) => {
  const [formType, setFormType] = useState('per-day');
  const [items, setItems] = useState([{ name: '', quantity: '', unit: 'gram' }]);
const [fixedGroups, setFixedGroups] = useState(new Set());
  const [weeklyPlanGroups, setWeeklyPlanGroups] = useState([
    {
      id: 1,
      name: 'Days Selected Plans',
      days: [],
      items: [{ name: '', quantity: '', unit: 'gram' }]
    }
  ]);

  const [nextGroupId, setNextGroupId] = useState(2);

  const allDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const getGroupDisplayName = (group) => {
    if (group.days.length === 0) {
      return 'Days Selected Plans';
    }
    return group.days.map(day => day.slice(0, 3)).join(', ') + ' Plans';
  };

  const handleItemChange = (index, e) => {
    const { name, value } = e.target;
    const newItems = [...items];
    newItems[index][name] = value;
    setItems(newItems);
  };


useEffect(() => {
  if (isEditing && editingPlan) {
    if (editingPlan.type === 'Week') {
      setFormType('per-week');
      // Parse weekly data and populate weeklyPlanGroups
      const groups = [];
      let groupId = 1;
      
      allDays.forEach(day => {
        if (editingPlan[day]) {
          const items = Object.entries(editingPlan[day]).map(([itemId, quantity]) => {
            // Find grocery item by ID
            const groceryItem = groceryItems.find(g => g.id.toString() === itemId);
            return {
              name: groceryItem ? groceryItem.name : '',
              quantity: quantity.toString(),
              unit: groceryItem ? groceryItem.resident : 'gram'
            };
          });
          
          groups.push({
            id: groupId++,
            name: `${day} Plans`,
            days: [day],
            items: items.length > 0 ? items : [{ name: '', quantity: '', unit: 'gram' }]
          });
        }
      });
      
      if (groups.length > 0) {
        setWeeklyPlanGroups(groups);
        setFixedGroups(new Set(groups.map(g => g.id)));
        setNextGroupId(groupId);
      }
    } else if (editingPlan.type === 'Day') {
      setFormType('per-day');
      const parsedItems = Object.entries(editingPlan.Day || {}).map(([itemId, quantity]) => {
        // Find grocery item by ID
        const groceryItem = groceryItems.find(g => g.id.toString() === itemId);
        return {
          name: groceryItem ? groceryItem.name : '',
          quantity: quantity.toString(),
          unit: groceryItem ? groceryItem.resident : 'gram'
        };
      });
      if (parsedItems.length > 0) {
        setItems(parsedItems);
      }
    } else if (editingPlan.type === 'Month') {
      setFormType('per-month');
      const parsedItems = Object.entries(editingPlan.Month || {}).map(([itemId, quantity]) => {
        // Find grocery item by ID
        const groceryItem = groceryItems.find(g => g.id.toString() === itemId);
        return {
          name: groceryItem ? groceryItem.name : '',
          quantity: quantity.toString(),
          unit: groceryItem ? groceryItem.resident : 'gram'
        };
      });
      if (parsedItems.length > 0) {
        setItems(parsedItems);
      }
    }
  }
}, [isEditing, editingPlan, groceryItems]);
  const handleGroupItemChange = (groupId, itemIndex, e) => {
    const { name, value } = e.target;
    const newGroups = weeklyPlanGroups.map(group => {
      if (group.id === groupId) {
        const newItems = [...group.items];
        newItems[itemIndex][name] = value;
        return { ...group, items: newItems };
      }
      return group;
    });
    setWeeklyPlanGroups(newGroups);
  };

  const handleGroupDayToggle = (groupId, day) => {
    const newGroups = weeklyPlanGroups.map(group => {
      if (group.id === groupId) {
        const newDays = group.days.includes(day) 
          ? group.days.filter(d => d !== day)
          : [...group.days, day];
        return { ...group, days: newDays };
      }
      return group;
    });
    setWeeklyPlanGroups(newGroups);
  };

  const addItem = () => setItems([...items, { name: '', quantity: '', unit: 'gram' }]);
  const removeItem = (index) => setItems(items.filter((_, i) => i !== index));

  const addGroupItem = (groupId) => {
    const newGroups = weeklyPlanGroups.map(group => {
      if (group.id === groupId) {
        return { ...group, items: [...group.items, { name: '', quantity: '', unit: 'gram' }] };
      }
      return group;
    });
    setWeeklyPlanGroups(newGroups);
  };

  const removeGroupItem = (groupId, itemIndex) => {
    const newGroups = weeklyPlanGroups.map(group => {
      if (group.id === groupId) {
        return { ...group, items: group.items.filter((_, i) => i !== itemIndex) };
      }
      return group;
    });
    setWeeklyPlanGroups(newGroups);
  };

  const addPlanGroup = () => {
    const newGroup = {
      id: nextGroupId,
      name: 'Days Selected Plans',
      days: [],
      items: [{ name: '', quantity: '', unit: 'gram' }]
    };
    setWeeklyPlanGroups([...weeklyPlanGroups, newGroup]);
    setNextGroupId(nextGroupId + 1);
  };

  const removePlanGroup = (groupId) => {
    if (weeklyPlanGroups.length > 1) {
      setWeeklyPlanGroups(weeklyPlanGroups.filter(group => group.id !== groupId));
    }
  };

  const getGroupedDays = () => {
    const grouped = new Set();
    weeklyPlanGroups.forEach(group => {
      group.days.forEach(day => grouped.add(day));
    });
    return grouped;
  };
const handleFixGroup = (groupId) => {
  const group = weeklyPlanGroups.find(g => g.id === groupId);
  if (group.days.length === 0) {
    alert('Please select at least one day before fixing the group');
    return;
  }
  
  // Fix the current group
  setFixedGroups(prev => new Set([...prev, groupId]));
  
  // Check if we need to create a new group (if not all 7 days are covered)
  const currentGroupedDays = getGroupedDays();
  if (currentGroupedDays.size < 7) {
    // Create new group automatically
    const newGroup = {
      id: nextGroupId,
      name: 'Days Selected Plans',
      days: [],
      items: [{ name: '', quantity: '', unit: 'gram' }]
    };
    setWeeklyPlanGroups(prev => [...prev, newGroup]);
    setNextGroupId(prev => prev + 1);
  }
};
  const handleSave = () => {
if (formType === 'per-week') {
  // Check if all groups are fixed
  const unfixedGroups = weeklyPlanGroups.filter(group => !fixedGroups.has(group.id));
  if (unfixedGroups.length > 0) {
    alert('Please fix all groups before saving the plan');
    return;
  }
  
  // Validate groups
  for (const group of weeklyPlanGroups) {
    if (group.days.length === 0) {
      alert(`Please select at least one day for ${getGroupDisplayName(group)}`);
      return;
    }
    if (group.items.some(item => !item.name || !item.quantity)) {
      alert(`Please fill all item fields for ${getGroupDisplayName(group)}`);
      return;
    }
    if (group.items.some(item => isNaN(parseInt(item.quantity)) || parseInt(item.quantity) <= 0)) {
      alert(`Please enter valid quantities for ${getGroupDisplayName(group)}`);
      return;
    }
  }

  // Check if all 7 days are covered
  const groupedDays = getGroupedDays();
  if (groupedDays.size !== 7) {
    const missingDays = allDays.filter(day => !groupedDays.has(day));
    alert(`Please assign all days to groups. Missing: ${missingDays.join(', ')}. Create more groups to cover all days.`);
    return;
  }
  
  const plan = { 
    formType, 
    weeklyPlanGroups: weeklyPlanGroups,
    days: allDays 
  };
  onSavePlan(plan);
}
    else {
      // Daily/Monthly plan validation
      if (items.some(item => !item.name || !item.quantity)) {
        alert('Please fill all item fields');
        return;
      }
      if (items.some(item => isNaN(parseInt(item.quantity)) || parseInt(item.quantity) <= 0)) {
        alert('Please enter valid quantities (numbers greater than 0)');
        return;
      }
      
      const plan = { formType, items };
      onSavePlan(plan);
    }
    
    // Reset form
    setItems([{ name: '', quantity: '', unit: 'gram' }]);
setFixedGroups(new Set());
    setWeeklyPlanGroups([
      {
        id: 1,
        name: 'Days Selected Plans',
        days: [],
        items: [{ name: '', quantity: '', unit: 'gram' }]
      }
    ]);
    setNextGroupId(2);

  };

  return (
    <div>
      <div className="mb-3">


        <div className="flex gap-3">
          <label className="flex items-center gap-1 text-sm">
            <input 
              type="radio" 
              value="per-day" 
              checked={formType === 'per-day'} 
              onChange={() => setFormType('per-day')}
              disabled={loading}
              className="h-3 w-3"
            /> 
            Per Day
          </label>
          <label className="flex items-center gap-1 text-sm">
            <input 
              type="radio" 
              value="per-week" 
              checked={formType === 'per-week'} 
              onChange={() => setFormType('per-week')}
              disabled={loading}
              className="h-3 w-3"
            /> 
            Per Week
          </label>
          <label className="flex items-center gap-1 text-sm">
            <input 
              type="radio" 
              value="per-month" 
              checked={formType === 'per-month'} 
              onChange={() => setFormType('per-month')}
              disabled={loading}
              className="h-3 w-3"
            /> 
            Per Month
          </label>
        </div>
      </div>



{formType === 'per-week' ? (
  <div>

    
 {weeklyPlanGroups.map((group) => {
  const isGroupFixed = fixedGroups.has(group.id);
  
  // If group is fixed, only show the days that were selected for this group
  const availableDays = isGroupFixed 
    ? group.days 
    : allDays.filter(day => {
        const usedDaysInOtherGroups = new Set();
        weeklyPlanGroups.forEach(otherGroup => {
          if (otherGroup.id !== group.id) {
            otherGroup.days.forEach(day => usedDaysInOtherGroups.add(day));
          }
        });
        return !usedDaysInOtherGroups.has(day);
      });
  
  return (
    <div key={group.id} className="mb-3 p-3 border rounded bg-gray-50">
      <div className="flex justify-between items-center mb-2">
        <div className="text-sm font-medium text-gray-800">
          {getGroupDisplayName(group)}
        </div>

      </div>
      
      <div className="mb-2">
        <div className="flex gap-2 mb-1">
          {availableDays.map((day) => {
            const isSelected = group.days.includes(day);
            return (
              <label key={day} className="flex items-center gap-1 text-xs">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => !isGroupFixed && handleGroupDayToggle(group.id, day)}
                  className="h-3 w-3"
                  disabled={loading || isGroupFixed}
                />
                {day.slice(0, 3)}
              </label>
            );
          })}
        </div>
        
        {/* Fix Group button - only show if group is not fixed and has selected days */}
        {!isGroupFixed && group.days.length > 0 && (
          <button
            onClick={() => handleFixGroup(group.id)}
            className="text-xs bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600 mt-1"
            disabled={loading}
          >
            Fix Group
          </button>
        )}
        

      </div>

      {/* Only show items section if group is fixed */}
      {isGroupFixed && group.days.length > 0 && (
        <div>
          <p className="text-xs text-blue-600 mb-1">Items for: {group.days.join(', ')}</p>
          {group.items.map((item, index) => (
            <div key={index} className="flex gap-1 mb-1 items-end">
              <div>
    <select
  name="name"
  value={item.name}
  onChange={(e) => handleGroupItemChange(group.id, index, e)}
  className="w-32 border px-1 py-1 rounded text-xs h-7"
  disabled={loading}
>
  <option value="">Item</option>
  {groceryItems.map((option) => (
    <option key={option.id} value={option.name}>{option.name}</option>
  ))}
</select>
              </div>
              <div className="w-16">
                <input
                  type="number"
                  name="quantity"
                  value={item.quantity}
                  onChange={(e) => handleGroupItemChange(group.id, index, e)}
                  placeholder="Qty"
                  className="w-full border px-1 py-1 rounded text-xs h-7"
                  min="1"
                  disabled={loading}
                />
              </div>
              <div className="w-20">
    <select
  name="unit"
  value={item.unit}
  onChange={(e) => handleGroupItemChange(group.id, index, e)}
  className="w-full border px-1 py-1 rounded text-xs h-7"
  disabled={loading}
>
  {getAllowedUnits(item.name).map(unitOption => (
    <option key={unitOption} value={unitOption}>
      {unitOption === 'gram' ? 'grams' : 
       unitOption === 'ml' ? 'ml' : 
       unitOption === 'piece' ? 'pcs' : 
       unitOption === 'kg' ? 'kg' : 
       unitOption === 'L' ? 'liters' : unitOption}
    </option>
  ))}
</select>
              </div>
              {index > 0 && (
                <button 
                  onClick={() => removeGroupItem(group.id, index)} 
                  className="bg-red-500 text-white px-1 rounded hover:bg-red-600 text-xs h-7 w-7 flex items-center justify-center"
                  disabled={loading}
                >
                  ×
                </button>
              )}
            </div>
          ))}
          <button
            onClick={() => addGroupItem(group.id)}
            className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
            disabled={loading}
          >
            + Item
          </button>
        </div>
      )}
    </div>
  );
})}
  </div>
) : (
        <div>
          <span className="text-sm font-medium text-gray-700 block mb-2">Items Required</span>
          {items.map((item, index) => (
            <div key={index} className="flex gap-1 mb-1 items-end">
              <div>
                <select
                  name="name"
                  value={item.name}
                  onChange={(e) => handleItemChange(index, e)}
                  className="w-32 border px-1 py-1 rounded text-xs h-7"
                  disabled={loading}
                >
           <option value="">Item</option>
{groceryItems.map((option) => (
  <option key={option.id} value={option.name}>{option.name}</option>
))}
                </select>
              </div>
              <div className="w-16">
                <input
                  type="number"
                  name="quantity"
                  value={item.quantity}
                  onChange={(e) => handleItemChange(index, e)}
                  placeholder="Qty"
                  className="w-full border px-1 py-1 rounded text-xs h-7"
                  min="1"
                  disabled={loading}
                />
              </div>
              <div className="w-20">
<select
  name="unit"
  value={item.unit}
  onChange={(e) => handleItemChange(index, e)}
  className="w-full border px-1 py-1 rounded text-xs h-7"
  disabled={loading}
>
  {getAllowedUnits(item.name).map(unitOption => (
    <option key={unitOption} value={unitOption}>
      {unitOption === 'gram' ? 'grams' : 
       unitOption === 'ml' ? 'ml' : 
       unitOption === 'piece' ? 'pcs' : 
       unitOption === 'kg' ? 'kg' : 
       unitOption === 'L' ? 'liters' : unitOption}
    </option>
  ))}
</select>
              </div>
              {index > 0 && (
                <button 
                  onClick={() => removeItem(index)} 
                  className="bg-red-500 text-white px-1 rounded hover:bg-red-600 text-xs h-7 w-7 flex items-center justify-center"
                  disabled={loading}
                >
                  ×
                </button>
              )}
            </div>
          ))}
          <button
            onClick={addItem}
            className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
            disabled={loading}
          >
            + Item
          </button>
        </div>
      )}

      <div className="mt-4 flex justify-end space-x-2">
        <button
          onClick={onCancel}
          className="px-3 py-1 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 text-sm"
          disabled={loading}
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          className="bg-green-600 text-white px-4 py-1 rounded hover:bg-green-700 text-sm flex items-center space-x-1"
          disabled={loading}
        >
          {loading && (
            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
          )}
          <span>{loading ? 'Saving...' : 'Save'}</span>
        </button>
      </div>
    </div>
  );
};
const DietPlanner = () => {
  const [userInfoList, setUserInfoList] = useState([]);
  const [selectedUserIndex, setSelectedUserIndex] = useState(null);
  const [expandedUserIndex, setExpandedUserIndex] = useState(null);
const [editingPlan, setEditingPlan] = useState(null);
const [editingSegmentId, setEditingSegmentId] = useState(null);
const [editingPlanIndex, setEditingPlanIndex] = useState(null);
const [eaterTypes, setEaterTypes] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const [segments, setSegments] = useState([]);
  const [formInputs, setFormInputs] = useState({ type: '', subType: '', dietType: '' });
const selectedEaterType = eaterTypes.find(type => type.name === formInputs.type);
  const [segmentsLoading, setSegmentsLoading] = useState(false);
  const [expandedSegment, setExpandedSegment] = useState(null);
const [expandedSegmentForPlan, setExpandedSegmentForPlan] = useState(null);
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);

const [groceryItems, setGroceryItems] = useState([]);
const [groceryItemsLoading, setGroceryItemsLoading] = useState(false);
// NEW: State for detailed plan view
const [detailedPlanView, setDetailedPlanView] = useState({});
const [planDetailsLoading, setPlanDetailsLoading] = useState(false);
const [expandedPlan, setExpandedPlan] = useState(null);
const [expandedPlanDetails, setExpandedPlanDetails] = useState({});
  // Fetch segments on component mount using GET API
useEffect(() => {
  fetchSegments();
  fetchEaterTypes();
  fetchGroceryItems(); // Add this line
}, []);
useEffect(() => {
  const handleClickOutside = (event) => {
    if (showTypeDropdown && !event.target.closest('.relative')) {
      setShowTypeDropdown(false);
    }
  };

  document.addEventListener('mousedown', handleClickOutside);
  return () => {
    document.removeEventListener('mousedown', handleClickOutside);
  };
}, [showTypeDropdown]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormInputs({ ...formInputs, [name]: value });
  };

const handleEditPlan = (segmentId, planIndex) => {
  const segment = segments.find(s => s.id === segmentId);
  if (segment && segmentHasPlans(segment)) {
    const plans = getSegmentPlans(segment);
    if (plans[planIndex]) {
      setEditingPlan(plans[planIndex]);
      setEditingSegmentId(segmentId);
      setEditingPlanIndex(planIndex);
      setExpandedSegmentForPlan(segmentId);
    }
  }
};
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

// NEW: Function to bind items to plan and get detailed information
// NEW: Function to bind items to plan and get detailed information
const bindItemsToPlan = async (plan) => {
  try {
    setPlanDetailsLoading(true);
    const token = localStorage.getItem('authToken');
    
    if (!token) {
      throw new Error('Authentication token not found. Please login again.');
    }

    // Create the exact body structure as required by the API
    const requestBody = {
      plan: [plan]
    };

    console.log('Sending to /segment/bind-items:', JSON.stringify(requestBody, null, 2));

    const response = await fetch(`${API_BASE_URL}/segment/bind-items`, {
      method: 'POST',
      headers: {
        'Authorization': token,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    console.log('API Response:', result);
    
    if (result.error === false) {
      return result.data || result;
    } else {
      throw new Error(result.message || 'Failed to bind items to plan');
    }
  } catch (error) {
    console.error('Error binding items to plan:', error);
    throw error;
  } finally {
    setPlanDetailsLoading(false);
  }
};
// NEW: Handler for viewing detailed plan
const handleViewDetailedPlan = async (segmentId, planIndex) => {
  const detailKey = `${segmentId}-${planIndex}`;
  
  // If already loaded, toggle view
  if (detailedPlanView[detailKey]) {
    setDetailedPlanView(prev => ({
      ...prev,
      [detailKey]: null
    }));
    return;
  }

  try {
    const segment = segments.find(s => s.id === segmentId);
    if (!segment || !segment.plan) {
      alert('Plan not found');
      return;
    }
    
    const plans = Array.isArray(segment.plan) ? segment.plan : [segment.plan];
    if (!plans[planIndex]) {
      alert('Plan not found');
      return;
    }
    
    const plan = plans[planIndex];
    const detailedPlan = await bindItemsToPlan(plan);
    
    setDetailedPlanView(prev => ({
      ...prev,
      [detailKey]: detailedPlan
    }));
  } catch (error) {
    alert(`Failed to load plan details: ${error.message}`);
  }
};
const getAllowedUnits = (itemName) => {
  const item = groceryItems.find(item => item.name === itemName);
  if (!item) return ['gram']; // default unit
  
  // Return only the resident field as the unit option
  return [item.resident];
};
  const fetchSegments = async () => {
    try {
      setSegmentsLoading(true);

      
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        throw new Error('Authentication token not found. Please login again.');
      }

      const response = await fetch(`${API_BASE_URL}/segment`, {
        method: 'GET',
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Session expired. Please login again.');
        }
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      
if (result.error === false) {
  setSegments(result.data || []);
  console.log('Segments fetched successfully:', result.data);
}
} catch (error) {
  console.error('Error fetching segments:', error);
} finally {
      setSegmentsLoading(false);
    }
  };

 // Fetch Eater Types
const fetchEaterTypes = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/master/eater-type`, {
      headers: {
        'Authorization': localStorage.getItem('authToken')
      }
    });
    
    if (response.ok) {
      const result = await response.json();
      if (result.error === false && Array.isArray(result.data)) {
        setEaterTypes(result.data);
      }
    }
  } catch (err) {
    console.error('Error fetching eater types:', err);
  }
};

// Fetch Eater Roles  

const fetchSegmentData = async (category, diet) => {
  try {
    setLoading(true);

    
    const token = localStorage.getItem('authToken');
    
    if (!token) {
      throw new Error('Authentication token not found. Please login again.');
    }

    const response = await fetch(`${API_BASE_URL}/segment`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        category: category,
        diet: diet
      })
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Session expired. Please login again.');
      }
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data;
} catch (error) {
  console.error('Error fetching segment data:', error);
  return null;
} finally {
    setLoading(false);
  }
};
const handleSavePlan = async (plan) => {
  const user = userInfoList[selectedUserIndex];
  
  console.log('User object:', user);
  console.log('User segment ID:', user.segmentId);
  
  if (!user.segmentId) {
    alert('No segment ID found for this user. Please recreate the user.');
    return;
  }

  // Validate segment ID is a valid number or string
  if (user.segmentId === null || user.segmentId === undefined || user.segmentId === '') {
    alert('Invalid segment ID. Please recreate the user.');
    return;
  }

const planType = plan.formType === 'per-day' ? 'Day' : plan.formType === 'per-week' ? 'Week' : 'Month';
let planData;

if (plan.formType === 'per-week') {
  // Keep existing weekly structure
  planData = {
    name: `Week Plan`,
    type: 'Week'
  };
  
  plan.items.forEach(item => {
    const groceryItem = groceryItems.find(g => g.name === item.name);
    if (groceryItem) {
      planData[groceryItem.id] = parseInt(item.quantity) || 0;
    }
  });
} else {
  // New structure for Day/Month
  const itemsObj = {};
  
  plan.items.forEach(item => {
    const groceryItem = groceryItems.find(g => g.name === item.name);
    if (groceryItem) {
      itemsObj[groceryItem.id] = parseInt(item.quantity) || 0;
    }
  });

  planData = {
    name: `${planType} Plan`,
    [planType]: itemsObj,
    type: planType
  };
}

  // Add days if it's a weekly plan
  if (plan.formType === 'per-week' && plan.days) {
    planData.days = plan.days;
  }

  console.log('Final plan data to send:', planData);

  try {
    const result = await savePlanToSegment(user.segmentId, planData);
    
    // Update local state only if API call was successful
    const updatedList = [...userInfoList];
    updatedList[selectedUserIndex].plans.push({
      ...plan,
      userType: user.type,
      role: user.role,
      dietType: user.dietType,
      apiResponse: result
    });
    setUserInfoList(updatedList);
    
    // Refresh segments to show updated plans
    fetchSegments();
    
    alert('Plan saved successfully!');
  } catch (error) {
    console.error('Failed to save plan:', error);
    alert(`Failed to save plan: ${error.message}`);
  }
};const segmentHasPlans = (segment) => {
  if (!segment.plan) return false;
  
  // Handle the nested structure: segment.plan.plan
  if (segment.plan.plan && Array.isArray(segment.plan.plan)) {
    return segment.plan.plan.length > 0;
  }
  
  // Handle direct array structure: segment.plan (if it's an array)
  if (Array.isArray(segment.plan)) {
    return segment.plan.length > 0;
  }
  
  // Handle single plan object: segment.plan.type
  if (segment.plan.type) {
    return true;
  }
  
  return false;
};

// Helper function to get plans array from segment
const getSegmentPlans = (segment) => {
  if (!segment.plan) return [];
  
  // Handle the nested structure: segment.plan.plan
  if (segment.plan.plan && Array.isArray(segment.plan.plan)) {
    return segment.plan.plan;
  }
  
  // Handle direct array structure: segment.plan (if it's an array)
  if (Array.isArray(segment.plan)) {
    return segment.plan;
  }
  
  // Handle single plan object: segment.plan
  if (segment.plan.type) {
    return [segment.plan];
  }
  
  return [];
};

const savePlanToSegment = async (segmentId, planData) => {
  try {
    setLoading(true);

    
    const token = localStorage.getItem('authToken');
    
    if (!token) {
      throw new Error('Authentication token not found. Please login again.');
    }

    // IMPORTANT: Wrap planData array in a "plan" property
    const requestBody = {
      plan: [planData]  // This creates {"plan": [planData]}
    };

    // Debug logging
    console.log('=== API Call Debug Info ===');
    console.log('Segment ID:', segmentId);
    console.log('Original Plan Data:', JSON.stringify(planData, null, 2));
    console.log('Request Body:', JSON.stringify(requestBody, null, 2));
    console.log('API URL:', `${API_BASE_URL}/segment/${segmentId}/plan`);

    const response = await fetch(`${API_BASE_URL}/segment/${segmentId}/plan`, {
      method: 'POST',
      headers: {
        'Authorization': token,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody) // Send {"plan": [planData]}
    });

    console.log('Response status:', response.status);
    console.log('Response status text:', response.statusText);

    // Get response body regardless of status
    let responseBody;
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      responseBody = await response.json();
    } else {
      responseBody = await response.text();
    }
    
    console.log('Response body:', responseBody);

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Session expired. Please login again.');
      }
      
      let errorMessage = `API Error: ${response.status} - ${response.statusText}`;
      
      if (typeof responseBody === 'object' && responseBody.message) {
        errorMessage += ` - ${responseBody.message}`;
      } else if (typeof responseBody === 'string') {
        errorMessage += ` - ${responseBody}`;
      }
      
      throw new Error(errorMessage);
    }

    console.log('✅ Plan saved successfully');
    return responseBody;
} catch (error) {
  console.error('❌ Error saving plan:', error);
  throw error;
} finally {
    setLoading(false);
  }
};
const handleUserCreation = async () => {
  const { type, subType, dietType } = formInputs;
  
  const isSubTypeRequired = selectedEaterType && selectedEaterType.sub && selectedEaterType.sub.length > 0;
  
  if (!type || !dietType || (isSubTypeRequired && !subType)) {
    alert('Please fill all required fields');
    return;
  }

  const dietMapping = {
    'veg': 'Vegetarian',
    'non-veg': 'Non-Vegetarian'
  };

  // If subType exists, send category with subType bound together
  const categoryForAPI = subType ? `${type} - ${subType}` : type;
  const segmentData = await fetchSegmentData(categoryForAPI, dietMapping[dietType]);

if (!segmentData) {
  return;
}

  // Debug: Log the entire segmentData response
  console.log('Full segment data response:', JSON.stringify(segmentData, null, 2));

  // FIXED: Find matching segment from segments list instead of using user.id
  const matchingSegment = segments.find(segment => 
    segment.category === categoryForAPI && 
    segment.diet === dietMapping[dietType]
  );
  
  let segmentId = null;
  if (matchingSegment) {
    segmentId = matchingSegment.id;
    console.log('Found matching segment ID:', segmentId);
  }

  const newUser = {
    ...formInputs,
    plans: [],
    segmentData: segmentData,
    segmentId: segmentId,
    matchingSegment: matchingSegment // Store the full segment data
  };

  console.log('Created user with segment ID:', segmentId);
  setUserInfoList([...userInfoList, newUser]);
  setFormInputs({ type: '', subType: '', dietType: '' });
  
  // ADD THIS LINE: Refresh segments after user creation
  await fetchSegments();
};
const handleSaveSegmentPlan = async (plan) => {
  const segment = segments.find(s => s.id === (editingSegmentId || expandedSegmentForPlan));
  if (!segment) {
    alert('No segment selected');
    return;
  }

  let segmentPlanData;

  if (plan.formType === 'per-week') {
    segmentPlanData = {
      type: 'Week'
    };

    plan.weeklyPlanGroups.forEach((group) => {
      group.days.forEach(day => {
        const dayItems = {};
        group.items.forEach(item => {
          const groceryItem = groceryItems.find(g => g.name === item.name);
          if (groceryItem) {
            dayItems[groceryItem.id] = parseInt(item.quantity) || 0;
          }
        });
        segmentPlanData[day] = dayItems;
      });
    });
  } else {
    const planType = plan.formType === 'per-day' ? 'Day' : 'Month';
    const itemsObj = {};

    plan.items.forEach(item => {
      const groceryItem = groceryItems.find(g => g.name === item.name);
      if (groceryItem) {
        itemsObj[groceryItem.id] = parseInt(item.quantity) || 0;
      }
    });

    segmentPlanData = {
      [planType]: itemsObj,
      type: planType
    };
  }

  console.log('Final plan data to send for segment:', segmentPlanData);

  try {
    // Send the plan data directly (the API should wrap it in an array)
    const result = await savePlanToSegment(segment.id, segmentPlanData);
    
    if (editingPlan) {
      alert(`Plan updated successfully for ${segment.category} - ${segment.role}!`);
    } else {
      alert(`Plan saved successfully for ${segment.category} - ${segment.role}!`);
    }
    
    // Reset edit state
    setEditingPlan(null);
    setEditingSegmentId(null);
    setEditingPlanIndex(null);
    
    fetchSegments();
  } catch (error) {
    console.error('Failed to save segment plan:', error);
  }
};

  const handleViewPlan = (userIndex) => {
    setExpandedUserIndex(expandedUserIndex === userIndex ? null : userIndex);
  };

const toggleSegmentExpansion = (segmentId) => {
  const isExpanding = expandedSegment !== segmentId;
  setExpandedSegment(expandedSegment === segmentId ? null : segmentId);
  
  // If expanding, call API for all plans in this segment
  if (isExpanding) {
    const segment = segments.find(s => s.id === segmentId);
    if (segment && segmentHasPlans(segment)) {
      const plans = getSegmentPlans(segment);
      if (plans.length > 0) {
        plans.forEach((plan, planIndex) => {
          handleViewDetailedPlan(segmentId, planIndex);
        });
      }
    }
  }
};


// ADD THESE MISSING FUNCTIONS:
const handleRetry = () => {
fetchSegments();
};

// Component to display detailed plan with item names
const DetailedPlanView = ({ segmentId, planIndex, plan }) => {
  const detailKey = `${segmentId}-${planIndex}`;
  const detailedPlan = detailedPlanView[detailKey];
  
  if (!detailedPlan) return <div className="text-sm text-gray-500">Loading plan details...</div>;

  // Extract the plan from the API response
  const planData = detailedPlan.plan && detailedPlan.plan[0] ? detailedPlan.plan[0] : null;
  
  if (!planData) return <div className="text-sm text-red-500">No plan data found</div>;

  return (
    <div className="p-3 bg-white border border-blue-200 rounded">
     <h6 className="text-sm font-medium text-blue-800 mb-2">{planData.type}</h6>
      
      {planData.type === 'Week' && (
        <div className="space-y-3">
          {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => {
            if (!planData[day]) return null;
            
            return (
              <div key={day} className="border-l-2 border-blue-300 pl-3">
                <h6 className="text-sm font-medium text-blue-700">{day}:</h6>
                <div className="ml-2 space-y-1">
                  {Object.entries(planData[day]).map(([itemName, itemDetails]) => (
                    <div key={itemName} className="text-sm text-gray-700">
                      • {itemName}: {itemDetails.qty} {itemDetails.unit}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {(planData.type === 'Day' || planData.type === 'Month') && (
        <div className="space-y-1">
          {Object.entries(planData[planData.type] || {}).map(([itemName, itemDetails]) => (
            <div key={itemName} className="text-sm text-gray-700">
              • {itemName}: {itemDetails.qty} {itemDetails.unit}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

return (
  <div className="max-w-7xl mx-auto px-4 py-6">
    
<div className="bg-sky-50 p-4 rounded shadow mb-6 flex gap-4 items-end">
  <div className="flex-1">
    <label className="block text-sm text-gray-700">User Type</label>
    <select
      name="type"
      value={formInputs.type}
      onChange={(e) => {
        setFormInputs({...formInputs, type: e.target.value, subType: ''});
      }}
      className="w-full border px-3 py-2 rounded"
      disabled={loading}
    >
      <option value="">Select User Type</option>
      {eaterTypes.map((type) => (
        <option key={type.id} value={type.name}>{type.name}</option>
      ))}
    </select>
  </div>
  
  {selectedEaterType && selectedEaterType.sub && selectedEaterType.sub.length > 0 && (
    <div className="flex-1">
      <label className="block text-sm text-gray-700">Sub Type</label>
      <select
        name="subType"
        value={formInputs.subType}
        onChange={(e) => setFormInputs({...formInputs, subType: e.target.value})}
        className="w-full border px-3 py-2 rounded"
        disabled={loading}
      >
        <option value="">Select Sub Type</option>
        {selectedEaterType.sub.map((subType, index) => (
          <option key={index} value={subType}>{subType}</option>
        ))}
      </select>
    </div>
  )}
  
  <div className="flex-1">
    <label className="block text-sm text-gray-700">Diet Type</label>
    <select
      name="dietType"
      value={formInputs.dietType}
      onChange={handleInputChange}
      className="w-full border px-3 py-2 rounded"
      disabled={loading}
    >
      <option value="">Select</option>
      <option value="veg">Vegetarian</option>
      <option value="non-veg">Non-Vegetarian</option>
    </select>
  </div>
  <button
    onClick={handleUserCreation}
    disabled={loading}
    className={`px-4 py-2 rounded text-white flex items-center space-x-2 ${
      loading 
        ? 'bg-gray-400 cursor-not-allowed' 
        : 'bg-green-600 hover:bg-green-700'
    }`}
  >
    {loading && (
      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
    )}
    <span>{loading ? 'Creating...' : 'Create'}</span>
  </button>
</div>

{segments.length > 0 && (
  <div className="bg-white rounded shadow mb-6 p-4">
    <h2 className="text-lg font-semibold text-gray-800 mb-3">Available Segments & Their Plans</h2>
    <div className="space-y-3">
      {segments.map((segment) => (
        <div key={segment.id} className="border border-gray-200 rounded-lg">
          <div 
            className="bg-gray-50 p-3 cursor-pointer hover:bg-gray-100 flex justify-between items-center"
            onClick={() => toggleSegmentExpansion(segment.id)}
          >
            <div>
              <p className="text-sm font-medium text-gray-800">
                <span className="hidden">ID: {segment.id} | </span>{segment.category} - {segment.role}
              </p>
              <p className="text-xs text-gray-600">
                Diet: {segment.diet} | Status: {segment.status}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              {segmentHasPlans(segment) && (
                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                  Plan exists
                </span>
              )}
              {!segmentHasPlans(segment) && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setExpandedSegmentForPlan(expandedSegmentForPlan === segment.id ? null : segment.id);
                  }}
                  className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
                >
                  {expandedSegmentForPlan === segment.id ? 'Cancel' : 'Add Plan'}
                </button>
              )}
              <span className="text-gray-400">
                {expandedSegment === segment.id ? '▼' : '▶'}
              </span>
            </div>
          </div>

          {expandedSegment === segment.id && segmentHasPlans(segment) && (
            <div className="p-4 border-t border-gray-200 bg-white">
              <h4 className="font-medium text-gray-800 mb-3">Existing Plans:</h4>
              {getSegmentPlans(segment).map((plan, planIndex) => {
                const detailKey = `${segment.id}-${planIndex}`;
                const isDetailedViewOpen = detailedPlanView[detailKey];
                
                return (
                  <div key={planIndex} className="mb-4 last:mb-0">
                    <div className="bg-blue-50 p-3 rounded">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <span className="text-sm font-medium text-blue-800">
                            Plan {planIndex + 1}: {plan.type || 'Unknown Type'}
                          </span>
                        </div>
                        {planDetailsLoading && (
                          <span className="text-gray-400">⟳</span>
                        )}
                      </div>

                      <div className="mt-3">
                        {isDetailedViewOpen ? (
                          <div>
                            <DetailedPlanView 
                              segmentId={segment.id} 
                              planIndex={planIndex} 
                              plan={plan}
                            />
                            <div className="mt-2 flex justify-end">
                              <button
                                onClick={() => handleEditPlan(segment.id, planIndex)}
                                className="text-xs bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600"
                              >
                                Edit Plan
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="text-sm text-gray-500">Loading plan details...</div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          
          {expandedSegment === segment.id && !segmentHasPlans(segment) && (
            <div className="p-4 border-t border-gray-200 bg-gray-50">
              <p className="text-sm text-gray-500 italic">No plans created for this segment yet.</p>
            </div>
          )}

          {expandedSegmentForPlan === segment.id && (
            <div className="p-4 border-t-2 border-blue-200 bg-blue-50">
              <h4 className="font-medium text-blue-800 mb-3">
                {editingPlan ? 'Edit Diet Plan' : 'Create New Diet Plan'}
              </h4>
              <InlineSegmentDietPlannerForm
                segment={segment}
                onSavePlan={(plan) => {
                  handleSaveSegmentPlan(plan);
                  setExpandedSegmentForPlan(null);
                }}
                onCancel={() => {
                  setExpandedSegmentForPlan(null);
                  setEditingPlan(null);
                  setEditingSegmentId(null);
                  setEditingPlanIndex(null);
                }}
                loading={loading}
                groceryItems={groceryItems}
                getAllowedUnits={getAllowedUnits}
                editingPlan={editingPlan}
                isEditing={!!editingPlan}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  </div>
)}


{showModal && selectedUserIndex !== null && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-xl w-full mx-4 max-h-[90vh] overflow-y-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Create Diet Plan</h2>
        <button
          onClick={() => setShowModal(false)}
          className="text-gray-500 hover:text-gray-800 text-xl"
        >
          ×
        </button>
      </div>
      <DietPlannerForm
        userInfo={userInfoList[selectedUserIndex]}
        onSavePlan={(plan) => {
          handleSavePlan(plan);
          setShowModal(false);
        }}
        loading={loading}
        groceryItems={groceryItems}
        getAllowedUnits={getAllowedUnits}
      />
    </div>
  </div>
)}
  </div>
);
}; 
const PlanDetails = ({ plan, segmentData }) => {
  return (
    <div>
      <div className="mb-3">
        <h3 className="font-semibold text-lg">{plan.userType} - {plan.role} ({plan.dietType})</h3>
        <p className="text-sm text-gray-700">Plan Frequency: {plan.formType}</p>
        {plan.days && plan.days.length > 0 && (
          <p className="text-sm text-gray-700">Days: {plan.days.join(', ')}</p>
        )}
        {plan.apiResponse && (
          <p className="text-xs text-green-600 mt-1">✓ Saved to server successfully</p>
        )}
      </div>
      
      <div className="mt-4">
        <h4 className="font-medium text-gray-800 mb-2">Items Required:</h4>
        <div className="overflow-hidden rounded border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {plan.items.map((item, i) => (
                <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                  <td className="px-4 py-3 text-sm text-gray-900">{item.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{item.quantity}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{item.unit}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const SegmentDietPlannerForm = ({ segment, onSavePlan, loading, groceryItems, getAllowedUnits }) => {
  const [formType, setFormType] = useState('per-day');
  const [items, setItems] = useState([{ name: '', quantity: '', unit: 'gram' }]);
  const [days, setDays] = useState([]);

  const handleItemChange = (index, e) => {
    const { name, value } = e.target;
    const newItems = [...items];
    newItems[index][name] = value;
    setItems(newItems);
  };

  const addItem = () => setItems([...items, { name: '', quantity: '', unit: 'gram' }]);
  const removeItem = (index) => setItems(items.filter((_, i) => i !== index));

  const toggleDay = (day) => {
    setDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const handleSave = () => {
    if (items.some(item => !item.name || !item.quantity)) {
      alert('Please fill all item fields');
      return;
    }
    if (formType === 'per-week' && days.length === 0) {
      alert('Select at least one day');
      return;
    }
    
    // Validate quantities are numbers
    if (items.some(item => isNaN(parseInt(item.quantity)) || parseInt(item.quantity) <= 0)) {
      alert('Please enter valid quantities (numbers greater than 0)');
      return;
    }
    
    const plan = { formType, items, ...(formType === 'per-week' && { days }) };
    onSavePlan(plan);
    setItems([{ name: '', quantity: '', unit: 'gram' }]);
    setDays([]);
  };

  const allDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  return (
    <div>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Select Plan Type</label>
        <div className="flex gap-4">
          <label className="flex items-center gap-2">
            <input 
              type="radio" 
              value="per-day" 
              checked={formType === 'per-day'} 
              onChange={() => setFormType('per-day')}
              disabled={loading}
            /> 
            Per Day
          </label>
          <label className="flex items-center gap-2">
            <input 
              type="radio" 
              value="per-week" 
              checked={formType === 'per-week'} 
              onChange={() => setFormType('per-week')}
              disabled={loading}
            /> 
            Per Week
          </label>
          <label className="flex items-center gap-2">
            <input 
              type="radio" 
              value="per-month" 
              checked={formType === 'per-month'} 
              onChange={() => setFormType('per-month')}
              disabled={loading}
            /> 
            Per Month
          </label>
        </div>
      </div>

      {formType === 'per-week' && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Select Days</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {allDays.map((day) => (
              <label key={day} className="flex items-center">
                <input
                  type="checkbox"
                  checked={days.includes(day)}
                  onChange={() => toggleDay(day)}
                  className="mr-2"
                  disabled={loading}
                />
                {day}
              </label>
            ))}
          </div>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Items Required per Person</label>
        {items.map((item, index) => (
          <div key={index} className="flex gap-2 mb-2 text-sm">
            <select
              name="name"
              value={item.name}
              onChange={(e) => handleItemChange(index, e)}
              className="w-1/3 border px-2 py-1 rounded"
              disabled={loading}
            >
       <option value="">Select item</option>
{groceryItems.map((option) => (
  <option key={option.id} value={option.name}>{option.name}</option>
))}
            </select>
            <input
              type="number"
              name="quantity"
              value={item.quantity}
              onChange={(e) => handleItemChange(index, e)}
              placeholder="Qty"
              className="w-1/4 border px-2 py-1 rounded"
              min="1"
              disabled={loading}
            />
      <select
  name="unit"
  value={item.unit}
  onChange={(e) => handleItemChange(index, e)}
  className="w-1/4 border px-2 py-1 rounded"
  disabled={loading}
>
  {getAllowedUnits(item.name).map(unitOption => (
    <option key={unitOption} value={unitOption}>
      {unitOption === 'gram' ? 'Grams' : 
       unitOption === 'ml' ? 'Ml' : 
       unitOption === 'piece' ? 'Pcs' : 
       unitOption === 'kg' ? 'Kg' : 
       unitOption === 'L' ? 'L' : unitOption}
    </option>
  ))}
</select>
            {index > 0 && (
              <button 
                onClick={() => removeItem(index)} 
                className="bg-red-500 text-white px-2 rounded hover:bg-red-600 disabled:opacity-50"
                disabled={loading}
              >
                ×
              </button>
            )}
          </div>
        ))}
        <button
          onClick={addItem}
          className="mt-2 bg-blue-500 text-white px-4 py-1 rounded hover:bg-blue-600 disabled:opacity-50"
          disabled={loading}
        >
          Add Item
        </button>
      </div>

      <div className="mt-6 flex justify-end space-x-3">
        <button
          onClick={() => {
            setItems([{ name: '', quantity: '', unit: 'gram' }]);
            setDays([]);
          }}
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 disabled:opacity-50"
          disabled={loading}
        >
          Reset
        </button>
        <button
          onClick={handleSave}
          className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 disabled:opacity-50 flex items-center space-x-2"
          disabled={loading}
        >
          {loading && (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          )}
          <span>{loading ? 'Saving...' : 'Create Plan'}</span>
        </button>
      </div>
    </div>
  );
};

const DietPlannerForm = ({ userInfo, onSavePlan, loading, groceryItems, getAllowedUnits }) => {
  const [formType, setFormType] = useState('per-day');
  const [items, setItems] = useState([{ name: '', quantity: '', unit: 'gram' }]);
  const [days, setDays] = useState([]);

  const handleItemChange = (index, e) => {
    const { name, value } = e.target;
    const newItems = [...items];
    newItems[index][name] = value;
    setItems(newItems);
  };

  const addItem = () => setItems([...items, { name: '', quantity: '', unit: 'gram' }]);
  const removeItem = (index) => setItems(items.filter((_, i) => i !== index));

  const toggleDay = (day) => {
    setDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const handleSave = () => {
    if (items.some(item => !item.name || !item.quantity)) {
      alert('Please fill all item fields');
      return;
    }
    if (formType === 'per-week' && days.length === 0) {
      alert('Select at least one day');
      return;
    }
    
    // Validate quantities are numbers
    if (items.some(item => isNaN(parseInt(item.quantity)) || parseInt(item.quantity) <= 0)) {
      alert('Please enter valid quantities (numbers greater than 0)');
      return;
    }
    
    const plan = { formType, items, ...(formType === 'per-week' && { days }) };
    onSavePlan(plan);
    setItems([{ name: '', quantity: '', unit: 'gram' }]);
    setDays([]);
  };

  const allDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  return (
    <div>
      {/* Display user segment data in form */}
      {userInfo.segmentData && (
        <div className="mb-4 p-3 bg-green-50 rounded border border-green-200">
          <h4 className="font-medium text-green-800 mb-2">User Segment Data:</h4>
          <p className="text-sm text-green-700">
            {userInfo.type} - {userInfo.role} ({userInfo.dietType === 'veg' ? 'Vegetarian' : 'Non-Vegetarian'})
          </p>
          <p className="text-xs text-blue-600">Segment ID: {userInfo.segmentId}</p>
          {userInfo.segmentData.error === false && (
            <p className="text-xs text-green-600 mt-1">✓ Segment data loaded successfully</p>
          )}
        </div>
      )}

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Select Plan Type</label>
        <div className="flex gap-4">
          <label className="flex items-center gap-2">
            <input 
              type="radio" 
              value="per-day" 
              checked={formType === 'per-day'} 
              onChange={() => setFormType('per-day')}
              disabled={loading}
            /> 
            Per Day
          </label>
          <label className="flex items-center gap-2">
            <input 
              type="radio" 
              value="per-week" 
              checked={formType === 'per-week'} 
              onChange={() => setFormType('per-week')}
              disabled={loading}
            /> 
            Per Week
          </label>
          <label className="flex items-center gap-2">
            <input 
              type="radio" 
              value="per-month" 
              checked={formType === 'per-month'} 
              onChange={() => setFormType('per-month')}
              disabled={loading}
            /> 
            Per Month
          </label>
        </div>
      </div>

      {formType === 'per-week' && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Select Days</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {allDays.map((day) => (
              <label key={day} className="flex items-center">
                <input
                  type="checkbox"
                  checked={days.includes(day)}
                  onChange={() => toggleDay(day)}
                  className="mr-2"
                  disabled={loading}
                />
                {day}
              </label>
            ))}
          </div>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Items Required per Person</label>
        {items.map((item, index) => (
          <div key={index} className="flex gap-2 mb-2 text-sm">
            <select
              name="name"
              value={item.name}
              onChange={(e) => handleItemChange(index, e)}
              className="w-1/3 border px-2 py-1 rounded"
              disabled={loading}
            >
         <option value="">Select item</option>
{groceryItems.map((option) => (
  <option key={option.id} value={option.name}>{option.name}</option>
))}
            </select>
            <input
              type="number"
              name="quantity"
              value={item.quantity}
              onChange={(e) => handleItemChange(index, e)}
              placeholder="Qty"
              className="w-1/4 border px-2 py-1 rounded"
              min="1"
              disabled={loading}
            />
     <select
  name="unit"
  value={item.unit}
  onChange={(e) => handleItemChange(index, e)}
  className="w-1/4 border px-2 py-1 rounded"
  disabled={loading}
>
  {getAllowedUnits(item.name).map(unitOption => (
    <option key={unitOption} value={unitOption}>
      {unitOption === 'gram' ? 'Grams' : 
       unitOption === 'ml' ? 'Ml' : 
       unitOption === 'piece' ? 'Pcs' : 
       unitOption === 'kg' ? 'Kg' : 
       unitOption === 'L' ? 'L' : unitOption}
    </option>
  ))}
</select>
            {index > 0 && (
              <button 
                onClick={() => removeItem(index)} 
                className="bg-red-500 text-white px-2 rounded hover:bg-red-600 disabled:opacity-50"
                disabled={loading}
              >
                ×
              </button>
            )}
          </div>
        ))}
        <button
          onClick={addItem}
          className="mt-2 bg-blue-500 text-white px-4 py-1 rounded hover:bg-blue-600 disabled:opacity-50"
          disabled={loading}
        >
          Add Item
        </button>
      </div>

      <div className="mt-6 flex justify-end space-x-3">
        <button
          onClick={() => {
            setItems([{ name: '', quantity: '', unit: 'gram' }]);
            setDays([]);
          }}
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 disabled:opacity-50"
          disabled={loading}
        >
          Reset
        </button>
        <button
          onClick={handleSave}
          className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 disabled:opacity-50 flex items-center space-x-2"
          disabled={loading}
        >
          {loading && (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          )}
          <span>{loading ? 'Saving...' : 'Create Plan'}</span>
        </button>
      </div>
    </div>
  );
};

export default DietPlanner;