import React from 'react';
import { CreditCard, CheckCircle } from 'lucide-react';
import Modal from '../../ui/Modal';
import { SH, DD, bkBadge, pmBadge } from '../BookingUI';
import { fmt } from '../../../utils/fmt';

const fDate = (d) => d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—";

const BookingDetailsModal = ({ booking, payStatus, open, onClose, onPayNow, onCancel }) => (
  <Modal open={open} onClose={onClose} title="Booking Details" subtitle={`Ref: ${booking?.confirmationCode}`} w="max-w-3xl">
    {booking && (
      <div className="space-y-5">
        {/* Status Header */}
        <div className="grid grid-cols-3 gap-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
          <div>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wide mb-1.5">Status</p>
            {bkBadge(booking.bookingStatus)}
          </div>
          <div>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wide mb-1.5">Payment</p>
            {payStatus ? pmBadge(payStatus) : <span className="text-xs text-gray-400">N/A</span>}
          </div>
          <div className="text-right">
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wide mb-1">Total</p>
            <p className="text-xl font-black text-[#003580]">{fmt.inr(booking.totalAmount)}</p>
          </div>
        </div>

        {/* Data Grids */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-gray-50 rounded-xl p-4">
            <SH>Property</SH>
            <dl>
              <DD k="Hotel" v={booking.hotelName} />
              <DD k="Room" v={booking.roomName} />
              <DD k="Location" v={booking.location} />
            </dl>
          </div>
          <div className="bg-gray-50 rounded-xl p-4">
            <SH>Guest</SH>
            <dl>
              <DD k="Name" v={`${booking.firstName} ${booking.lastName}`} />
              <DD k="Email" v={booking.email} />
              <DD k="Phone" v={booking.phoneNumber} />
            </dl>
          </div>
          <div className="bg-gray-50 rounded-xl p-4">
            <SH>Stay</SH>
            <dl>
              <DD k="Check-in" v={`${fDate(booking.checkInDate)}`} />
              <DD k="Check-out" v={`${fDate(booking.checkOutDate)}`} />
              <DD k="Duration" v={`${booking.totalNights} night(s)`} />
              <DD k="Rooms" v={booking.numberOfRooms} />
            </dl>
          </div>
          <div className="bg-gray-50 rounded-xl p-4">
            <SH>Pricing</SH>
            <dl>
              <DD k="Rooms × Nights" v={`${booking.numberOfRooms} × ${booking.totalNights}`} />
              {(booking.numberOfExtraBeds || 0) > 0 && (
                <>
                  <DD k="Extra Beds" v={`${booking.numberOfExtraBeds} × ${fmt.inr(booking.extraBedPrice)}`} />
                  <DD k="Extra Bed Total" v={fmt.inr(booking.totalExtraBedCost)} />
                </>
              )}
            </dl>
            <div className="flex justify-between pt-2 mt-1 border-t border-gray-200">
              <span className="text-sm font-bold text-gray-900">Grand Total</span>
              <span className="text-base font-black text-[#003580]">{fmt.inr(booking.totalAmount)}</span>
            </div>
          </div>
        </div>
        
        {/* Actions */}
        {booking.bookingStatus === "CONFIRMED" && (
          <div className="flex flex-wrap gap-3 pt-3 border-t border-gray-100">
            {payStatus !== "SUCCESS" ? (
              <button onClick={onPayNow} className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-[#003580] text-white font-bold rounded-xl text-sm hover:bg-[#00266a] shadow-lg shadow-blue-200 transition-all">
                <CreditCard className="w-4 h-4"/>Pay Now — {fmt.inr(booking.totalAmount)}
              </button>
            ) : (
              <div className="flex items-center gap-2 px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-sm font-bold">
                <CheckCircle className="w-4 h-4"/>Payment Successful
              </div>
            )}
            <button onClick={() => onCancel(booking)} className="px-6 py-3 border-2 border-red-200 text-red-600 font-semibold rounded-xl text-sm hover:bg-red-50 transition-colors">
              Cancel Booking
            </button>
          </div>
        )}
      </div>
    )}
  </Modal>
);

export default BookingDetailsModal;