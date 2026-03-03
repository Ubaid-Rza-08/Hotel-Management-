import { Hotel, MapPin, Star, Clock, Bed, Trash2, ChevronRight } from 'lucide-react';
import { fmt } from '../../utils/fmt';

// ─────────────────────────────────────────────────────────────
//  HOTEL CARD
// ─────────────────────────────────────────────────────────────
const HotelCard = ({ hotel, onDelete, onView }) => (
  <div className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden group flex flex-col">

    {/* Image */}
    <div className="h-44 relative overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-50 shrink-0">
      {hotel.hotelImages?.[0]
        ? <img src={hotel.hotelImages[0]} alt={hotel.hotelName}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        : <div className="w-full h-full flex items-center justify-center">
            <Hotel className="w-14 h-14 text-blue-200" />
          </div>
      }
      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />

      {hotel.rating && (
        <div className="absolute top-3 left-3 flex items-center gap-1 bg-white/95 rounded-full px-2.5 py-1">
          <Star className="w-3.5 h-3.5 text-[#FFD700] fill-[#FFD700]" />
          <span className="text-xs font-bold text-gray-800">{hotel.rating}</span>
        </div>
      )}

      {onDelete && (
        <div className="absolute top-3 right-3 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={onDelete}
            className="w-7 h-7 bg-white/90 rounded-lg flex items-center justify-center hover:bg-red-50">
            <Trash2 className="w-3.5 h-3.5 text-red-500" />
          </button>
        </div>
      )}
    </div>

    {/* Info */}
    <div className="p-4 flex flex-col flex-1">
      <h3 className="font-bold text-gray-900 truncate mb-0.5">{hotel.hotelName}</h3>
      <p className="text-sm text-gray-500 flex items-center gap-1 mb-3 truncate">
        <MapPin className="w-3.5 h-3.5 flex-shrink-0" />{hotel.hotelLocation}
      </p>
      <div className="flex justify-between text-xs text-gray-400 mb-4">
        <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />In: {fmt.time(hotel.checkinTime)}</span>
        <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />Out: {fmt.time(hotel.checkoutTime)}</span>
        {hotel.extraBeds > 0 && (
          <span className="flex items-center gap-1 text-[#003580]">
            <Bed className="w-3.5 h-3.5" />{hotel.extraBeds} extra
          </span>
        )}
      </div>

      {/* Action Button */}
      {onView && (
        <div className="mt-auto pt-4 border-t border-gray-100">
          <button onClick={onView}
            className="w-full py-2 bg-[#003580] text-white text-xs font-bold rounded-lg hover:bg-[#00266a] transition-colors flex items-center justify-center gap-1.5">
            View Rooms <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  </div>
);

export default HotelCard;