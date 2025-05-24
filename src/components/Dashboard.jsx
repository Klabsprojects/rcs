import React, { useEffect, useState } from 'react';
import { Users, Utensils, CalendarDays, TrendingUp } from 'lucide-react';

const SimplifiedDashboard = () => {
  const [userName, setUserName] = useState('');

  useEffect(() => {
    // Parse user info from localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      setUserName(user.name || '');
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* Welcome Message */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Welcome, {userName}</h1>
      </div>

      {/* Add your stats or other dashboard elements here */}

    </div>
  );
};

export default SimplifiedDashboard;
