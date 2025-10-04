import React, { useState } from 'react';
import { useAuth } from './hooks/useAuth';
import LoadingSpinner from './components/LoadingSpinner';
import LoginForm from './components/LoginForm';
import SignupForm from './components/SignupForm';
import Profile from './components/Profile';
import HotelDashboard from './components/HotelDashboard';
import HotelSearch from './components/HotelSearch';
import CreateHotel from './components/CreateHotel';
import RoomDashboard from './components/RoomDashboard';
import RoomSearch from './components/RoomSearch';
import CreateRoom from './components/CreateRoom';
import BookingDashboard from './components/BookingDashboard';
import RoomAvailabilityChecker from './components/RoomAvailabilityChecker';
import { Hotel, Search, User, Plus, Bed, Calendar, CheckSquare } from 'lucide-react';

const App = () => {
  const { user, loading, logout } = useAuth();
  const [authMode, setAuthMode] = useState('login');
  const [currentView, setCurrentView] = useState('hotels'); 
  // Views: hotels, rooms, bookings, availability, search-hotels, search-rooms, profile, create-hotel, create-room

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {authMode === 'login' ? (
            <LoginForm onSwitchToSignup={() => setAuthMode('signup')} />
          ) : (
            <SignupForm onSwitchToLogin={() => setAuthMode('login')} />
          )}
        </div>
      </div>
    );
  }

  // Render different views based on currentView state
  const renderCurrentView = () => {
    switch (currentView) {
      case 'profile':
        return <Profile />;
      case 'search-hotels':
        return <HotelSearch />;
      case 'search-rooms':
        return <RoomSearch />;
      case 'create-hotel':
        return <CreateHotel onBack={() => setCurrentView('hotels')} />;
      case 'create-room':
        return <CreateRoom onBack={() => setCurrentView('rooms')} />;
      case 'bookings':
        return <BookingDashboard />;
      case 'availability':
        return <RoomAvailabilityChecker />;
      case 'rooms':
        return <RoomDashboard />;
      case 'hotels':
      default:
        return <HotelDashboard />;
    }
  };

  // Don't show navigation for profile or create views
  if (currentView === 'profile' || currentView === 'create-hotel' || currentView === 'create-room') {
    return renderCurrentView();
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50">
      {/* Navigation Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-3">
                <div className="inline-flex items-center justify-center w-10 h-10 bg-gradient-to-br from-amber-100 to-orange-100 rounded-xl">
                  <Hotel className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">HotelHub</h1>
                  <p className="text-xs text-gray-500">Complete Hotel Management Platform</p>
                </div>
              </div>

              {/* Navigation Links */}
              <nav className="hidden lg:flex space-x-1">
                <button
                  onClick={() => setCurrentView('hotels')}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ${
                    currentView === 'hotels'
                      ? 'bg-amber-100 text-amber-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <Hotel className="w-4 h-4" />
                  My Hotels
                </button>
                <button
                  onClick={() => setCurrentView('rooms')}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ${
                    currentView === 'rooms'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <Bed className="w-4 h-4" />
                  My Rooms
                </button>
                <button
                  onClick={() => setCurrentView('bookings')}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ${
                    currentView === 'bookings'
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <CheckSquare className="w-4 h-4" />
                  Bookings
                </button>
                <button
                  onClick={() => setCurrentView('availability')}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ${
                    currentView === 'availability'
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <Calendar className="w-4 h-4" />
                  Availability
                </button>
                <button
                  onClick={() => setCurrentView('search-hotels')}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ${
                    currentView === 'search-hotels'
                      ? 'bg-amber-100 text-amber-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <Search className="w-4 h-4" />
                  Search Hotels
                </button>
                <button
                  onClick={() => setCurrentView('search-rooms')}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ${
                    currentView === 'search-rooms'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <Search className="w-4 h-4" />
                  Search Rooms
                </button>
              </nav>
            </div>

            <div className="flex items-center gap-4">
              {/* Add Hotel/Room Buttons */}
              <div className="hidden md:flex items-center gap-2">
                <button
                  onClick={() => setCurrentView('create-hotel')}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-600 to-orange-600 text-white font-medium rounded-lg hover:from-amber-700 hover:to-orange-700 transition-all duration-200"
                >
                  <Plus className="w-4 h-4" />
                  Add Hotel
                </button>
                <button
                  onClick={() => setCurrentView('create-room')}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200"
                >
                  <Plus className="w-4 h-4" />
                  Add Room
                </button>
              </div>

              {/* User Menu */}
              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium text-gray-900">{user.fullName}</p>
                  <p className="text-xs text-gray-500">@{user.username}</p>
                </div>
                
                <button
                  onClick={() => setCurrentView('profile')}
                  className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center hover:from-amber-200 hover:to-orange-200 transition-all duration-200"
                >
                  {user.profilePhotoUrl ? (
                    <img
                      src={user.profilePhotoUrl}
                      alt={user.fullName}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <User className="w-5 h-5 text-amber-600" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation - Responsive Tabs */}
      <div className="lg:hidden bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Main tabs for mobile/tablet */}
          <div className="flex space-x-1 py-3 overflow-x-auto">
            <button
              onClick={() => setCurrentView('hotels')}
              className={`whitespace-nowrap py-2 px-4 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ${
                currentView === 'hotels'
                  ? 'bg-amber-100 text-amber-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <Hotel className="w-4 h-4" />
              My Hotels
            </button>
            <button
              onClick={() => setCurrentView('rooms')}
              className={`whitespace-nowrap py-2 px-4 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ${
                currentView === 'rooms'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <Bed className="w-4 h-4" />
              My Rooms
            </button>
            <button
              onClick={() => setCurrentView('bookings')}
              className={`whitespace-nowrap py-2 px-4 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ${
                currentView === 'bookings'
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <CheckSquare className="w-4 h-4" />
              Bookings
            </button>
            <button
              onClick={() => setCurrentView('availability')}
              className={`whitespace-nowrap py-2 px-4 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ${
                currentView === 'availability'
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <Calendar className="w-4 h-4" />
              Availability
            </button>
            <button
              onClick={() => setCurrentView('search-hotels')}
              className={`whitespace-nowrap py-2 px-4 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ${
                currentView === 'search-hotels'
                  ? 'bg-amber-100 text-amber-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <Search className="w-4 h-4" />
              Search Hotels
            </button>
            <button
              onClick={() => setCurrentView('search-rooms')}
              className={`whitespace-nowrap py-2 px-4 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ${
                currentView === 'search-rooms'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <Search className="w-4 h-4" />
              Search Rooms
            </button>
          </div>

          {/* Add buttons for mobile */}
          <div className="flex space-x-2 pb-3">
            <button
              onClick={() => setCurrentView('create-hotel')}
              className="flex-1 py-2 px-3 bg-gradient-to-r from-amber-600 to-orange-600 text-white font-medium rounded-lg hover:from-amber-700 hover:to-orange-700 transition-all duration-200 flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Hotel
            </button>
            <button
              onClick={() => setCurrentView('create-room')}
              className="flex-1 py-2 px-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Room
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main>
        {renderCurrentView()}
      </main>
    </div>
  );
};

export default App;