import { useState, useEffect, useCallback } from 'react';
import { Bed, ArrowLeft } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { callApi } from '../api/client';
import { ROOM_API, BOOKING_API } from '../api/config'; 
import { fmt } from '../utils/fmt';
import { Spin, ErrBox, Empty, SectionHead, DD, Chip } from '../components/ui/index';
import Modal from '../components/ui/Modal';
import RoomCard from '../components/room/RoomCard';
import PaymentModal from '../components/payment/PaymentModal';

// ─────────────────────────────────────────────────────────────
//  ROOMS PAGE
// ─────────────────────────────────────────────────────────────
const RoomsPage = ({ hotelId, setView }) => {
  const { token } = useAuth();
  const [rooms,   setRooms]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [err,     setErr]     = useState('');
  const [tab,     setTab]     = useState('mine'); 
  const [selRoom, setSelRoom] = useState(null);
  
  // Booking Flow States
  const [preBookRoom, setPreBookRoom] = useState(null); 
  const [dates, setDates] = useState({ checkIn: '', checkOut: '' });
  const [bookingForPayment, setBookingForPayment] = useState(null); 
  const [creatingBooking, setCreatingBooking] = useState(false); // Added loading state

  const load = useCallback(async () => {
    setLoading(true); setErr('');
    try {
      let url = hotelId 
        ? `${ROOM_API}/hotel/${hotelId}` 
        : tab === 'mine' ? `${ROOM_API}/my-rooms` : `${ROOM_API}/public/all`;
      
      let opts = (hotelId || tab === 'mine') ? { headers: { Authorization: `Bearer ${token}` } } : {};

      const d = await callApi(url, opts);
      setRooms(d.data || []);
    } catch (e) { setErr(e.message); }
    finally { setLoading(false); }
  }, [tab, token, hotelId]);

  useEffect(() => { load(); }, [load]);

  const deleteRoom = async (id) => {
    if (!confirm('Delete this room?')) return;
    try {
      await callApi(`${ROOM_API}/delete/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      load();
    } catch (e) { alert(e.message); }
  };

  // ── Initiate REAL Booking (Creates backend record, then opens payment) ──
  const confirmBookingAndPay = async () => {
    if (!dates.checkIn || !dates.checkOut) return alert("Please select dates");

    setCreatingBooking(true);
    try {
      // 1. Create the actual booking payload
      const bookingRequest = {
        hotelId: preBookRoom.hotelId,
        roomId: preBookRoom.roomId,
        checkInDate: dates.checkIn,
        checkOutDate: dates.checkOut,
        numberOfRooms: 1,
        numberOfAdults: 1,
        // Add default generic guest details just in case your backend validation requires them
        firstName: "Guest",
        lastName: "User",
        email: "guest@example.com",
        phoneNumber: "9999999999"
      };
      
      // 2. Call your Booking Service API
      const response = await callApi(`${BOOKING_API}/create`, {
        method: 'POST',
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json' // <-- CRITICAL: Tells backend this is JSON
        },
        body: JSON.stringify(bookingRequest)
      });
      
      // 3. Open payment modal with the real booking ID returned from the database
      if (response && response.data) {
        setPreBookRoom(null); // Close date modal
        setBookingForPayment(response.data); // Open payment modal
      }

    } catch (error) {
      alert("Failed to create booking: " + error.message);
    } finally {
      setCreatingBooking(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-5 flex items-center justify-between">
          <div>
            {hotelId ? (
              <div className="flex items-center gap-3">
                <button onClick={() => setView('hotels')} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                  <ArrowLeft className="w-5 h-5 text-gray-600" />
                </button>
                <h1 className="text-2xl font-black text-gray-900">Hotel Rooms</h1>
              </div>
            ) : (
              <>
                <h1 className="text-2xl font-black text-gray-900">Rooms</h1>
                <div className="flex gap-1 mt-3">
                  {[{ id: 'mine', l: 'My Rooms' }, { id: 'all', l: 'All Rooms' }].map(t => (
                    <button key={t.id} onClick={() => setTab(t.id)}
                      className={`px-4 py-1.5 rounded-full text-xs font-bold transition-colors ${
                        tab === t.id ? 'bg-[#003580] text-white' : 'text-gray-500 hover:bg-gray-100'
                      }`}>{t.l}</button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {loading && <div className="flex justify-center py-20"><Spin cls="w-8 h-8 text-[#003580]" /></div>}
        {err     && <ErrBox msg={err} onRetry={load} />}
        {!loading && !err && rooms.length === 0 && (
          <Empty icon={Bed} title="No rooms found"
            desc={hotelId ? 'This property does not have any rooms listed yet.' : tab === 'mine' ? 'Add rooms to your properties to start accepting guests' : 'No rooms available'} />
        )}
        {!loading && !err && rooms.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {rooms.map(room => (
              <RoomCard 
                key={room.roomId} room={room} showActions={tab === 'mine' || !!hotelId}
                onDelete={() => deleteRoom(room.roomId)}
                onView={() => setSelRoom(room)} 
                onBook={() => setPreBookRoom(room)} 
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Pre-Booking Date Selection Modal ── */}
      <Modal open={!!preBookRoom} onClose={() => setPreBookRoom(null)} title="Select Dates" subtitle={preBookRoom?.roomName} w="max-w-sm">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">Check-in Date</label>
            <input type="date" value={dates.checkIn} onChange={e => setDates({...dates, checkIn: e.target.value})}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-[#003580]" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">Check-out Date</label>
            <input type="date" value={dates.checkOut} onChange={e => setDates({...dates, checkOut: e.target.value})}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-[#003580]" />
          </div>
          <button 
            onClick={confirmBookingAndPay} 
            disabled={creatingBooking}
            className="w-full py-3 bg-[#003580] text-white font-bold rounded-xl text-sm hover:bg-[#00266a] disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {creatingBooking ? <Spin cls="w-4 h-4 text-white" /> : 'Confirm & Continue to Payment'}
          </button>
        </div>
      </Modal>

      {/* ── Room Details Modal ── */}
      <Modal open={!!selRoom} onClose={() => setSelRoom(null)} title={selRoom?.roomName} subtitle={`${selRoom?.roomType} · ${selRoom?.propertyType}`} w="max-w-2xl">
        {selRoom && (
          <div className="space-y-4">
            {selRoom.roomImages?.[0] && (
              <div className="h-48 rounded-xl overflow-hidden">
                <img src={selRoom.roomImages[0]} alt={selRoom.roomName} className="w-full h-full object-cover" />
              </div>
            )}
            <div className="grid grid-cols-2 gap-5">
              <section>
                <SectionHead>Room Details</SectionHead>
                <dl className="space-y-2">
                  <DD k="Bed"       v={selRoom.bedAvailable} />
                  <DD k="Bathroom"  v={selRoom.bathroomType} />
                  <DD k="Available" v={`${selRoom.numberOfRooms} rooms`} />
                  <DD k="Check-in"  v={selRoom.checkinTime} />
                  <DD k="Check-out" v={selRoom.checkoutTime} />
                </dl>
              </section>
              <section>
                <SectionHead>Pricing</SectionHead>
                <dl className="space-y-2">
                  <DD k="Base"     v={fmt.inr(selRoom.basePrice)} />
                  <DD k="1 Guest"  v={fmt.inr(selRoom.priceForOneGuest)} />
                  <DD k="2 Guests" v={fmt.inr(selRoom.priceForTwoGuest)} />
                </dl>
              </section>
            </div>
            <section>
              <SectionHead>Amenities</SectionHead>
              <div className="flex flex-wrap gap-2">
                {selRoom.breakfastIncluded && <Chip>🍳 Breakfast</Chip>}
                {selRoom.parkingAvailable  && <Chip>🚗 Parking</Chip>}
                {selRoom.childrenAllowed   && <Chip>👨‍👩‍👧 Children OK</Chip>}
                {selRoom.petAllowed        && <Chip>🐾 Pets OK</Chip>}
                {(selRoom.generalAmenities || []).map(a => <Chip key={a}>{a}</Chip>)}
              </div>
            </section>
          </div>
        )}
      </Modal>

      {/* ── Payment Modal ── */}
      <PaymentModal 
        booking={bookingForPayment} 
        open={!!bookingForPayment} 
        onClose={() => setBookingForPayment(null)} 
        onPaid={() => {
          alert("Payment Successful!");
          setBookingForPayment(null);
          setView('bookings'); // Redirect to bookings page on success
        }} 
      />
    </div>
  );
};

export default RoomsPage;