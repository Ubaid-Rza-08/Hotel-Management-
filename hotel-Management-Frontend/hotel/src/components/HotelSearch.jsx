// components/RoomSearch.jsx
// import React, { useState } from 'react';
// import { Search, MapPin, Clock, Star, Filter, Bed, Users, Hotel, Eye, Car, Coffee, Check, X } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { Search, MapPin, Star, Filter, Hotel, Eye, Clock, Users } from 'lucide-react';

const HotelSearch = () => {
  const [searchData, setSearchData] = useState({
    hotelName: '',
    location: '',
    minRating: '',
    maxRating: '',
    checkinTime: '',
    checkoutTime: ''
  });
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const API_BASE_URL = 'http://localhost:8082/api/hotels';

  const handleSearch = async () => {
    if (!searchData.hotelName.trim()) {
      alert('Please enter a hotel name to search');
      return;
    }

    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('hotelName', searchData.hotelName);
      if (searchData.location) params.append('location', searchData.location);

      const response = await fetch(`${API_BASE_URL}/public/search?${params}`);
      
      if (response.ok) {
        const data = await response.json();
        let results = data.data || [];

        // Apply frontend filters
        if (searchData.minRating) {
          results = results.filter(hotel => (hotel.rating || 0) >= parseFloat(searchData.minRating));
        }
        if (searchData.maxRating) {
          results = results.filter(hotel => (hotel.rating || 0) <= parseFloat(searchData.maxRating));
        }

        setSearchResults(results);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (timeString) => {
    if (!timeString) return 'Not set';
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Search Hotels</h1>
        <p className="text-gray-600">Find the perfect hotel for your stay</p>
      </div>

      {/* Search Form */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Hotel Name</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchData.hotelName}
                onChange={(e) => setSearchData(prev => ({ ...prev, hotelName: e.target.value }))}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter hotel name"
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

        {/* Advanced Filters */}
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium mb-4"
        >
          <Filter className="w-4 h-4" />
          {showAdvanced ? 'Hide' : 'Show'} Advanced Filters
        </button>

        {showAdvanced && (
          <div className="border-t border-gray-200 pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Location</label>
                <input
                  type="text"
                  value={searchData.location}
                  onChange={(e) => setSearchData(prev => ({ ...prev, location: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="City or area"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Min Rating</label>
                <select
                  value={searchData.minRating}
                  onChange={(e) => setSearchData(prev => ({ ...prev, minRating: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Any</option>
                  <option value="1">1+ Stars</option>
                  <option value="2">2+ Stars</option>
                  <option value="3">3+ Stars</option>
                  <option value="4">4+ Stars</option>
                  <option value="5">5 Stars</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Max Rating</label>
                <select
                  value={searchData.maxRating}
                  onChange={(e) => setSearchData(prev => ({ ...prev, maxRating: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Any</option>
                  <option value="5">5 Stars</option>
                  <option value="4">4 Stars</option>
                  <option value="3">3 Stars</option>
                  <option value="2">2 Stars</option>
                  <option value="1">1 Star</option>
                </select>
              </div>

              <div>
                <button
                  onClick={() => setSearchData({ hotelName: '', location: '', minRating: '', maxRating: '' })}
                  className="w-full py-2 px-3 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors mt-6"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Search Results ({searchResults.length} hotels found)
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {searchResults.map((hotel) => (
              <div key={hotel.hotelId} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                <div className="h-48 bg-gradient-to-br from-blue-100 to-indigo-100 relative">
                  {hotel.hotelImages && hotel.hotelImages.length > 0 ? (
                    <img
                      src={hotel.hotelImages[0]}
                      alt={hotel.hotelName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Hotel className="w-16 h-16 text-blue-500" />
                    </div>
                  )}
                  
                  {hotel.rating && (
                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg px-2 py-1 flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      <span className="text-sm font-medium">{hotel.rating}</span>
                    </div>
                  )}
                </div>

                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{hotel.hotelName}</h3>
                  <p className="text-sm text-gray-600 flex items-center mb-3">
                    <MapPin className="w-4 h-4 mr-1" />
                    {hotel.hotelLocation}
                  </p>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-center p-2 bg-gray-50 rounded-lg">
                      <Clock className="w-4 h-4 text-gray-500 mx-auto mb-1" />
                      <p className="text-xs text-gray-500">Check-in</p>
                      <p className="text-sm font-medium">{formatTime(hotel.checkinTime)}</p>
                    </div>
                    <div className="text-center p-2 bg-gray-50 rounded-lg">
                      <Clock className="w-4 h-4 text-gray-500 mx-auto mb-1" />
                      <p className="text-xs text-gray-500">Check-out</p>
                      <p className="text-sm font-medium">{formatTime(hotel.checkoutTime)}</p>
                    </div>
                  </div>

                  {hotel.extraBeds > 0 && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                      <Users className="w-4 h-4" />
                      <span>{hotel.extraBeds} extra beds available</span>
                      {hotel.perExtraBedPrice && (
                        <span className="text-blue-600 font-medium">
                          ₹{hotel.perExtraBedPrice}/bed
                        </span>
                      )}
                    </div>
                  )}

                  <button className="w-full py-2 px-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
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
      {searchResults.length === 0 && searchData.hotelName && !loading && (
        <div className="text-center py-12">
          <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No hotels found</h3>
          <p className="text-gray-600">Try adjusting your search criteria or search for a different hotel name.</p>
        </div>
      )}
    </div>
  );
};
export default HotelSearch;