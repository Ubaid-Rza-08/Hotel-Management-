import { Calendar, Moon, Users, CreditCard, Eye, CheckCircle } from 'lucide-react';
import { bkBadge, pmBadge } from '../ui/index';
import { fmt } from '../../utils/fmt';

// ─────────────────────────────────────────────────────────────
//  BOOKING CARD
// ─────────────────────────────────────────────────────────────
const BookingCard = ({ booking, payStatus, onDetails, onPay, onCancel }) => {
  const isPaid      = payStatus === 'SUCCESS';
  const isConfirmed = booking.bookingStatus === 'CONFIRMED';

  const accentColor = {
    CONFIRMED: 'bg-green-500',
    CANCELLED: 'bg-red-500',
    COMPLETED: 'bg-blue-500',
    PENDING:   'bg-yellow-500',
  }[booking.bookingStatus] || 'bg-gray-400';

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all overflow-hidden flex">
      {/* Status accent bar */}
      <div className={`w-1.5 flex-shrink-0 ${accentColor}`} />

      <div className="flex-1 p-5">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">

          {/* ── Left: booking info ── */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h3 className="font-bold text-gray-900 truncate">{booking.hotelName || 'Hotel'}</h3>
              {bkBadge(booking.bookingStatus)}
              {pmBadge(payStatus)}
            </div>
            <p className="text-sm text-gray-500 mb-3">{booking.roomName} · {booking.location}</p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { I: Calendar, l: 'Check-in',  v: fmt.date(booking.checkInDate)  },
                { I: Calendar, l: 'Check-out', v: fmt.date(booking.checkOutDate) },
                { I: Moon,     l: 'Nights',    v: booking.totalNights            },
                { I: Users,    l: 'Rooms',     v: booking.numberOfRooms          },
              ].map(({ I, l, v }) => (
                <div key={l} className="flex items-center gap-1.5">
                  <I className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                  <div>
                    <p className="text-[10px] text-gray-400">{l}</p>
                    <p className="text-xs font-bold text-gray-700">{v}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-3 pt-3 border-t border-gray-100">
              <span className="text-[11px] text-gray-400">Ref: </span>
              <span className="text-[11px] font-mono font-semibold text-gray-600">{booking.confirmationCode}</span>
            </div>
          </div>

          {/* ── Right: amount + action buttons ── */}
          <div className="flex sm:flex-col items-center sm:items-end justify-between gap-3 flex-shrink-0">
            <div className="text-right">
              <p className="text-[11px] text-gray-400">Total</p>
              <p className="text-xl font-black text-[#003580]">{fmt.inr(booking.totalAmount)}</p>
              {isPaid && (
                <p className="text-[11px] text-green-600 font-bold flex items-center justify-end gap-1 mt-0.5">
                  <CheckCircle className="w-3 h-3" />Paid
                </p>
              )}
            </div>

            <div className="flex items-center gap-2 flex-wrap sm:justify-end">
              <button onClick={onDetails}
                className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
                <Eye className="w-3.5 h-3.5" />Details
              </button>
              {isConfirmed && !isPaid && (
                <button onClick={onPay}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-[#003580] text-white rounded-lg text-xs font-bold hover:bg-[#00266a] transition-colors animate-pulse">
                  <CreditCard className="w-3.5 h-3.5" />Pay Now
                </button>
              )}
              {isConfirmed && (
                <button onClick={onCancel}
                  className="px-3 py-1.5 border border-red-200 text-red-600 rounded-lg text-xs font-semibold hover:bg-red-50 transition-colors">
                  Cancel
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingCard;
