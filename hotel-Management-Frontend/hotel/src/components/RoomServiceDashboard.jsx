
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
  Check
} from 'lucide-react';

const RoomServiceDashboard = () => {
  const [activeTab, setActiveTab] = useState('my-rooms');
  const [rooms, setRooms] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [showRoomDetails, setShowRoomDetails] = useState(false);

  const API_BASE_URL = 'http://localhost:8083/api/rooms';
  const HOTEL_API_BASE_URL = 'http://localhost:8082/api/hotels';

  // Mock token - replace with actual auth
  const token = 'your-auth-token';

  useEffect(() => {
    if (activeTab === 'my-rooms') {
      fetchMyRooms();
    } else {
      fetchAllRooms();
    }
    fetchMyHotels();
  }, [activeTab]);

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

  const getRoomTypeIcon = (roomType) => {
    switch (roomType?.toLowerCase()) {
      case 'single': return <Bed className="w-4 h-4" />;
      case 'double': return <Bed className="w-4 h-4" />;
      case 'family': return <Users className="w-4 h-4" />;
      case 'apartment': return <Building className="w-4 h-4" />;
      default: return <Hotel className="w-4 h-4" />;
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

  const getOutdoorViewDisplay = (outdoorView) => {
    const views = {
      'BALCONY': 'Balcony',
      'TERRACE': 'Terrace',
      'VIEW': 'Scenic View'
    };
    return views[outdoorView] || outdoorView;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4 animate-pulse">
            <Hotel className="w-8 h-8 text-blue-600" />
          </div>
          <p className="text-gray-600">Loading rooms...</p>
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
            </div>
            <button 
              onClick={() => setShowCreateForm(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <Plus className="w-5 h-5" />
              Add New Room
            </button>
          </div>
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

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {rooms.length === 0 ? (
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

      {/* Create Room Form Modal */}
      {showCreateForm && (
        <CreateRoomModal 
          hotels={hotels}
          onClose={() => setShowCreateForm(false)}
          onSuccess={() => {
            setShowCreateForm(false);
            fetchMyRooms();
          }}
        />
      )}
    </div>
  );
};
export default RoomServiceDashboard;