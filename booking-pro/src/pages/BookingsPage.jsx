import { useState, useEffect, useCallback } from 'react';
import { Hotel, Search, RefreshCw, Grid, List, Filter, Plus, Calendar, BarChart2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { callApi } from '../api/client';
import { BOOKING_API, PAYMENT_API } from '../api/config';
import { fmt } from '../utils/fmt';
import { Spin, ErrBox, StatChip } from '../components/ui/index';
import BookingCard from '../components/booking/BookingCard';
import PaymentModal from '../components/payment/PaymentModal';

// Cleanly import all modals from the new index file
import { 
  BookingDetailsModal, 
  CancelModal, 
  AnalyticsModal, 
  CheckerModal, 
  AvailCalModal, 
  CreateModal 
} from '../components/booking/modals';

// ─────────────────────────────────────────────────────────────
//  BOOKINGS PAGE
// ─────────────────────────────────────────────────────────────
const BookingsPage = () => {
  const { token } = useAuth();
  
  // Core State
  const [bookings,    setBookings]    = useState([]);
  const [pmStatus,    setPmStatus]    = useState({});
  const [loading,     setLoading]     = useState(true);
  const [err,         setErr]         = useState('');
  
  // UI State
  const [search,      setSearch]      = useState('');
  const [filter,      setFilter]      = useState('ALL');
  const [view,        setView]        = useState('list');
  const [dateFrom,    setDateFrom]    = useState('');
  const [dateTo,      setDateTo]      = useState('');
  const [sel,         setSel]         = useState(null);
  
  // Modals Dictionary
  const [modals, setModals] = useState({ details: false, pay: false, cancel: false, cal: false, checker: false, analytics: false, create: false });
  const M = (k, v = true) => setModals(m => ({ ...m, [k]: v }));

  // ─── API Integrations ───
  const load = useCallback(async () => {
    setLoading(true); setErr('');
    try {
      const d = await callApi(`${BOOKING_API}/my-bookings`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const list = d.data || [];
      setBookings(list);
      // Fetch payment status for confirmed bookings
      list.filter(b => b.bookingStatus === 'CONFIRMED').forEach(b => fetchPmStatus(b.bookingId));
    } catch (e) { setErr(e.message); }
    finally { setLoading(false); }
  }, [token]);

  useEffect(() => { load(); }, [load]);

  const fetchPmStatus = async (id) => {
    try {
      const d = await callApi(`${PAYMENT_API}/booking/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPmStatus(p => ({ ...p, [id]: d.data?.status }));
    } catch {}
  };

  const cancelBooking = async (id, reason) => {
    await callApi(
      `${BOOKING_API}/cancel/${id}?cancellationReason=${encodeURIComponent(reason)}`,
      { method: 'PUT', headers: { Authorization: `Bearer ${token}` } }
    );
    load();
  };

  // ─── Handlers ───
  const openDetails = b => { setSel(b); M("details"); };
  const openPay     = b => { setSel(b); M("details", false); M("pay"); };
  const openCancel  = b => { setSel(b); M("details", false); M("cancel"); };

  // ─── Filters & Stats ───
  const filtered = bookings.filter(b => {
    if (filter !== "ALL" && b.bookingStatus !== filter) return false;
    if (dateFrom && b.checkInDate < dateFrom) return false;
    if (dateTo && b.checkOutDate > dateTo) return false;
    const s = search.toLowerCase();
    return !s || [b.hotelName, b.roomName, b.confirmationCode, b.location].some(v => v?.toLowerCase().includes(s));
  });

  const stats = {
    total: bookings.length,
    confirmed: bookings.filter(b => b.bookingStatus === "CONFIRMED").length,
    completed: bookings.filter(b => b.bookingStatus === "COMPLETED").length,
    cancelled: bookings.filter(b => b.bookingStatus === "CANCELLED").length,
    spent: bookings.filter(b => pmStatus[b.bookingId] === "SUCCESS").reduce((s, b) => s + (b.totalAmount || 0), 0),
  };

  return (
    <div className="min-h-screen bg-gray-50">
      
      {/* ── Header ── */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-start justify-between gap-4 mb-4 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-[#003580] rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
                <Hotel className="w-5 h-5 text-white"/>
              </div>
              <div>
                <h1 className="text-xl font-black text-gray-900 leading-none">My Bookings</h1>
                <p className="text-xs text-gray-400 mt-0.5">Manage reservations, payments &amp; availability</p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <button onClick={() => M("checker")} className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-50 transition-colors">
                <Search className="w-3.5 h-3.5"/>Check Availability
              </button>
              <button onClick={() => M("cal")} className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-50 transition-colors">
                <Calendar className="w-3.5 h-3.5"/>Calendar
              </button>
              <button onClick={() => M("analytics")} className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-50 transition-colors">
                <BarChart2 className="w-3.5 h-3.5"/>Analytics
              </button>
              <button onClick={() => M("create")} className="flex items-center gap-1.5 px-4 py-2 bg-[#003580] text-white rounded-xl text-xs font-bold hover:bg-[#00266a] shadow-lg shadow-blue-200 transition-all">
                <Plus className="w-3.5 h-3.5"/>New Booking
              </button>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <StatChip label="Total" value={stats.total} />
            <StatChip label="Confirmed" value={stats.confirmed} color="text-emerald-700" />
            <StatChip label="Completed" value={stats.completed} color="text-sky-700" />
            <StatChip label="Cancelled" value={stats.cancelled} color="text-red-600" />
            <StatChip label="Revenue" value={fmt.inr(stats.spent)} color="text-[#003580]" />
          </div>
        </div>
      </div>

      {/* ── Filters ── */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="bg-white border border-gray-200 rounded-2xl p-4 space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input placeholder="Search hotel, room, code, location…" value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#003580]/20 focus:border-[#003580]" />
            </div>
            <div className="flex gap-2">
              <button onClick={load} className="p-2.5 border border-gray-200 rounded-xl text-gray-500 hover:bg-gray-50 transition-colors" title="Refresh">
                <RefreshCw className="w-4 h-4"/>
              </button>
              <button onClick={() => setView(v => v === "list" ? "grid" : "list")} className="p-2.5 border border-gray-200 rounded-xl text-gray-500 hover:bg-gray-50 transition-colors" title="Toggle view">
                {view === "list" ? <Grid className="w-4 h-4"/> : <List className="w-4 h-4"/>}
              </button>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 items-center justify-between">
            <div className="flex gap-1.5 flex-wrap">
              {["ALL", "CONFIRMED", "COMPLETED", "CANCELLED"].map(s => (
                <button key={s} onClick={() => setFilter(s)} className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${filter === s ? "bg-[#003580] text-white shadow-sm" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                  {s === "ALL" ? "All" : s.charAt(0) + s.slice(1).toLowerCase()}
                  {s !== "ALL" && <span className={`ml-1.5 text-[10px] ${filter === s ? "opacity-70" : "text-gray-400"}`}>{s === "CONFIRMED" ? stats.confirmed : s === "COMPLETED" ? stats.completed : stats.cancelled}</span>}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Filter className="w-3.5 h-3.5 text-gray-400" />
              <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="px-2 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#003580]/20" title="From" />
              <span className="text-gray-400 text-xs">→</span>
              <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="px-2 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#003580]/20" title="To" />
              {(dateFrom || dateTo) && <button onClick={() => { setDateFrom(""); setDateTo(""); }} className="text-xs text-red-500 font-semibold hover:text-red-700">Clear</button>}
            </div>
          </div>
        </div>
      </div>

      {/* ── List/Grid ── */}
      <div className="max-w-7xl mx-auto px-4 pb-12">
        {loading && <div className="flex justify-center py-20"><Spin cls="w-8 h-8 text-[#003580]" /></div>}
        {err && <ErrBox msg={err} onRetry={load} />}
        
        {!loading && !err && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
              <Hotel className="w-8 h-8 text-gray-300" />
            </div>
            <p className="text-base font-bold text-gray-700 mb-1">No bookings found</p>
            <p className="text-sm text-gray-400">{search || filter !== "ALL" || dateFrom || dateTo ? "Try adjusting your filters" : "Your reservations will appear here"}</p>
          </div>
        )}
        
        {!loading && !err && filtered.length > 0 && (
          <>
            <p className="text-xs text-gray-400 mb-3">Showing {filtered.length} of {bookings.length} booking{bookings.length !== 1 ? "s" : ""}</p>
            <div className={view === "grid" ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" : "space-y-3"}>
              {filtered.map(b => (
                <BookingCard key={b.bookingId} booking={b} payStatus={pmStatus[b.bookingId]} view={view}
                  onDetails={() => openDetails(b)} onPay={() => openPay(b)} onCancel={() => openCancel(b)} />
              ))}
            </div>
          </>
        )}
      </div>

      {/* ── Modals ── */}
      <BookingDetailsModal booking={sel} payStatus={sel ? pmStatus[sel.bookingId] : null} open={modals.details} onClose={() => M("details", false)} onPayNow={() => openPay(sel)} onCancel={openCancel} />
      
      {/* Real Razorpay Payment Modal */}
      <PaymentModal booking={sel} open={modals.pay} onClose={() => { M("pay", false); load(); }} onPaid={() => setPmStatus(p => ({ ...p, [sel?.bookingId]: "SUCCESS" }))} />
      
      <CancelModal booking={sel} open={modals.cancel} onClose={() => M("cancel", false)} onConfirm={cancelBooking} />
      <AvailCalModal open={modals.cal} onClose={() => M("cal", false)} />
      <CheckerModal open={modals.checker} onClose={() => M("checker", false)} />
      <AnalyticsModal open={modals.analytics} onClose={() => M("analytics", false)} bookings={bookings} pmStatus={pmStatus} />
      <CreateModal open={modals.create} onClose={() => M("create", false)} onCreated={load} />
    </div>
  );
}

export default BookingsPage;