// components/ui/NavLink.jsx
import React from 'react';

const NavLink = ({ icon: Icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-colors ${
      active
        ? 'bg-blue-50 text-blue-600'
        : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
    }`}
  >
    <Icon className="w-4 h-4" />
    {label}
  </button>
);

export default NavLink;