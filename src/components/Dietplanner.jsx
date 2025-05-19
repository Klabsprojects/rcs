import React, { useState } from 'react';

const DietPlanner = () => {
  const [userInfo, setUserInfo] = useState({
    type: 'A', // Default to 'A' class prisoner
    role: ''
  });
  
  const [showDietPlanner, setShowDietPlanner] = useState(false);
  
  const handleUserInfoChange = (e) => {
    const { name, value } = e.target;
    setUserInfo({
      ...userInfo,
      [name]: value
    });
  };
  
  const handleSubmitUserInfo = () => {
    if (!userInfo.role.trim()) {
      alert('Please enter a role');
      return;
    }
    setShowDietPlanner(true);
  };
  
  const handleBack = () => {
    setShowDietPlanner(false);
  };
  
  return (
    <div className="max-w-6xl mx-auto">
      {/* Eye-catching header */}
      {/* <div className="bg-blue-100 p-6 mb-6 shadow-md rounded-b-lg">
        <h1 className="text-4xl font-bold text-center text-blue-800">Prison Diet Planner</h1>
      </div> */}
      
      {!showDietPlanner ? (
        <UserInfoForm 
          userInfo={userInfo} 
          onInputChange={handleUserInfoChange} 
          onSubmit={handleSubmitUserInfo} 
        />
      ) : (
        <DietPlannerForm userInfo={userInfo} onBack={handleBack} />
      )}
    </div>
  );
};

const UserInfoForm = ({ userInfo, onInputChange, onSubmit }) => {
  return (
    <div className="mb-8 p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-semibold mb-6 text-center">Select Prisoner Information</h2>
      
      <div className="mb-4">
        <label className="block mb-2 font-medium">Prisoner Class</label>
        <select
          name="type"
          value={userInfo.type}
          onChange={onInputChange}
          className="w-full p-3 border rounded-lg focus:ring focus:ring-blue-300"
        >
          <option value="A">A Class Prisoner</option>
          <option value="B">B Class Prisoner</option>
        </select>
      </div>
      
      <div className="mb-6">
        <label className="block mb-2 font-medium">Role</label>
        <input
          type="text"
          name="role"
          value={userInfo.role}
          onChange={onInputChange}
          className="w-full p-3 border rounded-lg focus:ring focus:ring-blue-300"
          placeholder="Enter role"
        />
      </div>
      
      <button
        onClick={onSubmit}
        className="w-full p-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-colors"
      >
        Create Diet Plan
      </button>
    </div>
  );
};

