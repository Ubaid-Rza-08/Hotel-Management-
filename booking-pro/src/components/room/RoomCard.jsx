import { Bed, Trash2, Eye, CreditCard } from 'lucide-react';
import { Chip } from '../ui/index';
import { fmt } from '../../utils/fmt';

// ─────────────────────────────────────────────────────────────
//  ROOM CARD
// ─────────────────────────────────────────────────────────────
const RoomCard = ({ room, showActions, onDelete, onView, onBook }) => (
  <div className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden group flex flex-col">

    {/* Image */}
    <div className="h-40 relative bg-gradient-to-br from-blue-50 to-indigo-50 overflow-hidden shrink-0">
      {room.roomImages?.[0]
        ? <img src={room.roomImages[0]} alt={room.roomName}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        : <div className="w-full h-full flex items-center justify-center">
            <Bed className="w-12 h-12 text-blue-200" />
          </div>}

      <div className="absolute top-3 left-3 bg-white/95 rounded-full px-2.5 py-1">
        <span className="text-xs font-bold text-gray-700">{room.propertyType}</span>
      </div>

      {showActions && (
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
      <h3 className="font-bold text-gray-900 truncate mb-0.5">{room.roomName}</h3>
      <p className="text-xs text-gray-500 mb-3">{room.roomType} · {room.bedAvailable}</p>

      {/* Pricing */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="text-center py-2 bg-gray-50 rounded-lg">
          <p className="text-[10px] text-gray-400">1 Guest</p>
          <p className="text-sm font-bold text-[#003580]">{fmt.inr(room.priceForOneGuest)}</p>
        </div>
        <div className="text-center py-2 bg-gray-50 rounded-lg">
          <p className="text-[10px] text-gray-400">2 Guests</p>
          <p className="text-sm font-bold text-[#003580]">{fmt.inr(room.priceForTwoGuest)}</p>
        </div>
      </div>

      {/* Amenity chips */}
      <div className="flex flex-wrap gap-1 mb-4">
        {room.breakfastIncluded && <Chip>🍳 Breakfast</Chip>}
        {room.parkingAvailable  && <Chip>🚗 Parking</Chip>}
        {room.childrenAllowed   && <Chip>👨‍👩‍👧 Family</Chip>}
        <Chip>{room.numberOfRooms} available</Chip>
      </div>

      {/* Actions: Push to bottom using mt-auto */}
      <div className="flex gap-2 mt-auto">
        <button onClick={onView}
          className="flex-1 py-2 bg-gray-100 text-gray-700 text-xs font-bold rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-1.5">
          <Eye className="w-3.5 h-3.5" />Details
        </button>
        <button onClick={onBook}
          className="flex-1 py-2 bg-[#003580] text-white text-xs font-bold rounded-lg hover:bg-[#00266a] transition-colors flex items-center justify-center gap-1.5 shadow-sm">
          <CreditCard className="w-3.5 h-3.5" />Book
        </button>
      </div>
    </div>
  </div>
);

export default RoomCard;