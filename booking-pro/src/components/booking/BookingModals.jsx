// import { useState } from 'react';
// import { CreditCard } from 'lucide-react';
// import Modal from '../ui/Modal';
// import { Spin, bkBadge, pmBadge, SectionHead, DD } from '../ui/index';
// import { fmt } from '../../utils/fmt';

// // ─────────────────────────────────────────────────────────────
// //  BOOKING DETAILS MODAL
// // ─────────────────────────────────────────────────────────────
// export const BookingDetailsModal = ({
//   booking, payStatus, open, onClose, onPayNow, onCancel,
// }) => (
//   <Modal open={open} onClose={onClose}
//     title="Booking Details"
//     subtitle={`Ref: ${booking?.confirmationCode}`}
//     w="max-w-3xl">
//     {booking && (
//       <div className="space-y-5">

//         {/* Status summary row */}
//         <div className="grid grid-cols-3 gap-3 p-4 bg-gray-50 rounded-xl">
//           <div>
//             <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wide mb-1">Booking Status</p>
//             {bkBadge(booking.bookingStatus)}
//           </div>
//           <div>
//             <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wide mb-1">Payment</p>
//             {pmBadge(payStatus)}
//           </div>
//           <div className="text-right">
//             <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wide mb-1">Total</p>
//             <p className="text-xl font-black text-[#003580]">{fmt.inr(booking.totalAmount)}</p>
//           </div>
//         </div>

//         {/* Details grid */}
//         <div className="grid md:grid-cols-2 gap-5">
//           <section>
//             <SectionHead>Property</SectionHead>
//             <dl className="space-y-2">
//               <DD k="Hotel"    v={booking.hotelName} />
//               <DD k="Room"     v={booking.roomName} />
//               <DD k="Location" v={booking.location} />
//               <DD k="Bed Type" v={booking.selectedBedType} />
//             </dl>
//           </section>
//           <section>
//             <SectionHead>Guest</SectionHead>
//             <dl className="space-y-2">
//               <DD k="Name"    v={`${booking.firstName} ${booking.lastName}`} />
//               <DD k="Email"   v={booking.email} />
//               <DD k="Phone"   v={booking.phoneNumber} />
//               <DD k="Country" v={booking.country} />
//             </dl>
//           </section>
//           <section>
//             <SectionHead>Stay</SectionHead>
//             <dl className="space-y-2">
//               <DD k="Check-in"  v={`${fmt.date(booking.checkInDate)} • ${booking.checkInTime}`} />
//               <DD k="Check-out" v={`${fmt.date(booking.checkOutDate)} • ${booking.checkOutTime}`} />
//               <DD k="Duration"  v={`${booking.totalNights} night(s)`} />
//               <DD k="Rooms"     v={booking.numberOfRooms} />
//               <DD k="Guests"    v={`${booking.numberOfAdults} adult(s), ${booking.numberOfChildren || 0} child(ren)`} />
//             </dl>
//           </section>
//           <section>
//             <SectionHead>Pricing</SectionHead>
//             <dl className="space-y-2">
//               <DD k="Room Rate"    v={`${fmt.inr(booking.selectedRoomPrice)}/night`} />
//               <DD k="Rooms × Nts" v={`${booking.numberOfRooms} × ${booking.totalNights}`} />
//               {(booking.numberOfExtraBeds || 0) > 0 && (
//                 <DD k="Extra Beds"
//                     v={`${booking.numberOfExtraBeds} × ${fmt.inr(booking.extraBedPrice)} = ${fmt.inr(booking.totalExtraBedCost)}`} />
//               )}
//             </dl>
//             <div className="flex justify-between pt-3 mt-3 border-t border-gray-100">
//               <span className="font-bold text-gray-900">Total</span>
//               <span className="font-black text-[#003580] text-lg">{fmt.inr(booking.totalAmount)}</span>
//             </div>
//           </section>
//         </div>

//         {booking.specialRequests && (
//           <section>
//             <SectionHead>Special Requests</SectionHead>
//             <p className="text-sm text-gray-700 bg-blue-50 rounded-xl px-4 py-3">{booking.specialRequests}</p>
//           </section>
//         )}

//         {/* Action buttons */}
//         {booking.bookingStatus === 'CONFIRMED' && (
//           <div className="flex flex-wrap gap-3 pt-3 border-t border-gray-100">
//             {payStatus !== 'SUCCESS' && (
//               <button onClick={onPayNow}
//                 className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-[#003580] text-white font-bold rounded-xl text-sm hover:bg-[#00266a] transition-colors">
//                 <CreditCard className="w-4 h-4" />Pay Now — {fmt.inr(booking.totalAmount)}
//               </button>
//             )}
//             <button onClick={() => onCancel(booking)}
//               className="px-6 py-3 border-2 border-red-200 text-red-600 font-semibold rounded-xl text-sm hover:bg-red-50 transition-colors">
//               Cancel Booking
//             </button>
//           </div>
//         )}
//       </div>
//     )}
//   </Modal>
// );

// // ─────────────────────────────────────────────────────────────
// //  CANCEL BOOKING MODAL
// // ─────────────────────────────────────────────────────────────
// export const CancelModal = ({ booking, open, onClose, onConfirm }) => {
//   const [reason,  setReason]  = useState('');
//   const [loading, setLoading] = useState(false);

//   const PRESETS = ['Change of plans', 'Found better option', 'Date changed', 'Emergency', 'Other'];

//   const go = async () => {
//     setLoading(true);
//     await onConfirm(booking.bookingId, reason);
//     setLoading(false); onClose();
//   };

//   return (
//     <Modal open={open} onClose={onClose} title="Cancel Booking" w="max-w-sm">
//       {booking && (
//         <div className="space-y-4">
//           <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
//             <p className="text-sm font-bold text-red-800 mb-1">⚠ This cannot be undone</p>
//             <p className="text-sm text-red-700">
//               Cancelling <strong>{booking.confirmationCode}</strong> at <strong>{booking.hotelName}</strong>
//             </p>
//           </div>
//           <div>
//             <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Reason</p>
//             <div className="flex flex-wrap gap-2 mb-3">
//               {PRESETS.map(p => (
//                 <button key={p} onClick={() => setReason(p)}
//                   className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
//                     reason === p
//                       ? 'bg-[#003580] text-white border-[#003580]'
//                       : 'border-gray-200 text-gray-600 hover:border-gray-300'
//                   }`}>{p}
//                 </button>
//               ))}
//             </div>
//             <textarea rows={3} value={reason} onChange={e => setReason(e.target.value)}
//               placeholder="Describe your reason…"
//               className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#003580]/20 focus:border-[#003580]" />
//           </div>
//           <div className="flex gap-3">
//             <button onClick={onClose}
//               className="flex-1 py-3 border-2 border-gray-200 text-gray-700 font-bold rounded-xl text-sm hover:bg-gray-50">
//               Keep
//             </button>
//             <button onClick={go} disabled={!reason || loading}
//               className="flex-1 py-3 bg-red-600 text-white font-bold rounded-xl text-sm hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2">
//               {loading && <Spin cls="w-4 h-4 text-white" />}
//               Cancel Booking
//             </button>
//           </div>
//         </div>
//       )}
//     </Modal>
//   );
// };