const DietPlannerForm = ({ userInfo, onBack }) => {
  // State for form type selection
  const [formType, setFormType] = useState('diet-chart');

  // State for form inputs
  const [dietChartInputs, setDietChartInputs] = useState({
    dietType: 'veg',
    items: [{ name: '', quantity: '', unit: 'gram' }]
  });

  const [perDayInputs, setPerDayInputs] = useState({
    dietType: 'veg',
    days: [],
    items: [{ name: '', quantity: '', unit: 'gram' }]
  });

  const [perWeekInputs, setPerWeekInputs] = useState({
    dietType: 'veg',
    items: [{ name: '', quantity: '', unit: 'gram' }]
  });

  // State for stored cards
  const [dietChartCards, setDietChartCards] = useState([]);
  const [perDayCards, setPerDayCards] = useState([]);
  const [perWeekCards, setPerWeekCards] = useState([]);

  // Handle radio button change
  const handleFormTypeChange = (e) => {
    setFormType(e.target.value);
  };

  // Diet Chart handlers
  const handleDietChartInputChange = (e) => {
    const { name, value } = e.target;
    setDietChartInputs({
      ...dietChartInputs,
      [name]: value
    });
  };

  const handleDietChartItemChange = (index, e) => {
    const { name, value } = e.target;
    const updatedItems = [...dietChartInputs.items];
    updatedItems[index] = {
      ...updatedItems[index],
      [name]: value
    };

    setDietChartInputs({
      ...dietChartInputs,
      items: updatedItems
    });
  };

  const addDietChartItem = () => {
    setDietChartInputs({
      ...dietChartInputs,
      items: [...dietChartInputs.items, { name: '', quantity: '', unit: 'gram' }]
    });
  };

  const removeDietChartItem = (index) => {
    const updatedItems = [...dietChartInputs.items];
    updatedItems.splice(index, 1);
    setDietChartInputs({
      ...dietChartInputs,
      items: updatedItems
    });
  };

  // Per Day handlers
  const handlePerDayInputChange = (e) => {
    const { name, value } = e.target;
    setPerDayInputs({
      ...perDayInputs,
      [name]: value
    });
  };

  const handlePerDayItemChange = (index, e) => {
    const { name, value } = e.target;
    const updatedItems = [...perDayInputs.items];
    updatedItems[index] = {
      ...updatedItems[index],
      [name]: value
    };

    setPerDayInputs({
      ...perDayInputs,
      items: updatedItems
    });
  };

  const addPerDayItem = () => {
    setPerDayInputs({
      ...perDayInputs,
      items: [...perDayInputs.items, { name: '', quantity: '', unit: 'gram' }]
    });
  };

  const removePerDayItem = (index) => {
    const updatedItems = [...perDayInputs.items];
    updatedItems.splice(index, 1);
    setPerDayInputs({
      ...perDayInputs,
      items: updatedItems
    });
  };

  const handleDaysChange = (day) => {
    const updatedDays = [...perDayInputs.days];
    if (updatedDays.includes(day)) {
      const index = updatedDays.indexOf(day);
      updatedDays.splice(index, 1);
    } else {
      updatedDays.push(day);
    }
    setPerDayInputs({
      ...perDayInputs,
      days: updatedDays
    });
  };

  const handleAllDaysChange = () => {
    if (perDayInputs.days.length === 7) {
      setPerDayInputs({
        ...perDayInputs,
        days: []
      });
    } else {
      setPerDayInputs({
        ...perDayInputs,
        days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
      });
    }
  };

  // Per Week handlers
  const handlePerWeekInputChange = (e) => {
    const { name, value } = e.target;
    setPerWeekInputs({
      ...perWeekInputs,
      [name]: value
    });
  };

  const handlePerWeekItemChange = (index, e) => {
    const { name, value } = e.target;
    const updatedItems = [...perWeekInputs.items];
    updatedItems[index] = {
      ...updatedItems[index],
      [name]: value
    };

    setPerWeekInputs({
      ...perWeekInputs,
      items: updatedItems
    });
  };

  const addPerWeekItem = () => {
    setPerWeekInputs({
      ...perWeekInputs,
      items: [...perWeekInputs.items, { name: '', quantity: '', unit: 'gram' }]
    });
  };

  const removePerWeekItem = (index) => {
    const updatedItems = [...perWeekInputs.items];
    updatedItems.splice(index, 1);
    setPerWeekInputs({
      ...perWeekInputs,
      items: updatedItems
    });
  };

  // Form submission
  const handleSubmit = () => {
    switch (formType) {
      case 'diet-chart':
        if (dietChartInputs.items.some(item => item.name.trim() === '' || item.quantity.trim() === '')) {
          alert('Please fill all fields for Diet Chart');
          return;
        }

        setDietChartCards([...dietChartCards, { 
          ...dietChartInputs,
          prisonerClass: userInfo.type,
          role: userInfo.role
        }]);

        // Reset form
        setDietChartInputs({
          dietType: 'veg',
          items: [{ name: '', quantity: '', unit: 'gram' }]
        });
        break;

      case 'per-day':
        if (perDayInputs.days.length === 0 || perDayInputs.items.some(item => item.name.trim() === '' || item.quantity.trim() === '')) {
          alert('Please fill all fields and select at least one day');
          return;
        }

        setPerDayCards([...perDayCards, { 
          ...perDayInputs,
          prisonerClass: userInfo.type,
          role: userInfo.role
        }]);

        // Reset form
        setPerDayInputs({
          dietType: 'veg',
          days: [],
          items: [{ name: '', quantity: '', unit: 'gram' }]
        });
        break;

      case 'per-week':
        if (perWeekInputs.items.some(item => item.name.trim() === '' || item.quantity.trim() === '')) {
          alert('Please fill all fields for Week Plan');
          return;
        }

        setPerWeekCards([...perWeekCards, { 
          ...perWeekInputs,
          prisonerClass: userInfo.type,
          role: userInfo.role
        }]);

        // Reset form
        setPerWeekInputs({
          dietType: 'veg',
          items: [{ name: '', quantity: '', unit: 'gram' }]
        });
        break;

      default:
        break;
    }
  };

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <button 
          onClick={onBack}
          className="p-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          Back
        </button>
        <div className="text-right">
          <h3 className="text-lg font-semibold">{userInfo.type} Class Prisoner</h3>
          <p>Role: {userInfo.role}</p>
        </div>
      </div>

      {/* Dynamic Form */}
      <div className="mb-8 p-6 bg-white shadow-md rounded-lg">
        {/* Form type selection */}
        <div className="mb-6 p-4 bg-gray-100 rounded-lg">
          <h2 className="text-xl font-semibold mb-3 text-center">Select Plan Type</h2>
          <div className="flex flex-wrap justify-center gap-4">
            <label className="inline-flex items-center">
              <input
                type="radio"
                className="h-4 w-4"
                name="formType"
                value="diet-chart"
                checked={formType === 'diet-chart'}
                onChange={handleFormTypeChange}
              />
              <span className="ml-2">Meal</span>
            </label>

            <label className="inline-flex items-center">
              <input
                type="radio"
                className="h-4 w-4"
                name="formType"
                value="per-day"
                checked={formType === 'per-day'}
                onChange={handleFormTypeChange}
              />
              <span className="ml-2">Day</span>
            </label>

            <label className="inline-flex items-center">
              <input
                type="radio"
                className="h-4 w-4"
                name="formType"
                value="per-week"
                checked={formType === 'per-week'}
                onChange={handleFormTypeChange}
              />
              <span className="ml-2">Week</span>
            </label>
          </div>
        </div>
        
        {/* Diet Chart Form */}
        {formType === 'diet-chart' && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Diet Chart</h2>

            <div className="mb-4">
              <label className="block mb-1">Diet Type</label>
              <select
                name="dietType"
                value={dietChartInputs.dietType}
                onChange={handleDietChartInputChange}
                className="w-full p-2 border rounded"
              >
                <option value="veg">Vegetarian</option>
                <option value="non-veg">Non-Vegetarian</option>
                <option value="both">Both</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="block mb-2">Items required for per Person</label>
              {dietChartInputs.items.map((item, index) => (
                <div key={index} className="flex mb-2 gap-2">
                  <input
                    type="text"
                    name="name"
                    value={item.name}
                    onChange={(e) => handleDietChartItemChange(index, e)}
                    className="w-full p-2 border rounded"
                    placeholder="Item name"
                  />
                  <div className="flex w-full">
                    <input
                      type="text"
                      name="quantity"
                      value={item.quantity}
                      onChange={(e) => handleDietChartItemChange(index, e)}
                      className="w-3/5 p-2 border rounded-l"
                      placeholder="Quantity"
                    />
                    <select
                      name="unit"
                      value={item.unit}
                      onChange={(e) => handleDietChartItemChange(index, e)}
                      className="w-2/5 p-2 border border-l-0 rounded-r"
                    >
                      <option value="gram">Grm</option>
                      <option value="ml">Ml</option>
                      <option value="piece">Pcs</option>
                      <option value="L">L</option>
                      <option value="kg">KG</option>
                    </select>
                  </div>
                  {index > 0 && (
                    <button
                      type="button"
                      onClick={() => removeDietChartItem(index)}
                      className="p-2 bg-red-500 text-white rounded"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addDietChartItem}
                className="mt-2 p-2 bg-blue-500 text-white rounded"
              >
                Add Item
              </button>
            </div>
          </div>
        )}

        {/* Per Day Form */}
        {formType === 'per-day' && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Per Day Plan</h2>

            <div className="mb-4">
              <label className="block mb-1">Diet Type</label>
              <select
                name="dietType"
                value={perDayInputs.dietType}
                onChange={handlePerDayInputChange}
                className="w-full p-2 border rounded"
              >
                <option value="veg">Vegetarian</option>
                <option value="non-veg">Non-Vegetarian</option>
                <option value="both">Both</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="block mb-2">Days</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    checked={perDayInputs.days.length === 7}
                    onChange={handleAllDaysChange}
                    className="h-4 w-4"
                  />
                  <span className="ml-2">All Days</span>
                </label>

                {days.map((day) => (
                  <label key={day} className="inline-flex items-center">
                    <input
                      type="checkbox"
                      checked={perDayInputs.days.includes(day)}
                      onChange={() => handleDaysChange(day)}
                      className="h-4 w-4"
                    />
                    <span className="ml-2">{day}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <label className="block mb-2">Items</label>
              {perDayInputs.items.map((item, index) => (
                <div key={index} className="flex mb-2 gap-2">
                  <input
                    type="text"
                    name="name"
                    value={item.name}
                    onChange={(e) => handlePerDayItemChange(index, e)}
                    className="w-full p-2 border rounded"
                    placeholder="Item name"
                  />
                  <div className="flex w-full">
                    <input
                      type="text"
                      name="quantity"
                      value={item.quantity}
                      onChange={(e) => handlePerDayItemChange(index, e)}
                      className="w-3/5 p-2 border rounded-l"
                      placeholder="Quantity"
                    />
                    <select
                      name="unit"
                      value={item.unit}
                      onChange={(e) => handlePerDayItemChange(index, e)}
                      className="w-2/5 p-2 border border-l-0 rounded-r"
                    >
                      <option value="gram">Grm</option>
                      <option value="ml">Ml</option>
                      <option value="piece">Pcs</option>
                      <option value="L">L</option>
                      <option value="kg">KG</option>
                    </select>
                  </div>
                  {index > 0 && (
                    <button
                      type="button"
                      onClick={() => removePerDayItem(index)}
                      className="p-2 bg-red-500 text-white rounded"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addPerDayItem}
                className="mt-2 p-2 bg-blue-500 text-white rounded"
              >
                Add Item
              </button>
            </div>
          </div>
        )}

        {/* Per Week Form */}
        {formType === 'per-week' && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Weekly Plan</h2>

            <div className="mb-4">
              <label className="block mb-1">Diet Type</label>
              <select
                name="dietType"
                value={perWeekInputs.dietType}
                onChange={handlePerWeekInputChange}
                className="w-full p-2 border rounded"
              >
                <option value="veg">Vegetarian</option>
                <option value="non-veg">Non-Vegetarian</option>
                <option value="both">Both</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="block mb-2">Items</label>
              {perWeekInputs.items.map((item, index) => (
                <div key={index} className="flex mb-2 gap-2">
                  <input
                    type="text"
                    name="name"
                    value={item.name}
                    onChange={(e) => handlePerWeekItemChange(index, e)}
                    className="w-full p-2 border rounded"
                    placeholder="Item name"
                  />
                  <div className="flex w-full">
                    <input
                      type="text"
                      name="quantity"
                      value={item.quantity}
                      onChange={(e) => handlePerWeekItemChange(index, e)}
                      className="w-3/5 p-2 border rounded-l"
                      placeholder="Quantity"
                    />
                    <select
                      name="unit"
                      value={item.unit}
                      onChange={(e) => handlePerWeekItemChange(index, e)}
                      className="w-2/5 p-2 border border-l-0 rounded-r"
                    >
                      <option value="gram">Grm</option>
                      <option value="ml">Ml</option>
                      <option value="piece">Pcs</option>
                      <option value="L">L</option>
                      <option value="kg">KG</option>
                    </select>
                  </div>
                  {index > 0 && (
                    <button
                      type="button"
                      onClick={() => removePerWeekItem(index)}
                      className="p-2 bg-red-500 text-white rounded"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addPerWeekItem}
                className="mt-2 p-2 bg-blue-500 text-white rounded"
              >
                Add Item
              </button>
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={handleSubmit}
          className="w-full p-2 bg-green-600 text-white font-bold rounded mt-4"
        >
          Create
        </button>
      </div>

      {/* Cards Display */}
      <div className="mt-8">
        {/* Diet Chart Cards */}
        {dietChartCards.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Meal Plans</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {dietChartCards.map((card, index) => (
                <div key={index} className="bg-white p-4 rounded-lg shadow-md border-l-4 border-blue-500">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold">Class {card.prisonerClass} - {card.role}</h3>
                  </div>
                  <p>
                    <span className="font-semibold">Diet Type:</span>{" "}
                    {card.dietType === "veg"
                      ? "Vegetarian"
                      : card.dietType === "non-veg"
                      ? "Non-Vegetarian"
                      : "Both"}
                  </p>
                  <div className="mt-2">
                    <p className="font-semibold">Items:</p>
                    <ul className="list-disc ml-5">
                      {card.items.map((item, i) => (
                        <li key={i}>
                          {item.name} - {item.quantity} {item.unit}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Per Day Cards */}
        {perDayCards.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Daily Diet Plans</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {perDayCards.map((card, index) => (
                <div key={index} className="bg-white p-4 rounded-lg shadow-md border-l-4 border-green-500">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold">Class {card.prisonerClass} - {card.role}</h3>
                  </div>
                  <p>
                    <span className="font-semibold">Diet Type:</span>{" "}
                    {card.dietType === "veg"
                      ? "Vegetarian"
                      : card.dietType === "non-veg"
                      ? "Non-Vegetarian"
                      : "Both"}
                  </p>
                  <div className="mt-2">
                    <p className="font-semibold">Days:</p>
                    <p>{card.days.join(", ")}</p>
                  </div>
                  <div className="mt-2">
                    <p className="font-semibold">Items:</p>
                    <ul className="list-disc ml-5">
                      {card.items.map((item, i) => (
                        <li key={i}>
                          {item.name} - {item.quantity} {item.unit}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Per Week Cards */}
        {perWeekCards.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Weekly Diet Plans</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {perWeekCards.map((card, index) => (
                <div key={index} className="bg-white p-4 rounded-lg shadow-md border-l-4 border-purple-500">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold">Class {card.prisonerClass} - {card.role}</h3>
                  </div>
                  <p>
                    <span className="font-semibold">Diet Type:</span>{" "}
                    {card.dietType === "veg"
                      ? "Vegetarian"
                      : card.dietType === "non-veg"
                      ? "Non-Vegetarian"
                      : "Both"}
                  </p>
                  <div className="mt-2">
                    <p className="font-semibold">Items for the Week:</p>
                    <ul className="list-disc ml-5">
                      {card.items.map((item, i) => (
                        <li key={i}>
                          {item.name} - {item.quantity} {item.unit}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {dietChartCards.length === 0 && perDayCards.length === 0 && perWeekCards.length === 0 && (
          <div className="text-center text-gray-500">
            No diet plans created yet. Use the form above to create some!
          </div>
        )}
      </div>
    </div>
  );
};

export default DietPlanner;