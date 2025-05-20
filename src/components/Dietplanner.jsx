// Updated Diet Planner UI with smaller item inputs and full user info in plan listing
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
  const [formInputs, setFormInputs] = useState({ type: '', role: '', dietType: '' });

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
            <option value="both">Both</option>
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
          <div
            key={index}
            className="p-4 hover:bg-gray-100 cursor-pointer flex justify-between"
            onClick={() => setSelectedUserIndex(index)}
          >
            <div>
              <p className="font-semibold text-gray-800">{user.type} - {user.role}</p>
              <p className="text-sm text-gray-600">Diet: {user.dietType}</p>
            </div>
            <p className="text-sm text-blue-600">Add Plan →</p>
          </div>
        ))}
      </div>

      {selectedUserIndex !== null && (
        <div className="mt-6">
          <DietPlannerForm
            userInfo={userInfoList[selectedUserIndex]}
            onSavePlan={handleSavePlan}
          />

          {userInfoList[selectedUserIndex].plans.length > 0 && (
            <div className="mt-6">
              <h3 className="text-xl font-semibold mb-4">Created Plans</h3>
              <div className="space-y-4">
                {userInfoList[selectedUserIndex].plans.map((plan, i) => (
                  <div key={i} className="p-4 border rounded bg-gray-50">
                    <p className="font-semibold text-gray-800">
                      {plan.userType} - {plan.role} ({plan.dietType})
                    </p>
                    <p className="text-sm text-gray-700 mt-1">Plan Type: {plan.formType}</p>
                    {plan.days && (
                      <p className="text-sm text-gray-600">Days: {plan.days.join(', ')}</p>
                    )}
                    <ul className="mt-2 list-disc ml-5 text-sm text-gray-700">
                      {plan.items.map((item, j) => (
                        <li key={j}>{item.name} - {item.quantity} {item.unit}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Define DietPlannerForm inside the same component file

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

  const addItem = () => {
    setItems([...items, { name: '', quantity: '', unit: 'gram' }]);
  };

  const removeItem = (index) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    setItems(newItems);
  };

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
    <div className="p-6 bg-white rounded shadow">
      <h2 className="text-lg font-semibold mb-4">Create Diet Plan</h2>

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
        <label className="block text-sm font-medium text-gray-700 mb-2">Items Required for per Person</label>
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
              <option value="gram">gram</option>
              <option value="ml">ml</option>
              <option value="piece">piece</option>
              <option value="kg">kg</option>
              <option value="L">L</option>
            </select>
            {index > 0 && (
              <button
                onClick={() => removeItem(index)}
                className="bg-red-500 text-white px-2 rounded"
              >
                ×
              </button>
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
