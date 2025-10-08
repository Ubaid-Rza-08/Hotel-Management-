import React from 'react';
import { Star, MapPin, Clock, Edit2, Trash2, Eye, Hotel } from 'lucide-react';

const PropertyCard = ({ hotel, formatTime, onDelete }) => (
  <div className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow group">
    <div className="h-48 bg-gradient-to-br from-blue-100 to-indigo-100 relative">
      {hotel.hotelImages && hotel.hotelImages.length > 0 ? (
        <img
          src={hotel.hotelImages[0]}
          alt={hotel.hotelName}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.style.display = 'none';
            e.target.nextSibling.style.display = 'flex';
          }}
        />
      ) : null}
      <div className="w-full h-full flex items-center justify-center" style={{display: hotel.hotelImages && hotel.hotelImages.length > 0 ? 'none' : 'flex'}}>
        <Hotel className="w-16 h-16 text-blue-500" />
      </div>
      
      <div className="absolute top-3 right-3 bg-white px-2 py-1 rounded text-xs font-medium">
        Active
      </div>
      
      {/* Action Buttons */}
      <div className="absolute top-3 left-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button className="w-8 h-8 bg-white/90 backdrop-blur-sm rounded-lg flex items-center justify-center hover:bg-white transition-colors">
          <Eye className="w-4 h-4 text-gray-600" />
        </button>
        <button className="w-8 h-8 bg-white/90 backdrop-blur-sm rounded-lg flex items-center justify-center hover:bg-white transition-colors">
          <Edit2 className="w-4 h-4 text-gray-600" />
        </button>
        <button 
          onClick={onDelete}
          className="w-8 h-8 bg-white/90 backdrop-blur-sm rounded-lg flex items-center justify-center hover:bg-red-50 transition-colors"
        >
          <Trash2 className="w-4 h-4 text-red-600" />
        </button>
      </div>
    </div>
    
    <div className="p-4">
      <h4 className="font-semibold text-gray-900 mb-1">{hotel.hotelName}</h4>
      <p className="text-sm text-gray-600 flex items-center mb-2">
        <MapPin className="w-4 h-4 mr-1" />
        {hotel.hotelLocation}
      </p>
      
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center">
          {hotel.rating ? (
            <>
              <Star className="w-4 h-4 text-yellow-400 fill-current" />
              <span className="text-sm font-medium ml-1">{hotel.rating}</span>
            </>
          ) : (
            <span className="text-sm text-gray-500">No rating</span>
          )}
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500">Check-in: {formatTime(hotel.checkinTime)}</p>
          <p className="text-xs text-gray-500">Check-out: {formatTime(hotel.checkoutTime)}</p>
        </div>
      </div>
      
      {hotel.extraBeds > 0 && (
        <div className="text-sm text-gray-600 mb-3">
          <span>{hotel.extraBeds} extra beds available</span>
          {hotel.perExtraBedPrice && (
            <span className="text-blue-600 font-medium ml-2">
              ₹{hotel.perExtraBedPrice}/bed
            </span>
          )}
        </div>
      )}
      
      <div className="flex gap-2">
        <button className="flex-1 bg-blue-50 text-blue-600 py-2 px-3 rounded text-sm font-medium hover:bg-blue-100 transition-colors">
          Manage
        </button>
        <button className="flex-1 bg-gray-50 text-gray-600 py-2 px-3 rounded text-sm font-medium hover:bg-gray-100 transition-colors">
          View
        </button>
      </div>
    </div>
  </div>
);
export default PropertyCard;