import React from 'react';
import { Users, Utensils, CalendarDays, TrendingUp } from 'lucide-react';

const SimplifiedDashboard = () => {
  // Dummy data for stats
  const statsData = [
    { title: 'Total Prisoners', value: '1,248', change: '+12%', icon: <Users size={24} />, color: 'bg-blue-500' },
    { title: 'Diet Plans Created', value: '376', change: '+8%', icon: <Utensils size={24} />, color: 'bg-green-500' },
    { title: 'Weekly Meal Plans', value: '42', change: '+16%', icon: <CalendarDays size={24} />, color: 'bg-purple-500' },
    { title: 'Food Budget', value: '$24,560', change: '+5%', icon: <TrendingUp size={24} />, color: 'bg-amber-500' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Users Management Dashboard</h1>
      </div>

      {/* Stats Cards */}
      {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsData.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <div className={`flex-shrink-0 rounded-md p-3 ${stat.color}`}>
                  <div className="text-white">
                    {stat.icon}
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    {stat.title}
                  </dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">
                      {stat.value}
                    </div>
                    <div className="ml-2 flex items-baseline text-sm font-semibold text-green-600">
                      {stat.change}
                    </div>
                  </dd>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div> */}
    </div>
  );
};

export default SimplifiedDashboard;