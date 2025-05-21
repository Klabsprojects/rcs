import React, { useState } from 'react';

const groceryOptions = [
  "TOOR DAL", "BENGAL GRAM DAL", "URAD DAL", "MOONG DAL", "REFINED OIL",
  "TAMARIND", "CINNAMON", "CLOVES", "FENUGREEK", "MUSTARD", "PEPPERCORNS",
  "JEERA", "SOMPH", "CORAINDER POWDER", "TURMERIC POWDER", "SALT",
  "FRIED GRAM DAL", "RAVA", "ASAFOETIDA", "RED CHILLIES", "GARLIC", "DALDA",
  "WHEAT FLOUR", "SEMIYA", "PULSES", "SUKKU MALLI", "KARUPPU KATTY"
];

const DietPlanner = () => {
  const [userInfoList, setUserInfoList] = useState([]);
  const [selectedUserIndex, setSelectedUserIndex] = useState(null);
  const [expandedUserIndex, setExpandedUserIndex] = useState(null);
  const [formInputs, setFormInputs] = useState({ type: '', role: '', dietType: '' });
  const [showModal, setShowModal] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormInputs({ ...formInputs, [name]: value });
  };

  const handleUserCreation = () => {
    const { type, role, dietType } = formInputs;
    if (!type || !role || !dietType) {
      alert('Please fill all fields');
      return;
    }
    setUserInfoList([...userInfoList, { ...formInputs, plans: [] }]);
    setFormInputs({ type: '', role: '', dietType: '' });
  };

  const handleSavePlan = (plan) => {
    const updatedList = [...userInfoList];
    updatedList[selectedUserIndex].plans.push({
      ...plan,
      userType: userInfoList[selectedUserIndex].type,
      role: userInfoList[selectedUserIndex].role,
      dietType: userInfoList[selectedUserIndex].dietType
    });
    setUserInfoList(updatedList);
  };

  const handleViewPlan = (userIndex) => {
    setExpandedUserIndex(expandedUserIndex === userIndex ? null : userIndex);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="bg-sky-50 p-4 rounded shadow mb-6 flex gap-4 items-end">
        <div className="flex-1">
          <label className="block text-sm text-gray-700">User Type</label>
          <select
            name="type"
            value={formInputs.type}
            onChange={handleInputChange}
            className="w-full border px-3 py-2 rounded"
          >
            <option value="">Select User Type</option>
            <option value="Class A Prisoner">Class A Prisoner</option>
            <option value="Class B Prisoner">Class B Prisoner</option>
          </select>
        </div>
        <div className="flex-1">
          <label className="block text-sm text-gray-700">Segment Role</label>
          <select
            name="role"
            value={formInputs.role}
            onChange={handleInputChange}
            className="w-full border px-3 py-2 rounded"
          >
            <option value="">Select Segment Type</option>
            <option value="Labour">Labour</option>
            <option value="Non - Labour">Non - Labour</option>
          </select>
        </div>
        <div className="flex-1">
          <label className="block text-sm text-gray-700">Diet Type</label>
          <select
            name="dietType"
            value={formInputs.dietType}
            onChange={handleInputChange}
            className="w-full border px-3 py-2 rounded"
          >
            <option value="">Select</option>
            <option value="veg">Vegetarian</option>
            <option value="non-veg">Non-Vegetarian</option>
          </select>
        </div>
        <button
          onClick={handleUserCreation}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Create
        </button>
      </div>

      <div className="bg-white rounded shadow divide-y">
        {userInfoList.map((user, index) => (
          <div key={index}>
            <div 
              className="p-4 hover:bg-gray-100 cursor-pointer flex justify-between"
              onClick={() => setSelectedUserIndex(index)}
            >
              <div>
                <p className="font-semibold text-gray-800">{user.type} - {user.role} ({user.dietType})</p>
              </div>
              <div className="flex items-center">
                {user.plans.length > 0 ? (
                  <button
                    className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded hover:bg-blue-200"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewPlan(index);
                    }}
                  >
                    View Plan
                  </button>
                ) : (
                  <button
                    className="text-sm bg-green-100 text-green-700 px-3 py-1 rounded hover:bg-green-200"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedUserIndex(index);
                      setShowModal(true);
                    }}
                  >
                    Add Plan
                  </button>
                )}
              </div>
            </div>
            
            {/* Expanded plan details */}
            {expandedUserIndex === index && user.plans.length > 0 && (
              <div className="bg-gray-50 p-4 border-t border-gray-200">
                <PlanDetails plan={user.plans[0]} />
              </div>
            )}
          </div>
        ))}
      </div>

      {showModal && selectedUserIndex !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-xl w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Create Diet Plan</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-800"
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
            />
          </div>
        </div>
      )}
    </div>
  );
};

const PlanDetails = ({ plan }) => {
  return (
    <div>
      <div className="mb-3">
        <h3 className="font-semibold text-lg">{plan.userType} - {plan.role} ({plan.dietType})</h3>
        <p className="text-sm text-gray-700">Plan Frequency: {plan.formType}</p>
        {plan.days && plan.days.length > 0 && (
          <p className="text-sm text-gray-700">Days: {plan.days.join(', ')}</p>
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

const DietPlannerForm = ({ userInfo, onSavePlan }) => {
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
            <input type="radio" value="per-day" checked={formType === 'per-day'} onChange={() => setFormType('per-day')} /> Per Day
          </label>
          <label className="flex items-center gap-2">
            <input type="radio" value="per-week" checked={formType === 'per-week'} onChange={() => setFormType('per-week')} /> Per Week
          </label>
          <label className="flex items-center gap-2">
            <input type="radio" value="per-month" checked={formType === 'per-month'} onChange={() => setFormType('per-month')} /> Per Month
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
            >
              <option value="">Select item</option>
              {groceryOptions.map((option, idx) => (
                <option key={idx} value={option}>{option}</option>
              ))}
            </select>
            <input
              type="text"
              name="quantity"
              value={item.quantity}
              onChange={(e) => handleItemChange(index, e)}
              placeholder="Qty"
              className="w-1/4 border px-2 py-1 rounded"
            />
            <select
              name="unit"
              value={item.unit}
              onChange={(e) => handleItemChange(index, e)}
              className="w-1/4 border px-2 py-1 rounded"
            >
              <option value="gram">Grams</option>
              <option value="ml">Ml</option>
              <option value="piece">Pcs</option>
              <option value="kg">Kg</option>
              <option value="L">L</option>
            </select>
            {index > 0 && (
              <button onClick={() => removeItem(index)} className="bg-red-500 text-white px-2 rounded">×</button>
            )}
          </div>
        ))}
        <button
          onClick={addItem}
          className="mt-2 bg-blue-500 text-white px-4 py-1 rounded"
        >
          Add Item
        </button>
      </div>

      <div className="mt-4">
        <button
          onClick={handleSave}
          className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
        >
          Create Plan
        </button>
      </div>
    </div>
  );
};

export default DietPlanner;