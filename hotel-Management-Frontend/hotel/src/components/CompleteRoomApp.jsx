import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Hotel, 
  Search, 
  Edit2, 
  Trash2, 
  Eye,
  Bed,
  Wifi,
  Car,
  Coffee,
  Tv,
  Bath,
  Mountain,
  Building,
  Home,
  Clock,
  Users,
  Star,
  MapPin,
  Upload,
  X,
  Check,
  Calendar,
  Filter,
  RefreshCw,
  AlertCircle,
  Settings
} from 'lucide-react';

// Import the components we created
// import RoomSearch from './RoomSearch';
// import RoomAvailabilityManager from './RoomAvailabilityManager';

const CompleteRoomApp = () => {
  const [currentView, setCurrentView] = useState('dashboard'); // dashboard, search, create
  const [activeTab, setActiveTab] = useState('my-rooms');
  const [rooms, setRooms] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [showRoomDetails, setShowRoomDetails] = useState(false);
  const [showAvailabilityManager, setShowAvailabilityManager] = useState(false);
  const [searchData, setSearchData] = useState({
    roomName: '',
    minPrice: '',
    maxPrice: '',
    roomType: '',
    propertyType: ''
  });
  const [searchResults, setSearchResults] = useState([]);

  const API_BASE_URL = 'http://localhost:8083/api/rooms';
  const HOTEL_API_BASE_URL = 'http://localhost:8082/api/hotels';

  // Mock token - replace with actual auth
  const token = 'your-auth-token';

  useEffect(() => {
    if (currentView === 'dashboard') {
      if (activeTab === 'my-rooms') {
        fetchMyRooms();
      } else {
        fetchAllRooms();
      }
      fetchMyHotels();
    }
  }, [currentView, activeTab]);

  const fetchMyRooms = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/my-rooms`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        const data = await response.json();
        setRooms(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching my rooms:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllRooms = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/public/all`);
      if (response.ok) {
        const data = await response.json();
        setRooms(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching all rooms:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyHotels = async () => {
    try {
      const response = await fetch(`${HOTEL_API_BASE_URL}/my-hotels`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        const data = await response.json();
        setHotels(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching hotels:', error);
    }
  };

  const handleSearch = async () => {
    if (!searchData.roomName.trim()) {
      alert('Please enter a room name to search');
      return;
    }

    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('roomName', searchData.roomName);

      const response = await fetch(`${API_BASE_URL}/public/search?${params}`);
      
      if (response.ok) {
        const data = await response.json();
        let results = data.data || [];

        // Apply frontend filters
        if (searchData.minPrice) {
          results = results.filter(room => room.basePrice >= parseFloat(searchData.minPrice));
        }
        if (searchData.maxPrice) {
          results = results.filter(room => room.basePrice <= parseFloat(searchData.maxPrice));
        }
        if (searchData.roomType) {
          results = results.filter(room => room.roomType === searchData.roomType);
        }
        if (searchData.propertyType) {
          results = results.filter(room => room.propertyType === searchData.propertyType);
        }

        setSearchResults(results);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteRoom = async (roomId) => {
    if (!confirm('Are you sure you want to delete this room?')) return;

    try {
      const response = await fetch(`${API_BASE_URL}/delete/${roomId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        fetchMyRooms();
      }
    } catch (error) {
      console.error('Error deleting room:', error);
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
      case 'apartment': return <Building className="w-4 h-4" />;
      default: return <Hotel className="w-4 h-4" />;
    }
  };

  // Navigation Component
  const Navigation = () => (
    <div className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-3">
              <div className="inline-flex items-center justify-center w-10 h-10 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl">
                <Hotel className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">RoomHub</h1>
                <p className="text-xs text-gray-500">Room Management Platform</p>
              </div>
            </div>

            <nav className="hidden md:flex space-x-1">
              <button
                onClick={() => setCurrentView('dashboard')}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ${
                  currentView === 'dashboard'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <Hotel className="w-4 h-4" />
                Dashboard
              </button>
              <button
                onClick={() => setCurrentView('search')}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ${
                  currentView === 'search'
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
            <button
              onClick={() => setShowCreateForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200"
            >
              <Plus className="w-4 h-4" />
              Add Room
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Dashboard View
  const DashboardView = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h2 className="text-2xl font-bold text-gray-900">Room Management</h2>
          <p className="text-gray-600 mt-1">Manage your room listings and availability</p>
        </div>
      </div>

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

      {/* Room Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4 animate-pulse">
              <Hotel className="w-8 h-8 text-blue-600" />
            </div>
            <p className="text-gray-600">Loading rooms...</p>
          </div>
        ) : rooms.length === 0 ? (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-blue-100 rounded-full mb-6">
              <Hotel className="w-12 h-12 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {activeTab === 'my-rooms' ? 'No rooms yet' : 'No rooms found'}
            </h3>
            <p className="text-gray-600 mb-6">
              {activeTab === 'my-rooms' 
                ? 'Create your first room listing to get started' 
                : 'Check back later for new room listings'
              }
            </p>
            {activeTab === 'my-rooms' && (
              <button 
                onClick={() => setShowCreateForm(true)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200"
              >
                <Plus className="w-5 h-5" />
                Add Your First Room
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rooms.map((room) => (
              <div key={room.roomId} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 group">
                {/* Room Image */}
                <div className="relative h-48 bg-gradient-to-br from-blue-100 to-indigo-100">
                  {room.roomImages && room.roomImages.length > 0 ? (
                    <img
                      src={room.roomImages[0]}
                      alt={room.roomName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Hotel className="w-16 h-16 text-blue-500" />
                    </div>
                  )}
                  
                  {/* Property Type Badge */}
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg px-2 py-1">
                    <span className="text-xs font-medium text-gray-700">
                      {getPropertyTypeDisplay(room.propertyType)}
                    </span>
                  </div>

                  {/* Action Buttons */}
                  {activeTab === 'my-rooms' && (
                    <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => {
                          setSelectedRoom(room);
                          setShowAvailabilityManager(true);
                        }}
                        className="w-8 h-8 bg-white/90 backdrop-blur-sm rounded-lg flex items-center justify-center hover:bg-white transition-colors"
                        title="Manage Availability"
                      >
                        <Calendar className="w-4 h-4 text-gray-600" />
                      </button>
                      <button className="w-8 h-8 bg-white/90 backdrop-blur-sm rounded-lg flex items-center justify-center hover:bg-white transition-colors">
                        <Edit2 className="w-4 h-4 text-gray-600" />
                      </button>
                      <button 
                        onClick={() => deleteRoom(room.roomId)}
                        className="w-8 h-8 bg-white/90 backdrop-blur-sm rounded-lg flex items-center justify-center hover:bg-red-50 transition-colors"
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
                      {room.roomName}
                    </h3>
                  </div>
                  
                  <div className="flex items-center gap-2 text-gray-600 mb-3">
                    <span className="text-sm">{room.roomType} Room</span>
                    {room.bedAvailable && (
                      <>
                        <span className="text-gray-400">•</span>
                        <span className="text-sm">{room.bedAvailable} Bed</span>
                      </>
                    )}
                  </div>

                  {/* Pricing */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-500">1 Guest</p>
                      <p className="text-sm font-medium">₹{room.priceForOneGuest}</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-500">2 Guests</p>
                      <p className="text-sm font-medium">₹{room.priceForTwoGuest}</p>
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
                        {room.numberOfRooms} Available
                      </span>
                    </div>
                  </div>

                  {/* View Details Button */}
                  <button 
                    onClick={() => {
                      setSelectedRoom(room);
                      setShowRoomDetails(true);
                    }}
                    className="w-full py-2 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  // Search View
  const SearchView = () => (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h2 className="text-2xl font-bold text-gray-900">Search Rooms</h2>
          <p className="text-gray-600 mt-1">Find the perfect room for your stay</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Form */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Room Name</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchData.roomName}
                  onChange={(e) => setSearchData(prev => ({ ...prev, roomName: e.target.value }))}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Enter room name"
                />
              </div>
            </div>

            <div className="flex items-end">
              <button
                onClick={handleSearch}
                disabled={loading}
                className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Search className="w-5 h-5" />
                )}
                Search
              </button>
            </div>
          </div>

          {/* Quick Filters */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Min Price (₹)</label>
              <input
                type="number"
                value={searchData.minPrice}
                onChange={(e) => setSearchData(prev => ({ ...prev, minPrice: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Min"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Price (₹)</label>
              <input
                type="number"
                value={searchData.maxPrice}
                onChange={(e) => setSearchData(prev => ({ ...prev, maxPrice: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Max"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Room Type</label>
              <select
                value={searchData.roomType}
                onChange={(e) => setSearchData(prev => ({ ...prev, roomType: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="">Any Type</option>
                <option value="SINGLE">Single</option>
                <option value="DOUBLE">Double</option>
                <option value="FAMILY">Family</option>
                <option value="APARTMENT">Apartment</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Property Type</label>
              <select
                value={searchData.propertyType}
                onChange={(e) => setSearchData(prev => ({ ...prev, propertyType: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="">Any Property</option>
                <option value="HOTEL">Hotel</option>
                <option value="HOSTEL">Hostel</option>
                <option value="MAN_STAY">Man Stay</option>
                <option value="VILLA">Villa</option>
              </select>
            </div>
          </div>
        </div>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-6">
              Search Results ({searchResults.length} rooms found)
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {searchResults.map((room) => (
                <div key={room.roomId} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300">
                  <div className="relative h-48 bg-gradient-to-br from-purple-100 to-pink-100">
                    {room.roomImages && room.roomImages.length > 0 ? (
                      <img
                        src={room.roomImages[0]}
                        alt={room.roomName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Hotel className="w-16 h-16 text-purple-500" />
                      </div>
                    )}
                    
                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg px-2 py-1">
                      <span className="text-xs font-medium text-gray-700">
                        {getPropertyTypeDisplay(room.propertyType)}
                      </span>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-2">
                      {getRoomTypeIcon(room.roomType)}
                      <h4 className="text-xl font-bold text-gray-900 line-clamp-1">
                        {room.roomName}
                      </h4>
                    </div>
                    
                    <div className="flex items-center gap-2 text-gray-600 mb-3">
                      <span className="text-sm">{room.roomType} Room</span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 mb-4">
                      <div className="text-center p-2 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-500">Base</p>
                        <p className="text-sm font-medium">₹{room.basePrice}</p>
                      </div>
                      <div className="text-center p-2 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-500">1 Guest</p>
                        <p className="text-sm font-medium">₹{room.priceForOneGuest}</p>
                      </div>
                      <div className="text-center p-2 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-500">2 Guests</p>
                        <p className="text-sm font-medium">₹{room.priceForTwoGuest}</p>
                      </div>
                    </div>

                    <button 
                      onClick={() => {
                        setSelectedRoom(room);
                        setShowRoomDetails(true);
                      }}
                      className="w-full py-2 px-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 flex items-center justify-center gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {searchResults.length === 0 && searchData.roomName && !loading && (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-purple-100 rounded-full mb-6">
              <Search className="w-12 h-12 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No rooms found</h3>
            <p className="text-gray-600">Try adjusting your search criteria or search for a different room name.</p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      {currentView === 'dashboard' && <DashboardView />}
      {currentView === 'search' && <SearchView />}

      {/* Room Details Modal - Simplified version */}
      {showRoomDetails && selectedRoom && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{selectedRoom.roomName}</h2>
                  <p className="text-gray-600">{selectedRoom.roomType} Room • {getPropertyTypeDisplay(selectedRoom.propertyType)}</p>
                </div>
                <button 
                  onClick={() => {
                    setShowRoomDetails(false);
                    setSelectedRoom(null);
                  }}
                  className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Room Images */}
              {selectedRoom.roomImages && selectedRoom.roomImages.length > 0 && (
                <div className="mb-6">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {selectedRoom.roomImages.map((image, index) => (
                      <img
                        key={index}
                        src={image}
                        alt={`Room ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Room Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Room Details</h3>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-medium">Type:</span> {selectedRoom.roomType}</p>
                      <p><span className="font-medium">Bed:</span> {selectedRoom.bedAvailable}</p>
                      <p><span className="font-medium">Bathroom:</span> {selectedRoom.bathroomType}</p>
                      <p><span className="font-medium">Available Rooms:</span> {selectedRoom.numberOfRooms}</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Pricing</h3>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-medium">Base Price:</span> ₹{selectedRoom.basePrice}</p>
                      <p><span className="font-medium">1 Guest:</span> ₹{selectedRoom.priceForOneGuest}</p>
                      <p><span className="font-medium">2 Guests:</span> ₹{selectedRoom.priceForTwoGuest}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Timing</h3>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-medium">Check-in:</span> {selectedRoom.checkinTime}</p>
                      <p><span className="font-medium">Check-out:</span> {selectedRoom.checkoutTime}</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Policies</h3>
                    <div className="space-y-2 text-sm">
                      <p className="flex items-center gap-2">
                        {selectedRoom.childrenAllowed ? <Check className="w-4 h-4 text-green-600" /> : <X className="w-4 h-4 text-red-600" />}
                        Children Allowed
                      </p>
                      <p className="flex items-center gap-2">
                        {selectedRoom.petAllowed ? <Check className="w-4 h-4 text-green-600" /> : <X className="w-4 h-4 text-red-600" />}
                        Pets Allowed
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Amenities */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">Amenities & Features</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {selectedRoom.breakfastIncluded && (
                    <div className="flex items-center gap-2 text-sm">
                      <Coffee className="w-4 h-4 text-green-600" />
                      Breakfast Included
                    </div>
                  )}
                  {selectedRoom.parkingAvailable && (
                    <div className="flex items-center gap-2 text-sm">
                      <Car className="w-4 h-4 text-blue-600" />
                      Parking Available
                    </div>
                  )}
                  {selectedRoom.generalAmenities?.map((amenity, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 text-gray-600" />
                      {amenity}
                    </div>
                  ))}
                </div>
              </div>

              {/* Languages */}
              {selectedRoom.languages && selectedRoom.languages.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Languages Spoken</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedRoom.languages.map((language, index) => (
                      <span key={index} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                        {language}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Availability Manager Modal */}
      {showAvailabilityManager && selectedRoom && (
        <RoomAvailabilityManager 
          roomId={selectedRoom.roomId}
          onClose={() => {
            setShowAvailabilityManager(false);
            setSelectedRoom(null);
          }}
        />
      )}

      {/* Create Room Form Modal - Simplified version */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Create New Room</h2>
                <button 
                  onClick={() => setShowCreateForm(false)}
                  className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="text-center py-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                  <Plus className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Room Creation Form</h3>
                <p className="text-gray-600 mb-6">The complete room creation form would go here with all the fields from your RoomRequestDTO.</p>
                <p className="text-sm text-gray-500">
                  This includes: hotel selection, room details, pricing, amenities, invoice details, and image upload functionality.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Simple Room Availability Manager Component (embedded)
const RoomAvailabilityManager = ({ roomId, onClose }) => {
  const [availability, setAvailability] = useState([]);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    // Simulate loading availability data
    setTimeout(() => {
      const simulatedData = [];
      const today = new Date();
      
      for (let i = 0; i < 30; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        
        const totalRooms = 10;
        const bookedRooms = Math.floor(Math.random() * totalRooms);
        const availableRooms = totalRooms - bookedRooms;
        
        simulatedData.push({
          date: date.toISOString().split('T')[0],
          totalRooms,
          availableRooms,
          bookedRooms
        });
      }
      
      setAvailability(simulatedData);
      setLoading(false);
    }, 1000);
  }, [roomId]);

  const getAvailabilityStatus = (availableRooms, totalRooms) => {
    const percentage = (availableRooms / totalRooms) * 100;
    
    if (percentage === 0) return { status: 'full', color: 'bg-red-500', text: 'Full' };
    if (percentage <= 25) return { status: 'low', color: 'bg-orange-500', text: 'Low' };
    if (percentage <= 50) return { status: 'medium', color: 'bg-yellow-500', text: 'Medium' };
    return { status: 'high', color: 'bg-green-500', text: 'Available' };
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Room Availability</h2>
              <p className="text-gray-600">30-day availability overview</p>
            </div>
            <button 
              onClick={onClose}
              className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="w-6 h-6 animate-spin text-gray-400" />
              <span className="ml-2 text-gray-600">Loading availability...</span>
            </div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {availability.map((day, index) => {
                const status = getAvailabilityStatus(day.availableRooms, day.totalRooms);
                const date = new Date(day.date);
                const isToday = day.date === new Date().toISOString().split('T')[0];
                
                return (
                  <div
                    key={index}
                    className={`flex items-center justify-between p-3 rounded-lg border ${
                      isToday ? 'border-blue-300 bg-blue-50' : 'border-gray-200 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${status.color}`}></div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {date.toLocaleDateString('en-US', { 
                            weekday: 'short', 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                          {isToday && <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">Today</span>}
                        </p>
                        <p className="text-sm text-gray-600">{status.text}</p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className="font-medium text-gray-900">
                        {day.availableRooms}/{day.totalRooms}
                      </p>
                      <p className="text-xs text-gray-500">available</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompleteRoomApp;