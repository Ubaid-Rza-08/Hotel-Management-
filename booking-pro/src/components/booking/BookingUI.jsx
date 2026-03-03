import React from 'react';

export const SH = ({ children }) => (
  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">{children}</p>
);

export const DD = ({ k, v }) => (
  <div className="flex justify-between items-baseline gap-2 py-1.5 border-b border-gray-100 last:border-0">
    <dt className="text-xs text-gray-400 shrink-0">{k}</dt>
    <dd className="text-xs font-semibold text-gray-800 text-right truncate max-w-[200px]">{v ?? '—'}</dd>
  </div>
);

const BK_C = {
  CONFIRMED: { bg: "bg-emerald-100", text: "text-emerald-700", dot: "bg-emerald-500", b: "border-emerald-200" },
  COMPLETED: { bg: "bg-sky-100", text: "text-sky-700", dot: "bg-sky-500", b: "border-sky-200" },
  CANCELLED: { bg: "bg-red-100", text: "text-red-600", dot: "bg-red-500", b: "border-red-200" },
  PENDING:   { bg: "bg-amber-100", text: "text-amber-700", dot: "bg-amber-500", b: "border-amber-200" },
};

const PM_C = {
  SUCCESS: { bg: "bg-emerald-100", text: "text-emerald-700", dot: "bg-emerald-500", label: "Paid" },
  PENDING: { bg: "bg-amber-100", text: "text-amber-700", dot: "bg-amber-500", label: "Unpaid" },
  FAILED:  { bg: "bg-red-100", text: "text-red-600", dot: "bg-red-500", label: "Failed" },
};

const Badge = ({ bg, text, dot, b, label }) => (
  <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${bg} ${text} ${b || "border-transparent"}`}>
    <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />{label}
  </span>
);

export const bkBadge = (s) => { 
  const c = BK_C[s] || BK_C.PENDING; 
  return <Badge {...c} label={s?.charAt(0) + s?.slice(1).toLowerCase()} />; 
};

export const pmBadge = (s) => { 
  if (!s) return null; 
  const c = PM_C[s] || PM_C.PENDING; 
  return <Badge {...c} />; 
};