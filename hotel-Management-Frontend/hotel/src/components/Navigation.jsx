// components/Navigation.jsx
import React from 'react';
import { 
  Hotel, 
  Search, 
  User, 
  Plus, 
  Bed, 
  Calendar, 
  CheckSquare,
  Menu,
  ChevronDown
} from 'lucide-react';
import NavLink from './ui/NavLink';

const Navigation = ({ user, currentView, setCurrentView, setSidebarOpen, logout }) => {
  return (
    <nav className="bg-white shadow-sm border-b-2 border-blue-600 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
            >
              <Menu className="h-6 w-6" />
            </button>
            <div className="flex items-center gap-3 ml-2 lg:ml-0">
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-2 rounded-lg">
                <Hotel className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-blue-600">BookingPro</h1>
                <p className="text-xs text-gray-500 hidden sm:block">Hotel Management Platform</p>
              </div>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            <NavLink 
              icon={Hotel} 
              label="Hotels" 
              active={currentView === 'hotels'} 
              onClick={() => setCurrentView('hotels')} 
            />
            <NavLink 
              icon={Bed} 
              label="Rooms" 
              active={currentView === 'rooms'} 
              onClick={() => setCurrentView('rooms')} 
            />
            <NavLink 
              icon={CheckSquare} 
              label="Bookings" 
              active={currentView === 'bookings'} 
              onClick={() => setCurrentView('bookings')} 
            />
            <NavLink 
              icon={Calendar} 
              label="Availability" 
              active={currentView === 'availability'} 
              onClick={() => setCurrentView('availability')} 
            />
            <NavLink 
              icon={Search} 
              label="Explore" 
              active={currentView.includes('search')} 
              onClick={() => setCurrentView('search-hotels')} 
            />
          </div>

          {/* User Menu */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setCurrentView('create-hotel')}
              className="hidden md:inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              List Property
            </button>
            
            <div className="relative group">
              <button className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  {user.profilePhotoUrl ? (
                    <img
                      src={user.profilePhotoUrl}
                      alt={user.fullName}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <User className="w-4 h-4 text-blue-600" />
                  )}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-medium text-gray-900">{user.fullName || 'Guest User'}</p>
                  <p className="text-xs text-gray-500">Genius Level 1</p>
                </div>
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </button>
              
              {/* Dropdown */}
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                <div className="px-4 py-3 border-b">
                  <p className="font-medium text-gray-900">{user.fullName || 'Guest User'}</p>
                  <p className="text-sm text-gray-500">{user.email}</p>
                </div>
                <button 
                  onClick={() => setCurrentView('profile')}
                  className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm"
                >
                  Manage account
                </button>
                <button className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm">
                  Bookings & trips
                </button>
                <button className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm">
                  Reviews
                </button>
                <button className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm">
                  Saved
                </button>
                <hr className="my-2" />
                <button className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm">
                  Customer Service
                </button>
                <button 
                  onClick={logout}
                  className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm text-red-600"
                >
                  Sign out
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;