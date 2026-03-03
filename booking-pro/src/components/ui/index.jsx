import { AlertCircle, Loader } from 'lucide-react';

// ─────────────────────────────────────────────────────────────
//  SPIN
// ─────────────────────────────────────────────────────────────
export const Spin = ({ cls = '' }) => (
  <Loader className={`animate-spin ${cls || 'w-5 h-5 text-[#003580]'}`} />
);

// ─────────────────────────────────────────────────────────────
//  BADGE
// ─────────────────────────────────────────────────────────────
export const Badge = ({ children, variant = 'gray' }) => {
  const v = {
    green:  'bg-green-50  text-green-700  ring-green-200',
    red:    'bg-red-50    text-red-700    ring-red-200',
    yellow: 'bg-yellow-50 text-yellow-700 ring-yellow-200',
    blue:   'bg-blue-50   text-blue-700   ring-blue-200',
    gray:   'bg-gray-100  text-gray-600   ring-gray-200',
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ring-1 ring-inset ${v[variant]}`}>
      {children}
    </span>
  );
};

/** Booking status badge */
export const bkBadge = (s) => {
  const m = {
    CONFIRMED: { v: 'green',  l: 'Confirmed' },
    PENDING:   { v: 'yellow', l: 'Pending'   },
    CANCELLED: { v: 'red',    l: 'Cancelled' },
    COMPLETED: { v: 'blue',   l: 'Completed' },
  };
  const c = m[s] || { v: 'gray', l: s };
  return <Badge variant={c.v}>{c.l}</Badge>;
};

/** Payment status badge */
export const pmBadge = (s) => {
  const m = {
    SUCCESS:  { v: 'green',  l: 'Paid'     },
    PENDING:  { v: 'yellow', l: 'Pending'  },
    FAILED:   { v: 'red',    l: 'Failed'   },
    REFUNDED: { v: 'blue',   l: 'Refunded' },
  };
  const c = m[s] || { v: 'gray', l: s || 'Not Paid' };
  return <Badge variant={c.v}>{c.l}</Badge>;
};

// ─────────────────────────────────────────────────────────────
//  ERROR BOX
// ─────────────────────────────────────────────────────────────
export const ErrBox = ({ msg, onRetry }) => (
  <div className="flex flex-col items-center gap-3 py-14">
    <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center">
      <AlertCircle className="w-7 h-7 text-red-500" />
    </div>
    <p className="text-sm text-gray-500 text-center max-w-xs">{msg}</p>
    {onRetry && (
      <button onClick={onRetry}
        className="px-4 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-700">
        Retry
      </button>
    )}
  </div>
);

// ─────────────────────────────────────────────────────────────
//  EMPTY STATE
// ─────────────────────────────────────────────────────────────
export const Empty = ({ icon: Icon, title, desc, cta }) => (
  <div className="flex flex-col items-center gap-3 py-20">
    <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center">
      <Icon className="w-8 h-8 text-gray-300" />
    </div>
    <p className="font-bold text-gray-800">{title}</p>
    <p className="text-sm text-gray-400 text-center max-w-xs">{desc}</p>
    {cta}
  </div>
);

// ─────────────────────────────────────────────────────────────
//  OVERLAY (modal backdrop)
// ─────────────────────────────────────────────────────────────
export const Overlay = ({ onClose }) => (
  <div className="fixed inset-0 bg-black/60 backdrop-blur-[2px] z-40" onClick={onClose} />
);

// ─────────────────────────────────────────────────────────────
//  STAT CHIP  (used in page headers)
// ─────────────────────────────────────────────────────────────
export const StatChip = ({ label, value, color = 'text-gray-900' }) => (
  <div className="bg-gray-50 rounded-xl px-4 py-3 min-w-[100px]">
    <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide">{label}</p>
    <p className={`text-lg font-black mt-0.5 ${color}`}>{value}</p>
  </div>
);

// ─────────────────────────────────────────────────────────────
//  CHIP  (small tag / amenity pill)
// ─────────────────────────────────────────────────────────────
export const Chip = ({ children }) => (
  <span className="px-2.5 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-lg">{children}</span>
);

// ─────────────────────────────────────────────────────────────
//  KEY-VALUE ROW  (used inside modals)
// ─────────────────────────────────────────────────────────────
export const KV = ({ k, v }) => (
  <div className="flex justify-between text-sm">
    <span className="text-gray-500">{k}</span>
    <span className="font-semibold text-gray-800">{v}</span>
  </div>
);

// ─────────────────────────────────────────────────────────────
//  SECTION HEADING  (uppercase, inside modals)
// ─────────────────────────────────────────────────────────────
export const SectionHead = ({ children }) => (
  <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2.5">{children}</h4>
);

// ─────────────────────────────────────────────────────────────
//  DEFINITION ROW  (key → value with dt/dd)
// ─────────────────────────────────────────────────────────────
export const DD = ({ k, v }) => (
  <div className="flex justify-between gap-4 text-sm">
    <dt className="text-gray-400 flex-shrink-0">{k}</dt>
    <dd className="font-semibold text-gray-800 text-right">{v || '—'}</dd>
  </div>
);
