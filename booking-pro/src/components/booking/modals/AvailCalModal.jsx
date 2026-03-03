import React, { useState } from 'react';
import Modal from '../../ui/Modal';

const AvailCalModal = ({ open, onClose }) => {
  const [month, setMonth] = useState(new Date());
  const y = month.getFullYear(), m = month.getMonth(), days = new Date(y, m + 1, 0).getDate(), first = new Date(y, m, 1).getDay();
  const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  return (
    <Modal open={open} onClose={onClose} title="Room Availability Calendar" w="max-w-2xl">
      <div className="space-y-4">
        <div className="flex gap-3 items-end">
          <div className="flex gap-2 items-center">
            <button onClick={() => setMonth(new Date(y, m - 1, 1))} className="px-3 py-2 border border-gray-200 rounded-xl text-sm hover:bg-gray-50">‹</button>
            <span className="px-4 py-2 bg-gray-50 rounded-xl text-sm font-bold text-gray-700 whitespace-nowrap">{MONTHS[m]} {y}</span>
            <button onClick={() => setMonth(new Date(y, m + 1, 1))} className="px-3 py-2 border border-gray-200 rounded-xl text-sm hover:bg-gray-50">›</button>
          </div>
        </div>
        <div>
          <div className="grid grid-cols-7 mb-2">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => (
              <div key={d} className="text-center text-[10px] font-black uppercase tracking-wide text-gray-400 py-2">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {Array(first).fill(null).map((_, i) => <div key={`e${i}`} />)}
            {Array(days).fill(null).map((_, i) => {
              const day = i + 1;
              return (
                <div key={day} className="rounded-lg p-1.5 text-center hover:scale-105 transition-transform cursor-default bg-emerald-100 text-emerald-700">
                  <p className="text-xs font-bold">{day}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default AvailCalModal;