// components/CreateRoom.jsx
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Upload, X, Check, Hotel, Bed } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const CreateRoom = ({ onBack }) => {
  const { user, token } = useAuth();
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]);
  const [formData, setFormData] = useState({
    hotelId: '',
    roomName: '',
    roomType: 'SINGLE',
    bedAvailable: 'TWIN',
    breakfastIncluded: false,
    parkingAvailable: false,
    languages: [],
    checkinTime: '14:00',
    checkoutTime: '11:00',
    childrenAllowed: false,
    petAllowed: false,
    bathroomType: 'SEPARATE',
    bathroomItems: [],
    propertyType: 'HOTEL',
    locationLink: '',
    generalAmenities: [],
    outdoorViews: [],
    foodDrinkItems: [],
    basePrice: '',
    priceForOneGuest: '',
    priceForTwoGuest: '',
    numberOfRooms: 1,
    invoiceDetails: {
      invoiceName: '',
      propertyName: '',
      propertyAddress: '',
      licenseNumber: '',
      issuingDate: '',
      expiryDate: '',
      gstRegistered: false,
      tradeName: '',
      gstNumber: '',
      panNumber: '',
      state: '',
      aadharNumber: ''
    }
  });

  const API_BASE_URL = 'http://localhost:8083/api/rooms';
  const HOTEL_API_BASE_URL = 'http://localhost:8082/api/hotels';

  const roomTypes = ['SINGLE', 'DOUBLE', 'TWIN', 'TRIPLE', 'QUAD', 'FAMILY', 'APARTMENT'];
  const bedTypes = ['TWIN', 'FULL_BED', 'KING'];
  const propertyTypes = ['HOTEL', 'HOSTEL', 'MAN_STAY', 'VILLA'];
  const outdoorViews = ['BALCONY', 'TERRACE', 'VIEW'];
  const generalAmenities = ['CLOTH_RACK', 'FLAT_SCREEN_TV', 'AIR_CONDITIONING', 'DESK', 'TOWELS', 'WARDROBE', 'HEATING', 'FAN', 'SAFE'];
  const bathroomItems = ['TOILET_PAPER', 'SHOWER', 'TOWEL', 'BATHTUB', 'SLIPPER', 'FREE_TOILETRIES'];
  const foodDrinkItems = ['ELECTRIC_KETTLE', 'TEA_COFFEE_MAKER', 'DRINKING_TABLE', 'MICROWAVE'];

  useEffect(() => {
    fetchMyHotels();
  }, []);

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

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 5) {
      alert('Maximum 5 images allowed');
      return;
    }
    setSelectedImages(files);
  };

  const removeImage = (index) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('room', JSON.stringify(formData));
      
      selectedImages.forEach((image) => {
        formDataToSend.append('roomImages', image);
      });

      const response = await fetch(`${API_BASE_URL}/create`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataToSend
      });

      if (response.ok) {
        alert('Room created successfully!');
        onBack();
      } else {
        const errorData = await response.json();
        alert('Failed to create room: ' + (errorData.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error creating room:', error);
      alert('Failed to create room. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleArrayItem = (array, item, setter) => {
    if (array.includes(item)) {
      setter(array.filter(i => i !== item));
    } else {
      setter([...array, item]);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
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
              <h1 className="text-3xl font-bold text-gray-900">Create New Room</h1>
              <p className="text-gray-600">Add a new room to your hotel listings</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Basic Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Hotel *</label>
                <select
                  value={formData.hotelId}
                  onChange={(e) => setFormData({...formData, hotelId: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Select a hotel</option>
                  {hotels.map(hotel => (
                    <option key={hotel.hotelId} value={hotel.hotelId}>
                      {hotel.hotelName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Room Name *</label>
                <input
                  type="text"
                  value={formData.roomName}
                  onChange={(e) => setFormData({...formData, roomName: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter room name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Room Type</label>
                <select
                  value={formData.roomType}
                  onChange={(e) => setFormData({...formData, roomType: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {roomTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Bed Type</label>
                <select
                  value={formData.bedAvailable}
                  onChange={(e) => setFormData({...formData, bedAvailable: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {bedTypes.map(type => (
                    <option key={type} value={type}>{type.replace('_', ' ')}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Property Type</label>
                <select
                  value={formData.propertyType}
                  onChange={(e) => setFormData({...formData, propertyType: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {propertyTypes.map(type => (
                    <option key={type} value={type}>{type.replace('_', ' ')}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Number of Rooms *</label>
                <input
                  type="number"
                  min="1"
                  max="1000"
                  value={formData.numberOfRooms}
                  onChange={(e) => setFormData({...formData, numberOfRooms: parseInt(e.target.value)})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Pricing</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Base Price (₹) *</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.basePrice}
                  onChange={(e) => setFormData({...formData, basePrice: parseFloat(e.target.value)})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Price for One Guest (₹) *</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.priceForOneGuest}
                  onChange={(e) => setFormData({...formData, priceForOneGuest: parseFloat(e.target.value)})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Price for Two Guests (₹) *</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.priceForTwoGuest}
                  onChange={(e) => setFormData({...formData, priceForTwoGuest: parseFloat(e.target.value)})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>
          </div>

          {/* Timing & Policies */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Timing & Policies</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Check-in Time</label>
                <input
                  type="time"
                  value={formData.checkinTime}
                  onChange={(e) => setFormData({...formData, checkinTime: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Check-out Time</label>
                <input
                  type="time"
                  value={formData.checkoutTime}
                  onChange={(e) => setFormData({...formData, checkoutTime: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Bathroom Type</label>
                <select
                  value={formData.bathroomType}
                  onChange={(e) => setFormData({...formData, bathroomType: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="SEPARATE">Separate</option>
                  <option value="COMMON">Common</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Location Link</label>
                <input
                  type="url"
                  value={formData.locationLink}
                  onChange={(e) => setFormData({...formData, locationLink: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://maps.google.com/..."
                />
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">Room Features</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.breakfastIncluded}
                    onChange={(e) => setFormData({...formData, breakfastIncluded: e.target.checked})}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm">Breakfast Included</span>
                </label>

                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.parkingAvailable}
                    onChange={(e) => setFormData({...formData, parkingAvailable: e.target.checked})}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm">Parking Available</span>
                </label>

                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.childrenAllowed}
                    onChange={(e) => setFormData({...formData, childrenAllowed: e.target.checked})}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm">Children Allowed</span>
                </label>

                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.petAllowed}
                    onChange={(e) => setFormData({...formData, petAllowed: e.target.checked})}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm">Pets Allowed</span>
                </label>
              </div>
            </div>
          </div>

          {/* Room Images */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Room Images (Max 5)</h2>
            
            <div className="space-y-4">
              <div>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {selectedImages.length > 0 && (
                  <p className="text-sm text-gray-600 mt-2">{selectedImages.length} image(s) selected</p>
                )}
              </div>

              {selectedImages.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {selectedImages.map((image, index) => (
                    <div key={index} className="relative">
                      <img
                        src={URL.createObjectURL(image)}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg border"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Amenities */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Amenities</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">General Amenities</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {generalAmenities.map(amenity => (
                    <label key={amenity} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.generalAmenities.includes(amenity)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({...formData, generalAmenities: [...formData.generalAmenities, amenity]});
                          } else {
                            setFormData({...formData, generalAmenities: formData.generalAmenities.filter(a => a !== amenity)});
                          }
                        }}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm">{amenity.replace('_', ' ')}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Outdoor Views</label>
                <div className="grid grid-cols-3 gap-3">
                  {outdoorViews.map(view => (
                    <label key={view} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.outdoorViews.includes(view)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({...formData, outdoorViews: [...formData.outdoorViews, view]});
                          } else {
                            setFormData({...formData, outdoorViews: formData.outdoorViews.filter(v => v !== view)});
                          }
                        }}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm">{view}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Bathroom Items</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {bathroomItems.map(item => (
                    <label key={item} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.bathroomItems.includes(item)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({...formData, bathroomItems: [...formData.bathroomItems, item]});
                          } else {
                            setFormData({...formData, bathroomItems: formData.bathroomItems.filter(i => i !== item)});
                          }
                        }}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm">{item.replace('_', ' ')}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Food & Drink Items</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {foodDrinkItems.map(item => (
                    <label key={item} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.foodDrinkItems.includes(item)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({...formData, foodDrinkItems: [...formData.foodDrinkItems, item]});
                          } else {
                            setFormData({...formData, foodDrinkItems: formData.foodDrinkItems.filter(i => i !== item)});
                          }
                        }}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm">{item.replace('_', ' ')}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Languages */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Languages</h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Languages Spoken (comma separated)</label>
              <input
                type="text"
                value={formData.languages.join(', ')}
                onChange={(e) => setFormData({...formData, languages: e.target.value.split(',').map(lang => lang.trim()).filter(lang => lang)})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="English, Hindi, Spanish"
              />
            </div>
          </div>

          {/* Invoice Details */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Invoice Details</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Invoice Name *</label>
                <input
                  type="text"
                  value={formData.invoiceDetails.invoiceName}
                  onChange={(e) => setFormData({
                    ...formData, 
                    invoiceDetails: {...formData.invoiceDetails, invoiceName: e.target.value}
                  })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Property Name *</label>
                <input
                  type="text"
                  value={formData.invoiceDetails.propertyName}
                  onChange={(e) => setFormData({
                    ...formData, 
                    invoiceDetails: {...formData.invoiceDetails, propertyName: e.target.value}
                  })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Property Address *</label>
                <textarea
                  value={formData.invoiceDetails.propertyAddress}
                  onChange={(e) => setFormData({
                    ...formData, 
                    invoiceDetails: {...formData.invoiceDetails, propertyAddress: e.target.value}
                  })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows="2"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">License Number *</label>
                <input
                  type="text"
                  value={formData.invoiceDetails.licenseNumber}
                  onChange={(e) => setFormData({
                    ...formData, 
                    invoiceDetails: {...formData.invoiceDetails, licenseNumber: e.target.value}
                  })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">State *</label>
                <input
                  type="text"
                  value={formData.invoiceDetails.state}
                  onChange={(e) => setFormData({
                    ...formData, 
                    invoiceDetails: {...formData.invoiceDetails, state: e.target.value}
                  })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Issuing Date *</label>
                <input
                  type="date"
                  value={formData.invoiceDetails.issuingDate}
                  onChange={(e) => setFormData({
                    ...formData, 
                    invoiceDetails: {...formData.invoiceDetails, issuingDate: e.target.value}
                  })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Expiry Date *</label>
                <input
                  type="date"
                  value={formData.invoiceDetails.expiryDate}
                  onChange={(e) => setFormData({
                    ...formData, 
                    invoiceDetails: {...formData.invoiceDetails, expiryDate: e.target.value}
                  })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.invoiceDetails.gstRegistered}
                    onChange={(e) => setFormData({
                      ...formData, 
                      invoiceDetails: {...formData.invoiceDetails, gstRegistered: e.target.checked}
                    })}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">GST Registered</span>
                </label>
              </div>

              {formData.invoiceDetails.gstRegistered && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Trade Name</label>
                    <input
                      type="text"
                      value={formData.invoiceDetails.tradeName}
                      onChange={(e) => setFormData({
                        ...formData, 
                        invoiceDetails: {...formData.invoiceDetails, tradeName: e.target.value}
                      })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">GST Number</label>
                    <input
                      type="text"
                      value={formData.invoiceDetails.gstNumber}
                      onChange={(e) => setFormData({
                        ...formData, 
                        invoiceDetails: {...formData.invoiceDetails, gstNumber: e.target.value}
                      })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">PAN Number</label>
                <input
                  type="text"
                  value={formData.invoiceDetails.panNumber}
                  onChange={(e) => setFormData({
                    ...formData, 
                    invoiceDetails: {...formData.invoiceDetails, panNumber: e.target.value}
                  })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Aadhar Number</label>
                <input
                  type="text"
                  value={formData.invoiceDetails.aadharNumber}
                  onChange={(e) => setFormData({
                    ...formData, 
                    invoiceDetails: {...formData.invoiceDetails, aadharNumber: e.target.value}
                  })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={onBack}
              className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Creating Room...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Create Room
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateRoom;