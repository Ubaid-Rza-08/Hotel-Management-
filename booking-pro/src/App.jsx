import { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './hooks/useAuth';

import LoadingScreen from './components/ui/LoadingScreen';
import AuthScreen    from './components/auth/AuthScreen';
import Nav           from './components/layout/Nav';
import { Hero, Footer } from './components/layout/HeroFooter';

import HotelsPage   from './pages/HotelsPage';
import RoomsPage    from './pages/RoomsPage';
import BookingsPage from './pages/BookingsPage';
import PaymentsPage from './pages/PaymentsPage';
import ExplorePage  from './pages/ExplorePage';
import ProfilePage  from './pages/ProfilePage';

// ─────────────────────────────────────────────────────────────
//  INNER APP  (needs AuthContext to be mounted above)
// ─────────────────────────────────────────────────────────────
const AppInner = () => {
  const { user, loading } = useAuth();
  const [view, setView] = useState('hotels');
  const [selectedHotelId, setSelectedHotelId] = useState(null);

  if (loading) return <LoadingScreen />;
  if (!user)   return <AuthScreen />;

  // Custom navigation handler to pass data (like hotelId) between views
  const handleNavigate = (newView, data = null) => {
    setView(newView);
    if (newView === 'rooms' && data) {
      setSelectedHotelId(data);
    } else if (newView !== 'rooms') {
      setSelectedHotelId(null); // Clear selection when leaving rooms page
    }
  };

  const renderPage = () => {
    switch (view) {
      case 'hotels':   return <HotelsPage   setView={handleNavigate} />;
      // Pass the selectedHotelId to RoomsPage
      case 'rooms':    return <RoomsPage    hotelId={selectedHotelId} setView={handleNavigate} />;
      case 'bookings': return <BookingsPage />;
      case 'payments': return <PaymentsPage />;
      case 'explore':  return <ExplorePage  setView={handleNavigate} />;
      case 'profile':  return <ProfilePage  setView={handleNavigate} />;
      default:         return <HotelsPage   setView={handleNavigate} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Nav view={view} setView={handleNavigate} />
      {view === 'hotels' && <Hero setView={handleNavigate} />}
      <main className="flex-1">{renderPage()}</main>
      <Footer />
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
//  ROOT APP
// ─────────────────────────────────────────────────────────────
const App = () => (
  <AuthProvider>
    <AppInner />
  </AuthProvider>
);

export default App;