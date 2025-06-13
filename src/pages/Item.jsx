import React, { useState, useEffect } from 'react';

const categoryItemsMap = {
    Food: ['Rice', 'Dal', 'Oil', 'Sugar', 'Salt'],
    Housekeeping: ['Phenyl', 'Detergent', 'Mop', 'Broom', 'Toilet Cleaner'],
    Vegetables: ['Tomato', 'Onion', 'Brinjal', 'Carrot', 'Beans', 'Cabbage', 'Cauliflower', 'Potato', 'Drumstick', 'Snake Gourd'],
    Meat: ['Mutton', 'Chicken', 'Fish']
};

const units = ['Kg', 'Litre', 'Nos', 'Packets', 'Box'];
const discounts = [5, 10, 15, 20];
const gstRates = [0, 5, 12, 18];

const Items = () => {
    const [selectedCategory, setSelectedCategory] = useState('Food');
    const [items, setItems] = useState([]);
    const [newItem, setNewItem] = useState(null);
    const [foodItems, setFoodItems] = useState([]);
    const [editedItem, setEditedItem] = useState(null);  // 👈 Add this
    const [editIndex, setEditIndex] = useState(null);    // 👈 Add this


    const handleCategoryClick = (category) => {
        setSelectedCategory(category === selectedCategory ? '' : category);
        setNewItem(null);
    };

    const handleAddRow = () => {
        setNewItem({
            item: '',
            unit: '',
            gst: '',
            discount: ''
        });
    };

    const handleSaveRow = () => {
        if (newItem?.item?.trim()) {
            setItems([...items, newItem]);
            setNewItem(null);
        }
    };

    const handleInputChange = (field, value) => {
        setNewItem((prev) => ({ ...prev, [field]: value }));
    };

    useEffect(() => {
        const fetchFoodItems = async () => {
            try {
                const token = localStorage.getItem('authToken');
                const response = await fetch('https://rcs-dms.onlinetn.com/api/v1/segment/items', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                });

                const result = await response.json();
                if (!result.error && Array.isArray(result.data)) {
                    const foodList = result.data.map(item => item.name);
                    setFoodItems(foodList);
                }
            } catch (err) {
                console.error('Error fetching food items:', err);
            }
        };

        fetchFoodItems();
    }, []);

    const selectedItems = selectedCategory === 'Food' ? foodItems : (categoryItemsMap[selectedCategory] || []);

    return (
        <div className="p-6">
            <h2 className="text-xl font-bold text-blue-800 mb-4">Select Category</h2>

            <div className="flex flex-wrap gap-3 mb-6">
                {Object.keys(categoryItemsMap).map((category) => (
                    <button
                        key={category}
                        onClick={() => handleCategoryClick(category)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium border shadow-sm transition ${selectedCategory === category
                            ? 'bg-blue-600 text-white'
                            : 'bg-white text-blue-700 border-blue-400 hover:bg-blue-100'
                            }`}
                    >
                        {category}
                    </button>
                ))}
            </div>

            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">{selectedCategory} Items</h3>
                {!newItem && (
                    <button
                        onClick={handleAddRow}
                        className="bg-blue-600 text-white px-4 py-2 text-sm rounded shadow"
                    >
                        + Add Item
                    </button>
                )}
            </div>

            <div className={`flex gap-6 ${newItem ? 'items-start' : ''}`}>
                {/* Table - shrinks if form is open */}
                <div className={`${newItem ? 'w-2/3' : 'w-full'}`}>
                    <table className="w-full table-auto border border-gray-300 text-sm mb-8">
                        <thead>
                            <tr className="bg-gray-100 text-left">
                                <th className="border px-4 py-2">Item</th>
                                <th className="border px-4 py-2">Unit</th>
                                <th className="border px-4 py-2">GST (%)</th>
                                <th className="border px-4 py-2">Discount (%)</th>
                                <th className="border px-4 py-2">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {selectedCategory === 'Food' && foodItems.length > 0 ? (
                                foodItems.map((item, index) => (
                                    <tr key={index}>
                                        <td className="border px-4 py-2">{item}</td>
                                        <td className="border px-4 py-2"></td>
                                        <td className="border px-4 py-2"></td>
                                        <td className="border px-4 py-2"></td>
                                        <td className="border px-4 py-2">
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => {
                                                        setEditIndex(index);
                                                        setEditedItem({ ...items[index] }); // ✅ access row from items using index
                                                        setNewItem(null);
                                                    }}
                                                    className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
                                                >
                                                    Edit
                                                </button>


                                                <button
                                                    className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </td>

                                    </tr>
                                ))
                            ) : (
                                items.map((row, index) => (
                                    <tr key={index}>
                                        <td className="border px-4 py-2">{row.item}</td>
                                        <td className="border px-4 py-2">{row.unit}</td>
                                        <td className="border px-4 py-2">{row.gst}</td>
                                        <td className="border px-4 py-2">{row.discount}</td>
                                        <td className="border px-4 py-2 space-x-2">
                                            <button className="text-blue-600 text-sm font-medium hover:underline">Edit</button>
                                            <button className="text-red-600 text-sm font-medium hover:underline">Delete</button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Add Item Form Card */}
                {(newItem || editedItem) && (
                   <div className="w-1/3 bg-white p-4 border border-gray-300 rounded-xl shadow relative max-h-[420px] overflow-y-auto">

                        <button
                            onClick={() => {
                                setNewItem(null);
                                setEditedItem(null);
                                setEditIndex(null);
                            }}
                            className="absolute top-2 right-2 text-gray-500 hover:text-red-500 text-lg font-bold"
                            title="Close"
                        >
                            ✖
                        </button>

                        <h4 className="text-md font-bold text-gray-700 mb-4">
                            {editedItem ? 'Edit Item' : 'Add New Item'}
                        </h4>

                        <div className="space-y-4 text-sm">
                            <div>
                                <label className="block font-medium text-gray-600 mb-1">Item</label>
                                <input
                                    type="text"
                                    value={editedItem ? editedItem.item : newItem.item}
                                    onChange={(e) =>
                                        editedItem
                                            ? setEditedItem({ ...editedItem, item: e.target.value })
                                            : setNewItem({ ...newItem, item: e.target.value })
                                    }
                                    className="w-full border px-3 py-2 rounded"
                                />
                            </div>

                            <div>
                                <label className="block font-medium text-gray-600 mb-1">Unit</label>
                                <select
                                    value={editedItem ? editedItem.unit : newItem.unit}
                                    onChange={(e) =>
                                        editedItem
                                            ? setEditedItem({ ...editedItem, unit: e.target.value })
                                            : setNewItem({ ...newItem, unit: e.target.value })
                                    }
                                    className="w-full border px-3 py-2 rounded"
                                >
                                    <option value="">Select Unit</option>
                                    {units.map((unit, i) => (
                                        <option key={i} value={unit}>{unit}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block font-medium text-gray-600 mb-1">GST (%)</label>
                                <select
                                    value={editedItem ? editedItem.gst : newItem.gst}
                                    onChange={(e) =>
                                        editedItem
                                            ? setEditedItem({ ...editedItem, gst: e.target.value })
                                            : setNewItem({ ...newItem, gst: e.target.value })
                                    }
                                    className="w-full border px-3 py-2 rounded"
                                >
                                    <option value="">Select GST</option>
                                    {gstRates.map((gst, i) => (
                                        <option key={i} value={gst}>{gst}%</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block font-medium text-gray-600 mb-1">Discount (%)</label>
                                <select
                                    value={editedItem ? editedItem.discount : newItem.discount}
                                    onChange={(e) =>
                                        editedItem
                                            ? setEditedItem({ ...editedItem, discount: e.target.value })
                                            : setNewItem({ ...newItem, discount: e.target.value })
                                    }
                                    className="w-full border px-3 py-2 rounded"
                                >
                                    <option value="">Select Discount</option>
                                    {discounts.map((disc, i) => (
                                        <option key={i} value={disc}>{disc}%</option>
                                    ))}
                                </select>
                            </div>

                            <button
                                onClick={() => {
                                    if (editedItem) {
                                        const updated = [...items];
                                        updated[editIndex] = editedItem;
                                        setItems(updated);
                                        setEditedItem(null);
                                        setEditIndex(null);
                                    } else {
                                        handleSaveRow();
                                    }
                                }}
                                className="w-full bg-blue-600 text-white py-2 rounded mt-4"
                            >
                                {editedItem ? 'Save Changes' : 'Add Item'}
                            </button>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};

export default Items;
