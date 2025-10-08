import React, { useState } from 'react';
import { Search, MapPin, Clock, Star, Filter, Bed, Users, Hotel, Eye } from 'lucide-react';

const RoomSearch = () => {
  const [searchData, setSearchData] = useState({
    roomName: '',
    minPrice: '',
    maxPrice: '',
    roomType: '',
    propertyType: '',
    breakfastIncluded: false,
    parkingAvailable: false,
    childrenAllowed: false,
    petAllowed: false
  });
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [showRoomDetails, setShowRoomDetails] = useState(false);

  const API_BASE_URL = 'http://localhost:8083/api/rooms';

  const roomTypes = ['SINGLE', 'DOUBLE', 'TWIN', 'TRIPLE', 'QUAD', 'FAMILY', 'APARTMENT'];
  const propertyTypes = ['HOTEL', 'HOSTEL', 'MAN_STAY', 'VILLA'];

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
        if (searchData.breakfastIncluded) {
          results = results.filter(room => room.breakfastIncluded);
        }
        if (searchData.parkingAvailable) {
          results = results.filter(room => room.parkingAvailable);
        }
        if (searchData.childrenAllowed) {
          results = results.filter(room => room.childrenAllowed);
        }
        if (searchData.petAllowed) {
          results = results.filter(room => room.petAllowed);
        }

        setSearchResults(results);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Search Rooms</h1>
        <p className="text-gray-600">Find the perfect room for your stay</p>
      </div>

      {/* Search Form */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Room Name</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchData.roomName}
                onChange={(e) => setSearchData(prev => ({ ...prev, roomName: e.target.value }))}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter room name"
              />
            </div>
          </div>

          <div className="flex items-end">
            <button
              onClick={handleSearch}
              disabled={loading}
              className="w-full py-3 px-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>
        </div>

        {/* Advanced Filters Toggle */}
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium mb-4"
        >
          <Filter className="w-4 h-4" />
          {showAdvanced ? 'Hide' : 'Show'} Advanced Filters
        </button>

        {/* Advanced Filters */}
        {showAdvanced && (
          <div className="border-t border-gray-200 pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Price Range */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Price Range (₹)</label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={searchData.minPrice}
                    onChange={(e) => setSearchData(prev => ({ ...prev, minPrice: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={searchData.maxPrice}
                    onChange={(e) => setSearchData(prev => ({ ...prev, maxPrice: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Room Type */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Room Type</label>
                <select
                  value={searchData.roomType}
                  onChange={(e) => setSearchData(prev => ({ ...prev, roomType: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Any Type</option>
                  {roomTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              {/* Property Type */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Property Type</label>
                <select
                  value={searchData.propertyType}
                  onChange={(e) => setSearchData(prev => ({ ...prev, propertyType: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Any Property</option>
                  {propertyTypes.map(type => (
                    <option key={type} value={type}>{getPropertyTypeDisplay(type)}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Amenities Checkboxes */}
            <div className="mt-6">
              <label className="block text-sm font-semibold text-gray-700 mb-3">Amenities & Features</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={searchData.breakfastIncluded}
                    onChange={(e) => setSearchData(prev => ({ ...prev, breakfastIncluded: e.target.checked }))}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Breakfast Included</span>
                </label>

                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={searchData.parkingAvailable}
                    onChange={(e) => setSearchData(prev => ({ ...prev, parkingAvailable: e.target.checked }))}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Parking Available</span>
                </label>

                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={searchData.childrenAllowed}
                    onChange={(e) => setSearchData(prev => ({ ...prev, childrenAllowed: e.target.checked }))}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Child Friendly</span>
                </label>

                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={searchData.petAllowed}
                    onChange={(e) => setSearchData(prev => ({ ...prev, petAllowed: e.target.checked }))}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Pet Friendly</span>
                </label>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Search Results ({searchResults.length} rooms found)
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {searchResults.map((room) => (
              <div key={room.roomId} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
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
                  
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg px-2 py-1">
                    <span className="text-xs font-medium text-gray-700">
                      {getPropertyTypeDisplay(room.propertyType)}
                    </span>
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{room.roomName}</h3>
                  <div className="flex items-center gap-2 text-gray-600 mb-3">
                    <span className="text-sm">{room.roomType} Room</span>
                    {room.bedAvailable && (
                      <>
                        <span className="text-gray-400">•</span>
                        <span className="text-sm">{room.bedAvailable} Bed</span>
                      </>
                    )}
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

                  <button 
                    onClick={() => {
                      setSelectedRoom(room);
                      setShowRoomDetails(true);
                    }}
                    className="w-full py-2 px-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
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

      {/* No Results */}
      {searchResults.length === 0 && searchData.roomName && !loading && (
        <div className="text-center py-12">
          <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No rooms found</h3>
          <p className="text-gray-600">Try adjusting your search criteria or search for a different room name.</p>
        </div>
      )}

      {/* Room Details Modal */}
      {showRoomDetails && selectedRoom && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
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

              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Pricing</h3>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-500">Base</p>
                      <p className="text-lg font-bold text-gray-900">₹{selectedRoom.basePrice}</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-500">1 Guest</p>
                      <p className="text-lg font-bold text-gray-900">₹{selectedRoom.priceForOneGuest}</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-500">2 Guests</p>
                      <p className="text-lg font-bold text-gray-900">₹{selectedRoom.priceForTwoGuest}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Room Features</h3>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2">
                      {selectedRoom.breakfastIncluded ? <Check className="w-4 h-4 text-green-600" /> : <X className="w-4 h-4 text-red-600" />}
                      Breakfast Included
                    </div>
                    <div className="flex items-center gap-2">
                      {selectedRoom.parkingAvailable ? <Check className="w-4 h-4 text-green-600" /> : <X className="w-4 h-4 text-red-600" />}
                      Parking Available
                    </div>
                    <div className="flex items-center gap-2">
                      {selectedRoom.childrenAllowed ? <Check className="w-4 h-4 text-green-600" /> : <X className="w-4 h-4 text-red-600" />}
                      Children Allowed
                    </div>
                    <div className="flex items-center gap-2">
                      {selectedRoom.petAllowed ? <Check className="w-4 h-4 text-green-600" /> : <X className="w-4 h-4 text-red-600" />}
                      Pets Allowed
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <button className="w-full py-3 px-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors">
                    Book Now
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


export default RoomSearch;