// components/RoomDashboard.jsx
import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Hotel, 
  Search, 
  Edit2, 
  Trash2, 
  Eye, 
  Bed, 
  Users, 
  Calendar, 
  Clock, 
  MapPin, 
  Car, 
  Coffee, 
  Check, 
  X, 
  Filter,
  Star,
  RefreshCw,
  Settings,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const RoomDashboard = () => {
  const { user, token } = useAuth();
  const [activeTab, setActiveTab] = useState('my-rooms');
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [showRoomDetails, setShowRoomDetails] = useState(false);
  const [showAvailabilityModal, setShowAvailabilityModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  const API_BASE_URL = 'http://localhost:8083/api/rooms';

  useEffect(() => {
    if (activeTab === 'my-rooms') {
      fetchMyRooms();
    } else {
      fetchAllRooms();
    }
  }, [activeTab]);

  const fetchMyRooms = async () => {
    if (!token) {
      setError('Authentication required');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}/my-rooms`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('My rooms response:', data);
        
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
        console.log('All rooms response:', data);
        
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
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          alert('Room deleted successfully!');
          fetchMyRooms(); // Refresh the list
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

  const getPropertyTypeDisplay = (propertyType) => {
    const types = {
      'HOTEL': 'Hotel',
      'HOSTEL': 'Hostel',
      'MAN_STAY': 'Man Stay',
      'VILLA': 'Villa'
    };
    return types[propertyType] || propertyType;
  };

  const getRoomTypeIcon = (roomType) => {
    switch (roomType?.toLowerCase()) {
      case 'single': return <Bed className="w-4 h-4" />;
      case 'double': return <Bed className="w-4 h-4" />;
      case 'family': return <Users className="w-4 h-4" />;
      case 'apartment': 
      case 'suite': return <Hotel className="w-4 h-4" />;
      default: return <Bed className="w-4 h-4" />;
    }
  };

  const getAvailabilityStatus = (numberOfRooms) => {
    if (numberOfRooms === 0) return { color: 'bg-red-100 text-red-700', text: 'Fully Booked' };
    if (numberOfRooms <= 2) return { color: 'bg-orange-100 text-orange-700', text: 'Limited' };
    if (numberOfRooms <= 5) return { color: 'bg-yellow-100 text-yellow-700', text: 'Available' };
    return { color: 'bg-green-100 text-green-700', text: 'Good Availability' };
  };

  // Filter and sort rooms
  const filteredRooms = rooms.filter(room => {
    const matchesSearch = room.roomName?.toLowerCase().includes(searchTerm.toLowerCase()) || false;
    const matchesFilter = filterType === '' || room.roomType === filterType;
    return matchesSearch && matchesFilter;
  });

  const sortedRooms = [...filteredRooms].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return (a.basePrice || 0) - (b.basePrice || 0);
      case 'price-high':
        return (b.basePrice || 0) - (a.basePrice || 0);
      case 'name':
        return (a.roomName || '').localeCompare(b.roomName || '');
      case 'availability':
        return (b.numberOfRooms || 0) - (a.numberOfRooms || 0);
      default: // newest
        return (b.roomId || '').localeCompare(a.roomId || '');
    }
  });

  const roomStats = {
    total: rooms.length,
    active: rooms.filter(r => r.isActive !== false).length,
    avgPrice: rooms.length > 0 ? Math.round(rooms.reduce((sum, r) => sum + (r.basePrice || 0), 0) / rooms.length) : 0,
    totalCapacity: rooms.reduce((sum, r) => sum + (r.numberOfRooms || 0), 0)
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
            <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
          </div>
          <p className="text-gray-600">Loading rooms from backend...</p>
          <p className="text-sm text-gray-500 mt-2">Connecting to port 8083</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Room Management</h1>
              <p className="text-gray-600 mt-1">Manage your room listings and availability</p>
              {error && (
                <div className="mt-2 p-2 bg-red-100 border border-red-300 rounded-lg">
                  <p className="text-red-700 text-sm flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    {error}
                  </p>
                </div>
              )}
            </div>
            <div className="flex items-center gap-4">
              <button 
                onClick={() => activeTab === 'my-rooms' ? fetchMyRooms() : fetchAllRooms()}
                className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
              <button className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl">
                <Plus className="w-5 h-5" />
                Add New Room
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      {activeTab === 'my-rooms' && !loading && !error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl shadow-sm p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Bed className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{roomStats.total}</p>
                  <p className="text-sm text-gray-600">Total Rooms</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Check className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{roomStats.active}</p>
                  <p className="text-sm text-gray-600">Active Listings</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">₹{roomStats.avgPrice}</p>
                  <p className="text-sm text-gray-600">Avg. Price</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{roomStats.totalCapacity}</p>
                  <p className="text-sm text-gray-600">Total Capacity</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="flex space-x-1 bg-white rounded-xl p-1 shadow-sm">
          <button
            onClick={() => setActiveTab('my-rooms')}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
              activeTab === 'my-rooms'
                ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-md'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            My Rooms
          </button>
          <button
            onClick={() => setActiveTab('all-rooms')}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
              activeTab === 'all-rooms'
                ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-md'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            Browse All Rooms
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      {!loading && !error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          <div className="bg-white rounded-xl shadow-sm p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search rooms..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div className="flex gap-4">
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="newest">Newest First</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="name">Name A-Z</option>
                  <option value="availability">Most Available</option>
                </select>

                <button
                  onClick={() => { setSearchTerm(''); setFilterType(''); setSortBy('newest'); }}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error ? (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-red-100 rounded-full mb-6">
              <AlertCircle className="w-12 h-12 text-red-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Connection Error</h3>
            <p className="text-gray-600 mb-6">{error}</p>
            <button 
              onClick={() => activeTab === 'my-rooms' ? fetchMyRooms() : fetchAllRooms()}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors"
            >
              <RefreshCw className="w-5 h-5" />
              Try Again
            </button>
          </div>
        ) : sortedRooms.length === 0 ? (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-blue-100 rounded-full mb-6">
              <Bed className="w-12 h-12 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {searchTerm || filterType ? 'No matching rooms found' : (activeTab === 'my-rooms' ? 'No rooms yet' : 'No rooms found')}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || filterType 
                ? 'Try adjusting your search criteria'
                : (activeTab === 'my-rooms' 
                  ? 'Create your first room listing to get started' 
                  : 'Check back later for new room listings'
                )
              }
            </p>
            {activeTab === 'my-rooms' && !searchTerm && !filterType && (
              <button className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200">
                <Plus className="w-5 h-5" />
                Add Your First Room
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedRooms.map((room) => {
              const availabilityStatus = getAvailabilityStatus(room.numberOfRooms || 0);
              
              return (
                <div key={room.roomId} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 group">
                  {/* Room Image */}
                  <div className="relative h-48 bg-gradient-to-br from-blue-100 to-indigo-100">
                    {room.roomImages && room.roomImages.length > 0 ? (
                      <img
                        src={room.roomImages[0]}
                        alt={room.roomName}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div className="w-full h-full flex items-center justify-center" style={{display: room.roomImages && room.roomImages.length > 0 ? 'none' : 'flex'}}>
                      <Bed className="w-16 h-16 text-blue-500" />
                    </div>
                    
                    {/* Property Type Badge */}
                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg px-2 py-1">
                      <span className="text-xs font-medium text-gray-700">
                        {getPropertyTypeDisplay(room.propertyType)}
                      </span>
                    </div>

                    {/* Availability Status */}
                    <div className={`absolute top-4 right-4 px-2 py-1 rounded-lg text-xs font-medium ${availabilityStatus.color}`}>
                      {availabilityStatus.text}
                    </div>

                    {/* Action Buttons */}
                    {activeTab === 'my-rooms' && (
                      <div className="absolute bottom-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => {
                            setSelectedRoom(room);
                            setShowAvailabilityModal(true);
                          }}
                          className="w-8 h-8 bg-white/90 backdrop-blur-sm rounded-lg flex items-center justify-center hover:bg-white transition-colors"
                          title="Manage Availability"
                        >
                          <Calendar className="w-4 h-4 text-gray-600" />
                        </button>
                        <button 
                          onClick={() => {
                            setSelectedRoom(room);
                            setShowEditModal(true);
                          }}
                          className="w-8 h-8 bg-white/90 backdrop-blur-sm rounded-lg flex items-center justify-center hover:bg-white transition-colors"
                          title="Edit Room"
                        >
                          <Edit2 className="w-4 h-4 text-gray-600" />
                        </button>
                        <button 
                          onClick={() => deleteRoom(room.roomId)}
                          className="w-8 h-8 bg-white/90 backdrop-blur-sm rounded-lg flex items-center justify-center hover:bg-red-50 transition-colors"
                          title="Delete Room"
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Room Info */}
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-2">
                      {getRoomTypeIcon(room.roomType)}
                      <h3 className="text-xl font-bold text-gray-900 line-clamp-1">
                        {room.roomName || 'Unnamed Room'}
                      </h3>
                    </div>
                    
                    <div className="flex items-center gap-2 text-gray-600 mb-3">
                      <span className="text-sm">{room.roomType || 'Unknown'} Room</span>
                      {room.bedAvailable && (
                        <>
                          <span className="text-gray-400">•</span>
                          <span className="text-sm">{room.bedAvailable.toString().replace('_', ' ')} Bed</span>
                        </>
                      )}
                    </div>

                    {/* Pricing */}
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

                    {/* Amenities Preview */}
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-1">
                        {room.breakfastIncluded && (
                          <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">
                            Breakfast
                          </span>
                        )}
                        {room.parkingAvailable && (
                          <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                            Parking
                          </span>
                        )}
                        {room.childrenAllowed && (
                          <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded-full">
                            Child Friendly
                          </span>
                        )}
                        <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                          {room.numberOfRooms || 0} Available
                        </span>
                      </div>
                    </div>

                    {/* Check-in/out times */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="text-center p-2 bg-gray-50 rounded-lg">
                        <Clock className="w-4 h-4 text-gray-500 mx-auto mb-1" />
                        <p className="text-xs text-gray-500">Check-in</p>
                        <p className="text-sm font-medium">{room.checkinTime || 'Not set'}</p>
                      </div>
                      <div className="text-center p-2 bg-gray-50 rounded-lg">
                        <Clock className="w-4 h-4 text-gray-500 mx-auto mb-1" />
                        <p className="text-xs text-gray-500">Check-out</p>
                        <p className="text-sm font-medium">{room.checkoutTime || 'Not set'}</p>
                      </div>
                    </div>

                    {/* View Details Button */}
                    <button 
                      onClick={async () => {
                        try {
                          const fullRoomData = await fetchRoomById(room.roomId);
                          setSelectedRoom(fullRoomData);
                          setShowRoomDetails(true);
                        } catch (error) {
                          alert('Failed to load room details');
                        }
                      }}
                      className="w-full py-2 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 flex items-center justify-center gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      View Details
                    </button>
                  </div>
                </div>
              );
            })}
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

      {/* Other modals would go here */}
    </div>
  );
};

// Room Details Modal Component (simplified for this example)
const RoomDetailsModal = ({ room, onClose }) => {
  const parseInvoiceDetails = (invoiceDetailsStr) => {
    try {
      return typeof invoiceDetailsStr === 'string' ? JSON.parse(invoiceDetailsStr) : invoiceDetailsStr;
    } catch {
      return null;
    }
  };

  const invoiceDetails = parseInvoiceDetails(room.invoiceDetails);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{room.roomName}</h2>
              <p className="text-gray-600">{room.roomType} Room • {room.propertyType}</p>
            </div>
            <button 
              onClick={onClose}
              className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Images */}
          {room.roomImages && room.roomImages.length > 0 && (
            <div className="mb-6">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {room.roomImages.map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt={`Room ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Room Details</h3>
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">Room ID:</span> {room.roomId}</p>
                  <p><span className="font-medium">Type:</span> {room.roomType}</p>
                  <p><span className="font-medium">Bed:</span> {room.bedAvailable || 'Not specified'}</p>
                  <p><span className="font-medium">Bathroom:</span> {room.bathroomType || 'Not specified'}</p>
                  <p><span className="font-medium">Available Rooms:</span> {room.numberOfRooms || 0}</p>
                  <p><span className="font-medium">Property Type:</span> {room.propertyType}</p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Pricing</h3>
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">Base Price:</span> ₹{room.basePrice || 0}</p>
                  <p><span className="font-medium">1 Guest:</span> ₹{room.priceForOneGuest || 0}</p>
                  <p><span className="font-medium">2 Guests:</span> ₹{room.priceForTwoGuest || 0}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Timing</h3>
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">Check-in:</span> {room.checkinTime || 'Not set'}</p>
                  <p><span className="font-medium">Check-out:</span> {room.checkoutTime || 'Not set'}</p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Policies</h3>
                <div className="space-y-2 text-sm">
                  <p className="flex items-center gap-2">
                    {room.childrenAllowed ? <Check className="w-4 h-4 text-green-600" /> : <X className="w-4 h-4 text-red-600" />}
                    Children Allowed
                  </p>
                  <p className="flex items-center gap-2">
                    {room.petAllowed ? <Check className="w-4 h-4 text-green-600" /> : <X className="w-4 h-4 text-red-600" />}
                    Pets Allowed
                  </p>
                  <p className="flex items-center gap-2">
                    {room.breakfastIncluded ? <Check className="w-4 h-4 text-green-600" /> : <X className="w-4 h-4 text-red-600" />}
                    Breakfast Included
                  </p>
                  <p className="flex items-center gap-2">
                    {room.parkingAvailable ? <Check className="w-4 h-4 text-green-600" /> : <X className="w-4 h-4 text-red-600" />}
                    Parking Available
                  </p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Status</h3>
                <div className="space-y-2 text-sm">
                  <p className="flex items-center gap-2">
                    {room.isActive ? <Check className="w-4 h-4 text-green-600" /> : <X className="w-4 h-4 text-red-600" />}
                    {room.isActive ? 'Active Listing' : 'Inactive Listing'}
                  </p>
                  <p><span className="font-medium">Hotel ID:</span> {room.hotelId || 'Not linked'}</p>
                  <p><span className="font-medium">User ID:</span> {room.userId || 'Unknown'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Amenities */}
          {(room.generalAmenities || room.bathroomItems || room.foodDrinkItems) && (
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-3">Amenities & Features</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {room.generalAmenities && room.generalAmenities.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">General Amenities</h4>
                    <div className="space-y-1">
                      {room.generalAmenities.map((amenity, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                          <Check className="w-3 h-3 text-green-600" />
                          {amenity.replace(/_/g, ' ')}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {room.bathroomItems && room.bathroomItems.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Bathroom Items</h4>
                    <div className="space-y-1">
                      {room.bathroomItems.map((item, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                          <Check className="w-3 h-3 text-blue-600" />
                          {item.replace(/_/g, ' ')}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {room.foodDrinkItems && room.foodDrinkItems.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Food & Drink</h4>
                    <div className="space-y-1">
                      {room.foodDrinkItems.map((item, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                          <Coffee className="w-3 h-3 text-orange-600" />
                          {item.replace(/_/g, ' ')}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Views */}
          {room.outdoorViews && room.outdoorViews.length > 0 && (
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-3">Outdoor Views</h3>
              <div className="flex flex-wrap gap-2">
                {room.outdoorViews.map((view, index) => (
                  <span key={index} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                    {view.replace(/_/g, ' ')}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Languages */}
          {room.languages && room.languages.length > 0 && (
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-3">Languages Spoken</h3>
              <div className="flex flex-wrap gap-2">
                {room.languages.map((language, index) => (
                  <span key={index} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                    {language}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Location */}
          {room.locationLink && (
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-3">Location</h3>
              <a
                href={room.locationLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <MapPin className="w-4 h-4" />
                View on Map
              </a>
            </div>
          )}

          {/* Invoice Details */}
          {invoiceDetails && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Property Information</h3>
              <div className="bg-gray-50 rounded-lg p-4 text-sm space-y-2">
                <p><span className="font-medium">Invoice Name:</span> {invoiceDetails.invoiceName}</p>
                <p><span className="font-medium">Property:</span> {invoiceDetails.propertyName}</p>
                <p><span className="font-medium">Address:</span> {invoiceDetails.propertyAddress}</p>
                <p><span className="font-medium">State:</span> {invoiceDetails.state}</p>
                <p><span className="font-medium">License:</span> {invoiceDetails.licenseNumber}</p>
                {invoiceDetails.gstRegistered && (
                  <>
                    <p><span className="font-medium">GST Number:</span> {invoiceDetails.gstNumber}</p>
                    <p><span className="font-medium">Trade Name:</span> {invoiceDetails.tradeName}</p>
                  </>
                )}
                {invoiceDetails.panNumber && (
                  <p><span className="font-medium">PAN:</span> {invoiceDetails.panNumber}</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RoomDashboard;