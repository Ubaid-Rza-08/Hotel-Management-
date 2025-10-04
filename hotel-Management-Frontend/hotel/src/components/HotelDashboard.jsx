// src/components/HotelDashboard.jsx
import React, { useState, useEffect } from 'react';
import { Plus, Hotel, Search, Filter, Star, MapPin, Clock, Users, Edit2, Trash2, Eye } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const HotelDashboard = () => {
  const { token } = useAuth();
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('my-hotels');

  const API_BASE_URL = 'http://localhost:8082/api/hotels';

  useEffect(() => {
    if (activeTab === 'my-hotels') {
      fetchMyHotels();
    } else {
      fetchAllHotels();
    }
  }, [activeTab]);

  const fetchMyHotels = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/my-hotels`, {
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
    } finally {
      setLoading(false);
    }
  };

  const fetchAllHotels = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/public/all`);
      if (response.ok) {
        const data = await response.json();
        setHotels(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching all hotels:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteHotel = async (hotelId) => {
    if (!confirm('Are you sure you want to delete this hotel?')) return;

    try {
      const response = await fetch(`${API_BASE_URL}/delete/${hotelId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        fetchMyHotels();
      }
    } catch (error) {
      console.error('Error deleting hotel:', error);
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
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-100 rounded-full mb-4 animate-pulse">
            <Hotel className="w-8 h-8 text-amber-600" />
          </div>
          <p className="text-gray-600">Loading hotels...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Hotel Management</h1>
              <p className="text-gray-600 mt-1">Manage your hotel listings and bookings</p>
            </div>
            <button className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-600 to-orange-600 text-white font-semibold rounded-xl hover:from-amber-700 hover:to-orange-700 transition-all duration-200 shadow-lg hover:shadow-xl">
              <Plus className="w-5 h-5" />
              Add New Hotel
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="flex space-x-1 bg-white rounded-xl p-1 shadow-sm">
          <button
            onClick={() => setActiveTab('my-hotels')}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
              activeTab === 'my-hotels'
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            My Hotels
          </button>
          <button
            onClick={() => setActiveTab('all-hotels')}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
              activeTab === 'all-hotels'
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            Browse All Hotels
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {hotels.length === 0 ? (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-amber-100 rounded-full mb-6">
              <Hotel className="w-12 h-12 text-amber-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {activeTab === 'my-hotels' ? 'No hotels yet' : 'No hotels found'}
            </h3>
            <p className="text-gray-600 mb-6">
              {activeTab === 'my-hotels' 
                ? 'Create your first hotel listing to get started' 
                : 'Check back later for new hotel listings'
              }
            </p>
            {activeTab === 'my-hotels' && (
              <button className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-600 to-orange-600 text-white font-semibold rounded-xl hover:from-amber-700 hover:to-orange-700 transition-all duration-200">
                <Plus className="w-5 h-5" />
                Add Your First Hotel
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {hotels.map((hotel) => (
              <div key={hotel.hotelId} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 group">
                {/* Hotel Image */}
                <div className="relative h-48 bg-gradient-to-br from-amber-100 to-orange-100">
                  {hotel.hotelImages && hotel.hotelImages.length > 0 ? (
                    <img
                      src={hotel.hotelImages[0]}
                      alt={hotel.hotelName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Hotel className="w-16 h-16 text-amber-500" />
                    </div>
                  )}
                  
                  {/* Rating Badge */}
                  {hotel.rating && (
                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg px-2 py-1 flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      <span className="text-sm font-medium">{hotel.rating}</span>
                    </div>
                  )}

                  {/* Action Buttons */}
                  {activeTab === 'my-hotels' && (
                    <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="w-8 h-8 bg-white/90 backdrop-blur-sm rounded-lg flex items-center justify-center hover:bg-white transition-colors">
                        <Edit2 className="w-4 h-4 text-gray-600" />
                      </button>
                      <button 
                        onClick={() => deleteHotel(hotel.hotelId)}
                        className="w-8 h-8 bg-white/90 backdrop-blur-sm rounded-lg flex items-center justify-center hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Hotel Info */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-1">
                    {hotel.hotelName}
                  </h3>
                  
                  <div className="flex items-center gap-2 text-gray-600 mb-3">
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm line-clamp-1">{hotel.hotelLocation}</span>
                  </div>

                  {/* Check-in/Check-out Times */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <Clock className="w-4 h-4 text-gray-500 mx-auto mb-1" />
                      <p className="text-xs text-gray-500">Check-in</p>
                      <p className="text-sm font-medium">{formatTime(hotel.checkinTime)}</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <Clock className="w-4 h-4 text-gray-500 mx-auto mb-1" />
                      <p className="text-xs text-gray-500">Check-out</p>
                      <p className="text-sm font-medium">{formatTime(hotel.checkoutTime)}</p>
                    </div>
                  </div>

                  {/* Amenities */}
                  {hotel.amenities && hotel.amenities.length > 0 && (
                    <div className="mb-4">
                      <p className="text-xs text-gray-500 mb-2">Amenities</p>
                      <div className="flex flex-wrap gap-1">
                        {hotel.amenities.slice(0, 3).map((amenity, index) => (
                          <span
                            key={index}
                            className="text-xs px-2 py-1 bg-amber-100 text-amber-700 rounded-full"
                          >
                            {amenity.name}
                          </span>
                        ))}
                        {hotel.amenities.length > 3 && (
                          <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                            +{hotel.amenities.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Extra Beds Info */}
                  {hotel.extraBeds > 0 && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                      <Users className="w-4 h-4" />
                      <span>{hotel.extraBeds} extra beds available</span>
                      {hotel.perExtraBedPrice && (
                        <span className="text-amber-600 font-medium">
                          ₹{hotel.perExtraBedPrice}/bed
                        </span>
                      )}
                    </div>
                  )}

                  {/* View Details Button */}
                  <button className="w-full py-2 px-4 bg-gradient-to-r from-amber-600 to-orange-600 text-white font-medium rounded-lg hover:from-amber-700 hover:to-orange-700 transition-all duration-200 flex items-center justify-center gap-2">
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
};

export default HotelDashboard;