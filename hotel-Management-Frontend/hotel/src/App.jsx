// App.jsx
import React, { useState } from 'react';
import { useAuth } from './hooks/useAuth';
import LoadingSpinner from './components/LoadingSpinner';
import AuthScreen from './components/AuthScreen';
import Navigation from './components/Navigation';
import MobileSidebar from './components/MobileSidebar';
import Profile from './components/Profile';
import HotelDashboard from './components/HotelDashboard';
import HotelSearch from './components/HotelSearch';
import CreateHotel from './components/CreateHotel';
import RoomDashboard from './components/RoomDashboard';
import RoomSearch from './components/RoomSearch';
import CreateRoom from './components/CreateRoom';
import BookingDashboard from './components/BookingDashboard';
import RoomAvailabilityChecker from './components/RoomAvailabilityChecker';

const App = () => {
  const { user, loading, logout } = useAuth();
  const [authMode, setAuthMode] = useState('login');
  const [currentView, setCurrentView] = useState('hotels');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <AuthScreen authMode={authMode} setAuthMode={setAuthMode} />;
  }

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
        return <HotelDashboard currentView={currentView} setCurrentView={setCurrentView} />;
    }
  };

  if (currentView === 'profile' || currentView === 'create-hotel' || currentView === 'create-room') {
    return renderCurrentView();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation 
        user={user}
        currentView={currentView}
        setCurrentView={setCurrentView}
        setSidebarOpen={setSidebarOpen}
        logout={logout}
      />

      <MobileSidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)}
        currentView={currentView}
        setCurrentView={setCurrentView}
      />

      <main className="min-h-screen">
        {renderCurrentView()}
      </main>
    </div>
  );
};

export default App;