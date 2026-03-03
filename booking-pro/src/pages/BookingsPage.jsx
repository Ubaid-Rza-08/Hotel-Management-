import { useState, useEffect, useCallback } from 'react';
import { Calendar, Search } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { callApi } from '../api/client';
import { BOOKING_API, PAYMENT_API } from '../api/config';
import { fmt } from '../utils/fmt';
import { Spin, ErrBox, Empty, StatChip } from '../components/ui/index';
import BookingCard from '../components/booking/BookingCard';
import { BookingDetailsModal, CancelModal } from '../components/booking/BookingModals';
import PaymentModal from '../components/payment/PaymentModal';

// ─────────────────────────────────────────────────────────────
//  BOOKINGS PAGE
// ─────────────────────────────────────────────────────────────
const BookingsPage = () => {
  const { token } = useAuth();
  const [bookings,    setBookings]    = useState([]);
  const [pmStatus,    setPmStatus]    = useState({});
  const [loading,     setLoading]     = useState(true);
  const [err,         setErr]         = useState('');
  const [search,      setSearch]      = useState('');
  const [filter,      setFilter]      = useState('ALL');
  const [selBook,     setSelBook]     = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showPay,     setShowPay]     = useState(false);
  const [showCancel,  setShowCancel]  = useState(false);

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
      { method: 'PUT', headers: { Authorization: `Bearer ${token}` } },
    );
    load();
  };

  const openDetails = b => { setSelBook(b); setShowDetails(true); };
  const openPay     = b => { setSelBook(b); setShowDetails(false); setShowPay(true); };
  const openCancel  = b => { setSelBook(b); setShowDetails(false); setShowCancel(true); };

  const filtered = bookings.filter(b => {
    if (filter !== 'ALL' && b.bookingStatus !== filter) return false;
    const s = search.toLowerCase();
    return !s || [b.hotelName, b.roomName, b.confirmationCode, b.location]
      .some(v => v?.toLowerCase().includes(s));
  });

  const stats = {
    total:     bookings.length,
    confirmed: bookings.filter(b => b.bookingStatus === 'CONFIRMED').length,
    completed: bookings.filter(b => b.bookingStatus === 'COMPLETED').length,
    spent:     bookings
      .filter(b => pmStatus[b.bookingId] === 'SUCCESS')
      .reduce((s, b) => s + (b.totalAmount || 0), 0),
  };

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Page header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-2xl font-black text-gray-900">My Bookings</h1>
          <p className="text-gray-400 text-sm mt-0.5">Manage reservations and process payments</p>
          <div className="flex flex-wrap gap-3 mt-5">
            <StatChip label="Total"     value={stats.total}                            />
            <StatChip label="Confirmed" value={stats.confirmed} color="text-green-700" />
            <StatChip label="Completed" value={stats.completed} color="text-blue-700"  />
            <StatChip label="Spent"     value={fmt.inr(stats.spent)} color="text-[#003580]" />
          </div>
        </div>
      </div>

      {/* Filter row */}
      <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input placeholder="Search by hotel, room, code…" value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#003580]/20 focus:border-[#003580]" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {['ALL', 'CONFIRMED', 'COMPLETED', 'CANCELLED'].map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${
                filter === s
                  ? 'bg-[#003580] text-white'
                  : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'
              }`}>
              {s === 'ALL' ? 'All' : s.charAt(0) + s.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="max-w-7xl mx-auto px-4 pb-10 space-y-3">
        {loading && <div className="flex justify-center py-20"><Spin cls="w-8 h-8 text-[#003580]" /></div>}
        {err && <ErrBox msg={err} onRetry={load} />}
        {!loading && !err && filtered.length === 0 && (
          <Empty icon={Calendar} title="No bookings found"
            desc={search || filter !== 'ALL' ? 'Try adjusting your filters' : 'Your reservations will appear here'} />
        )}
        {!loading && !err && filtered.map(b => (
          <BookingCard key={b.bookingId} booking={b} payStatus={pmStatus[b.bookingId]}
            onDetails={() => openDetails(b)}
            onPay={()     => openPay(b)}
            onCancel={()  => openCancel(b)} />
        ))}
      </div>

      {/* Modals */}
      <BookingDetailsModal
        booking={selBook}
        payStatus={selBook ? pmStatus[selBook.bookingId] : null}
        open={showDetails}
        onClose={() => setShowDetails(false)}
        onPayNow={() => openPay(selBook)}
        onCancel={openCancel} />

      <PaymentModal
        booking={selBook}
        open={showPay}
        onClose={() => { setShowPay(false); load(); }}
        onPaid={() => setPmStatus(p => ({ ...p, [selBook.bookingId]: 'SUCCESS' }))} />

      <CancelModal
        booking={selBook}
        open={showCancel}
        onClose={() => setShowCancel(false)}
        onConfirm={cancelBooking} />
    </div>
  );
};

export default BookingsPage;
