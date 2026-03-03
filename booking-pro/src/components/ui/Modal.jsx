import { X } from 'lucide-react';
import { Overlay } from './index';

// ─────────────────────────────────────────────────────────────
//  MODAL
// ─────────────────────────────────────────────────────────────
const Modal = ({ open, onClose, title, subtitle, children, w = 'max-w-2xl' }) => {
  if (!open) return null;

  return (
    <>
      <Overlay onClose={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className={`relative bg-white rounded-2xl shadow-2xl w-full ${w} max-h-[92vh] flex flex-col`}>
          {/* Header */}
          <div className="flex items-start justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
            <div>
              <h2 className="text-base font-bold text-gray-900">{title}</h2>
              {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
            </div>
            <button onClick={onClose}
              className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors ml-4 flex-shrink-0">
              <X className="w-4 h-4 text-gray-600" />
            </button>
          </div>
          {/* Body */}
          <div className="overflow-y-auto flex-1 px-6 py-5">{children}</div>
        </div>
      </div>
    </>
  );
};

export default Modal;
