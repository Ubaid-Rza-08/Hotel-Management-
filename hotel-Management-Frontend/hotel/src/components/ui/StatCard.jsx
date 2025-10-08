// components/ui/StatCard.jsx
import React from 'react';

const StatCard = ({ title, value, change, icon: Icon, color, positive }) => (
  <div className="bg-white rounded-lg shadow-sm p-6">
    <div className="flex items-center">
      <div className={`${color} p-3 rounded-lg`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div className="ml-4 flex-1">
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className={`text-sm ${positive ? 'text-green-600' : 'text-red-600'}`}>
          {change}
        </p>
      </div>
    </div>
  </div>
);

export default StatCard;