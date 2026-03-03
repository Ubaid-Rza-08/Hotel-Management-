import React, { useState } from 'react';
import { Search, CheckCircle, XCircle } from 'lucide-react';
import Modal from '../../ui/Modal';
import { Spin } from '../../ui/index';
import { callApi } from '../../../api/client';
import { BOOKING_API } from '../../../api/config'; 

const AVAIL_API = BOOKING_API.replace('/bookings', '/availability');

const CheckerModal = ({ open, onClose }) => {
  const [form, setForm] = useState({ roomId: "", checkIn: "", checkOut: "", numberOfRooms: 1 });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const check = async () => {
    if (!form.roomId || !form.checkIn || !form.checkOut) return;
    setLoading(true);
    try {
      const res = await callApi(`${AVAIL_API}/check/${form.roomId}?checkIn=${form.checkIn}&checkOut=${form.checkOut}&numberOfRooms=${form.numberOfRooms}`);
      const isAvail = res.data && res.data.available; 
      
      setResult({ available: isAvail, req: form.numberOfRooms });
    } catch (e) {
      setResult({ available: false });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Check Room Availability" w="max-w-md">
      <div className="space-y-4">
        <div className="space-y-3">
          <div>
            <label className="text-xs font-bold text-gray-600 block mb-1">Room ID</label>
            <input value={form.roomId} onChange={e => setForm({ ...form, roomId: e.target.value })} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#003580]/20" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-gray-600 block mb-1">Check-in</label>
              <input type="date" value={form.checkIn} onChange={e => setForm({ ...form, checkIn: e.target.value })} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#003580]/20" />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-600 block mb-1">Check-out</label>
              <input type="date" value={form.checkOut} onChange={e => setForm({ ...form, checkOut: e.target.value })} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#003580]/20" />
            </div>
          </div>
          <div>
            <label className="text-xs font-bold text-gray-600 block mb-1">Rooms Required</label>
            <input type="number" min="1" max="10" value={form.numberOfRooms} onChange={e => setForm({ ...form, numberOfRooms: parseInt(e.target.value) || 1 })} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#003580]/20" />
          </div>
        </div>
        <button onClick={check} disabled={loading || !form.roomId || !form.checkIn || !form.checkOut} className="w-full py-3 bg-[#003580] text-white font-bold rounded-xl text-sm hover:bg-[#00266a] disabled:opacity-50 flex items-center justify-center gap-2">
          {loading ? <Spin cls="w-4 h-4 text-white" /> : <Search className="w-4 h-4" />}
          {loading ? "Checking…" : "Check Availability"}
        </button>
        {result && (
          <div className={`p-4 rounded-xl border ${result.available ? "bg-emerald-50 border-emerald-200" : "bg-red-50 border-red-200"}`}>
            <p className={`font-bold text-sm flex items-center gap-2 mb-1 ${result.available ? "text-emerald-700" : "text-red-700"}`}>
              {result.available ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
              {result.available ? `${result.req} room(s) available!` : "Not available for these dates"}
            </p>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default CheckerModal;