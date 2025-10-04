// src/components/HotelDetails.jsx
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Star, MapPin, Clock, Users, Wifi, Car, Coffee, CheckCircle } from 'lucide-react';

const HotelDetails = ({ hotelId, onBack }) => {
  const [hotel, setHotel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const API_BASE_URL = 'http://localhost:8082/api/hotels';

  useEffect(() => {
    fetchHotelDetails();
  }, [hotelId]);

  const fetchHotelDetails = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/public/${hotelId}`);
      if (response.ok) {
        const data = await response.json();
        setHotel(data.data);
      }
    } catch (error) {
      console.error('Error fetching hotel details:', error);
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

  const getAmenityIcon = (amenityName) => {
    const name = amenityName.toLowerCase();
    if (name.includes('wifi')) return <Wifi className="w-4 h-4" />;
    if (name.includes('parking') || name.includes('car')) return <Car className="w-4 h-4" />;
    if (name.includes('restaurant') || name.includes('food')) return <Coffee className="w-4 h-4" />;
    return <CheckCircle className="w-4 h-4" />;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-100 rounded-full mb-4 animate-pulse">
            <Hotel className="w-8 h-8 text-amber-600" />
          </div>
          <p className="text-gray-600">Loading hotel details...</p>
        </div>
      </div>
    );
  }

  if (!hotel) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Hotel not found</h2>
          <p className="text-gray-600 mb-4">The hotel you're looking for doesn't exist.</p>
          <button
            onClick={onBack}
            className="px-6 py-3 bg-gradient-to-r from-amber-600 to-orange-600 text-white font-semibold rounded-xl hover:from-amber-700 hover:to-orange-700 transition-all duration-200"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 py-6">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Back
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{hotel.hotelName}</h1>
              <div className="flex items-center gap-2 mt-1">
                <MapPin className="w-4 h-4 text-gray-500" />
                <span className="text-gray-600">{hotel.hotelLocation}</span>
                {hotel.rating && (
                  <>
                    <span className="text-gray-400">•</span>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      <span className="text-gray-600">{hotel.rating}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Images Gallery */}
            {hotel.hotelImages && hotel.hotelImages.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="relative h-96">
                  <img
                    src={hotel.hotelImages[currentImageIndex]}
                    alt={hotel.hotelName}
                    className="w-full h-full object-cover"
                  />
                  
                  {hotel.hotelImages.length > 1 && (
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                      {hotel.hotelImages.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentImageIndex(index)}
                          className={`w-3 h-3 rounded-full transition-all ${
                            index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </div>
                
                {hotel.hotelImages.length > 1 && (
                  <div className="p-4">
                    <div className="flex gap-2 overflow-x-auto">
                      {hotel.hotelImages.map((image, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentImageIndex(index)}
                          className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                            index === currentImageIndex ? 'border-amber-500' : 'border-transparent'
                          }`}
                        >
                          <img
                            src={image}
                            alt={`View ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Descriptions */}
            {hotel.descriptions && hotel.descriptions.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">About This Hotel</h2>
                <div className="space-y-6">
                  {hotel.descriptions.map((desc, index) => (
                    <div key={index}>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{desc.title}</h3>
                      <p className="text-gray-600 leading-relaxed">{desc.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Amenities */}
            {hotel.amenities && hotel.amenities.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Amenities</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {hotel.amenities.map((amenity, index) => (
                    <div
                      key={index}
                      className={`flex items-center gap-3 p-3 rounded-lg border ${
                        amenity.available
                          ? 'border-green-200 bg-green-50'
                          : 'border-gray-200 bg-gray-50'
                      }`}
                    >
                      <div className={`${amenity.available ? 'text-green-600' : 'text-gray-400'}`}>
                        {getAmenityIcon(amenity.name)}
                      </div>
                      <span className={`font-medium ${amenity.available ? 'text-green-900' : 'text-gray-500'}`}>
                        {amenity.name}
                      </span>
                      {!amenity.available && (
                        <span className="text-xs text-gray-500 ml-auto">Not Available</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Google Map */}
            {hotel.googleMapScreenshot && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Location</h2>
                <div className="rounded-xl overflow-hidden">
                  <img
                    src={hotel.googleMapScreenshot}
                    alt="Hotel location map"
                    className="w-full h-64 object-cover"
                  />
                </div>
                {hotel.locationLink && (
                  <div className="mt-4">
                    <a
                      href={hotel.locationLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <MapPin className="w-4 h-4" />
                      View on Google Maps
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Check-in/Check-out Info */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Check-in Details</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">Check-in</span>
                  </div>
                  <span className="font-semibold text-gray-900">{formatTime(hotel.checkinTime)}</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">Check-out</span>
                  </div>
                  <span className="font-semibold text-gray-900">{formatTime(hotel.checkoutTime)}</span>
                </div>
              </div>
            </div>

            {/* Extra Beds Info */}
            {hotel.extraBeds > 0 && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Extra Accommodation</h3>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-amber-600" />
                    <span className="font-medium text-gray-900">
                      {hotel.extraBeds} Extra Beds Available
                    </span>
                  </div>
                  
                  {hotel.perExtraBedPrice > 0 && (
                    <div className="p-3 bg-amber-50 rounded-lg">
                      <p className="text-sm text-amber-800">
                        <span className="font-semibold">₹{hotel.perExtraBedPrice}</span> per extra bed
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Contact/Booking Section */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Book This Hotel</h3>
              
              <div className="space-y-3">
                <button className="w-full py-3 px-4 bg-gradient-to-r from-amber-600 to-orange-600 text-white font-semibold rounded-xl hover:from-amber-700 hover:to-orange-700 transition-all duration-200 shadow-lg hover:shadow-xl">
                  Book Now
                </button>
                
                <button className="w-full py-3 px-4 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors">
                  Contact Hotel
                </button>
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-500 text-center">
                  Best rates guaranteed • Free cancellation
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HotelDetails;