import React, { useState, useEffect } from 'react';
import { 
  Plus, Bed, Search, Edit2, Trash2, Eye, Filter, RefreshCw, 
  AlertCircle, Users, Clock, Check, X, Star, Building, TrendingUp 
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import RoomDetailsModal from './RoomDetailsModal'; 
// import { StatCard } from './ui/StatCard'; // Uncomment if you have this component

const RoomDashboard = () => {
  const { user, token } = useAuth();
  const [activeTab, setActiveTab] = useState('my-rooms');
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [showRoomDetails, setShowRoomDetails] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  // Use environment variable or fallback to localhost
  const API_BASE_URL = 'http://localhost:8083/api/rooms';

  useEffect(() => {
    if (activeTab === 'my-rooms') {
      fetchMyRooms();
    } else {
      fetchAllRooms();
    }
  }, [activeTab, token]); // Added token as dependency

  const fetchMyRooms = async () => {
    if (!token) {
      // Don't fetch if no token, just clear rooms or show login prompt
      setRooms([]); 
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}/my-rooms`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`, // FIXED: Added Auth Header
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          setRooms(data.data);
        } else {
          setRooms([]);
          setError(data.error || 'Failed to fetch rooms');
        }
      } else if (response.status === 401) {
        setError('Authentication failed. Please login again.');
        setRooms([]);
      } else {
        const errorData = await response.json();
        setError(errorData.error || `HTTP Error: ${response.status}`);
        setRooms([]);
      }
    } catch (error) {
      console.error('Error fetching my rooms:', error);
      setError('Network error. Please check your connection.');
      setRooms([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllRooms = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}/public/all`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          setRooms(data.data);
        } else {
          setRooms([]);
          setError(data.error || 'Failed to fetch rooms');
        }
      } else {
        const errorData = await response.json();
        setError(errorData.error || `HTTP Error: ${response.status}`);
        setRooms([]);
      }
    } catch (error) {
      console.error('Error fetching all rooms:', error);
      setError('Network error. Please check your connection.');
      setRooms([]);
    } finally {
      setLoading(false);
    }
  };

  const deleteRoom = async (roomId) => {
    if (!confirm('Are you sure you want to delete this room?')) return;

    if (!token) {
      alert('Authentication required');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/delete/${roomId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`, // FIXED: Added Auth Header
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          alert('Room deleted successfully!');
          fetchMyRooms();
        } else {
          alert('Failed to delete room: ' + (data.error || 'Unknown error'));
        }
      } else if (response.status === 401) {
        alert('Authentication failed. Please login again.');
      } else {
        const errorData = await response.json();
        alert('Failed to delete room: ' + (errorData.error || `HTTP Error: ${response.status}`));
      }
    } catch (error) {
      console.error('Error deleting room:', error);
      alert('Network error. Please try again.');
    }
  };

  const fetchRoomById = async (roomId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/public/${roomId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          return data.data;
        }
      }
      throw new Error('Failed to fetch room details');
    } catch (error) {
      console.error('Error fetching room details:', error);
      throw error;
    }
  };

  // Helper functions
  const getPropertyTypeDisplay = (propertyType) => {
    const types = { 'HOTEL': 'Hotel', 'HOSTEL': 'Hostel', 'MAN_STAY': 'Man Stay', 'VILLA': 'Villa' };
    return types[propertyType] || propertyType;
  };

  const getRoomTypeIcon = (roomType) => {
    switch (roomType?.toLowerCase()) {
      case 'single': case 'double': return <Bed className="w-4 h-4" />;
      case 'family': return <Users className="w-4 h-4" />;
      case 'apartment': case 'suite': return <Building className="w-4 h-4" />;
      default: return <Bed className="w-4 h-4" />;
    }
  };

  const getAvailabilityStatus = (numberOfRooms) => {
    if (numberOfRooms === 0) return { color: 'bg-red-100 text-red-700', text: 'Fully Booked' };
    if (numberOfRooms <= 2) return { color: 'bg-orange-100 text-orange-700', text: 'Limited' };
    if (numberOfRooms <= 5) return { color: 'bg-yellow-100 text-yellow-700', text: 'Available' };
    return { color: 'bg-green-100 text-green-700', text: 'Good Availability' };
  };

  // Filter and sort logic
  const filteredRooms = rooms.filter(room => {
    const matchesSearch = room.roomName?.toLowerCase().includes(searchTerm.toLowerCase()) || false;
    const matchesFilter = filterType === '' || room.roomType === filterType;
    return matchesSearch && matchesFilter;
  });

  const sortedRooms = [...filteredRooms].sort((a, b) => {
    switch (sortBy) {
      case 'price-low': return (a.basePrice || 0) - (b.basePrice || 0);
      case 'price-high': return (b.basePrice || 0) - (a.basePrice || 0);
      case 'name': return (a.roomName || '').localeCompare(b.roomName || '');
      case 'availability': return (b.numberOfRooms || 0) - (a.numberOfRooms || 0);
      default: return (b.roomId || '').localeCompare(a.roomId || '');
    }
  });

  const roomStats = {
    total: rooms.length,
    active: rooms.filter(r => r.isActive !== false).length,
    avgPrice: rooms.length > 0 ? Math.round(rooms.reduce((sum, r) => sum + (r.basePrice || 0), 0) / rooms.length) : 0,
    totalCapacity: rooms.reduce((sum, r) => sum + (r.numberOfRooms || 0), 0)
  };

  if (loading && rooms.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading rooms...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Room Management</h1>
        <p className="text-gray-600">Manage your room listings and availability</p>
        
        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <p className="text-red-700">{error}</p>
              <button 
                onClick={() => activeTab === 'my-rooms' ? fetchMyRooms() : fetchAllRooms()}
                className="ml-auto text-red-600 hover:text-red-700"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm mb-6">
        <div className="flex space-x-1 p-1">
          <button
            onClick={() => setActiveTab('my-rooms')}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
              activeTab === 'my-rooms'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            My Rooms
          </button>
          <button
            onClick={() => setActiveTab('all-rooms')}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
              activeTab === 'all-rooms'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            Browse All Rooms
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search rooms..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div className="flex gap-4">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Types</option>
              <option value="SINGLE">Single</option>
              <option value="DOUBLE">Double</option>
              <option value="FAMILY">Family</option>
              <option value="SUITE">Suite</option>
              <option value="APARTMENT">Apartment</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="newest">Newest First</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="availability">Most Available</option>
            </select>

            <button
              onClick={() => { setSearchTerm(''); setFilterType(''); setSortBy('newest'); }}
              className="px-4 py-3 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="min-h-96">
        {sortedRooms.length === 0 ? (
          <div className="text-center py-12">
            <Bed className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {searchTerm || filterType ? 'No matching rooms found' : (activeTab === 'my-rooms' ? 'No rooms yet' : 'No rooms found')}
            </h3>
            {activeTab === 'my-rooms' && !searchTerm && (
               <p className="text-gray-600">Create your first room listing to get started</p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedRooms.map((room) => (
              <RoomCard
                key={room.roomId}
                room={room}
                availabilityStatus={getAvailabilityStatus(room.numberOfRooms || 0)}
                getRoomTypeIcon={getRoomTypeIcon}
                getPropertyTypeDisplay={getPropertyTypeDisplay}
                activeTab={activeTab}
                onDelete={() => deleteRoom(room.roomId)}
                onViewDetails={async () => {
                  try {
                    const fullRoomData = await fetchRoomById(room.roomId);
                    setSelectedRoom(fullRoomData);
                    setShowRoomDetails(true);
                  } catch (error) {
                    alert('Failed to load room details');
                  }
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Room Details Modal */}
      {showRoomDetails && selectedRoom && (
        <RoomDetailsModal 
          room={selectedRoom} 
          onClose={() => {
            setShowRoomDetails(false);
            setSelectedRoom(null);
          }} 
        />
      )}
    </div>
  );
};

// Sub-component: RoomCard
const RoomCard = ({ 
  room, availabilityStatus, getRoomTypeIcon, getPropertyTypeDisplay, 
  activeTab, onDelete, onViewDetails 
}) => (
  <div className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-all duration-300 group">
    <div className="relative h-48 bg-gradient-to-br from-blue-100 to-indigo-100">
      {room.roomImages && room.roomImages.length > 0 ? (
        <img
          src={room.roomImages[0]}
          alt={room.roomName}
          className="w-full h-full object-cover"
          onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
        />
      ) : null}
      <div className="w-full h-full flex items-center justify-center" style={{display: room.roomImages && room.roomImages.length > 0 ? 'none' : 'flex'}}>
        <Bed className="w-16 h-16 text-blue-500" />
      </div>
      
      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg px-2 py-1">
        <span className="text-xs font-medium text-gray-700">{getPropertyTypeDisplay(room.propertyType)}</span>
      </div>

      <div className={`absolute top-4 right-4 px-2 py-1 rounded-lg text-xs font-medium ${availabilityStatus.color}`}>
        {availabilityStatus.text}
      </div>

      {activeTab === 'my-rooms' && (
        <div className="absolute bottom-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button className="w-8 h-8 bg-white/90 backdrop-blur-sm rounded-lg flex items-center justify-center hover:bg-white transition-colors">
            <Edit2 className="w-4 h-4 text-gray-600" />
          </button>
          <button onClick={onDelete} className="w-8 h-8 bg-white/90 backdrop-blur-sm rounded-lg flex items-center justify-center hover:bg-red-50 transition-colors">
            <Trash2 className="w-4 h-4 text-red-600" />
          </button>
        </div>
      )}
    </div>

    <div className="p-6">
      <div className="flex items-center gap-2 mb-2">
        {getRoomTypeIcon(room.roomType)}
        <h3 className="text-xl font-bold text-gray-900 line-clamp-1">{room.roomName || 'Unnamed Room'}</h3>
      </div>
      
      <div className="flex items-center gap-2 text-gray-600 mb-3">
        <span className="text-sm">{room.roomType}</span>
        {room.bedAvailable && <span className="text-sm">• {room.bedAvailable} Bed</span>}
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-500">1 Guest</p>
          <p className="text-sm font-medium">₹{room.priceForOneGuest || 0}</p>
        </div>
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-500">2 Guests</p>
          <p className="text-sm font-medium">₹{room.priceForTwoGuest || 0}</p>
        </div>
      </div>

      <button onClick={onViewDetails} className="w-full py-2 px-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
        <Eye className="w-4 h-4" />
        View Details
      </button>
    </div>
  </div>
);

export default RoomDashboard;