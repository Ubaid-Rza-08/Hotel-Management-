// src/components/CreateHotel.jsx
import React, { useState } from 'react';
import { ArrowLeft, Upload, X, Plus, MapPin, Clock, Star, Image, FileText } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const CreateHotel = ({ onBack }) => {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [hotelData, setHotelData] = useState({
    hotelName: '',
    rating: '',
    hotelLocation: '',
    locationLink: '',
    checkinTime: '',
    checkoutTime: '',
    extraBeds: 0,
    perExtraBedPrice: 0
  });
  
  const [descriptions, setDescriptions] = useState([{ title: '', description: '' }]);
  const [amenities, setAmenities] = useState([{ name: '', icon: '', available: true }]);
  const [hotelImages, setHotelImages] = useState([]);
  const [googleMapScreenshot, setGoogleMapScreenshot] = useState(null);
  const [error, setError] = useState('');

  const API_BASE_URL = 'http://localhost:8082/api/hotels';

  const addDescription = () => {
    if (descriptions.length < 5) {
      setDescriptions([...descriptions, { title: '', description: '' }]);
    }
  };

  const removeDescription = (index) => {
    setDescriptions(descriptions.filter((_, i) => i !== index));
  };

  const updateDescription = (index, field, value) => {
    const updated = descriptions.map((desc, i) => 
      i === index ? { ...desc, [field]: value } : desc
    );
    setDescriptions(updated);
  };

  const addAmenity = () => {
    if (amenities.length < 15) {
      setAmenities([...amenities, { name: '', icon: '', available: true }]);
    }
  };

  const removeAmenity = (index) => {
    setAmenities(amenities.filter((_, i) => i !== index));
  };

  const updateAmenity = (index, field, value) => {
    const updated = amenities.map((amenity, i) => 
      i === index ? { ...amenity, [field]: value } : amenity
    );
    setAmenities(updated);
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (hotelImages.length + files.length > 12) {
      setError('Maximum 12 images allowed');
      return;
    }
    setHotelImages([...hotelImages, ...files]);
    setError('');
  };

  const removeImage = (index) => {
    setHotelImages(hotelImages.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      
      // Add hotel data as JSON
      const hotelRequestData = {
        ...hotelData,
        descriptions: descriptions.filter(d => d.title && d.description),
        amenities: amenities.filter(a => a.name),
        rating: hotelData.rating ? parseFloat(hotelData.rating) : null
      };
      
      formData.append('hotel', JSON.stringify(hotelRequestData));

      // Add images
      hotelImages.forEach((image) => {
        formData.append('hotelImages', image);
      });

      // Add Google Map screenshot
      if (googleMapScreenshot) {
        formData.append('googleMapScreenshot', googleMapScreenshot);
      }

      const response = await fetch(`${API_BASE_URL}/create`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (response.ok) {
        onBack(); // Go back to dashboard
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to create hotel');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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
              Back to Dashboard
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Create New Hotel</h1>
              <p className="text-gray-600 mt-1">Add your hotel listing to the platform</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-800">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Basic Information
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Hotel Name *
                </label>
                <input
                  type="text"
                  required
                  value={hotelData.hotelName}
                  onChange={(e) => setHotelData({...hotelData, hotelName: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder="Enter hotel name"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Rating
                </label>
                <div className="relative">
                  <Star className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <select
                    value={hotelData.rating}
                    onChange={(e) => setHotelData({...hotelData, rating: e.target.value})}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  >
                    <option value="">Select rating</option>
                    <option value="1">1 Star</option>
                    <option value="2">2 Stars</option>
                    <option value="3">3 Stars</option>
                    <option value="4">4 Stars</option>
                    <option value="5">5 Stars</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Location *
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    required
                    value={hotelData.hotelLocation}
                    onChange={(e) => setHotelData({...hotelData, hotelLocation: e.target.value})}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    placeholder="Enter hotel location"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Location Link
                </label>
                <input
                  type="url"
                  value={hotelData.locationLink}
                  onChange={(e) => setHotelData({...hotelData, locationLink: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder="Google Maps link"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Check-in Time *
                </label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="time"
                    required
                    value={hotelData.checkinTime}
                    onChange={(e) => setHotelData({...hotelData, checkinTime: e.target.value})}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Check-out Time *
                </label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="time"
                    required
                    value={hotelData.checkoutTime}
                    onChange={(e) => setHotelData({...hotelData, checkoutTime: e.target.value})}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Extra Beds Available
                </label>
                <input
                  type="number"
                  min="0"
                  value={hotelData.extraBeds}
                  onChange={(e) => setHotelData({...hotelData, extraBeds: parseInt(e.target.value) || 0})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Price per Extra Bed
                </label>
                <input
                  type="number"
                  min="0"
                  value={hotelData.perExtraBedPrice}
                  onChange={(e) => setHotelData({...hotelData, perExtraBedPrice: parseInt(e.target.value) || 0})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder="Amount in ₹"
                />
              </div>
            </div>
          </div>

          {/* Hotel Images */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Image className="w-5 h-5" />
              Hotel Images (Max 12)
            </h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              {hotelImages.map((image, index) => (
                <div key={index} className="relative group">
                  <img
                    src={URL.createObjectURL(image)}
                    alt={`Hotel ${index + 1}`}
                    className="w-full h-24 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
              
              {hotelImages.length < 12 && (
                <label className="w-full h-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-amber-500 transition-colors">
                  <div className="text-center">
                    <Upload className="w-6 h-6 text-gray-400 mx-auto mb-1" />
                    <span className="text-xs text-gray-500">Add Image</span>
                  </div>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

          {/* Google Map Screenshot */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              Google Map Screenshot
            </h2>
            
            <label className="block w-full h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-amber-500 transition-colors">
              {googleMapScreenshot ? (
                <div className="relative">
                  <img
                    src={URL.createObjectURL(googleMapScreenshot)}
                    alt="Map screenshot"
                    className="h-28 object-cover rounded"
                  />
                  <button
                    type="button"
                    onClick={() => setGoogleMapScreenshot(null)}
                    className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="text-center">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <span className="text-sm text-gray-500">Upload map screenshot</span>
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setGoogleMapScreenshot(e.target.files[0])}
                className="hidden"
              />
            </label>
          </div>

          {/* Descriptions */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                Descriptions (Max 5)
              </h2>
              {descriptions.length < 5 && (
                <button
                  type="button"
                  onClick={addDescription}
                  className="flex items-center gap-2 px-4 py-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Description
                </button>
              )}
            </div>
            
            <div className="space-y-4">
              {descriptions.map((desc, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm font-medium text-gray-700">
                      Description {index + 1}
                    </span>
                    {descriptions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeDescription(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <input
                      type="text"
                      value={desc.title}
                      onChange={(e) => updateDescription(index, 'title', e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      placeholder="Title"
                    />
                    <div className="md:col-span-2">
                      <textarea
                        value={desc.description}
                        onChange={(e) => updateDescription(index, 'description', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                        placeholder="Description"
                        rows="2"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Amenities */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                Amenities (Max 15)
              </h2>
              {amenities.length < 15 && (
                <button
                  type="button"
                  onClick={addAmenity}
                  className="flex items-center gap-2 px-4 py-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Amenity
                </button>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {amenities.map((amenity, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm font-medium text-gray-700">
                      Amenity {index + 1}
                    </span>
                    {amenities.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeAmenity(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={amenity.name}
                      onChange={(e) => updateAmenity(index, 'name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      placeholder="Amenity name"
                    />
                    <input
                      type="text"
                      value={amenity.icon}
                      onChange={(e) => updateAmenity(index, 'icon', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      placeholder="Icon name (optional)"
                    />
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={amenity.available}
                        onChange={(e) => updateAmenity(index, 'available', e.target.checked)}
                        className="rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Available</span>
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={onBack}
              className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 px-4 bg-gradient-to-r from-amber-600 to-orange-600 text-white font-semibold rounded-xl hover:from-amber-700 hover:to-orange-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Creating Hotel...
                </>
              ) : (
                'Create Hotel'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateHotel;