import React, { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import Modal from '../../ui/Modal';
import { Spin } from '../../ui/index';

const CancelModal = ({ booking, open, onClose, onConfirm }) => {
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const PRESETS = ["Change of plans", "Found better option", "Date changed", "Emergency", "Other"];
  
  const go = async () => {
    setLoading(true);
    await onConfirm(booking.bookingId, reason);
    setLoading(false);
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="Cancel Booking" w="max-w-md">
      {booking && (
        <div className="space-y-4">
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-sm font-bold text-red-800 mb-1 flex items-center gap-2"><AlertTriangle className="w-4 h-4" />This cannot be undone</p>
            <p className="text-sm text-red-700">Cancelling <strong>{booking.confirmationCode}</strong> at <strong>{booking.hotelName}</strong></p>
          </div>
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Reason</p>
            <div className="flex flex-wrap gap-2 mb-3">
              {PRESETS.map(p => (
                <button key={p} onClick={() => setReason(p)} className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${reason === p ? "bg-[#003580] text-white border-[#003580]" : "border-gray-200 text-gray-600 hover:border-gray-300 bg-white"}`}>{p}</button>
              ))}
            </div>
            <textarea rows={3} value={reason} onChange={e => setReason(e.target.value)} placeholder="Describe your reason…" className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#003580]/20 focus:border-[#003580]" />
          </div>
          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 py-3 border-2 border-gray-200 text-gray-700 font-bold rounded-xl text-sm hover:bg-gray-50">Keep</button>
            <button onClick={go} disabled={!reason.trim() || loading} className="flex-1 py-3 bg-red-600 text-white font-bold rounded-xl text-sm hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2">
              {loading && <Spin cls="w-4 h-4 text-white" />}Cancel
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default CancelModal;