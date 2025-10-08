// components/MobileSidebar.jsx
import React from 'react';
import { 
  X,
  Hotel, 
  Search, 
  Bed, 
  Calendar, 
  CheckSquare
} from 'lucide-react';

const MobileSidebar = ({ isOpen, onClose, currentView, setCurrentView }) => {
  const handleNavigation = (view) => {
    setCurrentView(view);
    onClose();
  };

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black bg-opacity-25" onClick={onClose} />
          <div className="fixed top-0 left-0 h-full w-64 bg-white shadow-xl">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">Menu</h2>
              <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="p-4 space-y-2">
              <SidebarLink 
                icon={Hotel} 
                label="Hotels" 
                active={currentView === 'hotels'} 
                onClick={() => handleNavigation('hotels')} 
              />
              <SidebarLink 
                icon={Bed} 
                label="Rooms" 
                active={currentView === 'rooms'} 
                onClick={() => handleNavigation('rooms')} 
              />
              <SidebarLink 
                icon={CheckSquare} 
                label="Bookings" 
                active={currentView === 'bookings'} 
                onClick={() => handleNavigation('bookings')} 
              />
              <SidebarLink 
                icon={Calendar} 
                label="Availability" 
                active={currentView === 'availability'} 
                onClick={() => handleNavigation('availability')} 
              />
              <SidebarLink 
                icon={Search} 
                label="Search Hotels" 
                active={currentView === 'search-hotels'} 
                onClick={() => handleNavigation('search-hotels')} 
              />
              <SidebarLink 
                icon={Search} 
                label="Search Rooms" 
                active={currentView === 'search-rooms'} 
                onClick={() => handleNavigation('search-rooms')} 
              />
            </nav>
          </div>
        </div>
      )}
    </>
  );
};

// Sidebar Link Component
const SidebarLink = ({ icon: Icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-3 w-full px-3 py-3 rounded-lg font-medium transition-colors ${
      active
        ? 'bg-blue-50 text-blue-600'
        : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
    }`}
  >
    <Icon className="w-5 h-5" />
    {label}
  </button>
);

export default MobileSidebar;