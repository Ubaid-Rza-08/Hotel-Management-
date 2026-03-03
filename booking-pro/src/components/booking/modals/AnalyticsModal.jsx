import React from 'react';
import Modal from '../../ui/Modal';
import { SH } from '../BookingUI';
import { fmt } from '../../../utils/fmt';

const AnalyticsModal = ({ open, onClose, bookings, pmStatus }) => {
  const confirmed = bookings.filter(b => b.bookingStatus === "CONFIRMED");
  const completed = bookings.filter(b => b.bookingStatus === "COMPLETED");
  const cancelled = bookings.filter(b => b.bookingStatus === "CANCELLED");
  const paid = bookings.filter(b => pmStatus[b.bookingId] === "SUCCESS");
  const totalRevenue = paid.reduce((s, b) => s + (b.totalAmount || 0), 0);
  const avgNights = bookings.length > 0 ? (bookings.reduce((s, b) => s + (b.totalNights || 1), 0) / bookings.length).toFixed(1) : 0;
  const BAR_MAX = Math.max(confirmed.length, completed.length, cancelled.length) || 1;

  return (
    <Modal open={open} onClose={onClose} title="Booking Analytics" w="max-w-2xl">
      <div className="space-y-5">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { l: "Total Bookings", v: bookings.length, c: "text-gray-800" },
            { l: "Paid Revenue", v: fmt.inr(totalRevenue), c: "text-[#003580]" },
            { l: "Avg Stay", v: `${avgNights} nights`, c: "text-violet-700" },
            { l: "Total Nights", v: bookings.reduce((s, b) => s + (b.totalNights || 1), 0), c: "text-emerald-700" },
          ].map(s => (
            <div key={s.l} className="p-4 bg-gray-50 rounded-xl">
              <p className="text-[10px] text-gray-400 uppercase tracking-wide font-bold mb-1">{s.l}</p>
              <p className={`text-xl font-black ${s.c}`}>{s.v}</p>
            </div>
          ))}
        </div>
        <div className="bg-gray-50 rounded-xl p-4">
          <SH>Status Breakdown</SH>
          <div className="space-y-3">
            {[
              { l: "Confirmed", count: confirmed.length, c: "bg-emerald-500" },
              { l: "Completed", count: completed.length, c: "bg-sky-500" },
              { l: "Cancelled", count: cancelled.length, c: "bg-red-500" },
            ].map(s => (
              <div key={s.l}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-semibold text-gray-700">{s.l}</span>
                  <span className="font-bold text-gray-800">{s.count}</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className={`h-full ${s.c} rounded-full`} style={{ width: `${(s.count / BAR_MAX) * 100}%`, transition: "width 0.7s ease" }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default AnalyticsModal;