// ─────────────────────────────────────────────────────────────
//  FORMAT HELPERS
// ─────────────────────────────────────────────────────────────
export const fmt = {
  /** 02 Jan 2025 */
  date: s =>
    s ? new Date(s).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—',

  /** 02 Jan 2025, 10:30 AM */
  dt: s =>
    s ? new Date(s).toLocaleString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    }) : '—',

  /** ₹1,23,456 */
  inr: n => `₹${Number(n || 0).toLocaleString('en-IN')}`,

  /** 10:30 AM from "10:30:00" */
  time: t => t ? new Date(`2000-01-01T${t}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—',

  /** "JD" from "John Doe" */
  initials: s => s?.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase() || 'U',
};
