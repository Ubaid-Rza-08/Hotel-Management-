// components/HotelDashboard.jsx
import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Hotel, 
  Star, 
  MapPin, 
  TrendingUp, 
  Building,
  CheckSquare,
  CreditCard,
  User,
  Eye,
  Edit2,
  Trash2,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import StatCard from './ui/StatCard';
import TabButton from './ui/TabButton';
import PropertyCard from './ui/PropertyCard';
import ActivityItem from './ui/ActivityItem';
import ActionButton from './ui/ActionButton';

const HotelDashboard = ({ currentView, setCurrentView }) => {
  const { user, token } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalProperties: 0,
    activeBookings: 0,
    revenue: 0,
    avgRating: 0
  });

  const API_BASE_URL = 'http://localhost:8082/api/hotels';

  useEffect(() => {
    fetchMyHotels();
    fetchDashboardStats();
  }, []);

  const fetchMyHotels = async () => {
    if (!token) {
      setError('Authentication required');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/my-hotels`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          setHotels(data.data);
        } else {
          setError(data.error || 'Failed to fetch hotels');
          setHotels([]);
        }
      } else if (response.status === 401) {
        setError('Authentication failed. Please login again.');
        setHotels([]);
      } else {
        const errorData = await response.json();
        setError(errorData.error || `HTTP Error: ${response.status}`);
        setHotels([]);
      }
    } catch (error) {
      console.error('Error fetching hotels:', error);
      setError('Network error. Please check your connection.');
      setHotels([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchDashboardStats = async () => {
    try {
      // Calculate stats from hotel data
      const totalProperties = hotels.length;
      const avgRating = hotels.length > 0 
        ? hotels.reduce((sum, hotel) => sum + (hotel.rating || 0), 0) / hotels.length 
        : 0;
      
      setStats({
        totalProperties,
        activeBookings: Math.floor(Math.random() * 50) + 20, // This would come from booking API
        revenue: Math.floor(Math.random() * 500000) + 100000, // This would come from booking API
        avgRating: parseFloat(avgRating.toFixed(1))
      });
    } catch (error) {
      console.error('Error calculating stats:', error);
    }
  };

  const deleteHotel = async (hotelId) => {
    if (!confirm('Are you sure you want to delete this hotel?')) return;

    if (!token) {
      alert('Authentication required');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/delete/${hotelId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          alert('Hotel deleted successfully!');
          fetchMyHotels(); // Refresh the list
        } else {
          alert('Failed to delete hotel: ' + (data.error || 'Unknown error'));
        }
      } else {
        const errorData = await response.json();
        alert('Failed to delete hotel: ' + (errorData.error || `HTTP Error: ${response.status}`));
      }
    } catch (error) {
      console.error('Error deleting hotel:', error);
      alert('Network error. Please try again.');
    }
  };

  const formatTime = (timeString) => {
    if (!timeString) return 'Not set';
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading your hotels...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 mb-8 text-white">
        <div className="max-w-4xl">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Welcome back, {user.fullName || 'Guest'}!
          </h1>
          <p className="text-lg text-blue-100 mb-6">
            Manage your properties, track bookings, and grow your hospitality business with our comprehensive platform.
          </p>
          <div className="flex flex-wrap gap-4">
            <button 
              onClick={() => setCurrentView('create-hotel')}
              className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
            >
              Add New Property
            </button>
            <button className="border border-blue-400 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-600 transition-colors">
              View Analytics
            </button>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <p className="text-red-700">{error}</p>
            <button 
              onClick={fetchMyHotels}
              className="ml-auto text-red-600 hover:text-red-700"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Properties"
          value={stats.totalProperties.toString()}
          change="+2 this month"
          icon={Building}
          color="bg-green-500"
          positive={true}
        />
        <StatCard
          title="Active Bookings"
          value={stats.activeBookings.toString()}
          change="+12% this week"
          icon={CheckSquare}
          color="bg-blue-500"
          positive={true}
        />
        <StatCard
          title="Revenue"
          value={`₹${stats.revenue.toLocaleString()}`}
          change="+8.2% vs last month"
          icon={TrendingUp}
          color="bg-purple-500"
          positive={true}
        />
        <StatCard
          title="Avg Rating"
          value={stats.avgRating.toString() || '0.0'}
          change="+0.2 this month"
          icon={Star}
          color="bg-yellow-500"
          positive={true}
        />
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm mb-6">
        <div className="border-b border-gray-200">
          <div className="flex space-x-8 px-6">
            <TabButton
              label="Overview"
              active={activeTab === 'overview'}
              onClick={() => setActiveTab('overview')}
            />
            <TabButton
              label="Properties"
              active={activeTab === 'properties'}
              onClick={() => setActiveTab('properties')}
            />
            <TabButton
              label="Recent Bookings"
              active={activeTab === 'bookings'}
              onClick={() => setActiveTab('bookings')}
            />
            <TabButton
              label="Analytics"
              active={activeTab === 'analytics'}
              onClick={() => setActiveTab('analytics')}
            />
          </div>
        </div>

        <div className="p-6">
          {activeTab === 'overview' && <OverviewTab setCurrentView={setCurrentView} />}
          {activeTab === 'properties' && (
            <PropertiesTab 
              hotels={hotels} 
              setCurrentView={setCurrentView} 
              deleteHotel={deleteHotel}
              formatTime={formatTime}
              loading={loading}
            />
          )}
          {activeTab === 'bookings' && <BookingsTab />}
          {activeTab === 'analytics' && <AnalyticsTab />}
        </div>
      </div>
    </div>
  );
};

// Overview Tab Component
const OverviewTab = ({ setCurrentView }) => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Quick Actions */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
        <div className="space-y-3">
          <ActionButton 
            icon={Plus} 
            label="Add New Property" 
            color="bg-blue-500" 
            onClick={() => setCurrentView('create-hotel')}
          />
          <ActionButton 
            icon={Hotel} 
            label="Add New Room" 
            color="bg-green-500"
            onClick={() => setCurrentView('create-room')}
          />
          <ActionButton 
            icon={CheckSquare} 
            label="View Bookings" 
            color="bg-purple-500"
            onClick={() => setCurrentView('bookings')}
          />
          <ActionButton 
            icon={TrendingUp} 
            label="View Analytics" 
            color="bg-orange-500"
          />
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
        <div className="space-y-4">
          <ActivityItem
            title="New booking received"
            description="Ocean View Suite - 3 nights"
            time="2 hours ago"
            icon={CheckSquare}
          />
          <ActivityItem
            title="Review posted"
            description="5-star review for Sunset Villa"
            time="5 hours ago"
            icon={Star}
          />
          <ActivityItem
            title="Payment received"
            description="₹15,000 for booking #BK001"
            time="1 day ago"
            icon={CreditCard}
          />
        </div>
      </div>
    </div>
  </div>
);

// Properties Tab Component
const PropertiesTab = ({ hotels, setCurrentView, deleteHotel, formatTime, loading }) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="w-6 h-6 animate-spin text-gray-400" />
        <span className="ml-2 text-gray-600">Loading properties...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Your Properties ({hotels.length})</h3>
        <button 
          onClick={() => setCurrentView('create-hotel')}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Add Property
        </button>
      </div>
      
      {hotels.length === 0 ? (
        <div className="text-center py-12">
          <Hotel className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No properties yet</h3>
          <p className="text-gray-600 mb-4">Start by adding your first property to the platform</p>
          <button 
            onClick={() => setCurrentView('create-hotel')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Add Your First Property
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {hotels.map((hotel) => (
            <PropertyCard
              key={hotel.hotelId}
              hotel={hotel}
              formatTime={formatTime}
              onDelete={() => deleteHotel(hotel.hotelId)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// Bookings Tab Component
const BookingsTab = () => (
  <div className="space-y-6">
    <h3 className="text-lg font-semibold">Recent Bookings</h3>
    <div className="text-center py-12">
      <CheckSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
      <p className="text-gray-600">Booking data would be fetched from the booking service</p>
      <p className="text-sm text-gray-500 mt-2">Connect to port 8084 for booking information</p>
    </div>
  </div>
);

// Analytics Tab Component
const AnalyticsTab = () => (
  <div className="space-y-6">
    <h3 className="text-lg font-semibold">Performance Analytics</h3>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-gray-50 rounded-lg p-6">
        <h4 className="font-medium mb-4">Revenue Trends</h4>
        <div className="h-40 bg-white rounded border flex items-center justify-center">
          <p className="text-gray-500">Chart integration would go here</p>
        </div>
      </div>
      <div className="bg-gray-50 rounded-lg p-6">
        <h4 className="font-medium mb-4">Occupancy Rate</h4>
        <div className="h-40 bg-white rounded border flex items-center justify-center">
          <p className="text-gray-500">Chart integration would go here</p>
        </div>
      </div>
    </div>
  </div>
);

export default HotelDashboard;