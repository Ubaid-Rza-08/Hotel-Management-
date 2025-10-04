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
// Room Details Modal Component
const RoomDetailsModal = ({ room, onClose }) => {
  const getOutdoorViewDisplay = (view) => {
    const views = {
      'BALCONY': 'Balcony',
      'TERRACE': 'Terrace', 
      'VIEW': 'Scenic View'
    };
    return views[view] || view;
  };

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
              <p className="text-gray-600">{room.roomType} Room</p>
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
                  <p><span className="font-medium">Type:</span> {room.roomType}</p>
                  <p><span className="font-medium">Bed:</span> {room.bedAvailable}</p>
                  <p><span className="font-medium">Bathroom:</span> {room.bathroomType}</p>
                  <p><span className="font-medium">Available Rooms:</span> {room.numberOfRooms}</p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Pricing</h3>
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">Base Price:</span> ₹{room.basePrice}</p>
                  <p><span className="font-medium">1 Guest:</span> ₹{room.priceForOneGuest}</p>
                  <p><span className="font-medium">2 Guests:</span> ₹{room.priceForTwoGuest}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Timing</h3>
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">Check-in:</span> {room.checkinTime}</p>
                  <p><span className="font-medium">Check-out:</span> {room.checkoutTime}</p>
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
                </div>
              </div>
            </div>
          </div>

          {/* Amenities */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-3">Amenities & Features</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {room.breakfastIncluded && (
                <div className="flex items-center gap-2 text-sm">
                  <Coffee className="w-4 h-4 text-green-600" />
                  Breakfast Included
                </div>
              )}
              {room.parkingAvailable && (
                <div className="flex items-center gap-2 text-sm">
                  <Car className="w-4 h-4 text-blue-600" />
                  Parking Available
                </div>
              )}
              {room.generalAmenities?.map((amenity, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-gray-600" />
                  {amenity}
                </div>
              ))}
            </div>
          </div>

          {/* Views */}
          {room.outdoorViews && room.outdoorViews.length > 0 && (
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-3">Views</h3>
              <div className="flex flex-wrap gap-2">
                {room.outdoorViews.map((view, index) => (
                  <span key={index} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                    {getOutdoorViewDisplay(view)}
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

          {/* Invoice Details */}
          {invoiceDetails && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Property Information</h3>
              <div className="bg-gray-50 rounded-lg p-4 text-sm space-y-2">
                <p><span className="font-medium">Property:</span> {invoiceDetails.propertyName}</p>
                <p><span className="font-medium">Address:</span> {invoiceDetails.propertyAddress}</p>
                <p><span className="font-medium">State:</span> {invoiceDetails.state}</p>
                {invoiceDetails.gstRegistered && (
                  <p><span className="font-medium">GST Number:</span> {invoiceDetails.gstNumber}</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default RoomDetailsModal;