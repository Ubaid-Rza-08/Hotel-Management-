import React, { useState } from 'react';
import Modal from '../../ui/Modal';
import { Spin } from '../../ui/index';
import { useAuth } from '../../../hooks/useAuth';
import { callApi } from '../../../api/client';
import { BOOKING_API } from '../../../api/config';

const CreateModal = ({ open, onClose, onCreated }) => {
  const { token } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  // Maps strictly to BookingRequestDTO.java
  const [form, setForm] = useState({
    hotelId: "", roomId: "", firstName: "", lastName: "", email: "", phoneNumber: "", country: "India", location: "Online",
    numberOfRooms: 1, numberOfAdults: 1, numberOfChildren: 0, selectedBedType: "KING",
    checkInDate: "", checkOutDate: "", numberOfExtraBeds: 0, specialRequests: ""
  });

  const u = (k, v) => setForm(f => ({ ...f, [k]: v }));
  
  const create = async () => {
    setLoading(true);
    try {
      const payload = {
        ...form,
        checkInTime: "14:00:00", 
        checkOutTime: "12:00:00", 
      };

      await callApi(`${BOOKING_API}/create`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      onCreated(); 
      setStep(1); 
      onClose();
    } catch (e) {
      alert("Failed to create booking: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  const Field = ({ label, k, type = "text", ...r }) => (
    <div>
      <label className="text-xs font-bold text-gray-600 block mb-1">{label}</label>
      <input type={type} value={form[k]} onChange={e => u(k, type === "number" ? parseInt(e.target.value) || 0 : e.target.value)} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#003580]/20 focus:border-[#003580]" {...r} />
    </div>
  );

  const Sel = ({ label, k, opts }) => (
    <div>
      <label className="text-xs font-bold text-gray-600 block mb-1">{label}</label>
      <select value={form[k]} onChange={e => u(k, e.target.value)} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#003580]/20 bg-white">
        {opts.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
      </select>
    </div>
  );

  const STEPS = ["IDs", "Guest", "Stay"];
  return (
    <Modal open={open} onClose={() => { setStep(1); onClose(); }} title="Create Manual Booking" w="max-w-2xl">
      <div className="space-y-5">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-1.5 shrink-0">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${i + 1 === step ? "bg-[#003580] text-white" : i + 1 < step ? "bg-emerald-500 text-white" : "bg-gray-100 text-gray-400"}`}>{i + 1 < step ? "✓" : i + 1}</div>
              <span className={`text-xs font-semibold ${i + 1 === step ? "text-gray-800" : "text-gray-400"}`}>{s}</span>
              {i < STEPS.length - 1 && <div className="w-6 h-px bg-gray-200 mx-1" />}
            </div>
          ))}
        </div>
        
        {step === 1 && (
          <div className="grid grid-cols-2 gap-3">
            <Field label="Hotel ID *" k="hotelId" />
            <Field label="Room ID *" k="roomId" />
          </div>
        )}
        {step === 2 && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Field label="First Name *" k="firstName" />
              <Field label="Last Name *" k="lastName" />
            </div>
            <Field label="Email *" k="email" type="email" />
            <Field label="Phone *" k="phoneNumber" />
          </div>
        )}
        {step === 3 && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Check-in *" k="checkInDate" type="date" />
              <Field label="Check-out *" k="checkOutDate" type="date" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Rooms" k="numberOfRooms" type="number" min="1" />
              <Field label="Adults" k="numberOfAdults" type="number" min="1" />
            </div>
          </div>
        )}
        
        <div className="flex gap-3 pt-2 border-t border-gray-100">
          {step > 1 && <button onClick={() => setStep(s => s - 1)} className="flex-1 py-3 border-2 border-gray-200 text-gray-700 font-bold rounded-xl text-sm hover:bg-gray-50">Back</button>}
          {step < 3 && <button onClick={() => setStep(s => s + 1)} className="flex-1 py-3 bg-[#003580] text-white font-bold rounded-xl text-sm hover:bg-[#00266a]">Continue</button>}
          {step === 3 && <button onClick={create} disabled={loading} className="flex-1 py-3 bg-[#003580] text-white font-bold rounded-xl text-sm hover:bg-[#00266a] disabled:opacity-50 flex items-center justify-center gap-2">
            {loading && <Spin cls="w-4 h-4 text-white" />}{loading ? "Creating…" : "Confirm Booking"}
          </button>}
        </div>
      </div>
    </Modal>
  );
};

export default CreateModal;